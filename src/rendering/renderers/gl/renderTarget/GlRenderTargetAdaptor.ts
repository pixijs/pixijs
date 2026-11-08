import { Rectangle } from '../../../../maths/shapes/Rectangle';
import { warn } from '../../../../utils/logging/warn';
import { CanvasSource } from '../../shared/texture/sources/CanvasSource';
import { isIntegerFormat } from '../../shared/texture/utils/isIntegerFormat';
import { CLEAR } from '../const';
import { GlRenderTarget } from '../GlRenderTarget';

import type { RgbaArray } from '../../../../color/Color';
import type { RenderTarget } from '../../shared/renderTarget/RenderTarget';
import type { RenderTargetAdaptor, RenderTargetSystem } from '../../shared/renderTarget/RenderTargetSystem';
import type { Texture } from '../../shared/texture/Texture';
import type { CLEAR_OR_BOOL } from '../const';
import type { GlProgram } from '../shader/GlProgram';
import type { WebGLRenderer } from '../WebGLRenderer';

/**
 * The WebGL adaptor for the render target system. Allows the Render Target System to be used with the WebGL renderer
 * @category rendering
 * @ignore
 */
export class GlRenderTargetAdaptor implements RenderTargetAdaptor<GlRenderTarget>
{
    private _renderTargetSystem: RenderTargetSystem<GlRenderTarget>;
    private _renderer: WebGLRenderer<HTMLCanvasElement>;
    private _clearColorCache: RgbaArray = [0, 0, 0, 0];
    private _viewPortCache: Rectangle = new Rectangle();
    /**
     * The lists `gl.drawBuffers` takes, cached by which attachments are on (a bit each: 0b101 =
     * attachments 0 and 2 on, 1 off), so switching never allocates
     */
    private _drawBuffersCache: number[][];
    /**
     * The framebuffer currently bound to `gl.FRAMEBUFFER`, used to skip a redundant `bindFramebuffer`
     * when re-binding the same target. `undefined` means "unknown" (force a real bind). All framebuffer
     * binding must go through {@link bindFramebuffer} to keep this coherent; {@link resetState} marks
     * it unknown when external GL code may have changed the binding.
     */
    private _boundFramebuffer: WebGLFramebuffer | null | undefined = undefined;
    /**
     * Whether the canvas's own framebuffer is multisampled: the browser antialiases it when the context
     * was created with `antialias`, which a root target's `msaa` flag (Pixi's own MSAA) doesn't cover.
     */
    private _canvasMultisampled = false;
    /** scratch clear values for integer attachments (see _clearEachAttachment) */
    private readonly _clearUint = new Uint32Array(4);
    private readonly _clearInt = new Int32Array(4);

    public init(renderer: WebGLRenderer, renderTargetSystem: RenderTargetSystem<GlRenderTarget>): void
    {
        this._renderer = renderer;
        this._renderTargetSystem = renderTargetSystem;

        renderer.runners.contextChange.add(this);
    }

    public contextChange(): void
    {
        this._clearColorCache = [0, 0, 0, 0];
        this._viewPortCache = new Rectangle();
        this._boundFramebuffer = undefined;

        const gl = this._renderer.gl;

        this._canvasMultisampled = !!gl.getContextAttributes()?.antialias;

        this._drawBuffersCache = [];
    }

