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
 * Draws a resolved image back into a multisampled colour buffer.
 *
 * A transient MSAA colour buffer (every one on a tile-based GPU, and ones the user marks `transient`
 * elsewhere) is cleared on load and discarded on store, which skips writing the 4-sample buffer back to
 * memory. The resolved single-sample texture is still stored, so a pass that reopens the target (a filter
 * popping back, a mask adding stencil, `clear: false`) copies the resolved texture to the target's scratch
 * texture and draws it back in as the pass's first draw, instead of loading samples that were never written.
 * On tile-based GPUs this beats storing and loading the 4-sample buffer even when a target is reopened every
 * frame; on GPUs that keep MSAA in video memory it doesn't, which is why they store it by default.
 *
 * The draw is a full-screen `textureLoad` with no blending, so every pixel gets its resolved colour back.
 * This holds only pipelines and bind groups; the scratch textures belong to the render targets.
 * @category rendering
 * @ignore
 */
export class GpuMsaaRestore
{
    private readonly _device: GPUDevice;
    private readonly _layout: GPUBindGroupLayout;
    private readonly _pipelineLayout: GPUPipelineLayout;
    /** per layout key, one pipeline per colour attachment */
    private readonly _pipelines: Record<string, GPURenderPipeline[]> = Object.create(null);
    private readonly _modules: Record<number, GPUShaderModule> = Object.create(null);
    /** one bind group per scratch texture, dropped with the texture when a resize replaces it */
    private readonly _bindGroups = new WeakMap<GPUTexture, GPUBindGroup>();

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
     * Draws a copy of one colour attachment's resolved image back in. Must be the first draw of the pass,
     * before any viewport or scissor is set.
     * @param pass - the pass that was just begun
     * @param layout - the pass's attachment layout
     * @param index - the colour attachment to restore
     * @param scratch - the texture the resolved image was copied into
     */
    public draw(pass: GPURenderPassEncoder, layout: GpuMsaaRestoreLayout, index: number, scratch: GPUTexture): void
    {
        const pipelines = this._pipelines[layout.key] ??= [];
        let bindGroup = this._bindGroups.get(scratch);

        if (!bindGroup)
        {
            bindGroup = this._device.createBindGroup({
                layout: this._layout,
                entries: [{ binding: 0, resource: scratch.createView() }],
            });
            this._bindGroups.set(scratch, bindGroup);
        }

        pass.setPipeline(pipelines[index] ??= this._createPipeline(layout, index));
        pass.setBindGroup(0, bindGroup);
        pass.draw(3);
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
