import { Matrix } from '../../../../maths/matrix/Matrix';
import { Rectangle } from '../../../../maths/shapes/Rectangle';
import { deprecation } from '../../../../utils/logging/deprecation';
import { warn } from '../../../../utils/logging/warn';
import { CLEAR } from '../../gl/const';
import { calculateProjection } from '../../gpu/renderTarget/calculateProjection';
import { type Renderer, RendererType } from '../../types';
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
 * The persistent description of a render-surface binding: the target plus the frame,
 * subresource, and orientation axes. Captured by {@link RenderTargetSystem.getBindState}.
 *
 * A clear is a per-call action, not part of the binding — see {@link BindOptions}.
 * @category rendering
 * @advanced
 */
export interface BindState
{
    /** the render surface to bind: a texture, canvas, or render target */
    target: RenderSurface;
    /**
     * the frame to render to, in base mip (mip 0) pixel space. When omitted, a {@link Texture}
     * target falls back to its own frame and any other target binds in full.
     */
    frame?: Rectangle;
    /**
     * the mip level to render to (subresource)
     * @default 0
     */
    mipLevel?: number;
    /**
     * the array layer (or slice/face) of the render surface to render to (subresource)
     * @default 0
     */
    layer?: number;
    /**
     * opt-in Y-orientation toggle. `false`/omitted is a no-op (the historical `!isRoot`
     * behavior); `true` inverts the orientation, and the winding with it.
     */
    flipY?: boolean;
}

/**
 * Options for binding a render surface via {@link RenderTargetSystem.bind}: the persistent
 * {@link BindState} plus the per-call clear actions.
 * @category rendering
 * @advanced
 */
export interface BindOptions extends BindState
{
    /**
     * the clear mode to use. Can be `true` or a CLEAR number 'COLOR | DEPTH | STENCIL' 0b111
     * @default true
     */
    clear?: CLEAR_OR_BOOL;
    /** the color to clear to */
    clearColor?: RgbaArray;
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

