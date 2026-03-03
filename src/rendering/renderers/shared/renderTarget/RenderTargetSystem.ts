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
import type { CanvasRenderTarget } from '../../canvas/renderTarget/CanvasRenderTargetAdaptor';
import type { CLEAR_OR_BOOL } from '../../gl/const';
import type { GlRenderTarget } from '../../gl/GlRenderTarget';
import type { GpuRenderTarget } from '../../gpu/renderTarget/GpuRenderTarget';
import type { Renderer } from '../../types';
import type { System } from '../system/System';
import type { BindableTexture } from '../texture/Texture';

/**
 * A render surface is a texture, canvas, or render target
 * @category rendering
 * @see environment.ICanvas
 * @see Texture
 * @see RenderTarget
 * @advanced
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
    frame: Rectangle;
    /** mip level to render to (subresource) */
    mipLevel: number;
    /** array layer to render to (subresource) */
    layer: number;
}

/**
 * An adaptor interface for RenderTargetSystem to support WebGL and WebGPU.
 * This is used internally by the renderer, and is not intended to be used directly.
 * @ignore
 */
type RendererRenderTarget = GlRenderTarget | GpuRenderTarget | CanvasRenderTarget;

/**
 * An adaptor interface for RenderTargetSystem to support WebGL and WebGPU.
 * This is used internally by the renderer, and is not intended to be used directly.
 * @category rendering
 * @ignore
 */
export interface RenderTargetAdaptor<RENDER_TARGET extends RendererRenderTarget>
{
    /**
     * Initializes the adaptor.
     * @param {Renderer} renderer - the renderer
     * @param {RenderTargetSystem} renderTargetSystem - the render target system
     */
    init(
        renderer: Renderer,
        renderTargetSystem: RenderTargetSystem<RENDER_TARGET>
    ): void

    /**
     * A function copies the contents of a render surface to a texture
     * @param {RenderTarget} sourceRenderSurfaceTexture - the render surface to copy from
     * @param {Texture} destinationTexture - the texture to copy to
     * @param {object} originSrc - the origin of the copy
     * @param {number} originSrc.x - the x origin of the copy
     * @param {number} originSrc.y - the y origin of the copy
     * @param {object} size - the size of the copy
     * @param {number} size.width - the width of the copy
     * @param {number} size.height - the height of the copy
     * @param {object} originDest - the destination origin (top left to paste from!)
     * @param {number} originDest.x - the x destination origin of the copy
     * @param {number} originDest.y - the y destination origin of the copy
     */
    copyToTexture(
        sourceRenderSurfaceTexture: RenderTarget,
        destinationTexture: Texture,
        originSrc: { x: number; y: number },
        size: { width: number; height: number },
        originDest?: { x: number; y: number },
    ): Texture

    /**
     * starts a render pass on the render target
     * @param {RenderTarget} renderTarget - the render target to start the render pass on
     * @param {CLEAR_OR_BOOL} clear - the clear mode to use. Can be true or a CLEAR number 'COLOR | DEPTH | STENCIL' 0b111*
     * @param {RgbaArray} [clearColor] - the color to clear to
     * @param {Rectangle} [viewport] - the viewport to use
     */
    startRenderPass(
        renderTarget: RenderTarget,
        clear: CLEAR_OR_BOOL,
        clearColor?: RgbaArray,
        /** the viewport to use */
        viewport?: Rectangle,
        /** mip level to render to (subresource) */
        mipLevel?: number,
        /** array layer to render to (subresource) */
        layer?: number
    ): void

    /**
     * clears the current render target to the specified color
     * @param {RenderTarget} renderTarget - the render target to clear
     * @param {CLEAR_OR_BOOL} clear - the clear mode to use. Can be true or a CLEAR number 'COLOR | DEPTH | STENCIL' 0b111*
     * @param {RgbaArray} [clearColor] - the color to clear to
     * @param {Rectangle} [viewport] - the viewport to use
     */
    clear(
        renderTarget: RenderTarget,
        clear: CLEAR_OR_BOOL,
        clearColor?: RgbaArray,
        /** the viewport to use */
        viewport?: Rectangle,
        /** mip level to clear (subresource) */
        mipLevel?: number,
        /** array layer to clear (subresource) */
        layer?: number
    ): void

    /**
     * finishes the current render pass
     * @param {RenderTarget} renderTarget - the render target to finish the render pass for
     */
    finishRenderPass(renderTarget: RenderTarget): void

    /**
     * called after the render pass is finished
     * @param {RenderTarget} renderTarget - the render target that was rendered to
     */
    postrender?(renderTarget: RenderTarget): void;

    /**
     * called before the render main pass is started
     * @param {RenderTarget} renderTarget - the render target that will be rendered to
     */
    prerender?(renderTarget: RenderTarget): void;

    /**
     * initializes a gpu render target
     * @param {RenderTarget} renderTarget - the render target to initialize
     */
    initGpuRenderTarget(
        renderTarget: RenderTarget
    ): RENDER_TARGET

