/* eslint-disable no-restricted-globals */
import { CanvasObserver } from '../dom/CanvasObserver';
import { FederatedEvent } from '../events/FederatedEvent';
import { ExtensionType } from '../extensions/Extensions';
import { type TrackedViewData, ViewTracker } from '../rendering/renderers/shared/view/ViewTracker';
import { isMobile } from '../utils/browser/isMobile';
import { removeItems } from '../utils/data/removeItems';
import { warn } from '../utils/logging/warn';
import { type AccessibleHTMLElement } from './accessibilityTarget';

import type { Rectangle } from '../maths/shapes/Rectangle';
import type { RenderOptions } from '../rendering/renderers/shared/system/AbstractRenderer';
import type { System } from '../rendering/renderers/shared/system/System';
import type { CanvasSource } from '../rendering/renderers/shared/texture/sources/CanvasSource';
import type { CanvasView } from '../rendering/renderers/shared/view/CanvasView';
import type { Renderer } from '../rendering/renderers/types';
import type { Container } from '../scene/container/Container';
import type { isMobileResult } from '../utils/browser/isMobile';

/**
 * The per-canvas accessibility state tracked by the {@link AccessibilitySystem}. One view exists
 * for the renderer's main canvas and, under multiView, one for every additional canvas registered
 * with the renderer. Each owns its own overlay div, {@link CanvasObserver}, accessible-object list
 * and div pools, so a render to one canvas never garbage-collects another's overlays.
 *
 * The overlay DOM (`div`/`observer`) is built lazily: a view added while accessibility is inactive
 * keeps them `null` until activation, matching the legacy "register now, build on Tab" behaviour.
 * @internal
 */
interface AccessibilityViewData extends TrackedViewData
{
    /** The canvas view this overlay belongs to. */
    canvasView: CanvasView;
    /** The canvas this overlay sits over. */
    element: HTMLCanvasElement;
    /** The overlay container the accessible divs are appended to, kept in sync with the canvas. */
    div: HTMLElement | null;
    /** Keeps the overlay div aligned with the canvas's page position and scale. */
    observer: CanvasObserver | null;
    /** The accessible containers currently overlaid for this canvas. */
    children: Container[];
    /** Recyclable divs keyed by accessible element type. */
    pools: Record<string, AccessibleHTMLElement[]>;
    /** Per-canvas frame counter used to detect containers that are no longer rendered. */
    renderId: number;
    /** Per-canvas throttle timestamp for android div updates. */
    androidUpdateCount: number;
    /** The canvas source backing the element (null for the main view, which follows the renderer). */
    source: CanvasSource | null;
    /** The container last rendered to this canvas; the scene graph walked for accessible objects. */
    rootContainer: Container | null;
}

/** @ignore */
const KEY_CODE_TAB = 9;

const DIV_TOUCH_SIZE = 100;
const DIV_TOUCH_POS_X = 0;
const DIV_TOUCH_POS_Y = 0;
const DIV_TOUCH_ZINDEX = 2;

const DIV_HOOK_SIZE = 1;
const DIV_HOOK_POS_X = -1000;
const DIV_HOOK_POS_Y = -1000;
const DIV_HOOK_ZINDEX = 2;

/**
 * Initialisation options for the accessibility system when used with an Application.
 * @category accessibility
 * @advanced
 */
export interface AccessibilitySystemOptions
{
    /** Options for the accessibility system */
    accessibilityOptions?: AccessibilityOptions;
}

/**
 * The options for the accessibility system.
 * @category accessibility
 * @advanced
 */
export interface AccessibilityOptions
{
    /** Whether to enable accessibility features on initialization instead of waiting for tab key */
    enabledByDefault?: boolean;
    /** Whether to visually show the accessibility divs for debugging */
    debug?: boolean;
    /** Whether to allow tab key press to activate accessibility features */
    activateOnTab?: boolean;
    /** Whether to deactivate accessibility when mouse moves */
    deactivateOnMouseMove?: boolean;
}

