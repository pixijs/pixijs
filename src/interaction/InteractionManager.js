import * as core from '../core';
import InteractionData from './InteractionData';
import InteractionEvent from './InteractionEvent';
import EventEmitter from 'eventemitter3';
import interactiveTarget from './interactiveTarget';
import MobileDevice from 'ismobilejs';

// Mix interactiveTarget into core.DisplayObject.prototype
Object.assign(
    core.DisplayObject.prototype,
    interactiveTarget
);

const MOUSE_POINTER_ID = 1;

/**
 * The interaction manager deals with mouse, touch and pointer events. Any DisplayObject can be interactive
 * if its interactive parameter is set to true
 * This manager also supports multitouch.
 *
 * @class
 * @extends EventEmitter
 * @memberof PIXI.interaction
 */
export default class InteractionManager extends EventEmitter
{
    /**
     * @param {PIXI.CanvasRenderer|PIXI.WebGLRenderer} renderer - A reference to the current renderer
     * @param {object} [options] - The options for the manager.
     * @param {boolean} [options.autoPreventDefault=true] - Should the manager automatically prevent default browser actions.
     * @param {number} [options.interactionFrequency=10] - Frequency increases the interaction events will be checked.
     */
    constructor(renderer, options)
    {
        super();

        options = options || {};

        /**
         * The renderer this interaction manager works for.
         *
         * @member {PIXI.SystemRenderer}
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
         * As this frequency increases the interaction events will be checked more often.
         *
         * @member {number}
         * @default 10
         */
        this.interactionFrequency = options.interactionFrequency || 10;

        /**
         * The mouse data
         *
         * @member {PIXI.interaction.InteractionData}
         */
        this.mouse = new InteractionData();

        // setting the mouse to start off far off screen will mean that mouse over does
        //  not get called before we even move the mouse.
        this.mouse.global.set(-999999);

        /**
         * Actively tracked InteractionData
         *
         * @private
         * @member {Object.<number,PIXI.interation.InteractionData>}
         */
        this.activeInteractionData = {};
        this.activeInteractionData[MOUSE_POINTER_ID] = this.mouse;

        /**
         * An event data object to handle all the event tracking/dispatching
         *
         * @member {object}
         */
        this.eventData = new InteractionEvent();

        /**
         * The DOM element to bind to.
         *
         * @private
         * @member {HTMLElement}
         */
        this.interactionDOMElement = null;

        /**
         * This property determins if mousemove and touchmove events are fired only when the cursror
         * is over the object.
         * Setting to true will make things work more in line with how the DOM verison works.
         * Setting to false can make things easier for things like dragging
         * It is currently set to false as this is how pixi used to work. This will be set to true in
         * future versions of pixi.
         *
         * @private
         * @member {boolean}
         */
        this.moveWhenInside = false;

        /**
         * Have events been attached to the dom element?
         *
         * @private
         * @member {boolean}
         */
        this.eventsAdded = false;

        /**
         * Is the mouse hovering over the renderer?
         *
         * @private
         * @member {boolean}
         */
        this.mouseOverRenderer = false;

        /**
         * Does the device support touch events
         * https://www.w3.org/TR/touch-events/
         *
         * @readonly
         * @member {boolean}
         */
        this.supportsTouchEvents = 'ontouchstart' in window;

        /**
         * Does the device support pointer events
         * https://www.w3.org/Submission/pointer-events/
         *
         * @readonly
         * @member {boolean}
         */
        this.supportsPointerEvents = !!window.PointerEvent;

        /**
         * Are touch events being 'normalized' and converted into pointer events if pointer events are not supported
         * For example, on a touch screen mobile device, a touchstart would also be emitted as a pointerdown
         *
         * @private
         * @readonly
         * @member {boolean}
         */
        this.normalizeTouchEvents = !this.supportsPointerEvents && this.supportsTouchEvents;

        /**
         * Are mouse events being 'normalized' and converted into pointer events if pointer events are not supported
         * For example, on a desktop pc, a mousedown would also be emitted as a pointerdown
         *
         * @private
         * @readonly
         * @member {boolean}
         */
        this.normalizeMouseEvents = !this.supportsPointerEvents && !MobileDevice.any;

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
         * Every update cursor will be reset to this value, if some element wont override it in
         * its hitTest.
         *
         * @member {string}
         * @default 'inherit'
         */
        this.defaultCursorStyle = 'inherit';

        /**
         * The css style of the cursor that is being used.
         *
         * @member {string}
         */
        this.currentCursorStyle = 'inherit';

        /**
         * Internal cached let.
         *
         * @private
         * @member {PIXI.Point}
         */
        this._tempPoint = new core.Point();

        /**
         * The current resolution / device pixel ratio.
         *
         * @member {number}
         * @default 1
         */
        this.resolution = 1;

        this.setTargetElement(this.renderer.view, this.renderer.resolution);

        /**
         * Fired when a pointer device button (usually a mouse button) is pressed on the display
         * object.
         *
         * @event mousedown
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * on the display object.
         *
         * @event rightdown
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device button (usually a mouse button) is released over the display
         * object.
         *
         * @event mouseup
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * over the display object.
         *
         * @event rightup
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device button (usually a mouse button) is pressed and released on
         * the display object.
         *
         * @event click
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * and released on the display object.
         *
         * @event rightclick
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device button (usually a mouse button) is released outside the
         * display object that initially registered a
         * [mousedown]{@link PIXI.interaction.InteractionManager#event:mousedown}.
         *
         * @event mouseupoutside
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * outside the display object that initially registered a
         * [rightdown]{@link PIXI.interaction.InteractionManager#event:rightdown}.
         *
         * @event rightupoutside
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device (usually a mouse) is moved while over the display object
         *
         * @event mousemove
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device (usually a mouse) is moved onto the display object
         *
         * @event mouseover
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device (usually a mouse) is moved off the display object
         *
         * @event mouseout
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device button is pressed on the display object.
         *
         * @event pointerdown
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device button is released over the display object.
         *
         * @event pointerup
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when the operating system cancels a pointer event
         *
         * @event pointercancel
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device button is pressed and released on the display object.
         *
         * @event pointertap
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device button is released outside the display object that initially
         * registered a [pointerdown]{@link PIXI.interaction.InteractionManager#event:pointerdown}.
         *
         * @event pointerupoutside
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device is moved while over the display object
         *
         * @event pointermove
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device is moved onto the display object
         *
         * @event pointerover
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device is moved off the display object
         *
         * @event pointerout
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a touch point is placed on the display object.
         *
         * @event touchstart
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a touch point is removed from the display object.
         *
         * @event touchend
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when the operating system cancels a touch
         *
         * @event touchcancel
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a touch point is placed and removed from the display object.
         *
         * @event tap
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a touch point is removed outside of the display object that initially
         * registered a [touchstart]{@link PIXI.interaction.InteractionManager#event:touchstart}.
         *
         * @event touchendoutside
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a touch point is moved along the display object.
         *
         * @event touchmove
         * @memberof PIXI.interaction.InteractionManager#
         */
    }

