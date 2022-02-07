import { Ticker, UPDATE_PRIORITY } from '@pixi/ticker';
import { DisplayObject, TemporaryDisplayObject } from '@pixi/display';
import { InteractionData, InteractivePointerEvent } from './InteractionData';
import { InteractionEvent, InteractionCallback } from './InteractionEvent';
import { InteractionTrackingData } from './InteractionTrackingData';
import { TreeSearch } from './TreeSearch';
import { EventEmitter } from '@pixi/utils';
import { interactiveTarget } from './interactiveTarget';

import type { AbstractRenderer } from '@pixi/core';
import type { Point, IPointData } from '@pixi/math';
import type { Dict } from '@pixi/utils';

// Mix interactiveTarget into DisplayObject.prototype
DisplayObject.mixin(interactiveTarget);

const MOUSE_POINTER_ID = 1;

// Mock interface for hitTestEvent - only used inside hitTest()
interface TestInteractionEvent
{
    target: DisplayObject;
    data: {global: Point};
}

// helpers for hitTest() - only used inside hitTest()
const hitTestEvent: TestInteractionEvent = {
    target: null,
    data: {
        global: null,
    },
};

export interface InteractionManagerOptions {
    autoPreventDefault?: boolean;
    interactionFrequency?: number;
    useSystemTicker?: boolean;
}

export interface DelayedEvent {
    displayObject: DisplayObject;
    eventString: string;
    eventData: InteractionEvent;
}

interface CrossCSSStyleDeclaration extends CSSStyleDeclaration
{
    msContentZooming: string;
    msTouchAction: string;
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
export class InteractionManager extends EventEmitter
{
    public readonly activeInteractionData: { [key: number]: InteractionData };
    public readonly supportsTouchEvents: boolean;
    public readonly supportsPointerEvents: boolean;
    public interactionDataPool: InteractionData[];
    public cursor: string;
    public delayedEvents: DelayedEvent[];
    public search: TreeSearch;
    public renderer: AbstractRenderer;
    public autoPreventDefault: boolean;
    public interactionFrequency: number;
    public mouse: InteractionData;
    public eventData: InteractionEvent;
    public moveWhenInside: boolean;
    public cursorStyles: Dict<string | ((mode: string) => void) | CSSStyleDeclaration>;
    public currentCursorMode: string;
    public resolution: number;

    protected interactionDOMElement: HTMLElement;
    protected eventsAdded: boolean;
    protected tickerAdded: boolean;
    protected mouseOverRenderer: boolean;

    private _useSystemTicker: boolean;
    private _deltaTime: number;
    private _didMove: boolean;
    private _tempDisplayObject: DisplayObject;
    private readonly _eventListenerOptions: { capture: true, passive: false };

