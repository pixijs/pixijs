import { Rectangle } from '../../../../maths/shapes/Rectangle';
import { warn } from '../../../../utils/logging/warn';
import { CLEAR } from '../const';
import { GlRenderTarget } from '../GlRenderTarget';

import type { RgbaArray } from '../../../../color/Color';
import type { RenderTarget } from '../../shared/renderTarget/RenderTarget';
import type { RenderTargetAdaptor, RenderTargetSystem } from '../../shared/renderTarget/RenderTargetSystem';
import type { Texture } from '../../shared/texture/Texture';
import type { CLEAR_OR_BOOL } from '../const';
import type { WebGLRenderer } from '../WebGLRenderer';

/**
 * The WebGL adaptor for the render target system. Allows the Render Target System to be used with the WebGL renderer
 * @memberof rendering
 * @ignore
 */
export class GlRenderTargetAdaptor implements RenderTargetAdaptor<GlRenderTarget>
{
    private _renderTargetSystem: RenderTargetSystem<GlRenderTarget>;
    private _renderer: WebGLRenderer<HTMLCanvasElement>;
    private _clearColorCache: RgbaArray = [0, 0, 0, 0];
    private _viewPortCache: Rectangle = new Rectangle();

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
        viewport?: Rectangle
    )
    {
        const renderTargetSystem = this._renderTargetSystem;

        const source = renderTarget.colorTexture;
        const gpuRenderTarget = renderTargetSystem.getGpuRenderTarget(renderTarget);

        let viewPortY = viewport.y;

        if (renderTarget.isRoot)
        {
            // /TODO this is the same logic?
            viewPortY = source.pixelHeight - viewport.height;
        }

        // unbind the current render texture..
        renderTarget.colorTextures.forEach((texture) =>
        {
            this._renderer.texture.unbind(texture);
        });

        const gl = this._renderer.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, gpuRenderTarget.framebuffer);

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

        // if the stencil buffer has been requested, we need to create a stencil buffer
        if (!gpuRenderTarget.depthStencilRenderBuffer && (renderTarget.stencil || renderTarget.depth))
        {
            this._initStencil(gpuRenderTarget);
        }

        this.clear(renderTarget, clear, clearColor);
    }

    public finishRenderPass(renderTarget?: RenderTarget)
    {
        const renderTargetSystem = this._renderTargetSystem;

        const glRenderTarget = renderTargetSystem.getGpuRenderTarget(renderTarget);

        if (!glRenderTarget.msaa) return;

        const gl = this._renderer.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, glRenderTarget.resolveTargetFramebuffer);
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, glRenderTarget.framebuffer);

        gl.blitFramebuffer(
            0, 0, glRenderTarget.width, glRenderTarget.height,
            0, 0, glRenderTarget.width, glRenderTarget.height,
            gl.COLOR_BUFFER_BIT, gl.NEAREST,
        );

        gl.bindFramebuffer(gl.FRAMEBUFFER, glRenderTarget.framebuffer);

        // dont think we need this anymore? keeping around just in case the wheels fall off
        // gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    }

    public initGpuRenderTarget(renderTarget: RenderTarget): GlRenderTarget
    {
        const renderer = this._renderer;

        const gl = renderer.gl;

        // do single...

        const glRenderTarget = new GlRenderTarget();

        // we are rendering to the main canvas..
        if (renderTarget.colorTexture.resource === renderer.gl.canvas)
        {
            glRenderTarget.framebuffer = null;

            return glRenderTarget;
        }

        this._initColor(renderTarget, glRenderTarget);

        // set up a depth texture..

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

    public clear(_renderTarget: RenderTarget, clear: CLEAR_OR_BOOL, clearColor?: RgbaArray)
    {
        if (!clear) return;

        const renderTargetSystem = this._renderTargetSystem;

        // if clear is boolean..
        if (typeof clear === 'boolean')
        {
            clear = clear ? CLEAR.ALL : CLEAR.NONE;
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

        const renderTargetSystem = this._renderTargetSystem;

        const glRenderTarget = renderTargetSystem.getGpuRenderTarget(renderTarget);

        this._resizeColor(renderTarget, glRenderTarget);

        if (renderTarget.stencil)
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

        glRenderTarget.width = renderTarget.colorTexture.source.pixelWidth;
        glRenderTarget.height = renderTarget.colorTexture.source.pixelHeight;

        renderTarget.colorTextures.forEach((colorTexture, i) =>
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

            gl.framebufferTexture2D(gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0 + i,
                3553, // texture.target,
                glTexture,
                0);// mipLevel);
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

    private _resizeColor(renderTarget: RenderTarget, glRenderTarget: GlRenderTarget)
    {
        const source = renderTarget.colorTexture.source;

        glRenderTarget.width = source.pixelWidth;
        glRenderTarget.height = source.pixelHeight;

        renderTarget.colorTextures.forEach((colorTexture, i) =>
        {
            // nno need to resize the first texture..
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

        // TDO DO>>
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
}