    /**
     * Sets the DOM element which will receive mouse/touch events. This is useful for when you have
     * other DOM elements on top of the renderers Canvas element. With this you'll be bale to deletegate
     * another DOM element to receive those events.
     *
     * @param {HTMLCanvasElement} element - the DOM element which will receive mouse and touch events.
     * @param {number} [resolution=1] - The resolution / device pixel ratio of the new element (relative to the canvas).
     * @private
     */
    setTargetElement(element, resolution = 1)
    {
        this.removeEvents();

        this.interactionDOMElement = element;

        this.resolution = resolution;

        this.addEvents();
    }

    /**
     * Registers all the DOM events
     *
     * @private
     */
    addEvents()
    {
        if (!this.interactionDOMElement)
        {
            return;
        }

        core.ticker.shared.add(this.update, this);

        if (window.navigator.msPointerEnabled)
        {
            this.interactionDOMElement.style['-ms-content-zooming'] = 'none';
            this.interactionDOMElement.style['-ms-touch-action'] = 'none';
        }
        else if (this.supportsPointerEvents)
        {
            this.interactionDOMElement.style['touch-action'] = 'none';
        }

        /**
         * These events are added first, so that if pointer events are normalised, they are fired
         * in the same order as non-normalised events. ie. pointer event 1st, mouse / touch 2nd
         */
        if (this.supportsPointerEvents)
        {
            window.document.addEventListener('pointermove', this.onPointerMove, true);
            this.interactionDOMElement.addEventListener('pointerdown', this.onPointerDown, true);
            this.interactionDOMElement.addEventListener('pointerout', this.onPointerOut, true);
            this.interactionDOMElement.addEventListener('pointerover', this.onPointerOver, true);
            window.addEventListener('pointercancel', this.onPointerCancel, true);
            window.addEventListener('pointerup', this.onPointerUp, true);
        }

        window.document.addEventListener('mousemove', this.onPointerMove, true);
        this.interactionDOMElement.addEventListener('mousedown', this.onPointerDown, true);
        this.interactionDOMElement.addEventListener('mouseout', this.onPointerOut, true);
        this.interactionDOMElement.addEventListener('mouseover', this.onPointerOver, true);
        window.addEventListener('mouseup', this.onPointerUp, true);

        if (this.supportsTouchEvents)
        {
            this.interactionDOMElement.addEventListener('touchstart', this.onPointerStart, true);
            this.interactionDOMElement.addEventListener('touchcancel', this.onPointerCancel, true);
            this.interactionDOMElement.addEventListener('touchend', this.onPointerEnd, true);
            this.interactionDOMElement.addEventListener('touchmove', this.onPointerMove, true);
        }

        this.eventsAdded = true;
    }