/**
 * The Accessibility system provides screen reader and keyboard navigation support for PixiJS content.
 * It creates an accessible DOM layer over the canvas that can be controlled programmatically or through user interaction.
 *
 * By default, the system activates when users press the tab key. This behavior can be customized through options:
 * ```js
 * const app = new Application({
 *     accessibilityOptions: {
 *     // Enable immediately instead of waiting for tab
 *     enabledByDefault: true,
 *     // Disable tab key activation
 *     activateOnTab: false,
 *     // Show/hide accessibility divs
 *     debug: false,
 *     // Prevent accessibility from being deactivated when mouse moves
 *     deactivateOnMouseMove: false,
 * }
 * });
 * ```
 *
 * The system can also be controlled programmatically by accessing the `renderer.accessibility` property:
 * ```js
 * app.renderer.accessibility.setAccessibilityEnabled(true);
 * ```
 *
 * To make individual containers accessible:
 * ```js
 * container.accessible = true;
 * ```
 * There are several properties that can be set on a Container to control its accessibility which can
 * be found here: {@link AccessibleOptions}.
 * @category accessibility
 * @standard
 */
export class AccessibilitySystem implements System<AccessibilitySystemOptions>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
        ],
        name: 'accessibility',
    } as const;

    /**
     * The default options used by the system.
     * You can set these before initializing the {@link Application} to change the default behavior.
     * @example
     * ```js
     * import { AccessibilitySystem } from 'pixi.js';
     *
     * AccessibilitySystem.defaultOptions.enabledByDefault = true;
     *
     * const app = new Application()
     * app.init()
     * ```
     */
    public static defaultOptions: AccessibilityOptions = {
        /**
         * Whether to enable accessibility features on initialization
         * @default false
         */
        enabledByDefault: false,
        /**
         * Whether to visually show the accessibility divs for debugging
         * @default false
         */
        debug: false,
        /**
         * Whether to activate accessibility when tab key is pressed
         * @default true
         */
        activateOnTab: true,
        /**
         * Whether to deactivate accessibility when mouse moves
         * @default true
         */
        deactivateOnMouseMove: true,
    };

    /** Whether accessibility divs are visible for debugging */
    public debug = false;

    /** Whether to activate on tab key press */
    private _activateOnTab = true;

    /** Whether to deactivate accessibility when mouse moves */
    private _deactivateOnMouseMove = true;

    /**
     * The renderer this accessibility manager works for.
     * @type {WebGLRenderer|WebGPURenderer}
     */
    private _renderer: Renderer;

    /** Internal variable, see isActive getter. */
    private _isActive = false;

    /** Internal variable, see isMobileAccessibility getter. */
    private _isMobileAccessibility = false;

    /** Button element for handling touch hooks. */
    private _hookDiv: HTMLElement | null;

    /**
     * Per-canvas view bookkeeping. Holds the main view and, under multiView, one view per additional
     * canvas registered with the renderer. The tracker owns the canvas-keyed map, the main/active
     * pointers and the prerender target resolution; this system only supplies the overlay
     * create/destroy closures and the activation attach.
     */
    private readonly _tracker: ViewTracker<AccessibilityViewData>;

    /**  The frequency to update the div elements. */
    private readonly _androidUpdateFrequency = 500; // 2fps

    /** Bound function references for proper event listener removal */
    private _boundOnKeyDown: (e: KeyboardEvent) => void = this._onKeyDown.bind(this);
    private _boundOnMouseMove: (e: MouseEvent) => void = this._onMouseMove.bind(this);

    // eslint-disable-next-line jsdoc/require-param
    /**
     * @param {WebGLRenderer|WebGPURenderer} renderer - A reference to the current renderer
     */
    constructor(renderer: Renderer, private readonly _mobileInfo: isMobileResult = isMobile)
    {
        this._hookDiv = null;

        if (_mobileInfo.tablet || _mobileInfo.phone)
        {
            this._createTouchHook();
        }

        this._renderer = renderer;

        this._tracker = new ViewTracker<AccessibilityViewData>({
            renderer,
            participates: (view) => view.accessibility,
            create: (view) => this._createView(view),
            destroy: (data) => this._teardownView(data, true),
        });
    }

    /**
     * Value of `true` if accessibility is currently active and accessibility layers are showing.
     * @type {boolean}
     * @readonly
     */
    get isActive(): boolean
    {
        return this._isActive;
    }

    /**
     * Value of `true` if accessibility is enabled for touch devices.
     * @type {boolean}
     * @readonly
     */
    get isMobileAccessibility(): boolean
    {
        return this._isMobileAccessibility;
    }

    /**
     * Button element for handling touch hooks.
     * @readonly
     */
    get hookDiv()
    {
        return this._hookDiv;
    }

    /**
     * The DOM element that sits over the renderer's main canvas. This is where the main view's
     * div overlays go. Under multiView each additional canvas has its own overlay, managed internally.
     * @readonly
     */
    get div()
    {
        return this._tracker.mainView?.div ?? null;
    }

    /**
     * Creates the touch hooks.
     * @private
     */
    private _createTouchHook(): void
    {
        const hookDiv = document.createElement('button');

        hookDiv.style.width = `${DIV_HOOK_SIZE}px`;
        hookDiv.style.height = `${DIV_HOOK_SIZE}px`;
        hookDiv.style.position = 'absolute';
        hookDiv.style.top = `${DIV_HOOK_POS_X}px`;
        hookDiv.style.left = `${DIV_HOOK_POS_Y}px`;
        hookDiv.style.zIndex = DIV_HOOK_ZINDEX.toString();
        hookDiv.style.backgroundColor = '#FF0000';
        hookDiv.title = 'select to enable accessibility for this content';

        hookDiv.addEventListener('focus', () =>
        {
            this._isMobileAccessibility = true;
            this._activate();
            this._destroyTouchHook();
        });

        document.body.appendChild(hookDiv);
        this._hookDiv = hookDiv;
    }

    /**
     * Destroys the touch hooks.
     * @private
     */
    private _destroyTouchHook(): void
    {
        if (!this._hookDiv)
        {
            return;
        }
        document.body.removeChild(this._hookDiv);
        this._hookDiv = null;
    }

    /**
     * Registers a canvas view for accessibility. The renderer emits this for its main canvas
     * during init and for every canvas passed to {@link AbstractRenderer#addView}. Overlays are
     * created lazily on activation, so a view registered while inactive is recorded here and gets
     * its overlay when accessibility next activates.
     * @param view - the canvas view that was added
     * @ignore
     */
    public viewAdded(view: CanvasView): void
    {
        if (!view.accessibility) return;

        const data = this._tracker.addFromView(view);

        if (!data) return;

        // a main view registered after activation still needs its overlay attached and the render
        // hooks started, the work _activate normally does for it
        if (view.isMain && this._isActive)
        {
            data.observer?.ensureAttached();
            this._initAccessibilitySetup();
        }
    }

    /**
     * Removes a canvas view from accessibility, tearing down its overlay. The renderer emits this
     * when a view's canvas source is destroyed or {@link AbstractRenderer#removeView} is called.
     * @param view - the canvas view that was removed
     * @ignore
     */
    public viewRemoved(view: CanvasView): void
    {
        this._tracker.removeView(view);
    }

    /**
     * Activating will cause the Accessibility layer to be shown.
     * This is called when a user presses the tab key.
     * @private
     */
    private _activate(): void
    {
        if (this._isActive)
        {
            return;
        }

        this._isActive = true;

        // build the overlays for every tracked view now that accessibility is on. The views are
        // already registered with the tracker via the viewAdded runner; activation just materialises
        // their overlay DOM
        for (const data of this._tracker.values())
        {
            this._buildOverlay(data);
        }

        // Add listeners using the stored bound references
        if (this._activateOnTab)
        {
            globalThis.addEventListener('keydown', this._boundOnKeyDown, false);
        }

        if (this._deactivateOnMouseMove)
        {
            globalThis.document.addEventListener('mousemove', this._boundOnMouseMove, true);
        }

        // Check if canvas is in DOM
        const canvas = this._renderer.view.canvas;

        if (!canvas.parentNode)
        {
            const observer = new MutationObserver(() =>
            {
                if (canvas.parentNode)
                {
                    observer.disconnect();

                    // Add to DOM
                    this._tracker.mainView?.observer?.ensureAttached();
                    // Only start the postrender runner after div is ready
                    this._initAccessibilitySetup();
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        }
        else
        {
            // Add to DOM
            this._tracker.mainView?.observer?.ensureAttached();
            // Div is ready, initialize accessibility
            this._initAccessibilitySetup();
        }
    }

    // New method to handle initialization after div is ready
    private _initAccessibilitySetup(): void
    {
        // prerender resolves the target view before the back buffer can swap it; postrender then
        // walks that view's scene and lays out its overlay
        this._renderer.runners.prerender.add(this);
        this._renderer.runners.postrender.add(this);

        // Force an initial update of accessible objects
        if (this._renderer.lastObjectRendered && this._tracker.mainView)
        {
            this._updateView(this._tracker.mainView);
        }
    }

    /**
     * Materialises a tracked view's overlay DOM on activation: an absolutely positioned container div
     * kept aligned with the canvas by a {@link CanvasObserver}. No-op if the overlay already exists.
     * Secondary views attach immediately; the main view follows the renderer and attaches in
     * {@link AccessibilitySystem#_activate}.
     * @param data - the tracked view to build an overlay for
     */
    private _buildOverlay(data: AccessibilityViewData): void
    {
        if (data.div) return;

        const div = document.createElement('div');

        div.style.position = 'absolute';
        div.style.top = `${DIV_TOUCH_POS_X}px`;
        div.style.left = `${DIV_TOUCH_POS_Y}px`;
        div.style.pointerEvents = 'none';
        div.style.zIndex = DIV_TOUCH_ZINDEX.toString();

        data.div = div;
        data.observer = new CanvasObserver({
            domElement: div,
            renderer: this._renderer,
            source: data.source ?? undefined,
        });

        // the main view follows the renderer and is attached to the DOM in _activate; a secondary
        // view attaches its overlay immediately
        if (data.canvasView.isMain) return;

        data.observer.ensureAttached();
    }

    /**
     * The tracker's {@link ViewTracker#create} closure: builds the per-canvas data object for a newly
     * added view. The overlay DOM is built lazily (only while accessibility is active) by
     * {@link AccessibilitySystem#_buildOverlay}.
     * @param canvasView - the canvas view the overlay belongs to
     * @returns the tracked view data for the canvas
     */
    private _createView(canvasView: CanvasView): AccessibilityViewData
    {
        // the main view follows the renderer (null source); secondary views track their own source
        const source = canvasView.isMain ? null : canvasView.source;

        const data: AccessibilityViewData = {
            canvasView,
            element: canvasView.canvas as HTMLCanvasElement,
            div: null,
            observer: null,
            children: [],
            pools: {},
            renderId: 0,
            androidUpdateCount: 0,
            source,
            rootContainer: null,
        };

        if (this._isActive)
        {
            this._buildOverlay(data);
        }

        return data;
    }

    /**
     * Deactivates the accessibility system. Removes listeners and accessibility elements.
     * @private
     */
    private _deactivate(): void
    {
        if (!this._isActive || this._isMobileAccessibility)
        {
            return;
        }

        this._isActive = false;

        // Switch listeners
        globalThis.document.removeEventListener('mousemove', this._boundOnMouseMove, true);
        if (this._activateOnTab)
        {
            globalThis.addEventListener('keydown', this._boundOnKeyDown, false);
        }

        this._renderer.runners.prerender.remove(this);
        this._renderer.runners.postrender.remove(this);
        this._tracker.clearActive();

        // Tear down every overlay while keeping the views registered with the tracker so they rebuild
        // on the next activation. Secondary views drop their observer + div entirely; the main view
        // keeps its div + observer for reuse, matching legacy behaviour.
        for (const view of this._tracker.values())
        {
            this._teardownView(view, view !== this._tracker.mainView);
        }
    }

    /**
     * Detaches a view's overlay and recycles its accessible state. When `full` the observer and div
     * are destroyed too; otherwise they are kept detached for reuse (the main view across reactivation).
     * @param view - the view to tear down
     * @param full - whether to also destroy the observer and drop the div
     */
    private _teardownView(view: AccessibilityViewData, full: boolean): void
    {
        for (const child of view.children)
        {
            child._accessibleDiv?.parentNode?.removeChild(child._accessibleDiv);
            child._accessibleDiv = null;
            child._accessibleActive = false;
        }
        view.children.length = 0;

        for (const accessibleType in view.pools)
        {
            view.pools[accessibleType].forEach((div) => div.parentNode?.removeChild(div));
        }
        view.pools = {};

        view.div?.parentNode?.removeChild(view.div);
        view.rootContainer = null;
        // do NOT null view.source here: it is the secondary view's readonly CanvasSource (from the
        // CanvasView) and must survive a deactivate->reactivate cycle, or _buildOverlay rebuilds the
        // observer against the main canvas. The full-destroy path drops the whole data object anyway.

        if (full)
        {
            view.observer?.destroy();
            view.observer = null;
            view.div = null;
        }
    }

    /**
     * This recursive function will run through the scene graph and add any new accessible objects to the DOM layer.
     * @private
     * @param {Container} container - The Container to check.
     * @param view - the overlay view the accessible objects belong to
     */
    private _updateAccessibleObjects(container: Container, view: AccessibilityViewData): void
    {
        if (!container.visible || !container.accessibleChildren)
        {
            return;
        }

        // Separate check for accessibility without requiring interactivity
        if (container.accessible)
        {
            if (!container._accessibleActive)
            {
                this._addChild(container, view);
            }

            container._renderId = view.renderId;
        }

        const children = container.children;

        if (children)
        {
            for (let i = 0; i < children.length; i++)
            {
                this._updateAccessibleObjects(children[i] as Container, view);
            }
        }
    }

    /**
     * Runner init called, view is available at this point.
     * @ignore
     */
    public init(options?: AccessibilitySystemOptions): void
    {
        // Ensure we have the accessibilityOptions object
        const defaultOpts = AccessibilitySystem.defaultOptions;
        const mergedOptions = {
            accessibilityOptions: {
                ...defaultOpts,
                ...(options?.accessibilityOptions || {})
            }
        };

        this.debug = mergedOptions.accessibilityOptions.debug;
        this._activateOnTab = mergedOptions.accessibilityOptions.activateOnTab;
        this._deactivateOnMouseMove = mergedOptions.accessibilityOptions.deactivateOnMouseMove;

        // register any views that already exist on the renderer. The renderer emits viewAdded for the
        // main view during ViewSystem.init, but the runner order is not guaranteed and a system can be
        // constructed after init (as in tests), so pick up the registry here too.
        for (const view of this._renderer.view.views)
        {
            this.viewAdded(view);
        }

        if (mergedOptions.accessibilityOptions.enabledByDefault)
        {
            this._activate();
        }

        // a system is auto-added to every runner whose method it implements; stay off the render
        // hooks until activation re-adds us once the overlay is ready (_initAccessibilitySetup)
        this._renderer.runners.prerender.remove(this);
        this._renderer.runners.postrender.remove(this);
    }

    /**
     * Updates the accessibility layer during rendering.
     * - Removes divs for containers no longer in the scene
     * - Updates the position and dimensions of the root div
     * - Updates positions of active accessibility divs
     * Only fires while the accessibility system is active.
     * @ignore
     */
    public postrender(): void
    {
        // the active view is resolved in prerender, before any back-buffer swap. A null active view
        // (offscreen RenderTexture render, or a secondary canvas registered with accessibility:false)
        // must not relayout/re-attach the main overlay against a stale root.
        const view = this._tracker.consumeActive();

        if (!view) return;

        /* On Android default web browser, tab order seems to be calculated by position rather than tabIndex,
        *  moving buttons can cause focus to flicker between two buttons making it hard/impossible to navigate,
        *  so I am just running update every half a second, seems to fix it.
        */
        const now = performance.now();

        if (this._mobileInfo.android.device && now < view.androidUpdateCount)
        {
            return;
        }

        view.androidUpdateCount = now + this._androidUpdateFrequency;

        this._updateView(view);
    }

    /**
     * Resolves which overlay this render targets, before a system such as the back buffer can swap
     * `options.target` in renderStart. Consumed by {@link AccessibilitySystem#postrender}.
     * @param options - the options the renderer was called with
     * @ignore
     */
    public prerender(options: RenderOptions): void
    {
        // records the frame's active view (resolved by ViewSystem) and its rootContainer
        this._tracker.setActive(this._renderer.view.activeView, options.container);
    }

    /**
     * Walks a view's scene graph, syncs its accessible divs (adding new ones, recycling stale ones),
     * and repositions them over the view's canvas.
     * @param view - the overlay view to update
     */
    private _updateView(view: AccessibilityViewData): void
    {
        const root = this._tracker.rootFor(view);

        // Track which containers are still active this frame
        const activeIds = new Set<number>();

        if (root)
        {
            this._updateAccessibleObjects(root, view);

            // Mark all updated containers as active. The loop index is the child's position in
            // view.children, so use it directly instead of indexOf (which made this O(K^2)).
            for (let i = 0; i < view.children.length; i++)
            {
                if (view.children[i]._renderId === view.renderId)
                {
                    activeIds.add(i);
                }
            }
        }

        // Remove any containers that weren't updated this frame
        for (let i = view.children.length - 1; i >= 0; i--)
        {
            const child = view.children[i];

            if (!activeIds.has(i))
            {
                // Container was removed, clean up its accessibility div
                if (child._accessibleDiv && child._accessibleDiv.parentNode)
                {
                    child._accessibleDiv.parentNode.removeChild(child._accessibleDiv);

                    const pool = this._getPool(child.accessibleType, view);

                    pool.push(child._accessibleDiv);
                    child._accessibleDiv = null;
                }
                child._accessibleActive = false;
                removeItems(view.children, i, 1);
            }
        }

        // Ensure the overlay is attached to the same parent as its canvas
        view.observer?.ensureAttached();

        // Update positions of existing divs
        for (let i = 0; i < view.children.length; i++)
        {
            const child = view.children[i];

            if (!child._accessibleActive || !child._accessibleDiv)
            {
                continue;
            }

            // Only update position-related properties
            const div = child._accessibleDiv;
            const hitArea = (child.hitArea || child.getBounds().rectangle) as Rectangle;

            if (child.hitArea)
            {
                const wt = child.worldTransform;

                div.style.left = `${(wt.tx + (hitArea.x * wt.a))}px`;
                div.style.top = `${(wt.ty + (hitArea.y * wt.d))}px`;
                div.style.width = `${hitArea.width * wt.a}px`;
                div.style.height = `${hitArea.height * wt.d}px`;
            }
            else
            {
                this._capHitArea(hitArea, view);
                div.style.left = `${hitArea.x}px`;
                div.style.top = `${hitArea.y}px`;
                div.style.width = `${hitArea.width}px`;
                div.style.height = `${hitArea.height}px`;
            }
        }

        // increment the render id..
        view.renderId++;
    }

    /**
     * private function that will visually add the information to the
     * accessibility div
     * @param {HTMLElement} div -
     */
    private _updateDebugHTML(div: AccessibleHTMLElement): void
    {
        div.innerHTML = `type: ${div.type}</br> title : ${div.title}</br> tabIndex: ${div.tabIndex}`;
    }

    /**
     * Adjust the hit area based on the bounds of a display object
     * @param {Rectangle} hitArea - Bounds of the child
     * @param view - the overlay view whose canvas dimensions bound the hit area
     */
    private _capHitArea(hitArea: Rectangle, view: AccessibilityViewData): void
    {
        if (hitArea.x < 0)
        {
            hitArea.width += hitArea.x;
            hitArea.x = 0;
        }

        if (hitArea.y < 0)
        {
            hitArea.height += hitArea.y;
            hitArea.y = 0;
        }

        // the main view clamps to the renderer dimensions; a secondary view clamps to its own
        // canvas source's logical size
        const { width: viewWidth, height: viewHeight } = view === this._tracker.mainView || !view.source
            ? this._renderer
            : view.source;

        if (hitArea.x + hitArea.width > viewWidth)
        {
            hitArea.width = viewWidth - hitArea.x;
        }

        if (hitArea.y + hitArea.height > viewHeight)
        {
            hitArea.height = viewHeight - hitArea.y;
        }
    }

    /**
     * Creates or reuses a div element for a Container and adds it to the accessibility layer.
     * Sets up ARIA attributes, event listeners, and positioning based on the container's properties.
     * @private
     * @param {Container} container - The child to make accessible.
     * @param view - the overlay view the child belongs to
     */
    private _addChild<T extends Container>(container: T, view: AccessibilityViewData = this._tracker.mainView): void
    {
        const pool = this._getPool(container.accessibleType, view);

        let div = pool.pop();

        if (div)
        {
            /*
             * Reset these properties so we don't have outdated metadata.
             * It was possible to end up with:
             * - the old tabIndex if container.interactive is false
             * - the old aria-label if container.accessibleHint is not set
             */
            div.innerHTML = '';
            div.removeAttribute('title');
            div.removeAttribute('aria-label');
            div.tabIndex = 0;
        }
        else
        {
            if (container.accessibleType === 'button')
            {
                div = document.createElement('button');
            }
            else
            {
                div = document.createElement(container.accessibleType);
                div.style.cssText = `
                        color: transparent;
                        pointer-events: none;
                        padding: 0;
                        margin: 0;
                        border: 0;
                        outline: 0;
                        background: transparent;
                        box-sizing: border-box;
                        user-select: none;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                    `;
                if (container.accessibleText)
                {
                    div.innerText = container.accessibleText;
                }
            }
            div.style.width = `${DIV_TOUCH_SIZE}px`;
            div.style.height = `${DIV_TOUCH_SIZE}px`;
            div.style.backgroundColor = this.debug ? 'rgba(255,255,255,0.5)' : 'transparent';
            div.style.position = 'absolute';
            div.style.zIndex = DIV_TOUCH_ZINDEX.toString();
            div.style.borderStyle = 'none';

            // ARIA attributes ensure that button title and hint updates are announced properly
            if (navigator.userAgent.toLowerCase().includes('chrome'))
            {
                // Chrome doesn't need aria-live to work as intended; in fact it just gets more confused.
                div.setAttribute('aria-live', 'off');
            }
            else
            {
                div.setAttribute('aria-live', 'polite');
            }

            if (navigator.userAgent.match(/rv:.*Gecko\//))
            {
                // FireFox needs this to announce only the new button name
                div.setAttribute('aria-relevant', 'additions');
            }
            else
            {
                // required by IE, other browsers don't much care
                div.setAttribute('aria-relevant', 'text');
            }

            div.addEventListener('click', this._onClick.bind(this));
            div.addEventListener('focus', this._onFocus.bind(this));
            div.addEventListener('focusout', this._onFocusOut.bind(this));
        }

        // set pointer events
        div.style.pointerEvents = container.accessiblePointerEvents;
        // set the type, this defaults to button!
        div.type = container.accessibleType;

        if (container.accessibleTitle && container.accessibleTitle !== null)
        {
            div.title = container.accessibleTitle;
        }
        else if (!container.accessibleHint
            || container.accessibleHint === null)
        {
            div.title = `container ${container.tabIndex}`;
        }

        if (container.accessibleHint
            && container.accessibleHint !== null)
        {
            div.setAttribute('aria-label', container.accessibleHint);
        }

        if (container.interactive)
        {
            div.tabIndex = container.tabIndex;
        }
        else
        {
            // reset tabIndex back to 0 in case this div instance was pulled from the pool and already had a value
            div.tabIndex = 0;
        }

        if (this.debug)
        {
            this._updateDebugHTML(div);
        }

        container._accessibleActive = true;
        container._accessibleDiv = div;
        div.container = container;

        view.children.push(container);
        // _addChild only runs while active, so the overlay div is guaranteed built here
        view.div!.appendChild(container._accessibleDiv);
    }

    /**
     * Dispatch events with the EventSystem, scoped to the canvas the accessible div belongs to.
     * @param e
     * @param type
     * @private
     */
    private _dispatchEvent(e: UIEvent, type: string[]): void
    {
        const div = e.target as AccessibleHTMLElement;
        const { container: target } = div;
        const events = this._renderer.events;
        // resolve the owning canvas's view once; a null owner (direct test usage / unparented div)
        // falls back to the main view, which always participates in events
        const view = this._viewForDiv(div);

        // a recognised owning view whose canvas opted out of events must not dispatch into its scene
        // nor pollute the main boundary; drop the interaction here
        if (view && !view.canvasView.events)
        {
            // #if _DEBUG
            warn('[AccessibilitySystem]: accessible-div event ignored, its view opted out of events');
            // #endif

            return;
        }

        // route to the boundary of the canvas whose overlay this div sits in (the main view when
        // the div has no recognised owner, e.g. direct test usage)
        const element = view?.element;
        const boundary = events.boundaryForElement(element);
        const event: FederatedEvent = Object.assign(new FederatedEvent(boundary), { target });

        boundary.rootTarget = events.rootTargetForElement(element);
        type.forEach((type) => boundary.dispatchEvent(event, type));
    }

    /**
     * Finds the overlay view an accessible div belongs to, by the overlay it is parented to.
     * @param div - the accessible div that received a DOM event
     */
    private _viewForDiv(div: AccessibleHTMLElement): AccessibilityViewData | null
    {
        for (const view of this._tracker.values())
        {
            if (view.div === div.parentNode) return view;
        }

        return null;
    }

    /**
     * Maps the div button press to pixi's EventSystem (click)
     * @private
     * @param {MouseEvent} e - The click event.
     */
    private _onClick(e: MouseEvent): void
    {
        this._dispatchEvent(e, ['click', 'pointertap', 'tap']);
    }

    /**
     * Maps the div focus events to pixi's EventSystem (mouseover)
     * @private
     * @param {FocusEvent} e - The focus event.
     */
    private _onFocus(e: FocusEvent): void
    {
        if (!(e.target as Element).getAttribute('aria-live'))
        {
            (e.target as Element).setAttribute('aria-live', 'assertive');
        }

        this._dispatchEvent(e, ['mouseover']);
    }

    /**
     * Maps the div focus events to pixi's EventSystem (mouseout)
     * @private
     * @param {FocusEvent} e - The focusout event.
     */
    private _onFocusOut(e: FocusEvent): void
    {
        if (!(e.target as Element).getAttribute('aria-live'))
        {
            (e.target as Element).setAttribute('aria-live', 'polite');
        }

        this._dispatchEvent(e, ['mouseout']);
    }

    /**
     * Is called when a key is pressed
     * @private
     * @param {KeyboardEvent} e - The keydown event.
     */
    private _onKeyDown(e: KeyboardEvent): void
    {
        if (e.keyCode !== KEY_CODE_TAB || !this._activateOnTab)
        {
            return;
        }

        this._activate();
    }

    /**
     * Is called when the mouse moves across the renderer element
     * @private
     * @param {MouseEvent} e - The mouse event.
     */
    private _onMouseMove(e: MouseEvent): void
    {
        if (e.movementX === 0 && e.movementY === 0)
        {
            return;
        }

        this._deactivate();
    }

    /**
     * Destroys the accessibility system. Removes all elements and listeners.
     * > [!IMPORTANT] This is typically called automatically when the {@link Application} is destroyed.
     * > A typically user should not need to call this method directly.
     */
    public destroy(): void
    {
        this._deactivate();
        this._destroyTouchHook();

        // _deactivate keeps the main view's div + observer for reuse; tear everything down now. The
        // tracker runs the destroy closure (_teardownView(data, true)) for every tracked view, clears
        // the map and nulls its main/active pointers.
        this._tracker.destroyAll();

        this._renderer = null;
        this._hookDiv = null;

        // Remove listeners using the stored bound references
        globalThis.removeEventListener('keydown', this._boundOnKeyDown);
        this._boundOnKeyDown = null;
        globalThis.document.removeEventListener('mousemove', this._boundOnMouseMove, true);
        this._boundOnMouseMove = null;
    }

    /**
     * Enables or disables the accessibility system.
     * @param enabled - Whether to enable or disable accessibility.
     * @example
     * ```js
     * app.renderer.accessibility.setAccessibilityEnabled(true); // Enable accessibility
     * app.renderer.accessibility.setAccessibilityEnabled(false); // Disable accessibility
     * ```
     */
    public setAccessibilityEnabled(enabled: boolean): void
    {
        if (enabled)
        {
            this._activate();
        }
        else
        {
            this._deactivate();
        }
    }

    private _getPool(accessibleType: string, view: AccessibilityViewData): AccessibleHTMLElement[]
    {
        view.pools[accessibleType] ??= [];

        return view.pools[accessibleType];
    }
}
