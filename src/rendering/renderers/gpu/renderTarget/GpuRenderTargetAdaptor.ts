import { warn } from '../../../../utils/logging/warn';
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

// WebGPU's `GPUCanvasContext.configure` only accepts these formats. Anything else on a
// CanvasSource falls back to the platform-preferred format with a warning.
const canvasAllowedFormats: Record<string, true> = {
    bgra8unorm: true,
    rgba8unorm: true,
    rgba16float: true,
};

function getCanvasContextFormat(format: GPUTextureFormat): GPUTextureFormat
{
    if (canvasAllowedFormats[format]) return format;

    const preferred = navigator.gpu.getPreferredCanvasFormat();

    warn(`[WebGPU] CanvasSource format '${format}' is not a valid GPUCanvasContext format. `
        + `Falling back to '${preferred}'. Allowed formats are: bgra8unorm, rgba8unorm, rgba16float.`);

    return preferred;
}

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
    /**
     * The render target the currently open render pass is rendering to (plus the subresource it is
     * bound to). Used to make {@link startRenderPass} idempotent: binding the same target/mip/layer
     * again with no clear reuses the open pass instead of tearing it down and beginning a new one.
     * Reset to `null` whenever the pass is closed ({@link finishRenderPass}).
     */
    private _activePass: {
        renderTarget: RenderTarget;
        mipLevel: number;
        layer: number;
        depthStencil: boolean;
    } | null = null;

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

        // a copy cannot be recorded while a render pass holds the shared command encoder —
        // close the pass first (no-op when none is open), matching the GL adaptor
        this.finishRenderPass();

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

    public copyDepthTexture(source: RenderTarget, destination: RenderTarget): void
    {
        if (!source.depthStencilAttachment || !destination.depthStencilAttachment)
        {
            warn('[GpuRenderTargetAdaptor] copyDepthTexture: source and destination must both have depth attachments');

            return;
        }

        const renderer = this._renderer;

        const srcDepth = source.depthStencilAttachment.texture;
        const dstDepth = destination.depthStencilAttachment.texture;

        const srcGpu = renderer.texture.getGpuSource(srcDepth);
        const dstGpu = renderer.texture.getGpuSource(dstDepth);

        const standAlone = renderer.encoder.commandEncoder === null;
        const commandEncoder = standAlone
            ? renderer.gpu.device.createCommandEncoder()
            : renderer.encoder.commandEncoder;

        commandEncoder.copyTextureToTexture(
            { texture: srcGpu },
            { texture: dstGpu },
            { width: source.pixelWidth, height: source.pixelHeight },
        );

        if (standAlone)
        {
            renderer.gpu.device.queue.submit([commandEncoder.finish()]);
        }
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

        // Idempotent ("smart") bind: if we are asked to bind the exact target/subresource the open
        // pass is already on, and no clear is requested, reuse the live pass. We only move the
        // viewport. This avoids a redundant pass teardown + state-cache flush (and re-binding every
        // pipeline / bind group / vertex buffer on the next draw). A *partial* clear still forces a
        // real begin because you cannot flip a loadOp to 'clear' mid-pass.
        let clearBits: CLEAR_OR_BOOL = clear;

        if (typeof clearBits === 'boolean')
        {
            clearBits = clearBits ? CLEAR.ALL : CLEAR.NONE;
        }

        // depth/stencil requested without an explicit texture — WebGPU always backs
        // depth/stencil with a texture, so create the internal one lazily
        if ((renderTarget.stencil || renderTarget.depth) && !renderTarget.depthStencilAttachment)
        {
            renderTarget.ensureDepthStencilTexture();
        }

        const hasDepthStencil = !!renderTarget.depthStencilAttachment;

        const activePass = this._activePass;

        const reuse = activePass !== null
            && activePass.renderTarget === renderTarget
            && activePass.mipLevel === mipLevel
            && activePass.layer === layer
            // a depth/stencil attachment added mid-pass (e.g. mask system's ensureDepthStencil)
            // changes the attachment set, so the pass must genuinely reopen
            && activePass.depthStencil === hasDepthStencil
            && this._renderer.encoder.renderPassEncoder !== null
            && clearBits === CLEAR.NONE;

        if (reuse)
        {
            this._renderer.encoder.setViewport(viewport);

            return;
        }

        const descriptor = this.getDescriptor(renderTarget, clear, clearColor, mipLevel, layer);

        gpuRenderTarget.descriptor = descriptor;

        this._renderer.pipeline.setRenderTarget(renderTarget);
        this._renderer.encoder.beginRenderPass(gpuRenderTarget);
        this._renderer.encoder.setViewport(viewport);

        this._activePass = { renderTarget, mipLevel, layer, depthStencil: hasDepthStencil };
    }

    public finishRenderPass()
    {
        this._renderer.encoder.endRenderPass();

        // The pass is now closed; a subsequent bind to the same target must genuinely reopen it
        // (e.g. the copyToTexture / copyColor case, which reads the resolved contents).
        this._activePass = null;
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

        const colorTexture = renderTarget.colorAttachments[0].texture;

        if (colorTexture instanceof CanvasSource && colorTexture._gpuContext)
        {
            return colorTexture._gpuContext.getCurrentTexture();
        }

        return this._renderer.texture.getGpuSource(colorTexture);
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
                const colorTexture = colorAttachment.texture;
                const context = (colorTexture instanceof CanvasSource) ? colorTexture._gpuContext : null;

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

                let attachmentIsTransient = false;

                if (gpuRenderTarget.msaaTextures[i])
                {
                    resolveTarget = view;
                    view = this._renderer.texture.getTextureView(
                        gpuRenderTarget.msaaTextures[i]
                    );
                    attachmentIsTransient = gpuRenderTarget.msaaTextures[i].transient;
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
                    // Only discard the MSAA buffer when it was created as transient — i.e. we know
                    // no later pass will try to load it. Non-transient MSAA targets keep storeOp:'store'
                    // so flows like filter pop-back (loadOp:'load' on the parent RT) keep working.
                    storeOp: attachmentIsTransient ? 'discard' : storeOp,
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
            // Mirror the MSAA color attachment's transient flag onto the depth/stencil texture so
            // its store op can discard on single-pass tile-based GPUs (see store-op defaults below).
            renderTarget.depthStencilAttachment.texture.transient
                = !!gpuRenderTarget.msaaTextures[0]?.transient;

            const attachment = renderTarget.depthStencilAttachment;
            const stencil = attachment.texture.format.includes('stencil');
            const depth = attachment.texture.format.includes('depth');
            // Only discard depth/stencil when the attachment is transient — same single-pass
            // constraint as the color attachment. Non-transient MSAA RTs keep 'store' so any
            // pop-back path that loadOp:'load's the buffer sees defined contents.
            const dsStoreOp: GPUStoreOp = attachment.texture.transient ? 'discard' : 'store';

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
                depthStencilAttachment.stencilStoreOp = attachment.stencilStoreOp ?? dsStoreOp;

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
                depthStencilAttachment.depthStoreOp = attachment.depthStoreOp ?? dsStoreOp;

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
            label: renderTarget.label,
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

        // create a context...
        // is a canvas...
        renderTarget.colorAttachments.forEach((colorAttachment, i) =>
        {
            const colorTexture = colorAttachment.texture;

            if (colorTexture instanceof CanvasSource)
            {
                if (!colorTexture._gpuContext)
                {
                    const context = colorTexture.resource.getContext(
                        'webgpu'
                    ) as unknown as GPUCanvasContext;

                    const alphaMode = colorTexture.transparent ? 'premultiplied' : 'opaque';
                    const canvasFormat = getCanvasContextFormat(colorTexture.format);

                    try
                    {
                        context.configure({
                            device: this._renderer.gpu.device,
                            usage: GPUTextureUsage.TEXTURE_BINDING
                                | GPUTextureUsage.COPY_DST
                                | GPUTextureUsage.RENDER_ATTACHMENT
                                | GPUTextureUsage.COPY_SRC,
                            format: canvasFormat,
                            alphaMode,
                            ...(canvasFormat === 'rgba16float'
                                ? { toneMapping: { mode: 'extended' } }
                                : {}),
                        });
                    }
                    catch (e)
                    {
                        console.error(e);
                    }

                    colorTexture._gpuContext = context;
                }

                gpuRenderTarget.contexts[i] = colorTexture._gpuContext;
            }

            gpuRenderTarget.msaa = colorTexture.source.antialias;

            if (colorTexture.antialias)
            {
                // The MSAA buffer inherits the colour TextureSource's `transient` flag.
                // Pixi never auto-sets transient: filter pop-back, additive layering, and
                // any flow that rebinds the parent target mid-frame would issue
                // loadOp:'load' on the MSAA attachment, which is invalid when the texture
                // is transient (and undefined-behaviour when its prior contents were
                // discarded). The user opts in by passing `transient: true` on the
                // RenderTexture's TextureSource only when they know their flow is
                // single-pass.
                const msaaTexture = new TextureSource({
                    width: 0,
                    height: 0,
                    sampleCount: 4,
                    transient: colorTexture.transient,
                    arrayLayerCount: colorTexture.arrayLayerCount,
                    format: colorTexture.format,
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
                renderTarget.depthStencilAttachment.texture.transient
                    = !!gpuRenderTarget.msaaTextures[0]?.transient;
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
