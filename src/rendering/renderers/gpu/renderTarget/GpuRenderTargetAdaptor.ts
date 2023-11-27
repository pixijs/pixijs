import { CLEAR } from '../../gl/const';
import { CanvasSource } from '../../shared/texture/sources/CanvasSource';
import { TextureSource } from '../../shared/texture/sources/TextureSource';
import { GpuRenderTarget } from './GpuRenderTarget';

import type { RgbaArray } from '../../../../color/Color';
import type { Rectangle } from '../../../../maths/shapes/Rectangle';
import type { CLEAR_OR_BOOL } from '../../gl/const';
import type { RenderTarget } from '../../shared/renderTarget/RenderTarget';
import type { RenderTargetAdaptor, RenderTargetSystem } from '../../shared/renderTarget/RenderTargetSystem';
import type { Texture } from '../../shared/texture/Texture';
import type { WebGPURenderer } from '../WebGPURenderer';

/**
 * the WebGPPU adaptor for the render target system. Allows the Render Target System to
 * be used with the WebGPU renderer
 */
export class GpuRenderTargetAdaptor implements RenderTargetAdaptor<GpuRenderTarget>
{
    private _renderTargetSystem: RenderTargetSystem<GpuRenderTarget>;
    private _renderer: WebGPURenderer<HTMLCanvasElement>;

    public init(renderer: WebGPURenderer, renderTargetSystem: RenderTargetSystem<GpuRenderTarget>): void
    {
        this._renderer = renderer;
        this._renderTargetSystem = renderTargetSystem;
    }

    public copyToTexture(
        sourceRenderSurfaceTexture: RenderTarget,
        destinationTexture: Texture,
        origin: { x: number; y: number; },
        size: { width: number; height: number; }
    )
    {
        const renderer = this._renderer;

        const baseGpuTexture = this._getGpuColorTexture(
            sourceRenderSurfaceTexture
        );

        const backGpuTexture = renderer.texture.getGpuSource(
            destinationTexture.source
        );

        renderer.encoder.commandEncoder.copyTextureToTexture(
            {
                texture: baseGpuTexture,
                origin,
            },
            {
                texture: backGpuTexture,
            },
            size
        );

        return destinationTexture;
    }

    public startRenderPass(
        renderTarget: RenderTarget,
        clear: CLEAR_OR_BOOL = true,
        clearColor?: RgbaArray,
        viewport?: Rectangle
    )
    {
        const renderTargetSystem = this._renderTargetSystem;

        const gpuRenderTarget = renderTargetSystem.getGpuRenderTarget(renderTarget);

        const descriptor = this.getDescriptor(renderTarget, clear, clearColor);

        gpuRenderTarget.descriptor = descriptor;

        // TODO we should not finish a render pass each time we bind
        // for example filters - we would want to push / pop render targets
        this._renderer.encoder.beginRenderPass(gpuRenderTarget);
        this._renderer.encoder.setViewport(viewport);
        this._renderer.pipeline.setMultisampleCount(gpuRenderTarget.msaaSamples);
    }

    public finishRenderPass()
    {
        this._renderer.encoder.endRenderPass();
    }

    /**
     * returns the gpu texture for the first color texture in the render target
     * mainly used by the filter manager to get copy the texture for blending
     * @param renderTarget
     * @returns a gpu texture
     */
    private _getGpuColorTexture(renderTarget: RenderTarget): GPUTexture
    {
        const gpuRenderTarget = this._renderTargetSystem.getGpuRenderTarget(renderTarget);

        if (gpuRenderTarget.contexts[0])
        {
            return gpuRenderTarget.contexts[0].getCurrentTexture();
        }

        return this._renderer.texture.getGpuSource(
            renderTarget.colorTextures[0].source
        );
    }

