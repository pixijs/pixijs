import { Rectangle } from '../../../../maths/shapes/Rectangle';
import { warn } from '../../../../utils/logging/warn';
import { CanvasSource } from '../../shared/texture/sources/CanvasSource';
import { CLEAR } from '../const';
import { GlRenderTarget } from '../GlRenderTarget';

import type { RgbaArray } from '../../../../color/Color';
import type { RenderTarget } from '../../shared/renderTarget/RenderTarget';
import type { RenderTargetAdaptor, RenderTargetSystem } from '../../shared/renderTarget/RenderTargetSystem';
import type { Texture } from '../../shared/texture/Texture';
import type { CLEAR_OR_BOOL } from '../const';
import type { GlRenderingContext } from '../context/GlRenderingContext';
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
    /** Pre-computed draw buffers arrays for MRT, indexed by color attachment count */
    private _drawBuffersCache: number[][];

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

        // Pre-compute draw buffers arrays for all possible MRT configurations
        const gl = this._renderer.gl;

        this._drawBuffersCache = [];

        for (let i = 1; i <= 16; i++)
        {
            this._drawBuffersCache[i] = Array.from({ length: i }, (_, j) => gl.COLOR_ATTACHMENT0 + j);
        }
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

        let viewPortY = viewport.y;

        if (renderTarget.isRoot)
        {
            viewPortY = renderTarget.pixelHeight - viewport.height - viewport.y;
        }

        renderTarget.colorTextures.forEach((texture) =>
        {
            this._renderer.texture.unbind(texture);
        });

        const gl = this._renderer.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, gpuRenderTarget.framebuffer);

        if (
            !renderTarget.isRoot
            && renderTarget.colorTextures.length > 0
            && (gpuRenderTarget._attachedMipLevel !== mipLevel
                || gpuRenderTarget._attachedLayer !== layer)
        )
        {
            renderTarget.colorTextures.forEach((colorTexture, i) =>
            {
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
                else if (glSource.target === (gl as any).TEXTURE_2D_ARRAY)
                {
                    if (this._renderer.context.webGLVersion < 2)
                    {
                        throw new Error('[RenderTargetSystem] Rendering to 2D array textures requires WebGL2.');
                    }

                    (gl as any as WebGL2RenderingContext).framebufferTextureLayer(
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

        if (renderTarget.depthStencilTexture)
        {
            this._attachDepthStencilTexture(renderTarget, mipLevel, layer);
        }
        // if the stencil buffer has been requested, we need to create a stencil buffer
        else if (!gpuRenderTarget.depthStencilRenderBuffer && (renderTarget.stencil || renderTarget.depth))
        {
            this._initStencil(gpuRenderTarget);
        }

        // Set draw buffers for multiple render targets (MRT)
        if (renderTarget.colorTextures.length > 1)
        {
            this._setDrawBuffers(renderTarget, gl);
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
    }

    public finishRenderPass(renderTarget?: RenderTarget)
    {
        const renderTargetSystem = this._renderTargetSystem;

        const glRenderTarget = renderTargetSystem.getGpuRenderTarget(renderTarget);

        // Depth-only targets have no color buffer to resolve
        if (!glRenderTarget.msaa || renderTarget.colorTextures.length === 0) return;

        const gl = this._renderer.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, glRenderTarget.resolveTargetFramebuffer);
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, glRenderTarget.framebuffer);

        gl.blitFramebuffer(
            0, 0, glRenderTarget.width, glRenderTarget.height,
            0, 0, glRenderTarget.width, glRenderTarget.height,
            gl.COLOR_BUFFER_BIT, gl.NEAREST,
        );

        gl.bindFramebuffer(gl.FRAMEBUFFER, glRenderTarget.framebuffer);
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

        if (renderTarget.colorTextures.length === 0)
        {
            this._initDepth(renderTarget, glRenderTarget);
        }
        else
        {
            this._initColor(renderTarget, glRenderTarget);
        }

        if (renderTarget.depthStencilTexture)
        {
            this._attachDepthStencilTexture(renderTarget, 0, 0);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

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

        if (gpuRenderTarget.depthStencilRenderBuffer)
        {
            gl.deleteRenderbuffer(gpuRenderTarget.depthStencilRenderBuffer);
            gpuRenderTarget.depthStencilRenderBuffer = null;
        }

        gpuRenderTarget.msaaRenderBuffer.forEach((renderBuffer) =>
        {
            gl.deleteRenderbuffer(renderBuffer);
        });

        gpuRenderTarget.msaaRenderBuffer = null;
    }

    public clear(
        renderTarget: RenderTarget,
        clear: CLEAR_OR_BOOL,
        clearColor?: RgbaArray,
        _viewport?: Rectangle,
        _mipLevel = 0,
        layer = 0
    )
    {
        if (!clear) return;

        if (layer !== 0)
        {
            throw new Error('[RenderTargetSystem] Clearing array layers is not supported in WebGL renderer.');
        }

        const renderTargetSystem = this._renderTargetSystem;

        // if clear is boolean..
        if (typeof clear === 'boolean')
        {
            clear = clear ? CLEAR.ALL : CLEAR.NONE;
        }

        // Strip the COLOR bit for depth-only targets – there is no color buffer to clear.
        if (renderTarget.colorTextures.length === 0)
        {
            clear &= ~CLEAR.COLOR;

            if (!clear) return;
        }

        const gl = this._renderer.gl;

        if (clear & CLEAR.COLOR)
        {
            clearColor ??= renderTargetSystem.defaultClearColor;

            const clearColorCache = this._clearColorCache;
            const clearColorArray = clearColor as number[];

            if (clearColorCache[0] !== clearColorArray[0]
                || clearColorCache[1] !== clearColorArray[1]
                || clearColorCache[2] !== clearColorArray[2]
                || clearColorCache[3] !== clearColorArray[3])
            {
                clearColorCache[0] = clearColorArray[0];
                clearColorCache[1] = clearColorArray[1];
                clearColorCache[2] = clearColorArray[2];
                clearColorCache[3] = clearColorArray[3];

                gl.clearColor(clearColorArray[0], clearColorArray[1], clearColorArray[2], clearColorArray[3]);
            }
        }

        gl.clear(clear);
    }

    public resizeGpuRenderTarget(renderTarget: RenderTarget)
    {
        if (renderTarget.isRoot) return;

        const glRenderTarget = this._renderTargetSystem.getGpuRenderTarget(renderTarget);

        glRenderTarget.width = renderTarget.pixelWidth;
        glRenderTarget.height = renderTarget.pixelHeight;

        if (renderTarget.colorTextures.length > 0)
        {
            this._resizeColor(renderTarget, glRenderTarget);
        }

        if (renderTarget.stencil || renderTarget.depth)
        {
            this._resizeStencil(glRenderTarget);
        }
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

        const colorTextures = renderTarget.colorTextures;

        colorTextures.forEach((colorTexture, i) =>
        {
            const source = colorTexture.source;

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
            else if (glSource.target === (gl as any).TEXTURE_2D_ARRAY)
            {
                if (renderer.context.webGLVersion < 2)
                {
                    throw new Error('[RenderTargetSystem] TEXTURE_2D_ARRAY requires WebGL2.');
                }

                (gl as any as WebGL2RenderingContext).framebufferTextureLayer(
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
            const viewFramebuffer = gl.createFramebuffer();

            glRenderTarget.framebuffer = viewFramebuffer;

            gl.bindFramebuffer(gl.FRAMEBUFFER, viewFramebuffer);

            renderTarget.colorTextures.forEach((_, i) =>
            {
                const msaaRenderBuffer = gl.createRenderbuffer();

                glRenderTarget.msaaRenderBuffer[i] = msaaRenderBuffer;
            });
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

        (gl as WebGL2RenderingContext).drawBuffers([gl.NONE]);
        (gl as WebGL2RenderingContext).readBuffer(gl.NONE);
    }

    private _resizeColor(renderTarget: RenderTarget, glRenderTarget: GlRenderTarget)
    {
        const source = renderTarget.colorTexture.source;

        // After a resize, attachments are implicitly at mip 0 again (and non-zero mip allocations may have changed).
        // Force a re-attach on next mip render.
        glRenderTarget._attachedMipLevel = 0;
        glRenderTarget._attachedLayer = 0;

        renderTarget.colorTextures.forEach((colorTexture, i) =>
        {
            // no need to resize the first texture..
            if (i === 0) return;

            colorTexture.source.resize(source.width, source.height, source._resolution);
        });

        if (glRenderTarget.msaa)
        {
            const renderer = this._renderer;
            const gl = renderer.gl;

            const viewFramebuffer = glRenderTarget.framebuffer;

            gl.bindFramebuffer(gl.FRAMEBUFFER, viewFramebuffer);

            renderTarget.colorTextures.forEach((colorTexture, i) =>
            {
                const source = colorTexture.source;

                renderer.texture.bindSource(source, 0);
                const glSource = renderer.texture.getGlSource(source);

                const glInternalFormat = glSource.internalFormat;

                const msaaRenderBuffer = glRenderTarget.msaaRenderBuffer[i];

                gl.bindRenderbuffer(
                    gl.RENDERBUFFER,
                    msaaRenderBuffer
                );

                gl.renderbufferStorageMultisample(
                    gl.RENDERBUFFER,
                    4,
                    glInternalFormat,
                    source.pixelWidth,
                    source.pixelHeight
                );

                gl.framebufferRenderbuffer(
                    gl.FRAMEBUFFER,
                    gl.COLOR_ATTACHMENT0 + i,
                    gl.RENDERBUFFER,
                    msaaRenderBuffer
                );
            });
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
        const source = renderTarget.depthStencilTexture;

        const glSource = renderer.texture.getGlSource(source);
        const glTexture = glSource.texture;
        const format = source.format;

        let attachment: number = gl.DEPTH_ATTACHMENT;

        if (format === 'depth24plus-stencil8' || format === 'depth24plus' || format === 'stencil8')
        {
            attachment = gl.DEPTH_STENCIL_ATTACHMENT;
        }

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
        else if (glSource.target === gl.TEXTURE_2D_ARRAY)
        {
            (gl as any as WebGL2RenderingContext).framebufferTextureLayer(
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
        if (renderTarget.colorTextures.length === 0) return;

        const resource = renderTarget.colorTexture.resource;

        if (this._renderer.context.multiView && CanvasSource.test(resource))
        {
            this._renderer.context.ensureCanvasSize(resource);
        }
    }

    public postrender(renderTarget: RenderTarget)
    {
        if (!this._renderer.context.multiView || renderTarget.colorTextures.length === 0) return;

        if (CanvasSource.test(renderTarget.colorTexture.resource))
        {
            const contextCanvas = this._renderer.context.canvas;
            const canvasSource = renderTarget.colorTexture as unknown as CanvasSource;

            canvasSource.context2D.drawImage(
                contextCanvas as CanvasImageSource,
                0, canvasSource.pixelHeight - contextCanvas.height
            );
        }
    }

    private _setDrawBuffers(renderTarget: RenderTarget, gl: GlRenderingContext): void
    {
        const count = renderTarget.colorTextures.length;
        const bufferArray = this._drawBuffersCache[count];

        if (this._renderer.context.webGLVersion === 1)
        {
            const ext = this._renderer.context.extensions.drawBuffers;

            if (!ext)
            {
                warn('[RenderTexture] This WebGL1 context does not support rendering to multiple targets');
            }
            else
            {
                ext.drawBuffersWEBGL(bufferArray);
            }
        }
        else
        {
            // WebGL2 has built in support
            gl.drawBuffers(bufferArray);
        }
    }
}
