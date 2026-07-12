import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { Container } from '../../../../scene/container/Container';
import type { Renderer } from '../../types';
import type { RendererView } from './RendererView';

/**
 * The minimum shape every per-canvas data object tracked by a {@link ViewTracker} must satisfy.
 * The tracker only reads/writes `rootContainer`; everything else (overlays, boundaries, observers)
 * lives on the system-specific extension of this interface.
 * @internal
 */
export interface TrackedViewData
{
    /** The container last rendered to this view's canvas, captured in {@link ViewTracker#setActive}. */
    rootContainer: Container | null;
}

/**
 * Configuration for a {@link ViewTracker}. Each per-canvas system (events, accessibility, DOM)
 * supplies the participation gate and the create/destroy closures for its own data object; the
 * tracker owns all the map, pointer, prerender, root-resolution and teardown bookkeeping.
 * @internal
 */
export interface ViewTrackerOptions<TData extends TrackedViewData>
{
    /** The renderer whose view registry this tracker mirrors. */
    renderer: Renderer;
    /** Whether a given renderer view participates in this system (e.g. `v => v.events`). */
    participates: (view: RendererView) => boolean;
    /** Builds the per-canvas data object for a newly added view. */
    create: (view: RendererView) => TData;
    /** Tears down a per-canvas data object that is being removed. */
    destroy: (data: TData) => void;
    /** Called after any add or remove, so callers can rebuild derived state (snapshots, feature unions). */
    onChange?: () => void;
}

/**
 * Shared per-canvas view bookkeeping for the renderer's multi-view systems. One renderer drives
 * several canvases; {@link EventSystem}, {@link AccessibilitySystem} and {@link DOMPipe} each keep
 * one of these to map a render target to its per-canvas state.
 *
 * {@link ViewSystem} owns resolving which on-screen view a frame targets; the tracker records that
 * view's container in {@link ViewTracker#setActive} and maps it to per-canvas data. It also
 * centralizes the main-view replacement rule and the root-resolution special case (the main view
 * follows {@link AbstractRenderer#lastObjectRendered}).
 * @internal
 */
export class ViewTracker<TData extends TrackedViewData>
{
    /** The data for the main canvas ({@link RendererView#isMain}) or a custom element via {@link ViewTracker#register}. */
    public mainView: TData | null = null;

    /** The data the current frame renders to, resolved in {@link ViewTracker#setActive}. */
    private _activeView: TData | null = null;

    /** Per-canvas data keyed by the canvas/element object it belongs to. */
    private readonly _views: Map<ICanvas | EventTarget, TData> = new Map();
    /** The renderer whose view registry this tracker mirrors. */
    private readonly _renderer: Renderer;
    /** Whether a given renderer view participates in this system. */
    private readonly _participates: (view: RendererView) => boolean;
    /** Builds the per-canvas data object for a newly added view. */
    private readonly _create: (view: RendererView) => TData;
    /** Tears down a per-canvas data object that is being removed. */
    private readonly _destroy: (data: TData) => void;
    /** Called after any add or remove. */
    private readonly _onChange?: () => void;

    /**
     * @param options - the participation gate and create/destroy closures for this system
     */
    constructor(options: ViewTrackerOptions<TData>)
    {
        this._renderer = options.renderer;
        this._participates = options.participates;
        this._create = options.create;
        this._destroy = options.destroy;
        this._onChange = options.onChange;
    }

    /** The number of tracked views. */
    public get size(): number
    {
        return this._views.size;
    }

    /** The data the current frame renders to, or `null` between frames. Set via {@link ViewTracker#setActive}. */
    public get activeView(): TData | null
    {
        return this._activeView;
    }

    /**
     * A snapshot of the tracked data, safe to iterate while views are added or removed.
     *
     * Allocates a fresh array on every call, so it must not be used on a per-frame or per-event hot
     * path - cache the result (as {@link EventSystem} does for its pointer fan-out) instead.
     * @returns a fresh array of the tracked data objects
     */
    public values(): TData[]
    {
        return [...this._views.values()];
    }

    /**
     * Looks up the data for a canvas/element.
     * @param key - the canvas (from a view) or the native event target the data was keyed by
     * @returns the tracked data, or `undefined` when nothing is registered for the key
     */
    public get(key: ICanvas | EventTarget): TData | undefined
    {
        return this._views.get(key);
    }

    /**
     * Whether any data is registered for a canvas/element.
     * @param key - the canvas (from a view) or the native event target the data was keyed by
     * @returns `true` when a view is registered for the key
     */
    public has(key: ICanvas | EventTarget): boolean
    {
        return this._views.has(key);
    }