    /**
     * resizes the gpu render target
     * @param {RenderTarget} renderTarget - the render target to resize
     */
    resizeGpuRenderTarget(
        renderTarget: RenderTarget
    ): void

    /**
     * destroys the gpu render target
     * @param {RendererRenderTarget} gpuRenderTarget - the gpu render target to destroy
     */
    destroyGpuRenderTarget(gpuRenderTarget: RENDER_TARGET): void
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
 * @category rendering
 * @advanced
 */
export class RenderTargetSystem<RENDER_TARGET extends RendererRenderTarget> implements System
{
    /** When rendering of a scene begins, this is where the root render surface is stored */
    public rootRenderTarget: RenderTarget;
    /** This is the root viewport for the render pass */
    public rootViewPort = new Rectangle();
    /** A boolean that lets the dev know if the current render pass is rendering to the screen. Used by some plugins */
    public renderingToScreen: boolean;
    /** the current active render target */
    public renderTarget: RenderTarget;
    /** the current active render surface that the render target is created from */
    public renderSurface: RenderSurface;
    /** the current viewport that the gpu is using */
    public readonly viewport = new Rectangle();
    /** the current mip level being rendered to (for texture subresources) */
    public mipLevel = 0;
    /** the current array layer being rendered to (for array-backed targets) */
    public layer = 0;
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
        renderer.gc.addCollection(this, '_gpuRenderTargetHash', 'hash');
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
     * @param options.mipLevel - the mip level to render to
     * @param options.layer - The layer of the render target to render to. Used for array or 3D textures, or when rendering
     * to a specific layer of a layered render target. Optional.
     */
    public renderStart({
        target,
        clear,
        clearColor,
        frame,
        mipLevel,
        layer
    }: {
        target: RenderSurface;
        clear: CLEAR_OR_BOOL;
        clearColor: RgbaArray;
        frame?: Rectangle;
        mipLevel?: number;
        layer?: number;
    }): void
    {
        // TODO no need to reset this - use optimised index instead
        this._renderTargetStack.length = 0;

        this.push(
            target,
            clear,
            clearColor,
            frame,
            mipLevel ?? 0,
            layer ?? 0
        );

        this.rootViewPort.copyFrom(this.viewport);
        this.rootRenderTarget = this.renderTarget;
        this.renderingToScreen = isRenderingToScreen(this.rootRenderTarget);

        this.adaptor.prerender?.(this.rootRenderTarget);
    }

    public postrender()
    {
        this.adaptor.postrender?.(this.rootRenderTarget);
    }

