import { DOMAdapter } from '../environment/adapter';
import { Container } from '../scene/container/Container';
import { warn } from '../utils/logging/warn';
import { ResizeController } from './ResizeController';

import type { ColorSource } from '../color/Color';
import type { ICanvas } from '../environment/canvas/ICanvas';
import type { EventSystemFeatures } from '../events/EventSystem';
import type { Rectangle } from '../maths/shapes/Rectangle';
import type { RenderOptions } from '../rendering/renderers/shared/system/AbstractRenderer';
import type { CanvasView } from '../rendering/renderers/shared/view/CanvasView';
import type { Renderer } from '../rendering/renderers/types';
import type { DestroyOptions } from '../scene/container/destroyTypes';

/**
 * Options for creating a {@link RenderView} via {@link Application#addView}.
 * @category app
 * @standard
 */
export interface RenderViewOptions<R extends Renderer = Renderer>
{
    /**
     * The canvas this view renders to. If omitted, a new canvas is created (but not attached to
     * the DOM - you must append `view.canvas` yourself for events and DOM/accessibility overlays to work).
     */
    canvas?: R['canvas'];
    /** The root container rendered to this view's canvas. Defaults to a new {@link Container}. */
    stage?: Container;
    /** The color used to clear the canvas before each render. Defaults to the renderer's background. */
    clearColor?: ColorSource;
    /**
     * Whether the view is rendered as part of {@link Application#render}. Toggle to cheaply pause a view.
     * @default true
     */
    enabled?: boolean;
    /**
     * An element to automatically resize this view's canvas to, mirroring {@link Application#resizeTo}
     * but scoped to this view. The primary view is resized via {@link Application#resizeTo} instead.
     */
    resizeTo?: Window | HTMLElement;
    /** If provided with `height`, resizes the view's canvas once on creation. */
    width?: number;
    /** If provided with `width`, resizes the view's canvas once on creation. */
    height?: number;
    /** The resolution / device pixel ratio for this view's canvas. Defaults to the renderer's resolution. */
    resolution?: number;
    /** Whether the canvas's CSS size is kept independent of its resolution. Defaults to the renderer's setting. */
    autoDensity?: boolean;
    /**
     * Whether this view's canvas participates in the event system. Ignored for the primary view.
     * @default true
     */
    events?: boolean;
    /**
     * Whether this view's canvas participates in the accessibility system. Ignored for the primary view.
     * @default true
     */
    accessibility?: boolean;
    /**
     * Whether this view's canvas renders DOM elements. Ignored for the primary view.
     * @default true
     */
    dom?: boolean;
    /** Per-view overrides for the event system features. Ignored for the primary view. */
    eventFeatures?: Partial<EventSystemFeatures>;
    /**
     * Whether anti-aliasing is enabled for this view. Defaults to the renderer's antialias. Ignored
     * for the primary view; affects WebGPU secondary canvases.
     */
    antialias?: boolean;
    /**
     * Whether this view's canvas is transparent (drives the WebGPU canvas alphaMode). Defaults to the
     * renderer's background alpha being less than 1. Ignored for the primary view.
     */
    transparent?: boolean;
    /** Whether coordinates are rounded to whole pixels when rendering this view. Defaults to the renderer's roundPixels. */
    roundPixels?: boolean;
    /**
     * Whether the view's canvas is cleared before each render. Defaults to the renderer's
     * clearBeforeRender. Setting `false` skips the pre-render clear, but a secondary view presents
     * from a shared (WebGL) or transient (WebGPU) surface, so its previous-frame pixels are not
     * preserved and draws do not accumulate across frames.
     */
    clear?: boolean;
}

/**
 * A canvas the {@link Application} renders a {@link Container} to. Every application has a
 * {@link Application#primaryView primaryView} wrapping the renderer's own canvas and the main
 * {@link Application#stage stage}; additional views are created with {@link Application#addView}
 * to drive extra canvases from the same renderer (the multiView feature).
 *
 * Each view pairs a canvas with a stage, an optional clear color, and its own auto-resize target.
 * @example
 * ```ts
 * const app = new Application();
 * await app.init({ multiView: true });
 *
 * const minimap = app.addView({ canvas: minimapCanvas, clearColor: 0x222222 });
 * minimap.stage.addChild(mapSprite);
 *
 * // app.render() renders the primary view and every added view each frame
 * ```
 * @category app
 * @standard
 */
