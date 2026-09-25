import { TextureSource } from '../../shared/texture/sources/TextureSource';

import type { RenderTarget } from '../../shared/renderTarget/RenderTarget';
import type { WebGPURenderer } from '../WebGPURenderer';

/**
 * Restores a multisampled colour buffer from its resolved image.
 *
 * A transient MSAA colour buffer (every one on a tile-based GPU, and ones the user marks `transient`
 * elsewhere) is cleared on load and discarded on store, which skips writing the 4-sample buffer back to
 * memory. The resolved single-sample texture is still stored, so a pass that reopens the target (a filter
 * popping back, a mask adding stencil, `clear: false`) copies the resolved texture into the target's back
 * texture and draws it back in as the pass's first draw, instead of loading samples that were never written.
 * On tile-based GPUs this beats storing and loading the 4-sample buffer even when a target is reopened every
 * frame; on GPUs that keep MSAA in video memory it doesn't, which is why they store it by default.
 *
 * The draw is a full-screen `textureLoad` with no blending, so every pixel gets its resolved colour back.
 * The back textures belong to the targets (`GpuRenderTarget.msaaBackTextures`); this holds only the
 * pipelines and bind groups.
 * @category rendering
 * @ignore
 */
export class GpuMsaaRestore
{
    private readonly _renderer: WebGPURenderer;
    private readonly _device: GPUDevice;
    private readonly _layout: GPUBindGroupLayout;
    private readonly _pipelineLayout: GPUPipelineLayout;
    /** per attachment layout, one pipeline per colour attachment */
    private readonly _pipelines: Record<string, GPURenderPipeline[]> = Object.create(null);
    private readonly _modules: Record<number, GPUShaderModule> = Object.create(null);
    /** one bind group per back texture, dropped with the texture when a resize replaces it */
    private readonly _bindGroups = new WeakMap<GPUTexture, GPUBindGroup>();

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
        this._device = renderer.gpu.device;
        this._layout = this._device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                texture: { sampleType: 'unfilterable-float' },
            }],
        });
        this._pipelineLayout = this._device.createPipelineLayout({ bindGroupLayouts: [this._layout] });
    }

    /**
     * Copies one colour attachment's resolved image into the target's back texture, creating it on first use
     * at the attachment's size and format. Must be recorded outside a render pass.
     * @param commandEncoder - the encoder to record the copy on
     * @param renderTarget - the target being reopened
     * @param index - the colour attachment to copy
     * @param resolved - the attachment's resolved texture
     */
    public copy(commandEncoder: GPUCommandEncoder, renderTarget: RenderTarget, index: number, resolved: GPUTexture): void
    {
        const gpuRenderTarget = this._renderer.renderTarget.getGpuRenderTarget(renderTarget);
        const colorTexture = renderTarget.colorAttachments[index].texture;

        gpuRenderTarget.msaaBackTextures[index] ??= new TextureSource({
            label: 'msaa-back-texture',
            width: colorTexture.width,
            height: colorTexture.height,
            resolution: colorTexture._resolution,
            format: gpuRenderTarget.msaaTextures[index].format,
            autoGenerateMipmaps: false,
        });

        const backTexture = this._renderer.texture.getGpuSource(gpuRenderTarget.msaaBackTextures[index]);

        commandEncoder.copyTextureToTexture(
            { texture: resolved },
            { texture: backTexture },
            { width: Math.min(resolved.width, backTexture.width), height: Math.min(resolved.height, backTexture.height) },
        );
    }

    /**
     * Draws one colour attachment's back texture into the multisampled buffer. Must be the first draw of the
     * pass, before any viewport or scissor is set.
     * @param pass - the pass that was just begun
     * @param renderTarget - the target the pass renders to
     * @param index - the colour attachment to restore, copied by {@link GpuMsaaRestore.copy}
     */
    public draw(pass: GPURenderPassEncoder, renderTarget: RenderTarget, index: number): void
    {
        const gpuRenderTarget = this._renderer.renderTarget.getGpuRenderTarget(renderTarget);
        const backTexture = this._renderer.texture.getGpuSource(gpuRenderTarget.msaaBackTextures[index]);

        // the pipeline has to match the pass's attachments; a mask can add stencil mid-frame, so read them now
        let key = renderTarget.depthStencilAttachment?.texture.format ?? '';

        for (const attachment of renderTarget.colorAttachments)
        {
            key += `|${attachment.texture.format}`;
        }

        const pipelines = this._pipelines[key] ??= [];
        let bindGroup = this._bindGroups.get(backTexture);

        if (!bindGroup)
        {
            bindGroup = this._device.createBindGroup({
                layout: this._layout,
                entries: [{ binding: 0, resource: backTexture.createView() }],
            });
            this._bindGroups.set(backTexture, bindGroup);
        }

        pass.setPipeline(pipelines[index] ??= this._createPipeline(renderTarget, index));
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

    private _createPipeline(renderTarget: RenderTarget, index: number): GPURenderPipeline
    {
        const depthStencilFormat = renderTarget.depthStencilAttachment?.texture.format;
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
                targets: renderTarget.colorAttachments.map((attachment, i) => ({
                    format: attachment.texture.format,
                    writeMask: i === index ? GPUColorWrite.ALL : 0,
                })),
            },
            depthStencil,
            multisample: { count: 4 },
        });
    }
}
