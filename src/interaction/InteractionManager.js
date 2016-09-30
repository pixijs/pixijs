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

/**
 * The interaction manager deals with mouse and touch events. Any DisplayObject can be interactive
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
         * The pointer data
         *
         * @member {PIXI.interaction.InteractionData}
         */
        this.pointer = new InteractionData();

        // setting the pointer to start off far off screen will mean that pointer over does
        //  not get called before we even move the pointer.
        this.pointer.global.set(-999999);

        /**
         * An event data object to handle all the event tracking/dispatching
         *
         * @member {object}
         */
        this.eventData = new InteractionEvent();

        /**
         * Tiny little interactiveData pool !
         *
         * @member {PIXI.interaction.InteractionData[]}
         */
        this.interactiveDataPool = [];

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
        this.onMouseUp = this.onMouseUp.bind(this);
        this.processMouseUp = this.processMouseUp.bind(this);

        /**
         * @private
         * @member {Function}
         */
        this.onMouseDown = this.onMouseDown.bind(this);
        this.processMouseDown = this.processMouseDown.bind(this);

        /**
         * @private
         * @member {Function}
         */
        this.onMouseMove = this.onMouseMove.bind(this);
        this.processMouseMove = this.processMouseMove.bind(this);

        /**
         * @private
         * @member {Function}
         */
        this.onMouseOut = this.onMouseOut.bind(this);
        this.processMouseOverOut = this.processMouseOverOut.bind(this);

        /**
        * @private
        * @member {Function}
        */
        this.onMouseOver = this.onMouseOver.bind(this);

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
         * @private
         * @member {Function}
         */
        this.onTouchStart = this.onTouchStart.bind(this);
        this.processTouchStart = this.processTouchStart.bind(this);

        /**
         * @private
         * @member {Function}
         */
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.processTouchEnd = this.processTouchEnd.bind(this);

        /**
         * @private
         * @member {Function}
         */
        this.onTouchMove = this.onTouchMove.bind(this);
        this.processTouchMove = this.processTouchMove.bind(this);

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

        window.document.addEventListener('mousemove', this.onMouseMove, true);
        this.interactionDOMElement.addEventListener('mousedown', this.onMouseDown, true);
        this.interactionDOMElement.addEventListener('mouseout', this.onMouseOut, true);
        this.interactionDOMElement.addEventListener('mouseover', this.onMouseOver, true);
        window.addEventListener('mouseup', this.onMouseUp, true);

        if (this.supportsTouchEvents)
        {
            this.interactionDOMElement.addEventListener('touchstart', this.onTouchStart, true);
            this.interactionDOMElement.addEventListener('touchend', this.onTouchEnd, true);
            this.interactionDOMElement.addEventListener('touchmove', this.onTouchMove, true);
        }

        if (this.supportsPointerEvents)
        {
            window.document.addEventListener('pointermove', this.onPointerMove, true);
            this.interactionDOMElement.addEventListener('pointerdown', this.onPointerDown, true);
            this.interactionDOMElement.addEventListener('pointerout', this.onPointerOut, true);
            this.interactionDOMElement.addEventListener('pointerover', this.onPointerOver, true);
            window.addEventListener('pointerup', this.onPointerUp, true);
        }
        else
        {
            /**
             * If pointer events aren't available on a device, this will turn either the touch or
             * mouse events into pointer events. This allows a developer to just listen for emitted
             * pointer events on interactive sprites
             */
            if (this.normalizeTouchEvents)
            {
                this.interactionDOMElement.addEventListener('touchstart', this.onPointerDown, true);
                this.interactionDOMElement.addEventListener('touchend', this.onPointerUp, true);
                this.interactionDOMElement.addEventListener('touchmove', this.onPointerMove, true);
            }

            if (this.normalizeMouseEvents)
            {
                window.document.addEventListener('mousemove', this.onPointerMove, true);
                this.interactionDOMElement.addEventListener('mousedown', this.onPointerDown, true);
                this.interactionDOMElement.addEventListener('mouseout', this.onPointerOut, true);
                this.interactionDOMElement.addEventListener('mouseover', this.onPointerOver, true);
                window.addEventListener('mouseup', this.onPointerUp, true);
            }
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

        core.ticker.shared.remove(this.update);

        if (window.navigator.msPointerEnabled)
        {
            this.interactionDOMElement.style['-ms-content-zooming'] = '';
            this.interactionDOMElement.style['-ms-touch-action'] = '';
        }
        else if (this.supportsPointerEvents)
        {
            this.interactionDOMElement.style['touch-action'] = '';
        }

        window.document.removeEventListener('mousemove', this.onMouseMove, true);
        this.interactionDOMElement.removeEventListener('mousedown', this.onMouseDown, true);
        this.interactionDOMElement.removeEventListener('mouseout', this.onMouseOut, true);
        this.interactionDOMElement.removeEventListener('mouseover', this.onMouseOver, true);
        window.removeEventListener('mouseup', this.onMouseUp, true);

        if (this.supportsTouchEvents)
        {
            this.interactionDOMElement.removeEventListener('touchstart', this.onTouchStart, true);
            this.interactionDOMElement.removeEventListener('touchend', this.onTouchEnd, true);
            this.interactionDOMElement.removeEventListener('touchmove', this.onTouchMove, true);
        }

        if (this.supportsPointerEvents)
        {
            window.document.removeEventListener('pointermove', this.onPointerMove, true);
            this.interactionDOMElement.removeEventListener('pointerdown', this.onPointerDown, true);
            this.interactionDOMElement.removeEventListener('pointerout', this.onPointerOut, true);
            this.interactionDOMElement.removeEventListener('pointerover', this.onPointerOver, true);
            window.removeEventListener('pointerup', this.onPointerUp, true);
        }
        else
        {
            /**
             * If pointer events aren't available on a device, this will turn either the touch or
             * mouse events into pointer events. This allows a developer to just listen for emitted
             * pointer events on interactive sprites
             */
            if (this.normalizeTouchEvents)
            {
                this.interactionDOMElement.removeEventListener('touchstart', this.onPointerDown, true);
                this.interactionDOMElement.removeEventListener('touchend', this.onPointerUp, true);
                this.interactionDOMElement.removeEventListener('touchmove', this.onPointerMove, true);
            }

            if (this.normalizeMouseEvents)
            {
                window.document.removeEventListener('mousemove', this.onPointerMove, true);
                this.interactionDOMElement.removeEventListener('mousedown', this.onPointerDown, true);
                this.interactionDOMElement.removeEventListener('mouseout', this.onPointerOut, true);
                window.removeEventListener('mouseup', this.onPointerUp, true);
            }
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

        // if the user move the mouse this check has already been dfone using the mouse move!
        if (this.didMove)
        {
            this.didMove = false;

            return;
        }

        this.cursor = this.defaultCursorStyle;

        // Resets the flag as set by a stopPropagation call. This flag is usually reset by a user interaction of any kind,
        // but there was a scenario of a display object moving under a static mouse cursor.
        // In this case, mouseover and mouseevents would not pass the flag test in dispatchEvent function
        this.eventData._reset();

        this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, true);

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
     * @param {PIXI.Point} point - the point that is tested for collision
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - the displayObject
     *  that will be hit test (recurcsivly crawls its children)
     * @param {Function} [func] - the function that will be called on each interactive object. The
     *  displayObject and hit will be passed to the function
     * @param {boolean} [hitTest] - this indicates if the objects inside should be hit test against the point
     * @param {boolean} [interactive] - Whether the displayObject is interactive
     * @return {boolean} returns true if the displayObject hit the point
     */
    processInteractive(point, displayObject, func, hitTest, interactive)
    {
        if (!displayObject || !displayObject.visible)
        {
            return false;
        }

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
        // This will allow pixi to completly ignore and bypass checking the displayObjects children.
        if (displayObject.interactiveChildren)
        {
            const children = displayObject.children;

            for (let i = children.length - 1; i >= 0; i--)
            {
                const child = children[i];

                // time to get recursive.. if this function will return if somthing is hit..
                if (this.processInteractive(point, child, func, hitTest, interactiveParent))
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
                if (hit && !this.eventData.target)
                {
                    this.eventData.target = displayObject;
                    this.mouse.target = displayObject;
                    this.pointer.target = displayObject;
                }

                func(displayObject, hit);
            }
        }

        return hit;
    }

    /**
     * Is called when the mouse button is pressed down on the renderer element
     *
     * @private
     * @param {MouseEvent} event - The DOM event of a mouse button being pressed down
     */
    onMouseDown(event)
    {
        this.mouse.originalEvent = event;
        this.eventData.data = this.mouse;
        this.eventData._reset();

        // Update internal mouse reference
        this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);

        if (this.autoPreventDefault)
        {
            this.mouse.originalEvent.preventDefault();
        }

        this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseDown, true);

        const isRightButton = event.button === 2 || event.which === 3;

        this.emit(isRightButton ? 'rightdown' : 'mousedown', this.eventData);
    }

    /**
     * Processes the result of the mouse down check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    processMouseDown(displayObject, hit)
    {
        const e = this.mouse.originalEvent;

        const isRightButton = e.button === 2 || e.which === 3;

        if (hit)
        {
            displayObject[isRightButton ? '_isRightDown' : '_isLeftDown'] = true;
            this.dispatchEvent(displayObject, isRightButton ? 'rightdown' : 'mousedown', this.eventData);
        }
    }

    /**
     * Is called when the mouse button is released on the renderer element
     *
     * @private
     * @param {MouseEvent} event - The DOM event of a mouse button being released
     */
    onMouseUp(event)
    {
        this.mouse.originalEvent = event;
        this.eventData.data = this.mouse;
        this.eventData._reset();

        // Update internal mouse reference
        this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);

        this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseUp, true);

        const isRightButton = event.button === 2 || event.which === 3;

        this.emit(isRightButton ? 'rightup' : 'mouseup', this.eventData);
    }

    /**
     * Processes the result of the mouse up check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    processMouseUp(displayObject, hit)
    {
        const e = this.mouse.originalEvent;

        const isRightButton = e.button === 2 || e.which === 3;
        const isDown = isRightButton ? '_isRightDown' : '_isLeftDown';

        if (hit)
        {
            this.dispatchEvent(displayObject, isRightButton ? 'rightup' : 'mouseup', this.eventData);

            if (displayObject[isDown])
            {
                displayObject[isDown] = false;
                this.dispatchEvent(displayObject, isRightButton ? 'rightclick' : 'click', this.eventData);
            }
        }
        else if (displayObject[isDown])
        {
            displayObject[isDown] = false;
            this.dispatchEvent(displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', this.eventData);
        }
    }

    /**
     * Is called when the mouse moves across the renderer element
     *
     * @private
     * @param {MouseEvent} event - The DOM event of the mouse moving
     */
    onMouseMove(event)
    {
        this.mouse.originalEvent = event;
        this.eventData.data = this.mouse;
        this.eventData._reset();

        this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);

        this.didMove = true;

        this.cursor = this.defaultCursorStyle;

        this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseMove, true);

        this.emit('mousemove', this.eventData);

        if (this.currentCursorStyle !== this.cursor)
        {
            this.currentCursorStyle = this.cursor;
            this.interactionDOMElement.style.cursor = this.cursor;
        }

        // TODO BUG for parents ineractive object (border order issue)
    }

    /**
     * Processes the result of the mouse move check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    processMouseMove(displayObject, hit)
    {
        this.processMouseOverOut(displayObject, hit);

        // only display on mouse over
        if (!this.moveWhenInside || hit)
        {
            this.dispatchEvent(displayObject, 'mousemove', this.eventData);
        }
    }

    /**
     * Is called when the mouse is moved out of the renderer element
     *
     * @private
     * @param {MouseEvent} event - The DOM event of the mouse being moved out
     */
    onMouseOut(event)
    {
        this.mouseOverRenderer = false;

        this.mouse.originalEvent = event;
        this.eventData.data = this.mouse;
        this.eventData._reset();

        // Update internal mouse reference
        this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);

        this.interactionDOMElement.style.cursor = this.defaultCursorStyle;

        // TODO optimize by not check EVERY TIME! maybe half as often? //
        this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);

        this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, false);

        this.emit('mouseout', this.eventData);
    }

    /**
     * Processes the result of the mouse over/out check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    processMouseOverOut(displayObject, hit)
    {
        if (hit && this.mouseOverRenderer)
        {
            if (!displayObject._mouseOver)
            {
                displayObject._mouseOver = true;
                this.dispatchEvent(displayObject, 'mouseover', this.eventData);
            }

            if (displayObject.buttonMode)
            {
                this.cursor = displayObject.defaultCursor;
            }
        }
        else if (displayObject._mouseOver)
        {
            displayObject._mouseOver = false;
            this.dispatchEvent(displayObject, 'mouseout', this.eventData);
        }
    }

    /**
     * Is called when the mouse enters the renderer element area
     *
     * @private
     * @param {MouseEvent} event - The DOM event of the mouse moving into the renderer view
     */
    onMouseOver(event)
    {
        this.mouseOverRenderer = true;

        this.mouse.originalEvent = event;
        this.eventData.data = this.mouse;
        this.eventData._reset();

        this.emit('mouseover', this.eventData);
    }

    /**
     * Is called when the pointer button is pressed down on the renderer element
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer button being pressed down
     */
    onPointerDown(event)
    {
        this.normalizeToPointerData(event);
        this.pointer.originalEvent = event;
        this.eventData.data = this.pointer;
        this.eventData._reset();

        // Update internal pointer reference
        this.mapPositionToPoint(this.pointer.global, event.clientX, event.clientY);

        if (this.autoPreventDefault)
        {
            this.pointer.originalEvent.preventDefault();
        }

        this.processInteractive(this.pointer.global, this.renderer._lastObjectRendered, this.processPointerDown, true);

        this.emit('pointerdown', this.eventData);
    }

    /**
     * Processes the result of the pointer down check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    processPointerDown(displayObject, hit)
    {
        if (hit)
        {
            displayObject._pointerDown = true;
            this.dispatchEvent(displayObject, 'pointerdown', this.eventData);
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
        this.normalizeToPointerData(event);
        this.pointer.originalEvent = event;
        this.eventData.data = this.pointer;
        this.eventData._reset();

        // Update internal pointer reference
        this.mapPositionToPoint(this.pointer.global, event.clientX, event.clientY);

        this.processInteractive(this.pointer.global, this.renderer._lastObjectRendered, this.processPointerUp, true);

        this.emit('pointerup', this.eventData);
    }

    /**
     * Processes the result of the pointer up check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    processPointerUp(displayObject, hit)
    {
        if (hit)
        {
            this.dispatchEvent(displayObject, 'pointerup', this.eventData);

            if (displayObject._pointerDown)
            {
                displayObject._pointerDown = false;
                this.dispatchEvent(displayObject, 'pointertap', this.eventData);
            }
        }
        else if (displayObject._pointerDown)
        {
            displayObject._pointerDown = false;
            this.dispatchEvent(displayObject, 'pointerupoutside', this.eventData);
        }
    }

    /**
     * Is called when the pointer moves across the renderer element
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer moving
     */
    onPointerMove(event)
    {
        this.normalizeToPointerData(event);
        this.pointer.originalEvent = event;
        this.eventData.data = this.pointer;
        this.eventData._reset();

        this.mapPositionToPoint(this.pointer.global, event.clientX, event.clientY);

        this.processInteractive(this.pointer.global, this.renderer._lastObjectRendered, this.processPointerMove, true);

        this.emit('pointermove', this.eventData);
    }

    /**
     * Processes the result of the pointer move check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    processPointerMove(displayObject, hit)
    {
        if (!this.pointer.originalEvent.changedTouches)
        {
            this.processPointerOverOut(displayObject, hit);
        }

        if (!this.moveWhenInside || hit)
        {
            this.dispatchEvent(displayObject, 'pointermove', this.eventData);
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
        this.pointer.originalEvent = event;
        this.eventData.data = this.pointer;
        this.eventData._reset();

        // Update internal pointer reference
        this.mapPositionToPoint(this.pointer.global, event.clientX, event.clientY);

        this.processInteractive(this.pointer.global, this.renderer._lastObjectRendered, this.processPointerOverOut, false);

        this.emit('pointerout', this.eventData);
    }

    /**
     * Processes the result of the pointer over/out check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    processPointerOverOut(displayObject, hit)
    {
        if (hit && this.mouseOverRenderer)
        {
            if (!displayObject._pointerOver)
            {
                displayObject._pointerOver = true;
                this.dispatchEvent(displayObject, 'pointerover', this.eventData);
            }
        }
        else if (displayObject._pointerOver)
        {
            displayObject._pointerOver = false;
            this.dispatchEvent(displayObject, 'pointerout', this.eventData);
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
        this.pointer.originalEvent = event;
        this.eventData.data = this.pointer;
        this.eventData._reset();

        this.emit('pointerover', this.eventData);
    }

    /**
     * Is called when a touch is started on the renderer element
     *
     * @private
     * @param {TouchEvent} event - The DOM event of a touch starting on the renderer view
     */
    onTouchStart(event)
    {
        if (this.autoPreventDefault)
        {
            event.preventDefault();
        }

        const changedTouches = event.changedTouches;
        const cLength = changedTouches.length;

        for (let i = 0; i < cLength; i++)
        {
            const touch = changedTouches[i];
            const touchData = this.getTouchData(touch);

            touchData.originalEvent = event;

            this.eventData.data = touchData;
            this.eventData._reset();

            this.processInteractive(touchData.global, this.renderer._lastObjectRendered, this.processTouchStart, true);

            this.emit('touchstart', this.eventData);

            this.returnTouchData(touchData);
        }
    }

    /**
     * Processes the result of a touch check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    processTouchStart(displayObject, hit)
    {
        if (hit)
        {
            displayObject._touchDown = true;
            this.dispatchEvent(displayObject, 'touchstart', this.eventData);
        }
    }

    /**
     * Is called when a touch ends on the renderer element
     *
     * @private
     * @param {TouchEvent} event - The DOM event of a touch ending on the renderer view
     */
    onTouchEnd(event)
    {
        if (this.autoPreventDefault)
        {
            event.preventDefault();
        }

        const changedTouches = event.changedTouches;
        const cLength = changedTouches.length;

        for (let i = 0; i < cLength; i++)
        {
            const touchEvent = changedTouches[i];

            const touchData = this.getTouchData(touchEvent);

            touchData.originalEvent = event;

            // TODO this should be passed along.. no set
            this.eventData.data = touchData;
            this.eventData._reset();

            this.processInteractive(touchData.global, this.renderer._lastObjectRendered, this.processTouchEnd, true);

            this.emit('touchend', this.eventData);

            this.returnTouchData(touchData);
        }
    }

    /**
     * Processes the result of the end of a touch and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    processTouchEnd(displayObject, hit)
    {
        if (hit)
        {
            this.dispatchEvent(displayObject, 'touchend', this.eventData);

            if (displayObject._touchDown)
            {
                displayObject._touchDown = false;
                this.dispatchEvent(displayObject, 'tap', this.eventData);
            }
        }
        else if (displayObject._touchDown)
        {
            displayObject._touchDown = false;
            this.dispatchEvent(displayObject, 'touchendoutside', this.eventData);
        }
    }

    /**
     * Is called when a touch is moved across the renderer element
     *
     * @private
     * @param {TouchEvent} event - The DOM event of a touch moving accross the renderer view
     */
    onTouchMove(event)
    {
        if (this.autoPreventDefault)
        {
            event.preventDefault();
        }

        const changedTouches = event.changedTouches;
        const cLength = changedTouches.length;

        for (let i = 0; i < cLength; i++)
        {
            const touchEvent = changedTouches[i];

            const touchData = this.getTouchData(touchEvent);

            touchData.originalEvent = event;

            this.eventData.data = touchData;
            this.eventData._reset();

            this.processInteractive(
                touchData.global,
                this.renderer._lastObjectRendered,
                this.processTouchMove,
                this.moveWhenInside
            );

            this.emit('touchmove', this.eventData);

            this.returnTouchData(touchData);
        }
    }

    /**
     * Processes the result of a touch move check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    processTouchMove(displayObject, hit)
    {
        if (!this.moveWhenInside || hit)
        {
            this.dispatchEvent(displayObject, 'touchmove', this.eventData);
        }
    }

    /**
     * Grabs an interaction data object from the internal pool
     *
     * @private
     * @param {Touch} touch - The touch data we need to pair with an interactionData object
     * @return {PIXI.interaction.InteractionData} The built data object.
     */
    getTouchData(touch)
    {
        const touchData = this.interactiveDataPool.pop() || new InteractionData();

        touchData.identifier = touch.identifier;
        this.mapPositionToPoint(touchData.global, touch.clientX, touch.clientY);

        if (navigator.isCocoonJS)
        {
            touchData.global.x = touchData.global.x / this.resolution;
            touchData.global.y = touchData.global.y / this.resolution;
        }

        touch.globalX = touchData.global.x;
        touch.globalY = touchData.global.y;

        return touchData;
    }

    /**
     * Returns an interaction data object to the internal pool
     *
     * @private
     * @param {PIXI.interaction.InteractionData} touchData - The touch data object we want to return to the pool
     */
    returnTouchData(touchData)
    {
        this.interactiveDataPool.push(touchData);
    }

    /**
     * Ensures that the original event object contains all data that a regular pointer event would have
     *
     * @private
     * @param {TouchEvent|MouseEvent} event - The original event data from a touch or mouse event
     */
    normalizeToPointerData(event)
    {
        if (this.normalizeTouchEvents && event.changedTouches)
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
        else if (this.normalizeMouseEvents)
        {
            if (typeof event.isPrimary === 'undefined') event.isPrimary = true;
            if (typeof event.width === 'undefined') event.width = 1;
            if (typeof event.height === 'undefined') event.height = 1;
            if (typeof event.tiltX === 'undefined') event.tiltX = 0;
            if (typeof event.tiltY === 'undefined') event.tiltY = 0;
            if (typeof event.pointerType === 'undefined') event.pointerType = 'mouse';
            if (typeof event.pointerId === 'undefined') event.pointerId = 1;
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

        this.interactiveDataPool = null;

        this.interactionDOMElement = null;

        this.onMouseDown = null;
        this.processMouseDown = null;

        this.onMouseUp = null;
        this.processMouseUp = null;

        this.onMouseMove = null;
        this.processMouseMove = null;

        this.onMouseOut = null;
        this.processMouseOverOut = null;

        this.onMouseOver = null;

        this.onPointerDown = null;
        this.processPointerDown = null;

        this.onPointerUp = null;
        this.processPointerUp = null;

        this.onPointerMove = null;
        this.processPointerMove = null;

        this.onPointerOut = null;
        this.processPointerOverOut = null;

        this.onPointerOver = null;

        this.onTouchStart = null;
        this.processTouchStart = null;

        this.onTouchEnd = null;
        this.processTouchEnd = null;

        this.onTouchMove = null;
        this.processTouchMove = null;

        this._tempPoint = null;
    }
}

core.WebGLRenderer.registerPlugin('interaction', InteractionManager);
core.CanvasRenderer.registerPlugin('interaction', InteractionManager);