    public copyToTexture(
        sourceRenderSurfaceTexture: RenderTarget,
        destinationTexture: Texture,
        originSrc: { x: number; y: number; },
        size: { width: number; height: number; },
        originDest: { x: number; y: number; },
    )
    {
        const renderTargetSystem = this._renderTargetSystem;

        const renderer = this._renderer;
        const glRenderTarget = renderTargetSystem.getGpuRenderTarget(sourceRenderSurfaceTexture);
        const gl = renderer.gl;

        this.finishRenderPass(sourceRenderSurfaceTexture);

        gl.bindFramebuffer(gl.FRAMEBUFFER, glRenderTarget.resolveTargetFramebuffer);
        this._boundFramebuffer = glRenderTarget.resolveTargetFramebuffer;

        renderer.texture.bind(destinationTexture, 0);

        gl.copyTexSubImage2D(gl.TEXTURE_2D, 0,
            originDest.x, originDest.y,
            originSrc.x,
            originSrc.y,
            size.width,
            size.height
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
        const renderTargetSystem = this._renderTargetSystem;
        const gl = this._renderer.gl;

        this.finishRenderPass(source);

        // blitFramebuffer moves depth between framebuffers, so the destination texture is
        // resolved to its (depth-only) render target to provide one to blit into
        const destinationRenderTarget = renderTargetSystem.getRenderTarget(destination);

        const srcGl = renderTargetSystem.getGpuRenderTarget(source);
        const dstGl = renderTargetSystem.getGpuRenderTarget(destinationRenderTarget);

        let readFramebuffer = srcGl.framebuffer;
        const multisampled = srcGl.msaa || (source.isRoot && this._canvasMultisampled);

        // a blit that resolves samples can't move them, so an offset copy from a multisampled target first
        // resolves in place into the target's depth texture, then copies from there. An MSAA target leaves that
        // texture unused, and so does the canvas, whose depth lives in the browser's own buffer; the canvas has
        // no resolve framebuffer of its own, so it gets one here.
        if (multisampled && (originSrc.x !== originDest.x || originSrc.y !== originDest.y))
        {
            srcGl.resolveTargetFramebuffer ??= gl.createFramebuffer();

            gl.bindFramebuffer(gl.FRAMEBUFFER, srcGl.resolveTargetFramebuffer);
            this._attachDepthStencilTexture(source, 0, 0);

            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, srcGl.framebuffer);
            gl.blitFramebuffer(
                originSrc.x, originSrc.y, originSrc.x + size.width, originSrc.y + size.height,
                originSrc.x, originSrc.y, originSrc.x + size.width, originSrc.y + size.height,
                gl.DEPTH_BUFFER_BIT, gl.NEAREST,
            );

            readFramebuffer = srcGl.resolveTargetFramebuffer;
        }

        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, readFramebuffer);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dstGl.framebuffer);
        // READ/DRAW were bound independently, leaving the unified FRAMEBUFFER state ambiguous
        this._boundFramebuffer = undefined;

        // Depth blits must use NEAREST, so the source sub-rect must match the destination
        // sub-rect in size (no scaling). We copy `size` pixels from originSrc to originDest.
        gl.blitFramebuffer(
            originSrc.x, originSrc.y, originSrc.x + size.width, originSrc.y + size.height,
            originDest.x, originDest.y, originDest.x + size.width, originDest.y + size.height,
            gl.DEPTH_BUFFER_BIT, gl.NEAREST,
        );
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

        // validation..
        if (layer !== 0 && this._renderer.context.webGLVersion < 2)
        {
            throw new Error('[RenderTargetSystem] Rendering to array layers requires WebGL2.');
        }

        if (mipLevel > 0)
        {
            if (gpuRenderTarget.msaa)
            {
                throw new Error('[RenderTargetSystem] Rendering to mip levels is not supported with MSAA render targets.');
            }

            if (this._renderer.context.webGLVersion < 2)
            {
                throw new Error('[RenderTargetSystem] Rendering to mip levels requires WebGL2.');
            }
        }

        // do the work..

        renderTarget.colorAttachments.forEach((attachment) =>
        {
            this._renderer.texture.unbind(attachment.texture);
        });

        const gl = this._renderer.gl;

        // Skip a redundant glBindFramebuffer when this FBO is already bound (idempotent bind).
        // The attachment (mip/layer) and viewport caches below still re-run their own "math".
        this.bindFramebuffer(gpuRenderTarget.framebuffer);

        if (
            !renderTarget.isRoot
            && renderTarget.colorAttachments.length > 0
            && (gpuRenderTarget._attachedMipLevel !== mipLevel
                || gpuRenderTarget._attachedLayer !== layer)
        )
        {
            renderTarget.colorAttachments.forEach((attachment, i) =>
            {
                const colorTexture = attachment.texture;
                const glSource = this._renderer.texture.getGlSource(colorTexture);

                if (glSource.target === gl.TEXTURE_2D)
                {
                    if (layer !== 0)
                    {
                        throw new Error('[RenderTargetSystem] layer must be 0 when rendering to 2D textures in WebGL.');
                    }

                    gl.framebufferTexture2D(
                        gl.FRAMEBUFFER,
                        gl.COLOR_ATTACHMENT0 + i,
                        gl.TEXTURE_2D,
                        glSource.texture,
                        mipLevel
                    );
                }
                else if (glSource.target === gl.TEXTURE_2D_ARRAY || glSource.target === gl.TEXTURE_3D)
                {
                    gl.framebufferTextureLayer(
                        gl.FRAMEBUFFER,
                        gl.COLOR_ATTACHMENT0 + i,
                        glSource.texture,
                        mipLevel,
                        layer
                    );
                }
                else if (glSource.target === gl.TEXTURE_CUBE_MAP)
                {
                    if (layer < 0 || layer > 5)
                    {
                        throw new Error('[RenderTargetSystem] Cube map layer must be between 0 and 5.');
                    }

                    gl.framebufferTexture2D(
                        gl.FRAMEBUFFER,
                        gl.COLOR_ATTACHMENT0 + i,
                        gl.TEXTURE_CUBE_MAP_POSITIVE_X + layer,
                        glSource.texture,
                        mipLevel
                    );
                }
                else
                {
                    throw new Error('[RenderTargetSystem] Unsupported texture target for render-to-layer in WebGL.');
                }
            });

            gpuRenderTarget._attachedMipLevel = mipLevel;
            gpuRenderTarget._attachedLayer = layer;
        }

        // the root target renders to the canvas, whose context owns its depth/stencil buffers
        if (gpuRenderTarget.framebuffer)
        {
            if (renderTarget.depthStencilAttachment)
            {
                // WebGL textures can't be multisampled, so an MSAA target draws into the samples the texture
                // keeps in a renderbuffer instead
                if (gpuRenderTarget.msaa)
                {
                    this._attachMsaaDepthStencil(renderTarget, gpuRenderTarget);
                }
                else
                {
                    this._attachDepthStencilTexture(renderTarget, mipLevel, layer);
                }
            }
            // depth/stencil requested without an explicit texture — a renderbuffer is cheaper
            // and (unlike a texture) can be multisampled to match an MSAA color attachment
            else if (!gpuRenderTarget.depthStencilRenderBuffer && (renderTarget.stencil || renderTarget.depth))
            {
                this._initStencil(gpuRenderTarget);
            }
        }

        const colorCount = renderTarget.colorAttachments.length;

        // multiple render targets (MRT): a framebuffer starts with only attachment 0 switched on, so
        // switch them all on the first time. After that, clear() switches them all on for a clear,
        // and the bound program switches on only what it writes (below)
        if (colorCount > 1 && gpuRenderTarget._drawBuffersMask === -1)
        {
            this._setDrawBuffers(renderTarget, (1 << colorCount) - 1);
        }

        let viewPortY = viewport.y;

        if (renderTarget.isRoot)
        {
            viewPortY = renderTarget.pixelHeight - viewport.height - viewport.y;
        }

        const viewPortCache = this._viewPortCache;

        if (viewPortCache.x !== viewport.x
            || viewPortCache.y !== viewPortY
            || viewPortCache.width !== viewport.width
            || viewPortCache.height !== viewport.height)
        {
            viewPortCache.x = viewport.x;
            viewPortCache.y = viewPortY;
            viewPortCache.width = viewport.width;
            viewPortCache.height = viewport.height;

            gl.viewport(
                viewport.x,
                viewPortY,
                viewport.width,
                viewport.height,
            );
        }

        this.clear(renderTarget, clear, clearColor);

        // switch on only what the bound program writes; a program bound later does the same
        // through GlShaderSystem
        const activeProgram = this._renderer.shader._activeProgram;

        if (colorCount > 1 && activeProgram)
        {
            this.setFragmentOutputs(activeProgram);
        }
    }

    /**
     * On a target with several color attachments, switches on only the attachments the program has a
     * fragment output for. GLES leaves an attachment undefined when it's switched on but the shader
     * doesn't write it, so a color-only draw would otherwise overwrite every other attachment.
     * WebGL1 keeps every attachment on, as it always has.
     *
     * Takes the program rather than its outputs so they're only read (and parsed, on first use)
     * for a target that has several attachments.
     * @param program - the bound program; outputs it couldn't read switch every attachment on
     * @internal
     */
    public setFragmentOutputs(program: GlProgram): void
    {
        const renderTarget = this._renderTargetSystem.renderTarget;
        const count = renderTarget?.colorAttachments.length ?? 0;

        if (count < 2 || this._renderer.context.webGLVersion === 1) return;

        const all = (1 << count) - 1;

        // outputs that couldn't be read switch every attachment on
        this._setDrawBuffers(renderTarget, (program.fragmentOutputMask ?? all) & all);
    }

    /**
     * Sets which color attachments are switched on: exactly those in `mask` (one bit each: 0b101 = 0 and 2),
     * and records the setting on the target, so a call that changes nothing makes no GL call.
     *
     * Draw buffers belong to a framebuffer and can only be set while it's bound, so a target that
     * isn't bound is left alone; its next pass sets it. Single-attachment targets are never touched.
     * @param renderTarget - the target whose attachments to switch
     * @param mask - the attachments to switch on
     */
    private _setDrawBuffers(renderTarget: RenderTarget, mask: number): void
    {
        if (renderTarget.colorAttachments.length < 2) return;

        const glRenderTarget = this._renderTargetSystem.getGpuRenderTarget(renderTarget);

        if (glRenderTarget.framebuffer !== this._boundFramebuffer) return;
        if (glRenderTarget._drawBuffersMask === mask) return;

        glRenderTarget._drawBuffersMask = mask;

        const buffers = this._getDrawBuffers(mask);

        if (this._renderer.context.webGLVersion === 1)
        {
            const ext = this._renderer.context.extensions.drawBuffers;

            if (!ext)
            {
                warn('[RenderTexture] This WebGL1 context does not support rendering to multiple targets');
            }
            else
            {
                ext.drawBuffersWEBGL(buffers);
            }
        }
        else
        {
            (this._renderer.gl as WebGL2RenderingContext).drawBuffers(buffers);
        }
    }

    /**
     * The `gl.drawBuffers` list for a mask. It runs only up to the last attachment that's on: GL
     * switches off every draw buffer past the end of the list, so the same list serves a target with
     * any number of attachments. A mask of 0 (a shader with no color output) is `[NONE]`.
     * @param mask - the attachments to enable, one bit each
     * @returns the cached list
     */
    private _getDrawBuffers(mask: number): number[]
    {
        let buffers = this._drawBuffersCache[mask];

        if (!buffers)
        {
            const gl = this._renderer.gl as WebGL2RenderingContext;

            buffers = this._drawBuffersCache[mask] = [];

            for (let i = 0; (mask >> i) > 0; i++)
            {
                buffers[i] = (mask & (1 << i)) ? gl.COLOR_ATTACHMENT0 + i : gl.NONE;
            }

            if (buffers.length === 0) buffers[0] = gl.NONE;
        }

        return buffers;
    }

    public finishRenderPass(renderTarget?: RenderTarget)
    {
        const renderTargetSystem = this._renderTargetSystem;

        const glRenderTarget = renderTargetSystem.getGpuRenderTarget(renderTarget);

        // Depth-only targets have no color buffer to resolve
        if (!glRenderTarget.msaa || renderTarget.colorAttachments.length === 0) return;

        const gl = this._renderer.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, glRenderTarget.resolveTargetFramebuffer);
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, glRenderTarget.framebuffer);

        const count = renderTarget.colorAttachments.length;

        if (count === 1)
        {
            gl.blitFramebuffer(
                0, 0, glRenderTarget.width, glRenderTarget.height,
                0, 0, glRenderTarget.width, glRenderTarget.height,
                gl.COLOR_BUFFER_BIT, gl.NEAREST,
            );
        }
        else
        {
            // a blit reads one buffer (readBuffer) and writes every enabled draw buffer, so each
            // attachment resolves on its own: read attachment i, enable only attachment i
            for (let i = 0; i < count; i++)
            {
                gl.readBuffer(gl.COLOR_ATTACHMENT0 + i);
                gl.drawBuffers(this._getDrawBuffers(1 << i));
                gl.blitFramebuffer(
                    0, 0, glRenderTarget.width, glRenderTarget.height,
                    0, 0, glRenderTarget.width, glRenderTarget.height,
                    gl.COLOR_BUFFER_BIT, gl.NEAREST,
                );
            }

            // back to the defaults: the multisampled framebuffer reads attachment 0, and the resolve
            // framebuffer draws to attachment 0, as they did before the loop
            gl.readBuffer(gl.COLOR_ATTACHMENT0);
            gl.drawBuffers(this._getDrawBuffers(1));
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, glRenderTarget.framebuffer);
        // we explicitly drove FRAMEBUFFER (both read+draw) back to the multisample framebuffer
        this._boundFramebuffer = glRenderTarget.framebuffer;
    }

    public initGpuRenderTarget(renderTarget: RenderTarget): GlRenderTarget
    {
        const renderer = this._renderer;

        const gl = renderer.gl;

        const glRenderTarget = new GlRenderTarget();

        glRenderTarget._attachedMipLevel = 0;
        glRenderTarget._attachedLayer = 0;

        const colorTexture = renderTarget.colorTexture;

        if (colorTexture instanceof CanvasSource)
        {
            this._renderer.context.ensureCanvasSize(colorTexture.resource);

            glRenderTarget.framebuffer = null;

            return glRenderTarget;
        }

        glRenderTarget.width = renderTarget.pixelWidth;
        glRenderTarget.height = renderTarget.pixelHeight;

        if (renderTarget.colorAttachments.length === 0)
        {
            this._initDepth(renderTarget, glRenderTarget);
        }
        else
        {
            this._initColor(renderTarget, glRenderTarget);
        }

        if (renderTarget.depthStencilAttachment && !glRenderTarget.msaa)
        {
            this._attachDepthStencilTexture(renderTarget, 0, 0);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // init drove the binding through several raw framebuffers and ended on the default one
        this._boundFramebuffer = null;

        return glRenderTarget;
    }

    public destroyGpuRenderTarget(gpuRenderTarget: GlRenderTarget)
    {
        const gl = this._renderer.gl;

        if (gpuRenderTarget.framebuffer)
        {
            gl.deleteFramebuffer(gpuRenderTarget.framebuffer);
            gpuRenderTarget.framebuffer = null;
        }

        if (gpuRenderTarget.resolveTargetFramebuffer)
        {
            gl.deleteFramebuffer(gpuRenderTarget.resolveTargetFramebuffer);
            gpuRenderTarget.resolveTargetFramebuffer = null;
        }

        // the multisampled colour and depth/stencil texture renderbuffers belong to the textures
        if (gpuRenderTarget.depthStencilRenderBuffer)
        {
            gl.deleteRenderbuffer(gpuRenderTarget.depthStencilRenderBuffer);
            gpuRenderTarget.depthStencilRenderBuffer = null;
        }
    }

    /**
     * Clears the target, when a pass opens and on an explicit `clear()`. `clear` decides whether color
     * clears, and a color attachment whose own `loadOp` is `'load'` keeps its contents anyway. WebGL1
     * clears all or none.
     * @param renderTarget - the target to clear
     * @param clear - what to clear
     * @param clearColor - the colour for attachments without a `clearValue`
     * @param _viewport - unused on WebGL
     * @param _mipLevel - unused on WebGL
     * @param layer - must be 0 on WebGL
     */
    public clear(
        renderTarget: RenderTarget,
        clear: CLEAR_OR_BOOL,
        clearColor?: RgbaArray,
        _viewport?: Rectangle,
        _mipLevel = 0,
        layer = 0
    )
    {
        if (layer !== 0)
        {
            throw new Error('[RenderTargetSystem] Clearing array layers is not supported in WebGL renderer.');
        }

        if (typeof clear === 'boolean')
        {
            clear = clear ? CLEAR.ALL : CLEAR.NONE;
        }

        // which attachments clear, one bit each; none on a depth-only target
        const attachments = renderTarget.colorAttachments;
        let colorMask = 0;

        if (clear & CLEAR.COLOR)
        {
            for (let i = 0; i < attachments.length; i++)
            {
                if (attachments[i].loadOp !== 'load') colorMask |= 1 << i;
            }
        }

        if (!colorMask) clear &= ~CLEAR.COLOR;

        if (!clear) return;

        const gl = this._renderer.gl;

        // gl.clear's depth write is masked by gl.depthMask, which 2D rendering
        // (State.for2d) leaves disabled — force it on for the clear, then restore
        const forceDepthMask = !!(clear & CLEAR.DEPTH) && !this._renderer.state.depthMaskEnabled;

        if (forceDepthMask) gl.depthMask(true);

        if (clear & CLEAR.COLOR)
        {
            const glRenderTarget = this._renderTargetSystem.getGpuRenderTarget(renderTarget);

            // gl.clear knows one colour, clears every attachment, and rejects an integer one outright, so it
            // only serves a target with one non-integer attachment. Anything else clears each attachment on
            // its own, to its own value, with the clearBuffer call its format takes. WebGL2 only: WebGL1 has
            // no clearBuffer, so it clears all or none. clearBuffer* reaches the bound framebuffer, so only
            // while this target is the bound one
            const eachAlone = this._renderer.context.webGLVersion === 2
                && (attachments.length > 1 || isIntegerFormat(attachments[0].texture.format));

            if (eachAlone && glRenderTarget.framebuffer === this._boundFramebuffer)
            {
                // a draw may have switched some attachments off: all on for the clear, then back
                const previousMask = glRenderTarget._drawBuffersMask;

                this._setDrawBuffers(renderTarget, (1 << attachments.length) - 1);
                this._clearEachAttachment(renderTarget, colorMask, clearColor);
                if (previousMask !== -1) this._setDrawBuffers(renderTarget, previousMask);

                clear &= ~CLEAR.COLOR;
            }
            else
            {
                const color = attachments[0].clearValue ?? clearColor ?? this._renderTargetSystem.defaultClearColor;
                const cache = this._clearColorCache;

                if (cache[0] !== color[0] || cache[1] !== color[1] || cache[2] !== color[2] || cache[3] !== color[3])
                {
                    cache[0] = color[0];
                    cache[1] = color[1];
                    cache[2] = color[2];
                    cache[3] = color[3];

                    gl.clearColor(color[0], color[1], color[2], color[3]);
                }
            }
        }

        if (clear) gl.clear(clear);

        if (forceDepthMask) gl.depthMask(false);
    }

    /**
     * Clears the color attachments in `mask` (one bit each), each to its own `clearValue` or to
     * `clearColor` where it has none, with the `clearBuffer` call that matches its format. Integer
     * attachments take the numbers as integers, as WebGPU converts them.
     * @param renderTarget - the target to clear; its attachments are all switched on
     * @param mask - the attachments to clear
     * @param clearColor - the colour for attachments without a `clearValue`
     */
    private _clearEachAttachment(renderTarget: RenderTarget, mask: number, clearColor?: RgbaArray): void
    {
        const gl = this._renderer.gl as WebGL2RenderingContext;
        const attachments = renderTarget.colorAttachments;
        const fallback = clearColor ?? this._renderTargetSystem.defaultClearColor;

        for (let i = 0; i < attachments.length; i++)
        {
            if (!(mask & (1 << i))) continue;

            const format = attachments[i].texture.format;
            const color = attachments[i].clearValue ?? fallback;

            if (format.endsWith('uint'))
            {
                this._clearUint.set(color);
                gl.clearBufferuiv(gl.COLOR, i, this._clearUint);
            }
            else if (format.endsWith('sint'))
            {
                this._clearInt.set(color);
                gl.clearBufferiv(gl.COLOR, i, this._clearInt);
            }
            else
            {
                gl.clearBufferfv(gl.COLOR, i, color);
            }
        }
    }

    public resizeGpuRenderTarget(renderTarget: RenderTarget)
    {
        if (renderTarget.isRoot) return;

        const glRenderTarget = this._renderTargetSystem.getGpuRenderTarget(renderTarget);

        glRenderTarget.width = renderTarget.pixelWidth;
        glRenderTarget.height = renderTarget.pixelHeight;

        if (renderTarget.colorAttachments.length > 0)
        {
            this._resizeColor(renderTarget, glRenderTarget);
        }

        if (glRenderTarget.depthStencilRenderBuffer)
        {
            this._resizeStencil(glRenderTarget);
        }

        // _resizeColor (MSAA) rebinds framebuffers; force the next startRenderPass to bind explicitly
        this._boundFramebuffer = undefined;
    }

    private _initColor(renderTarget: RenderTarget, glRenderTarget: GlRenderTarget)
    {
        const renderer = this._renderer;

        const gl = renderer.gl;
        // deal with our outputs..
        const resolveTargetFramebuffer = gl.createFramebuffer();

        glRenderTarget.resolveTargetFramebuffer = resolveTargetFramebuffer;

        // set up the texture..
        gl.bindFramebuffer(gl.FRAMEBUFFER, resolveTargetFramebuffer);

        const colorAttachments = renderTarget.colorAttachments;

        colorAttachments.forEach((colorAttachment, i) =>
        {
            const source = colorAttachment.texture;

            if (source.antialias)
            {
                if (renderer.context.supports.msaa)
                {
                    glRenderTarget.msaa = true;
                }
                else
                {
                    warn('[RenderTexture] Antialiasing on textures is not supported in WebGL1');
                }
            }

            // TODO bindSource could return the glTexture
            renderer.texture.bindSource(source, 0);
            const glSource = renderer.texture.getGlSource(source);

            const glTexture = glSource.texture;

            // Initial attachment is mip 0, layer 0.
            if (glSource.target === gl.TEXTURE_2D)
            {
                gl.framebufferTexture2D(
                    gl.FRAMEBUFFER,
                    gl.COLOR_ATTACHMENT0 + i,
                    gl.TEXTURE_2D,
                    glTexture,
                    0
                );
            }
            else if (glSource.target === gl.TEXTURE_2D_ARRAY || glSource.target === gl.TEXTURE_3D)
            {
                gl.framebufferTextureLayer(
                    gl.FRAMEBUFFER,
                    gl.COLOR_ATTACHMENT0 + i,
                    glTexture,
                    0,
                    0
                );
            }
            else if (glSource.target === gl.TEXTURE_CUBE_MAP)
            {
                gl.framebufferTexture2D(
                    gl.FRAMEBUFFER,
                    gl.COLOR_ATTACHMENT0 + i,
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                    glTexture,
                    0
                );
            }
            else
            {
                throw new Error('[RenderTargetSystem] Unsupported texture target for framebuffer attachment.');
            }
        });

        if (glRenderTarget.msaa)
        {
            glRenderTarget.framebuffer = gl.createFramebuffer();
        }
        else
        {
            glRenderTarget.framebuffer = resolveTargetFramebuffer;
        }

        this._resizeColor(renderTarget, glRenderTarget);
    }

    private _initDepth(_renderTarget: RenderTarget, glRenderTarget: GlRenderTarget)
    {
        const renderer = this._renderer;

        if (renderer.context.webGLVersion < 2)
        {
            throw new Error('[RenderTargetSystem] Depth-only render targets require WebGL2.');
        }

        const gl = renderer.gl;
        const framebuffer = gl.createFramebuffer();

        glRenderTarget.resolveTargetFramebuffer = framebuffer;
        glRenderTarget.framebuffer = framebuffer;

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        gl.drawBuffers([gl.NONE]);
        gl.readBuffer(gl.NONE);
    }

    private _resizeColor(renderTarget: RenderTarget, glRenderTarget: GlRenderTarget)
    {
        const source = renderTarget.colorAttachments[0].texture;

        // After a resize, attachments are implicitly at mip 0 again (and non-zero mip allocations may have changed).
        // Force a re-attach on next mip render.
        glRenderTarget._attachedMipLevel = 0;
        glRenderTarget._attachedLayer = 0;

        renderTarget.colorAttachments.forEach((colorAttachment, i) =>
        {
            // no need to resize the first texture..
            if (i === 0) return;

            colorAttachment.texture.resize(source.width, source.height, source._resolution);
        });

        if (glRenderTarget.msaa)
        {
            const renderer = this._renderer;
            const gl = renderer.gl;

            gl.bindFramebuffer(gl.FRAMEBUFFER, glRenderTarget.framebuffer);

            // each colour texture keeps its samples in a renderbuffer shared by every target over it. The other
            // targets meet a resize after the first, so getting it here only allocates storage for the first
            renderTarget.colorAttachments.forEach((colorAttachment, i) =>
            {
                gl.framebufferRenderbuffer(
                    gl.FRAMEBUFFER,
                    gl.COLOR_ATTACHMENT0 + i,
                    gl.RENDERBUFFER,
                    renderer.texture.getMsaaRenderBuffer(colorAttachment.texture)
                );
            });
        }
    }

    /**
     * Attaches the samples of an MSAA target's depth/stencil texture to its framebuffer, which is bound. They
     * are kept in a renderbuffer with the texture (see GlTextureSystem.getMsaaRenderBuffer), so every MSAA
     * target over the texture tests and writes the same depth. Runs every pass: getting the renderbuffer marks
     * the texture used, which nothing else does as the target never binds it, so the GC can't unload samples
     * in use; and it follows the texture's size, reallocating the storage after a resize.
     * @param renderTarget - the target, which has a depth/stencil texture
     * @param glRenderTarget - its backend target
     */
    private _attachMsaaDepthStencil(renderTarget: RenderTarget, glRenderTarget: GlRenderTarget): void
    {
        const gl = this._renderer.gl;
        const textures = this._renderer.texture;
        const source = renderTarget.depthStencilAttachment.texture;
        const ownRenderBuffer = glRenderTarget.depthStencilRenderBuffer;

        // drawn to with only the depth or stencil flag before the texture was added
        // (RenderTarget.ensureDepthStencilTexture), so it has a renderbuffer of its own
        if (ownRenderBuffer)
        {
            const glTexture = textures.getGlSource(source);

            // when no other target has drawn to the texture yet, the target's own renderbuffer becomes the
            // texture's, which keeps the depth and stencil already drawn. It stays attached where it is, as
            // both are depth/stencil. ensureDepthStencilTexture always matches the format; only an attachment
            // assigned by hand can differ
            if (!glTexture.msaaRenderBuffer && glTexture.internalFormat === gl.DEPTH24_STENCIL8)
            {
                glTexture.msaaRenderBuffer = ownRenderBuffer;
                glTexture.msaaWidth = glRenderTarget.width;
                glTexture.msaaHeight = glRenderTarget.height;
                glRenderTarget._attachedDepthStencilRenderBuffer = ownRenderBuffer;
            }
            else
            {
                // deleting it while its framebuffer is bound detaches it
                gl.deleteRenderbuffer(ownRenderBuffer);
            }

            glRenderTarget.depthStencilRenderBuffer = null;
        }

        const renderBuffer = textures.getMsaaRenderBuffer(source);

        // a resize reallocates the storage of the same renderbuffer, which stays attached; it is only a new one
        // after the texture's GL texture was unloaded and made again
        if (glRenderTarget._attachedDepthStencilRenderBuffer !== renderBuffer)
        {
            glRenderTarget._attachedDepthStencilRenderBuffer = renderBuffer;

            gl.framebufferRenderbuffer(
                gl.FRAMEBUFFER,
                this._getDepthStencilAttachmentPoint(renderTarget),
                gl.RENDERBUFFER,
                renderBuffer
            );
        }
    }

    private _attachDepthStencilTexture(
        renderTarget: RenderTarget,
        mipLevel: number,
        layer: number
    )
    {
        const renderer = this._renderer;
        const gl = renderer.gl;
        const source = renderTarget.depthStencilAttachment.texture;

        const glSource = renderer.texture.getGlSource(source);
        const glTexture = glSource.texture;
        const attachment = this._getDepthStencilAttachmentPoint(renderTarget);

        if (glSource.target === gl.TEXTURE_2D)
        {
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                attachment,
                gl.TEXTURE_2D,
                glTexture,
                mipLevel
            );
        }
        else if (glSource.target === gl.TEXTURE_2D_ARRAY || glSource.target === gl.TEXTURE_3D)
        {
            gl.framebufferTextureLayer(
                gl.FRAMEBUFFER,
                attachment,
                glTexture,
                mipLevel,
                layer
            );
        }
        else if (glSource.target === gl.TEXTURE_CUBE_MAP)
        {
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                attachment,
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + layer,
                glTexture,
                mipLevel
            );
        }
    }

    /**
     * The framebuffer attachment point for a target's depth/stencil buffer. It must match the
     * buffer's aspects, or the framebuffer is incomplete.
     * @param renderTarget - the target whose depth/stencil buffer is being attached
     */
    private _getDepthStencilAttachmentPoint(renderTarget: RenderTarget): number
    {
        const gl = this._renderer.gl;
        const format = renderTarget.depthStencilAttachment.texture.format;

        if (format === 'depth24plus-stencil8' || format === 'depth32float-stencil8')
        {
            return gl.DEPTH_STENCIL_ATTACHMENT;
        }

        if (format === 'stencil8')
        {
            return gl.STENCIL_ATTACHMENT;
        }

        return gl.DEPTH_ATTACHMENT;
    }

    private _initStencil(glRenderTarget: GlRenderTarget)
    {
        // this already exists on the default screen
        if (glRenderTarget.framebuffer === null) return;

        const gl = this._renderer.gl;

        const depthStencilRenderBuffer = gl.createRenderbuffer();

        glRenderTarget.depthStencilRenderBuffer = depthStencilRenderBuffer;

        gl.bindRenderbuffer(
            gl.RENDERBUFFER,
            depthStencilRenderBuffer
        );

        gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.DEPTH_STENCIL_ATTACHMENT,
            gl.RENDERBUFFER,
            depthStencilRenderBuffer
        );

        // TODO
        this._resizeStencil(glRenderTarget);
    }

    private _resizeStencil(glRenderTarget: GlRenderTarget)
    {
        const gl = this._renderer.gl;

        gl.bindRenderbuffer(
            gl.RENDERBUFFER,
            glRenderTarget.depthStencilRenderBuffer
        );

        if (glRenderTarget.msaa)
        {
            gl.renderbufferStorageMultisample(
                gl.RENDERBUFFER,
                4,
                gl.DEPTH24_STENCIL8,
                glRenderTarget.width,
                glRenderTarget.height
            );
        }
        else
        {
            gl.renderbufferStorage(
                gl.RENDERBUFFER,
                this._renderer.context.webGLVersion === 2
                    ? gl.DEPTH24_STENCIL8
                    : gl.DEPTH_STENCIL,
                glRenderTarget.width,
                glRenderTarget.height
            );
        }
    }

    public prerender(renderTarget: RenderTarget)
    {
        if (renderTarget.colorAttachments.length === 0) return;

        const resource = renderTarget.colorAttachments[0].texture.resource;

        if (this._renderer.context.multiView && CanvasSource.test(resource))
        {
            this._renderer.context.ensureCanvasSize(resource);
        }
    }

    public postrender(renderTarget: RenderTarget)
    {
        if (!this._renderer.context.multiView || renderTarget.colorAttachments.length === 0) return;

        const colorTexture = renderTarget.colorAttachments[0].texture;

        if (CanvasSource.test(colorTexture.resource))
        {
            const contextCanvas = this._renderer.context.canvas;
            const canvasSource = colorTexture as unknown as CanvasSource;

            canvasSource.context2D.drawImage(
                contextCanvas as CanvasImageSource,
                0, canvasSource.pixelHeight - contextCanvas.height
            );
        }
    }

    /**
     * Forget the GL-call caches (framebuffer binding, viewport, clear color) so the next pass
     * re-applies them. Called via the renderer's `resetState` runner when external GL code may
     * have changed state behind our back.
     */
    public resetState(): void
    {
        this._boundFramebuffer = undefined;
        this._viewPortCache = new Rectangle();
        this._clearColorCache = [0, 0, 0, 0];
    }

    /**
     * Binds a framebuffer to `gl.FRAMEBUFFER`, skipping the call when it is already bound.
     * The single blessed way to bind a framebuffer — keeps {@link _boundFramebuffer} coherent.
     * @param framebuffer - the framebuffer to bind
     * @internal
     */
    public bindFramebuffer(framebuffer: WebGLFramebuffer | null): void
    {
        if (this._boundFramebuffer === framebuffer) return;

        this._boundFramebuffer = framebuffer;
        this._renderer.gl.bindFramebuffer(this._renderer.gl.FRAMEBUFFER, framebuffer);
    }
}