    public getDescriptor(
        renderTarget: RenderTarget,
        clear: CLEAR_OR_BOOL,
        clearValue: RgbaArray
    ): GPURenderPassDescriptor
    {
        if (typeof clear === 'boolean')
        {
            clear = clear ? CLEAR.ALL : CLEAR.NONE;
        }

        const renderTargetSystem = this._renderTargetSystem;

        const gpuRenderTarget = renderTargetSystem.getGpuRenderTarget(renderTarget);

        const colorAttachments = renderTarget.colorTextures.map(
            (texture, i) =>
            {
                const context = gpuRenderTarget.contexts[i];

                let view: GPUTextureView;
                let resolveTarget: GPUTextureView;

                if (context)
                {
                    const currentTexture = context.getCurrentTexture();

                    const canvasTextureView = currentTexture.createView();

                    view = canvasTextureView;
                }
                else
                {
                    view = this._renderer.texture.getGpuSource(texture).createView({
                        mipLevelCount: 1,
                    });
                }

                if (gpuRenderTarget.msaaTextures[i])
                {
                    resolveTarget = view;
                    view = this._renderer.texture.getTextureView(
                        gpuRenderTarget.msaaTextures[i]
                    );
                }

                const loadOp = ((clear as CLEAR) & CLEAR.COLOR ? 'clear' : 'load') as GPULoadOp;

                clearValue ??= renderTargetSystem.defaultClearColor;

                return {
                    view,
                    resolveTarget,
                    clearValue,
                    storeOp: 'store',
                    loadOp
                };
            }
        ) as GPURenderPassColorAttachment[];

        let depthStencilAttachment;

        if (renderTarget.depthTexture)
        {
            const stencilLoadOp = (clear & CLEAR.STENCIL ? 'clear' : 'load') as GPULoadOp;

            depthStencilAttachment = {
                view: this._renderer.texture
                    .getGpuSource(renderTarget.depthTexture.source)
                    .createView(),
                stencilStoreOp: 'store' as GPUStoreOp,
                stencilLoadOp,
            };
        }

        const descriptor: GPURenderPassDescriptor = {
            colorAttachments,
            depthStencilAttachment,
        };

        return descriptor;
    }

    public clear(renderTarget: RenderTarget, clear: CLEAR_OR_BOOL = true, clearColor?: RgbaArray, viewport?: Rectangle)
    {
        this.startRenderPass(
            renderTarget,
            clear,
            clearColor,
            viewport
        );
    }

    public initGpuRenderTarget(renderTarget: RenderTarget): GpuRenderTarget
    {
        // always false for WebGPU
        renderTarget.isRoot = true;

        const gpuRenderTarget = new GpuRenderTarget();

        // create a context...
        // is a canvas...
        renderTarget.colorTextures.forEach((colorTexture, i) =>
        {
            if (CanvasSource.test(colorTexture.resource))
            {
                const context = renderTarget.colorTexture.resource.getContext(
                    'webgpu'
                ) as unknown as GPUCanvasContext;

                try
                {
                    context.configure({
                        device: this._renderer.gpu.device,
                        // eslint-disable-next-line max-len
                        usage: GPUTextureUsage.TEXTURE_BINDING
                            | GPUTextureUsage.COPY_DST
                            | GPUTextureUsage.RENDER_ATTACHMENT
                            | GPUTextureUsage.COPY_SRC,
                        format: 'bgra8unorm',
                        alphaMode: 'opaque',
                    });
                }
                catch (e)
                {
                    console.error(e);
                }

                gpuRenderTarget.contexts[i] = context;
            }

            gpuRenderTarget.msaa = colorTexture.source.antialias;

            if (colorTexture.source.antialias)
            {
                const msaaTexture = new TextureSource({
                    width: 0,
                    height: 0,
                    sampleCount: 4,
                });

                gpuRenderTarget.msaaTextures[i] = msaaTexture;
            }
        });

        if (gpuRenderTarget.msaa)
        {
            gpuRenderTarget.msaaSamples = 4;

            if (renderTarget.depthTexture)
            {
                renderTarget.depthTexture.source.sampleCount = 4;
            }
        }

        return gpuRenderTarget;
    }

    public resizeGpuRenderTarget(renderTarget: RenderTarget)
    {
        const gpuRenderTarget = this._renderTargetSystem.getGpuRenderTarget(renderTarget);

        gpuRenderTarget.width = renderTarget.width;
        gpuRenderTarget.height = renderTarget.height;

        if (gpuRenderTarget.msaa)
        {
            renderTarget.colorTextures.forEach((colorTexture, i) =>
            {
                const msaaTexture = gpuRenderTarget.msaaTextures[i];

                msaaTexture?.resize(
                    colorTexture.source.width,
                    colorTexture.source.height,
                    colorTexture.source._resolution
                );
            });
        }
    }
}
