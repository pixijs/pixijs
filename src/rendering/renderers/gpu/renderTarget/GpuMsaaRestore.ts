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
 * Pixi's MSAA colour buffers are transient: every pass clears them on load and discards them on store,
 * which skips writing the 4-sample buffer back to memory. The resolved single-sample texture is still
 * stored, so a pass that reopens the target (a filter popping back, a mask adding stencil, `clear: false`)
 * copies the resolved texture to a scratch texture and draws it back in as the pass's first draw,
 * instead of loading samples that were never written. On tile-based GPUs this beats storing and
 * loading the 4-sample buffer even when a target is reopened every frame.
 *
 * The draw is a full-screen `textureLoad` with no blending, so it is an exact per-pixel copy.
 * @category rendering
 * @ignore
 */
export class GpuMsaaRestore
{
    public readonly device: GPUDevice;

    private readonly _layout: GPUBindGroupLayout;
    private readonly _pipelineLayout: GPUPipelineLayout;
    /** per layout key, one pipeline per colour attachment */
    private readonly _pipelines: Record<string, GPURenderPipeline[]> = Object.create(null);
    private readonly _modules: Record<number, GPUShaderModule> = Object.create(null);
    /** one scratch texture per format and attachment slot, grown to the largest target restored */
    private readonly _scratch: Record<string, { texture: GPUTexture; bindGroup: GPUBindGroup }> = Object.create(null);

    constructor(device: GPUDevice)
    {
        this.device = device;
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
     * Copies a resolved colour texture into scratch. Must be recorded outside a render pass.
     * @param commandEncoder - the encoder to record the copy on
     * @param resolved - the resolved texture of the attachment being restored
     * @param slot - the attachment index, so attachments of the same format don't share scratch
     * @returns the bind group the restore draw samples from
     */
    public copy(commandEncoder: GPUCommandEncoder, resolved: GPUTexture, slot: number): GPUBindGroup
    {
        const scratch = this._getScratch(resolved, slot);

        commandEncoder.copyTextureToTexture(
            { texture: resolved },
            { texture: scratch.texture },
            { width: resolved.width, height: resolved.height },
        );

        return scratch.bindGroup;
    }

    /**
     * Draws a copied image into one colour attachment. Must be the first draw of the pass, before
     * any viewport or scissor is set.
     * @param pass - the pass that was just begun
     * @param layout - the pass's attachment layout
     * @param index - the colour attachment to restore
     * @param bindGroup - the bind group returned by {@link GpuMsaaRestore.copy}
     */
    public draw(pass: GPURenderPassEncoder, layout: GpuMsaaRestoreLayout, index: number, bindGroup: GPUBindGroup): void
    {
        const pipelines = this._pipelines[layout.key] ||= [];

        pass.setPipeline(pipelines[index] ||= this._createPipeline(layout, index));
        pass.setBindGroup(0, bindGroup);
        pass.draw(3);
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

            scratch?.texture.destroy();

            const texture = this.device.createTexture({
                label: 'msaa-restore-scratch',
                size: { width, height },
                format,
                usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
            });

            scratch = this._scratch[key] = {
                texture,
                bindGroup: this.device.createBindGroup({
                    layout: this._layout,
                    entries: [{ binding: 0, resource: texture.createView() }],
                }),
            };
        }

        return scratch;
    }

    private _getModule(index: number): GPUShaderModule
    {
        this._modules[index] ||= this.device.createShaderModule({
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

        return this.device.createRenderPipeline({
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
