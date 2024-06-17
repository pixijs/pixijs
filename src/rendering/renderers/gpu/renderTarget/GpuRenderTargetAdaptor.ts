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
 * The WebGPU adaptor for the render target system. Allows the Render Target System to
 * be used with the WebGPU renderer
 * @memberof rendering
 * @ignore
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
        originSrc: { x: number; y: number; },
        size: { width: number; height: number; },
        originDest: { x: number; y: number; },
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
                origin: originSrc,
            },
            {
                texture: backGpuTexture,
                origin: originDest,
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
        this._renderer.pipeline.setRenderTarget(gpuRenderTarget);
        this._renderer.encoder.beginRenderPass(gpuRenderTarget);
        this._renderer.encoder.setViewport(viewport);
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

        let depthStencilAttachment: GPURenderPassDepthStencilAttachment;

        // if we have a depth or stencil buffer, we need to ensure we have a texture for it
        // this is WebGPU specific - as WebGL does not require textures to run a depth / stencil buffer
        if ((renderTarget.stencil || renderTarget.depth) && !renderTarget.depthStencilTexture)
        {
            renderTarget.ensureDepthStencilTexture();
            renderTarget.depthStencilTexture.source.sampleCount = gpuRenderTarget.msaa ? 4 : 1;
        }

        if (renderTarget.depthStencilTexture)
        {
            const stencilLoadOp = (clear & CLEAR.STENCIL ? 'clear' : 'load') as GPULoadOp;
            const depthLoadOp = (clear & CLEAR.DEPTH ? 'clear' : 'load') as GPULoadOp;

            depthStencilAttachment = {
                view: this._renderer.texture
                    .getGpuSource(renderTarget.depthStencilTexture.source)
                    .createView(),
                stencilStoreOp: 'store',
                stencilLoadOp,
                depthClearValue: 1.0,
                depthLoadOp,
                depthStoreOp: 'store',
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
        if (!clear) return;

        const { gpu, encoder } = this._renderer;

        const device = gpu.device;

        const standAlone = encoder.commandEncoder === null;

        if (standAlone)
        {
            const commandEncoder = device.createCommandEncoder();
            const renderPassDescriptor = this.getDescriptor(renderTarget, clear, clearColor);

            const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

            passEncoder.setViewport(viewport.x, viewport.y, viewport.width, viewport.height, 0, 1);

            passEncoder.end();

            const gpuCommands = commandEncoder.finish();

            device.queue.submit([gpuCommands]);
        }
        else
        {
            this.startRenderPass(renderTarget, clear, clearColor, viewport);
        }
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
                const context = colorTexture.resource.getContext(
                    'webgpu'
                ) as unknown as GPUCanvasContext;

                const alphaMode = (colorTexture as CanvasSource).transparent ? 'premultiplied' : 'opaque';

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
                        alphaMode,
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

            if (renderTarget.depthStencilTexture)
            {
                renderTarget.depthStencilTexture.source.sampleCount = 4;
            }
        }

        return gpuRenderTarget;
    }

    public destroyGpuRenderTarget(gpuRenderTarget: GpuRenderTarget)
    {
        gpuRenderTarget.contexts.forEach((context) =>
        {
            context.unconfigure();
        });

        gpuRenderTarget.msaaTextures.forEach((texture) =>
        {
            texture.destroy();
        });

        gpuRenderTarget.msaaTextures.length = 0;
        gpuRenderTarget.contexts.length = 0;
    }

    public ensureDepthStencilTexture(renderTarget: RenderTarget)
    {
        // TODO This function will be more useful once we cache the descriptors
        const gpuRenderTarget = this._renderTargetSystem.getGpuRenderTarget(renderTarget);

        if (renderTarget.depthStencilTexture && gpuRenderTarget.msaa)
        {
            renderTarget.depthStencilTexture.source.sampleCount = 4;
        }
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