    /**
     * Removes all the DOM events that were previously registered
     *
     * @private
     */
    removeEvents()
    {
        if (!this.interactionDOMElement)
        {
            return;
        }

        core.ticker.shared.remove(this.update, this);

        if (window.navigator.msPointerEnabled)
        {
            this.interactionDOMElement.style['-ms-content-zooming'] = '';
            this.interactionDOMElement.style['-ms-touch-action'] = '';
        }
        else if (this.supportsPointerEvents)
        {
            this.interactionDOMElement.style['touch-action'] = '';
        }

        if (this.supportsPointerEvents)
        {
            window.document.removeEventListener('pointermove', this.onPointerMove, true);
            this.interactionDOMElement.removeEventListener('pointerdown', this.onPointerDown, true);
            this.interactionDOMElement.removeEventListener('pointerout', this.onPointerOut, true);
            this.interactionDOMElement.removeEventListener('pointerover', this.onPointerOver, true);
            window.removeEventListener('pointercancel', this.onPointerCancel, true);
            window.removeEventListener('pointerup', this.onPointerUp, true);
        }

        window.document.removeEventListener('mousemove', this.onPointerMove, true);
        this.interactionDOMElement.removeEventListener('mousedown', this.onPointerDown, true);
        this.interactionDOMElement.removeEventListener('mouseout', this.onPointerOut, true);
        this.interactionDOMElement.removeEventListener('mouseover', this.onPointerOver, true);
        window.removeEventListener('mouseup', this.onPointerUp, true);

        if (this.supportsTouchEvents)
        {
            this.interactionDOMElement.removeEventListener('touchstart', this.onPointerStart, true);
            this.interactionDOMElement.removeEventListener('touchcancel', this.onPointerCancel, true);
            this.interactionDOMElement.removeEventListener('touchend', this.onPointerEnd, true);
            this.interactionDOMElement.removeEventListener('touchmove', this.onPointerMove, true);
        }

        this.interactionDOMElement = null;

        this.eventsAdded = false;
    }

    /**
     * Updates the state of interactive objects.
     * Invoked by a throttled ticker update from {@link PIXI.ticker.shared}.
     *
     * @param {number} deltaTime - time delta since last tick
     */
    update(deltaTime)
    {
        this._deltaTime += deltaTime;

        if (this._deltaTime < this.interactionFrequency)
        {
            return;
        }

        this._deltaTime = 0;

        if (!this.interactionDOMElement)
        {
            return;
        }

        // if the user move the mouse this check has already been done using the mouse move!
        if (this.didMove)
        {
            this.didMove = false;

            return;
        }

        this.cursor = this.defaultCursorStyle;

        // Resets the flag as set by a stopPropagation call. This flag is usually reset by a user interaction of any kind,
        // but there was a scenario of a display object moving under a static mouse cursor.
        // In this case, mouseover and mouseevents would not pass the flag test in dispatchEvent function
        for (const k in this.activeInteractionData)
        {
            if (Object.prototype.hasOwnProperty.call(this.activeInteractionData, k))
            {
                const interactionData = this.activeInteractionData[k];

                if (interactionData.originalEvent && interactionData.pointerType !== 'touch')
                {
                    const interactionEvent = this.getInteractionEventForDOMEvent(
                        interactionData.originalEvent,
                        interactionData
                    );

                    this.processInteractive(
                        interactionEvent,
                        this.renderer._lastObjectRendered,
                        this.processPointerOverOut,
                        true
                    );
                }
            }
        }

        if (this.currentCursorStyle !== this.cursor)
        {
            this.currentCursorStyle = this.cursor;
            this.interactionDOMElement.style.cursor = this.cursor;
        }

        // TODO
    }

