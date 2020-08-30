import type { AbstractRenderer } from '@pixi/core';
import type { Dict } from '@pixi/utils';
import { DisplayObject } from '@pixi/display';
import { EventEmitter } from '@pixi/utils';
import { IPointData } from '@pixi/math';
import { Point } from '@pixi/math';

export declare type Cursor = 'auto' | 'default' | 'none' | 'context-menu' | 'help' | 'pointer' | 'progress' | 'wait' | 'cell' | 'crosshair' | 'text' | 'vertical-text' | 'alias' | 'copy' | 'move' | 'no-drop' | 'not-allowed' | 'e-resize' | 'n-resize' | 'ne-resize' | 'nw-resize' | 's-resize' | 'se-resize' | 'sw-resize' | 'w-resize' | 'ns-resize' | 'ew-resize' | 'nesw-resize' | 'col-resize' | 'nwse-resize' | 'row-resize' | 'all-scroll' | 'zoom-in' | 'zoom-out' | 'grab' | 'grabbing';

export declare interface DelayedEvent {
    displayObject: DisplayObject;
    eventString: string;
    eventData: InteractionEvent;
}

export declare interface IHitArea {
    contains(x: number, y: number): boolean;
}

export declare type InteractionCallback = (interactionEvent: InteractionEvent, displayObject: DisplayObject, hit?: boolean) => void;

/**
 * Holds all information related to an Interaction event
 *
 * @class
 * @memberof PIXI
 */
export declare class InteractionData
{
    global: Point;
    target: DisplayObject;
    originalEvent: InteractivePointerEvent;
    identifier: number;
    isPrimary: boolean;
    button: number;
    buttons: number;
    width: number;
    height: number;
    tiltX: number;
    tiltY: number;
    pointerType: string;
    pressure: number;
    rotationAngle: number;
    twist: number;
    tangentialPressure: number;
    constructor();
    /**
     * The unique identifier of the pointer. It will be the same as `identifier`.
     * @readonly
     * @member {number}
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerId
     */
    get pointerId(): number;
    /**
     * This will return the local coordinates of the specified displayObject for this InteractionData
     *
     * @param {PIXI.DisplayObject} displayObject - The DisplayObject that you would like the local
     *  coords off
     * @param {PIXI.Point} [point] - A Point object in which to store the value, optional (otherwise
     *  will create a new point)
     * @param {PIXI.Point} [globalPos] - A Point object containing your custom global coords, optional
     *  (otherwise will use the current global coords)
     * @return {PIXI.Point} A point containing the coordinates of the InteractionData position relative
     *  to the DisplayObject
     */
    getLocalPosition<P extends IPointData = Point>(displayObject: DisplayObject, point?: P, globalPos?: IPointData): P;
    /**
     * Copies properties from normalized event data.
     *
     * @param {Touch|MouseEvent|PointerEvent} event - The normalized event data
     */
    copyEvent(event: Touch | InteractivePointerEvent): void;
    /**
     * Resets the data for pooling.
     */
    reset(): void;
}

/**
 * Event class that mimics native DOM events.
 *
 * @class
 * @memberof PIXI
 */
export declare class InteractionEvent
{
    stopped: boolean;
    stopsPropagatingAt: DisplayObject;
    stopPropagationHint: boolean;
    target: DisplayObject;
    currentTarget: DisplayObject;
    type: string;
    data: InteractionData;
    constructor();
    /**
     * Prevents event from reaching any objects other than the current object.
     *
     */
    stopPropagation(): void;
    /**
     * Resets the event.
     */
    reset(): void;
}

/**
 * The interaction manager deals with mouse, touch and pointer events.
 *
 * Any DisplayObject can be interactive if its `interactive` property is set to true.
 *
 * This manager also supports multitouch.
 *
 * An instance of this class is automatically created by default, and can be found at `renderer.plugins.interaction`
 *
 * @class
 * @extends PIXI.utils.EventEmitter
 * @memberof PIXI
 */