    /**
     * @param {PIXI.CanvasRenderer|PIXI.Renderer} renderer - A reference to the current renderer
     * @param {object} [options] - The options for the manager.
     * @param {boolean} [options.autoPreventDefault=true] - Should the manager automatically prevent default browser actions.
     * @param {number} [options.interactionFrequency=10] - Maximum frequency (ms) at pointer over/out states will be checked.
     * @param {number} [options.useSystemTicker=true] - Whether to add {@link tickerUpdate} to {@link PIXI.Ticker.system}.
     */
    constructor(renderer: AbstractRenderer, options?: InteractionManagerOptions)
    {
        super();

        options = options || {};

        /**
         * The renderer this interaction manager works for.
         *
         * @member {PIXI.AbstractRenderer}
         */
        this.renderer = renderer;

        /**
         * Should default browser actions automatically be prevented.
         * Does not apply to pointer events for backwards compatibility
         * preventDefault on pointer events stops mouse events from firing
         * Thus, for every pointer event, there will always be either a mouse of touch event alongside it.
         *
         * @member {boolean}
         * @default true
         */
        this.autoPreventDefault = options.autoPreventDefault !== undefined ? options.autoPreventDefault : true;

        /**
         * Maximum frequency in milliseconds at which pointer over/out states will be checked by {@link tickerUpdate}.
         *
         * @member {number}
         * @default 10
         */
        this.interactionFrequency = options.interactionFrequency || 10;

        /**
         * The mouse data
         *
         * @member {PIXI.InteractionData}
         */
        this.mouse = new InteractionData();
        this.mouse.identifier = MOUSE_POINTER_ID;

        // setting the mouse to start off far off screen will mean that mouse over does
        //  not get called before we even move the mouse.
        this.mouse.global.set(-999999);

        /**
         * Actively tracked InteractionData
         *
         * @private
         * @member {Object.<number,PIXI.InteractionData>}
         */
        this.activeInteractionData = {};
        this.activeInteractionData[MOUSE_POINTER_ID] = this.mouse;

        /**
         * Pool of unused InteractionData
         *
         * @private
         * @member {PIXI.InteractionData[]}
         */
        this.interactionDataPool = [];

        /**
         * An event data object to handle all the event tracking/dispatching
         *
         * @member {object}
         */
        this.eventData = new InteractionEvent();

        /**
         * The DOM element to bind to.
         *
         * @protected
         * @member {HTMLElement}
         */
        this.interactionDOMElement = null;

        /**
         * This property determines if mousemove and touchmove events are fired only when the cursor
         * is over the object.
         * Setting to true will make things work more in line with how the DOM version works.
         * Setting to false can make things easier for things like dragging
         * It is currently set to false as this is how PixiJS used to work. This will be set to true in
         * future versions of pixi.
         *
         * @member {boolean}
         * @default false
         */
        this.moveWhenInside = false;

        /**
         * Have events been attached to the dom element?
         *
         * @protected
         * @member {boolean}
         */
        this.eventsAdded = false;

        /**
         * Has the system ticker been added?
         *
         * @protected
         * @member {boolean}
         */
        this.tickerAdded = false;

        /**
         * Is the mouse hovering over the renderer? If working in worker mouse considered to be over renderer by default.
         *
         * @protected
         * @member {boolean}
         */
        this.mouseOverRenderer = !('PointerEvent' in globalThis);

        /**
         * Does the device support touch events
         * https://www.w3.org/TR/touch-events/
         *
         * @readonly
         * @member {boolean}
         */
        this.supportsTouchEvents = 'ontouchstart' in globalThis;

        /**
         * Does the device support pointer events
         * https://www.w3.org/Submission/pointer-events/
         *
         * @readonly
         * @member {boolean}
         */
        this.supportsPointerEvents = !!globalThis.PointerEvent;

        // this will make it so that you don't have to call bind all the time

        /**
         * @private
         * @member {Function}
         */
        this.onPointerUp = this.onPointerUp.bind(this);
        this.processPointerUp = this.processPointerUp.bind(this);

        /**
         * @private
         * @member {Function}
         */
        this.onPointerCancel = this.onPointerCancel.bind(this);
        this.processPointerCancel = this.processPointerCancel.bind(this);

        /**
         * @private
         * @member {Function}
         */
        this.onPointerDown = this.onPointerDown.bind(this);
        this.processPointerDown = this.processPointerDown.bind(this);

        /**
         * @private
         * @member {Function}
         */
        this.onPointerMove = this.onPointerMove.bind(this);
        this.processPointerMove = this.processPointerMove.bind(this);

        /**
         * @private
         * @member {Function}
         */
        this.onPointerOut = this.onPointerOut.bind(this);
        this.processPointerOverOut = this.processPointerOverOut.bind(this);

        /**
         * @private
         * @member {Function}
         */
        this.onPointerOver = this.onPointerOver.bind(this);

        /**
         * Dictionary of how different cursor modes are handled. Strings are handled as CSS cursor
         * values, objects are handled as dictionaries of CSS values for interactionDOMElement,
         * and functions are called instead of changing the CSS.
         * Default CSS cursor values are provided for 'default' and 'pointer' modes.
         * @member {Object.<string, Object>}
         */
        this.cursorStyles = {
            default: 'inherit',
            pointer: 'pointer',
        };

        /**
         * The mode of the cursor that is being used.
         * The value of this is a key from the cursorStyles dictionary.
         *
         * @member {string}
         */
        this.currentCursorMode = null;

        /**
         * Internal cached let.
         *
         * @private
         * @member {string}
         */
        this.cursor = null;

        /**
         * The current resolution / device pixel ratio.
         *
         * @member {number}
         * @default 1
         */
        this.resolution = 1;

        /**
         * Delayed pointer events. Used to guarantee correct ordering of over/out events.
         *
         * @private
         * @member {Array}
         */
        this.delayedEvents = [];

        /**
         * TreeSearch component that is used to hitTest stage tree
         *
         * @private
         * @member {PIXI.TreeSearch}
         */
        this.search = new TreeSearch();

        /**
         * Used as a last rendered object in case renderer doesnt have _lastObjectRendered
         * @member {DisplayObject}
         * @private
         */
        this._tempDisplayObject = new TemporaryDisplayObject();

        /**
         * An options object specifies characteristics about the event listener.
         * @private
         * @readonly
         * @member {Object.<string, boolean>}
         */
        this._eventListenerOptions = { capture: true, passive: false };

        /**
         * Fired when a pointer device button (usually a mouse left-button) is pressed on the display
         * object.
         *
         * @event PIXI.InteractionManager#mousedown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * on the display object.
         *
         * @event PIXI.InteractionManager#rightdown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device button (usually a mouse left-button) is released over the display
         * object.
         *
         * @event PIXI.InteractionManager#mouseup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * over the display object.
         *
         * @event PIXI.InteractionManager#rightup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
         * the display object.
         *
         * @event PIXI.InteractionManager#click
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * and released on the display object.
         *
         * @event PIXI.InteractionManager#rightclick
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device button (usually a mouse left-button) is released outside the
         * display object that initially registered a
         * [mousedown]{@link PIXI.InteractionManager#event:mousedown}.
         *
         * @event PIXI.InteractionManager#mouseupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * outside the display object that initially registered a
         * [rightdown]{@link PIXI.InteractionManager#event:rightdown}.
         *
         * @event PIXI.InteractionManager#rightupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device (usually a mouse) is moved while over the display object
         *
         * @event PIXI.InteractionManager#mousemove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device (usually a mouse) is moved onto the display object
         *
         * @event PIXI.InteractionManager#mouseover
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device (usually a mouse) is moved off the display object
         *
         * @event PIXI.InteractionManager#mouseout
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device button is pressed on the display object.
         *
         * @event PIXI.InteractionManager#pointerdown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device button is released over the display object.
         * Not always fired when some buttons are held down while others are released. In those cases,
         * use [mousedown]{@link PIXI.InteractionManager#event:mousedown} and
         * [mouseup]{@link PIXI.InteractionManager#event:mouseup} instead.
         *
         * @event PIXI.InteractionManager#pointerup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when the operating system cancels a pointer event
         *
         * @event PIXI.InteractionManager#pointercancel
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device button is pressed and released on the display object.
         *
         * @event PIXI.InteractionManager#pointertap
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device button is released outside the display object that initially
         * registered a [pointerdown]{@link PIXI.InteractionManager#event:pointerdown}.
         *
         * @event PIXI.InteractionManager#pointerupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device is moved while over the display object
         *
         * @event PIXI.InteractionManager#pointermove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device is moved onto the display object
         *
         * @event PIXI.InteractionManager#pointerover
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device is moved off the display object
         *
         * @event PIXI.InteractionManager#pointerout
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a touch point is placed on the display object.
         *
         * @event PIXI.InteractionManager#touchstart
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a touch point is removed from the display object.
         *
         * @event PIXI.InteractionManager#touchend
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when the operating system cancels a touch
         *
         * @event PIXI.InteractionManager#touchcancel
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a touch point is placed and removed from the display object.
         *
         * @event PIXI.InteractionManager#tap
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a touch point is removed outside of the display object that initially
         * registered a [touchstart]{@link PIXI.InteractionManager#event:touchstart}.
         *
         * @event PIXI.InteractionManager#touchendoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a touch point is moved along the display object.
         *
         * @event PIXI.InteractionManager#touchmove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device button (usually a mouse left-button) is pressed on the display.
         * object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mousedown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#rightdown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device button (usually a mouse left-button) is released over the display
         * object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mouseup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * over the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#rightup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
         * the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#click
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * and released on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#rightclick
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device button (usually a mouse left-button) is released outside the
         * display object that initially registered a
         * [mousedown]{@link PIXI.DisplayObject#event:mousedown}.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mouseupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * outside the display object that initially registered a
         * [rightdown]{@link PIXI.DisplayObject#event:rightdown}.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#rightupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device (usually a mouse) is moved while over the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mousemove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device (usually a mouse) is moved onto the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mouseover
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device (usually a mouse) is moved off the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mouseout
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device button is pressed on the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointerdown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device button is released over the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointerup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when the operating system cancels a pointer event.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointercancel
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device button is pressed and released on the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointertap
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device button is released outside the display object that initially
         * registered a [pointerdown]{@link PIXI.DisplayObject#event:pointerdown}.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointerupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device is moved while over the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointermove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device is moved onto the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointerover
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a pointer device is moved off the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointerout
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a touch point is placed on the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#touchstart
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a touch point is removed from the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#touchend
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when the operating system cancels a touch.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#touchcancel
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a touch point is placed and removed from the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#tap
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a touch point is removed outside of the display object that initially
         * registered a [touchstart]{@link PIXI.DisplayObject#event:touchstart}.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#touchendoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        /**
         * Fired when a touch point is moved along the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#touchmove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */

        this._useSystemTicker = options.useSystemTicker !== undefined ? options.useSystemTicker : true;

        this.setTargetElement(this.renderer.view, this.renderer.resolution);
    }