    /**
     * Dispatches an event on the display object that was interacted with
     *
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - the display object in question
     * @param {string} eventString - the name of the event (e.g, mousedown)
     * @param {object} eventData - the event data object
     * @private
     */
    dispatchEvent(displayObject, eventString, eventData)
    {
        if (!eventData.stopped)
        {
            eventData.currentTarget = displayObject;
            eventData.type = eventString;

            displayObject.emit(eventString, eventData);

            if (displayObject[eventString])
            {
                displayObject[eventString](eventData);
            }
        }
    }

    /**
     * Maps x and y coords from a DOM object and maps them correctly to the pixi view. The
     * resulting value is stored in the point. This takes into account the fact that the DOM
     * element could be scaled and positioned anywhere on the screen.
     *
     * @param  {PIXI.Point} point - the point that the result will be stored in
     * @param  {number} x - the x coord of the position to map
     * @param  {number} y - the y coord of the position to map
     */
    mapPositionToPoint(point, x, y)
    {
        let rect;

        // IE 11 fix
        if (!this.interactionDOMElement.parentElement)
        {
            rect = { x: 0, y: 0, width: 0, height: 0 };
        }
        else
        {
            rect = this.interactionDOMElement.getBoundingClientRect();
        }

        point.x = ((x - rect.left) * (this.interactionDOMElement.width / rect.width)) / this.resolution;
        point.y = ((y - rect.top) * (this.interactionDOMElement.height / rect.height)) / this.resolution;
    }

    /**
     * This function is provides a neat way of crawling through the scene graph and running a
     * specified function on all interactive objects it finds. It will also take care of hit
     * testing the interactive objects and passes the hit across in the function.
     *
     * @private
     * @param {InteractionEvent} interactionEvent - event containing the point that
     *  is tested for collision
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - the displayObject
     *  that will be hit test (recursively crawls its children)
     * @param {Function} [func] - the function that will be called on each interactive object. The
     *  interactionEvent, displayObject and hit will be passed to the function
     * @param {boolean} [hitTest] - this indicates if the objects inside should be hit test against the point
     * @param {boolean} [interactive] - Whether the displayObject is interactive
     * @return {boolean} returns true if the displayObject hit the point
     */
    processInteractive(interactionEvent, displayObject, func, hitTest, interactive)
    {
        if (!displayObject || !displayObject.visible)
        {
            return false;
        }

        const point = interactionEvent.data.global;

        // Took a little while to rework this function correctly! But now it is done and nice and optimised. ^_^
        //
        // This function will now loop through all objects and then only hit test the objects it HAS
        // to, not all of them. MUCH faster..
        // An object will be hit test if the following is true:
        //
        // 1: It is interactive.
        // 2: It belongs to a parent that is interactive AND one of the parents children have not already been hit.
        //
        // As another little optimisation once an interactive object has been hit we can carry on
        // through the scenegraph, but we know that there will be no more hits! So we can avoid extra hit tests
        // A final optimisation is that an object is not hit test directly if a child has already been hit.

        interactive = displayObject.interactive || interactive;

        let hit = false;
        let interactiveParent = interactive;

        // if the displayobject has a hitArea, then it does not need to hitTest children.
        if (displayObject.hitArea)
        {
            interactiveParent = false;
        }

        // it has a mask! Then lets hit test that before continuing..
        if (hitTest && displayObject._mask)
        {
            if (!displayObject._mask.containsPoint(point))
            {
                hitTest = false;
            }
        }

        // it has a filterArea! Same as mask but easier, its a rectangle
        if (hitTest && displayObject.filterArea)
        {
            if (!displayObject.filterArea.contains(point.x, point.y))
            {
                hitTest = false;
            }
        }

        // ** FREE TIP **! If an object is not interactive or has no buttons in it
        // (such as a game scene!) set interactiveChildren to false for that displayObject.
        // This will allow pixi to completely ignore and bypass checking the displayObjects children.
        if (displayObject.interactiveChildren && displayObject.children)
        {
            const children = displayObject.children;

            for (let i = children.length - 1; i >= 0; i--)
            {
                const child = children[i];

                // time to get recursive.. if this function will return if something is hit..
                if (this.processInteractive(interactionEvent, child, func, hitTest, interactiveParent))
                {
                    // its a good idea to check if a child has lost its parent.
                    // this means it has been removed whilst looping so its best
                    if (!child.parent)
                    {
                        continue;
                    }

                    hit = true;

                    // we no longer need to hit test any more objects in this container as we we
                    // now know the parent has been hit
                    interactiveParent = false;

                    // If the child is interactive , that means that the object hit was actually
                    // interactive and not just the child of an interactive object.
                    // This means we no longer need to hit test anything else. We still need to run
                    // through all objects, but we don't need to perform any hit tests.

                    // {
                    hitTest = false;
                    // }

                    // we can break now as we have hit an object.
                }
            }
        }

        // no point running this if the item is not interactive or does not have an interactive parent.
        if (interactive)
        {
            // if we are hit testing (as in we have no hit any objects yet)
            // We also don't need to worry about hit testing if once of the displayObjects children
            // has already been hit!
            if (hitTest && !hit)
            {
                if (displayObject.hitArea)
                {
                    displayObject.worldTransform.applyInverse(point, this._tempPoint);
                    hit = displayObject.hitArea.contains(this._tempPoint.x, this._tempPoint.y);
                }
                else if (displayObject.containsPoint)
                {
                    hit = displayObject.containsPoint(point);
                }
            }

            if (displayObject.interactive)
            {
                if (hit && !interactionEvent.target)
                {
                    interactionEvent.target = displayObject;
                }

                func(interactionEvent, displayObject, hit);
            }
        }

        return hit;
    }

