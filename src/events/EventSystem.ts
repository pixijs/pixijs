import { ExtensionType } from '../extensions/Extensions';
import { type TrackedViewData, ViewTracker } from '../rendering/renderers/shared/view/ViewTracker';
import { EventBoundary } from './EventBoundary';
import { EventsTicker } from './EventTicker';
import { FederatedPointerEvent } from './FederatedPointerEvent';
import { FederatedWheelEvent } from './FederatedWheelEvent';

import type { ExtensionMetadata } from '../extensions/Extensions';
import type { PointData } from '../maths/point/PointData';
import type { RenderOptions } from '../rendering/renderers/shared/system/AbstractRenderer';
import type { System } from '../rendering/renderers/shared/system/System';
import type { CanvasSource } from '../rendering/renderers/shared/texture/sources/CanvasSource';
import type { RendererView } from '../rendering/renderers/shared/view/RendererView';
import type { Renderer } from '../rendering/renderers/types';
import type { Container } from '../scene/container/Container';
import type { PixiTouch } from './FederatedEvent';
import type { EventMode } from './FederatedEventTarget';
import type { FederatedMouseEvent } from './FederatedMouseEvent';

const MOUSE_POINTER_ID = 1;
const TOUCH_TO_POINTER: Record<string, string> = {
    touchstart: 'pointerdown',
    touchend: 'pointerup',
    touchendoutside: 'pointerupoutside',
    touchmove: 'pointermove',
    touchcancel: 'pointercancel',
};

/**
 * The per-view event state tracked by the {@link EventSystem}. A view is created for the
 * renderer's main canvas and for every canvas that is rendered to via
 * `renderer.render({ container, target })`. Each view behaves like an independent
 * single-canvas event surface: it has its own event boundary (hit-testing and per-pointer
 * state), its own coordinate mapping, and its own cursor.
 * @category events
 * @advanced
 */
export interface EventsViewData extends TrackedViewData
{
    /** The DOM element (usually a canvas) that the view's scoped event listeners are bound to. */
    element: HTMLElement;
    /** The event boundary that performs hit-testing and event dispatch for this view. */
    boundary: EventBoundary;
    /** The canvas source backing the element, used for per-view resolution mapping. */
    source: CanvasSource | null;
    /** The container last rendered to this view; used as the boundary's root target. */
    rootContainer: Container | null;
    /** The cursor mode currently applied to the element. */
    currentCursor: string | null;
    /**
     * The renderer view this data was registered for, or `null` for the main view when it is
     * bound to a custom element via {@link EventSystem#setTargetElement}.
     */
    rendererView: RendererView | null;
    /**
     * The event features resolved for this view at registration: the renderer-wide
     * {@link EventSystem#features} overridden by the view's own {@link RendererView#eventFeatures}.
     */
    features: EventSystemFeatures;
    /**
     * A cached snapshot of the element's client rect, populated lazily on the first coordinate
     * map after each invalidation so pointer moves don't force a layout per view per event. It is
     * a plain copy (not a retained live `DOMRect`) and is invalidated (set to `null`) when the
     * view's canvas resizes or the page scrolls/resizes.
     */
    clientRect: { left: number; top: number; width: number; height: number } | null;
    /**
     * The `resize` listener bound to this view's canvas source that invalidates
     * {@link EventsViewData#clientRect}, or `null` for a custom main element with no source. Held so
     * it can be removed when the view is torn down.
     */
    onSourceResize: (() => void) | null;
}

/**
 * Options for configuring the PixiJS event system. These options control how the event system
 * handles different types of interactions and event propagation.
 * @example
 * ```ts
 * // Basic event system configuration
 * const app = new Application();
 * await app.init({
 *     // Configure default interaction mode
 *     eventMode: 'static',
 *
 *     // Configure event features
 *     eventFeatures: {
 *         move: true,           // Enable pointer movement events
 *         globalMove: false,    // Disable global move events
 *         click: true,          // Enable click events
 *         wheel: true          // Enable wheel/scroll events
 *     }
 * });
 *
 * // Access event system after initialization
 * const eventSystem = app.renderer.events;
 * console.log(eventSystem.features); // Check enabled features
 * ```
 * @see {@link EventSystem} For the main event system implementation
 * @see {@link EventMode} For interaction mode details
 * @see {@link EventSystemFeatures} For all available feature options
 * @advanced
 * @category events
 */
export interface EventSystemOptions
{
    /**
     * The default event mode for all display objects.
     * Controls how objects respond to interaction events.
     *
     * Possible values:
     * - `'none'`: No interaction events
     * - `'passive'`: Only container's children receive events (default)
     * - `'auto'`: Receives events when parent is interactive
     * - `'static'`: Standard interaction events
     * - `'dynamic'`: Like static but with additional synthetic events
     * @default 'passive'
     */
    eventMode?: EventMode;

    /**
     * Configuration for enabling/disabling specific event features.
     * Use this to optimize performance by turning off unused functionality.
     * @example
     * ```ts
     * const app = new Application();
     * await app.init({
     *     eventFeatures: {
     *         // Core interaction events
     *         move: true,        // Pointer/mouse/touch movement
     *         click: true,       // Click/tap events
     *         wheel: true,       // Mouse wheel/scroll events
     *         // Global tracking
     *         globalMove: false  // Global pointer movement
     *     }
     * });
     * ```
     */
    eventFeatures?: Partial<EventSystemFeatures>;
}

/**
 * The event features that are enabled by the EventSystem. These features control
 * different types of interaction events in your PixiJS application.
 * @example
 * ```ts
 * // Configure features during application initialization
 * const app = new Application();
 * await app.init({
 *     eventFeatures: {
 *         // Basic interaction events
 *         move: true,        // Enable pointer movement tracking
 *         click: true,       // Enable click/tap events
 *         wheel: true,       // Enable mouse wheel/scroll events
 *         // Advanced features
 *         globalMove: false  // Disable global move tracking for performance
 *     }
 * });
 *
 * // Or configure after initialization
 * app.renderer.events.features.move = false;      // Disable movement events
 * app.renderer.events.features.globalMove = true; // Enable global tracking
 * ```
 * @since 7.2.0
 * @category events
 * @advanced
 */
export interface EventSystemFeatures
{
    /**
     * Enables pointer events associated with pointer movement.
     *
     * When enabled, these events will fire:
     * - `pointermove` / `mousemove` / `touchmove`
     * - `pointerout` / `mouseout`
     * - `pointerover` / `mouseover`
     * @example
     * ```ts
     * // Enable movement events
     * app.renderer.events.features.move = true;
     *
     * // Listen for movement
     * sprite.on('pointermove', (event) => {
     *     console.log('Pointer position:', event.global.x, event.global.y);
     * });
     * ```
     * @default true
     */
    move: boolean;