export class RenderView<R extends Renderer = Renderer>
{
    /** The canvas this view renders to. */
    public canvas: R['canvas'];
    /** The root container rendered to this view's canvas. */
    public stage: Container;
    /** The color used to clear the canvas before each render, or undefined to use the renderer's background. */
    public clearColor?: ColorSource;
    /** Whether {@link Application#render} renders this view. */
    public enabled: boolean;
    /** Whether this is the application's primary view (wrapping the renderer's own canvas and stage). */
    public readonly isPrimary: boolean;

    private _renderer: R;
    /**
     * The canvas view registered for a secondary canvas, so per-canvas systems (events,
     * accessibility, DOM) track it. Null for the primary view, whose canvas view is the main one.
     */
    private _canvasView: CanvasView | null = null;
    /** Whether this view created its own canvas (and so should detach it on destroy). */
    private readonly _ownsCanvas: boolean;
    /**
     * Resolved per-render clear flag forwarded into `renderer.render`. `undefined` defers to the
     * renderer's `clearBeforeRender`.
     */
    private readonly _clear: boolean | undefined;
    /** Auto-resize controller; resizes this view (without rendering) when its target changes size. */
    private readonly _resizeController: ResizeController;
    /**
     * Reused render-options object passed to `renderer.render` each frame, so a view at scale does
     * not allocate a fresh literal per frame. The renderer mutates this object during render (it
     * normalizes `clearColor` to an array and defaults `target`/`clear`/`transform`), so every field
     * is reset from this view's own state before each render to avoid leaking a stale value.
     */
    private readonly _renderOptions: RenderOptions;

    /**
     * @param renderer - the renderer all views share
     * @param options - the view configuration
     * @param isPrimary - whether this is the application's primary view
     */
    constructor(renderer: R, options: RenderViewOptions<R> = {}, isPrimary = false)
    {
        this._renderer = renderer;
        this.isPrimary = isPrimary;

        this._ownsCanvas = !options.canvas && !isPrimary;
        this.canvas = options.canvas
            ?? (isPrimary ? renderer.canvas : DOMAdapter.get().createCanvas() as R['canvas']);

        this.stage = options.stage ?? new Container();
        this.clearColor = options.clearColor;
        this.enabled = options.enabled ?? true;

        this._clear = options.clear;

        // #if _DEBUG
        if (options.clear === false && !isPrimary)
        {
            const context = (renderer as Renderer & { context?: { multiView?: boolean } }).context;

            if (context && 'multiView' in context && context.multiView)
            {
                warn('RenderView: clear:false does not accumulate draws for a secondary view. Under WebGL '
                    + 'multiView every canvas presents by blitting from a shared context canvas, so this '
                    + 'view\'s previous-frame pixels are not preserved.');
            }
        }
        // #endif

        // we deliberately do NOT render on auto-resize: a secondary view's render would leave
        // Renderer#lastObjectRendered pointing at this view's stage instead of the primary's,
        // breaking main-canvas event hit-testing until the next frame.
        this._resizeController = new ResizeController((width, height) => this.resize(width, height));

        this._renderOptions = { container: this.stage };

        // register the secondary canvas with the renderer so its per-canvas systems (events,
        // accessibility, DOM) track it; the primary view reuses the renderer's main view
        if (!isPrimary)
        {
            this._canvasView = renderer.addView({
                canvas: this.canvas,
                resolution: options.resolution,
                autoDensity: options.autoDensity,
                events: options.events,
                accessibility: options.accessibility,
                dom: options.dom,
                eventFeatures: options.eventFeatures,
                antialias: options.antialias,
                transparent: options.transparent,
                roundPixels: options.roundPixels,
            });
        }

        if (options.width !== undefined && options.height !== undefined)
        {
            this.resize(options.width, options.height, options.resolution);
        }

        if (options.resizeTo)
        {
            this.resizeTo = options.resizeTo;
        }
    }

