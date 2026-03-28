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
 * @category rendering
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
        viewport?: Rectangle,
        mipLevel = 0,
        layer = 0
    )
    {
        const renderTargetSystem = this._renderTargetSystem;

        const gpuRenderTarget = renderTargetSystem.getGpuRenderTarget(renderTarget);

        if (layer !== 0 && gpuRenderTarget.msaaTextures?.length)
        {
            throw new Error('[RenderTargetSystem] Rendering to array layers is not supported with MSAA render targets.');
        }

        if (mipLevel > 0 && gpuRenderTarget.msaaTextures?.length)
        {
            throw new Error('[RenderTargetSystem] Rendering to mip levels is not supported with MSAA render targets.');
        }

        const descriptor = this.getDescriptor(renderTarget, clear, clearColor, mipLevel, layer);

        gpuRenderTarget.descriptor = descriptor;

        if (renderTarget.depthStencilAttachment)
        {
            gpuRenderTarget.depthStencilFormat = renderTarget.depthStencilAttachment.texture.format;
        }

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
        if (renderTarget.colorAttachments.length === 0)
        {
            throw new Error('[GpuRenderTargetAdaptor] cannot get gpu color texture from a depth-only render target');
        }

        const gpuRenderTarget = this._renderTargetSystem.getGpuRenderTarget(renderTarget);

        if (gpuRenderTarget.contexts[0])
        {
            return gpuRenderTarget.contexts[0].getCurrentTexture();
        }

        return this._renderer.texture.getGpuSource(
            renderTarget.colorAttachments[0].texture
        );
    }

    public getDescriptor(
        renderTarget: RenderTarget,
        clear: CLEAR_OR_BOOL,
        clearValue: RgbaArray,
        mipLevel = 0,
        layer = 0
    ): GPURenderPassDescriptor
    {
        if (typeof clear === 'boolean')
        {
            clear = clear ? CLEAR.ALL : CLEAR.NONE;
        }

        const renderTargetSystem = this._renderTargetSystem;

        const gpuRenderTarget = renderTargetSystem.getGpuRenderTarget(renderTarget);

        const colorAttachments = renderTarget.colorAttachments.map(
            (colorAttachment, i) =>
            {
                const context = gpuRenderTarget.contexts[i];

                let view: GPUTextureView;
                let resolveTarget: GPUTextureView;

                if (context)
                {
                    if (layer !== 0)
                    {
                        // eslint-disable-next-line max-len
                        throw new Error('[RenderTargetSystem] Rendering to array layers is not supported for canvas targets.');
                    }

                    const currentTexture = context.getCurrentTexture();

                    const canvasTextureView = currentTexture.createView(colorAttachment.viewDescriptor);

                    view = canvasTextureView;
                }
                else
                {
                    view = this._renderer.texture.getTextureRenderTargetView(
                        colorAttachment.texture,
                        mipLevel,
                        layer,
                        colorAttachment.viewDescriptor
                    );
                }

                if (gpuRenderTarget.msaaTextures[i])
                {
                    resolveTarget = view;
                    view = this._renderer.texture.getTextureView(
                        gpuRenderTarget.msaaTextures[i]
                    );
                }

                let loadOp = colorAttachment.loadOp;

                if (clear !== undefined)
                {
                    loadOp = (clear as CLEAR) & CLEAR.COLOR ? 'clear' : 'load';
                }

                clearValue ??= renderTargetSystem.defaultClearColor;

                const storeOp = colorAttachment.storeOp ?? 'store';

                const baseAttachment: GPURenderPassColorAttachment = {
                    view,
                    resolveTarget,
                    storeOp,
                    loadOp,
                };

                if (loadOp === 'clear')
                {
                    clearValue ??= (colorAttachment.clearValue as RgbaArray) ?? renderTargetSystem.defaultClearColor;
                    baseAttachment.clearValue = clearValue;
                }

                for (const key in colorAttachment)
                {
                    if (key !== 'texture' && key !== 'viewDescriptor'
                        && key !== 'clearValue' && key !== 'loadOp' && key !== 'storeOp')
                    {
                        (baseAttachment as any)[key] = (colorAttachment as any)[key];
                    }
                }

                return baseAttachment;
            }
        ) as GPURenderPassColorAttachment[];

        let depthStencilAttachment: GPURenderPassDepthStencilAttachment;

        // If we have a depth/stencil attachment, ensure its sample count matches the MSAA state.
        // This is necessary if the stencil buffer was added dynamically after initialization
        // (e.g. by the mask system calling ensureDepthStencil()).
        if (renderTarget.depthStencilAttachment)
        {
            if (gpuRenderTarget.msaa)
            {
                renderTarget.depthStencilAttachment.texture.sampleCount = 4;
            }

            const attachment = renderTarget.depthStencilAttachment;
            const stencil = attachment.texture.format.includes('stencil');
            const depth = attachment.texture.format.includes('depth');

            depthStencilAttachment = {
                view: this._renderer.texture.getTextureRenderTargetView(
                    attachment.texture,
                    mipLevel,
                    layer,
                    attachment.viewDescriptor
                ),
            };

            const depthReadOnly = attachment.depthReadOnly ?? false;
            // If depth is read-only, it's highly likely they want to sample the texture,
            // which requires the ENTIRE texture (including stencil) to be read-only in WebGPU.
            const stencilReadOnly = attachment.stencilReadOnly ?? depthReadOnly;

            if (stencil && !stencilReadOnly)
            {
                depthStencilAttachment.stencilLoadOp = (clear & CLEAR.STENCIL
                    ? 'clear' : (attachment.stencilLoadOp ?? 'load')) as GPULoadOp;
                depthStencilAttachment.stencilStoreOp = attachment.stencilStoreOp ?? 'store';

                if (depthStencilAttachment.stencilLoadOp === 'clear')
                {
                    depthStencilAttachment.stencilClearValue = attachment.stencilClearValue ?? 0;
                }
            }
            else if (stencil && stencilReadOnly)
            {
                depthStencilAttachment.stencilReadOnly = true;
            }

            if (depth && !depthReadOnly)
            {
                depthStencilAttachment.depthLoadOp = (clear & CLEAR.DEPTH
                    ? 'clear' : (attachment.depthLoadOp ?? 'load')) as GPULoadOp;
                depthStencilAttachment.depthStoreOp = attachment.depthStoreOp ?? 'store';

                if (depthStencilAttachment.depthLoadOp === 'clear')
                {
                    depthStencilAttachment.depthClearValue = attachment.depthClearValue ?? 1.0;
                }
            }
            else if (depth && depthReadOnly)
            {
                depthStencilAttachment.depthReadOnly = true;
            }

            // Reapply any other properties from the Pixi attachment that map to WebGPU
            // (excluding Pixi ones and ones we explicitly set above)
            for (const key in attachment)
            {
                if (key !== 'texture' && key !== 'viewDescriptor'
                    && key !== 'stencilLoadOp' && key !== 'stencilStoreOp'
                    && key !== 'stencilClearValue' && key !== 'stencilReadOnly'
                    && key !== 'depthLoadOp' && key !== 'depthStoreOp'
                    && key !== 'depthClearValue' && key !== 'depthReadOnly'
                )
                {
                    (depthStencilAttachment as any)[key] = (attachment as any)[key];
                }
            }
        }

        const descriptor: GPURenderPassDescriptor = {
            colorAttachments,
            depthStencilAttachment,
        };

        return descriptor;
    }

    public clear(
        renderTarget: RenderTarget,
        clear: CLEAR_OR_BOOL = true,
        clearColor?: RgbaArray,
        viewport?: Rectangle,
        mipLevel = 0,
        layer = 0
    )
    {
        if (!clear) return;

        const { gpu, encoder } = this._renderer;

        const device = gpu.device;

        const standAlone = encoder.commandEncoder === null;

        if (standAlone)
        {
            const commandEncoder = device.createCommandEncoder();
            const renderPassDescriptor = this.getDescriptor(renderTarget, clear, clearColor, mipLevel, layer);

            const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

            passEncoder.setViewport(viewport.x, viewport.y, viewport.width, viewport.height, 0, 1);

            passEncoder.end();

            const gpuCommands = commandEncoder.finish();

            device.queue.submit([gpuCommands]);
        }
        else
        {
            this.startRenderPass(renderTarget, clear, clearColor, viewport, mipLevel, layer);
        }
    }

    public initGpuRenderTarget(renderTarget: RenderTarget): GpuRenderTarget
    {
        // always true for WebGPU
        renderTarget.isRoot = true;

        const gpuRenderTarget = new GpuRenderTarget();

        gpuRenderTarget.colorTargetCount = renderTarget.colorAttachments.length;

        // create a context...
        // is a canvas...
        renderTarget.colorAttachments.forEach((colorAttachment, i) =>
        {
            const colorTexture = colorAttachment.texture;

            if (colorTexture instanceof CanvasSource)
            {
                const context = colorTexture.resource.getContext(
                    'webgpu'
                ) as unknown as GPUCanvasContext;

                const alphaMode = (colorTexture as CanvasSource).transparent ? 'premultiplied' : 'opaque';

                try
                {
                    context.configure({
                        device: this._renderer.gpu.device,
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

            if (colorTexture.antialias)
            {
                const msaaTexture = new TextureSource({
                    width: 0,
                    height: 0,
                    sampleCount: 4,
                    arrayLayerCount: colorTexture.arrayLayerCount,
                });

                gpuRenderTarget.msaaTextures[i] = msaaTexture;
            }
        });

        if (gpuRenderTarget.msaa)
        {
            gpuRenderTarget.msaaSamples = 4;

            if (renderTarget.depthStencilAttachment)
            {
                renderTarget.depthStencilAttachment.texture.sampleCount = 4;
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

        if (renderTarget.depthStencilAttachment && gpuRenderTarget.msaa)
        {
            renderTarget.depthStencilAttachment.texture.sampleCount = 4;
        }
    }

    public resizeGpuRenderTarget(renderTarget: RenderTarget)
    {
        const gpuRenderTarget = this._renderTargetSystem.getGpuRenderTarget(renderTarget);

        gpuRenderTarget.width = renderTarget.width;
        gpuRenderTarget.height = renderTarget.height;

        if (gpuRenderTarget.msaa)
        {
            renderTarget.colorAttachments.forEach((colorAttachment, i) =>
            {
                const colorTexture = colorAttachment.texture;
                const msaaTexture = gpuRenderTarget.msaaTextures[i];

                msaaTexture?.resize(
                    colorTexture.width,
                    colorTexture.height,
                    colorTexture._resolution
                );
            });
        }
    }
}
