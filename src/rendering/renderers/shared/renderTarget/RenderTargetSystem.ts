import { Matrix } from '../../../../maths/matrix/Matrix';
import { Rectangle } from '../../../../maths/shapes/Rectangle';
import { CLEAR } from '../../gl/const';
import { calculateProjection } from '../../gpu/renderTarget/calculateProjection';
import { SystemRunner } from '../system/SystemRunner';
import { CanvasSource } from '../texture/sources/CanvasSource';
import { TextureSource } from '../texture/sources/TextureSource';
import { Texture } from '../texture/Texture';
import { getCanvasTexture } from '../texture/utils/getCanvasTexture';
import { isRenderingToScreen } from './isRenderingToScreen';
import { RenderTarget } from './RenderTarget';

import type { RgbaArray } from '../../../../color/Color';
import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { CLEAR_OR_BOOL } from '../../gl/const';
import type { GlRenderTarget } from '../../gl/GlRenderTarget';
import type { GpuRenderTarget } from '../../gpu/renderTarget/GpuRenderTarget';
import type { Renderer } from '../../types';
import type { System } from '../system/System';
import type { BindableTexture } from '../texture/Texture';

/**
 * A render surface is a texture, canvas, or render target
 * @memberof rendering
 * @see environment.ICanvas
 * @see rendering.Texture
 * @see rendering.RenderTarget
 */
export type RenderSurface = ICanvas | BindableTexture | RenderTarget;

/**
 * stores a render target and its frame
 * @ignore
 */
interface RenderTargetAndFrame
{
    /** the render target */
    renderTarget: RenderTarget;
    /** the frame to use when using the render target */
    frame: Rectangle
}

/**
 * An adaptor interface for RenderTargetSystem to support WebGL and WebGPU.
 * This is used internally by the renderer, and is not intended to be used directly.
 * @ignore
 */
export interface RenderTargetAdaptor<RENDER_TARGET extends GlRenderTarget | GpuRenderTarget>
{
    init(
        /** the renderer */
        renderer: Renderer,
        /** the render target system */
        renderTargetSystem: RenderTargetSystem<RENDER_TARGET>
    ): void

    /** A function copies the contents of a render surface to a texture */
    copyToTexture(
        /** the render surface to copy from  */
        sourceRenderSurfaceTexture: RenderTarget,
        /** the texture to copy to */
        destinationTexture: Texture,
        /** the origin of the copy */
        originSrc: { x: number; y: number },
        /** the size of the copy */
        size: { width: number; height: number },
        /** the destination origin (top left to paste from!) */
        originDest?: { x: number; y: number },
    ): Texture

    /** starts a render pass on the render target */
    startRenderPass(
        /** the render target to start the render pass on */
        renderTarget: RenderTarget,
        /* the clear mode to use. Can be true or a CLEAR number 'COLOR | DEPTH | STENCIL' 0b111* */
        clear: CLEAR_OR_BOOL,
        /** the color to clear to */
        clearColor?: RgbaArray,
        /** the viewport to use */
        viewport?: Rectangle
    ): void

    /** clears the current render target to the specified color */
    clear(
        /** the render target to clear */
        renderTarget: RenderTarget,
        /** the clear mode to use. Can be true or a CLEAR number 'COLOR | DEPTH | STENCIL' 0b111 */
        clear: CLEAR_OR_BOOL,
        /** the color to clear to   */
        clearColor?: RgbaArray,
        /** the viewport to use */
        viewport?: Rectangle
    ): void

    /** finishes the current render pass */
    finishRenderPass(renderTarget: RenderTarget): void

    /**
     * initializes a gpu render target. Both renderers use this function to initialize a gpu render target
     * Its different type of object depending on the renderer.
     */
    initGpuRenderTarget(
        /** the render target to initialize */
        renderTarget: RenderTarget
    ): RENDER_TARGET

    /** called when a render target is resized */
    resizeGpuRenderTarget(
        /** the render target to resize */
        renderTarget: RenderTarget
    ): void

    /** destroys the gpu render target */
    destroyGpuRenderTarget(
        /** the render target to destroy */
        gpuRenderTarget: RENDER_TARGET
    ): void
}