    /**
     * Should the InteractionManager automatically add {@link tickerUpdate} to {@link PIXI.Ticker.system}.
     *
     * @member {boolean}
     * @default true
     */
    get useSystemTicker(): boolean
    {
        return this._useSystemTicker;
    }
    set useSystemTicker(useSystemTicker: boolean)
    {
        this._useSystemTicker = useSystemTicker;

        if (useSystemTicker)
        {
            this.addTickerListener();
        }
        else
        {
            this.removeTickerListener();
        }
    }

    /**
     * Last rendered object or temp object
     * @readonly
     * @protected
     * @member {PIXI.DisplayObject}
     */
    get lastObjectRendered(): DisplayObject
    {
        return (this.renderer._lastObjectRendered as DisplayObject) || this._tempDisplayObject;
    }

    /**
     * Hit tests a point against the display tree, returning the first interactive object that is hit.
     *
     * @param {PIXI.Point} globalPoint - A point to hit test with, in global space.
     * @param {PIXI.Container} [root] - The root display object to start from. If omitted, defaults
     * to the last rendered root of the associated renderer.
     * @return {PIXI.DisplayObject} The hit display object, if any.
     */
    public hitTest(globalPoint: Point, root?: DisplayObject): DisplayObject
    {
        // clear the target for our hit test
        hitTestEvent.target = null;
        // assign the global point
        hitTestEvent.data.global = globalPoint;
        // ensure safety of the root
        if (!root)
        {
            root = this.lastObjectRendered;
        }
        // run the hit test
        this.processInteractive(hitTestEvent as InteractionEvent, root, null, true);
        // return our found object - it'll be null if we didn't hit anything

        return hitTestEvent.target;
    }

    /**
     * Sets the DOM element which will receive mouse/touch events. This is useful for when you have
     * other DOM elements on top of the renderers Canvas element. With this you'll be bale to delegate
     * another DOM element to receive those events.
     *
     * @param {HTMLElement} element - the DOM element which will receive mouse and touch events.
     * @param {number} [resolution=1] - The resolution / device pixel ratio of the new element (relative to the canvas).
     */
    public setTargetElement(element: HTMLElement, resolution = 1): void
    {
        this.removeTickerListener();

        this.removeEvents();

        this.interactionDOMElement = element;

        this.resolution = resolution;

        this.addEvents();

        this.addTickerListener();
    }

    /**
     * Add the ticker listener
     *
     * @private
     */
    private addTickerListener(): void
    {
        if (this.tickerAdded || !this.interactionDOMElement || !this._useSystemTicker)
        {
            return;
        }

        Ticker.system.add(this.tickerUpdate, this, UPDATE_PRIORITY.INTERACTION);

        this.tickerAdded = true;
    }

    /**
     * Remove the ticker listener
     *
     * @private
     */
    private removeTickerListener(): void
    {
        if (!this.tickerAdded)
        {
            return;
        }

        Ticker.system.remove(this.tickerUpdate, this);

        this.tickerAdded = false;
    }