    /**
     * Binding a render surface! This is the main function of the render target system.
     * It will take the RenderSurface (which can be a texture, canvas, or render target) and bind it to the renderer.
     * Once bound all draw calls will be rendered to the render surface.
     *
     * If a frame is not provided and the render surface is a {@link Texture}, the frame of the texture will be used.
     *
     * IMPORTANT:
     * - `frame` is treated as **base mip (mip 0) pixel space**.
     * - When `mipLevel > 0`, the viewport derived from `frame` is scaled by \(2^{mipLevel}\) and clamped to the
     *   mip dimensions. This keeps "render the same region" semantics consistent across mip levels.
     * - When `renderSurface` is a {@link Texture}, `renderer.render({ container, target: texture, mipLevel })` will
     *   render into
     *   the underlying {@link TextureSource} (Pixi will create/use a {@link RenderTarget} for the source) using the
     *   texture's frame to define the region (in mip 0 space).
     * @param renderSurface - the render surface to bind
     * @param clear - the clear mode to use. Can be true or a CLEAR number 'COLOR | DEPTH | STENCIL' 0b111
     * @param clearColor - the color to clear to
     * @param frame - the frame to render to
     * @param mipLevel - the mip level to render to
     * @param layer - the layer (or slice) of the render surface to render to. For array textures,
     * 3D textures, or cubemaps, this specifies the target layer or face. Defaults to 0 (the first layer/face).
     * Ignored for surfaces that do not support layers.
     * @returns the render target that was bound
     */
    public bind(
        renderSurface: RenderSurface,
        clear: CLEAR_OR_BOOL = true,
        clearColor?: RgbaArray,
        frame?: Rectangle,
        mipLevel = 0,
        layer = 0
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
        const arrayLayerCount = source.arrayLayerCount || 1;

        if ((layer | 0) !== layer)
        {
            layer |= 0;
        }

        if (layer < 0 || layer >= arrayLayerCount)
        {
            throw new Error(`[RenderTargetSystem] layer ${layer} is out of bounds (arrayLayerCount=${arrayLayerCount}).`);
        }

        this.mipLevel = mipLevel | 0;
        this.layer = layer | 0;

        const pixelWidth = Math.max(source.pixelWidth >> mipLevel, 1);
        const pixelHeight = Math.max(source.pixelHeight >> mipLevel, 1);

        // If no explicit frame was provided, Texture targets default to their frame.
        // IMPORTANT: frame is treated as base-level (mip 0) coordinates; when rendering to mip N,
        // the viewport is scaled down by 2^N.
        if (!frame && renderSurface instanceof Texture)
        {
            frame = renderSurface.frame;
        }

        if (frame)
        {
            const resolution = source._resolution;
            const scale = 1 << Math.max(mipLevel | 0, 0);

            // Convert frame to pixel units (mip 0), then scale to the requested mip level.
            const baseX = ((frame.x * resolution) + 0.5) | 0;
            const baseY = ((frame.y * resolution) + 0.5) | 0;
            const baseW = ((frame.width * resolution) + 0.5) | 0;
            const baseH = ((frame.height * resolution) + 0.5) | 0;

            // Use floor for origin and ceil for size to avoid collapsing to zero due to rounding.
            // (When mipLevel === 0, scale === 1 so this behaves like the base-level case.)
            let x = Math.floor(baseX / scale);
            let y = Math.floor(baseY / scale);
            let w = Math.ceil(baseW / scale);
            let h = Math.ceil(baseH / scale);

            // Clamp to mip dimensions.
            x = Math.min(Math.max(x, 0), pixelWidth - 1);
            y = Math.min(Math.max(y, 0), pixelHeight - 1);
            w = Math.min(Math.max(w, 1), pixelWidth - x);
            h = Math.min(Math.max(h, 1), pixelHeight - y);

            viewport.x = x;
            viewport.y = y;
            viewport.width = w;
            viewport.height = h;
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

        this.adaptor.startRenderPass(renderTarget, clear, clearColor, viewport, mipLevel, layer);

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
        mipLevel = this.mipLevel,
        layer = this.layer,
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
            this.viewport,
            mipLevel,
            layer
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
     * @param mipLevel - the mip level to render to
     * @param layer - The layer of the render surface to render to. For array textures or cube maps, this specifies
     * which layer or face to target. Defaults to 0 (the first layer).
     */
    public push(
        renderSurface: RenderSurface,
        clear: CLEAR | boolean = CLEAR.ALL,
        clearColor?: RgbaArray,
        frame?: Rectangle,
        mipLevel = 0,
        layer = 0
    )
    {
        const renderTarget = this.bind(renderSurface, clear, clearColor, frame, mipLevel, layer);

        this._renderTargetStack.push({
            renderTarget,
            frame,
            mipLevel,
            layer,
        });

        return renderTarget;
    }

    /** Pops the current render target from the renderer and restores the previous render target. */
    public pop()
    {
        this._renderTargetStack.pop();

        const currentRenderTargetData = this._renderTargetStack[this._renderTargetStack.length - 1];

        this.bind(
            currentRenderTargetData.renderTarget,
            false,
            null,
            currentRenderTargetData.frame,
            currentRenderTargetData.mipLevel,
            currentRenderTargetData.layer
        );
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
     * Copies a render surface to another texture.
     *
     * NOTE:
     * for sourceRenderSurfaceTexture, The render target must be something that is written too by the renderer
     *
     * The following is not valid:
     * @example
     * const canvas = document.createElement('canvas')
     * canvas.width = 200;
     * canvas.height = 200;
     *
     * const ctx = canvas2.getContext('2d')!
     * ctx.fillStyle = 'red'
     * ctx.fillRect(0, 0, 200, 200);
     *
     * const texture = RenderTexture.create({
     *   width: 200,
     *   height: 200,
     * })
     * const renderTarget = renderer.renderTarget.getRenderTarget(canvas2);
     *
     * renderer.renderTarget.copyToTexture(renderTarget,texture, {x:0,y:0},{width:200,height:200},{x:0,y:0});
     *
     * The best way to copy a canvas is to create a texture from it. Then render with that.
     *
     * Parsing in a RenderTarget canvas context (with a 2d context)
     * @param sourceRenderSurfaceTexture - the render surface to copy from
     * @param {Texture} destinationTexture - the texture to copy to
     * @param {object} originSrc - the origin of the copy
     * @param {number} originSrc.x - the x origin of the copy
     * @param {number} originSrc.y - the y origin of the copy
     * @param {object} size - the size of the copy
     * @param {number} size.width - the width of the copy
     * @param {number} size.height - the height of the copy
     * @param {object} originDest - the destination origin (top left to paste from!)
     * @param {number} originDest.x - the x origin of the paste
     * @param {number} originDest.y - the y origin of the paste
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

            this.adaptor.startRenderPass(this.renderTarget, false, null, this.viewport, 0, this.layer);
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
            renderSurface = getCanvasTexture(renderSurface as ICanvas).source;
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

            if (renderSurface.source instanceof CanvasSource)
            {
                renderTarget.isRoot = true;
            }

            // TODO add a test for this
            renderSurface.once('destroy', () =>
            {
                renderTarget.destroy();

                this._renderSurfaceToRenderTargetHash.delete(renderSurface);

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

    public resetState(): void
    {
        this.renderTarget = null;
        this.renderSurface = null;
    }
}
