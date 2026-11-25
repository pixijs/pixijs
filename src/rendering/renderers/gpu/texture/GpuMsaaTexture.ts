import type { TextureSource } from '../../shared/texture/sources/TextureSource';
import type { WebGPURenderer } from '../WebGPURenderer';

/**
 * The multisampled colour texture an antialiased texture is drawn into, and resolved from, by every render
 * target over it. Made on first render into the texture, and destroyed with its GPU data, so it lives as
 * long as the texture's GPU texture, not as long as a render target. A canvas has no GPU data, so its
 * render target keeps one of its own.
 * @internal
 */
export class GpuMsaaTexture
{
    public texture: GPUTexture;
    public view: GPUTextureView;
    /**
     * Never stored, so a pass that reopens it restores it from the resolved texture (see GpuMsaaRestore).
     * Always on tile-based GPUs; elsewhere storing it is cheaper, so only when the texture is marked
     * `transient`. Read once, when it is made.
     */
    public readonly transient: boolean;

    /**
     * @param renderer - the renderer whose device makes it
     * @param source - the texture it holds the samples of, which sets its format and size
     */
    constructor(renderer: WebGPURenderer, source: TextureSource)
    {
        const { tileBased, transientAttachment } = renderer.device.extensions;

        this.transient = tileBased || source.transient;

        let usage = GPUTextureUsage.RENDER_ATTACHMENT;

        if (this.transient && transientAttachment) usage |= GPUTextureUsage.TRANSIENT_ATTACHMENT;

        this.texture = renderer.gpu.device.createTexture({
            label: source.label,
            size: { width: source.pixelWidth, height: source.pixelHeight, depthOrArrayLayers: source.depthOrArrayLayers },
            format: source.format,
            sampleCount: 4,
            // WebGPU requires multisampled textures to have exactly 1 mip level
            mipLevelCount: 1,
            usage,
        });
        this.view = this.texture.createView();
    }

    public destroy(): void
    {
        this.texture.destroy();
        this.texture = null;
        this.view = null;
    }
}