export declare class InteractionManager extends EventEmitter
{
    readonly activeInteractionData: {
        [key: number]: InteractionData;
    };
    readonly supportsTouchEvents: boolean;
    readonly supportsPointerEvents: boolean;
    interactionDataPool: InteractionData[];
    cursor: string;
    delayedEvents: DelayedEvent[];
    search: TreeSearch;
    renderer: AbstractRenderer;
    autoPreventDefault: boolean;
    interactionFrequency: number;
    mouse: InteractionData;
    eventData: InteractionEvent;
    moveWhenInside: boolean;
    cursorStyles: Dict<string | ((mode: string) => void) | CSSStyleDeclaration>;
    currentCursorMode: string;
    resolution: number;
    protected interactionDOMElement: HTMLElement;
    protected eventsAdded: boolean;
    protected tickerAdded: boolean;
    protected mouseOverRenderer: boolean;
    private _useSystemTicker;
    private _deltaTime;
    private _didMove;
    private _tempDisplayObject;
    /**
     * @param {PIXI.CanvasRenderer|PIXI.Renderer} renderer - A reference to the current renderer
     * @param {object} [options] - The options for the manager.
     * @param {boolean} [options.autoPreventDefault=true] - Should the manager automatically prevent default browser actions.
     * @param {number} [options.interactionFrequency=10] - Maximum requency (ms) at pointer over/out states will be checked.
     * @param {number} [options.useSystemTicker=true] - Whether to add {@link tickerUpdate} to {@link PIXI.Ticker.system}.
     */
    constructor(renderer: AbstractRenderer, options: InteractionManagerOptions);
    /**
     * Should the InteractionManager automatically add {@link tickerUpdate} to {@link PIXI.Ticker.system}.
     *
     * @member {boolean}
     * @default true
     */
    get useSystemTicker(): boolean;
    set useSystemTicker(useSystemTicker: boolean);
    /**
     * Last rendered object or temp object
     * @readonly
     * @protected
     * @member {PIXI.DisplayObject}
     */
    get lastObjectRendered(): DisplayObject;
    /**
     * Hit tests a point against the display tree, returning the first interactive object that is hit.
     *
     * @param {PIXI.Point} globalPoint - A point to hit test with, in global space.
     * @param {PIXI.Container} [root] - The root display object to start from. If omitted, defaults
     * to the last rendered root of the associated renderer.
     * @return {PIXI.DisplayObject} The hit display object, if any.
     */
    hitTest(globalPoint: Point, root?: DisplayObject): DisplayObject;
    /**
     * Sets the DOM element which will receive mouse/touch events. This is useful for when you have
     * other DOM elements on top of the renderers Canvas element. With this you'll be bale to delegate
     * another DOM element to receive those events.
     *
     * @param {HTMLElement} element - the DOM element which will receive mouse and touch events.
     * @param {number} [resolution=1] - The resolution / device pixel ratio of the new element (relative to the canvas).
     */
    setTargetElement(element: HTMLElement, resolution?: number): void;
    /**
     * Add the ticker listener
     *
     * @private
     */
    private addTickerListener;
    /**
     * Remove the ticker listener
     *
     * @private
     */
    private removeTickerListener;
    /**
     * Registers all the DOM events
     *
     * @private
     */
    private addEvents;
    /**
     * Removes all the DOM events that were previously registered
     *
     * @private
     */
    private removeEvents;
    /**
     * Updates the state of interactive objects if at least {@link interactionFrequency}
     * milliseconds have passed since the last invocation.
     *
     * Invoked by a throttled ticker update from {@link PIXI.Ticker.system}.
     *
     * @param {number} deltaTime - time delta since the last call
     */
    tickerUpdate(deltaTime: number): void;
    /**
     * Updates the state of interactive objects.
     */
    update(): void;
    /**
     * Sets the current cursor mode, handling any callbacks or CSS style changes.
     *
     * @param {string} mode - cursor mode, a key from the cursorStyles dictionary
     */
    setCursorMode(mode: string): void;
    /**
     * Dispatches an event on the display object that was interacted with
     *
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - the display object in question
     * @param {string} eventString - the name of the event (e.g, mousedown)
     * @param {PIXI.InteractionEvent} eventData - the event data object
     * @private
     */
    private dispatchEvent;
    /**
     * Puts a event on a queue to be dispatched later. This is used to guarantee correct
     * ordering of over/out events.
     *
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - the display object in question
     * @param {string} eventString - the name of the event (e.g, mousedown)
     * @param {object} eventData - the event data object
     * @private
     */
    private delayDispatchEvent;
    /**
     * Maps x and y coords from a DOM object and maps them correctly to the PixiJS view. The
     * resulting value is stored in the point. This takes into account the fact that the DOM
     * element could be scaled and positioned anywhere on the screen.
     *
     * @param  {PIXI.IPointData} point - the point that the result will be stored in
     * @param  {number} x - the x coord of the position to map
     * @param  {number} y - the y coord of the position to map
     */
    mapPositionToPoint(point: IPointData, x: number, y: number): void;
    /**
     * This function is provides a neat way of crawling through the scene graph and running a
     * specified function on all interactive objects it finds. It will also take care of hit
     * testing the interactive objects and passes the hit across in the function.
     *
     * @protected
     * @param {PIXI.InteractionEvent} interactionEvent - event containing the point that
     *  is tested for collision
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - the displayObject
     *  that will be hit test (recursively crawls its children)
     * @param {Function} [func] - the function that will be called on each interactive object. The
     *  interactionEvent, displayObject and hit will be passed to the function
     * @param {boolean} [hitTest] - indicates whether we want to calculate hits
     *  or just iterate through all interactive objects
     */
    processInteractive(interactionEvent: InteractionEvent, displayObject: DisplayObject, func?: InteractionCallback, hitTest?: boolean): void;
    /**
     * Is called when the pointer button is pressed down on the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer button being pressed down
     */
    private onPointerDown;
    /**
     * Processes the result of the pointer down check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    private processPointerDown;
    /**
     * Is called when the pointer button is released on the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer button being released
     * @param {boolean} cancelled - true if the pointer is cancelled
     * @param {Function} func - Function passed to {@link processInteractive}
     */
    private onPointerComplete;
    /**
     * Is called when the pointer button is cancelled
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer button being released
     */
    private onPointerCancel;
    /**
     * Processes the result of the pointer cancel check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     */
    private processPointerCancel;
    /**
     * Is called when the pointer button is released on the renderer element
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer button being released
     */
    private onPointerUp;
    /**
     * Processes the result of the pointer up check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    private processPointerUp;
    /**
     * Is called when the pointer moves across the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer moving
     */
    private onPointerMove;
    /**
     * Processes the result of the pointer move check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    private processPointerMove;
    /**
     * Is called when the pointer is moved out of the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer being moved out
     */
    private onPointerOut;
    /**
     * Processes the result of the pointer over/out check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    private processPointerOverOut;
    /**
     * Is called when the pointer is moved into the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer button being moved into the renderer view
     */
    private onPointerOver;
    /**
     * Get InteractionData for a given pointerId. Store that data as well
     *
     * @private
     * @param {PointerEvent} event - Normalized pointer event, output from normalizeToPointerData
     * @return {PIXI.InteractionData} - Interaction data for the given pointer identifier
     */
    private getInteractionDataForPointerId;
    /**
     * Return unused InteractionData to the pool, for a given pointerId
     *
     * @private
     * @param {number} pointerId - Identifier from a pointer event
     */
    private releaseInteractionDataForPointerId;
    /**
     * Configure an InteractionEvent to wrap a DOM PointerEvent and InteractionData
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The event to be configured
     * @param {PointerEvent} pointerEvent - The DOM event that will be paired with the InteractionEvent
     * @param {PIXI.InteractionData} interactionData - The InteractionData that will be paired
     *        with the InteractionEvent
     * @return {PIXI.InteractionEvent} the interaction event that was passed in
     */
    private configureInteractionEventForDOMEvent;
    /**
     * Ensures that the original event object contains all data that a regular pointer event would have
     *
     * @private
     * @param {TouchEvent|MouseEvent|PointerEvent} event - The original event data from a touch or mouse event
     * @return {PointerEvent[]} An array containing a single normalized pointer event, in the case of a pointer
     *  or mouse event, or a multiple normalized pointer events if there are multiple changed touches
     */
    private normalizeToPointerData;
    /**
     * Destroys the interaction manager
     *
     */
    destroy(): void;
}

