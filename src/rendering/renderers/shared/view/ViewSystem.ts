import { DOMAdapter } from '../../../../environment/adapter';
import { ExtensionType } from '../../../../extensions/Extensions';
import { Rectangle } from '../../../../maths/shapes/Rectangle';
import { deprecation, v8_0_0 } from '../../../../utils/logging/deprecation';
import { warn } from '../../../../utils/logging/warn';
import { type Renderer, type RendererOptions } from '../../types';
import { RenderTarget } from '../renderTarget/RenderTarget';
import { CanvasSource } from '../texture/sources/CanvasSource';
import { getCanvasTexture } from '../texture/utils/getCanvasTexture';
import { CanvasView } from './CanvasView';

import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { TypeOrBool } from '../../../../scene/container/destroyTypes';
import type { RenderSurface } from '../renderTarget/RenderTargetSystem';
import type { RenderOptions } from '../system/AbstractRenderer';
import type { System } from '../system/System';
import type { Texture } from '../texture/Texture';
import type { CanvasViewOptions } from './CanvasView';

/**
 * Options passed to the ViewSystem
 * @category rendering
 * @advanced
 */
export interface ViewSystemOptions
{
    /**
     * The width of the screen.
     * @default 800
     */
    width?: number;
    /**
     * The height of the screen.
     * @default 600
     */
    height?: number;
    /** The canvas to use as a view, optional. */
    canvas?: ICanvas;
    /**
     * Alias for `canvas`.
     * @deprecated since 8.0.0
     */
    view?: ICanvas;
    /**
     * Resizes canvas view in CSS pixels to allow for resolutions other than 1.
     *
     * This is only supported for HTMLCanvasElement
     * and will be ignored if the canvas is an OffscreenCanvas.
     */
    autoDensity?: boolean;
    /** The resolution / device pixel ratio of the renderer. */
    resolution?: number;
    /** Whether to enable anti-aliasing. This may affect performance. */
    antialias?: boolean;
    /** Whether to ensure the main view has can make use of the depth buffer. Always true for WebGL renderer. */
    depth?: boolean;
}

/**
 * Options for destroying the ViewSystem.
 * @category rendering
 * @advanced
 */
export interface ViewSystemDestroyOptions
{
    /** Whether to remove the view element from the DOM. Defaults to `false`. */
    removeView?: boolean;
}

/**
 * The view system manages the main canvas that is attached to the DOM.
 * This main role is to deal with how the holding the view reference and dealing with how it is resized.
 * @category rendering
 * @advanced
 */
