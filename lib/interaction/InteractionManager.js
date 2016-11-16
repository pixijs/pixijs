'use strict';

exports.__esModule = true;

var _core = require('../core');

var core = _interopRequireWildcard(_core);

var _InteractionData = require('./InteractionData');

var _InteractionData2 = _interopRequireDefault(_InteractionData);

var _InteractionEvent = require('./InteractionEvent');

var _InteractionEvent2 = _interopRequireDefault(_InteractionEvent);

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _interactiveTarget = require('./interactiveTarget');

var _interactiveTarget2 = _interopRequireDefault(_interactiveTarget);

var _ismobilejs = require('ismobilejs');

var _ismobilejs2 = _interopRequireDefault(_ismobilejs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Mix interactiveTarget into core.DisplayObject.prototype
Object.assign(core.DisplayObject.prototype, _interactiveTarget2.default);

/**
 * The interaction manager deals with mouse and touch events. Any DisplayObject can be interactive
 * if its interactive parameter is set to true
 * This manager also supports multitouch.
 *
 * @class
 * @extends EventEmitter
 * @memberof PIXI.interaction
 */

var InteractionManager = function (_EventEmitter) {
    _inherits(InteractionManager, _EventEmitter);

    /**
     * @param {PIXI.CanvasRenderer|PIXI.WebGLRenderer} renderer - A reference to the current renderer
     * @param {object} [options] - The options for the manager.
     * @param {boolean} [options.autoPreventDefault=true] - Should the manager automatically prevent default browser actions.
     * @param {number} [options.interactionFrequency=10] - Frequency increases the interaction events will be checked.
     */
    function InteractionManager(renderer, options) {
        _classCallCheck(this, InteractionManager);

        var _this = _possibleConstructorReturn(this, _EventEmitter.call(this));

        options = options || {};

        /**
         * The renderer this interaction manager works for.
         *
         * @member {PIXI.SystemRenderer}
         */
        _this.renderer = renderer;

        /**
         * Should default browser actions automatically be prevented.
         * Does not apply to pointer events for backwards compatibility
         * preventDefault on pointer events stops mouse events from firing
         * Thus, for every pointer event, there will always be either a mouse of touch event alongside it.
         *
         * @member {boolean}
         * @default true
         */
        _this.autoPreventDefault = options.autoPreventDefault !== undefined ? options.autoPreventDefault : true;

        /**
         * As this frequency increases the interaction events will be checked more often.
         *
         * @member {number}
         * @default 10
         */
        _this.interactionFrequency = options.interactionFrequency || 10;

        /**
         * The mouse data
         *
         * @member {PIXI.interaction.InteractionData}
         */
        _this.mouse = new _InteractionData2.default();

        // setting the mouse to start off far off screen will mean that mouse over does
        //  not get called before we even move the mouse.
        _this.mouse.global.set(-999999);

        /**
         * The pointer data
         *
         * @member {PIXI.interaction.InteractionData}
         */
        _this.pointer = new _InteractionData2.default();

        // setting the pointer to start off far off screen will mean that pointer over does
        //  not get called before we even move the pointer.
        _this.pointer.global.set(-999999);

        /**
         * An event data object to handle all the event tracking/dispatching
         *
         * @member {object}
         */
        _this.eventData = new _InteractionEvent2.default();

        /**
         * Tiny little interactiveData pool !
         *
         * @member {PIXI.interaction.InteractionData[]}
         */
        _this.interactiveDataPool = [];

        /**
         * The DOM element to bind to.
         *
         * @private
         * @member {HTMLElement}
         */
        _this.interactionDOMElement = null;

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
        _this.moveWhenInside = false;

        /**
         * Have events been attached to the dom element?
         *
         * @private
         * @member {boolean}
         */
        _this.eventsAdded = false;

        /**
         * Is the mouse hovering over the renderer?
         *
         * @private
         * @member {boolean}
         */
        _this.mouseOverRenderer = false;

        /**
         * Does the device support touch events
         * https://www.w3.org/TR/touch-events/
         *
         * @readonly
         * @member {boolean}
         */
        _this.supportsTouchEvents = 'ontouchstart' in window;

        /**
         * Does the device support pointer events
         * https://www.w3.org/Submission/pointer-events/
         *
         * @readonly
         * @member {boolean}
         */
        _this.supportsPointerEvents = !!window.PointerEvent;

        /**
         * Are touch events being 'normalized' and converted into pointer events if pointer events are not supported
         * For example, on a touch screen mobile device, a touchstart would also be emitted as a pointerdown
         *
         * @private
         * @readonly
         * @member {boolean}
         */
        _this.normalizeTouchEvents = !_this.supportsPointerEvents && _this.supportsTouchEvents;

        /**
         * Are mouse events being 'normalized' and converted into pointer events if pointer events are not supported
         * For example, on a desktop pc, a mousedown would also be emitted as a pointerdown
         *
         * @private
         * @readonly
         * @member {boolean}
         */
        _this.normalizeMouseEvents = !_this.supportsPointerEvents && !_ismobilejs2.default.any;

        // this will make it so that you don't have to call bind all the time

        /**
         * @private
         * @member {Function}
         */
        _this.onMouseUp = _this.onMouseUp.bind(_this);
        _this.processMouseUp = _this.processMouseUp.bind(_this);

        /**
         * @private
         * @member {Function}
         */
        _this.onMouseDown = _this.onMouseDown.bind(_this);
        _this.processMouseDown = _this.processMouseDown.bind(_this);

        /**
         * @private
         * @member {Function}
         */
        _this.onMouseMove = _this.onMouseMove.bind(_this);
        _this.processMouseMove = _this.processMouseMove.bind(_this);

        /**
         * @private
         * @member {Function}
         */
        _this.onMouseOut = _this.onMouseOut.bind(_this);
        _this.processMouseOverOut = _this.processMouseOverOut.bind(_this);

        /**
        * @private
        * @member {Function}
        */
        _this.onMouseOver = _this.onMouseOver.bind(_this);

        /**
         * @private
         * @member {Function}
         */
        _this.onPointerUp = _this.onPointerUp.bind(_this);
        _this.processPointerUp = _this.processPointerUp.bind(_this);

        /**
         * @private
         * @member {Function}
         */
        _this.onPointerDown = _this.onPointerDown.bind(_this);
        _this.processPointerDown = _this.processPointerDown.bind(_this);

        /**
         * @private
         * @member {Function}
         */
        _this.onPointerMove = _this.onPointerMove.bind(_this);
        _this.processPointerMove = _this.processPointerMove.bind(_this);

        /**
         * @private
         * @member {Function}
         */
        _this.onPointerOut = _this.onPointerOut.bind(_this);
        _this.processPointerOverOut = _this.processPointerOverOut.bind(_this);

        /**
         * @private
         * @member {Function}
         */
        _this.onPointerOver = _this.onPointerOver.bind(_this);

        /**
         * @private
         * @member {Function}
         */
        _this.onTouchStart = _this.onTouchStart.bind(_this);
        _this.processTouchStart = _this.processTouchStart.bind(_this);

        /**
         * @private
         * @member {Function}
         */
        _this.onTouchEnd = _this.onTouchEnd.bind(_this);
        _this.processTouchEnd = _this.processTouchEnd.bind(_this);

        /**
         * @private
         * @member {Function}
         */
        _this.onTouchMove = _this.onTouchMove.bind(_this);
        _this.processTouchMove = _this.processTouchMove.bind(_this);

        /**
         * Every update cursor will be reset to this value, if some element wont override it in
         * its hitTest.
         *
         * @member {string}
         * @default 'inherit'
         */
        _this.defaultCursorStyle = 'inherit';

        /**
         * The css style of the cursor that is being used.
         *
         * @member {string}
         */
        _this.currentCursorStyle = 'inherit';

        /**
         * Internal cached let.
         *
         * @private
         * @member {PIXI.Point}
         */
        _this._tempPoint = new core.Point();

        /**
         * The current resolution / device pixel ratio.
         *
         * @member {number}
         * @default 1
         */
        _this.resolution = 1;

        _this.setTargetElement(_this.renderer.view, _this.renderer.resolution);

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
        return _this;
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


    InteractionManager.prototype.setTargetElement = function setTargetElement(element) {
        var resolution = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        this.removeEvents();

        this.interactionDOMElement = element;

        this.resolution = resolution;

        this.addEvents();
    };

    /**
     * Registers all the DOM events
     *
     * @private
     */


    InteractionManager.prototype.addEvents = function addEvents() {
        if (!this.interactionDOMElement) {
            return;
        }

        core.ticker.shared.add(this.update, this);

        if (window.navigator.msPointerEnabled) {
            this.interactionDOMElement.style['-ms-content-zooming'] = 'none';
            this.interactionDOMElement.style['-ms-touch-action'] = 'none';
        } else if (this.supportsPointerEvents) {
            this.interactionDOMElement.style['touch-action'] = 'none';
        }

        /**
         * These events are added first, so that if pointer events are normalised, they are fired
         * in the same order as non-normalised events. ie. pointer event 1st, mouse / touch 2nd
         */
        if (this.supportsPointerEvents) {
            window.document.addEventListener('pointermove', this.onPointerMove, true);
            this.interactionDOMElement.addEventListener('pointerdown', this.onPointerDown, true);
            this.interactionDOMElement.addEventListener('pointerout', this.onPointerOut, true);
            this.interactionDOMElement.addEventListener('pointerover', this.onPointerOver, true);
            window.addEventListener('pointerup', this.onPointerUp, true);
        } else {
            /**
             * If pointer events aren't available on a device, this will turn either the touch or
             * mouse events into pointer events. This allows a developer to just listen for emitted
             * pointer events on interactive sprites
             */
            if (this.normalizeTouchEvents) {
                this.interactionDOMElement.addEventListener('touchstart', this.onPointerDown, true);
                this.interactionDOMElement.addEventListener('touchend', this.onPointerUp, true);
                this.interactionDOMElement.addEventListener('touchmove', this.onPointerMove, true);
            }

            if (this.normalizeMouseEvents) {
                window.document.addEventListener('mousemove', this.onPointerMove, true);
                this.interactionDOMElement.addEventListener('mousedown', this.onPointerDown, true);
                this.interactionDOMElement.addEventListener('mouseout', this.onPointerOut, true);
                this.interactionDOMElement.addEventListener('mouseover', this.onPointerOver, true);
                window.addEventListener('mouseup', this.onPointerUp, true);
            }
        }

        window.document.addEventListener('mousemove', this.onMouseMove, true);
        this.interactionDOMElement.addEventListener('mousedown', this.onMouseDown, true);
        this.interactionDOMElement.addEventListener('mouseout', this.onMouseOut, true);
        this.interactionDOMElement.addEventListener('mouseover', this.onMouseOver, true);
        window.addEventListener('mouseup', this.onMouseUp, true);

        if (this.supportsTouchEvents) {
            this.interactionDOMElement.addEventListener('touchstart', this.onTouchStart, true);
            this.interactionDOMElement.addEventListener('touchend', this.onTouchEnd, true);
            this.interactionDOMElement.addEventListener('touchmove', this.onTouchMove, true);
        }

        this.eventsAdded = true;
    };

    /**
     * Removes all the DOM events that were previously registered
     *
     * @private
     */


    InteractionManager.prototype.removeEvents = function removeEvents() {
        if (!this.interactionDOMElement) {
            return;
        }

        core.ticker.shared.remove(this.update, this);

        if (window.navigator.msPointerEnabled) {
            this.interactionDOMElement.style['-ms-content-zooming'] = '';
            this.interactionDOMElement.style['-ms-touch-action'] = '';
        } else if (this.supportsPointerEvents) {
            this.interactionDOMElement.style['touch-action'] = '';
        }

        if (this.supportsPointerEvents) {
            window.document.removeEventListener('pointermove', this.onPointerMove, true);
            this.interactionDOMElement.removeEventListener('pointerdown', this.onPointerDown, true);
            this.interactionDOMElement.removeEventListener('pointerout', this.onPointerOut, true);
            this.interactionDOMElement.removeEventListener('pointerover', this.onPointerOver, true);
            window.removeEventListener('pointerup', this.onPointerUp, true);
        } else {
            /**
             * If pointer events aren't available on a device, this will turn either the touch or
             * mouse events into pointer events. This allows a developer to just listen for emitted
             * pointer events on interactive sprites
             */
            if (this.normalizeTouchEvents) {
                this.interactionDOMElement.removeEventListener('touchstart', this.onPointerDown, true);
                this.interactionDOMElement.removeEventListener('touchend', this.onPointerUp, true);
                this.interactionDOMElement.removeEventListener('touchmove', this.onPointerMove, true);
            }

            if (this.normalizeMouseEvents) {
                window.document.removeEventListener('mousemove', this.onPointerMove, true);
                this.interactionDOMElement.removeEventListener('mousedown', this.onPointerDown, true);
                this.interactionDOMElement.removeEventListener('mouseout', this.onPointerOut, true);
                this.interactionDOMElement.removeEventListener('mouseover', this.onPointerOver, true);
                window.removeEventListener('mouseup', this.onPointerUp, true);
            }
        }

        window.document.removeEventListener('mousemove', this.onMouseMove, true);
        this.interactionDOMElement.removeEventListener('mousedown', this.onMouseDown, true);
        this.interactionDOMElement.removeEventListener('mouseout', this.onMouseOut, true);
        this.interactionDOMElement.removeEventListener('mouseover', this.onMouseOver, true);
        window.removeEventListener('mouseup', this.onMouseUp, true);

        if (this.supportsTouchEvents) {
            this.interactionDOMElement.removeEventListener('touchstart', this.onTouchStart, true);
            this.interactionDOMElement.removeEventListener('touchend', this.onTouchEnd, true);
            this.interactionDOMElement.removeEventListener('touchmove', this.onTouchMove, true);
        }

        this.interactionDOMElement = null;

        this.eventsAdded = false;
    };

    /**
     * Updates the state of interactive objects.
     * Invoked by a throttled ticker update from {@link PIXI.ticker.shared}.
     *
     * @param {number} deltaTime - time delta since last tick
     */


    InteractionManager.prototype.update = function update(deltaTime) {
        this._deltaTime += deltaTime;

        if (this._deltaTime < this.interactionFrequency) {
            return;
        }

        this._deltaTime = 0;

        if (!this.interactionDOMElement) {
            return;
        }

        // if the user move the mouse this check has already been dfone using the mouse move!
        if (this.didMove) {
            this.didMove = false;

            return;
        }

        this.cursor = this.defaultCursorStyle;

        // Resets the flag as set by a stopPropagation call. This flag is usually reset by a user interaction of any kind,
        // but there was a scenario of a display object moving under a static mouse cursor.
        // In this case, mouseover and mouseevents would not pass the flag test in dispatchEvent function
        this.eventData._reset();

        this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, true);

        if (this.currentCursorStyle !== this.cursor) {
            this.currentCursorStyle = this.cursor;
            this.interactionDOMElement.style.cursor = this.cursor;
        }

        // TODO
    };

    /**
     * Dispatches an event on the display object that was interacted with
     *
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - the display object in question
     * @param {string} eventString - the name of the event (e.g, mousedown)
     * @param {object} eventData - the event data object
     * @private
     */


    InteractionManager.prototype.dispatchEvent = function dispatchEvent(displayObject, eventString, eventData) {
        if (!eventData.stopped) {
            eventData.currentTarget = displayObject;
            eventData.type = eventString;

            displayObject.emit(eventString, eventData);

            if (displayObject[eventString]) {
                displayObject[eventString](eventData);
            }
        }
    };

    /**
     * Maps x and y coords from a DOM object and maps them correctly to the pixi view. The
     * resulting value is stored in the point. This takes into account the fact that the DOM
     * element could be scaled and positioned anywhere on the screen.
     *
     * @param  {PIXI.Point} point - the point that the result will be stored in
     * @param  {number} x - the x coord of the position to map
     * @param  {number} y - the y coord of the position to map
     */


    InteractionManager.prototype.mapPositionToPoint = function mapPositionToPoint(point, x, y) {
        var rect = void 0;

        // IE 11 fix
        if (!this.interactionDOMElement.parentElement) {
            rect = { x: 0, y: 0, width: 0, height: 0 };
        } else {
            rect = this.interactionDOMElement.getBoundingClientRect();
        }

        point.x = (x - rect.left) * (this.interactionDOMElement.width / rect.width) / this.resolution;
        point.y = (y - rect.top) * (this.interactionDOMElement.height / rect.height) / this.resolution;
    };

    /**
     * This function is provides a neat way of crawling through the scene graph and running a
     * specified function on all interactive objects it finds. It will also take care of hit
     * testing the interactive objects and passes the hit across in the function.
     *
     * @param {PIXI.Point} point - the point that is tested for collision
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - the displayObject
     *  that will be hit test (recursively crawls its children)
     * @param {Function} [func] - the function that will be called on each interactive object. The
     *  displayObject and hit will be passed to the function
     * @param {boolean} [hitTest] - this indicates if the objects inside should be hit test against the point
     * @param {boolean} [interactive] - Whether the displayObject is interactive
     * @return {boolean} returns true if the displayObject hit the point
     */


    InteractionManager.prototype.processInteractive = function processInteractive(point, displayObject, func, hitTest, interactive) {
        if (!displayObject || !displayObject.visible) {
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

        var hit = false;
        var interactiveParent = interactive;

        // if the displayobject has a hitArea, then it does not need to hitTest children.
        if (displayObject.hitArea) {
            interactiveParent = false;
        }

        // it has a mask! Then lets hit test that before continuing..
        if (hitTest && displayObject._mask) {
            if (!displayObject._mask.containsPoint(point)) {
                hitTest = false;
            }
        }

        // it has a filterArea! Same as mask but easier, its a rectangle
        if (hitTest && displayObject.filterArea) {
            if (!displayObject.filterArea.contains(point.x, point.y)) {
                hitTest = false;
            }
        }

        // ** FREE TIP **! If an object is not interactive or has no buttons in it
        // (such as a game scene!) set interactiveChildren to false for that displayObject.
        // This will allow pixi to completely ignore and bypass checking the displayObjects children.
        if (displayObject.interactiveChildren && displayObject.children) {
            var children = displayObject.children;

            for (var i = children.length - 1; i >= 0; i--) {
                var child = children[i];

                // time to get recursive.. if this function will return if something is hit..
                if (this.processInteractive(point, child, func, hitTest, interactiveParent)) {
                    // its a good idea to check if a child has lost its parent.
                    // this means it has been removed whilst looping so its best
                    if (!child.parent) {
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
        if (interactive) {
            // if we are hit testing (as in we have no hit any objects yet)
            // We also don't need to worry about hit testing if once of the displayObjects children
            // has already been hit!
            if (hitTest && !hit) {
                if (displayObject.hitArea) {
                    displayObject.worldTransform.applyInverse(point, this._tempPoint);
                    hit = displayObject.hitArea.contains(this._tempPoint.x, this._tempPoint.y);
                } else if (displayObject.containsPoint) {
                    hit = displayObject.containsPoint(point);
                }
            }

            if (displayObject.interactive) {
                if (hit && !this.eventData.target) {
                    this.eventData.target = displayObject;
                    this.mouse.target = displayObject;
                    this.pointer.target = displayObject;
                }

                func(displayObject, hit);
            }
        }

        return hit;
    };

    /**
     * Is called when the mouse button is pressed down on the renderer element
     *
     * @private
     * @param {MouseEvent} event - The DOM event of a mouse button being pressed down
     */


    InteractionManager.prototype.onMouseDown = function onMouseDown(event) {
        this.mouse.originalEvent = event;
        this.eventData.data = this.mouse;
        this.eventData._reset();

        // Update internal mouse reference
        this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);

        if (this.autoPreventDefault) {
            this.mouse.originalEvent.preventDefault();
        }

        this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseDown, true);

        var isRightButton = event.button === 2 || event.which === 3;

        this.emit(isRightButton ? 'rightdown' : 'mousedown', this.eventData);
    };

    /**
     * Processes the result of the mouse down check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */


    InteractionManager.prototype.processMouseDown = function processMouseDown(displayObject, hit) {
        var e = this.mouse.originalEvent;

        var isRightButton = e.button === 2 || e.which === 3;

        if (hit) {
            displayObject[isRightButton ? '_isRightDown' : '_isLeftDown'] = true;
            this.dispatchEvent(displayObject, isRightButton ? 'rightdown' : 'mousedown', this.eventData);
        }
    };

    /**
     * Is called when the mouse button is released on the renderer element
     *
     * @private
     * @param {MouseEvent} event - The DOM event of a mouse button being released
     */


    InteractionManager.prototype.onMouseUp = function onMouseUp(event) {
        this.mouse.originalEvent = event;
        this.eventData.data = this.mouse;
        this.eventData._reset();

        // Update internal mouse reference
        this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);

        this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseUp, true);

        var isRightButton = event.button === 2 || event.which === 3;

        this.emit(isRightButton ? 'rightup' : 'mouseup', this.eventData);
    };

    /**
     * Processes the result of the mouse up check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */


    InteractionManager.prototype.processMouseUp = function processMouseUp(displayObject, hit) {
        var e = this.mouse.originalEvent;

        var isRightButton = e.button === 2 || e.which === 3;
        var isDown = isRightButton ? '_isRightDown' : '_isLeftDown';

        if (hit) {
            this.dispatchEvent(displayObject, isRightButton ? 'rightup' : 'mouseup', this.eventData);

            if (displayObject[isDown]) {
                displayObject[isDown] = false;
                this.dispatchEvent(displayObject, isRightButton ? 'rightclick' : 'click', this.eventData);
            }
        } else if (displayObject[isDown]) {
            displayObject[isDown] = false;
            this.dispatchEvent(displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', this.eventData);
        }
    };

    /**
     * Is called when the mouse moves across the renderer element
     *
     * @private
     * @param {MouseEvent} event - The DOM event of the mouse moving
     */


    InteractionManager.prototype.onMouseMove = function onMouseMove(event) {
        this.mouse.originalEvent = event;
        this.eventData.data = this.mouse;
        this.eventData._reset();

        this.mapPositionToPoint(this.mouse.global, event.clientX, event.clientY);

        this.didMove = true;

        this.cursor = this.defaultCursorStyle;

        this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseMove, true);

        this.emit('mousemove', this.eventData);

        if (this.currentCursorStyle !== this.cursor) {
            this.currentCursorStyle = this.cursor;
            this.interactionDOMElement.style.cursor = this.cursor;
        }

        // TODO BUG for parents interactive object (border order issue)
    };

    /**
     * Processes the result of the mouse move check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */


    InteractionManager.prototype.processMouseMove = function processMouseMove(displayObject, hit) {
        this.processMouseOverOut(displayObject, hit);

        // only display on mouse over
        if (!this.moveWhenInside || hit) {
            this.dispatchEvent(displayObject, 'mousemove', this.eventData);
        }
    };

    /**
     * Is called when the mouse is moved out of the renderer element
     *
     * @private
     * @param {MouseEvent} event - The DOM event of the mouse being moved out
     */


    InteractionManager.prototype.onMouseOut = function onMouseOut(event) {
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
    };

    /**
     * Processes the result of the mouse over/out check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */


    InteractionManager.prototype.processMouseOverOut = function processMouseOverOut(displayObject, hit) {
        if (hit && this.mouseOverRenderer) {
            if (!displayObject._mouseOver) {
                displayObject._mouseOver = true;
                this.dispatchEvent(displayObject, 'mouseover', this.eventData);
            }

            if (displayObject.buttonMode) {
                this.cursor = displayObject.defaultCursor;
            }
        } else if (displayObject._mouseOver) {
            displayObject._mouseOver = false;
            this.dispatchEvent(displayObject, 'mouseout', this.eventData);
        }
    };

    /**
     * Is called when the mouse enters the renderer element area
     *
     * @private
     * @param {MouseEvent} event - The DOM event of the mouse moving into the renderer view
     */


    InteractionManager.prototype.onMouseOver = function onMouseOver(event) {
        this.mouseOverRenderer = true;

        this.mouse.originalEvent = event;
        this.eventData.data = this.mouse;
        this.eventData._reset();

        this.emit('mouseover', this.eventData);
    };

    /**
     * Is called when the pointer button is pressed down on the renderer element
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer button being pressed down
     */


    InteractionManager.prototype.onPointerDown = function onPointerDown(event) {
        this.normalizeToPointerData(event);
        this.pointer.originalEvent = event;
        this.eventData.data = this.pointer;
        this.eventData._reset();

        // Update internal pointer reference
        this.mapPositionToPoint(this.pointer.global, event.clientX, event.clientY);

        /**
         * No need to prevent default on natural pointer events, as there are no side effects
         * Normalized events, however, may have the double mousedown/touchstart issue on the native android browser,
         * so still need to be prevented.
         */
        if (this.autoPreventDefault && (this.normalizeMouseEvents || this.normalizeTouchEvents)) {
            this.pointer.originalEvent.preventDefault();
        }

        this.processInteractive(this.pointer.global, this.renderer._lastObjectRendered, this.processPointerDown, true);

        this.emit('pointerdown', this.eventData);
    };

    /**
     * Processes the result of the pointer down check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */


    InteractionManager.prototype.processPointerDown = function processPointerDown(displayObject, hit) {
        if (hit) {
            displayObject._pointerDown = true;
            this.dispatchEvent(displayObject, 'pointerdown', this.eventData);
        }
    };

    /**
     * Is called when the pointer button is released on the renderer element
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer button being released
     */


    InteractionManager.prototype.onPointerUp = function onPointerUp(event) {
        this.normalizeToPointerData(event);
        this.pointer.originalEvent = event;
        this.eventData.data = this.pointer;
        this.eventData._reset();

        // Update internal pointer reference
        this.mapPositionToPoint(this.pointer.global, event.clientX, event.clientY);

        this.processInteractive(this.pointer.global, this.renderer._lastObjectRendered, this.processPointerUp, true);

        this.emit('pointerup', this.eventData);
    };

    /**
     * Processes the result of the pointer up check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */


    InteractionManager.prototype.processPointerUp = function processPointerUp(displayObject, hit) {
        if (hit) {
            this.dispatchEvent(displayObject, 'pointerup', this.eventData);

            if (displayObject._pointerDown) {
                displayObject._pointerDown = false;
                this.dispatchEvent(displayObject, 'pointertap', this.eventData);
            }
        } else if (displayObject._pointerDown) {
            displayObject._pointerDown = false;
            this.dispatchEvent(displayObject, 'pointerupoutside', this.eventData);
        }
    };

    /**
     * Is called when the pointer moves across the renderer element
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer moving
     */


    InteractionManager.prototype.onPointerMove = function onPointerMove(event) {
        this.normalizeToPointerData(event);
        this.pointer.originalEvent = event;
        this.eventData.data = this.pointer;
        this.eventData._reset();

        this.mapPositionToPoint(this.pointer.global, event.clientX, event.clientY);

        this.processInteractive(this.pointer.global, this.renderer._lastObjectRendered, this.processPointerMove, true);

        this.emit('pointermove', this.eventData);
    };

    /**
     * Processes the result of the pointer move check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */


    InteractionManager.prototype.processPointerMove = function processPointerMove(displayObject, hit) {
        if (!this.pointer.originalEvent.changedTouches) {
            this.processPointerOverOut(displayObject, hit);
        }

        if (!this.moveWhenInside || hit) {
            this.dispatchEvent(displayObject, 'pointermove', this.eventData);
        }
    };

    /**
     * Is called when the pointer is moved out of the renderer element
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer being moved out
     */


    InteractionManager.prototype.onPointerOut = function onPointerOut(event) {
        this.normalizeToPointerData(event);
        this.pointer.originalEvent = event;
        this.eventData.data = this.pointer;
        this.eventData._reset();

        // Update internal pointer reference
        this.mapPositionToPoint(this.pointer.global, event.clientX, event.clientY);

        this.processInteractive(this.pointer.global, this.renderer._lastObjectRendered, this.processPointerOverOut, false);

        this.emit('pointerout', this.eventData);
    };

    /**
     * Processes the result of the pointer over/out check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */


    InteractionManager.prototype.processPointerOverOut = function processPointerOverOut(displayObject, hit) {
        if (hit && this.mouseOverRenderer) {
            if (!displayObject._pointerOver) {
                displayObject._pointerOver = true;
                this.dispatchEvent(displayObject, 'pointerover', this.eventData);
            }
        } else if (displayObject._pointerOver) {
            displayObject._pointerOver = false;
            this.dispatchEvent(displayObject, 'pointerout', this.eventData);
        }
    };

    /**
     * Is called when the pointer is moved into the renderer element
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer button being moved into the renderer view
     */


    InteractionManager.prototype.onPointerOver = function onPointerOver(event) {
        this.pointer.originalEvent = event;
        this.eventData.data = this.pointer;
        this.eventData._reset();

        this.emit('pointerover', this.eventData);
    };

    /**
     * Is called when a touch is started on the renderer element
     *
     * @private
     * @param {TouchEvent} event - The DOM event of a touch starting on the renderer view
     */


    InteractionManager.prototype.onTouchStart = function onTouchStart(event) {
        if (this.autoPreventDefault) {
            event.preventDefault();
        }

        var changedTouches = event.changedTouches;
        var cLength = changedTouches.length;

        for (var i = 0; i < cLength; i++) {
            var touch = changedTouches[i];
            var touchData = this.getTouchData(touch);

            touchData.originalEvent = event;

            this.eventData.data = touchData;
            this.eventData._reset();

            this.processInteractive(touchData.global, this.renderer._lastObjectRendered, this.processTouchStart, true);

            this.emit('touchstart', this.eventData);

            this.returnTouchData(touchData);
        }
    };

    /**
     * Processes the result of a touch check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */


    InteractionManager.prototype.processTouchStart = function processTouchStart(displayObject, hit) {
        if (hit) {
            displayObject._touchDown = true;
            this.dispatchEvent(displayObject, 'touchstart', this.eventData);
        }
    };

    /**
     * Is called when a touch ends on the renderer element
     *
     * @private
     * @param {TouchEvent} event - The DOM event of a touch ending on the renderer view
     */


    InteractionManager.prototype.onTouchEnd = function onTouchEnd(event) {
        if (this.autoPreventDefault) {
            event.preventDefault();
        }

        var changedTouches = event.changedTouches;
        var cLength = changedTouches.length;

        for (var i = 0; i < cLength; i++) {
            var touchEvent = changedTouches[i];

            var touchData = this.getTouchData(touchEvent);

            touchData.originalEvent = event;

            // TODO this should be passed along.. no set
            this.eventData.data = touchData;
            this.eventData._reset();

            this.processInteractive(touchData.global, this.renderer._lastObjectRendered, this.processTouchEnd, true);

            this.emit('touchend', this.eventData);

            this.returnTouchData(touchData);
        }
    };

    /**
     * Processes the result of the end of a touch and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */


    InteractionManager.prototype.processTouchEnd = function processTouchEnd(displayObject, hit) {
        if (hit) {
            this.dispatchEvent(displayObject, 'touchend', this.eventData);

            if (displayObject._touchDown) {
                displayObject._touchDown = false;
                this.dispatchEvent(displayObject, 'tap', this.eventData);
            }
        } else if (displayObject._touchDown) {
            displayObject._touchDown = false;
            this.dispatchEvent(displayObject, 'touchendoutside', this.eventData);
        }
    };

    /**
     * Is called when a touch is moved across the renderer element
     *
     * @private
     * @param {TouchEvent} event - The DOM event of a touch moving accross the renderer view
     */


    InteractionManager.prototype.onTouchMove = function onTouchMove(event) {
        if (this.autoPreventDefault) {
            event.preventDefault();
        }

        var changedTouches = event.changedTouches;
        var cLength = changedTouches.length;

        for (var i = 0; i < cLength; i++) {
            var touchEvent = changedTouches[i];

            var touchData = this.getTouchData(touchEvent);

            touchData.originalEvent = event;

            this.eventData.data = touchData;
            this.eventData._reset();

            this.processInteractive(touchData.global, this.renderer._lastObjectRendered, this.processTouchMove, this.moveWhenInside);

            this.emit('touchmove', this.eventData);

            this.returnTouchData(touchData);
        }
    };

    /**
     * Processes the result of a touch move check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */


    InteractionManager.prototype.processTouchMove = function processTouchMove(displayObject, hit) {
        if (!this.moveWhenInside || hit) {
            this.dispatchEvent(displayObject, 'touchmove', this.eventData);
        }
    };

    /**
     * Grabs an interaction data object from the internal pool
     *
     * @private
     * @param {Touch} touch - The touch data we need to pair with an interactionData object
     * @return {PIXI.interaction.InteractionData} The built data object.
     */


    InteractionManager.prototype.getTouchData = function getTouchData(touch) {
        var touchData = this.interactiveDataPool.pop() || new _InteractionData2.default();

        touchData.identifier = touch.identifier;
        this.mapPositionToPoint(touchData.global, touch.clientX, touch.clientY);

        if (navigator.isCocoonJS) {
            touchData.global.x = touchData.global.x / this.resolution;
            touchData.global.y = touchData.global.y / this.resolution;
        }

        touch.globalX = touchData.global.x;
        touch.globalY = touchData.global.y;

        return touchData;
    };

    /**
     * Returns an interaction data object to the internal pool
     *
     * @private
     * @param {PIXI.interaction.InteractionData} touchData - The touch data object we want to return to the pool
     */


    InteractionManager.prototype.returnTouchData = function returnTouchData(touchData) {
        this.interactiveDataPool.push(touchData);
    };

    /**
     * Ensures that the original event object contains all data that a regular pointer event would have
     *
     * @private
     * @param {TouchEvent|MouseEvent} event - The original event data from a touch or mouse event
     */


    InteractionManager.prototype.normalizeToPointerData = function normalizeToPointerData(event) {
        if (this.normalizeTouchEvents && event.changedTouches) {
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
        } else if (this.normalizeMouseEvents) {
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
    };

    /**
     * Destroys the interaction manager
     *
     */


    InteractionManager.prototype.destroy = function destroy() {
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
    };

    return InteractionManager;
}(_eventemitter2.default);

exports.default = InteractionManager;


core.WebGLRenderer.registerPlugin('interaction', InteractionManager);
core.CanvasRenderer.registerPlugin('interaction', InteractionManager);
//# sourceMappingURL=InteractionManager.js.map