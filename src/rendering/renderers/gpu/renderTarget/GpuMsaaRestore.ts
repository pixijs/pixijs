/**
 * The attachment layout of a multisampled target, which a restore pipeline has to match. Built once per
 * target and rebuilt only if its depth/stencil format changes.
 * @category rendering
 * @ignore
 */
export interface GpuMsaaRestoreLayout
{
    colorFormats: GPUTextureFormat[];
    depthStencilFormat: GPUTextureFormat | undefined;
    /** cache key for the pipelines of this layout */
    key: string;
}

/**
 * Puts a resolved image back into a multisampled colour buffer.
 *
 * A transient MSAA colour buffer (every one on a tile-based GPU, and ones the user marks `transient`
 * elsewhere) is cleared on load and discarded on store, which skips writing the 4-sample buffer back to
 * memory. The resolved single-sample texture is still stored, so a pass that reopens the target (a filter
 * popping back, a mask adding stencil, `clear: false`) copies the resolved texture to a scratch texture and
 * draws it back in as the pass's first draw, instead of loading samples that were never written. On
 * tile-based GPUs this beats storing and loading the 4-sample buffer even when a target is reopened every
 * frame; on GPUs that keep MSAA in video memory it doesn't, which is why they store it by default.
 *
 * The draw is a full-screen `textureLoad` with no blending, so it is an exact per-pixel copy.
 * @category rendering
 * @ignore
 */
export class GpuMsaaRestore
{
    private readonly _device: GPUDevice;
    private readonly _layout: GPUBindGroupLayout;
    private readonly _pipelineLayout: GPUPipelineLayout;
    /** per layout key, one pipeline per colour attachment */
    private _pipelines: Record<string, GPURenderPipeline[]> = Object.create(null);
    private _modules: Record<number, GPUShaderModule> = Object.create(null);
    /** one scratch texture per format and attachment slot, grown to the largest target restored */
    private _scratch: Record<string, { texture: GPUTexture; bindGroup: GPUBindGroup }> = Object.create(null);
    /** replaced scratch textures, still read by commands recorded before the submit */
    private readonly _retired: GPUTexture[] = [];
    /** the bind group of each slot's latest copy */
    private readonly _copied: GPUBindGroup[] = [];

    constructor(device: GPUDevice)
    {
        this._device = device;
        this._layout = device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                texture: { sampleType: 'unfilterable-float' },
            }],
        });
        this._pipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [this._layout] });
    }

    /**
     * Whether a replaced scratch texture is still pending destruction, because commands recorded before the submit
     * read it.
     */
    public get hasRetired(): boolean
    {
        return this._retired.length > 0;
    }

    /** Destroys the replaced scratch textures, once the commands recorded while they were in use are submitted. */
    public destroyRetired(): void
    {
        for (const texture of this._retired)
        {
            texture.destroy();
        }

        this._retired.length = 0;
    }

    /**
     * Copies a resolved colour texture into its slot's scratch for {@link GpuMsaaRestore.draw}. Must be recorded
     * outside a render pass.
     * @param commandEncoder - the encoder to record the copy on
     * @param resolved - the resolved texture of the attachment being restored
     * @param slot - the attachment index, so attachments of the same format don't share scratch
     */
    public copy(commandEncoder: GPUCommandEncoder, resolved: GPUTexture, slot: number): void
    {
        const scratch = this._getScratch(resolved, slot);

        commandEncoder.copyTextureToTexture(
            { texture: resolved },
            { texture: scratch.texture },
            { width: resolved.width, height: resolved.height },
        );

        this._copied[slot] = scratch.bindGroup;
    }

    /**
     * Draws the latest copy of one colour attachment back in. Must be the first draw of the pass, before
     * any viewport or scissor is set.
     * @param pass - the pass that was just begun
     * @param layout - the pass's attachment layout
     * @param index - the colour attachment to restore, copied by {@link GpuMsaaRestore.copy}
     */
    public draw(pass: GPURenderPassEncoder, layout: GpuMsaaRestoreLayout, index: number): void
    {
        const pipelines = this._pipelines[layout.key] ??= [];

        pass.setPipeline(pipelines[index] ??= this._createPipeline(layout, index));
        pass.setBindGroup(0, this._copied[index]);
        pass.draw(3);
    }

    /** Destroys every scratch texture, replaced ones included, and drops the cached pipelines. */
    public destroy(): void
    {
        for (const key in this._scratch)
        {
            this._scratch[key].texture.destroy();
        }

        this.destroyRetired();

        this._scratch = Object.create(null);
        this._pipelines = Object.create(null);
        this._modules = Object.create(null);
    }

    private _getScratch(resolved: GPUTexture, slot: number)
    {
        const format = resolved.format;
        const key = `${format}:${slot}`;
        let scratch = this._scratch[key];

        if (!scratch || scratch.texture.width < resolved.width || scratch.texture.height < resolved.height)
        {
            const width = Math.max(resolved.width, scratch?.texture.width ?? 0);
            const height = Math.max(resolved.height, scratch?.texture.height ?? 0);

            if (scratch) this._retired.push(scratch.texture);

            const texture = this._device.createTexture({
                label: 'msaa-restore-scratch',
                size: { width, height },
                format,
                usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
            });

            scratch = this._scratch[key] = {
                texture,
                bindGroup: this._device.createBindGroup({
                    layout: this._layout,
                    entries: [{ binding: 0, resource: texture.createView() }],
                }),
            };
        }

        return scratch;
    }

    private _getModule(index: number): GPUShaderModule
    {
        this._modules[index] ??= this._device.createShaderModule({
            label: 'msaa-restore',
            code: /* wgsl */ `
                @group(0) @binding(0) var resolved: texture_2d<f32>;

                @vertex
                fn vertexMain(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {
                    let pos = array<vec2<f32>, 3>(vec2<f32>(-1.0, -1.0), vec2<f32>(3.0, -1.0), vec2<f32>(-1.0, 3.0));

                    return vec4<f32>(pos[i], 0.0, 1.0);
                }

                @fragment
                fn fragmentMain(@builtin(position) position: vec4<f32>) -> @location(${index}) vec4<f32> {
                    return textureLoad(resolved, vec2<i32>(position.xy), 0);
                }
            `,
        });

        return this._modules[index];
    }

    private _createPipeline(layout: GpuMsaaRestoreLayout, index: number): GPURenderPipeline
    {
        const { colorFormats, depthStencilFormat } = layout;
        let depthStencil: GPUDepthStencilState;

        if (depthStencilFormat)
        {
            // matches the pass; the restore never tests or writes depth/stencil
            depthStencil = { format: depthStencilFormat };

            if (depthStencilFormat.includes('depth'))
            {
                depthStencil.depthWriteEnabled = false;
                depthStencil.depthCompare = 'always';
            }
        }

        const module = this._getModule(index);

        return this._device.createRenderPipeline({
            label: 'msaa-restore',
            layout: this._pipelineLayout,
            vertex: { module, entryPoint: 'vertexMain' },
            fragment: {
                module,
                entryPoint: 'fragmentMain',
                // every attachment must be declared to match the pass; only the restored one is written
                targets: colorFormats.map((format, i) => ({
                    format,
                    writeMask: i === index ? GPUColorWrite.ALL : 0,
                })),
            },
            depthStencil,
            multisample: { count: 4 },
        });
    }
}