    /**
     * Enables global pointer move events that fire regardless of target.
     *
     * When enabled, these events will fire:
     * - `globalpointermove`
     * - `globalmousemove`
     * - `globaltouchmove`
     * @example
     * ```ts
     * // Enable global tracking
     * app.renderer.events.features.globalMove = true;
     *
     * // Track pointer globally
     * sprite.on('globalpointermove', (event) => {
     *     // Fires even when pointer is not over sprite
     *     console.log('Global position:', event.global.x, event.global.y);
     * });
     * ```
     * @default true
     */
    globalMove: boolean;
    /**
     * Enables pointer events associated with clicking/tapping.
     *
     * When enabled, these events will fire:
     * - `pointerdown` / `mousedown` / `touchstart` / `rightdown`
     * - `pointerup` / `mouseup` / `touchend` / `rightup`
     * - `pointerupoutside` / `mouseupoutside` / `touchendoutside` / `rightupoutside`
     * - `click` / `tap`
     * @example
     * ```ts
     * // Enable click events
     * app.renderer.events.features.click = true;
     *
     * // Handle clicks
     * sprite.on('click', (event) => {
     *     console.log('Clicked at:', event.global.x, event.global.y);
     * });
     * ```
     * @default true
     */
    click: boolean;
    /**
     * Enables mouse wheel/scroll events.
     * @example
     * ```ts
     * // Enable wheel events
     * app.renderer.events.features.wheel = true;
     *
     * // Handle scrolling
     * sprite.on('wheel', (event) => {
     *     // Zoom based on scroll direction
     *     const scale = 1 + (event.deltaY / 1000);
     *     sprite.scale.set(sprite.scale.x * scale);
     * });
     * ```
     * @default true
     */
    wheel: boolean;
}

/**
 * The system for handling UI events in PixiJS applications. This class manages mouse, touch, and pointer events,
 * normalizing them into a consistent event model.
 * @example
 * ```ts
 * // Access event system through renderer
 * const eventSystem = app.renderer.events;
 *
 * // Configure event features
 * eventSystem.features.globalMove = false;  // Disable global move events
 * eventSystem.features.click = true;        // Enable click events
 *
 * // Set custom cursor styles
 * eventSystem.cursorStyles.default = 'pointer';
 * eventSystem.cursorStyles.grab = 'grab';
 *
 * // Get current pointer position
 * const pointer = eventSystem.pointer;
 * console.log(pointer.global.x, pointer.global.y);
 * ```
 *
 * Features:
 * - Normalizes browser events into consistent format
 * - Supports mouse, touch, and pointer events
 * - Handles event delegation and bubbling
 * - Provides cursor management
 * - Configurable event features
 * @see {@link EventBoundary} For event propagation and handling
 * @see {@link FederatedEvent} For the base event class
 * @see {@link EventMode} For interaction modes
 * @category events
 * @standard
 */
