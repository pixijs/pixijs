import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/Matrix';
import { isRenderingToScreen } from '../shared/renderTarget/isRenderingToScreen';
import { RenderTarget } from '../shared/renderTarget/RenderTarget';
import { SystemRunner } from '../shared/system/SystemRunner';
import { Texture } from '../shared/texture/Texture';
import { getCanvasTexture } from '../shared/texture/utils/getCanvasTexture';
import { CLEAR } from './const';
import { GlRenderTarget } from './GlRenderTarget';

import type { ICanvas } from '../../../settings/adapter/ICanvas';
import type { RenderSurface, RGBAArray } from '../gpu/renderTarget/GpuRenderTargetSystem';
import type { System } from '../shared/system/System';
import type { CLEAR_OR_BOOL } from './const';
import type { GlRenderingContext } from './context/GlRenderingContext';
import type { WebGLRenderer } from './WebGLRenderer';

export class GlRenderTargetSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'renderTarget',
    } as const;

    public rootProjectionMatrix: Matrix;
    public renderingToScreen: boolean;
    public rootRenderTarget: RenderTarget;
    public renderTarget: RenderTarget;
    public onRenderTargetChange = new SystemRunner('onRenderTargetChange');

    // TODO work on this later!
    // multiRender = true;
    private _gl: GlRenderingContext;

    private readonly _renderSurfaceToRenderTargetHash: Map<RenderSurface, RenderTarget> = new Map();
    private _gpuRenderTargetHash: Record<number, GlRenderTarget> = Object.create(null);
    private readonly _renderer: WebGLRenderer;
    private readonly _renderTargetStack: RenderTarget[] = [];
    private readonly _defaultClearColor: RGBAArray = [0, 0, 0, 0];
    private readonly _clearColorCache: RGBAArray = [0, 0, 0, 0];

    private readonly _viewPortCache = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };

    constructor(renderer: WebGLRenderer)
    {
        this.rootProjectionMatrix = new Matrix();

        this._renderer = renderer;
    }

    protected contextChange(gl: GlRenderingContext): void
    {
        this._gl = gl;
    }

    public start(
        rootRenderSurface: RenderSurface,
        clear: CLEAR_OR_BOOL = true,
        clearColor?: RGBAArray
    ): void
    {
        this._renderTargetStack.length = 0;

        const renderTarget = this.getRenderTarget(rootRenderSurface);

        this.rootRenderTarget = renderTarget;

        this.renderingToScreen = isRenderingToScreen(this.rootRenderTarget);

        this.rootProjectionMatrix = renderTarget.projectionMatrix;

        this.push(renderTarget, clear, clearColor);
    }

    public bind(
        renderSurface: RenderSurface,
        clear: CLEAR_OR_BOOL = true,
        clearColor?: RGBAArray
    ): RenderTarget
    {
        const renderTarget = this.getRenderTarget(renderSurface);

        this.renderTarget = renderTarget;

        const gpuRenderTarget = this._getGpuRenderTarget(renderTarget);

        if (renderTarget.dirtyId !== gpuRenderTarget.dirtyId)
        {
            gpuRenderTarget.dirtyId = renderTarget.dirtyId;
            this._resizeGpuRenderTarget(renderTarget);
        }

        const gl = this._gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, gpuRenderTarget.framebuffer);

        // unbind the current render texture..
        renderTarget.colorTextures.forEach((texture) =>
        {
            this._renderer.texture.unbind(texture);
        });

        const viewport = renderTarget.viewport;

        let viewPortY = viewport.y;

        if (renderTarget.isRoot)
        {
            // /TODO this is the same logic?
            viewPortY = this._renderer.view.element.height - viewport.height;
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

        this.clear(clear, clearColor);

        this.onRenderTargetChange.emit(renderTarget);

        return renderTarget;
    }

    public clear(clear: CLEAR_OR_BOOL, clearColor?: RGBAArray)
    {
        if (!clear) return;

        // if clear is boolean..
        if (typeof clear === 'boolean')
        {
            clear = clear ? CLEAR.ALL : CLEAR.NONE;
        }

        const gl = this._gl;

        if (clear & CLEAR.COLOR)
        {
            clearColor = clearColor ?? this._defaultClearColor;

            const clearColorCache = this._clearColorCache;

            if (clearColorCache[0] !== clearColor[0]
                || clearColorCache[1] !== clearColor[1]
                || clearColorCache[2] !== clearColor[2]
                || clearColorCache[3] !== clearColor[3])
            {
                clearColorCache[0] = clearColor[0];
                clearColorCache[1] = clearColor[1];
                clearColorCache[2] = clearColor[2];
                clearColorCache[3] = clearColor[3];

                gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
            }
        }

        gl.clear(clear);
    }

    /**
     * returns the gpu texture for the first color texture in the render target
     * mainly used by the filter manager to get copy the texture for blending
     * @param renderTarget
     * @returns a gpu texture
     */
    public getGpuColorTexture(renderTarget: RenderTarget): Texture
    {
        return renderTarget.colorTexture;
    }

    public push(
        renderSurface: RenderSurface,
        clear: CLEAR_OR_BOOL = true,
        clearColor?: RGBAArray
    )
    {
        const renderTarget = this.bind(renderSurface, clear, clearColor);

        this._renderTargetStack.push(renderTarget);

        return renderTarget;
    }

    public pop()
    {
        this._renderTargetStack.pop();

        this.bind(this._renderTargetStack[this._renderTargetStack.length - 1], false);
    }

    public getRenderTarget(renderSurface: RenderSurface): RenderTarget
    {
        return this._renderSurfaceToRenderTargetHash.get(renderSurface) ?? this._initRenderTarget(renderSurface);
    }

    private _initRenderTarget(renderSurface: RenderSurface): RenderTarget
    {
        let renderTarget: RenderTarget = null;

        if (renderSurface instanceof HTMLCanvasElement)
        {
            renderSurface = getCanvasTexture(renderSurface as ICanvas);
        }

        if (renderSurface instanceof RenderTarget)
        {
            renderTarget = renderSurface;
        }
        else if (renderSurface instanceof Texture)
        {
            renderTarget = new RenderTarget({
                colorTextures: [renderSurface],
            });

            if (renderSurface.source.resource instanceof HTMLCanvasElement)
            {
                renderTarget.isRoot = true;
            }

            renderSurface.source.on('destroy', () =>
            {
                renderTarget.destroy();
            });
        }

        this._renderSurfaceToRenderTargetHash.set(renderSurface, renderTarget);

        return renderTarget;
    }

    public finishRenderPass()
    {
        const glRenderTarget = this._getGpuRenderTarget(this.renderTarget);

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
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    }

    public copyToTexture(
        sourceRenderSurfaceTexture: RenderTarget,
        destinationTexture: Texture,
        origin: { x: number; y: number; },
        size: { width: number; height: number; }
    )
    {
        const renderer = this._renderer;

        const baseTexture = renderer.renderTarget.getGpuColorTexture(sourceRenderSurfaceTexture);

        renderer.renderTarget.bind(baseTexture, false);

        renderer.texture.bind(destinationTexture, 0);

        const gl = renderer.gl;

        gl.copyTexSubImage2D(gl.TEXTURE_2D, 0,
            0, 0,
            origin.x,
            origin.y,
            size.width,
            size.height
        );

        return destinationTexture;
    }

    private _getGpuRenderTarget(renderTarget: RenderTarget)
    {
        return this._gpuRenderTargetHash[renderTarget.uid] || this._initGpuRenderTarget(renderTarget);
    }

    private _initGpuRenderTarget(renderTarget: RenderTarget)
    {
        const renderer = this._renderer;

        const gl = renderer.gl;

        // do single...

        const glRenderTarget = new GlRenderTarget();

        // we are rendering to a canvas..
        if (renderTarget.colorTexture.source.resource instanceof HTMLCanvasElement)
        {
            this._gpuRenderTargetHash[renderTarget.uid] = glRenderTarget;

            glRenderTarget.framebuffer = null;

            return glRenderTarget;
        }

        this._initColor(renderTarget, glRenderTarget);

        if (renderTarget.stencil)
        {
            this._initStencil(glRenderTarget);
        }

        // set up a depth texture..

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this._gpuRenderTargetHash[renderTarget.uid] = glRenderTarget;

        return glRenderTarget;
    }

    private _resizeGpuRenderTarget(renderTarget: RenderTarget)
    {
        if (renderTarget.isRoot) return;

        const glRenderTarget = this._getGpuRenderTarget(renderTarget);

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
                glRenderTarget.msaa = true;
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
                gl.DEPTH24_STENCIL8,
                glRenderTarget.width,
                glRenderTarget.height
            );
        }
    }

    public destroy()
    {
        //
    }
}

