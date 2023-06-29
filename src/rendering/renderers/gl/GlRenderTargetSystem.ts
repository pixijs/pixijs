import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/Matrix';
import { RenderTarget } from '../shared/renderTarget/RenderTarget';
import { SystemRunner } from '../shared/system/SystemRunner';
import { Texture } from '../shared/texture/Texture';
import { getCanvasTexture } from '../shared/texture/utils/getCanvasTexture';
import { GlRenderTarget } from './GlRenderTarget';

import type { ICanvas } from '../../../settings/adapter/ICanvas';
import type { RenderSurface, RGBAArray } from '../gpu/renderTarget/GpuRenderTargetSystem';
import type { ISystem } from '../shared/system/System';
import type { GlRenderingContext } from './context/GlRenderingContext';
import type { WebGLRenderer } from './WebGLRenderer';

export class GlRenderTargetSystem implements ISystem
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGLRendererSystem,
        ],
        name: 'renderTarget',
    } as const;

    rootProjectionMatrix: Matrix;
    rootRenderTarget: RenderTarget;
    renderTarget: RenderTarget;

    onRenderTargetChange = new SystemRunner('onRenderTargetChange');

    // TODO work on this later!
    // multiRender = true;
    private gl: GlRenderingContext;

    private renderSurfaceToRenderTargetHash: Map<RenderSurface, RenderTarget> = new Map();
    private gpuRenderTargetHash: Record<number, GlRenderTarget> = {};

    private renderer: WebGLRenderer;

    private renderTargetStack: RenderTarget[] = [];

    private defaultClearColor: RGBAArray = [0, 0, 0, 0];
    private clearColorCache: RGBAArray = [0, 0, 0, 0];

    private viewPortCache = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };

    constructor(renderer: WebGLRenderer)
    {
        this.rootProjectionMatrix = new Matrix();

        this.renderer = renderer;
    }

    contextChange(gl: GlRenderingContext): void
    {
        this.gl = gl;
    }

    start(rootRenderSurface: any, clear = true, clearColor?: RGBAArray): void
    {
        this.renderTargetStack.length = 0;

        const renderTarget = this.getRenderTarget(rootRenderSurface);

        this.rootRenderTarget = renderTarget;
        this.rootProjectionMatrix = renderTarget.projectionMatrix;

        this.push(renderTarget, clear, clearColor);
    }

    renderEnd(): void
    {
        this.finish();
    }

    bind(renderSurface: RenderSurface, clear = true, clearColor?: RGBAArray): RenderTarget
    {
        const renderTarget = this.getRenderTarget(renderSurface);

        this.renderTarget = renderTarget;

        const gpuRenderTarget = this.getGpuRenderTarget(renderTarget);

        if (renderTarget.dirtyId !== gpuRenderTarget.dirtyId)
        {
            gpuRenderTarget.dirtyId = renderTarget.dirtyId;
            this.resizeGpuRenderTarget(renderTarget);
        }

        const gl = this.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, gpuRenderTarget.framebuffer);

        // unbind the current render texture..
        renderTarget.colorTextures.forEach((texture) =>
        {
            this.renderer.texture.unbind(texture);
        });

        const viewport = renderTarget.viewport;

        let viewPortY = viewport.y;

        if (renderTarget.isRoot)
        {
            // /TODO this is the same logic?
            viewPortY = this.renderer.view.element.height - viewport.height;
        }

        const viewPortCache = this.viewPortCache;

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

        if (clear)
        {
            const gl = this.gl;

            if (clear)
            {
                clearColor = clearColor ?? this.defaultClearColor;

                const clearColorCache = this.clearColorCache;

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

                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            }
        }

        this.onRenderTargetChange.emit(renderTarget);

        return renderTarget;
    }

    /**
     * returns the gpu texture for the first color texture in the render target
     * mainly used by the filter manager to get copy the texture for blending
     * @param renderTarget
     * @returns a gpu texture
     */
    getGpuColorTexture(renderTarget: RenderTarget): Texture
    {
        return renderTarget.colorTexture;
    }

    push(renderSurface: RenderSurface, clear = true, clearColor?: RGBAArray)
    {
        const renderTarget = this.bind(renderSurface, clear, clearColor);

        this.renderTargetStack.push(renderTarget);

        return renderTarget;
    }

    pop()
    {
        this.renderTargetStack.pop();

        this.bind(this.renderTargetStack[this.renderTargetStack.length - 1], false);
    }

    getRenderTarget(renderSurface: RenderSurface): RenderTarget
    {
        return this.renderSurfaceToRenderTargetHash.get(renderSurface) ?? this.initRenderTarget(renderSurface);
    }

    private initRenderTarget(renderSurface: RenderSurface): RenderTarget
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

        this.renderSurfaceToRenderTargetHash.set(renderSurface, renderTarget);

        return renderTarget;
    }

    finishRenderPass()
    {
        const glRenderTarget = this.getGpuRenderTarget(this.renderTarget);

        if (!glRenderTarget.msaa) return;

        const gl = this.renderer.gl;

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

    finish()
    {
        // NOTHING TO DO JUST YET..
    }

    copyToTexture(
        sourceRenderSurfaceTexture: RenderTarget,
        destinationTexture: Texture,
        origin: { x: number; y: number; },
        size: { width: number; height: number; }
    )
    {
        const renderer = this.renderer;

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

    private getGpuRenderTarget(renderTarget: RenderTarget)
    {
        return this.gpuRenderTargetHash[renderTarget.uid] || this.initGpuRenderTarget(renderTarget);
    }

    private initGpuRenderTarget(renderTarget: RenderTarget)
    {
        const renderer = this.renderer;

        const gl = renderer.gl;

        // do single...

        const glRenderTarget = new GlRenderTarget();

        // we are rendering to a canvas..
        if (renderTarget.colorTexture.source.resource instanceof HTMLCanvasElement)
        {
            this.gpuRenderTargetHash[renderTarget.uid] = glRenderTarget;

            glRenderTarget.framebuffer = null;

            return glRenderTarget;
        }

        this.initColor(renderTarget, glRenderTarget);

        if (renderTarget.stencil)
        {
            this.initStencil(glRenderTarget);
        }

        // set up a depth texture..

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this.gpuRenderTargetHash[renderTarget.uid] = glRenderTarget;

        return glRenderTarget;
    }

    private resizeGpuRenderTarget(renderTarget: RenderTarget)
    {
        if (renderTarget.isRoot) return;

        const glRenderTarget = this.getGpuRenderTarget(renderTarget);

        this.resizeColor(renderTarget, glRenderTarget);

        if (renderTarget.stencil)
        {
            this.resizeStencil(glRenderTarget);
        }
    }

    private initColor(renderTarget: RenderTarget, glRenderTarget: GlRenderTarget)
    {
        const renderer = this.renderer;

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

    private resizeColor(renderTarget: RenderTarget, glRenderTarget: GlRenderTarget)
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
            const renderer = this.renderer;
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

    private initStencil(glRenderTarget: GlRenderTarget)
    {
        const gl = this.renderer.gl;

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

    private resizeStencil(glRenderTarget: GlRenderTarget)
    {
        const gl = this.renderer.gl;

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
                gl.DEPTH_STENCIL,
                glRenderTarget.width,
                glRenderTarget.height
            );
        }
    }

    destroy()
    {
        //
    }
}

// finish(): void
// {
//     this.gl.finish();

//     // TODO - implement this properly
//     // if (this.renderer.view.multiView)
//     // {
//     //     const renderTarget = this.rootRenderTarget;

//     //     // now copy it to where it needs to be!
//     //     if (renderTarget.isRoot)
//     //     {
//     //
//     //         // const canvas = renderTarget.colorTexture.source.resource;

//     //         // if (!renderTarget.copyContext)
//     //         // {
//     //         //     renderTarget.copyContext = canvas.getContext('2d');
//     //         // }

//     //         // renderTarget.copyContext.drawImage(
//     //         //     this.renderer.view.element,
//     //         //     0, 0,
//     //         // );
//     //     }
//     // }
// }
