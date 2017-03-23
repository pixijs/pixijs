'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _core = require('../core');

var core = _interopRequireWildcard(_core);

var _InteractionData = require('./InteractionData');

var _InteractionData2 = _interopRequireDefault(_InteractionData);

var _InteractionEvent = require('./InteractionEvent');

var _InteractionEvent2 = _interopRequireDefault(_InteractionEvent);

var _InteractionTrackingData = require('./InteractionTrackingData');

var _InteractionTrackingData2 = _interopRequireDefault(_InteractionTrackingData);

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _interactiveTarget = require('./interactiveTarget');

var _interactiveTarget2 = _interopRequireDefault(_interactiveTarget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Mix interactiveTarget into core.DisplayObject.prototype, after deprecation has been handled
core.utils.mixins.delayMixin(core.DisplayObject.prototype, _interactiveTarget2.default);

var MOUSE_POINTER_ID = 'MOUSE';

// private constants for use in processInteractive - tracks whether we hit anything at all, or an
// actual interactive child, so that we can keep that state going back up the display tree
var HIT_NONE = 0;
var HIT_ANY = 1;
var HIT_INTERACTIVE = 2;

/**
 * The interaction manager deals with mouse, touch and pointer events. Any DisplayObject can be interactive
 * if its interactive parameter is set to true
 * This manager also supports multitouch.
 *
 * An instance of this class is automatically created by default, and can be found at renderer.plugins.interaction
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
         * Frequency in milliseconds that the mousemove, moveover & mouseout interaction events will be checked.
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
        _this.mouse.identifier = MOUSE_POINTER_ID;

        // setting the mouse to start off far off screen will mean that mouse over does
        //  not get called before we even move the mouse.
        _this.mouse.global.set(-999999);

        /**
         * Actively tracked InteractionData
         *
         * @private
         * @member {Object.<number,PIXI.interation.InteractionData>}
         */
        _this.activeInteractionData = {};
        _this.activeInteractionData[MOUSE_POINTER_ID] = _this.mouse;

        /**
         * Pool of unused InteractionData
         *
         * @private
         * @member {PIXI.interation.InteractionData[]}
         */
        _this.interactionDataPool = [];

        /**
         * An event data object to handle all the event tracking/dispatching
         *
         * @member {object}
         */
        _this.eventData = new _InteractionEvent2.default();

        /**
         * The DOM element to bind to.
         *
         * @private
         * @member {HTMLElement}
         */
        _this.interactionDOMElement = null;

        /**
         * This property determines if mousemove and touchmove events are fired only when the cursor
         * is over the object.
         * Setting to true will make things work more in line with how the DOM verison works.
         * Setting to false can make things easier for things like dragging
         * It is currently set to false as this is how pixi used to work. This will be set to true in
         * future versions of pixi.
         *
         * @member {boolean}
         * @default false
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

        // this will make it so that you don't have to call bind all the time

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
        _this.onPointerCancel = _this.onPointerCancel.bind(_this);
        _this.processPointerCancel = _this.processPointerCancel.bind(_this);

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
         * Dictionary of how different cursor modes are handled. Strings are handled as CSS cursor
         * values, objects are handled as dictionaries of CSS values for interactionDOMElement,
         * and functions are called instead of changing the CSS.
         * Default CSS cursor values are provided for 'default' and 'pointer' modes.
         * @member {Object.<string, (string|Function|Object.<string, string>)>}
         */
        _this.cursorStyles = {
            default: 'inherit',
            pointer: 'pointer'
        };

        /**
         * The mode of the cursor that is being used.
         * The value of this is a key from the cursorStyles dictionary.
         *
         * @member {string}
         */
        _this.currentCursorMode = null;

        /**
         * Internal cached let.
         *
         * @private
         * @member {string}
         */
        _this.cursor = null;

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
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * on the display object.
         *
         * @event rightdown
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device button (usually a mouse button) is released over the display
         * object.
         *
         * @event mouseup
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * over the display object.
         *
         * @event rightup
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device button (usually a mouse button) is pressed and released on
         * the display object.
         *
         * @event click
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * and released on the display object.
         *
         * @event rightclick
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device button (usually a mouse button) is released outside the
         * display object that initially registered a
         * [mousedown]{@link PIXI.interaction.InteractionManager#event:mousedown}.
         *
         * @event mouseupoutside
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * outside the display object that initially registered a
         * [rightdown]{@link PIXI.interaction.InteractionManager#event:rightdown}.
         *
         * @event rightupoutside
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device (usually a mouse) is moved while over the display object
         *
         * @event mousemove
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device (usually a mouse) is moved onto the display object
         *
         * @event mouseover
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device (usually a mouse) is moved off the display object
         *
         * @event mouseout
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device button is pressed on the display object.
         *
         * @event pointerdown
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device button is released over the display object.
         *
         * @event pointerup
         * @type {PIXI.interaction.InteractionData}
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
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device button is released outside the display object that initially
         * registered a [pointerdown]{@link PIXI.interaction.InteractionManager#event:pointerdown}.
         *
         * @event pointerupoutside
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device is moved while over the display object
         *
         * @event pointermove
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device is moved onto the display object
         *
         * @event pointerover
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a pointer device is moved off the display object
         *
         * @event pointerout
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a touch point is placed on the display object.
         *
         * @event touchstart
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a touch point is removed from the display object.
         *
         * @event touchend
         * @type {PIXI.interaction.InteractionData}
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
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a touch point is removed outside of the display object that initially
         * registered a [touchstart]{@link PIXI.interaction.InteractionManager#event:touchstart}.
         *
         * @event touchendoutside
         * @type {PIXI.interaction.InteractionData}
         * @memberof PIXI.interaction.InteractionManager#
         */

        /**
         * Fired when a touch point is moved along the display object.
         *
         * @event touchmove
         * @type {PIXI.interaction.InteractionData}
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
            // pointerout is fired in addition to pointerup (for touch events) and pointercancel
            // we already handle those, so for the purposes of what we do in onPointerOut, we only
            // care about the pointerleave event
            this.interactionDOMElement.addEventListener('pointerleave', this.onPointerOut, true);
            this.interactionDOMElement.addEventListener('pointerover', this.onPointerOver, true);
            window.addEventListener('pointercancel', this.onPointerCancel, true);
            window.addEventListener('pointerup', this.onPointerUp, true);
        } else {
            window.document.addEventListener('mousemove', this.onPointerMove, true);
            this.interactionDOMElement.addEventListener('mousedown', this.onPointerDown, true);
            this.interactionDOMElement.addEventListener('mouseout', this.onPointerOut, true);
            this.interactionDOMElement.addEventListener('mouseover', this.onPointerOver, true);
            window.addEventListener('mouseup', this.onPointerUp, true);

            if (this.supportsTouchEvents) {
                this.interactionDOMElement.addEventListener('touchstart', this.onPointerDown, true);
                this.interactionDOMElement.addEventListener('touchcancel', this.onPointerCancel, true);
                this.interactionDOMElement.addEventListener('touchend', this.onPointerUp, true);
                this.interactionDOMElement.addEventListener('touchmove', this.onPointerMove, true);
            }
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
            this.interactionDOMElement.removeEventListener('pointerleave', this.onPointerOut, true);
            this.interactionDOMElement.removeEventListener('pointerover', this.onPointerOver, true);
            window.removeEventListener('pointercancel', this.onPointerCancel, true);
            window.removeEventListener('pointerup', this.onPointerUp, true);
        } else {
            window.document.removeEventListener('mousemove', this.onPointerMove, true);
            this.interactionDOMElement.removeEventListener('mousedown', this.onPointerDown, true);
            this.interactionDOMElement.removeEventListener('mouseout', this.onPointerOut, true);
            this.interactionDOMElement.removeEventListener('mouseover', this.onPointerOver, true);
            window.removeEventListener('mouseup', this.onPointerUp, true);

            if (this.supportsTouchEvents) {
                this.interactionDOMElement.removeEventListener('touchstart', this.onPointerDown, true);
                this.interactionDOMElement.removeEventListener('touchcancel', this.onPointerCancel, true);
                this.interactionDOMElement.removeEventListener('touchend', this.onPointerUp, true);
                this.interactionDOMElement.removeEventListener('touchmove', this.onPointerMove, true);
            }
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

        // if the user move the mouse this check has already been done using the mouse move!
        if (this.didMove) {
            this.didMove = false;

            return;
        }

        this.cursor = null;

        // Resets the flag as set by a stopPropagation call. This flag is usually reset by a user interaction of any kind,
        // but there was a scenario of a display object moving under a static mouse cursor.
        // In this case, mouseover and mouseevents would not pass the flag test in dispatchEvent function
        for (var k in this.activeInteractionData) {
            // eslint-disable-next-line no-prototype-builtins
            if (this.activeInteractionData.hasOwnProperty(k)) {
                var interactionData = this.activeInteractionData[k];

                if (interactionData.originalEvent && interactionData.pointerType !== 'touch') {
                    var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, interactionData.originalEvent, interactionData);

                    this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, this.processPointerOverOut, true);
                }
            }
        }

        this.setCursorMode(this.cursor);

        // TODO
    };

    /**
     * Sets the current cursor mode, handling any callbacks or CSS style changes.
     *
     * @param {string} mode - cursor mode, a key from the cursorStyles dictionary
     */


    InteractionManager.prototype.setCursorMode = function setCursorMode(mode) {
        mode = mode || 'default';
        // if the mode didn't actually change, bail early
        if (this.currentCursorMode === mode) {
            return;
        }
        this.currentCursorMode = mode;
        var style = this.cursorStyles[mode];

        // only do things if there is a cursor style for it
        if (style) {
            switch (typeof style === 'undefined' ? 'undefined' : _typeof(style)) {
                case 'string':
                    // string styles are handled as cursor CSS
                    this.interactionDOMElement.style.cursor = style;
                    break;
                case 'function':
                    // functions are just called, and passed the cursor mode
                    style(mode);
                    break;
                case 'object':
                    // if it is an object, assume that it is a dictionary of CSS styles,
                    // apply it to the interactionDOMElement
                    Object.assign(this.interactionDOMElement.style, style);
                    break;
            }
        }
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

        var resolutionMultiplier = navigator.isCocoonJS ? this.resolution : 1.0 / this.resolution;

        point.x = (x - rect.left) * (this.interactionDOMElement.width / rect.width) * resolutionMultiplier;
        point.y = (y - rect.top) * (this.interactionDOMElement.height / rect.height) * resolutionMultiplier;
    };

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
     * @return {number} returns 1 or 2 if the displayObject hit the point, 0 if not
     */


    InteractionManager.prototype.processInteractive = function processInteractive(interactionEvent, displayObject, func, hitTest, interactive) {
        if (!displayObject || !displayObject.visible) {
            return false;
        }

        var point = interactionEvent.data.global;

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

        var hit = HIT_NONE;
        var interactiveParent = interactive;

        // if the displayobject has a hitArea, then it does not need to hitTest children.
        if (displayObject.hitArea) {
            interactiveParent = false;
        }
        // it has a mask! Then lets hit test that before continuing
        else if (hitTest && displayObject._mask) {
                if (!displayObject._mask.containsPoint(point)) {
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
                var childHit = this.processInteractive(interactionEvent, child, func, hitTest, interactiveParent);

                if (childHit) {
                    // its a good idea to check if a child has lost its parent.
                    // this means it has been removed whilst looping so its best
                    if (!child.parent) {
                        continue;
                    }

                    // we no longer need to hit test any more objects in this container as we we
                    // now know the parent has been hit
                    interactiveParent = false;

                    // If the child is interactive , that means that the object hit was actually
                    // interactive and not just the child of an interactive object.
                    // This means we no longer need to hit test anything else. We still need to run
                    // through all objects, but we don't need to perform any hit tests.

                    if (childHit === HIT_INTERACTIVE) {
                        hitTest = false;
                        hit = HIT_INTERACTIVE;
                    } else if (hit === HIT_NONE) {
                        hit = HIT_ANY;
                    }
                }
            }
        }

        // no point running this if the item is not interactive or does not have an interactive parent.
        if (interactive) {
            // if we are hit testing (as in we have no hit any objects yet)
            // We also don't need to worry about hit testing if once of the displayObjects children
            // has already been hit - but only if it was interactive, otherwise we need to keep
            // looking for an interactive child, just in case we hit one
            if (hitTest && hit !== HIT_INTERACTIVE) {
                if (displayObject.hitArea) {
                    displayObject.worldTransform.applyInverse(point, this._tempPoint);
                    if (displayObject.hitArea.contains(this._tempPoint.x, this._tempPoint.y)) {
                        hit = displayObject.interactive ? HIT_INTERACTIVE : HIT_ANY;
                    }
                } else if (displayObject.containsPoint) {
                    if (displayObject.containsPoint(point)) {
                        hit = displayObject.interactive ? HIT_INTERACTIVE : HIT_ANY;
                    }
                }
            }

            if (displayObject.interactive) {
                if (hit && !interactionEvent.target) {
                    interactionEvent.target = displayObject;
                }

                func(interactionEvent, displayObject, !!hit);
            }
        }

        return hit;
    };

    /**
     * Is called when the pointer button is pressed down on the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer button being pressed down
     */


    InteractionManager.prototype.onPointerDown = function onPointerDown(originalEvent) {
        var events = this.normalizeToPointerData(originalEvent);

        /**
         * No need to prevent default on natural pointer events, as there are no side effects
         * Normalized events, however, may have the double mousedown/touchstart issue on the native android browser,
         * so still need to be prevented.
         */

        // Guaranteed that there will be at least one event in events, and all events must have the same pointer type

        if (this.autoPreventDefault && events[0].isNormalized) {
            originalEvent.preventDefault();
        }

        var eventLen = events.length;

        for (var i = 0; i < eventLen; i++) {
            var event = events[i];

            var interactionData = this.getInteractionDataForPointerId(event);

            var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

            interactionEvent.data.originalEvent = originalEvent;

            this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, this.processPointerDown, true);

            this.emit('pointerdown', interactionEvent);
            if (event.pointerType === 'touch') {
                this.emit('touchstart', interactionEvent);
            } else if (event.pointerType === 'mouse') {
                var isRightButton = event.button === 2 || event.which === 3;

                this.emit(isRightButton ? 'rightdown' : 'mousedown', this.eventData);
            }
        }
    };

    /**
     * Processes the result of the pointer down check and dispatches the event if need be
     *
     * @private
     * @param {InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */


    InteractionManager.prototype.processPointerDown = function processPointerDown(interactionEvent, displayObject, hit) {
        var e = interactionEvent.data.originalEvent;

        var id = interactionEvent.data.identifier;

        if (hit) {
            if (!displayObject.trackedPointers[id]) {
                displayObject.trackedPointers[id] = new _InteractionTrackingData2.default(id);
            }
            this.dispatchEvent(displayObject, 'pointerdown', interactionEvent);

            if (e.type === 'touchstart' || e.pointerType === 'touch') {
                this.dispatchEvent(displayObject, 'touchstart', interactionEvent);
            } else if (e.type === 'mousedown' || e.pointerType === 'mouse') {
                var isRightButton = e.button === 2 || e.which === 3;

                if (isRightButton) {
                    displayObject.trackedPointers[id].rightDown = true;
                } else {
                    displayObject.trackedPointers[id].leftDown = true;
                }

                this.dispatchEvent(displayObject, isRightButton ? 'rightdown' : 'mousedown', interactionEvent);
            }
        }
    };

    /**
     * Is called when the pointer button is released on the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer button being released
     * @param {boolean} cancelled - true if the pointer is cancelled
     * @param {Function} func - Function passed to {@link processInteractive}
     */


    InteractionManager.prototype.onPointerComplete = function onPointerComplete(originalEvent, cancelled, func) {
        var events = this.normalizeToPointerData(originalEvent);

        var eventLen = events.length;

        for (var i = 0; i < eventLen; i++) {
            var event = events[i];

            var interactionData = this.getInteractionDataForPointerId(event);

            var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

            interactionEvent.data.originalEvent = originalEvent;

            this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, func, true);

            this.emit(cancelled ? 'pointercancel' : 'pointerup', interactionEvent);

            if (event.pointerType === 'mouse') {
                var isRightButton = event.button === 2 || event.which === 3;

                this.emit(isRightButton ? 'rightup' : 'mouseup', interactionEvent);
            } else if (event.pointerType === 'touch') {
                this.emit(cancelled ? 'touchcancel' : 'touchend', interactionEvent);
                this.releaseInteractionDataForPointerId(event.pointerId, interactionData);
            }
        }
    };

    /**
     * Is called when the pointer button is cancelled
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer button being released
     */


    InteractionManager.prototype.onPointerCancel = function onPointerCancel(event) {
        this.onPointerComplete(event, true, this.processPointerCancel);
    };

    /**
     * Processes the result of the pointer cancel check and dispatches the event if need be
     *
     * @private
     * @param {InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     */


    InteractionManager.prototype.processPointerCancel = function processPointerCancel(interactionEvent, displayObject) {
        var e = interactionEvent.data.originalEvent;

        var id = interactionEvent.data.identifier;

        if (displayObject.trackedPointers[id] !== undefined) {
            delete displayObject.trackedPointers[id];
            this.dispatchEvent(displayObject, 'pointercancel', interactionEvent);

            if (e.type === 'touchcancel' || e.pointerType === 'touch') {
                this.dispatchEvent(displayObject, 'touchcancel', interactionEvent);
            }
        }
    };

    /**
     * Is called when the pointer button is released on the renderer element
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer button being released
     */


    InteractionManager.prototype.onPointerUp = function onPointerUp(event) {
        this.onPointerComplete(event, false, this.processPointerUp);
    };

    /**
     * Processes the result of the pointer up check and dispatches the event if need be
     *
     * @private
     * @param {InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */


    InteractionManager.prototype.processPointerUp = function processPointerUp(interactionEvent, displayObject, hit) {
        var e = interactionEvent.data.originalEvent;

        var id = interactionEvent.data.identifier;

        var trackingData = displayObject.trackedPointers[id];

        var isTouch = e.type === 'touchend' || e.pointerType === 'touch';

        var isMouse = e.type.indexOf('mouse') === 0 || e.pointerType === 'mouse';

        // Mouse only
        if (isMouse) {
            var isRightButton = e.button === 2 || e.which === 3;

            var flags = _InteractionTrackingData2.default.FLAGS;

            var test = isRightButton ? flags.RIGHT_DOWN : flags.LEFT_DOWN;

            var isDown = trackingData !== undefined && trackingData.flags & test;

            if (hit) {
                this.dispatchEvent(displayObject, isRightButton ? 'rightup' : 'mouseup', interactionEvent);

                if (isDown) {
                    this.dispatchEvent(displayObject, isRightButton ? 'rightclick' : 'click', interactionEvent);
                }
            } else if (isDown) {
                this.dispatchEvent(displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', interactionEvent);
            }
            // update the down state of the tracking data
            if (trackingData) {
                if (isRightButton) {
                    trackingData.rightDown = false;
                } else {
                    trackingData.leftDown = false;
                }
            }
        }

        // Pointers and Touches, and Mouse
        if (hit) {
            this.dispatchEvent(displayObject, 'pointerup', interactionEvent);
            if (isTouch) this.dispatchEvent(displayObject, 'touchend', interactionEvent);

            if (trackingData) {
                this.dispatchEvent(displayObject, 'pointertap', interactionEvent);
                if (isTouch) {
                    this.dispatchEvent(displayObject, 'tap', interactionEvent);
                    // touches are no longer over (if they ever were) when we get the touchend
                    // so we should ensure that we don't keep pretending that they are
                    trackingData.over = false;
                }
            }
        } else if (trackingData) {
            this.dispatchEvent(displayObject, 'pointerupoutside', interactionEvent);
            if (isTouch) this.dispatchEvent(displayObject, 'touchendoutside', interactionEvent);
        }
        // Only remove the tracking data if there is no over/down state still associated with it
        if (trackingData && trackingData.none) {
            delete displayObject.trackedPointers[id];
        }
    };

    /**
     * Is called when the pointer moves across the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer moving
     */


    InteractionManager.prototype.onPointerMove = function onPointerMove(originalEvent) {
        var events = this.normalizeToPointerData(originalEvent);

        if (events[0].pointerType === 'mouse') {
            this.didMove = true;

            this.cursor = null;
        }

        var eventLen = events.length;

        for (var i = 0; i < eventLen; i++) {
            var event = events[i];

            var interactionData = this.getInteractionDataForPointerId(event);

            var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

            interactionEvent.data.originalEvent = originalEvent;

            var interactive = event.pointerType === 'touch' ? this.moveWhenInside : true;

            this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, this.processPointerMove, interactive);
            this.emit('pointermove', interactionEvent);
            if (event.pointerType === 'touch') this.emit('touchmove', interactionEvent);
            if (event.pointerType === 'mouse') this.emit('mousemove', interactionEvent);
        }

        if (events[0].pointerType === 'mouse') {
            this.setCursorMode(this.cursor);

            // TODO BUG for parents interactive object (border order issue)
        }
    };

    /**
     * Processes the result of the pointer move check and dispatches the event if need be
     *
     * @private
     * @param {InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */


    InteractionManager.prototype.processPointerMove = function processPointerMove(interactionEvent, displayObject, hit) {
        var e = interactionEvent.data.originalEvent;

        var isTouch = e.type === 'touchmove' || e.pointerType === 'touch';

        var isMouse = e.type === 'mousemove' || e.pointerType === 'mouse';

        if (isMouse) {
            this.processPointerOverOut(interactionEvent, displayObject, hit);
        }

        if (!this.moveWhenInside || hit) {
            this.dispatchEvent(displayObject, 'pointermove', interactionEvent);
            if (isTouch) this.dispatchEvent(displayObject, 'touchmove', interactionEvent);
            if (isMouse) this.dispatchEvent(displayObject, 'mousemove', interactionEvent);
        }
    };

    /**
     * Is called when the pointer is moved out of the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer being moved out
     */


    InteractionManager.prototype.onPointerOut = function onPointerOut(originalEvent) {
        var events = this.normalizeToPointerData(originalEvent);

        // Only mouse and pointer can call onPointerOut, so events will always be length 1
        var event = events[0];

        if (event.pointerType === 'mouse') {
            this.mouseOverRenderer = false;
            this.setCursorMode(null);
        }

        var interactionData = this.getInteractionDataForPointerId(event);

        var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

        interactionEvent.data.originalEvent = event;

        this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, this.processPointerOverOut, false);

        this.emit('pointerout', interactionEvent);
        if (event.pointerType === 'mouse') {
            this.emit('mouseout', interactionEvent);
        } else {
            // we can get touchleave events after touchend, so we want to make sure we don't
            // introduce memory leaks
            this.releaseInteractionDataForPointerId(interactionData.identifier);
        }
    };

    /**
     * Processes the result of the pointer over/out check and dispatches the event if need be
     *
     * @private
     * @param {InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */


    InteractionManager.prototype.processPointerOverOut = function processPointerOverOut(interactionEvent, displayObject, hit) {
        var e = interactionEvent.data.originalEvent;

        var id = interactionEvent.data.identifier;

        var isMouse = e.type === 'mouseover' || e.type === 'mouseout' || e.pointerType === 'mouse';

        var trackingData = displayObject.trackedPointers[id];

        // if we just moused over the display object, then we need to track that state
        if (hit && !trackingData) {
            trackingData = displayObject.trackedPointers[id] = new _InteractionTrackingData2.default(id);
        }

        if (trackingData === undefined) return;

        if (hit && this.mouseOverRenderer) {
            if (!trackingData.over) {
                trackingData.over = true;
                this.dispatchEvent(displayObject, 'pointerover', interactionEvent);
                if (isMouse) {
                    this.dispatchEvent(displayObject, 'mouseover', interactionEvent);
                }
            }

            // only change the cursor if it has not already been changed (by something deeper in the
            // display tree)
            if (isMouse && this.cursor === null) {
                this.cursor = displayObject.cursor;
            }
        } else if (trackingData.over) {
            trackingData.over = false;
            this.dispatchEvent(displayObject, 'pointerout', this.eventData);
            if (isMouse) {
                this.dispatchEvent(displayObject, 'mouseout', interactionEvent);
            }
            // if there is no mouse down information for the pointer, then it is safe to delete
            if (trackingData.none) {
                delete displayObject.trackedPointers[id];
            }
        }
    };

    /**
     * Is called when the pointer is moved into the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer button being moved into the renderer view
     */


    InteractionManager.prototype.onPointerOver = function onPointerOver(originalEvent) {
        var events = this.normalizeToPointerData(originalEvent);

        // Only mouse and pointer can call onPointerOver, so events will always be length 1
        var event = events[0];

        var interactionData = this.getInteractionDataForPointerId(event);

        var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

        interactionEvent.data.originalEvent = event;

        if (event.pointerType === 'mouse') {
            this.mouseOverRenderer = true;
        }

        this.emit('pointerover', interactionEvent);
        if (event.pointerType === 'mouse') {
            this.emit('mouseover', interactionEvent);
        }
    };

    /**
     * Get InteractionData for a given pointerId. Store that data as well
     *
     * @private
     * @param {PointerEvent} event - Normalized pointer event, output from normalizeToPointerData
     * @return {InteractionData} - Interaction data for the given pointer identifier
     */


    InteractionManager.prototype.getInteractionDataForPointerId = function getInteractionDataForPointerId(event) {
        var pointerId = event.pointerId;

        if (pointerId === MOUSE_POINTER_ID || event.pointerType === 'mouse') {
            return this.mouse;
        } else if (this.activeInteractionData[pointerId]) {
            return this.activeInteractionData[pointerId];
        }

        var interactionData = this.interactionDataPool.pop() || new _InteractionData2.default();

        interactionData.identifier = pointerId;
        this.activeInteractionData[pointerId] = interactionData;

        return interactionData;
    };

    /**
     * Return unused InteractionData to the pool, for a given pointerId
     *
     * @private
     * @param {number} pointerId - Identifier from a pointer event
     */


    InteractionManager.prototype.releaseInteractionDataForPointerId = function releaseInteractionDataForPointerId(pointerId) {
        var interactionData = this.activeInteractionData[pointerId];

        if (interactionData) {
            delete this.activeInteractionData[pointerId];
            this.interactionDataPool.push(interactionData);
        }
    };

    /**
     * Configure an InteractionEvent to wrap a DOM PointerEvent and InteractionData
     *
     * @private
     * @param {InteractionEvent} interactionEvent - The event to be configured
     * @param {PointerEvent} pointerEvent - The DOM event that will be paired with the InteractionEvent
     * @param {InteractionData} interactionData - The InteractionData that will be paired with the InteractionEvent
     * @return {InteractionEvent} the interaction event that was passed in
     */


    InteractionManager.prototype.configureInteractionEventForDOMEvent = function configureInteractionEventForDOMEvent(interactionEvent, pointerEvent, interactionData) {
        interactionEvent.data = interactionData;

        this.mapPositionToPoint(interactionData.global, pointerEvent.clientX, pointerEvent.clientY);

        // This is the way InteractionManager processed touch events before the refactoring, so I've kept
        // it here. But it doesn't make that much sense to me, since mapPositionToPoint already factors
        // in this.resolution, so this just divides by this.resolution twice for touch events...
        if (navigator.isCocoonJS && pointerEvent.pointerType === 'touch') {
            interactionData.global.x = interactionData.global.x / this.resolution;
            interactionData.global.y = interactionData.global.y / this.resolution;
        }

        // Not really sure why this is happening, but it's how a previous version handled things
        if (pointerEvent.pointerType === 'touch') {
            pointerEvent.globalX = interactionData.global.x;
            pointerEvent.globalY = interactionData.global.y;
        }

        interactionData.originalEvent = pointerEvent;
        interactionEvent._reset();

        return interactionEvent;
    };

    /**
     * Ensures that the original event object contains all data that a regular pointer event would have
     *
     * @private
     * @param {TouchEvent|MouseEvent|PointerEvent} event - The original event data from a touch or mouse event
     * @return {PointerEvent[]} An array containing a single normalized pointer event, in the case of a pointer
     *  or mouse event, or a multiple normalized pointer events if there are multiple changed touches
     */


    InteractionManager.prototype.normalizeToPointerData = function normalizeToPointerData(event) {
        var normalizedEvents = [];

        if (this.supportsTouchEvents && event instanceof TouchEvent) {
            for (var i = 0, li = event.changedTouches.length; i < li; i++) {
                var touch = event.changedTouches[i];

                if (typeof touch.button === 'undefined') touch.button = event.touches.length ? 1 : 0;
                if (typeof touch.buttons === 'undefined') touch.buttons = event.touches.length ? 1 : 0;
                if (typeof touch.isPrimary === 'undefined') touch.isPrimary = event.touches.length === 1;
                if (typeof touch.width === 'undefined') touch.width = touch.radiusX || 1;
                if (typeof touch.height === 'undefined') touch.height = touch.radiusY || 1;
                if (typeof touch.tiltX === 'undefined') touch.tiltX = 0;
                if (typeof touch.tiltY === 'undefined') touch.tiltY = 0;
                if (typeof touch.pointerType === 'undefined') touch.pointerType = 'touch';
                if (typeof touch.pointerId === 'undefined') touch.pointerId = touch.identifier || 0;
                if (typeof touch.pressure === 'undefined') touch.pressure = touch.force || 0.5;
                if (typeof touch.rotation === 'undefined') touch.rotation = touch.rotationAngle || 0;

                if (typeof touch.layerX === 'undefined') touch.layerX = touch.offsetX = touch.clientX;
                if (typeof touch.layerY === 'undefined') touch.layerY = touch.offsetY = touch.clientY;

                // mark the touch as normalized, just so that we know we did it
                touch.isNormalized = true;

                normalizedEvents.push(touch);
            }
        }
        // apparently PointerEvent subclasses MouseEvent, so yay
        else if (event instanceof MouseEvent && (!this.supportsPointerEvents || !(event instanceof window.PointerEvent))) {
                if (typeof event.isPrimary === 'undefined') event.isPrimary = true;
                if (typeof event.width === 'undefined') event.width = 1;
                if (typeof event.height === 'undefined') event.height = 1;
                if (typeof event.tiltX === 'undefined') event.tiltX = 0;
                if (typeof event.tiltY === 'undefined') event.tiltY = 0;
                if (typeof event.pointerType === 'undefined') event.pointerType = 'mouse';
                if (typeof event.pointerId === 'undefined') event.pointerId = MOUSE_POINTER_ID;
                if (typeof event.pressure === 'undefined') event.pressure = 0.5;
                if (typeof event.rotation === 'undefined') event.rotation = 0;

                // mark the mouse event as normalized, just so that we know we did it
                event.isNormalized = true;

                normalizedEvents.push(event);
            } else {
                normalizedEvents.push(event);
            }

        return normalizedEvents;
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
    };

    return InteractionManager;
}(_eventemitter2.default);

exports.default = InteractionManager;


core.WebGLRenderer.registerPlugin('interaction', InteractionManager);
core.CanvasRenderer.registerPlugin('interaction', InteractionManager);
//# sourceMappingURL=InteractionManager.js.map