    /**
     * Registers all the DOM events
     *
     * @private
     */
    private addEvents(): void
    {
        if (this.eventsAdded || !this.interactionDOMElement)
        {
            return;
        }

        const style = this.interactionDOMElement.style as CrossCSSStyleDeclaration;

        if (globalThis.navigator.msPointerEnabled)
        {
            style.msContentZooming = 'none';
            style.msTouchAction = 'none';
        }
        else if (this.supportsPointerEvents)
        {
            style.touchAction = 'none';
        }

        /*
         * These events are added first, so that if pointer events are normalized, they are fired
         * in the same order as non-normalized events. ie. pointer event 1st, mouse / touch 2nd
         */
        if (this.supportsPointerEvents)
        {
            globalThis.document.addEventListener('pointermove', this.onPointerMove, this._eventListenerOptions);
            this.interactionDOMElement.addEventListener('pointerdown', this.onPointerDown, this._eventListenerOptions);
            // pointerout is fired in addition to pointerup (for touch events) and pointercancel
            // we already handle those, so for the purposes of what we do in onPointerOut, we only
            // care about the pointerleave event
            this.interactionDOMElement.addEventListener('pointerleave', this.onPointerOut, this._eventListenerOptions);
            this.interactionDOMElement.addEventListener('pointerover', this.onPointerOver, this._eventListenerOptions);
            globalThis.addEventListener('pointercancel', this.onPointerCancel, this._eventListenerOptions);
            globalThis.addEventListener('pointerup', this.onPointerUp, this._eventListenerOptions);
        }
        else
        {
            globalThis.document.addEventListener('mousemove', this.onPointerMove, this._eventListenerOptions);
            this.interactionDOMElement.addEventListener('mousedown', this.onPointerDown, this._eventListenerOptions);
            this.interactionDOMElement.addEventListener('mouseout', this.onPointerOut, this._eventListenerOptions);
            this.interactionDOMElement.addEventListener('mouseover', this.onPointerOver, this._eventListenerOptions);
            globalThis.addEventListener('mouseup', this.onPointerUp, this._eventListenerOptions);
        }

        // always look directly for touch events so that we can provide original data
        // In a future version we should change this to being just a fallback and rely solely on
        // PointerEvents whenever available
        if (this.supportsTouchEvents)
        {
            this.interactionDOMElement.addEventListener('touchstart', this.onPointerDown, this._eventListenerOptions);
            this.interactionDOMElement.addEventListener('touchcancel', this.onPointerCancel, this._eventListenerOptions);
            this.interactionDOMElement.addEventListener('touchend', this.onPointerUp, this._eventListenerOptions);
            this.interactionDOMElement.addEventListener('touchmove', this.onPointerMove, this._eventListenerOptions);
        }

        this.eventsAdded = true;
    }