export class EventSystem implements System<EventSystemOptions>
{
    /** @ignore */
    public static extension: ExtensionMetadata = {
        name: 'events',
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.CanvasSystem,
            ExtensionType.WebGPUSystem,
        ],
        priority: -1,
    };

    /**
     * The event features that are enabled by the EventSystem
     * @since 7.2.0
     * @example
     * ```ts
     * import { EventSystem, EventSystemFeatures } from 'pixi.js';
     * // Access the default event features
     * EventSystem.defaultEventFeatures = {
     *     // Enable pointer movement events
     *     move: true,
     *     // Enable global pointer move events
     *     globalMove: true,
     *     // Enable click events
     *     click: true,
     *     // Enable wheel events
     *     wheel: true,
     * };
     * ```
     */
    public static defaultEventFeatures: EventSystemFeatures = {
        /** Enables pointer events associated with pointer movement. */
        move: true,
        /** Enables global pointer move events. */
        globalMove: true,
        /** Enables pointer events associated with clicking. */
        click: true,
        /** Enables wheel events. */
        wheel: true,
    };

    private static _defaultEventMode: EventMode;

    /**
     * The default interaction mode for all display objects.
     * @see Container.eventMode
     * @type {EventMode}
     * @readonly
     * @since 7.2.0
     */
    public static get defaultEventMode()
    {
        return this._defaultEventMode;
    }

    /**
     * The {@link EventBoundary} for the stage.
     *
     * The {@link EventBoundary#rootTarget rootTarget} of this root boundary is automatically set to
     * the last rendered object before any event processing is initiated. This means the main scene
     * needs to be rendered atleast once before UI events will start propagating.
     *
     * The root boundary should only be changed during initialization. Otherwise, any state held by the
     * event boundary may be lost (like hovered & pressed Containers).
     * @advanced
     */
    public readonly rootBoundary: EventBoundary;

    /**
     * Indicates whether the current device supports touch events according to the W3C Touch Events spec.
     * This is used to determine the appropriate event handling strategy.
     * @see {@link https://www.w3.org/TR/touch-events/} W3C Touch Events Specification
     * @readonly
     * @default 'ontouchstart' in globalThis
     */
    public readonly supportsTouchEvents = 'ontouchstart' in globalThis;

    /**
     * Indicates whether the current device supports pointer events according to the W3C Pointer Events spec.
     * Used to optimize event handling and provide more consistent cross-device interaction.
     * @see {@link https://www.w3.org/TR/pointerevents/} W3C Pointer Events Specification
     * @readonly
     * @default !!globalThis.PointerEvent
     */
    public readonly supportsPointerEvents = !!globalThis.PointerEvent;

    /**
     * Controls whether default browser actions are automatically prevented on pointer events.
     * When true, prevents default browser actions from occurring on pointer events.
     * @remarks
     * - Does not apply to pointer events for backwards compatibility
     * - preventDefault on pointer events stops mouse events from firing
     * - For every pointer event, there will always be either a mouse or touch event alongside it
     * - Setting this to false allows default browser actions (text selection, dragging images, etc.)
     * @example
     * ```ts
     * // Allow default browser actions
     * app.renderer.events.autoPreventDefault = false;
     *
     * // Block default actions (default)
     * app.renderer.events.autoPreventDefault = true;
     *
     * // Example with text selection
     * const text = new Text('Selectable text');
     * text.eventMode = 'static';
     * app.renderer.events.autoPreventDefault = false; // Allow text selection
     * ```
     * @default true
     */
    public autoPreventDefault: boolean;

    /**
     * Dictionary of custom cursor styles that can be used across the application.
     * Used to define how different cursor modes are handled when interacting with display objects.
     * @example
     * ```ts
     * // Access event system through renderer
     * const eventSystem = app.renderer.events;
     *
     * // Set string-based cursor styles
     * eventSystem.cursorStyles.default = 'pointer';
     * eventSystem.cursorStyles.hover = 'grab';
     * eventSystem.cursorStyles.drag = 'grabbing';
     *
     * // Use CSS object for complex styling
     * eventSystem.cursorStyles.custom = {
     *     cursor: 'url("custom.png") 2 2, auto',
     *     userSelect: 'none'
     * };
     *
     * // Use a url for custom cursors
     * const defaultIcon = 'url(\'https://pixijs.com/assets/bunny.png\'),auto';
     * eventSystem.cursorStyles.icon = defaultIcon;
     *
     * // Use callback function for dynamic cursors
     * eventSystem.cursorStyles.dynamic = (mode) => {
     *     // Update cursor based on mode
     *     document.body.style.cursor = mode === 'hover'
     *         ? 'pointer'
     *         : 'default';
     * };
     *
     * // Apply cursor style to a sprite
     * sprite.cursor = 'hover'; // Will use the hover style defined above
     * sprite.cursor = 'icon'; // Will apply the icon cursor
     * sprite.cursor = 'custom'; // Will apply the custom CSS styles
     * sprite.cursor = 'drag'; // Will apply the grabbing cursor
     * sprite.cursor = 'default'; // Will apply the default pointer cursor
     * sprite.cursor = 'dynamic'; // Will call the dynamic function
     * ```
     * @remarks
     * - Strings are treated as CSS cursor values
     * - Objects are applied as CSS styles to the DOM element
     * - Functions are called directly for custom cursor handling
     * - Default styles for 'default' and 'pointer' are provided
     * @default
     * ```ts
     * {
     *     default: 'inherit',
     *     pointer: 'pointer' // Default cursor styles
     * }
     * ```
     */
    public cursorStyles: Record<string, string | ((mode: string) => void) | CSSStyleDeclaration>;

    /**
     * The DOM element to which the main view's event listeners are bound. This is automatically
     * set to the renderer's {@link Renderer#view view}.
     *
     * Assigning to this property is equivalent to calling {@link EventSystem#setTargetElement}.
     */
    public get domElement(): HTMLElement
    {
        return this._views.mainView?.element ?? null;
    }

    public set domElement(element: HTMLElement)
    {
        this.setTargetElement(element);
    }

    /** The resolution used to convert between the DOM client space into world space. */
    public resolution = 1;

    /** The renderer managing this {@link EventSystem}. */
    public renderer: Renderer;

    /**
     * The event features that are enabled by the EventSystem
     * @since 7.2.0
     * @example
     * const app = new Application()
     * app.renderer.events.features.globalMove = false
     *
     * // to override all features use Object.assign
     * Object.assign(app.renderer.events.features, {
     *  move: false,
     *  globalMove: false,
     *  click: false,
     *  wheel: false,
     * })
     */
    public readonly features: EventSystemFeatures;

    private readonly _rootPointerEvent: FederatedPointerEvent;
    private readonly _rootWheelEvent: FederatedWheelEvent;
    /**
     * Carrier event for non-main views, so the public {@link EventSystem#pointer} state
     * always reflects the main view's coordinate space.
     */
    private readonly _viewPointerEvent: FederatedPointerEvent;

    /**
     * Per-canvas view bookkeeping. Owns the element/data map, the main/active pointers, the
     * back-buffer-safe prerender target resolution, and the teardown - the per-view event state
     * (boundary + listeners) lives in the create/destroy closures passed to it in the constructor.
     */
    private readonly _views: ViewTracker<EventsViewData>;
    /**
     * Snapshot of the tracker's views iterated by the pointer fan-out, rebuilt as a fresh array
     * only when a view is added or removed (via the tracker's `onChange`). Iterating this instead
     * of the live map avoids a per-pointer-event allocation, and the fan-out captures the
     * reference so a handler that adds/removes a view mid-dispatch swaps in a new array without
     * corrupting the in-flight loop.
     */
    private _viewsList: EventsViewData[] = [];
    /** Whether the shared document/window level listeners are currently attached. */
    private _globalEventsAdded: boolean;
    /**
     * Whether ANY registered view enables move / click / wheel events. Native handlers bail when
     * the relevant union is false, then the per-view fan-out skips views whose own resolved
     * features disable the feature. Recomputed whenever a view is added or removed.
     */
    private _anyMove = false;
    private _anyClick = false;
    private _anyWheel = false;

    /**
     * @param {Renderer} renderer
     */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
        this.rootBoundary = new EventBoundary(null);
        EventsTicker.init(this);

        this.autoPreventDefault = true;
        this._globalEventsAdded = false;

        this._rootPointerEvent = new FederatedPointerEvent(null);
        this._rootWheelEvent = new FederatedWheelEvent(null);
        this._viewPointerEvent = new FederatedPointerEvent(null);

        this.cursorStyles = {
            default: 'inherit',
            pointer: 'pointer',
        };

        this.features = new Proxy({ ...EventSystem.defaultEventFeatures }, {
            set: (target, key, value) =>
            {
                target[key as keyof EventSystemFeatures] = value;

                if (key === 'globalMove')
                {
                    const globalMove = (target as EventSystemFeatures).globalMove;

                    // keep the rootBoundary in step even before the main view registers (matches init)
                    this.rootBoundary.enableGlobalMoveEvents = globalMove;

                    // a view follows the renderer-wide toggle unless it explicitly opted in/out via its
                    // own eventFeatures.globalMove; only that explicit override is preserved. The main
                    // view always tracks the live value (its boundary is the rootBoundary).
                    this._viewsList.forEach((view) =>
                    {
                        if (view === this._views.mainView) return;

                        const override = view.rendererView?.eventFeatures;
                        const resolved = override && 'globalMove' in override ? override.globalMove : globalMove;

                        view.boundary.enableGlobalMoveEvents = resolved;
                        view.features.globalMove = resolved;
                    });
                }

                // the main view references this object directly, so a move/click/wheel toggle here
                // changes whether that view participates - refresh the cached union flags to match
                this._recomputeFeatureUnion();

                return true;
            }
        });

        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);
        this._onPointerOverOut = this._onPointerOverOut.bind(this);
        this._onClientRectInvalidate = this._onClientRectInvalidate.bind(this);
        this.onWheel = this.onWheel.bind(this);

        this._views = new ViewTracker<EventsViewData>({
            renderer,
            participates: (view) => view.events,
            // the main view references the live this.features so runtime feature toggles still take
            // effect (single-canvas behavior); secondary views snapshot their resolved features so
            // later global changes do not retro-apply to them. The main view owns the rootBoundary
            // for backwards compatibility, secondary views get a fresh boundary.
            create: (view) => this._createView(
                view.canvas as unknown as HTMLElement,
                view.isMain ? this.rootBoundary : new EventBoundary(null),
                view.isMain,
                view.isMain ? (this.features as EventSystemFeatures) : this._resolveViewFeatures(view),
                view,
                view.source,
            ),
            destroy: (data) => this._destroyView(data),
            // native handlers read these caches: rebuild the fan-out snapshot and the feature union
            // whenever a view is added or removed
            onChange: () =>
            {
                this._viewsList = this._views.values();
                this._recomputeFeatureUnion();

                // the shared document/window listeners only need to exist while a view does
                if (this._views.size === 0)
                {
                    this._removeGlobalEvents();
                }
            },
        });
    }

    /**
     * Runner init called, view is available at this point.
     * @ignore
     */
    public init(options: EventSystemOptions): void
    {
        const { resolution } = this.renderer;

        this.resolution = resolution;
        EventSystem._defaultEventMode = options.eventMode ?? 'passive';
        Object.assign(this.features, options.eventFeatures ?? {});
        this.rootBoundary.enableGlobalMoveEvents = this.features.globalMove;

        // the main view is registered through the viewAdded runner emitted by ViewSystem.init,
        // which runs after this init (EventSystem is a higher-priority extension system, so the
        // resolved this.features above are in place before the main view is registered)
    }

    /**
     * Handle changing resolution.
     * @ignore
     */
    public resolutionChange(resolution: number): void
    {
        this.resolution = resolution;
    }

    /**
     * Runner hook called at the start of every render, before any system can swap the target
     * (e.g. the back buffer). Resolves the view the render targeted and records the container
     * being rendered to it, which becomes the hit-test root for events on that canvas.
     *
     * Views are registered through the {@link EventSystem#viewAdded} runner, not here, so this is
     * a slim per-frame hook. It must run before `renderStart` because the back buffer swaps
     * `options.target` there and the original target is only reliable beforehand.
     * @param options - the options the renderer was called with
     * @ignore
     */
    public prerender(options: RenderOptions): void
    {
        // the tracker resolves the target view and records its rootContainer; events do not use
        // the resolved activeView - per-event dispatch routes by the element the listener fired on
        this._views.setActive(options);
    }

    /**
     * Runner hook called when a view is registered with the renderer. Builds the per-view event
     * state (scoped element listeners, event boundary, resolved features). For the main view this
     * performs the registration that {@link EventSystem#setTargetElement} used to do at init.
     *
     * Does nothing if the view opted out of events via {@link RendererView#events}.
     * @param view - the view being registered
     * @ignore
     */
    public viewAdded(view: RendererView): void
    {
        // the tracker is participation-gated (v => v.events) and handles the main-view replacement
        // rule; the per-view event state is built in the create closure passed to the tracker
        this._views.addFromView(view);
    }

    /**
     * Runner hook called when a view is removed from the renderer. Tears down that view's
     * listeners and boundary and rebuilds the fan-out snapshot.
     * @param view - the view being removed
     * @ignore
     */
    public viewRemoved(view: RendererView): void
    {
        this._views.removeView(view);
    }

    /** Destroys all event listeners and detaches the renderer. */
    public destroy(): void
    {
        EventsTicker.destroy();

        // destroyAll runs the per-view destroy closure for each view but does not fire onChange,
        // so the shared global listeners are torn down explicitly here (the per-view destroy only
        // detaches element-scoped listeners)
        this._views.destroyAll();
        this._removeGlobalEvents();
        this.renderer = null;
    }

    /**
     * Sets the current cursor mode, handling any callbacks or CSS style changes.
     * The cursor can be a CSS cursor string, a custom callback function, or a key from the cursorStyles dictionary.
     * @param mode - Cursor mode to set. Can be:
     * - A CSS cursor string (e.g., 'pointer', 'grab')
     * - A key from the cursorStyles dictionary
     * - null/undefined to reset to default
     * @example
     * ```ts
     * // Using predefined cursor styles
     * app.renderer.events.setCursor('pointer');    // Set standard pointer cursor
     * app.renderer.events.setCursor('grab');       // Set grab cursor
     * app.renderer.events.setCursor(null);         // Reset to default
     *
     * // Using custom cursor styles
     * app.renderer.events.cursorStyles.custom = 'url("cursor.png"), auto';
     * app.renderer.events.setCursor('custom');     // Apply custom cursor
     *
     * // Using callback-based cursor
     * app.renderer.events.cursorStyles.dynamic = (mode) => {
     *     document.body.style.cursor = mode === 'hover' ? 'pointer' : 'default';
     * };
     * app.renderer.events.setCursor('dynamic');    // Trigger cursor callback
     * ```
     * @remarks
     * - Has no effect on OffscreenCanvas except for callback-based cursors
     * - Caches current cursor to avoid unnecessary DOM updates
     * - Supports CSS cursor values, style objects, and callback functions
     * @see {@link EventSystem.cursorStyles} For defining custom cursor styles
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/cursor} MDN Cursor Reference
     */
    public setCursor(mode: string): void
    {
        this._setCursor(mode, this._views.mainView);
    }

    /**
     * Sets the cursor mode for a specific view, applying styles to that view's element.
     * @param mode - the cursor mode to set
     * @param view - the view to apply the cursor to
     */
    private _setCursor(mode: string, view: EventsViewData): void
    {
        if (!view) return;

        mode ||= 'default';

        // if the mode didn't actually change, bail early
        if (view.currentCursor === mode)
        {
            return;
        }
        view.currentCursor = mode;

        const element = view.element;
        let applyStyles = true;

        // offscreen canvas does not support setting styles, but cursor modes can be functions,
        // in order to handle pixi rendered cursors, so we can't bail
        if (globalThis.OffscreenCanvas && element instanceof OffscreenCanvas)
        {
            applyStyles = false;
        }
        const style = this.cursorStyles[mode];

        // only do things if there is a cursor style for it
        if (style)
        {
            switch (typeof style)
            {
                case 'string':
                    // string styles are handled as cursor CSS
                    if (applyStyles)
                    {
                        element.style.cursor = style;
                    }
                    break;
                case 'function':
                    // functions are just called, and passed the cursor mode
                    style(mode);
                    break;
                case 'object':
                    // if it is an object, assume that it is a dictionary of CSS styles,
                    // apply it to the interactionDOMElement
                    if (applyStyles)
                    {
                        Object.assign(element.style, style);
                    }
                    break;
            }
        }
        else if (applyStyles && typeof mode === 'string' && !Object.prototype.hasOwnProperty.call(this.cursorStyles, mode))
        {
            // if it mode is a string (not a Symbol) and cursorStyles doesn't have any entry
            // for the mode, then assume that the dev wants it to be CSS for the cursor.
            element.style.cursor = mode;
        }
    }

    /**
     * The global pointer event instance containing the most recent pointer state.
     * This is useful for accessing pointer information without listening to events.
     * @example
     * ```ts
     * // Access current pointer position at any time
     * const eventSystem = app.renderer.events;
     * const pointer = eventSystem.pointer;
     *
     * // Get global coordinates
     * console.log('Position:', pointer.global.x, pointer.global.y);
     *
     * // Check button state
     * console.log('Buttons pressed:', pointer.buttons);
     *
     * // Get pointer type and pressure
     * console.log('Type:', pointer.pointerType);
     * console.log('Pressure:', pointer.pressure);
     * ```
     * @readonly
     * @since 7.2.0
     * @see {@link FederatedPointerEvent} For all available pointer properties
     */
    public get pointer(): Readonly<FederatedPointerEvent>
    {
        return this._rootPointerEvent;
    }

    /**
     * The {@link EventBoundary} for the view bound to a given canvas, or the
     * {@link EventSystem#rootBoundary} when the element is not a registered view. Lets systems
     * that dispatch synthetic events (e.g. accessibility) target the correct canvas under multiView.
     * @param element - The canvas whose view to resolve; defaults to the main view.
     * @advanced
     */
    public boundaryForElement(element?: EventTarget | null): EventBoundary
    {
        const view = (element && this._views.get(element)) || this._views.mainView;

        return view ? view.boundary : this.rootBoundary;
    }

    /**
     * The hit-test root container for the view bound to a given canvas, or the main view's
     * root when the element is not a registered view. The boundary returned by
     * {@link EventSystem#boundaryForElement} should be given this as its `rootTarget` before dispatch.
     * @param element - The canvas whose view to resolve; defaults to the main view.
     * @advanced
     */
    public rootTargetForElement(element?: EventTarget | null): Container | null
    {
        const view = (element && this._views.get(element)) || this._views.mainView;

        return view ? this._resolveRoot(view) : null;
    }

    /**
     * Resolves the view a DOM event was scoped to. Canvas-scoped listeners route by the
     * element they fired on; direct calls (no `currentTarget`) fall back to the main view.
     * @param nativeEvent - The native event to resolve a view for.
     */
    private _getViewForEvent(nativeEvent: Event): EventsViewData | null
    {
        return (nativeEvent.currentTarget && this._views.get(nativeEvent.currentTarget)) || this._views.mainView;
    }

    /**
     * The hit-test root for a view. The main view keeps the historical
     * {@link AbstractRenderer#lastObjectRendered} semantics; other views use the container
     * last rendered to their canvas. Delegated to the tracker, which centralizes this rule.
     * @param view - The view to resolve the root for.
     */
    private _resolveRoot(view: EventsViewData): Container
    {
        return this._views.rootFor(view);
    }

    /**
     * The carrier event used to bootstrap native events for a view. Only the main view
     * writes into the public {@link EventSystem#pointer} state, so its coordinates always
     * reflect the main view's space.
     * @param view - The view being dispatched to.
     */
    private _pointerEventFor(view: EventsViewData): FederatedPointerEvent
    {
        return view === this._views.mainView ? this._rootPointerEvent : this._viewPointerEvent;
    }

    /**
     * Maps, dispatches, and applies the cursor for a set of normalized pointer events
     * against a single view.
     * @param view - The view to dispatch into.
     * @param normalizedEvents - The normalized pointer events from one native event.
     * @param typeSuffix - Appended to each event type (e.g. 'outside' for ups beyond the view).
     */
    private _dispatchToView(view: EventsViewData, normalizedEvents: PointerEvent[], typeSuffix = ''): void
    {
        const rootTarget = this._resolveRoot(view);

        if (!rootTarget) return;

        view.boundary.rootTarget = rootTarget;

        for (let i = 0, j = normalizedEvents.length; i < j; i++)
        {
            const event = this._bootstrapEvent(this._pointerEventFor(view), normalizedEvents[i], view);

            event.type += typeSuffix;

            view.boundary.mapEvent(event);
        }

        this._setCursor(view.boundary.cursor, view);
    }

    /**
     * Event handler for pointer down events on a view's element.
     * @param nativeEvent - The native mouse/pointer/touch event.
     */
    private _onPointerDown(nativeEvent: MouseEvent | PointerEvent | TouchEvent): void
    {
        if (!this._anyClick) return;

        const view = this._getViewForEvent(nativeEvent);

        if (!view || !view.features.click) return;

        const events = this._normalizeToPointerData(nativeEvent);

        /*
         * No need to prevent default on natural pointer events, as there are no side effects
         * Normalized events, however, may have the double mousedown/touchstart issue on the native android browser,
         * so still need to be prevented.
         */

        // Guaranteed that there will be at least one event in events, and all events must have the same pointer type

        if (this.autoPreventDefault && (events[0] as any).isNormalized)
        {
            const cancelable = nativeEvent.cancelable || !('cancelable' in nativeEvent);

            if (cancelable)
            {
                nativeEvent.preventDefault();
            }
        }

        this._dispatchToView(view, events);
    }

    /**
     * Event handler for pointer move events, listened to at the document level.
     * The move is delivered to every view so that each view can synthesize its own
     * over/out events and so drags keep receiving moves outside their canvas.
     * @param nativeEvent - The native mouse/pointer/touch events.
     */
    private _onPointerMove(nativeEvent: MouseEvent | PointerEvent | TouchEvent): void
    {
        if (!this._anyMove) return;

        EventsTicker.pointerMoved();

        const normalizedEvents = this._normalizeToPointerData(nativeEvent);

        // capture the reference: a handler that adds/removes a view mid-fan-out swaps in a
        // new array (see _viewsList), leaving this loop iterating the snapshot it started with
        const views = this._viewsList;

        for (let i = 0, j = views.length; i < j; i++)
        {
            if (!views[i].features.move) continue;

            this._dispatchToView(views[i], normalizedEvents);
        }
    }

    /**
     * Event handler for pointer up events, listened to at the window level.
     * Each view decides independently whether the up happened inside or outside of it.
     * @param nativeEvent - The native mouse/pointer/touch event.
     */
    private _onPointerUp(nativeEvent: MouseEvent | PointerEvent | TouchEvent): void
    {
        if (!this._anyClick) return;

        let target = nativeEvent.target;

        // if in shadow DOM use composedPath to access target
        if (nativeEvent.composedPath && nativeEvent.composedPath().length > 0)
        {
            target = nativeEvent.composedPath()[0];
        }

        const normalizedEvents = this._normalizeToPointerData(nativeEvent);

        const views = this._viewsList;

        for (let i = 0, j = views.length; i < j; i++)
        {
            const view = views[i];

            if (!view.features.click) continue;

            this._dispatchToView(view, normalizedEvents, target !== view.element ? 'outside' : '');
        }
    }

    /**
     * Event handler for pointer over & out events on a view's element.
     * @param nativeEvent - The native mouse/pointer/touch event.
     */
    private _onPointerOverOut(nativeEvent: MouseEvent | PointerEvent | TouchEvent): void
    {
        if (!this._anyClick) return;

        const view = this._getViewForEvent(nativeEvent);

        if (!view || !view.features.click) return;

        this._dispatchToView(view, this._normalizeToPointerData(nativeEvent));
    }

    /**
     * Passive handler for `wheel` events on a view's element.
     * @param nativeEvent - The native wheel event.
     */
    protected onWheel(nativeEvent: WheelEvent): void
    {
        if (!this._anyWheel) return;

        const view = this._getViewForEvent(nativeEvent);

        if (!view || !view.features.wheel) return;

        const wheelEvent = this.normalizeWheelEvent(nativeEvent, view);

        view.boundary.rootTarget = this._resolveRoot(view);
        view.boundary.mapEvent(wheelEvent);
    }

    /**
     * Sets the {@link EventSystem#domElement domElement} and binds event listeners.
     * This method manages the DOM event bindings for the event system, allowing you to
     * change or remove the target element that receives input events.
     * > [!IMPORTANT] This will default to the canvas element of the renderer, so you
     * > should not need to call this unless you are using a custom element.
     * @param element - The new DOM element to bind events to, or null to remove all event bindings
     * @example
     * ```ts
     * // Set a new canvas element as the target
     * const canvas = document.createElement('canvas');
     * app.renderer.events.setTargetElement(canvas);
     *
     * // Remove all event bindings
     * app.renderer.events.setTargetElement(null);
     *
     * // Switch to a different canvas
     * const newCanvas = document.querySelector('#game-canvas');
     * app.renderer.events.setTargetElement(newCanvas);
     * ```
     * @remarks
     * - Automatically removes event listeners from previous element
     * - Required for the event system to function
     * - Safe to call multiple times
     * @see {@link EventSystem#domElement} The current DOM element
     * @see {@link EventsTicker} For the ticker system that tracks pointer movement
     */
    public setTargetElement(element: HTMLElement): void
    {
        const mainView = this._views.mainView;

        if (mainView)
        {
            // removeByKey runs the destroy closure (detaches listeners) and, via onChange, clears
            // the shared global listeners and main pointer if this was the last view
            this._views.removeByKey(mainView.element);
        }

        // the ticker is keyed to the main element, so its lifecycle is owned here
        // rather than by the shared global listeners
        EventsTicker.removeTickerListener();
        EventsTicker.domElement = element;

        if (element)
        {
            // if the element was already registered as a secondary view, replace it -
            // the main view must own the rootBoundary for backwards compatibility
            if (this._views.get(element))
            {
                this._views.removeByKey(element);
            }

            // a custom main element has no RendererView; it references the live this.features so
            // runtime feature toggles still take effect, matching single-canvas behavior. The
            // low-level register() path stores pre-built data without invoking create/destroy.
            const data = this._createView(
                element,
                this.rootBoundary,
                true,
                this.features as EventSystemFeatures,
                null,
                null,
            );

            this._views.register(element, true, data);
        }
    }

    /**
     * Resolves a view's event features: the renderer-wide {@link EventSystem#features} (read as
     * plain values) overridden by the view's own {@link RendererView#eventFeatures}. Resolved once
     * at registration, so later changes to the renderer-wide features do not retro-apply to a view.
     * @param view - the renderer view to resolve features for
     */
    private _resolveViewFeatures(view: RendererView): EventSystemFeatures
    {
        return {
            ...(this.features as EventSystemFeatures),
            ...view.eventFeatures,
        };
    }

    /**
     * Recomputes the union feature flags across all registered views. Native handlers bail before
     * fanning out when the relevant union is false; the fan-out then skips views whose own resolved
     * features disable the feature.
     */
    private _recomputeFeatureUnion(): void
    {
        let move = false;
        let click = false;
        let wheel = false;

        for (let i = 0, j = this._viewsList.length; i < j; i++)
        {
            const features = this._viewsList[i].features;

            move ||= features.move;
            click ||= features.click;
            wheel ||= features.wheel;
        }

        this._anyMove = move;
        this._anyClick = click;
        this._anyWheel = wheel;
    }

    /**
     * Builds a view record for the given element and attaches its scoped event listeners. This is
     * the tracker's `create` closure for the {@link EventSystem#viewAdded} runner, and is also used
     * directly by {@link EventSystem#setTargetElement} for a custom main element. It only builds the
     * record and binds listeners; the tracker owns storing it in the map, rebuilding the fan-out
     * snapshot and recomputing the feature union (via `onChange`).
     * @param element - the DOM element the view is bound to
     * @param boundary - the event boundary that owns hit-testing for the view
     * @param isMain - whether this is the main view; it owns the ticker and the public pointer state
     * @param features - the resolved per-view event features
     * @param rendererView - the renderer view this record is for, or null for a custom main element
     * @param source - the canvas source backing the element, or null for a custom main element
     */
    private _createView(
        element: HTMLElement,
        boundary: EventBoundary,
        isMain: boolean,
        features: EventSystemFeatures,
        rendererView: RendererView | null,
        source: CanvasSource | null,
    ): EventsViewData
    {
        const view: EventsViewData = {
            element,
            boundary,
            source,
            rootContainer: null,
            currentCursor: null,
            rendererView,
            features,
            clientRect: null,
            onSourceResize: null,
        };

        boundary.enableGlobalMoveEvents = features.globalMove;

        // a canvas resize moves/scales its client rect, so invalidate the cache when the view's
        // backing source resizes (custom main elements have no source)
        if (source)
        {
            const onSourceResize = (): void =>
            {
                view.clientRect = null;
            };

            view.onSourceResize = onSourceResize;
            source.on('resize', onSourceResize);
        }

        this._addGlobalEvents();
        this._toggleViewEvents(view, true);

        if (isMain)
        {
            // the ticker is keyed to the main element, so its lifecycle is owned here
            EventsTicker.removeTickerListener();
            EventsTicker.domElement = element;
            EventsTicker.addTickerListener();
        }

        return view;
    }

    /**
     * Tears down a view's event listeners and releases its references. This is the tracker's
     * `destroy` closure; the tracker owns removing it from the map, rebuilding the fan-out snapshot
     * and recomputing the feature union (via `onChange`), and the shared global listeners are torn
     * down by that `onChange` (or by {@link EventSystem#destroy}) once the last view is gone.
     * @param view - the view to tear down
     */
    private _destroyView(view: EventsViewData): void
    {
        this._toggleViewEvents(view, false);

        // detach the per-view rect-invalidation listener before dropping the source reference
        if (view.source && view.onSourceResize)
        {
            view.source.off('resize', view.onSourceResize);
        }
        view.onSourceResize = null;
        view.clientRect = null;

        // release references so removed views don't pin scene graphs or sources
        view.rootContainer = null;
        view.source = null;
        view.boundary.rootTarget = null;
    }

    /** Register the shared document/window level listeners (move + up). */
    private _addGlobalEvents(): void
    {
        if (this._globalEventsAdded)
        {
            return;
        }

        this._toggleGlobalEvents(true);
        this._globalEventsAdded = true;
    }

    /** Unregister the shared document/window level listeners. */
    private _removeGlobalEvents(): void
    {
        if (!this._globalEventsAdded)
        {
            return;
        }

        this._toggleGlobalEvents(false);
        this._globalEventsAdded = false;
    }

    /**
     * Adds or removes the shared document/window level listeners. Moves are listened to
     * document-wide so drags continue outside a canvas; ups are window-wide so
     * `pointerupoutside` can be synthesized.
     * @param add - whether to add or remove the listeners
     */
    private _toggleGlobalEvents(add: boolean): void
    {
        const method = add ? 'addEventListener' : 'removeEventListener';
        const onPointerMove = this._onPointerMove as EventListener;
        const onPointerUp = this._onPointerUp as EventListener;

        if (this.supportsPointerEvents)
        {
            globalThis.document[method]('pointermove', onPointerMove, true);
            globalThis[method]('pointerup', onPointerUp, true);
        }
        else
        {
            globalThis.document[method]('mousemove', onPointerMove, true);
            globalThis[method]('mouseup', onPointerUp, true);
        }

        // a page scroll or resize moves every view's client rect, so invalidate the per-view rect
        // caches; bound in lockstep with the pointer listeners so nothing leaks on last-view-removal
        const onInvalidate = this._onClientRectInvalidate as EventListener;

        globalThis[method]('scroll', onInvalidate, true);
        globalThis[method]('resize', onInvalidate);
    }

    /**
     * Invalidates every view's cached client rect. Bound to page scroll and resize, both of which
     * move a canvas's position on screen without the canvas itself resizing.
     */
    private _onClientRectInvalidate(): void
    {
        const views = this._viewsList;

        for (let i = 0, j = views.length; i < j; i++)
        {
            views[i].clientRect = null;
        }
    }

    /**
     * Adds or removes the element-scoped listeners on a view's element.
     * @param view - the view whose element to bind
     * @param add - whether to add or remove the listeners
     */
    private _toggleViewEvents(view: EventsViewData, add: boolean): void
    {
        const element = view.element;
        const method = add ? 'addEventListener' : 'removeEventListener';
        const style = element.style as CrossCSSStyleDeclaration;
        const onPointerDown = this._onPointerDown as EventListener;
        const onPointerMove = this._onPointerMove as EventListener;
        const onPointerUp = this._onPointerUp as EventListener;
        const onPointerOverOut = this._onPointerOverOut as EventListener;

        // offscreen canvas does not have style, so check first
        if (style)
        {
            if ((globalThis.navigator as any).msPointerEnabled)
            {
                style.msContentZooming = add ? 'none' : '';
                style.msTouchAction = add ? 'none' : '';
            }
            else if (this.supportsPointerEvents)
            {
                style.touchAction = add ? 'none' : '';
            }
        }

        if (this.supportsPointerEvents)
        {
            element[method]('pointerdown', onPointerDown, true);
            // pointerout is fired in addition to pointerup (for touch events) and pointercancel
            // we already handle those, so for the purposes of what we do in onPointerOut, we only
            // care about the pointerleave event
            element[method]('pointerleave', onPointerOverOut, true);
            element[method]('pointerover', onPointerOverOut, true);
        }
        else
        {
            element[method]('mousedown', onPointerDown, true);
            element[method]('mouseout', onPointerOverOut, true);
            element[method]('mouseover', onPointerOverOut, true);

            if (this.supportsTouchEvents)
            {
                element[method]('touchstart', onPointerDown, true);
                element[method]('touchend', onPointerUp, true);
                element[method]('touchmove', onPointerMove, true);
            }
        }

        element[method]('wheel', this.onWheel as EventListener, add ? { passive: true, capture: true } : true);
    }

    /**
     * Maps coordinates from DOM/screen space into PixiJS normalized coordinates.
     * This takes into account the current scale, position, and resolution of the DOM element.
     * @param point - The point to store the mapped coordinates in
     * @param x - The x coordinate in DOM/client space
     * @param y - The y coordinate in DOM/client space
     * @example
     * ```ts
     * // Map mouse coordinates to PixiJS space
     * const point = new Point();
     * app.renderer.events.mapPositionToPoint(
     *     point,
     *     event.clientX,
     *     event.clientY
     * );
     * console.log('Mapped position:', point.x, point.y);
     *
     * // Using with pointer events
     * sprite.on('pointermove', (event) => {
     *     // event.global already contains mapped coordinates
     *     console.log('Global:', event.global.x, event.global.y);
     *
     *     // Map to local coordinates
     *     const local = event.getLocalPosition(sprite);
     *     console.log('Local:', local.x, local.y);
     * });
     * ```
     * @remarks
     * - Accounts for element scaling and positioning
     * - Adjusts for device pixel ratio/resolution
     */
    public mapPositionToPoint(point: PointData, x: number, y: number): void
    {
        this._mapPositionToPoint(point, x, y, this._views.mainView);
    }

    /**
     * Maps coordinates from DOM/client space into a view's PixiJS coordinate space, using
     * that view's element rect and resolution.
     * @param point - The point to store the mapped coordinates in
     * @param x - The x coordinate in DOM/client space
     * @param y - The y coordinate in DOM/client space
     * @param view - The view to map against
     */
    private _mapPositionToPoint(point: PointData, x: number, y: number, view: EventsViewData): void
    {
        const element = view.element;

        let rect = view.clientRect;

        if (!rect)
        {
            if (element.isConnected)
            {
                // populate the cache lazily; invalidated on view resize and page scroll/resize so it
                // stays in step with a fresh getBoundingClientRect between invalidations
                const domRect = element.getBoundingClientRect();

                rect = view.clientRect = {
                    left: domRect.left,
                    top: domRect.top,
                    width: domRect.width,
                    height: domRect.height,
                };
            }
            else
            {
                // a disconnected element has no layout box; fall back without caching so a later
                // reconnect re-measures. Byte-identical to the previous per-move computation.
                rect = {
                    left: 0,
                    top: 0,
                    width: (element as any).width,
                    height: (element as any).height,
                };
            }
        }

        // a custom main element has no canvas source, so the main view follows the renderer resolution
        const resolution = view === this._views.mainView ? this.resolution : (view.source?.resolution ?? 1);

        const resolutionMultiplier = 1.0 / resolution;

        point.x = ((x - rect.left) * ((element as any).width / rect.width)) * resolutionMultiplier;
        point.y = ((y - rect.top) * ((element as any).height / rect.height)) * resolutionMultiplier;
    }

    /**
     * Ensures that the original event object contains all data that a regular pointer event would have
     * @param event - The original event data from a touch or mouse event
     * @returns An array containing a single normalized pointer event, in the case of a pointer
     *  or mouse event, or a multiple normalized pointer events if there are multiple changed touches
     */
    private _normalizeToPointerData(event: TouchEvent | MouseEvent | PointerEvent): PointerEvent[]
    {
        const normalizedEvents = [];

        if (this.supportsTouchEvents && event instanceof TouchEvent)
        {
            for (let i = 0, li = event.changedTouches.length; i < li; i++)
            {
                const touch = event.changedTouches[i] as PixiTouch;

                if (typeof touch.button === 'undefined') touch.button = 0;
                if (typeof touch.buttons === 'undefined') touch.buttons = 1;
                if (typeof touch.isPrimary === 'undefined')
                {
                    touch.isPrimary = event.touches.length === 1 && event.type === 'touchstart';
                }
                if (typeof touch.width === 'undefined') touch.width = touch.radiusX || 1;
                if (typeof touch.height === 'undefined') touch.height = touch.radiusY || 1;
                if (typeof touch.tiltX === 'undefined') touch.tiltX = 0;
                if (typeof touch.tiltY === 'undefined') touch.tiltY = 0;
                if (typeof touch.pointerType === 'undefined') touch.pointerType = 'touch';
                if (typeof touch.pointerId === 'undefined') touch.pointerId = touch.identifier || 0;
                if (typeof touch.pressure === 'undefined') touch.pressure = touch.force || 0.5;
                if (typeof touch.twist === 'undefined') touch.twist = 0;
                if (typeof touch.tangentialPressure === 'undefined') touch.tangentialPressure = 0;
                // TODO: Remove these, as layerX/Y is not a standard, is deprecated, has uneven
                // support, and the fill ins are not quite the same
                // offsetX/Y might be okay, but is not the same as clientX/Y when the canvas's top
                // left is not 0,0 on the page
                if (typeof touch.layerX === 'undefined') touch.layerX = touch.offsetX = touch.clientX;
                if (typeof touch.layerY === 'undefined') touch.layerY = touch.offsetY = touch.clientY;

                // mark the touch as normalized, just so that we know we did it
                touch.isNormalized = true;
                touch.type = event.type;

                // Copy modifier keys from the TouchEvent to the touch object
                // These properties exist on TouchEvent, not on individual Touch objects
                touch.altKey ??= event.altKey;
                touch.ctrlKey ??= event.ctrlKey;
                touch.metaKey ??= event.metaKey;
                touch.shiftKey ??= event.shiftKey;

                normalizedEvents.push(touch);
            }
        }
        // apparently PointerEvent subclasses MouseEvent, so yay
        else if (!globalThis.MouseEvent
            || (event instanceof MouseEvent && (!this.supportsPointerEvents || !(event instanceof globalThis.PointerEvent))))
        {
            const tempEvent = event as PixiPointerEvent;

            if (typeof tempEvent.isPrimary === 'undefined') tempEvent.isPrimary = true;
            if (typeof tempEvent.width === 'undefined') tempEvent.width = 1;
            if (typeof tempEvent.height === 'undefined') tempEvent.height = 1;
            if (typeof tempEvent.tiltX === 'undefined') tempEvent.tiltX = 0;
            if (typeof tempEvent.tiltY === 'undefined') tempEvent.tiltY = 0;
            if (typeof tempEvent.pointerType === 'undefined') tempEvent.pointerType = 'mouse';
            if (typeof tempEvent.pointerId === 'undefined') tempEvent.pointerId = MOUSE_POINTER_ID;
            if (typeof tempEvent.pressure === 'undefined') tempEvent.pressure = 0.5;
            if (typeof tempEvent.twist === 'undefined') tempEvent.twist = 0;
            if (typeof tempEvent.tangentialPressure === 'undefined') tempEvent.tangentialPressure = 0;

            // mark the mouse event as normalized, just so that we know we did it
            tempEvent.isNormalized = true;

            normalizedEvents.push(tempEvent);
        }
        else
        {
            normalizedEvents.push(event);
        }

        return normalizedEvents as PointerEvent[];
    }

    /**
     * Normalizes the native {@link https://w3c.github.io/uievents/#interface-wheelevent WheelEvent}.
     *
     * The returned {@link FederatedWheelEvent} is a shared instance. It will not persist across
     * multiple native wheel events.
     * @param nativeEvent - The native wheel event that occurred on the canvas.
     * @param view - The view the event was scoped to; defaults to the main view.
     * @returns A federated wheel event.
     */
    protected normalizeWheelEvent(nativeEvent: WheelEvent, view: EventsViewData = this._views.mainView): FederatedWheelEvent
    {
        const event = this._rootWheelEvent;

        this._transferMouseData(event, nativeEvent);

        // When WheelEvent is triggered by scrolling with mouse wheel, reading WheelEvent.deltaMode
        // before deltaX/deltaY/deltaZ on Firefox will result in WheelEvent.DOM_DELTA_LINE (1),
        // while reading WheelEvent.deltaMode after deltaX/deltaY/deltaZ on Firefox or reading
        // in any order on other browsers will result in WheelEvent.DOM_DELTA_PIXEL (0).
        // Therefore, we need to read WheelEvent.deltaMode after deltaX/deltaY/deltaZ in order to
        // make its behavior more consistent across browsers.
        // @see https://github.com/pixijs/pixijs/issues/8970
        event.deltaX = nativeEvent.deltaX;
        event.deltaY = nativeEvent.deltaY;
        event.deltaZ = nativeEvent.deltaZ;
        event.deltaMode = nativeEvent.deltaMode;

        this._mapPositionToPoint(event.screen, nativeEvent.clientX, nativeEvent.clientY, view);
        event.global.copyFrom(event.screen);
        event.offset.copyFrom(event.screen);

        event.nativeEvent = nativeEvent;
        event.type = nativeEvent.type;

        return event;
    }

    /**
     * Normalizes the `nativeEvent` into a federateed {@link FederatedPointerEvent}.
     * @param event
     * @param nativeEvent
     * @param view - The view the event was scoped to; defaults to the main view.
     */
    private _bootstrapEvent(
        event: FederatedPointerEvent,
        nativeEvent: PointerEvent,
        view: EventsViewData
    ): FederatedPointerEvent
    {
        event.originalEvent = null;
        event.nativeEvent = nativeEvent;

        event.pointerId = nativeEvent.pointerId;
        event.width = nativeEvent.width;
        event.height = nativeEvent.height;
        event.isPrimary = nativeEvent.isPrimary;
        event.pointerType = nativeEvent.pointerType;
        event.pressure = nativeEvent.pressure;
        event.tangentialPressure = nativeEvent.tangentialPressure;
        event.tiltX = nativeEvent.tiltX;
        event.tiltY = nativeEvent.tiltY;
        event.twist = nativeEvent.twist;
        this._transferMouseData(event, nativeEvent);

        this._mapPositionToPoint(event.screen, nativeEvent.clientX, nativeEvent.clientY, view);
        event.global.copyFrom(event.screen);// global = screen for top-level
        event.offset.copyFrom(event.screen);// EventBoundary recalculates using its rootTarget

        event.isTrusted = nativeEvent.isTrusted;
        if (event.type === 'pointerleave')
        {
            event.type = 'pointerout';
        }
        if (event.type.startsWith('mouse'))
        {
            event.type = event.type.replace('mouse', 'pointer');
        }
        if (event.type.startsWith('touch'))
        {
            event.type = TOUCH_TO_POINTER[event.type] || event.type;
        }

        return event;
    }

    /**
     * Transfers base & mouse event data from the `nativeEvent` to the federated event.
     * @param event
     * @param nativeEvent
     */
    private _transferMouseData(event: FederatedMouseEvent, nativeEvent: MouseEvent): void
    {
        event.isTrusted = nativeEvent.isTrusted;
        event.srcElement = nativeEvent.srcElement;
        event.timeStamp = performance.now();
        event.type = nativeEvent.type;

        event.altKey = nativeEvent.altKey;
        event.button = nativeEvent.button;
        event.buttons = nativeEvent.buttons;
        event.client.x = nativeEvent.clientX;
        event.client.y = nativeEvent.clientY;
        event.ctrlKey = nativeEvent.ctrlKey;
        event.metaKey = nativeEvent.metaKey;
        event.movement.x = nativeEvent.movementX;
        event.movement.y = nativeEvent.movementY;
        event.page.x = nativeEvent.pageX;
        event.page.y = nativeEvent.pageY;
        event.relatedTarget = null;
        event.shiftKey = nativeEvent.shiftKey;
    }
}

interface CrossCSSStyleDeclaration extends CSSStyleDeclaration
{
    msContentZooming: string;
    msTouchAction: string;
}

interface PixiPointerEvent extends PointerEvent
{
    isPrimary: boolean;
    width: number;
    height: number;
    tiltX: number;
    tiltY: number;
    pointerType: string;
    pointerId: number;
    pressure: number;
    twist: number;
    tangentialPressure: number;
    isNormalized: boolean;
    type: string;
}