export class ViewSystem implements System<ViewSystemOptions, TypeOrBool<ViewSystemDestroyOptions> >
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'view',
        priority: 0,
    } as const;

    /** The default options for the view system. */
    public static defaultOptions: ViewSystemOptions = {
        /**
         * {@link WebGLOptions.width}
         * @default 800
         */
        width: 800,
        /**
         * {@link WebGLOptions.height}
         * @default 600
         */
        height: 600,
        /**
         * {@link WebGLOptions.autoDensity}
         * @default false
         */
        autoDensity: false,
        /**
         * {@link WebGLOptions.antialias}
         * @default false
         */
        antialias: false,
    };

    /** The canvas element that everything is drawn to. */
    public canvas!: ICanvas;

    /** The texture that is used to draw the canvas to the screen. */
    public texture: Texture<CanvasSource>;

    private readonly _renderer: Renderer;

    /** The registered views, with the main view always at index 0. */
    private readonly _views: CanvasView[] = [];

    /**
     * Maps each view's {@link CanvasSource} to its {@link CanvasView} so {@link viewForTarget} can
     * resolve a canvas-backed target in O(1). Kept in sync with {@link _views} at every add/remove.
     */
    private readonly _viewBySource = new Map<CanvasSource, CanvasView>();
    /** Per-view source 'destroy' handlers, kept so removeView/destroy can detach them and not leak listeners. */
    private readonly _viewDestroyHandlers: Map<CanvasView, () => void> = new Map();

    /** The on-screen view the current frame renders to, resolved at prerender. */
    private _activeView: CanvasView | null = null;

    /** The renderer's `_roundPixels` flag saved at prerender and restored at postrender. */
    private _savedRoundPixels: 0 | 1 = 0;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    /** The views the renderer presents to. The main view is always at index 0. */
    public get views(): readonly CanvasView[]
    {
        return this._views;
    }

    /**
     * The on-screen view this frame renders to, resolved at prerender before the WebGL back buffer
     * swaps `options.target`. Null for offscreen / RenderTexture targets.
     */
    public get activeView(): CanvasView | null
    {
        return this._activeView;
    }

    /**
     * Whether CSS dimensions of canvas view should be resized to screen dimensions automatically.
     * This is only supported for HTMLCanvasElement and will be ignored if the canvas is an OffscreenCanvas.
     * @type {boolean}
     */
    public get autoDensity(): boolean
    {
        return this.texture.source.autoDensity;
    }
    public set autoDensity(value: boolean)
    {
        this.texture.source.autoDensity = value;
    }

    /** Whether to enable anti-aliasing. This may affect performance. */
    public antialias: boolean;

    /**
     * Measurements of the screen. (0, 0, screenWidth, screenHeight).
     *
     * Its safe to use as filterArea or hitArea for the whole stage.
     */
    public screen: Rectangle;
    /** The render target that the view is drawn to. */
    public renderTarget: RenderTarget;

    /** The resolution / device pixel ratio of the renderer. */
    get resolution(): number
    {
        return this.texture.source._resolution;
    }

    set resolution(value: number)
    {
        this.texture.source.resize(
            this.texture.source.width,
            this.texture.source.height,
            value
        );
    }

    /**
     * initiates the view system
     * @param options - the options for the view
     */
    public init(options: ViewSystemOptions): void
    {
        options = {
            ...ViewSystem.defaultOptions,
            ...options,
        };

        if (options.view)
        {
            // #if _DEBUG
            deprecation(v8_0_0, 'ViewSystem.view has been renamed to ViewSystem.canvas');
            // #endif

            options.canvas = options.view;
        }

        this.screen = new Rectangle(0, 0, options.width, options.height);
        this.canvas = options.canvas || DOMAdapter.get().createCanvas();
        this.antialias = !!options.antialias;
        this.texture = getCanvasTexture(this.canvas, options);
        this.renderTarget = new RenderTarget({
            colorTextures: [this.texture],
            depth: !!options.depth,
            isRoot: true,
        });

        // register so `render({ target: renderer.canvas })` and `getRenderTarget(canvas)`
        // resolve to this render target instead of creating a duplicate
        this._renderer.renderTarget.registerRenderTarget(this.canvas, this.renderTarget);
        this._renderer.renderTarget.registerRenderTarget(this.texture.source, this.renderTarget);

        this.texture.source.transparent = (options as RendererOptions).backgroundAlpha < 1;
        this.resolution = options.resolution;

        const rendererOptions = options as RendererOptions;

        // automatic main-view registration. Per-canvas systems (events, accessibility, DOM) are
        // already constructed by the time init() runs and have subscribed to the viewAdded runner,
        // so emitting here lets them set up their state for the main canvas. The main view always
        // participates in every per-canvas system, matching the hardcoded events/dom flags; the
        // accessibility module's enabledByDefault/activateOnTab still control activation timing.
        const mainView = new CanvasView({
            canvas: this.canvas,
            source: this.texture.source,
            renderTarget: this.renderTarget,
            isMain: true,
            events: true,
            accessibility: true,
            dom: true,
            eventFeatures: rendererOptions.eventFeatures,
            roundPixels: this._renderer.roundPixels,
        });

        this._views.push(mainView);
        this._viewBySource.set(mainView.source, mainView);
        this._renderer.runners.viewAdded.emit(mainView);
    }

    /**
     * Resizes the screen and canvas to the specified dimensions.
     * @param desiredScreenWidth - The new width of the screen.
     * @param desiredScreenHeight - The new height of the screen.
     * @param resolution
     */
    public resize(desiredScreenWidth: number, desiredScreenHeight: number, resolution: number): void
    {
        this.texture.source.resize(desiredScreenWidth, desiredScreenHeight, resolution);

        this.screen.width = this.texture.frame.width;
        this.screen.height = this.texture.frame.height;
    }

    /**
     * Registers an additional canvas with the renderer so it can be presented to (multiView).
     *
     * The canvas is given a {@link CanvasSource}-backed render target if it does not already have
     * one, and the resolved resolution / autoDensity are applied to that source so secondary canvases
     * can be retina. A disconnected canvas is not rejected here; the app layer warns about that.
     * @param options - The options describing the view to register.
     * @returns The registered view.
     * @advanced
     */
    public addView(options: CanvasViewOptions): CanvasView
    {
        const resolution = options.resolution ?? this.resolution;
        const autoDensity = options.autoDensity ?? this.autoDensity;
        const canvas = options.canvas ?? DOMAdapter.get().createCanvas();

        const renderTarget = this._renderer.renderTarget.getRenderTarget(canvas);
        const source = renderTarget.colorTexture;

        if (!(source instanceof CanvasSource))
        {
            throw new Error('ViewSystem.addView: the target render surface is not canvas-backed');
        }

        // one canvas can back only one view; a duplicate would clobber _viewBySource (keyed by source)
        // and orphan the sibling on removeView. Return the existing view, matching Application.addView.
        const existingView = this._viewBySource.get(source);

        if (existingView)
        {
            // #if _DEBUG
            warn('ViewSystem.addView: that canvas already backs a view. Each view needs its own canvas.');
            // #endif

            return existingView;
        }

        // apply the resolved view settings to a freshly created source so secondary canvases
        // can present at their own resolution / density
        source.autoDensity = autoDensity;

        // antialias / transparent must be latched onto the source before resize and the first
        // render so WebGPU MSAA and the canvas alphaMode are picked up at lazy gpu init
        const antialias = options.antialias ?? this.antialias;
        const transparent = options.transparent ?? (this._renderer.background.alpha < 1);

        source.antialias = antialias;
        source.transparent = transparent;

        // if the user already rendered directly to this canvas, its gpu render target was created and
        // cached before the flags above were latched, so lazy gpu init never reads them (no MSAA, stale
        // alphaMode). Drop the cached gpu render target so the next render re-inits with the new flags.
        if (this._renderer.renderTarget.hasGpuRenderTarget(renderTarget))
        {
            this._renderer.renderTarget.invalidateGpuRenderTarget(renderTarget);
        }

        source.resize(source.width, source.height, resolution);

        const view = new CanvasView({
            canvas,
            source,
            renderTarget,
            isMain: false,
            events: options.events ?? true,
            accessibility: options.accessibility ?? true,
            dom: options.dom ?? true,
            eventFeatures: options.eventFeatures,
            roundPixels: options.roundPixels ?? this._renderer.roundPixels,
        });

        // store the handler so removeView/destroy can detach it; an inline arrow would leak one listener
        // (and a retained CanvasView closure) per add/remove cycle on a surviving user canvas
        const onSourceDestroy = (): void => this.removeView(view);

        source.once('destroy', onSourceDestroy);
        this._viewDestroyHandlers.set(view, onSourceDestroy);

        this._views.push(view);
        this._viewBySource.set(source, view);
        this._renderer.runners.viewAdded.emit(view);

        return view;
    }

    /**
     * Removes a previously registered view. Does nothing if the view is not registered.
     *
     * The user's canvas and its source are not destroyed here.
     * @param view - The view to remove.
     * @advanced
     */
    public removeView(view: CanvasView): void
    {
        // the main view lives for the renderer's lifetime (its render target is never released and its
        // EventsTicker listener is only torn down by the full destroy() path); removing it would fire
        // viewRemoved while leaking the ticker listener and pinning the old element
        if (view.isMain)
        {
            // #if _DEBUG
            warn('ViewSystem.removeView: the main view cannot be removed; it is torn down only by destroy().');
            // #endif

            return;
        }

        const index = this._views.indexOf(view);

        if (index === -1) return;

        this._views.splice(index, 1);
        this._viewBySource.delete(view.source);

        // detach the source 'destroy' listener so a surviving user canvas does not retain the removed view
        const onSourceDestroy = this._viewDestroyHandlers.get(view);

        if (onSourceDestroy)
        {
            view.source.off('destroy', onSourceDestroy);
            this._viewDestroyHandlers.delete(view);
        }

        // free the GPU render target and evict the render-target hashes for a secondary canvas
        // without destroying the user's CanvasSource. The main view is never released.
        if (!view.isMain)
        {
            this._renderer.renderTarget.releaseRenderTarget(view.canvas);
        }

        this._renderer.runners.viewRemoved.emit(view);
    }

    /**
     * Resolves the on-screen view this frame renders to and applies its per-view roundPixels to the
     * renderer. Runs before the WebGL back buffer swaps `options.target` in `renderStart`, so the
     * original target is still reliable here. The saved roundPixels is restored in {@link postrender}.
     * @param options - the options the renderer was called with
     */
    public prerender(options: RenderOptions): void
    {
        this._activeView = options.target ? this.viewForTarget(options.target) : (this._views[0] ?? null);
        this._savedRoundPixels = this._renderer._roundPixels;

        if (this._activeView)
        {
            this._renderer._roundPixels = this._activeView.roundPixels ? 1 : 0;
        }
    }

    /** Restores the renderer's roundPixels saved in {@link prerender}. */
    public postrender(): void
    {
        this._renderer._roundPixels = this._savedRoundPixels;
    }

    /**
     * Maps a `render()` call's target to a registered view.
     *
     * Returns the main view for the main render target, the matching view for a canvas-backed
     * target, or null for offscreen / texture targets. Read this in a `prerender` hook: the back
     * buffer swaps `options.target` in `renderStart`, so the original target is only reliable before then.
     * @param target - The render surface the render targeted.
     * @returns The matching view, or null when the target is not a registered on-screen canvas.
     * @internal
     */
    public viewForTarget(target: RenderSurface): CanvasView | null
    {
        // main view fast path - the renderer's own render target, no lookup needed
        if (target === this.renderTarget)
        {
            return this._views[0] ?? null;
        }

        const source = this._renderer.renderTarget.getRenderTarget(target).colorTexture;

        // only canvas-backed targets map to a view; texture targets are skipped
        if (!(source instanceof CanvasSource)) return null;

        return this._viewBySource.get(source) ?? null;
    }

    /**
     * Destroys this System and optionally removes the canvas from the dom.
     * @param {options | false} options - The options for destroying the view, or "false".
     * @example
     * viewSystem.destroy();
     * viewSystem.destroy(true);
     * viewSystem.destroy({ removeView: true });
     */
    public destroy(options: TypeOrBool<ViewSystemDestroyOptions> = false): void
    {
        const removeView = typeof options === 'boolean' ? options : !!options?.removeView;

        if (removeView && this.canvas.parentNode)
        {
            this.canvas.parentNode.removeChild(this.canvas);
        }

        // tear down per-view state in reverse so subscribers (events, accessibility, DOM) can
        // clean up; don't destroy the users' canvases here
        for (let i = this._views.length - 1; i >= 0; i--)
        {
            this._renderer.runners.viewRemoved.emit(this._views[i]);
        }

        this._views.length = 0;
        this._viewBySource.clear();

        // detach any remaining source 'destroy' listeners; a user-supplied canvas can outlive the renderer
        this._viewDestroyHandlers.forEach((handler, view) => view.source?.off('destroy', handler));
        this._viewDestroyHandlers.clear();

        this.texture.destroy();

        // note: don't nullify the element
        //       other systems may need to unbind from it during the destroy iteration (eg. GLContextSystem)
    }
}
