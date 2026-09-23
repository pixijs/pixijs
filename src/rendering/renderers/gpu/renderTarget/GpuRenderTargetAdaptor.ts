import { warn } from '../../../../utils/logging/warn';
import { CLEAR } from '../../gl/const';
import { CanvasSource } from '../../shared/texture/sources/CanvasSource';
import { TextureSource } from '../../shared/texture/sources/TextureSource';
import { GpuMsaaRestore, type GpuMsaaRestoreLayout } from './GpuMsaaRestore';
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

    /** Restores discarded MSAA colour buffers on reopen. Created on first use, per device. */
    private _msaaRestore: GpuMsaaRestore;
    /** the bind groups of the restore in flight, reused between restores */
    private readonly _restoreBindGroups: GPUBindGroup[] = [];

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

    public copyDepthTexture(
        source: RenderTarget,
        destination: Texture,
        originSrc: { x: number; y: number; },
        size: { width: number; height: number; },
        originDest: { x: number; y: number; },
    ): void
    {
        const renderer = this._renderer;

        // a copy cannot be recorded while a render pass holds the shared command encoder —
        // close the pass first (no-op when none is open), matching the GL adaptor
        this.finishRenderPass();

        // depth is just a GPUTexture, so it copies straight into the destination's source
        const srcDepth = source.depthStencilAttachment.texture;

        const srcGpu = renderer.texture.getGpuSource(srcDepth);
        const dstGpu = renderer.texture.getGpuSource(destination.source);

        const standAlone = renderer.encoder.commandEncoder === null;
        const commandEncoder = standAlone
            ? renderer.gpu.device.createCommandEncoder()
            : renderer.encoder.commandEncoder;

        commandEncoder.copyTextureToTexture(
            { texture: srcGpu, origin: originSrc },
            { texture: dstGpu, origin: originDest },
            { width: size.width, height: size.height },
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

        // even a reused pass can change its winding: the same target rebound with the other `flipY`
        // must key its pipelines to the new front face
        this._renderer.pipeline.setRenderTarget(renderTarget);

        if (reuse)
        {
            this._renderer.encoder.setViewport(viewport);

            return;
        }

        const descriptor = this.getDescriptor(renderTarget, clear, clearColor, mipLevel, layer);

        gpuRenderTarget.descriptor = descriptor;

        const encoder = this._renderer.encoder;

        if (gpuRenderTarget.msaaRestore.length)
        {
            // the copy out of the resolved texture has to be recorded between passes
            encoder.endRenderPass();

            this._beginRestoredPass(renderTarget, gpuRenderTarget, encoder.commandEncoder, () =>
            {
                encoder.beginRenderPass(gpuRenderTarget);

                return encoder.renderPassEncoder as GPURenderPassEncoder;
            });
        }
        else
        {
            encoder.beginRenderPass(gpuRenderTarget);
        }

        encoder.setViewport(viewport);

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
     * Begins a pass whose MSAA colour must be restored: copies each resolved texture in `msaaRestore` to
     * scratch, begins the pass, and draws the copies back in before anything else.
     * @param renderTarget - the target being reopened
     * @param gpuRenderTarget - its backend target
     * @param commandEncoder - the encoder to record the copies on, with no pass open
     * @param beginPass - begins the pass on the same encoder
     * @returns the begun pass
     */
    private _beginRestoredPass(
        renderTarget: RenderTarget,
        gpuRenderTarget: GpuRenderTarget,
        commandEncoder: GPUCommandEncoder,
        beginPass: () => GPURenderPassEncoder,
    ): GPURenderPassEncoder
    {
        const device = this._renderer.gpu.device;

        if (this._msaaRestore?.device !== device)
        {
            this._msaaRestore = new GpuMsaaRestore(device);
        }

        const restore = this._msaaRestore;
        const indices = gpuRenderTarget.msaaRestore;
        const bindGroups = this._restoreBindGroups;

        for (let i = 0; i < indices.length; i++)
        {
            const colorTexture = renderTarget.colorAttachments[indices[i]].texture;
            const resolved = colorTexture instanceof CanvasSource && colorTexture._gpuContext
                ? colorTexture._gpuContext.getCurrentTexture()
                : this._renderer.texture.getGpuSource(colorTexture);

            bindGroups[i] = restore.copy(commandEncoder, resolved, indices[i]);
        }

        const pass = beginPass();
        const layout = this._getRestoreLayout(renderTarget, gpuRenderTarget);

        for (let i = 0; i < indices.length; i++)
        {
            restore.draw(pass, layout, indices[i], bindGroups[i]);
        }

        return pass;
    }

    /**
     * The attachment layout the restore pipelines must match, cached on the target and rebuilt only when
     * its depth/stencil format changes (a mask can add stencil to a target mid-frame).
     * @param renderTarget - the target being restored
     * @param gpuRenderTarget - its backend target
     */
    private _getRestoreLayout(renderTarget: RenderTarget, gpuRenderTarget: GpuRenderTarget): GpuMsaaRestoreLayout
    {
        const depthStencilFormat = renderTarget.depthStencilAttachment?.texture.format as GPUTextureFormat;
        let layout = gpuRenderTarget.msaaRestoreLayout;

        if (!layout || layout.depthStencilFormat !== depthStencilFormat)
        {
            const colorFormats = gpuRenderTarget.msaaTextures.map((texture) => texture.format as GPUTextureFormat);

            layout = gpuRenderTarget.msaaRestoreLayout = {
                colorFormats,
                depthStencilFormat,
                key: `${colorFormats.join(',')}|${depthStencilFormat ?? ''}`,
            };
        }

        return layout;
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

        gpuRenderTarget.msaaRestore.length = 0;

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

                const msaa = !!gpuRenderTarget.msaaTextures[i];

                if (msaa)
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

                // MSAA colour is transient: its samples are never stored, only the resolved image is.
                // A pass that would load it clears instead and has the resolved image drawn back in
                // (see GpuMsaaRestore), which is cheaper than storing and loading all four samples.
                const restore = msaa && loadOp !== 'clear';

                if (restore)
                {
                    loadOp = 'clear';
                    gpuRenderTarget.msaaRestore.push(i);
                }

                const baseAttachment: GPURenderPassColorAttachment = {
                    view,
                    resolveTarget,
                    storeOp: msaa ? 'discard' : (colorAttachment.storeOp ?? 'store'),
                    loadOp,
                };

                if (restore)
                {
                    // every pixel is overwritten by the restore draw
                    baseAttachment.clearValue = [0, 0, 0, 0];
                }
                else if (loadOp === 'clear')
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
            // Depth/stencil can't be rebuilt from a resolved image, so it is only discarded when the
            // user marked the colour texture `transient` (single pass, never reopened).
            renderTarget.depthStencilAttachment.texture.transient
                = this._isDepthStencilTransient(renderTarget, gpuRenderTarget);

            const attachment = renderTarget.depthStencilAttachment;
            const stencil = attachment.texture.format.includes('stencil');
            const depth = attachment.texture.format.includes('depth');
            // Only discard depth/stencil when the attachment is transient. Otherwise it keeps 'store' so
            // a reopened pass (filter pop-back, stencil masks) loads defined contents.
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
            const gpuRenderTarget = this._renderTargetSystem.getGpuRenderTarget(renderTarget);
            const beginPass = () => commandEncoder.beginRenderPass(renderPassDescriptor);

            // a partial clear (e.g. depth only) keeps the colour, which for MSAA means restoring it
            const passEncoder = gpuRenderTarget.msaaRestore.length
                ? this._beginRestoredPass(renderTarget, gpuRenderTarget, commandEncoder, beginPass)
                : beginPass();

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
                const context = colorTexture._gpuContext ??= colorTexture.resource.getContext(
                    'webgpu'
                ) as unknown as GPUCanvasContext;

                const alphaMode = colorTexture.transparent ? 'premultiplied' : 'opaque';
                const canvasFormat = getCanvasContextFormat(colorTexture.format);

                // configured every time, as a device replaced after a loss needs it configured again
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

                gpuRenderTarget.contexts[i] = context;
            }

            gpuRenderTarget.msaa = colorTexture.source.antialias;

            if (colorTexture.antialias)
            {
                // MSAA colour is always transient: every pass clears it and discards it, and a pass that
                // reopens the target restores it from the resolved texture (see getDescriptor).
                const msaaTexture = new TextureSource({
                    width: 0,
                    height: 0,
                    sampleCount: 4,
                    // WebGPU requires multisampled textures to have exactly 1 mip level, so this must never
                    // inherit TextureSource.defaultOptions.autoGenerateMipmaps
                    autoGenerateMipmaps: false,
                    transient: true,
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
                = this._isDepthStencilTransient(renderTarget, gpuRenderTarget);
            }
        }

        return gpuRenderTarget;
    }

    /**
     * The user's `transient` flag on the colour texture still means "single pass, never reopened",
     * which lets MSAA depth/stencil be discarded too.
     * @param renderTarget - the target to check
     * @param gpuRenderTarget - its backend target
     */
    private _isDepthStencilTransient(renderTarget: RenderTarget, gpuRenderTarget: GpuRenderTarget): boolean
    {
        return gpuRenderTarget.msaa && !!renderTarget.colorAttachments[0]?.texture.transient;
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