export declare interface InteractionManagerOptions {
    autoPreventDefault?: boolean;
    interactionFrequency?: number;
    useSystemTicker?: boolean;
}

/**
 * DisplayObjects with the {@link PIXI.interactiveTarget} mixin use this class to track interactions
 *
 * @class
 * @private
 * @memberof PIXI
 */
export declare class InteractionTrackingData
{
    static FLAGS: Readonly<InteractionTrackingFlags>;
    private readonly _pointerId;
    private _flags;
    /**
     * @param {number} pointerId - Unique pointer id of the event
     * @private
     */
    constructor(pointerId: number);
    /**
     *
     * @private
     * @param {number} flag - The interaction flag to set
     * @param {boolean} yn - Should the flag be set or unset
     */
    private _doSet;
    /**
     * Unique pointer id of the event
     *
     * @readonly
     * @private
     * @member {number}
     */
    get pointerId(): number;
    /**
     * State of the tracking data, expressed as bit flags
     *
     * @private
     * @member {number}
     */
    get flags(): number;
    set flags(flags: number);
    /**
     * Is the tracked event inactive (not over or down)?
     *
     * @private
     * @member {number}
     */
    get none(): boolean;
    /**
     * Is the tracked event over the DisplayObject?
     *
     * @private
     * @member {boolean}
     */
    get over(): boolean;
    set over(yn: boolean);
    /**
     * Did the right mouse button come down in the DisplayObject?
     *
     * @private
     * @member {boolean}
     */
    get rightDown(): boolean;
    set rightDown(yn: boolean);
    /**
     * Did the left mouse button come down in the DisplayObject?
     *
     * @private
     * @member {boolean}
     */
    get leftDown(): boolean;
    set leftDown(yn: boolean);
}

