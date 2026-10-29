import type { TextureSource } from '../../shared/texture/sources/TextureSource';
import type { WebGPURenderer } from '../WebGPURenderer';

/** what a copy needs for one source sample count: the source binding differs between 1 and 4 samples */
interface DepthCopyVariant
{
    layout: GPUBindGroupLayout;
    pipelineLayout: GPUPipelineLayout;
    module: GPUShaderModule;
    /** by destination format */
    pipelines: Record<string, GPURenderPipeline>;
}

/**
 * Copies depth that `copyTextureToTexture` can't, by drawing it.
 *
 * WebGPU only copies depth textures whole, and only between textures with the same sample count, and it has no
 * depth resolve. So `copyDepthTexture` from an antialiased target, or of a region, draws a full-screen triangle
 * into the destination that writes each pixel's depth from the source. A multisampled source gives sample 0:
 * what WebGL's `blitFramebuffer` resolve gives, and the resolve mode every Vulkan driver supports; keeping the
 * nearest of the samples instead costs 1.5–2.8× as much on phones. Only depth is copied: a destination's stencil
 * is left as it was.
 * @category rendering
 * @ignore
 */
export class GpuDepthCopy
{
    private readonly _renderer: WebGPURenderer;
    private readonly _device: GPUDevice;
    /** by source sample count */
    private readonly _variants: Record<number, DepthCopyVariant> = Object.create(null);
    /** one bind group per source texture, dropped with the texture when a resize replaces it */
    private readonly _bindGroups = new WeakMap<GPUTexture, GPUBindGroup>();
    /** reused by every copy, so a copy allocates nothing once its pipeline and bind group exist */
    private readonly _depthStencilAttachment: GPURenderPassDepthStencilAttachment = {
        view: null,
        depthLoadOp: 'load',
        depthStoreOp: 'store',
    };
    private readonly _passDescriptor: GPURenderPassDescriptor = {
        label: 'depth-copy',
        colorAttachments: [],
        depthStencilAttachment: this._depthStencilAttachment,
    };

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
        this._device = renderer.gpu.device;
    }

    /**
     * Records the copy of a region of a depth texture into another depth texture. Must be recorded outside a
     * render pass.
     * @param commandEncoder - the encoder to record the copy on
     * @param source - the depth texture to read, created with `TEXTURE_BINDING`; it may be multisampled
     * @param destination - the single-sample texture to write depth into; it must have a depth aspect
     * @param originSrc - the top left of the region in the source
     * @param originSrc.x - its x, in pixels
     * @param originSrc.y - its y, in pixels
     * @param size - the size of the region
     * @param size.width - its width, in pixels
     * @param size.height - its height, in pixels
     * @param originDest - where the region lands in the destination
     * @param originDest.x - its x, in pixels
     * @param originDest.y - its y, in pixels
     */
    public copy(
        commandEncoder: GPUCommandEncoder,
        source: TextureSource,
        destination: TextureSource,
        originSrc: { x: number; y: number },
        size: { width: number; height: number },
        originDest: { x: number; y: number },
    ): void
    {
        const sourceTexture = this._renderer.texture.getGpuSource(source);
        const sampleCount = sourceTexture.sampleCount;
        const variant = this._variants[sampleCount] ??= this._createVariant(sampleCount);
        let bindGroup = this._bindGroups.get(sourceTexture);

        if (!bindGroup)
        {
            bindGroup = this._device.createBindGroup({
                layout: variant.layout,
                entries: [{ binding: 0, resource: sourceTexture.createView({ aspect: 'depth-only' }) }],
            });
            this._bindGroups.set(sourceTexture, bindGroup);
        }

        const format = destination.format;
        const attachment = this._depthStencilAttachment;
        // a format with a stencil aspect needs its stencil ops, one without must not have them (undefined is absent)
        const stencil = format.includes('stencil');

        attachment.view = this._renderer.texture.getTextureView(destination);
        attachment.stencilLoadOp = stencil ? 'load' : undefined;
        attachment.stencilStoreOp = stencil ? 'store' : undefined;

        const pass = commandEncoder.beginRenderPass(this._passDescriptor);

        // the pass has read the descriptor; don't keep the destination alive until the next copy
        attachment.view = null;

        // the viewport places the region in the destination; the source is read at the same pixel plus the
        // offset between the two origins, which rides in firstInstance as two 16-bit halves biased by 32768
        // (textures are at most 16384 wide, so the offset fits) — a draw argument needs no uniform buffer
        const packed = ((originSrc.x - originDest.x + 32768) | ((originSrc.y - originDest.y + 32768) << 16)) >>> 0;

        pass.setViewport(originDest.x, originDest.y, size.width, size.height, 0, 1);
        pass.setPipeline(variant.pipelines[format] ??= this._createPipeline(format, variant));
        pass.setBindGroup(0, bindGroup);
        pass.draw(3, 1, 0, packed);
        pass.end();
    }

    private _createVariant(sampleCount: number): DepthCopyVariant
    {
        const multisampled = sampleCount > 1;
        const layout = this._device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                texture: { sampleType: 'depth', multisampled },
            }],
        });

        // textureLoad's third argument is the sample on a multisampled texture and the mip level on any other:
        // 0 is sample 0, or mip 0
        const module = this._device.createShaderModule({
            label: 'depth-copy',
            code: /* wgsl */ `
                @group(0) @binding(0) var source: ${multisampled ? 'texture_depth_multisampled_2d' : 'texture_depth_2d'};

                struct Varyings {
                    @builtin(position) position: vec4<f32>,
                    @location(0) @interpolate(flat) offset: vec2<i32>,
                };

                @vertex
                fn vertexMain(@builtin(vertex_index) i: u32, @builtin(instance_index) packed: u32) -> Varyings {
                    let pos = array<vec2<f32>, 3>(vec2<f32>(-1.0, -1.0), vec2<f32>(3.0, -1.0), vec2<f32>(-1.0, 3.0));
                    let offset = vec2<i32>(i32(packed & 0xffffu), i32(packed >> 16u)) - vec2<i32>(32768);

                    return Varyings(vec4<f32>(pos[i], 0.0, 1.0), offset);
                }

                @fragment
                fn fragmentMain(varyings: Varyings) -> @builtin(frag_depth) f32 {
                    return textureLoad(source, vec2<i32>(varyings.position.xy) + varyings.offset, 0);
                }
            `,
        });

        return {
            layout,
            pipelineLayout: this._device.createPipelineLayout({ bindGroupLayouts: [layout] }),
            module,
            pipelines: Object.create(null),
        };
    }

    private _createPipeline(format: GPUTextureFormat, variant: DepthCopyVariant): GPURenderPipeline
    {
        return this._device.createRenderPipeline({
            label: 'depth-copy',
            layout: variant.pipelineLayout,
            vertex: { module: variant.module, entryPoint: 'vertexMain' },
            fragment: { module: variant.module, entryPoint: 'fragmentMain', targets: [] },
            depthStencil: { format, depthWriteEnabled: true, depthCompare: 'always' },
        });
    }
}