    /**
     * Copies the depth attachment of a render target into a depth/stencil texture.
     *
     * **Important Note:** When using the copied depth buffer in a subsequent render pass,
     * you must ensure you do not clear the depth buffer again. If you need to clear the color
     * buffer of the destination render target, use `clear: CLEAR.COLOR` to preserve the copied depth data.
     * @example
     * ```js
     * renderer.renderTarget.copyDepthTexture(
     *   sourceRT, destDepthTexture, { x: 0, y: 0 }, { width: 200, height: 200 }, { x: 0, y: 0 }
     * );
     *
     * // In the subsequent render pass, clear ONLY the color buffer!
     * renderer.render({
     *   target: destRT,
     *   container: myMesh,
     *   clear: CLEAR.COLOR, // Preserves the copied depth
     *   clearColor: [0, 0, 0, 1]
     * });
     * ```
     * @param {RenderTarget} source - the render target to copy depth from
     * @param {Texture} destination - the depth/stencil texture to copy depth to
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
    copyDepthTexture(
        source: RenderTarget,
        destination: Texture,
        originSrc: { x: number; y: number },
        size: { width: number; height: number },
        originDest?: { x: number; y: number },
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
 * renderer.renderTarget.bind({ target: renderTarget });
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
    /** the pushed bindings; each entry is a replayable BindOptions that pop() re-binds */
    private readonly _renderTargetStack: BindOptions[] = [];
    /**
     * the state of the current binding, written on every bind — backs the `renderSurface`,
     * `mipLevel` and `layer` getters and `getBindState`. Its `frame` aliases `_bindFrame`
     * and must never be handed out by reference.
     */
    private readonly _bindState: BindState = {
        target: null,
        frame: undefined,
        mipLevel: 0,
        layer: 0,
        flipY: false,
    };
    /** system-owned rect backing `_bindState.frame`; as-passed frames are copied into it */
    private readonly _bindFrame = new Rectangle();
    /** A reference to the renderer */
    private readonly _renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
        renderer.gc.addCollection(this, '_gpuRenderTargetHash', 'hash');
    }

    /** the current active render surface that the render target is created from */
    public get renderSurface(): RenderSurface
    {
        return this._bindState.target;
    }

    /** the current mip level being rendered to (for texture subresources) */
    public get mipLevel(): number
    {
        return this._bindState.mipLevel;
    }

    /** the current array layer being rendered to (for array-backed targets) */
    public get layer(): number
    {
        return this._bindState.layer;
    }

    /** called when dev wants to finish a render pass */
    public finishRenderPass()
    {
        this.adaptor.finishRenderPass(this.renderTarget);
    }

    /**
     * called when the renderer starts to render a scene: resets the bind stack and binds the
     * root render surface
     * @param options - the {@link BindOptions} for the root binding
     */
    public renderStart(options: BindOptions): void
    {
        // TODO no need to reset this - use optimised index instead
        this._renderTargetStack.length = 0;

        this.push(options);

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
     * IDEMPOTENT BIND:
     * Binding is "smart" — the viewport/projection math is always recomputed, but the underlying render pass is
     * only torn down and re-begun when something that actually requires it changes. If you bind the render target
     * that the currently open pass is already on (same `mipLevel`/`layer`) and request **no clear**
     * (`clear` is `false` / `CLEAR.NONE`), the live pass is reused and only the viewport is updated. This makes
     * drawing N things into one target at N viewports a single pass with N `setViewport` calls, and makes a
     * redundant same-target `bind`/`pop` essentially free. Any clear (even a partial one like `CLEAR.DEPTH`), a
     * different target, or a different `mipLevel`/`layer` forces a real begin. The MSAA resolve is never skipped:
     * it is deferred to the genuine pass end, which still happens before any target switch or read-back.
     *
     * IMPORTANT:
     * - `frame` is treated as **base mip (mip 0) pixel space**.
     * - When `mipLevel > 0`, the viewport derived from `frame` is scaled by \(2^{mipLevel}\) and clamped to the
     *   mip dimensions. This keeps "render the same region" semantics consistent across mip levels.
     * - When `renderSurface` is a {@link Texture}, `renderer.render({ container, target: texture, mipLevel })` will
     *   render into
     *   the underlying {@link TextureSource} (Pixi will create/use a {@link RenderTarget} for the source) using the
     *   texture's frame to define the region (in mip 0 space).
     * @param options - the bind options: see {@link BindOptions}
     * @returns the render target that was bound
     */
    public bind(options: BindOptions): RenderTarget;
    /**
     * Binds a render surface using positional arguments.
     * @param renderSurface - the render surface to bind
     * @param clear - the clear mode to use. Can be true or a CLEAR number 'COLOR | DEPTH | STENCIL' 0b111
     * @param clearColor - the color to clear to
     * @param frame - the frame to render to
     * @param mipLevel - the mip level to render to
     * @param layer - the layer (or slice) of the render surface to render to
     * @param flipY - opt-in Y-orientation toggle
     * @returns the render target that was bound
     * @deprecated since 8.20.0 — use an options object instead:
     * `bind({ target, clear, clearColor, frame, mipLevel, layer, flipY })`
     */
    public bind(
        renderSurface: RenderSurface,
        clear?: CLEAR_OR_BOOL,
        clearColor?: RgbaArray,
        frame?: Rectangle,
        mipLevel?: number,
        layer?: number,
        flipY?: boolean
    ): RenderTarget;
    public bind(
        surfaceOrOptions: RenderSurface | BindOptions,
        clear: CLEAR_OR_BOOL = true,
        clearColor?: RgbaArray,
        frame?: Rectangle,
        mipLevel = 0,
        layer = 0,
        flipY?: boolean
    ): RenderTarget
    {
        let options: BindOptions;

        if ('target' in surfaceOrOptions)
        {
            options = surfaceOrOptions;
        }
        else
        {
            // legacy positional call: sanitise the arguments into a BindOptions and carry on
            // #if _DEBUG
            deprecation('8.20.0', 'RenderTargetSystem.bind: positional arguments are deprecated, '
                + 'please use an options object instead: '
                + 'bind({ target, clear, clearColor, frame, mipLevel, layer, flipY })');
            // #endif

            options = { target: surfaceOrOptions, clear, clearColor, frame, mipLevel, layer, flipY };
        }

        // the options object is caller-owned and read-only: read everything into locals here
        // and never write back into it (the frame fallback below reassigns the local)
        const renderSurface = options.target;

        clear = options.clear ?? true;
        clearColor = options.clearColor;
        mipLevel = (options.mipLevel ?? 0) | 0;
        layer = (options.layer ?? 0) | 0;
        flipY = options.flipY;
        frame = options.frame;

        const renderTarget = this.getRenderTarget(renderSurface);

        const didChange = this.renderTarget !== renderTarget;

        this.renderTarget = renderTarget;

        const gpuRenderTarget = this.getGpuRenderTarget(renderTarget);

        if (renderTarget.pixelWidth !== gpuRenderTarget.width
            || renderTarget.pixelHeight !== gpuRenderTarget.height)
        {
            this.adaptor.resizeGpuRenderTarget(renderTarget);

            gpuRenderTarget.width = renderTarget.pixelWidth;
            gpuRenderTarget.height = renderTarget.pixelHeight;
        }

        const source = renderTarget.colorAttachments[0]?.texture || renderTarget.depthStencilAttachment?.texture;
        const viewport = this.viewport;
        const arrayLayerCount = source.arrayLayerCount || 1;

        if (layer < 0 || layer >= arrayLayerCount)
        {
            throw new Error(`[RenderTargetSystem] layer ${layer} is out of bounds (arrayLayerCount=${arrayLayerCount}).`);
        }

        // retain the as-passed bind state for the getters and getBindState; the frame is
        // copied, not referenced — callers reuse their rects
        const bindState = this._bindState;

        bindState.target = renderSurface;
        bindState.frame = frame ? this._bindFrame.copyFrom(frame) : undefined;
        bindState.mipLevel = mipLevel;
        bindState.layer = layer;
        bindState.flipY = flipY;

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
            const scale = 1 << Math.max(mipLevel, 0);

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
            // We clamp the position first, then calculate the width/height based on the new position.
            // This ensures that we don't collapse the width/height if the position is clamped.
            if (x < 0)
            {
                w += x;
                x = 0;
            }

            if (y < 0)
            {
                h += y;
                y = 0;
            }

            // clamp position to the texture bounds
            x = Math.min(x, pixelWidth - 1);
            y = Math.min(y, pixelHeight - 1);

            // now clamp the width/height to the texture bounds
            w = Math.min(w, pixelWidth - x);
            h = Math.min(h, pixelHeight - y);

            // ensure we have at least 1 pixel
            w = Math.max(w, 1);
            h = Math.max(h, 1);

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

        // Store the raw `flipY` toggle on the target — always, even when `undefined`, so a pooled target
        // resets to the default. `flipY` is opt-in: off → the historical orientation (`!isRoot`), on →
        // that orientation inverted. Resolving it here keeps the projection (below) and the WebGL
        // front-face inversion (GlStateSystem.onRenderTargetChange) reading the same welded value.
        renderTarget.flipY = flipY;

        calculateProjection(
            this.projectionMatrix,
            0, 0,
            viewport.width / source.resolution,
            viewport.height / source.resolution,
            !renderTarget.isRoot !== !!renderTarget.flipY
        );

        this.adaptor.startRenderPass(renderTarget, clear, clearColor, viewport, mipLevel, layer);

        if (didChange)
        {
            this.onRenderTargetChange.emit(renderTarget);
        }

        return renderTarget;
    }

    /**
     * Captures the current binding as a {@link BindOptions} that can be passed back to
     * {@link RenderTargetSystem.bind} to restore it. The capture replays non-destructively:
     * its `clear` is `CLEAR.NONE`, so restoring never wipes the target.
     *
     * ```js
     * const saved = renderer.renderTarget.getBindState();
     *
     * renderer.renderTarget.bind({ target: scratchTexture, clear: true });
     * // ... draw ...
     * renderer.renderTarget.bind(saved);
     *
     * // or compose: the saved binding, but into mip 1
     * renderer.renderTarget.bind({ ...saved, mipLevel: 1 });
     * ```
     *
     * The capture is a snapshot owned by the caller — later binds cannot change it — and holds
     * `target` and `frame` as they were passed, so a Texture bound without an explicit frame
     * replays through its frame fallback. It stays valid for as long as its target does.
     * Pass `out` to reuse one object across captures; every field of it is overwritten.
     * @param out - an optional object to write the bind state into; allocated when omitted
     * @returns the captured bind state (`out` when provided)
     */
    public getBindState(out?: BindOptions): BindOptions
    {
        if (!this.renderTarget)
        {
            throw new Error('[RenderTargetSystem] getBindState is only valid while a render surface is bound');
        }

        const bindState = this._bindState;

        out ??= {} as BindOptions;

        out.target = bindState.target;
        // pinned to NONE so replaying the capture never clears the restored target
        out.clear = CLEAR.NONE;
        out.clearColor = undefined;

        if (!bindState.frame)
        {
            out.frame = undefined;
        }
        else if (out.frame)
        {
            // reuse the out object's own rect in place
            out.frame.copyFrom(bindState.frame);
        }
        else
        {
            out.frame = bindState.frame.clone();
        }

        out.mipLevel = bindState.mipLevel;
        out.layer = bindState.layer;
        out.flipY = !!bindState.flipY;

        return out;
    }

    /**
     * The effective front-face orientation of the current bind — `true` when a front-facing triangle
     * ends up wound the opposite way on the surface (so the winding/cull has been inverted to compensate).
     *
     * This is the requested `flipY` combined with the backend's inherent orientation, not the raw request:
     *
     * ```text
     * frontFaceInverted = flipY XOR (isWebGL && !isRoot)
     * ```
     *
     * WebGL's non-root FBOs carry an inherent Y-flip vs the root (the classic render-texture flip), so the
     * same requested `flipY` lands with the opposite winding depending on `isRoot`. WebGPU has no such
     * inherent flip, so there it is simply `flipY`. This is exactly the winding inversion each backend bakes
     * at bind ({@link GlStateSystem} / {@link PipelineSystem}), exposed so consumers (e.g. 3D pipelines) can
     * read the resolved orientation instead of re-deriving it from `flipY`, `isRoot`, and a backend check of
     * their own.
     *
     * It is per-bind, not per-target: `flipY` is set on every `bind`/`renderStart` while `isRoot` is fixed on
     * the target, so this recomputes from whatever the last bind resolved.
     * @returns whether the current bind's front face is inverted
     */
    public get frontFaceInverted(): boolean
    {
        const renderTarget = this.renderTarget;

        if (!renderTarget) return false;

        const glInherentFlip = this._renderer.type === RendererType.WEBGL && !renderTarget.isRoot;

        return !!renderTarget.flipY !== glInherentFlip;
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
     * Push a render surface to the renderer. This will bind the render surface to the renderer
     * and store the binding on a stack, so `pop()` can restore the previous binding.
     * @param options - the bind options: see {@link BindOptions}
     * @returns the render target that was bound
     */
    public push(options: BindOptions): RenderTarget;
    /**
     * Push a render surface using positional arguments.
     * @param renderSurface - the render surface to push
     * @param clear - the clear mode to use. Can be true or a CLEAR number 'COLOR | DEPTH | STENCIL' 0b111
     * @param clearColor - the color to clear to
     * @param frame - the frame to use when rendering to the render surface
     * @param mipLevel - the mip level to render to
     * @param layer - the layer of the render surface to render to
     * @param flipY - opt-in Y-orientation toggle; stored on the stack so it is restored on `pop`
     * @returns the render target that was bound
     * @deprecated since 8.20.0 — use an options object instead:
     * `push({ target, clear, clearColor, frame, mipLevel, layer, flipY })`
     */
    public push(
        renderSurface: RenderSurface,
        clear?: CLEAR | boolean,
        clearColor?: RgbaArray,
        frame?: Rectangle,
        mipLevel?: number,
        layer?: number,
        flipY?: boolean
    ): RenderTarget;
    public push(
        surfaceOrOptions: RenderSurface | BindOptions,
        clear: CLEAR | boolean = CLEAR.ALL,
        clearColor?: RgbaArray,
        frame?: Rectangle,
        mipLevel = 0,
        layer = 0,
        flipY?: boolean
    ): RenderTarget
    {
        let options: BindOptions;

        if ('target' in surfaceOrOptions)
        {
            options = surfaceOrOptions;
        }
        else
        {
            // legacy positional call: sanitise the arguments into a BindOptions and carry on
            // #if _DEBUG
            deprecation('8.20.0', 'RenderTargetSystem.push: positional arguments are deprecated, '
                + 'please use an options object instead: '
                + 'push({ target, clear, clearColor, frame, mipLevel, layer, flipY })');
            // #endif

            options = { target: surfaceOrOptions, clear, clearColor, frame, mipLevel, layer, flipY };
        }

        const renderTarget = this.bind(options);

        // the entry is replayed by pop(): the target is stored as passed (a Texture keeps its
        // frame fallback), the frame is copied (callers reuse their rects), and clear is false
        // (restoring must not wipe the target)
        this._renderTargetStack.push({
            target: options.target,
            clear: false,
            clearColor: undefined,
            frame: options.frame ? options.frame.clone() : undefined,
            mipLevel: options.mipLevel,
            layer: options.layer,
            flipY: options.flipY,
        });

        return renderTarget;
    }

    /**
     * Pops the current render target and restores the previous binding.
     * @returns the render target that was restored
     */
    public pop(): RenderTarget
    {
        this._renderTargetStack.pop();

        const previous = this._renderTargetStack[this._renderTargetStack.length - 1];

        if (!previous)
        {
            throw new Error('[RenderTargetSystem] pop: no previous binding to restore (unbalanced pop)');
        }

        return this.bind(previous);
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
     * @param sourceRenderSurface - the render surface (render target, texture, or canvas) to copy from
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
        sourceRenderSurface: RenderSurface,
        destinationTexture: Texture,
        originSrc: { x: number; y: number },
        size: { width: number; height: number },
        originDest: { x: number; y: number; },
    )
    {
        // a texture or canvas source is copied from its render target's framebuffer
        const sourceRenderTarget = this.getRenderTarget(sourceRenderSurface);

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

        const { pixelWidth, pixelHeight } = sourceRenderTarget;

        size.width = Math.min(size.width, pixelWidth - originSrc.x);
        size.height = Math.min(size.height, pixelHeight - originSrc.y);

        return this.adaptor.copyToTexture(
            sourceRenderTarget,
            destinationTexture,
            originSrc,
            size,
            originDest
        );
    }

    /**
     * Copies the depth attachment from one render target to another.
     * Both source and destination must have a depthStencilAttachment.
     *
     * **Important Note:** When using the copied depth buffer in a subsequent render pass,
     * you must ensure you do not clear the depth buffer again. If you need to clear the color
     * buffer of the destination render target, use `clear: CLEAR.COLOR` to preserve the copied depth data.
     * @example
     * ```js
     * renderer.renderTarget.copyDepthTexture(
     *   sourceRT, destRT, { x: 0, y: 0 }, { width: 200, height: 200 }, { x: 0, y: 0 }
     * );
     *
     * // In the subsequent render pass, clear ONLY the color buffer!
     * renderer.render({
     *   target: destRT,
     *   container: myMesh,
     *   clear: CLEAR.COLOR, // Preserves the copied depth
     *   clearColor: [0, 0, 0, 1]
     * });
     * ```
     * @param source - the render surface (render target, depth texture, or canvas) to copy depth from
     * @param destination - the depth/stencil texture to copy depth to
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
    public copyDepthTexture(
        source: RenderSurface,
        destination: Texture,
        originSrc: { x: number; y: number },
        size: { width: number; height: number },
        originDest: { x: number; y: number; } = { x: 0, y: 0 },
    ): void
    {
        // a depth texture source is copied from its render target's depth attachment
        const sourceRenderTarget = this.getRenderTarget(source);

        if (!sourceRenderTarget.depthStencilAttachment)
        {
            warn('[RenderTargetSystem] copyDepthTexture: the source render target has no depth attachment to copy from');

            return;
        }

        const destSource = destination.source;

        if (!destSource.format.includes('depth') && !destSource.format.includes('stencil'))
        {
            warn('[RenderTargetSystem] copyDepthTexture: the destination texture must have a depth/stencil format '
                + `(got '${destSource.format}')`);

            return;
        }

        // clamp into locals — callers often reuse their rect objects across frames,
        // so the arguments must never be mutated
        let srcX = originSrc.x;
        let srcY = originSrc.y;
        let destX = originDest.x;
        let destY = originDest.y;
        let width = size.width;
        let height = size.height;

        // fit to the source bounds
        if (srcX < 0)
        {
            width += srcX;
            destX -= srcX;
            srcX = 0;
        }

        if (srcY < 0)
        {
            height += srcY;
            destY -= srcY;
            srcY = 0;
        }

        width = Math.min(width, sourceRenderTarget.pixelWidth - srcX);
        height = Math.min(height, sourceRenderTarget.pixelHeight - srcY);

        // fit to the destination bounds too — WebGPU validates the copy against them
        // (GL silently clips), and an oversized copy would discard the whole frame
        width = Math.min(width, destSource.pixelWidth - destX);
        height = Math.min(height, destSource.pixelHeight - destY);

        if (width <= 0 || height <= 0) return;

        this.adaptor.copyDepthTexture(
            sourceRenderTarget, destination,
            { x: srcX, y: srcY },
            { width, height },
            { x: destX, y: destY },
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
            if (this.renderTarget.depthStencilTexture)
            {
                // an explicit depth-only texture (e.g. 'depth24plus') cannot gain a stencil aspect
                warn('[RenderTargetSystem] a stencil mask is being used, but the render target\'s '
                    + `depthStencilTexture format '${this.renderTarget.depthStencilTexture.format}' has no `
                    + 'stencil aspect, so masking cannot work here. Use a \'depth24plus-stencil8\' texture instead.');

                return;
            }

            this.renderTarget._depth = true;
            this.renderTarget._stencil = true;

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
                this._releaseRenderTarget(key as TextureSource, renderTarget);
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
            // a depth/stencil-format source is a depth attachment, any other format is a color one
            const format = renderSurface.format;
            const isDepthStencil = format.includes('depth') || format.includes('stencil');

            renderTarget = isDepthStencil
                ? new RenderTarget({ colorTextures: 0, depthStencilTexture: renderSurface })
                : new RenderTarget({ colorTextures: [renderSurface] });

            if (renderSurface.source instanceof CanvasSource)
            {
                renderTarget.isRoot = true;
            }

            renderSurface.once('destroy', this._onRenderSurfaceDestroy, this);
        }

        this._renderSurfaceToRenderTargetHash.set(renderSurface, renderTarget);

        return renderTarget;
    }

    private _onRenderSurfaceDestroy(renderSurface: TextureSource): void
    {
        const renderTarget = this._renderSurfaceToRenderTargetHash.get(renderSurface);

        if (renderTarget) this._releaseRenderTarget(renderSurface, renderTarget);
    }

    /**
     * Tears down a render target that wraps a texture source, removing every reference the
     * system holds to it so neither the system's own teardown nor the source's `destroy`
     * event can destroy it a second time.
     * @param renderSurface - the texture source the render target wraps
     * @param renderTarget - the render target to release
     */
    private _releaseRenderTarget(renderSurface: TextureSource, renderTarget: RenderTarget): void
    {
        renderTarget.destroy();
        this._renderSurfaceToRenderTargetHash.delete(renderSurface);
        renderSurface.off('destroy', this._onRenderSurfaceDestroy, this);

        const gpuRenderTarget = this._gpuRenderTargetHash[renderTarget.uid];

        if (gpuRenderTarget)
        {
            this._gpuRenderTargetHash[renderTarget.uid] = null;
            this.adaptor.destroyGpuRenderTarget(gpuRenderTarget);
        }
    }

    public getGpuRenderTarget(renderTarget: RenderTarget)
    {
        return this._gpuRenderTargetHash[renderTarget.uid]
        || (this._gpuRenderTargetHash[renderTarget.uid] = this.adaptor.initGpuRenderTarget(renderTarget));
    }

    public resetState(): void
    {
        this.renderTarget = null;
        this._bindState.target = null;
    }
}