/**
 * A system that manages render targets. A render target is essentially a place where the shaders can color in the pixels.
 * The render target system is responsible for binding the render target to the renderer, and managing the viewport.
 * Render targets can be pushed and popped.
 *
 * To make it easier, you can also bind textures and canvases too. This will automatically create a render target for you.
 * The render target itself is a lot more powerful than just a texture or canvas,
 * as it can have multiple textures attached to it.
 * It will also give ou fine grain control over the stencil buffer / depth texture.
 * @example
 *
 * ```js
 *
 * // create a render target
 * const renderTarget = new RenderTarget({
 *   colorTextures: [new TextureSource({ width: 100, height: 100 })],
 * });
 *
 * // bind the render target
 * renderer.renderTarget.bind(renderTarget);
 *
 * // draw something!
 * ```
 * @memberof rendering
 */
export class RenderTargetSystem<RENDER_TARGET extends GlRenderTarget | GpuRenderTarget> implements System
{
    /** When rendering of a scene begins, this is where the root render surface is stored */
    public rootRenderTarget: RenderTarget;
    /** This is the root viewport for the render pass*/
    public rootViewPort = new Rectangle();
    /** A boolean that lets the dev know if the current render pass is rendering to the screen. Used by some plugins */
    public renderingToScreen: boolean;
    /** the current active render target */
    public renderTarget: RenderTarget;
    /** the current active render surface that the render target is created from */
    public renderSurface: RenderSurface;
    /** the current viewport that the gpu is using */
    public readonly viewport = new Rectangle();
    /**
     * a runner that lets systems know if the active render target has changed.
     * Eg the Stencil System needs to know so it can manage the stencil buffer
     */
    public readonly onRenderTargetChange = new SystemRunner('onRenderTargetChange');
    /** the projection matrix that is used by the shaders based on the active render target and the viewport */
    public readonly projectionMatrix = new Matrix();
    /** the default clear color for render targets */
    public readonly defaultClearColor: RgbaArray = [0, 0, 0, 0];
    /** a reference to the adaptor that interfaces with WebGL / WebGP */
    public readonly adaptor: RenderTargetAdaptor<RENDER_TARGET>;
    /**
     * a hash that stores the render target for a given render surface. When you pass in a texture source,
     * a render target is created for it. This map stores and makes it easy to retrieve the render target
     */
    private readonly _renderSurfaceToRenderTargetHash: Map<RenderSurface, RenderTarget>
        = new Map();
    /** A hash that stores a gpu render target for a given render target. */
    private _gpuRenderTargetHash: Record<number, RENDER_TARGET> = Object.create(null);
    /**
     * A stack that stores the render target and frame that is currently being rendered to.
     * When push is called, the current render target is stored in this stack.
     * When pop is called, the previous render target is restored.
     */
    private readonly _renderTargetStack: RenderTargetAndFrame[] = [];
    /** A reference to the renderer */
    private readonly _renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    /** called when dev wants to finish a render pass */
    public finishRenderPass()
    {
        this.adaptor.finishRenderPass(this.renderTarget);
    }

    /**
     * called when the renderer starts to render a scene.
     * @param options
     * @param options.target - the render target to render to
     * @param options.clear - the clear mode to use. Can be true or a CLEAR number 'COLOR | DEPTH | STENCIL' 0b111
     * @param options.clearColor - the color to clear to
     * @param options.frame - the frame to render to
     */
    public renderStart({
        target,
        clear,
        clearColor,
        frame
    }: {
        target: RenderSurface;
        clear: CLEAR_OR_BOOL;
        clearColor: RgbaArray;
        frame?: Rectangle
    }): void
    {
        // TODO no need to reset this - use optimised index instead
        this._renderTargetStack.length = 0;

        this.push(
            target,
            clear,
            clearColor,
            frame
        );

        this.rootViewPort.copyFrom(this.viewport);
        this.rootRenderTarget = this.renderTarget;
        this.renderingToScreen = isRenderingToScreen(this.rootRenderTarget);
    }