export declare interface InteractionTrackingFlags {
    OVER: number;
    LEFT_DOWN: number;
    RIGHT_DOWN: number;
    NONE: number;
}

export declare type InteractivePointerEvent = PointerEvent | TouchEvent | MouseEvent;

export declare interface InteractiveTarget {
    interactive: boolean;
    interactiveChildren: boolean;
    hitArea: IHitArea;
    cursor: Cursor | string;
    buttonMode: boolean;
    trackedPointers: {
        [x: number]: InteractionTrackingData;
    };
    _trackedPointers: {
        [x: number]: InteractionTrackingData;
    };
}

/**
 * Default property values of interactive objects
 * Used by {@link PIXI.InteractionManager} to automatically give all DisplayObjects these properties
 *
 * @private
 * @name interactiveTarget
 * @type {Object}
 * @memberof PIXI
 * @example
 *      function MyObject() {}
 *
 *      Object.assign(
 *          DisplayObject.prototype,
 *          PIXI.interactiveTarget
 *      );
 */
export declare const interactiveTarget: InteractiveTarget;

/**
 * Strategy how to search through stage tree for interactive objects
 *
 * @private
 * @class
 * @memberof PIXI
 */
declare class TreeSearch
{
    private readonly _tempPoint;
    constructor();
    /**
     * Recursive implementation for findHit
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - event containing the point that
     *  is tested for collision
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - the displayObject
     *  that will be hit test (recursively crawls its children)
     * @param {Function} [func] - the function that will be called on each interactive object. The
     *  interactionEvent, displayObject and hit will be passed to the function
     * @param {boolean} [hitTest] - this indicates if the objects inside should be hit test against the point
     * @param {boolean} [interactive] - Whether the displayObject is interactive
     * @return {boolean} returns true if the displayObject hit the point
     */
    recursiveFindHit(interactionEvent: InteractionEvent, displayObject: DisplayObject, func?: InteractionCallback, hitTest?: boolean, interactive?: boolean): boolean;
    /**
     * This function is provides a neat way of crawling through the scene graph and running a
     * specified function on all interactive objects it finds. It will also take care of hit
     * testing the interactive objects and passes the hit across in the function.
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - event containing the point that
     *  is tested for collision
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - the displayObject
     *  that will be hit test (recursively crawls its children)
     * @param {Function} [func] - the function that will be called on each interactive object. The
     *  interactionEvent, displayObject and hit will be passed to the function
     * @param {boolean} [hitTest] - this indicates if the objects inside should be hit test against the point
     * @return {boolean} returns true if the displayObject hit the point
     */
    findHit(interactionEvent: InteractionEvent, displayObject: DisplayObject, func?: InteractionCallback, hitTest?: boolean): void;
}

export { };