    /**
     * Adds a view from the `viewAdded` runner. Participation-gated; keyed by `view.canvas`. A
     * secondary view already tracked for the canvas is reused (the runner can fire more than once);
     * a main view added while another main is registered replaces it, destroying the old one first.
     * @param view - the renderer view that was added
     * @returns the data for the view, or `null` when the view does not participate
     */
    public addFromView(view: RendererView): TData | null
    {
        if (!this._participates(view)) return null;

        const existing = this._views.get(view.canvas);

        if (existing && !view.isMain) return existing;

        if (view.isMain && this.mainView) this._removeData(this.mainView);

        const data = this._create(view);

        this.register(view.canvas, view.isMain, data);

        return data;
    }

    /**
     * Stores pre-built data under a key, low-level path for a custom element with no
     * {@link RendererView} (see {@link EventSystem#setTargetElement}). Sets {@link ViewTracker#mainView}
     * when `isMain` and fires `onChange`. Does NOT call the create/destroy closures.
     *
     * Unlike {@link ViewTracker#addFromView}, this does not destroy an existing main view when
     * `isMain` is set, so a caller replacing the main view must remove the old one first (as
     * {@link EventSystem#setTargetElement} does via {@link ViewTracker#removeByKey}).
     * @param key - the canvas/element to key the data by
     * @param isMain - whether this data is the main view
     * @param data - the pre-built data object to store
     */
    public register(key: ICanvas | EventTarget, isMain: boolean, data: TData): void
    {
        this._views.set(key, data);

        if (isMain)
        {
            this.mainView = data;
        }

        this._onChange?.();
    }

    /**
     * Removes a view from the `viewRemoved` runner: destroys and unregisters the data keyed by
     * `view.canvas`.
     * @param view - the renderer view that was removed
     */
    public removeView(view: RendererView): void
    {
        this.removeByKey(view.canvas);
    }

    /**
     * Removes the data for a key: destroys it, unregisters it, nulls {@link ViewTracker#activeView}
     * and {@link ViewTracker#mainView} when they matched, then fires `onChange`. A no-op when nothing
     * is registered for the key.
     * @param key - the canvas/element whose data should be removed
     */
    public removeByKey(key: ICanvas | EventTarget): void
    {
        const data = this._views.get(key);

        if (!data) return;

        this._destroy(data);
        this._views.delete(key);

        if (this._activeView === data)
        {
            this._activeView = null;
        }

        if (this.mainView === data)
        {
            this.mainView = null;
        }

        this._onChange?.();
    }

    /**
     * Records the per-canvas data for the frame's active view and the container being rendered to it.
     *
     * The active view is resolved once per frame by {@link ViewSystem#prerender} and passed in here.
     * Callers must invoke this from a `prerender` hook, before the back buffer swaps `options.target`
     * in `renderStart`; {@link ViewSystem} runs first (higher extension priority; the per-canvas
     * systems append themselves to the `prerender` runner during their own init), so its resolved
     * view is already available.
     * @param view - the on-screen view this frame targets, from {@link ViewSystem#activeView}
     * @param container - the container being rendered to the view
     * @returns the resolved data, or `null` for an unregistered (offscreen / texture) target
     */
    public setActive(view: RendererView | null, container: Container): TData | null
    {
        const data = view ? this._views.get(view.canvas) : undefined;

        this._activeView = data ?? null;

        if (data)
        {
            data.rootContainer = container;
        }

        return this._activeView;
    }

    /**
     * Returns the active view and clears it, for a `postrender` hook that consumes it once per frame.
     * @returns the data resolved by the last {@link ViewTracker#setActive}, or `null`
     */
    public consumeActive(): TData | null
    {
        const data = this._activeView;

        this._activeView = null;

        return data;
    }

    /** Clears the active view without consuming it (e.g. when a system deactivates). */
    public clearActive(): void
    {
        this._activeView = null;
    }

    /**
     * The hit-test / scene root for a view. The main view keeps the historical
     * {@link AbstractRenderer#lastObjectRendered} semantics; other views use the container last
     * rendered to their canvas.
     * @param data - the tracked data to resolve the root for
     * @returns the root container, or `null` when nothing has been rendered to the view yet
     */
    public rootFor(data: TData): Container | null
    {
        return data === this.mainView
            ? (this._renderer.lastObjectRendered ?? data.rootContainer)
            : data.rootContainer;
    }

    /** Destroys every tracked data object, clears the map and nulls the main/active pointers. */
    public destroyAll(): void
    {
        for (const data of this._views.values())
        {
            this._destroy(data);
        }

        this._views.clear();
        this.mainView = null;
        this._activeView = null;
    }

    /**
     * Removes a data object found by identity, used for the main-view replacement where the key is
     * not at hand. A no-op when the data is not tracked.
     * @param data - the data object to remove
     */
    private _removeData(data: TData): void
    {
        for (const [key, value] of this._views)
        {
            if (value === data)
            {
                this.removeByKey(key);

                return;
            }
        }
    }
}