    /**
     * Binding a render surface! This is the main function of the render target system.
     * It will take the RenderSurface (which can be a texture, canvas, or render target) and bind it to the renderer.
     * Once bound all draw calls will be rendered to the render surface.
     *
     * If a frame is not provide and the render surface is a texture, the frame of the texture will be used.
     * @param renderSurface - the render surface to bind
     * @param clear - the clear mode to use. Can be true or a CLEAR number 'COLOR | DEPTH | STENCIL' 0b111
     * @param clearColor - the color to clear to
     * @param frame - the frame to render to
     * @returns the render target that was bound
     */
    public bind(
        renderSurface: RenderSurface,
        clear: CLEAR_OR_BOOL = true,
        clearColor?: RgbaArray,
        frame?: Rectangle
    ): RenderTarget
    {
        const renderTarget = this.getRenderTarget(renderSurface);

        const didChange = this.renderTarget !== renderTarget;

        this.renderTarget = renderTarget;
        this.renderSurface = renderSurface;

        const gpuRenderTarget = this.getGpuRenderTarget(renderTarget);

        if (renderTarget.pixelWidth !== gpuRenderTarget.width
            || renderTarget.pixelHeight !== gpuRenderTarget.height)
        {
            this.adaptor.resizeGpuRenderTarget(renderTarget);

            gpuRenderTarget.width = renderTarget.pixelWidth;
            gpuRenderTarget.height = renderTarget.pixelHeight;
        }

        const source = renderTarget.colorTexture;
        const viewport = this.viewport;

        const pixelWidth = source.pixelWidth;
        const pixelHeight = source.pixelHeight;

        if (!frame && renderSurface instanceof Texture)
        {
            frame = renderSurface.frame;
        }

        if (frame)
        {
            const resolution = source._resolution;

            viewport.x = ((frame.x * resolution) + 0.5) | 0;
            viewport.y = ((frame.y * resolution) + 0.5) | 0;
            viewport.width = ((frame.width * resolution) + 0.5) | 0;
            viewport.height = ((frame.height * resolution) + 0.5) | 0;
        }
        else
        {
            viewport.x = 0;
            viewport.y = 0;
            viewport.width = pixelWidth;
            viewport.height = pixelHeight;
        }

        calculateProjection(
            this.projectionMatrix,
            0, 0,
            viewport.width / source.resolution,
            viewport.height / source.resolution,
            !renderTarget.isRoot
        );

        this.adaptor.startRenderPass(renderTarget, clear, clearColor, viewport);

        if (didChange)
        {
            this.onRenderTargetChange.emit(renderTarget);
        }

        return renderTarget;
    }

    public clear(
        target?: RenderSurface,
        clear: CLEAR_OR_BOOL = CLEAR.ALL,
        clearColor?: RgbaArray,
    )
    {
        if (!clear) return;

        if (target)
        {
            target = this.getRenderTarget(target);
        }

        this.adaptor.clear(
            (target as RenderTarget) || this.renderTarget,
            clear,
            clearColor,
            this.viewport
        );
    }

    protected contextChange(): void
    {
        this._gpuRenderTargetHash = Object.create(null);
    }

    /**
     * Push a render surface to the renderer. This will bind the render surface to the renderer,
     * @param renderSurface - the render surface to push
     * @param clear - the clear mode to use. Can be true or a CLEAR number 'COLOR | DEPTH | STENCIL' 0b111
     * @param clearColor - the color to clear to
     * @param frame - the frame to use when rendering to the render surface
     */
    public push(
        renderSurface: RenderSurface,
        clear: CLEAR | boolean = CLEAR.ALL,
        clearColor?: RgbaArray,
        frame?: Rectangle
    )
    {
        const renderTarget = this.bind(renderSurface, clear, clearColor, frame);

        this._renderTargetStack.push({
            renderTarget,
            frame,
        });

        return renderTarget;
    }

    /** Pops the current render target from the renderer and restores the previous render target. */
    public pop()
    {
        this._renderTargetStack.pop();

        const currentRenderTargetData = this._renderTargetStack[this._renderTargetStack.length - 1];

        this.bind(currentRenderTargetData.renderTarget, false, null, currentRenderTargetData.frame);
    }