    /**
     * The renderer-level {@link CanvasView} backing this view, or null for the primary view (whose
     * canvas view is the renderer's auto-registered main view at `renderer.views[0]`).
     */
    public get canvasView(): CanvasView | null
    {
        return this._canvasView;
    }

    /**
     * An element this view's canvas is automatically resized to. Setting it attaches a throttled
     * window resize listener and resizes immediately; setting null detaches it.
     */
    public get resizeTo(): Window | HTMLElement
    {
        return this._resizeController.resizeTo;
    }

    public set resizeTo(dom: Window | HTMLElement | null)
    {
        this._resizeController.resizeTo = dom ?? null;
    }

    /**
     * The CSS-pixel viewport of this view, `(0, 0, width, height)`. The primary view reports the
     * renderer's screen; a secondary view reports its own canvas size.
     */
    public get screen(): Rectangle
    {
        return this.isPrimary ? this._renderer.screen : (this._canvasView?.screen ?? this._renderer.screen);
    }

    /** Renders this view's stage to its canvas. Called for every enabled view by {@link Application#render}. */
    public render(): void
    {
        // per-view roundPixels is applied by ViewSystem.prerender, which resolves the active view
        // from this render's target before the WebGL back buffer swaps it.

        // reset every field the renderer reads or mutates from this view's own state, so a value
        // normalized/defaulted by a previous frame (e.g. clearColor turned into an array, target
        // defaulted to the main render target, transform set from the container) cannot leak into
        // this frame. The primary view omits `target` so it takes the main-view fast path and stays
        // byte-for-byte identical to a classic single-canvas Application.render.
        const options = this._renderOptions;

        options.container = this.stage;
        options.target = this.isPrimary ? undefined : this.canvas;
        options.clearColor = this.clearColor;
        options.clear = this._clear;
        options.transform = undefined;

        this._renderer.render(options);
    }

    /**
     * Resizes this view's canvas. The primary view resizes the renderer itself; a secondary view
     * resizes only its own canvas source, leaving the renderer's main view untouched.
     * @param width - the width in CSS pixels
     * @param height - the height in CSS pixels
     * @param resolution - the resolution / device pixel ratio; defaults to the view's current resolution
     */
    public resize(width: number, height: number, resolution?: number): void
    {
        if (this.isPrimary)
        {
            this._renderer.resize(width, height, resolution);

            return;
        }

        // a secondary view always registers a canvas view in the constructor before this runs;
        // CanvasSource.resize defaults an omitted resolution to the source's current one
        this._canvasView!.source.resize(width, height, resolution);
    }

    /**
     * Destroys this view, removing its resize listener. A stage-destroy option destroys the stage too;
     * a canvas this view created is detached from the DOM.
     * @param stageDestroyOptions - if provided, the view's stage is destroyed with these options
     */
    public destroy(stageDestroyOptions?: DestroyOptions): void
    {
        // a directly-destroyed view may still be in Application#_views; disabling it first means the
        // next Application.render skips it instead of dereferencing the nulled stage/renderer below
        this.enabled = false;

        this._resizeController.destroy();

        // a canvas this view created is fully owned, so its source must be destroyed too; capture it
        // before removeView (which deliberately preserves user-supplied sources) nulls _canvasView
        const ownedSource = this._ownsCanvas ? this._canvasView?.source : null;

        if (this._canvasView)
        {
            this._renderer.removeView(this._canvasView);
            this._canvasView = null;
        }

        if (stageDestroyOptions !== undefined)
        {
            this.stage?.destroy(stageDestroyOptions);
        }

        if (this._ownsCanvas)
        {
            const canvas = this.canvas as ICanvas as HTMLCanvasElement;

            canvas?.parentNode?.removeChild(canvas);

            // destroy the owned source so getCanvasTexture's module-level canvasCache (a strong Map)
            // does not pin the canvas/texture/source for the process lifetime. Idempotent with removeView.
            ownedSource?.destroy();
        }

        this.stage = null;
        this.canvas = null;
        this._renderer = null;
    }
}