    /**
     * Is called when the pointer button is pressed down on the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer button being pressed down
     */
    onPointerDown(originalEvent)
    {
        this.normalizeToPointerData(originalEvent);

        /**
         * No need to prevent default on natural pointer events, as there are no side effects
         * Normalized events, however, may have the double mousedown/touchstart issue on the native android browser,
         * so still need to be prevented.
         */
        if (this.autoPreventDefault && (originalEvent.pointerType === 'touch' || originalEvent.pointerType === 'mouse'))
        {
            originalEvent.preventDefault();
        }

        const events = originalEvent.changedTouches || [originalEvent];

        const eventLen = events.length;

        for (let i = 0; i < eventLen; i++)
        {
            const event = events[i];

            const interactionEvent = this.getInteractionEventForDOMEvent(event);

            interactionEvent.data.originalEvent = originalEvent;

            this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, this.processPointerDown, true);

            this.emit('pointerdown', interactionEvent);
            if (event.pointerType === 'touch')
            {
                this.emit('touchstart', interactionEvent);
            }
            else if (event.pointerType === 'mouse')
            {
                const isRightButton = event.button === 2 || event.which === 3;

                this.emit(isRightButton ? 'rightdown' : 'mousedown', this.eventData);
            }
        }
    }

    /**
     * Processes the result of the pointer down check and dispatches the event if need be
     *
     * @private
     * @param {InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    processPointerDown(interactionEvent, displayObject, hit)
    {
        const e = interactionEvent.data.originalEvent;

        if (hit)
        {
            displayObject._pointerIdentifiers.add(e.pointerId);
            this.dispatchEvent(displayObject, 'pointerdown', interactionEvent);

            if (e.pointerType === 'touch')
            {
                this.dispatchEvent(displayObject, 'touchstart', interactionEvent);
            }
            else if (e.pointerType === 'mouse')
            {
                const isRightButton = e.button === 2 || e.which === 3;

                displayObject[isRightButton ? '_isRightDown' : '_isLeftDown'] = true;
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
    onPointerComplete(originalEvent, cancelled, func)
    {
        this.normalizeToPointerData(originalEvent);

        const events = originalEvent.changedTouches || [originalEvent];

        const eventLen = events.length;

        for (let i = 0; i < eventLen; i++)
        {
            const event = events[i];

            const interactionEvent = this.getInteractionEventForDOMEvent(event);

            interactionEvent.data.originalEvent = originalEvent;

            this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, func, true);

            this.emit(cancelled ? 'pointercancel' : 'pointerup', interactionEvent);

            if (originalEvent.pointerType === 'mouse')
            {
                const isRightButton = event.button === 2 || event.which === 3;

                this.emit(isRightButton ? 'rightup' : 'mouseup', interactionEvent);
            }
            else if (originalEvent.pointerType === 'touch')
            {
                this.emit(cancelled ? 'touchcancel' : 'touchend', interactionEvent);
            }
        }
    }

    /**
     * Is called when the pointer button is cancelled
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer button being released
     */
    onPointerCancel(event)
    {
        this.onPointerComplete(event, true, this.processPointerCancel);
    }

    /**
     * Processes the result of the pointer cancel check and dispatches the event if need be
     *
     * @private
     * @param {InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     */
    processPointerCancel(interactionEvent, displayObject)
    {
        const e = interactionEvent.data.originalEvent;

        if (displayObject._touchCount > 0)
        {
            displayObject._touchCount --;
            this.dispatchEvent(displayObject, 'touchcancel', interactionEvent);
        }

        if (displayObject._pointerIdentifiers.has(e.pointerId))
        {
            displayObject._pointerIdentifiers.delete(e.pointerId);
            this.dispatchEvent(displayObject, 'pointercancel', interactionEvent);

            if (e.pointerType === 'touch')
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
    onPointerUp(event)
    {
        this.onPointerComplete(event, false, this.processPointerUp);
    }

    /**
     * Processes the result of the pointer up check and dispatches the event if need be
     *
     * @private
     * @param {InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    processPointerUp(interactionEvent, displayObject, hit)
    {
        const e = interactionEvent.data.originalEvent;

        // Pointers and Touches
        if (hit)
        {
            this.dispatchEvent(displayObject, 'pointerup', interactionEvent);
            if (e.pointerType === 'touch') this.dispatchEvent(displayObject, 'touchend', interactionEvent);

            if (displayObject._pointerIdentifiers.has(e.pointerId))
            {
                displayObject._pointerIdentifiers.delete(e.pointerId);
                this.dispatchEvent(displayObject, 'pointertap', interactionEvent);
                if (e.pointerType === 'touch') this.dispatchEvent(displayObject, 'tap', interactionEvent);
            }
        }
        else if (displayObject._pointerIdentifiers.has(e.pointerId))
        {
            displayObject._pointerIdentifiers.delete(e.pointerId);
            this.dispatchEvent(displayObject, 'pointerupoutside', interactionEvent);
            if (e.pointerType === 'touch') this.dispatchEvent(displayObject, 'touchendoutside', interactionEvent);
        }

        // Mouse only
        if (e.pointerType === 'mouse')
        {
            const isRightButton = e.button === 2 || e.which === 3;

            const isDown = isRightButton ? '_isRightDown' : '_isLeftDown';

            if (hit)
            {
                this.dispatchEvent(displayObject, isRightButton ? 'rightup' : 'mouseup', interactionEvent);

                if (displayObject[isDown])
                {
                    displayObject[isDown] = false;
                    this.dispatchEvent(displayObject, isRightButton ? 'rightclick' : 'click', interactionEvent);
                }
            }
            else if (displayObject[isDown])
            {
                displayObject[isDown] = false;
                this.dispatchEvent(displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', interactionEvent);
            }
        }
    }

    /**
     * Is called when the pointer moves across the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer moving
     */
    onPointerMove(originalEvent)
    {
        this.normalizeToPointerData(originalEvent);

        if (originalEvent.pointerType === 'mouse')
        {
            this.didMove = true;

            this.cursor = this.defaultCursorStyle;
        }

        const interactive = originalEvent.pointerType === 'touch' ? this.moveWhenInside : true;

        const events = originalEvent.changedTouches || [originalEvent];

        const eventLen = events.length;

        for (let i = 0; i < eventLen; i++)
        {
            const event = events[i];

            const interactionEvent = this.getInteractionEventForDOMEvent(event);

            interactionEvent.data.originalEvent = originalEvent;

            this.processInteractive(
                interactionEvent,
                this.renderer._lastObjectRendered,
                this.processPointerMove,
                interactive
            );
            this.emit('pointermove', this.eventData);
            if (originalEvent.pointerType === 'touch') this.emit('touchmove', interactionEvent);
            if (originalEvent.pointerType === 'mouse') this.emit('mousemove', interactionEvent);
        }

        if (originalEvent.pointerType === 'mouse')
        {
            if (this.currentCursorStyle !== this.cursor)
            {
                this.currentCursorStyle = this.cursor;
                this.interactionDOMElement.style.cursor = this.cursor;
            }

            // TODO BUG for parents interactive object (border order issue)
        }
    }

    /**
     * Processes the result of the pointer move check and dispatches the event if need be
     *
     * @private
     * @param {InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    processPointerMove(interactionEvent, displayObject, hit)
    {
        const e = interactionEvent.data.originalEvent;

        if (e.pointerType !== 'touch')
        {
            this.processPointerOverOut(interactionEvent, displayObject, hit);
        }

        if (!this.moveWhenInside || hit)
        {
            this.dispatchEvent(displayObject, 'pointermove', interactionEvent);
            if (e.pointerType === 'touch') this.dispatchEvent(displayObject, 'touchmove', interactionEvent);
            if (e.pointerType === 'mouse') this.dispatchEvent(displayObject, 'mousemove', interactionEvent);
        }
    }

    /**
     * Is called when the pointer is moved out of the renderer element
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer being moved out
     */
    onPointerOut(event)
    {
        this.normalizeToPointerData(event);

        if (event.pointerType === 'mouse')
        {
            this.mouseOverRenderer = false;
            this.interactionDOMElement.style.cursor = this.defaultCursorStyle;
        }

        const interactionEvent = this.getInteractionEventForDOMEvent(event);

        interactionEvent.data.originalEvent = event;

        this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, this.processPointerOverOut, false);

        this.emit('pointerout', interactionEvent);
        if (event.pointerType === 'mouse')
        {
            this.emit('mouseout', interactionEvent);
        }
    }

    /**
     * Processes the result of the pointer over/out check and dispatches the event if need be
     *
     * @private
     * @param {InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    processPointerOverOut(interactionEvent, displayObject, hit)
    {
        const e = interactionEvent.data.originalEvent;

        const overFlag = e.pointerType === 'mouse' ? '_mouseOver' : '_pointerOver';

        if (hit && this.mouseOverRenderer)
        {
            if (!displayObject[overFlag])
            {
                displayObject[overFlag] = true;
                this.dispatchEvent(displayObject, 'pointerover', interactionEvent);
                if (e.pointerType === 'mouse')
                {
                    this.dispatchEvent(displayObject, 'mouseover', interactionEvent);
                }
            }

            if (e.pointerType === 'mouse' && displayObject.buttonMode)
            {
                this.cursor = displayObject.defaultCursor;
            }
        }
        else if (displayObject[overFlag])
        {
            displayObject[overFlag] = false;
            this.dispatchEvent(displayObject, 'pointerout', this.eventData);
            if (e.pointerType === 'mouse')
            {
                this.dispatchEvent(displayObject, 'mouseout', interactionEvent);
            }
        }
    }

    /**
     * Is called when the pointer is moved into the renderer element
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer button being moved into the renderer view
     */
    onPointerOver(event)
    {
        this.normalizeToPointerData(event);
        const interactionEvent = this.getInteractionEventForDOMEvent(event);

        interactionEvent.data.originalEvent = event;

        if (event.pointerType === 'mouse')
        {
            this.mouseOverRenderer = true;
        }

        this.emit('pointerover', interactionEvent);
        if (event.pointerType === 'mouse')
        {
            this.emit('mouseover', interactionEvent);
        }
    }

    /**
     * Get InteractionData for a given pointerId. Store that data as well
     *
     * @private
     * @param {number} pointerId - Identifier from a pointer event
     * @return {InteractionData} - Interaction data for the givent pointer identifier
     */
    getIteractionDataForPointerId(pointerId)
    {
        if (pointerId === MOUSE_POINTER_ID)
        {
            return this.mouse;
        }
        else if (this.activeInteractionData[pointerId])
        {
            return this.activeInteractionData[pointerId];
        }

        const interactionData = new InteractionData();

        this.activeInteractionData[pointerId] = interactionData;

        return interactionData;
    }

    /**
     * Configure an InteractionEvent to wrap a DOM PointerEvent and InteractionData
     *
     * @private
     * @param {InteractionEvent} interactionEvent - The event to be configured
     * @param {PointerEvent} pointerEvent - The DOM event that will be paired with the InteractionEvent
     * @param {InteractionData} interactionData - The InteractionData that will be paired with the InteractionEvent
     * @return {InteractionEvent} the interaction event that was passed in
     */
    configureInteractionEventForDOMEvent(interactionEvent, pointerEvent, interactionData)
    {
        interactionEvent.data = interactionData;

        this.mapPositionToPoint(interactionData.global, pointerEvent.clientX, pointerEvent.clientY);

        // This is the way InteractionManager processed touch events before the refactoring, so I've kept
        // it here. But it doesn't make that much sense to me, since mapPositionToPoint already factors
        // in this.resolution, so this just divides by this.resolution twice for touch events...
        if (navigator.isCocoonJS && event.pointerType === 'touch')
        {
            interactionData.global.x = interactionData.global.x / this.resolution;
            interactionData.global.y = interactionData.global.y / this.resolution;
        }

        // Not really sure why this is happening, but it's how a previous version handled things
        if (pointerEvent.pointerType === 'touch')
        {
            pointerEvent.globalX = interactionData.global.x;
            pointerEvent.globalY = interactionData.global.y;
        }

        interactionData.originalEvent = pointerEvent;
        interactionEvent._reset();

        return interactionEvent;
    }

    /**
     * Ensures that the original event object contains all data that a regular pointer event would have
     *
     * @private
     * @param {TouchEvent|MouseEvent|PointerEvent} event - The original event data from a touch or mouse event
     */
    normalizeToPointerData(event)
    {
        const type = typeof event;

        if (type === 'TouchEvent')
        {
            if (typeof event.button === 'undefined') event.button = event.touches.length ? 1 : 0;
            if (typeof event.buttons === 'undefined') event.buttons = event.touches.length ? 1 : 0;
            if (typeof event.isPrimary === 'undefined') event.isPrimary = event.touches.length === 1;
            if (typeof event.width === 'undefined') event.width = event.changedTouches[0].radiusX || 1;
            if (typeof event.height === 'undefined') event.height = event.changedTouches[0].radiusY || 1;
            if (typeof event.tiltX === 'undefined') event.tiltX = 0;
            if (typeof event.tiltY === 'undefined') event.tiltY = 0;
            if (typeof event.pointerType === 'undefined') event.pointerType = 'touch';
            if (typeof event.pointerId === 'undefined') event.pointerId = event.changedTouches[0].identifier || 0;
            if (typeof event.pressure === 'undefined') event.pressure = event.changedTouches[0].force || 0.5;
            if (typeof event.rotation === 'undefined') event.rotation = event.changedTouches[0].rotationAngle || 0;

            if (typeof event.clientX === 'undefined') event.clientX = event.changedTouches[0].clientX;
            if (typeof event.clientY === 'undefined') event.clientY = event.changedTouches[0].clientY;
            if (typeof event.pageX === 'undefined') event.pageX = event.changedTouches[0].pageX;
            if (typeof event.pageY === 'undefined') event.pageY = event.changedTouches[0].pageY;
            if (typeof event.screenX === 'undefined') event.screenX = event.changedTouches[0].screenX;
            if (typeof event.screenY === 'undefined') event.screenY = event.changedTouches[0].screenY;
            if (typeof event.layerX === 'undefined') event.layerX = event.offsetX = event.clientX;
            if (typeof event.layerY === 'undefined') event.layerY = event.offsetY = event.clientY;
        }
        else if (type === 'MouseEvent')
        {
            if (typeof event.isPrimary === 'undefined') event.isPrimary = true;
            if (typeof event.width === 'undefined') event.width = 1;
            if (typeof event.height === 'undefined') event.height = 1;
            if (typeof event.tiltX === 'undefined') event.tiltX = 0;
            if (typeof event.tiltY === 'undefined') event.tiltY = 0;
            if (typeof event.pointerType === 'undefined') event.pointerType = 'mouse';
            if (typeof event.pointerId === 'undefined') event.pointerId = MOUSE_POINTER_ID;
            if (typeof event.pressure === 'undefined') event.pressure = 0.5;
            if (typeof event.rotation === 'undefined') event.rotation = 0;
        }
    }

    /**
     * Destroys the interaction manager
     *
     */
    destroy()
    {
        this.removeEvents();

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

        this._tempPoint = null;
    }
}

core.WebGLRenderer.registerPlugin('interaction', InteractionManager);
core.CanvasRenderer.registerPlugin('interaction', InteractionManager);