    /**
     * Gets the render target from the provide render surface. Eg if its a texture,
     * it will return the render target for the texture.
     * If its a render target, it will return the same render target.
     * @param renderSurface - the render surface to get the render target for
     * @returns the render target for the render surface
     */
    public getRenderTarget(renderSurface: RenderSurface): RenderTarget
    {
        if (((renderSurface as Texture).isTexture))
        {
            renderSurface = (renderSurface as Texture).source;
        }

        return this._renderSurfaceToRenderTargetHash.get(renderSurface)
        ?? this._initRenderTarget(renderSurface);
    }

    /**
     * Copies a render surface to another texture
     * @param sourceRenderSurfaceTexture - the render surface to copy from
     * @param destinationTexture - the texture to copy to
     * @param originSrc - the origin of the copy
     * @param originSrc.x - the x origin of the copy
     * @param originSrc.y - the y origin of the copy
     * @param size - the size of the copy
     * @param size.width - the width of the copy
     * @param size.height - the height of the copy
     * @param originDest - the destination origin (top left to paste from!)
     * @param originDest.x - the x origin of the paste
     * @param originDest.y - the y origin of the paste
     */
    public copyToTexture(
        sourceRenderSurfaceTexture: RenderTarget,
        destinationTexture: Texture,
        originSrc: { x: number; y: number },
        size: { width: number; height: number },
        originDest: { x: number; y: number; },
    )
    {
        // fit the size to the source we don't want to go out of bounds

        if (originSrc.x < 0)
        {
            size.width += originSrc.x;
            originDest.x -= originSrc.x;
            originSrc.x = 0;
        }

        if (originSrc.y < 0)
        {
            size.height += originSrc.y;
            originDest.y -= originSrc.y;
            originSrc.y = 0;
        }

        const { pixelWidth, pixelHeight } = sourceRenderSurfaceTexture;

        size.width = Math.min(size.width, pixelWidth - originSrc.x);
        size.height = Math.min(size.height, pixelHeight - originSrc.y);

        return this.adaptor.copyToTexture(
            sourceRenderSurfaceTexture,
            destinationTexture,
            originSrc,
            size,
            originDest
        );
    }

    /**
     * ensures that we have a depth stencil buffer available to render to
     * This is used by the mask system to make sure we have a stencil buffer.
     */
    public ensureDepthStencil()
    {
        if (!this.renderTarget.stencil)
        {
            this.renderTarget.stencil = true;

            this.adaptor.startRenderPass(this.renderTarget, false, null, this.viewport);
        }
    }

    /** nukes the render target system */
    public destroy()
    {
        (this._renderer as null) = null;

        this._renderSurfaceToRenderTargetHash.forEach((renderTarget, key) =>
        {
            if (renderTarget !== key)
            {
                renderTarget.destroy();
            }
        });

        this._renderSurfaceToRenderTargetHash.clear();

        this._gpuRenderTargetHash = Object.create(null);
    }

    private _initRenderTarget(renderSurface: RenderSurface): RenderTarget
    {
        let renderTarget: RenderTarget = null;

        if (CanvasSource.test(renderSurface))
        {
            renderSurface = getCanvasTexture(renderSurface as ICanvas);
        }

        if (renderSurface instanceof RenderTarget)
        {
            renderTarget = renderSurface;
        }
        else if (renderSurface instanceof TextureSource)
        {
            renderTarget = new RenderTarget({
                colorTextures: [renderSurface],
            });

            if (CanvasSource.test(renderSurface.source.resource))
            {
                renderTarget.isRoot = true;
            }

            // TODO add a test for this
            renderSurface.once('destroy', () =>
            {
                renderTarget.destroy();

                const gpuRenderTarget = this._gpuRenderTargetHash[renderTarget.uid];

                if (gpuRenderTarget)
                {
                    this._gpuRenderTargetHash[renderTarget.uid] = null;
                    this.adaptor.destroyGpuRenderTarget(gpuRenderTarget);
                }
            });
        }

        this._renderSurfaceToRenderTargetHash.set(renderSurface, renderTarget);

        return renderTarget;
    }

    public getGpuRenderTarget(renderTarget: RenderTarget)
    {
        return this._gpuRenderTargetHash[renderTarget.uid]
        || (this._gpuRenderTargetHash[renderTarget.uid] = this.adaptor.initGpuRenderTarget(renderTarget));
    }
}