    /**
     * Removes all the DOM events that were previously registered
     *
     * @private
     */
    private removeEvents(): void
    {
        if (!this.eventsAdded || !this.interactionDOMElement)
        {
            return;
        }

        const style = this.interactionDOMElement.style as CrossCSSStyleDeclaration;

        if (globalThis.navigator.msPointerEnabled)
        {
            style.msContentZooming = '';
            style.msTouchAction = '';
        }
        else if (this.supportsPointerEvents)
        {
            style.touchAction = '';
        }

        if (this.supportsPointerEvents)
        {
            globalThis.document.removeEventListener('pointermove', this.onPointerMove, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('pointerdown', this.onPointerDown, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('pointerleave', this.onPointerOut, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('pointerover', this.onPointerOver, this._eventListenerOptions);
            globalThis.removeEventListener('pointercancel', this.onPointerCancel, this._eventListenerOptions);
            globalThis.removeEventListener('pointerup', this.onPointerUp, this._eventListenerOptions);
        }
        else
        {
            globalThis.document.removeEventListener('mousemove', this.onPointerMove, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('mousedown', this.onPointerDown, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('mouseout', this.onPointerOut, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('mouseover', this.onPointerOver, this._eventListenerOptions);
            globalThis.removeEventListener('mouseup', this.onPointerUp, this._eventListenerOptions);
        }

        if (this.supportsTouchEvents)
        {
            this.interactionDOMElement.removeEventListener('touchstart', this.onPointerDown, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('touchcancel', this.onPointerCancel, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('touchend', this.onPointerUp, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('touchmove', this.onPointerMove, this._eventListenerOptions);
        }

        this.interactionDOMElement = null;

        this.eventsAdded = false;
    }

    /**
     * Updates the state of interactive objects if at least {@link interactionFrequency}
     * milliseconds have passed since the last invocation.
     *
     * Invoked by a throttled ticker update from {@link PIXI.Ticker.system}.
     *
     * @param {number} deltaTime - time delta since the last call
     */
    public tickerUpdate(deltaTime: number): void
    {
        this._deltaTime += deltaTime;

        if (this._deltaTime < this.interactionFrequency)
        {
            return;
        }

        this._deltaTime = 0;

        this.update();
    }

    /**
     * Updates the state of interactive objects.
     */
    public update(): void
    {
        if (!this.interactionDOMElement)
        {
            return;
        }

        // if the user move the mouse this check has already been done using the mouse move!
        if (this._didMove)
        {
            this._didMove = false;

            return;
        }

        this.cursor = null;

        // Resets the flag as set by a stopPropagation call. This flag is usually reset by a user interaction of any kind,
        // but there was a scenario of a display object moving under a static mouse cursor.
        // In this case, mouseover and mouseevents would not pass the flag test in dispatchEvent function
        for (const k in this.activeInteractionData)
        {
            // eslint-disable-next-line no-prototype-builtins
            if (this.activeInteractionData.hasOwnProperty(k))
            {
                const interactionData = this.activeInteractionData[k];

                if (interactionData.originalEvent && interactionData.pointerType !== 'touch')
                {
                    const interactionEvent = this.configureInteractionEventForDOMEvent(
                        this.eventData,
                        interactionData.originalEvent as PointerEvent,
                        interactionData
                    );

                    this.processInteractive(
                        interactionEvent,
                        this.lastObjectRendered,
                        this.processPointerOverOut,
                        true
                    );
                }
            }
        }

        this.setCursorMode(this.cursor);
    }

    /**
     * Sets the current cursor mode, handling any callbacks or CSS style changes.
     *
     * @param {string} mode - cursor mode, a key from the cursorStyles dictionary
     */
    public setCursorMode(mode: string): void
    {
        mode = mode || 'default';
        let applyStyles = true;

        // offscreen canvas does not support setting styles, but cursor modes can be functions,
        // in order to handle pixi rendered cursors, so we can't bail
        if (globalThis.OffscreenCanvas && this.interactionDOMElement instanceof OffscreenCanvas)
        {
            applyStyles = false;
        }
        // if the mode didn't actually change, bail early
        if (this.currentCursorMode === mode)
        {
            return;
        }
        this.currentCursorMode = mode;
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
                        this.interactionDOMElement.style.cursor = style;
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
                        Object.assign(this.interactionDOMElement.style, style);
                    }
                    break;
            }
        }
        else if (applyStyles && typeof mode === 'string' && !Object.prototype.hasOwnProperty.call(this.cursorStyles, mode))
        {
            // if it mode is a string (not a Symbol) and cursorStyles doesn't have any entry
            // for the mode, then assume that the dev wants it to be CSS for the cursor.
            this.interactionDOMElement.style.cursor = mode;
        }
    }

    /**
     * Dispatches an event on the display object that was interacted with
     *
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - the display object in question
     * @param {string} eventString - the name of the event (e.g, mousedown)
     * @param {PIXI.InteractionEvent} eventData - the event data object
     * @private
     */
    private dispatchEvent(displayObject: DisplayObject, eventString: string, eventData: InteractionEvent): void
    {
        // Even if the event was stopped, at least dispatch any remaining events
        // for the same display object.
        if (!eventData.stopPropagationHint || displayObject === eventData.stopsPropagatingAt)
        {
            eventData.currentTarget = displayObject;
            eventData.type = eventString;

            displayObject.emit(eventString, eventData);

            if ((displayObject as any)[eventString])
            {
                (displayObject as any)[eventString](eventData);
            }
        }
    }

    /**
     * Puts a event on a queue to be dispatched later. This is used to guarantee correct
     * ordering of over/out events.
     *
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - the display object in question
     * @param {string} eventString - the name of the event (e.g, mousedown)
     * @param {object} eventData - the event data object
     * @private
     */
    private delayDispatchEvent(displayObject: DisplayObject, eventString: string, eventData: InteractionEvent): void
    {
        this.delayedEvents.push({ displayObject, eventString, eventData });
    }

    /**
     * Maps x and y coords from a DOM object and maps them correctly to the PixiJS view. The
     * resulting value is stored in the point. This takes into account the fact that the DOM
     * element could be scaled and positioned anywhere on the screen.
     *
     * @param  {PIXI.IPointData} point - the point that the result will be stored in
     * @param  {number} x - the x coord of the position to map
     * @param  {number} y - the y coord of the position to map
     */
    public mapPositionToPoint(point: IPointData, x: number, y: number): void
    {
        let rect;

        // IE 11 fix
        if (!this.interactionDOMElement.parentElement)
        {
            rect = {
                x: 0,
                y: 0,
                width: (this.interactionDOMElement as any).width,
                height: (this.interactionDOMElement as any).height,
                left: 0,
                top: 0
            };
        }
        else
        {
            rect = this.interactionDOMElement.getBoundingClientRect();
        }

        const resolutionMultiplier = 1.0 / this.resolution;

        point.x = ((x - rect.left) * ((this.interactionDOMElement as any).width / rect.width)) * resolutionMultiplier;
        point.y = ((y - rect.top) * ((this.interactionDOMElement as any).height / rect.height)) * resolutionMultiplier;
    }

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
    public processInteractive(interactionEvent: InteractionEvent, displayObject: DisplayObject,
        func?: InteractionCallback, hitTest?: boolean
    ): void
    {
        const hit = this.search.findHit(interactionEvent, displayObject, func, hitTest);

        const delayedEvents = this.delayedEvents;

        if (!delayedEvents.length)
        {
            return hit;
        }
        // Reset the propagation hint, because we start deeper in the tree again.
        interactionEvent.stopPropagationHint = false;

        const delayedLen = delayedEvents.length;

        this.delayedEvents = [];

        for (let i = 0; i < delayedLen; i++)
        {
            const { displayObject, eventString, eventData } = delayedEvents[i];

            // When we reach the object we wanted to stop propagating at,
            // set the propagation hint.
            if (eventData.stopsPropagatingAt === displayObject)
            {
                eventData.stopPropagationHint = true;
            }

            this.dispatchEvent(displayObject, eventString, eventData);
        }

        return hit;
    }

    /**
     * Is called when the pointer button is pressed down on the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer button being pressed down
     */
    private onPointerDown(originalEvent: InteractivePointerEvent): void
    {
        // if we support touch events, then only use those for touch events, not pointer events
        if (this.supportsTouchEvents && (originalEvent as PointerEvent).pointerType === 'touch') return;

        const events = this.normalizeToPointerData(originalEvent);

        /*
         * No need to prevent default on natural pointer events, as there are no side effects
         * Normalized events, however, may have the double mousedown/touchstart issue on the native android browser,
         * so still need to be prevented.
         */

        // Guaranteed that there will be at least one event in events, and all events must have the same pointer type

        if (this.autoPreventDefault && (events[0] as any).isNormalized)
        {
            const cancelable = originalEvent.cancelable || !('cancelable' in originalEvent);

            if (cancelable)
            {
                originalEvent.preventDefault();
            }
        }

        const eventLen = events.length;

        for (let i = 0; i < eventLen; i++)
        {
            const event = events[i];

            const interactionData = this.getInteractionDataForPointerId(event);

            const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

            interactionEvent.data.originalEvent = originalEvent;

            this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerDown, true);

            this.emit('pointerdown', interactionEvent);
            if (event.pointerType === 'touch')
            {
                this.emit('touchstart', interactionEvent);
            }
            // emit a mouse event for "pen" pointers, the way a browser would emit a fallback event
            else if (event.pointerType === 'mouse' || event.pointerType === 'pen')
            {
                const isRightButton = event.button === 2;

                this.emit(isRightButton ? 'rightdown' : 'mousedown', this.eventData);
            }
        }
    }

    /**
     * Processes the result of the pointer down check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    private processPointerDown(interactionEvent: InteractionEvent, displayObject: DisplayObject, hit: boolean): void
    {
        const data = interactionEvent.data;
        const id = interactionEvent.data.identifier;

        if (hit)
        {
            if (!displayObject.trackedPointers[id])
            {
                displayObject.trackedPointers[id] = new InteractionTrackingData(id);
            }
            this.dispatchEvent(displayObject, 'pointerdown', interactionEvent);

            if (data.pointerType === 'touch')
            {
                this.dispatchEvent(displayObject, 'touchstart', interactionEvent);
            }
            else if (data.pointerType === 'mouse' || data.pointerType === 'pen')
            {
                const isRightButton = data.button === 2;

                if (isRightButton)
                {
                    displayObject.trackedPointers[id].rightDown = true;
                }
                else
                {
                    displayObject.trackedPointers[id].leftDown = true;
                }

                this.dispatchEvent(displayObject, isRightButton ? 'rightdown' : 'mousedown', interactionEvent);
            }
        }
    }

    /**
     * Is called when the pointer button is released on the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer button being released
     * @param {boolean} cancelled - true if the pointer is cancelled
     * @param {Function} func - Function passed to {@link processInteractive}
     */
    private onPointerComplete(originalEvent: InteractivePointerEvent, cancelled: boolean, func: InteractionCallback): void
    {
        const events = this.normalizeToPointerData(originalEvent);

        const eventLen = events.length;

        // if the event wasn't targeting our canvas, then consider it to be pointerupoutside
        // in all cases (unless it was a pointercancel)
        const eventAppend = originalEvent.target !== this.interactionDOMElement ? 'outside' : '';

        for (let i = 0; i < eventLen; i++)
        {
            const event = events[i];

            const interactionData = this.getInteractionDataForPointerId(event);

            const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

            interactionEvent.data.originalEvent = originalEvent;

            // perform hit testing for events targeting our canvas or cancel events
            this.processInteractive(interactionEvent, this.lastObjectRendered, func, cancelled || !eventAppend);

            this.emit(cancelled ? 'pointercancel' : `pointerup${eventAppend}`, interactionEvent);

            if (event.pointerType === 'mouse' || event.pointerType === 'pen')
            {
                const isRightButton = event.button === 2;

                this.emit(isRightButton ? `rightup${eventAppend}` : `mouseup${eventAppend}`, interactionEvent);
            }
            else if (event.pointerType === 'touch')
            {
                this.emit(cancelled ? 'touchcancel' : `touchend${eventAppend}`, interactionEvent);
                this.releaseInteractionDataForPointerId(event.pointerId);
            }
        }
    }

    /**
     * Is called when the pointer button is cancelled
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer button being released
     */
    private onPointerCancel(event: InteractivePointerEvent): void
    {
        // if we support touch events, then only use those for touch events, not pointer events
        if (this.supportsTouchEvents && (event as PointerEvent).pointerType === 'touch') return;

        this.onPointerComplete(event, true, this.processPointerCancel);
    }

    /**
     * Processes the result of the pointer cancel check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     */
    private processPointerCancel(interactionEvent: InteractionEvent, displayObject: DisplayObject): void
    {
        const data = interactionEvent.data;

        const id = interactionEvent.data.identifier;

        if (displayObject.trackedPointers[id] !== undefined)
        {
            delete displayObject.trackedPointers[id];
            this.dispatchEvent(displayObject, 'pointercancel', interactionEvent);

            if (data.pointerType === 'touch')
            {
                this.dispatchEvent(displayObject, 'touchcancel', interactionEvent);
            }
        }
    }

    /**
     * Is called when the pointer button is released on the renderer element
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer button being released
     */
    private onPointerUp(event: InteractivePointerEvent): void
    {
        // if we support touch events, then only use those for touch events, not pointer events
        if (this.supportsTouchEvents && (event as PointerEvent).pointerType === 'touch') return;

        this.onPointerComplete(event, false, this.processPointerUp);
    }

    /**
     * Processes the result of the pointer up check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    private processPointerUp(interactionEvent: InteractionEvent, displayObject: DisplayObject, hit: boolean): void
    {
        const data = interactionEvent.data;

        const id = interactionEvent.data.identifier;

        const trackingData = displayObject.trackedPointers[id];

        const isTouch = data.pointerType === 'touch';

        const isMouse = (data.pointerType === 'mouse' || data.pointerType === 'pen');
        // need to track mouse down status in the mouse block so that we can emit
        // event in a later block
        let isMouseTap = false;

        // Mouse only
        if (isMouse)
        {
            const isRightButton = data.button === 2;

            const flags = InteractionTrackingData.FLAGS;

            const test = isRightButton ? flags.RIGHT_DOWN : flags.LEFT_DOWN;

            const isDown = trackingData !== undefined && (trackingData.flags & test);

            if (hit)
            {
                this.dispatchEvent(displayObject, isRightButton ? 'rightup' : 'mouseup', interactionEvent);

                if (isDown)
                {
                    this.dispatchEvent(displayObject, isRightButton ? 'rightclick' : 'click', interactionEvent);
                    // because we can confirm that the mousedown happened on this object, flag for later emit of pointertap
                    isMouseTap = true;
                }
            }
            else if (isDown)
            {
                this.dispatchEvent(displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', interactionEvent);
            }
            // update the down state of the tracking data
            if (trackingData)
            {
                if (isRightButton)
                {
                    trackingData.rightDown = false;
                }
                else
                {
                    trackingData.leftDown = false;
                }
            }
        }

        // Pointers and Touches, and Mouse
        if (hit)
        {
            this.dispatchEvent(displayObject, 'pointerup', interactionEvent);
            if (isTouch) this.dispatchEvent(displayObject, 'touchend', interactionEvent);

            if (trackingData)
            {
                // emit pointertap if not a mouse, or if the mouse block decided it was a tap
                if (!isMouse || isMouseTap)
                {
                    this.dispatchEvent(displayObject, 'pointertap', interactionEvent);
                }
                if (isTouch)
                {
                    this.dispatchEvent(displayObject, 'tap', interactionEvent);
                    // touches are no longer over (if they ever were) when we get the touchend
                    // so we should ensure that we don't keep pretending that they are
                    trackingData.over = false;
                }
            }
        }
        else if (trackingData)
        {
            this.dispatchEvent(displayObject, 'pointerupoutside', interactionEvent);
            if (isTouch) this.dispatchEvent(displayObject, 'touchendoutside', interactionEvent);
        }
        // Only remove the tracking data if there is no over/down state still associated with it
        if (trackingData && trackingData.none)
        {
            delete displayObject.trackedPointers[id];
        }
    }

    /**
     * Is called when the pointer moves across the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer moving
     */
    private onPointerMove(originalEvent: InteractivePointerEvent): void
    {
        // if we support touch events, then only use those for touch events, not pointer events
        if (this.supportsTouchEvents && (originalEvent as PointerEvent).pointerType === 'touch') return;

        const events = this.normalizeToPointerData(originalEvent);

        if (events[0].pointerType === 'mouse' || events[0].pointerType === 'pen')
        {
            this._didMove = true;

            this.cursor = null;
        }

        const eventLen = events.length;

        for (let i = 0; i < eventLen; i++)
        {
            const event = events[i];

            const interactionData = this.getInteractionDataForPointerId(event);

            const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

            interactionEvent.data.originalEvent = originalEvent;

            this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerMove, true);

            this.emit('pointermove', interactionEvent);
            if (event.pointerType === 'touch') this.emit('touchmove', interactionEvent);
            if (event.pointerType === 'mouse' || event.pointerType === 'pen') this.emit('mousemove', interactionEvent);
        }

        if (events[0].pointerType === 'mouse')
        {
            this.setCursorMode(this.cursor);

            // TODO BUG for parents interactive object (border order issue)
        }
    }

    /**
     * Processes the result of the pointer move check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    private processPointerMove(interactionEvent: InteractionEvent, displayObject: DisplayObject, hit: boolean): void
    {
        const data = interactionEvent.data;

        const isTouch = data.pointerType === 'touch';

        const isMouse = (data.pointerType === 'mouse' || data.pointerType === 'pen');

        if (isMouse)
        {
            this.processPointerOverOut(interactionEvent, displayObject, hit);
        }

        if (!this.moveWhenInside || hit)
        {
            this.dispatchEvent(displayObject, 'pointermove', interactionEvent);
            if (isTouch) this.dispatchEvent(displayObject, 'touchmove', interactionEvent);
            if (isMouse) this.dispatchEvent(displayObject, 'mousemove', interactionEvent);
        }
    }

    /**
     * Is called when the pointer is moved out of the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer being moved out
     */
    private onPointerOut(originalEvent: InteractivePointerEvent): void
    {
        // if we support touch events, then only use those for touch events, not pointer events
        if (this.supportsTouchEvents && (originalEvent as PointerEvent).pointerType === 'touch') return;

        const events = this.normalizeToPointerData(originalEvent);

        // Only mouse and pointer can call onPointerOut, so events will always be length 1
        const event = events[0];

        if (event.pointerType === 'mouse')
        {
            this.mouseOverRenderer = false;
            this.setCursorMode(null);
        }

        const interactionData = this.getInteractionDataForPointerId(event);

        const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

        interactionEvent.data.originalEvent = event;

        this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerOverOut, false);

        this.emit('pointerout', interactionEvent);
        if (event.pointerType === 'mouse' || event.pointerType === 'pen')
        {
            this.emit('mouseout', interactionEvent);
        }
        else
        {
            // we can get touchleave events after touchend, so we want to make sure we don't
            // introduce memory leaks
            this.releaseInteractionDataForPointerId(interactionData.identifier);
        }
    }

    /**
     * Processes the result of the pointer over/out check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    private processPointerOverOut(interactionEvent: InteractionEvent, displayObject: DisplayObject, hit: boolean): void
    {
        const data = interactionEvent.data;

        const id = interactionEvent.data.identifier;

        const isMouse = (data.pointerType === 'mouse' || data.pointerType === 'pen');

        let trackingData = displayObject.trackedPointers[id];

        // if we just moused over the display object, then we need to track that state
        if (hit && !trackingData)
        {
            trackingData = displayObject.trackedPointers[id] = new InteractionTrackingData(id);
        }

        if (trackingData === undefined) return;

        if (hit && this.mouseOverRenderer)
        {
            if (!trackingData.over)
            {
                trackingData.over = true;
                this.delayDispatchEvent(displayObject, 'pointerover', interactionEvent);
                if (isMouse)
                {
                    this.delayDispatchEvent(displayObject, 'mouseover', interactionEvent);
                }
            }

            // only change the cursor if it has not already been changed (by something deeper in the
            // display tree)
            if (isMouse && this.cursor === null)
            {
                this.cursor = displayObject.cursor;
            }
        }
        else if (trackingData.over)
        {
            trackingData.over = false;
            this.dispatchEvent(displayObject, 'pointerout', this.eventData);
            if (isMouse)
            {
                this.dispatchEvent(displayObject, 'mouseout', interactionEvent);
            }
            // if there is no mouse down information for the pointer, then it is safe to delete
            if (trackingData.none)
            {
                delete displayObject.trackedPointers[id];
            }
        }
    }

    /**
     * Is called when the pointer is moved into the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer button being moved into the renderer view
     */
    private onPointerOver(originalEvent: InteractivePointerEvent): void
    {
        const events = this.normalizeToPointerData(originalEvent);

        // Only mouse and pointer can call onPointerOver, so events will always be length 1
        const event = events[0];

        const interactionData = this.getInteractionDataForPointerId(event);

        const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

        interactionEvent.data.originalEvent = event;

        if (event.pointerType === 'mouse')
        {
            this.mouseOverRenderer = true;
        }

        this.emit('pointerover', interactionEvent);
        if (event.pointerType === 'mouse' || event.pointerType === 'pen')
        {
            this.emit('mouseover', interactionEvent);
        }
    }

    /**
     * Get InteractionData for a given pointerId. Store that data as well
     *
     * @private
     * @param {PointerEvent} event - Normalized pointer event, output from normalizeToPointerData
     * @return {PIXI.InteractionData} - Interaction data for the given pointer identifier
     */
    private getInteractionDataForPointerId(event: PointerEvent): InteractionData
    {
        const pointerId = event.pointerId;

        let interactionData;

        if (pointerId === MOUSE_POINTER_ID || event.pointerType === 'mouse')
        {
            interactionData = this.mouse;
        }
        else if (this.activeInteractionData[pointerId])
        {
            interactionData = this.activeInteractionData[pointerId];
        }
        else
        {
            interactionData = this.interactionDataPool.pop() || new InteractionData();
            interactionData.identifier = pointerId;
            this.activeInteractionData[pointerId] = interactionData;
        }
        // copy properties from the event, so that we can make sure that touch/pointer specific
        // data is available
        interactionData.copyEvent(event);

        return interactionData;
    }

    /**
     * Return unused InteractionData to the pool, for a given pointerId
     *
     * @private
     * @param {number} pointerId - Identifier from a pointer event
     */
    private releaseInteractionDataForPointerId(pointerId: number): void
    {
        const interactionData = this.activeInteractionData[pointerId];

        if (interactionData)
        {
            delete this.activeInteractionData[pointerId];
            interactionData.reset();
            this.interactionDataPool.push(interactionData);
        }
    }

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
    private configureInteractionEventForDOMEvent(interactionEvent: InteractionEvent, pointerEvent: PointerEvent,
        interactionData: InteractionData
    ): InteractionEvent
    {
        interactionEvent.data = interactionData;

        this.mapPositionToPoint(interactionData.global, pointerEvent.clientX, pointerEvent.clientY);

        // Not really sure why this is happening, but it's how a previous version handled things
        if (pointerEvent.pointerType === 'touch')
        {
            (pointerEvent as any).globalX = interactionData.global.x;
            (pointerEvent as any).globalY = interactionData.global.y;
        }

        interactionData.originalEvent = pointerEvent;
        interactionEvent.reset();

        return interactionEvent;
    }

    /**
     * Ensures that the original event object contains all data that a regular pointer event would have
     *
     * @private
     * @param {TouchEvent|MouseEvent|PointerEvent} event - The original event data from a touch or mouse event
     * @return {PointerEvent[]} An array containing a single normalized pointer event, in the case of a pointer
     *  or mouse event, or a multiple normalized pointer events if there are multiple changed touches
     */
    private normalizeToPointerData(event: InteractivePointerEvent): PointerEvent[]
    {
        const normalizedEvents = [];

        if (this.supportsTouchEvents && event instanceof TouchEvent)
        {
            for (let i = 0, li = event.changedTouches.length; i < li; i++)
            {
                const touch = event.changedTouches[i] as PixiTouch;

                if (typeof touch.button === 'undefined') touch.button = event.touches.length ? 1 : 0;
                if (typeof touch.buttons === 'undefined') touch.buttons = event.touches.length ? 1 : 0;
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
     * Destroys the interaction manager
     *
     */
    public destroy(): void
    {
        this.removeEvents();

        this.removeTickerListener();

        this.removeAllListeners();

        this.renderer = null;

        this.mouse = null;

        this.eventData = null;

        this.interactionDOMElement = null;

        this.onPointerDown = null;
        this.processPointerDown = null;

        this.onPointerUp = null;
        this.processPointerUp = null;

        this.onPointerCancel = null;
        this.processPointerCancel = null;

        this.onPointerMove = null;
        this.processPointerMove = null;

        this.onPointerOut = null;
        this.processPointerOverOut = null;

        this.onPointerOver = null;

        this.search = null;
    }
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
}

interface PixiTouch extends Touch
{
    button: number;
    buttons: number;
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
    layerX: number;
    layerY: number;
    offsetX: number;
    offsetY: number;
    isNormalized: boolean;
}
