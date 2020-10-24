/*!
 * @pixi/interaction - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/interaction is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { Point } from '@pixi/math';
import { Ticker, UPDATE_PRIORITY } from '@pixi/ticker';
import { DisplayObject, TemporaryDisplayObject } from '@pixi/display';
import { EventEmitter } from '@pixi/utils';

/**
 * Holds all information related to an Interaction event
 *
 * @class
 * @memberof PIXI
 */
var InteractionData = /** @class */ (function () {
    function InteractionData() {
        this.pressure = 0;
        this.rotationAngle = 0;
        this.twist = 0;
        this.tangentialPressure = 0;
        /**
         * This point stores the global coords of where the touch/mouse event happened
         *
         * @member {PIXI.Point}
         */
        this.global = new Point();
        /**
         * The target Sprite that was interacted with
         *
         * @member {PIXI.Sprite}
         */
        this.target = null;
        /**
         * When passed to an event handler, this will be the original DOM Event that was captured
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
         * @see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent
         * @member {MouseEvent|TouchEvent|PointerEvent}
         */
        this.originalEvent = null;
        /**
         * Unique identifier for this interaction
         *
         * @member {number}
         */
        this.identifier = null;
        /**
         * Indicates whether or not the pointer device that created the event is the primary pointer.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/isPrimary
         * @type {Boolean}
         */
        this.isPrimary = false;
        /**
         * Indicates which button was pressed on the mouse or pointer device to trigger the event.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
         * @type {number}
         */
        this.button = 0;
        /**
         * Indicates which buttons are pressed on the mouse or pointer device when the event is triggered.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
         * @type {number}
         */
        this.buttons = 0;
        /**
         * The width of the pointer's contact along the x-axis, measured in CSS pixels.
         * radiusX of TouchEvents will be represented by this value.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/width
         * @type {number}
         */
        this.width = 0;
        /**
         * The height of the pointer's contact along the y-axis, measured in CSS pixels.
         * radiusY of TouchEvents will be represented by this value.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/height
         * @type {number}
         */
        this.height = 0;
        /**
         * The angle, in degrees, between the pointer device and the screen.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltX
         * @type {number}
         */
        this.tiltX = 0;
        /**
         * The angle, in degrees, between the pointer device and the screen.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltY
         * @type {number}
         */
        this.tiltY = 0;
        /**
         * The type of pointer that triggered the event.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType
         * @type {string}
         */
        this.pointerType = null;
        /**
         * Pressure applied by the pointing device during the event. A Touch's force property
         * will be represented by this value.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure
         * @type {number}
         */
        this.pressure = 0;
        /**
         * From TouchEvents (not PointerEvents triggered by touches), the rotationAngle of the Touch.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Touch/rotationAngle
         * @type {number}
         */
        this.rotationAngle = 0;
        /**
         * Twist of a stylus pointer.
         * @see https://w3c.github.io/pointerevents/#pointerevent-interface
         * @type {number}
         */
        this.twist = 0;
        /**
         * Barrel pressure on a stylus pointer.
         * @see https://w3c.github.io/pointerevents/#pointerevent-interface
         * @type {number}
         */
        this.tangentialPressure = 0;
    }
    Object.defineProperty(InteractionData.prototype, "pointerId", {
        /**
         * The unique identifier of the pointer. It will be the same as `identifier`.
         * @readonly
         * @member {number}
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerId
         */
        get: function () {
            return this.identifier;
        },
        enumerable: false,
        configurable: true
    });
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
    InteractionData.prototype.getLocalPosition = function (displayObject, point, globalPos) {
        return displayObject.worldTransform.applyInverse(globalPos || this.global, point);
    };
    /**
     * Copies properties from normalized event data.
     *
     * @param {Touch|MouseEvent|PointerEvent} event - The normalized event data
     */
    InteractionData.prototype.copyEvent = function (event) {
        // isPrimary should only change on touchstart/pointerdown, so we don't want to overwrite
        // it with "false" on later events when our shim for it on touch events might not be
        // accurate
        if ('isPrimary' in event && event.isPrimary) {
            this.isPrimary = true;
        }
        this.button = 'button' in event && event.button;
        // event.buttons is not available in all browsers (ie. Safari), but it does have a non-standard
        // event.which property instead, which conveys the same information.
        var buttons = 'buttons' in event && event.buttons;
        this.buttons = Number.isInteger(buttons) ? buttons : 'which' in event && event.which;
        this.width = 'width' in event && event.width;
        this.height = 'height' in event && event.height;
        this.tiltX = 'tiltX' in event && event.tiltX;
        this.tiltY = 'tiltY' in event && event.tiltY;
        this.pointerType = 'pointerType' in event && event.pointerType;
        this.pressure = 'pressure' in event && event.pressure;
        this.rotationAngle = 'rotationAngle' in event && event.rotationAngle;
        this.twist = ('twist' in event && event.twist) || 0;
        this.tangentialPressure = ('tangentialPressure' in event && event.tangentialPressure) || 0;
    };
    /**
     * Resets the data for pooling.
     */
    InteractionData.prototype.reset = function () {
        // isPrimary is the only property that we really need to reset - everything else is
        // guaranteed to be overwritten
        this.isPrimary = false;
    };
    return InteractionData;
}());

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/**
 * Event class that mimics native DOM events.
 *
 * @class
 * @memberof PIXI
 */
var InteractionEvent = /** @class */ (function () {
    function InteractionEvent() {
        /**
         * Whether this event will continue propagating in the tree.
         *
         * Remaining events for the {@link stopsPropagatingAt} object
         * will still be dispatched.
         *
         * @member {boolean}
         */
        this.stopped = false;
        /**
         * At which object this event stops propagating.
         *
         * @private
         * @member {PIXI.DisplayObject}
         */
        this.stopsPropagatingAt = null;
        /**
         * Whether we already reached the element we want to
         * stop propagating at. This is important for delayed events,
         * where we start over deeper in the tree again.
         *
         * @private
         * @member {boolean}
         */
        this.stopPropagationHint = false;
        /**
         * The object which caused this event to be dispatched.
         * For listener callback see {@link PIXI.InteractionEvent.currentTarget}.
         *
         * @member {PIXI.DisplayObject}
         */
        this.target = null;
        /**
         * The object whose event listener’s callback is currently being invoked.
         *
         * @member {PIXI.DisplayObject}
         */
        this.currentTarget = null;
        /**
         * Type of the event
         *
         * @member {string}
         */
        this.type = null;
        /**
         * InteractionData related to this event
         *
         * @member {PIXI.InteractionData}
         */
        this.data = null;
    }
    /**
     * Prevents event from reaching any objects other than the current object.
     *
     */
    InteractionEvent.prototype.stopPropagation = function () {
        this.stopped = true;
        this.stopPropagationHint = true;
        this.stopsPropagatingAt = this.currentTarget;
    };
    /**
     * Resets the event.
     */
    InteractionEvent.prototype.reset = function () {
        this.stopped = false;
        this.stopsPropagatingAt = null;
        this.stopPropagationHint = false;
        this.currentTarget = null;
        this.target = null;
    };
    return InteractionEvent;
}());

/**
 * DisplayObjects with the {@link PIXI.interactiveTarget} mixin use this class to track interactions
 *
 * @class
 * @private
 * @memberof PIXI
 */
var InteractionTrackingData = /** @class */ (function () {
    /**
     * @param {number} pointerId - Unique pointer id of the event
     * @private
     */
    function InteractionTrackingData(pointerId) {
        this._pointerId = pointerId;
        this._flags = InteractionTrackingData.FLAGS.NONE;
    }
    /**
     *
     * @private
     * @param {number} flag - The interaction flag to set
     * @param {boolean} yn - Should the flag be set or unset
     */
    InteractionTrackingData.prototype._doSet = function (flag, yn) {
        if (yn) {
            this._flags = this._flags | flag;
        }
        else {
            this._flags = this._flags & (~flag);
        }
    };
    Object.defineProperty(InteractionTrackingData.prototype, "pointerId", {
        /**
         * Unique pointer id of the event
         *
         * @readonly
         * @private
         * @member {number}
         */
        get: function () {
            return this._pointerId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionTrackingData.prototype, "flags", {
        /**
         * State of the tracking data, expressed as bit flags
         *
         * @private
         * @member {number}
         */
        get: function () {
            return this._flags;
        },
        set: function (flags) {
            this._flags = flags;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionTrackingData.prototype, "none", {
        /**
         * Is the tracked event inactive (not over or down)?
         *
         * @private
         * @member {number}
         */
        get: function () {
            return this._flags === InteractionTrackingData.FLAGS.NONE;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionTrackingData.prototype, "over", {
        /**
         * Is the tracked event over the DisplayObject?
         *
         * @private
         * @member {boolean}
         */
        get: function () {
            return (this._flags & InteractionTrackingData.FLAGS.OVER) !== 0;
        },
        set: function (yn) {
            this._doSet(InteractionTrackingData.FLAGS.OVER, yn);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionTrackingData.prototype, "rightDown", {
        /**
         * Did the right mouse button come down in the DisplayObject?
         *
         * @private
         * @member {boolean}
         */
        get: function () {
            return (this._flags & InteractionTrackingData.FLAGS.RIGHT_DOWN) !== 0;
        },
        set: function (yn) {
            this._doSet(InteractionTrackingData.FLAGS.RIGHT_DOWN, yn);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionTrackingData.prototype, "leftDown", {
        /**
         * Did the left mouse button come down in the DisplayObject?
         *
         * @private
         * @member {boolean}
         */
        get: function () {
            return (this._flags & InteractionTrackingData.FLAGS.LEFT_DOWN) !== 0;
        },
        set: function (yn) {
            this._doSet(InteractionTrackingData.FLAGS.LEFT_DOWN, yn);
        },
        enumerable: false,
        configurable: true
    });
    InteractionTrackingData.FLAGS = Object.freeze({
        NONE: 0,
        OVER: 1 << 0,
        LEFT_DOWN: 1 << 1,
        RIGHT_DOWN: 1 << 2,
    });
    return InteractionTrackingData;
}());

/**
 * Strategy how to search through stage tree for interactive objects
 *
 * @private
 * @class
 * @memberof PIXI
 */
var TreeSearch = /** @class */ (function () {
    function TreeSearch() {
        this._tempPoint = new Point();
    }
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
    TreeSearch.prototype.recursiveFindHit = function (interactionEvent, displayObject, func, hitTest, interactive) {
        if (!displayObject || !displayObject.visible) {
            return false;
        }
        var point = interactionEvent.data.global;
        // Took a little while to rework this function correctly! But now it is done and nice and optimized! ^_^
        //
        // This function will now loop through all objects and then only hit test the objects it HAS
        // to, not all of them. MUCH faster..
        // An object will be hit test if the following is true:
        //
        // 1: It is interactive.
        // 2: It belongs to a parent that is interactive AND one of the parents children have not already been hit.
        //
        // As another little optimization once an interactive object has been hit we can carry on
        // through the scenegraph, but we know that there will be no more hits! So we can avoid extra hit tests
        // A final optimization is that an object is not hit test directly if a child has already been hit.
        interactive = displayObject.interactive || interactive;
        var hit = false;
        var interactiveParent = interactive;
        // Flag here can set to false if the event is outside the parents hitArea or mask
        var hitTestChildren = true;
        // If there is a hitArea, no need to test against anything else if the pointer is not within the hitArea
        // There is also no longer a need to hitTest children.
        if (displayObject.hitArea) {
            if (hitTest) {
                displayObject.worldTransform.applyInverse(point, this._tempPoint);
                if (!displayObject.hitArea.contains(this._tempPoint.x, this._tempPoint.y)) {
                    hitTest = false;
                    hitTestChildren = false;
                }
                else {
                    hit = true;
                }
            }
            interactiveParent = false;
        }
        // If there is a mask, no need to hitTest against anything else if the pointer is not within the mask.
        // We still want to hitTestChildren, however, to ensure a mouseout can still be generated.
        // https://github.com/pixijs/pixi.js/issues/5135
        else if (displayObject._mask) {
            if (hitTest) {
                if (!(displayObject._mask.containsPoint && displayObject._mask.containsPoint(point))) {
                    hitTest = false;
                }
            }
        }
        // ** FREE TIP **! If an object is not interactive or has no buttons in it
        // (such as a game scene!) set interactiveChildren to false for that displayObject.
        // This will allow PixiJS to completely ignore and bypass checking the displayObjects children.
        if (hitTestChildren && displayObject.interactiveChildren && displayObject.children) {
            var children = displayObject.children;
            for (var i = children.length - 1; i >= 0; i--) {
                var child = children[i];
                // time to get recursive.. if this function will return if something is hit..
                var childHit = this.recursiveFindHit(interactionEvent, child, func, hitTest, interactiveParent);
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
                    if (childHit) {
                        if (interactionEvent.target) {
                            hitTest = false;
                        }
                        hit = true;
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
            if (hitTest && !interactionEvent.target) {
                // already tested against hitArea if it is defined
                if (!displayObject.hitArea && displayObject.containsPoint) {
                    if (displayObject.containsPoint(point)) {
                        hit = true;
                    }
                }
            }
            if (displayObject.interactive) {
                if (hit && !interactionEvent.target) {
                    interactionEvent.target = displayObject;
                }
                if (func) {
                    func(interactionEvent, displayObject, !!hit);
                }
            }
        }
        return hit;
    };
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
    TreeSearch.prototype.findHit = function (interactionEvent, displayObject, func, hitTest) {
        this.recursiveFindHit(interactionEvent, displayObject, func, hitTest, false);
    };
    return TreeSearch;
}());

/**
 * Interface for classes that represent a hit area.
 *
 * It is implemented by the following classes:
 * - {@link PIXI.Circle}
 * - {@link PIXI.Ellipse}
 * - {@link PIXI.Polygon}
 * - {@link PIXI.RoundedRectangle}
 *
 * @interface IHitArea
 * @memberof PIXI
 */
/**
 * Checks whether the x and y coordinates given are contained within this area
 *
 * @method
 * @name contains
 * @memberof PIXI.IHitArea#
 * @param {number} x - The X coordinate of the point to test
 * @param {number} y - The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this area
 */
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
var interactiveTarget = {
    /**
     * Enable interaction events for the DisplayObject. Touch, pointer and mouse
     * events will not be emitted unless `interactive` is set to `true`.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.on('tap', (event) => {
     *    //handle event
     * });
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     */
    interactive: false,
    /**
     * Determines if the children to the displayObject can be clicked/touched
     * Setting this to false allows PixiJS to bypass a recursive `hitTest` function
     *
     * @member {boolean}
     * @memberof PIXI.Container#
     */
    interactiveChildren: true,
    /**
     * Interaction shape. Children will be hit first, then this shape will be checked.
     * Setting this will cause this shape to be checked in hit tests rather than the displayObject's bounds.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.hitArea = new PIXI.Rectangle(0, 0, 100, 100);
     * @member {PIXI.IHitArea}
     * @memberof PIXI.DisplayObject#
     */
    hitArea: null,
    /**
     * If enabled, the mouse cursor use the pointer behavior when hovered over the displayObject if it is interactive
     * Setting this changes the 'cursor' property to `'pointer'`.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.buttonMode = true;
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     */
    get buttonMode() {
        return this.cursor === 'pointer';
    },
    set buttonMode(value) {
        if (value) {
            this.cursor = 'pointer';
        }
        else if (this.cursor === 'pointer') {
            this.cursor = null;
        }
    },
    /**
     * This defines what cursor mode is used when the mouse cursor
     * is hovered over the displayObject.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.cursor = 'wait';
     * @see https://developer.mozilla.org/en/docs/Web/CSS/cursor
     *
     * @member {string}
     * @memberof PIXI.DisplayObject#
     */
    cursor: null,
    /**
     * Internal set of all active pointers, by identifier
     *
     * @member {Map<number, InteractionTrackingData>}
     * @memberof PIXI.DisplayObject#
     * @private
     */
    get trackedPointers() {
        if (this._trackedPointers === undefined)
            { this._trackedPointers = {}; }
        return this._trackedPointers;
    },
    /**
     * Map of all tracked pointers, by identifier. Use trackedPointers to access.
     *
     * @private
     * @type {Map<number, InteractionTrackingData>}
     */
    _trackedPointers: undefined,
};

// Mix interactiveTarget into DisplayObject.prototype,
// after deprecation has been handled
DisplayObject.mixin(interactiveTarget);
var MOUSE_POINTER_ID = 1;
// helpers for hitTest() - only used inside hitTest()
var hitTestEvent = {
    target: null,
    data: {
        global: null,
    },
};
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
var InteractionManager = /** @class */ (function (_super) {
    __extends(InteractionManager, _super);
    /**
     * @param {PIXI.CanvasRenderer|PIXI.Renderer} renderer - A reference to the current renderer
     * @param {object} [options] - The options for the manager.
     * @param {boolean} [options.autoPreventDefault=true] - Should the manager automatically prevent default browser actions.
     * @param {number} [options.interactionFrequency=10] - Maximum requency (ms) at pointer over/out states will be checked.
     * @param {number} [options.useSystemTicker=true] - Whether to add {@link tickerUpdate} to {@link PIXI.Ticker.system}.
     */
    function InteractionManager(renderer, options) {
        var _this = _super.call(this) || this;
        options = options || {};
        /**
         * The renderer this interaction manager works for.
         *
         * @member {PIXI.AbstractRenderer}
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
         * Maximum requency in milliseconds at which pointer over/out states will be checked by {@link tickerUpdate}.
         *
         * @member {number}
         * @default 10
         */
        _this.interactionFrequency = options.interactionFrequency || 10;
        /**
         * The mouse data
         *
         * @member {PIXI.InteractionData}
         */
        _this.mouse = new InteractionData();
        _this.mouse.identifier = MOUSE_POINTER_ID;
        // setting the mouse to start off far off screen will mean that mouse over does
        //  not get called before we even move the mouse.
        _this.mouse.global.set(-999999);
        /**
         * Actively tracked InteractionData
         *
         * @private
         * @member {Object.<number,PIXI.InteractionData>}
         */
        _this.activeInteractionData = {};
        _this.activeInteractionData[MOUSE_POINTER_ID] = _this.mouse;
        /**
         * Pool of unused InteractionData
         *
         * @private
         * @member {PIXI.InteractionData[]}
         */
        _this.interactionDataPool = [];
        /**
         * An event data object to handle all the event tracking/dispatching
         *
         * @member {object}
         */
        _this.eventData = new InteractionEvent();
        /**
         * The DOM element to bind to.
         *
         * @protected
         * @member {HTMLElement}
         */
        _this.interactionDOMElement = null;
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
        _this.moveWhenInside = false;
        /**
         * Have events been attached to the dom element?
         *
         * @protected
         * @member {boolean}
         */
        _this.eventsAdded = false;
        /**
         * Has the system ticker been added?
         *
         * @protected
         * @member {boolean}
         */
        _this.tickerAdded = false;
        /**
         * Is the mouse hovering over the renderer?
         *
         * @protected
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
         * @member {Object.<string, Object>}
         */
        _this.cursorStyles = {
            default: 'inherit',
            pointer: 'pointer',
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
         * The current resolution / device pixel ratio.
         *
         * @member {number}
         * @default 1
         */
        _this.resolution = 1;
        /**
         * Delayed pointer events. Used to guarantee correct ordering of over/out events.
         *
         * @private
         * @member {Array}
         */
        _this.delayedEvents = [];
        /**
         * TreeSearch component that is used to hitTest stage tree
         *
         * @private
         * @member {PIXI.TreeSearch}
         */
        _this.search = new TreeSearch();
        /**
         * Used as a last rendered object in case renderer doesnt have _lastObjectRendered
         * @member {DisplayObject}
         * @private
         */
        _this._tempDisplayObject = new TemporaryDisplayObject();
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
         * @event PIXI.DisplayObject#mousedown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#rightdown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button (usually a mouse left-button) is released over the display
         * object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#mouseup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * over the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#rightup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
         * the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#click
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * and released on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
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
         * @event PIXI.DisplayObject#mouseupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * outside the display object that initially registered a
         * [rightdown]{@link PIXI.DisplayObject#event:rightdown}.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#rightupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device (usually a mouse) is moved while over the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#mousemove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device (usually a mouse) is moved onto the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#mouseover
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device (usually a mouse) is moved off the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#mouseout
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button is pressed on the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#pointerdown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button is released over the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#pointerup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when the operating system cancels a pointer event.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#pointercancel
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button is pressed and released on the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#pointertap
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button is released outside the display object that initially
         * registered a [pointerdown]{@link PIXI.DisplayObject#event:pointerdown}.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#pointerupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device is moved while over the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#pointermove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device is moved onto the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#pointerover
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device is moved off the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#pointerout
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a touch point is placed on the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#touchstart
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a touch point is removed from the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#touchend
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when the operating system cancels a touch.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#touchcancel
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a touch point is placed and removed from the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#tap
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a touch point is removed outside of the display object that initially
         * registered a [touchstart]{@link PIXI.DisplayObject#event:touchstart}.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#touchendoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a touch point is moved along the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * @event PIXI.DisplayObject#touchmove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        _this._useSystemTicker = options.useSystemTicker !== undefined ? options.useSystemTicker : true;
        _this.setTargetElement(_this.renderer.view, _this.renderer.resolution);
        return _this;
    }
    Object.defineProperty(InteractionManager.prototype, "useSystemTicker", {
        /**
         * Should the InteractionManager automatically add {@link tickerUpdate} to {@link PIXI.Ticker.system}.
         *
         * @member {boolean}
         * @default true
         */
        get: function () {
            return this._useSystemTicker;
        },
        set: function (useSystemTicker) {
            this._useSystemTicker = useSystemTicker;
            if (useSystemTicker) {
                this.addTickerListener();
            }
            else {
                this.removeTickerListener();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionManager.prototype, "lastObjectRendered", {
        /**
         * Last rendered object or temp object
         * @readonly
         * @protected
         * @member {PIXI.DisplayObject}
         */
        get: function () {
            return this.renderer._lastObjectRendered || this._tempDisplayObject;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Hit tests a point against the display tree, returning the first interactive object that is hit.
     *
     * @param {PIXI.Point} globalPoint - A point to hit test with, in global space.
     * @param {PIXI.Container} [root] - The root display object to start from. If omitted, defaults
     * to the last rendered root of the associated renderer.
     * @return {PIXI.DisplayObject} The hit display object, if any.
     */
    InteractionManager.prototype.hitTest = function (globalPoint, root) {
        // clear the target for our hit test
        hitTestEvent.target = null;
        // assign the global point
        hitTestEvent.data.global = globalPoint;
        // ensure safety of the root
        if (!root) {
            root = this.lastObjectRendered;
        }
        // run the hit test
        this.processInteractive(hitTestEvent, root, null, true);
        // return our found object - it'll be null if we didn't hit anything
        return hitTestEvent.target;
    };
    /**
     * Sets the DOM element which will receive mouse/touch events. This is useful for when you have
     * other DOM elements on top of the renderers Canvas element. With this you'll be bale to delegate
     * another DOM element to receive those events.
     *
     * @param {HTMLElement} element - the DOM element which will receive mouse and touch events.
     * @param {number} [resolution=1] - The resolution / device pixel ratio of the new element (relative to the canvas).
     */
    InteractionManager.prototype.setTargetElement = function (element, resolution) {
        if (resolution === void 0) { resolution = 1; }
        this.removeTickerListener();
        this.removeEvents();
        this.interactionDOMElement = element;
        this.resolution = resolution;
        this.addEvents();
        this.addTickerListener();
    };
    /**
     * Add the ticker listener
     *
     * @private
     */
    InteractionManager.prototype.addTickerListener = function () {
        if (this.tickerAdded || !this.interactionDOMElement || !this._useSystemTicker) {
            return;
        }
        Ticker.system.add(this.tickerUpdate, this, UPDATE_PRIORITY.INTERACTION);
        this.tickerAdded = true;
    };
    /**
     * Remove the ticker listener
     *
     * @private
     */
    InteractionManager.prototype.removeTickerListener = function () {
        if (!this.tickerAdded) {
            return;
        }
        Ticker.system.remove(this.tickerUpdate, this);
        this.tickerAdded = false;
    };
    /**
     * Registers all the DOM events
     *
     * @private
     */
    InteractionManager.prototype.addEvents = function () {
        if (this.eventsAdded || !this.interactionDOMElement) {
            return;
        }
        var style = this.interactionDOMElement.style;
        if (window.navigator.msPointerEnabled) {
            style.msContentZooming = 'none';
            style.msTouchAction = 'none';
        }
        else if (this.supportsPointerEvents) {
            style.touchAction = 'none';
        }
        /*
         * These events are added first, so that if pointer events are normalized, they are fired
         * in the same order as non-normalized events. ie. pointer event 1st, mouse / touch 2nd
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
        }
        else {
            window.document.addEventListener('mousemove', this.onPointerMove, true);
            this.interactionDOMElement.addEventListener('mousedown', this.onPointerDown, true);
            this.interactionDOMElement.addEventListener('mouseout', this.onPointerOut, true);
            this.interactionDOMElement.addEventListener('mouseover', this.onPointerOver, true);
            window.addEventListener('mouseup', this.onPointerUp, true);
        }
        // always look directly for touch events so that we can provide original data
        // In a future version we should change this to being just a fallback and rely solely on
        // PointerEvents whenever available
        if (this.supportsTouchEvents) {
            this.interactionDOMElement.addEventListener('touchstart', this.onPointerDown, true);
            this.interactionDOMElement.addEventListener('touchcancel', this.onPointerCancel, true);
            this.interactionDOMElement.addEventListener('touchend', this.onPointerUp, true);
            this.interactionDOMElement.addEventListener('touchmove', this.onPointerMove, true);
        }
        this.eventsAdded = true;
    };
    /**
     * Removes all the DOM events that were previously registered
     *
     * @private
     */
    InteractionManager.prototype.removeEvents = function () {
        if (!this.eventsAdded || !this.interactionDOMElement) {
            return;
        }
        var style = this.interactionDOMElement.style;
        if (window.navigator.msPointerEnabled) {
            style.msContentZooming = '';
            style.msTouchAction = '';
        }
        else if (this.supportsPointerEvents) {
            style.touchAction = '';
        }
        if (this.supportsPointerEvents) {
            window.document.removeEventListener('pointermove', this.onPointerMove, true);
            this.interactionDOMElement.removeEventListener('pointerdown', this.onPointerDown, true);
            this.interactionDOMElement.removeEventListener('pointerleave', this.onPointerOut, true);
            this.interactionDOMElement.removeEventListener('pointerover', this.onPointerOver, true);
            window.removeEventListener('pointercancel', this.onPointerCancel, true);
            window.removeEventListener('pointerup', this.onPointerUp, true);
        }
        else {
            window.document.removeEventListener('mousemove', this.onPointerMove, true);
            this.interactionDOMElement.removeEventListener('mousedown', this.onPointerDown, true);
            this.interactionDOMElement.removeEventListener('mouseout', this.onPointerOut, true);
            this.interactionDOMElement.removeEventListener('mouseover', this.onPointerOver, true);
            window.removeEventListener('mouseup', this.onPointerUp, true);
        }
        if (this.supportsTouchEvents) {
            this.interactionDOMElement.removeEventListener('touchstart', this.onPointerDown, true);
            this.interactionDOMElement.removeEventListener('touchcancel', this.onPointerCancel, true);
            this.interactionDOMElement.removeEventListener('touchend', this.onPointerUp, true);
            this.interactionDOMElement.removeEventListener('touchmove', this.onPointerMove, true);
        }
        this.interactionDOMElement = null;
        this.eventsAdded = false;
    };
    /**
     * Updates the state of interactive objects if at least {@link interactionFrequency}
     * milliseconds have passed since the last invocation.
     *
     * Invoked by a throttled ticker update from {@link PIXI.Ticker.system}.
     *
     * @param {number} deltaTime - time delta since the last call
     */
    InteractionManager.prototype.tickerUpdate = function (deltaTime) {
        this._deltaTime += deltaTime;
        if (this._deltaTime < this.interactionFrequency) {
            return;
        }
        this._deltaTime = 0;
        this.update();
    };
    /**
     * Updates the state of interactive objects.
     */
    InteractionManager.prototype.update = function () {
        if (!this.interactionDOMElement) {
            return;
        }
        // if the user move the mouse this check has already been done using the mouse move!
        if (this._didMove) {
            this._didMove = false;
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
                    this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerOverOut, true);
                }
            }
        }
        this.setCursorMode(this.cursor);
    };
    /**
     * Sets the current cursor mode, handling any callbacks or CSS style changes.
     *
     * @param {string} mode - cursor mode, a key from the cursorStyles dictionary
     */
    InteractionManager.prototype.setCursorMode = function (mode) {
        mode = mode || 'default';
        // if the mode didn't actually change, bail early
        if (this.currentCursorMode === mode) {
            return;
        }
        this.currentCursorMode = mode;
        var style = this.cursorStyles[mode];
        // only do things if there is a cursor style for it
        if (style) {
            switch (typeof style) {
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
        else if (typeof mode === 'string' && !Object.prototype.hasOwnProperty.call(this.cursorStyles, mode)) {
            // if it mode is a string (not a Symbol) and cursorStyles doesn't have any entry
            // for the mode, then assume that the dev wants it to be CSS for the cursor.
            this.interactionDOMElement.style.cursor = mode;
        }
    };
    /**
     * Dispatches an event on the display object that was interacted with
     *
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - the display object in question
     * @param {string} eventString - the name of the event (e.g, mousedown)
     * @param {PIXI.InteractionEvent} eventData - the event data object
     * @private
     */
    InteractionManager.prototype.dispatchEvent = function (displayObject, eventString, eventData) {
        // Even if the event was stopped, at least dispatch any remaining events
        // for the same display object.
        if (!eventData.stopPropagationHint || displayObject === eventData.stopsPropagatingAt) {
            eventData.currentTarget = displayObject;
            eventData.type = eventString;
            displayObject.emit(eventString, eventData);
            if (displayObject[eventString]) {
                displayObject[eventString](eventData);
            }
        }
    };
    /**
     * Puts a event on a queue to be dispatched later. This is used to guarantee correct
     * ordering of over/out events.
     *
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - the display object in question
     * @param {string} eventString - the name of the event (e.g, mousedown)
     * @param {object} eventData - the event data object
     * @private
     */
    InteractionManager.prototype.delayDispatchEvent = function (displayObject, eventString, eventData) {
        this.delayedEvents.push({ displayObject: displayObject, eventString: eventString, eventData: eventData });
    };
    /**
     * Maps x and y coords from a DOM object and maps them correctly to the PixiJS view. The
     * resulting value is stored in the point. This takes into account the fact that the DOM
     * element could be scaled and positioned anywhere on the screen.
     *
     * @param  {PIXI.IPointData} point - the point that the result will be stored in
     * @param  {number} x - the x coord of the position to map
     * @param  {number} y - the y coord of the position to map
     */
    InteractionManager.prototype.mapPositionToPoint = function (point, x, y) {
        var rect;
        // IE 11 fix
        if (!this.interactionDOMElement.parentElement) {
            rect = { x: 0, y: 0, width: 0, height: 0 };
        }
        else {
            rect = this.interactionDOMElement.getBoundingClientRect();
        }
        var resolutionMultiplier = 1.0 / this.resolution;
        point.x = ((x - rect.left) * (this.interactionDOMElement.width / rect.width)) * resolutionMultiplier;
        point.y = ((y - rect.top) * (this.interactionDOMElement.height / rect.height)) * resolutionMultiplier;
    };
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
    InteractionManager.prototype.processInteractive = function (interactionEvent, displayObject, func, hitTest) {
        var hit = this.search.findHit(interactionEvent, displayObject, func, hitTest);
        var delayedEvents = this.delayedEvents;
        if (!delayedEvents.length) {
            return hit;
        }
        // Reset the propagation hint, because we start deeper in the tree again.
        interactionEvent.stopPropagationHint = false;
        var delayedLen = delayedEvents.length;
        this.delayedEvents = [];
        for (var i = 0; i < delayedLen; i++) {
            var _a = delayedEvents[i], displayObject_1 = _a.displayObject, eventString = _a.eventString, eventData = _a.eventData;
            // When we reach the object we wanted to stop propagating at,
            // set the propagation hint.
            if (eventData.stopsPropagatingAt === displayObject_1) {
                eventData.stopPropagationHint = true;
            }
            this.dispatchEvent(displayObject_1, eventString, eventData);
        }
        return hit;
    };
    /**
     * Is called when the pointer button is pressed down on the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer button being pressed down
     */
    InteractionManager.prototype.onPointerDown = function (originalEvent) {
        // if we support touch events, then only use those for touch events, not pointer events
        if (this.supportsTouchEvents && originalEvent.pointerType === 'touch')
            { return; }
        var events = this.normalizeToPointerData(originalEvent);
        /*
         * No need to prevent default on natural pointer events, as there are no side effects
         * Normalized events, however, may have the double mousedown/touchstart issue on the native android browser,
         * so still need to be prevented.
         */
        // Guaranteed that there will be at least one event in events, and all events must have the same pointer type
        if (this.autoPreventDefault && events[0].isNormalized) {
            var cancelable = originalEvent.cancelable || !('cancelable' in originalEvent);
            if (cancelable) {
                originalEvent.preventDefault();
            }
        }
        var eventLen = events.length;
        for (var i = 0; i < eventLen; i++) {
            var event = events[i];
            var interactionData = this.getInteractionDataForPointerId(event);
            var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
            interactionEvent.data.originalEvent = originalEvent;
            this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerDown, true);
            this.emit('pointerdown', interactionEvent);
            if (event.pointerType === 'touch') {
                this.emit('touchstart', interactionEvent);
            }
            // emit a mouse event for "pen" pointers, the way a browser would emit a fallback event
            else if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
                var isRightButton = event.button === 2;
                this.emit(isRightButton ? 'rightdown' : 'mousedown', this.eventData);
            }
        }
    };
    /**
     * Processes the result of the pointer down check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    InteractionManager.prototype.processPointerDown = function (interactionEvent, displayObject, hit) {
        var data = interactionEvent.data;
        var id = interactionEvent.data.identifier;
        if (hit) {
            if (!displayObject.trackedPointers[id]) {
                displayObject.trackedPointers[id] = new InteractionTrackingData(id);
            }
            this.dispatchEvent(displayObject, 'pointerdown', interactionEvent);
            if (data.pointerType === 'touch') {
                this.dispatchEvent(displayObject, 'touchstart', interactionEvent);
            }
            else if (data.pointerType === 'mouse' || data.pointerType === 'pen') {
                var isRightButton = data.button === 2;
                if (isRightButton) {
                    displayObject.trackedPointers[id].rightDown = true;
                }
                else {
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
    InteractionManager.prototype.onPointerComplete = function (originalEvent, cancelled, func) {
        var events = this.normalizeToPointerData(originalEvent);
        var eventLen = events.length;
        // if the event wasn't targeting our canvas, then consider it to be pointerupoutside
        // in all cases (unless it was a pointercancel)
        var eventAppend = originalEvent.target !== this.interactionDOMElement ? 'outside' : '';
        for (var i = 0; i < eventLen; i++) {
            var event = events[i];
            var interactionData = this.getInteractionDataForPointerId(event);
            var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
            interactionEvent.data.originalEvent = originalEvent;
            // perform hit testing for events targeting our canvas or cancel events
            this.processInteractive(interactionEvent, this.lastObjectRendered, func, cancelled || !eventAppend);
            this.emit(cancelled ? 'pointercancel' : "pointerup" + eventAppend, interactionEvent);
            if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
                var isRightButton = event.button === 2;
                this.emit(isRightButton ? "rightup" + eventAppend : "mouseup" + eventAppend, interactionEvent);
            }
            else if (event.pointerType === 'touch') {
                this.emit(cancelled ? 'touchcancel' : "touchend" + eventAppend, interactionEvent);
                this.releaseInteractionDataForPointerId(event.pointerId);
            }
        }
    };
    /**
     * Is called when the pointer button is cancelled
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer button being released
     */
    InteractionManager.prototype.onPointerCancel = function (event) {
        // if we support touch events, then only use those for touch events, not pointer events
        if (this.supportsTouchEvents && event.pointerType === 'touch')
            { return; }
        this.onPointerComplete(event, true, this.processPointerCancel);
    };
    /**
     * Processes the result of the pointer cancel check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     */
    InteractionManager.prototype.processPointerCancel = function (interactionEvent, displayObject) {
        var data = interactionEvent.data;
        var id = interactionEvent.data.identifier;
        if (displayObject.trackedPointers[id] !== undefined) {
            delete displayObject.trackedPointers[id];
            this.dispatchEvent(displayObject, 'pointercancel', interactionEvent);
            if (data.pointerType === 'touch') {
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
    InteractionManager.prototype.onPointerUp = function (event) {
        // if we support touch events, then only use those for touch events, not pointer events
        if (this.supportsTouchEvents && event.pointerType === 'touch')
            { return; }
        this.onPointerComplete(event, false, this.processPointerUp);
    };
    /**
     * Processes the result of the pointer up check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    InteractionManager.prototype.processPointerUp = function (interactionEvent, displayObject, hit) {
        var data = interactionEvent.data;
        var id = interactionEvent.data.identifier;
        var trackingData = displayObject.trackedPointers[id];
        var isTouch = data.pointerType === 'touch';
        var isMouse = (data.pointerType === 'mouse' || data.pointerType === 'pen');
        // need to track mouse down status in the mouse block so that we can emit
        // event in a later block
        var isMouseTap = false;
        // Mouse only
        if (isMouse) {
            var isRightButton = data.button === 2;
            var flags = InteractionTrackingData.FLAGS;
            var test = isRightButton ? flags.RIGHT_DOWN : flags.LEFT_DOWN;
            var isDown = trackingData !== undefined && (trackingData.flags & test);
            if (hit) {
                this.dispatchEvent(displayObject, isRightButton ? 'rightup' : 'mouseup', interactionEvent);
                if (isDown) {
                    this.dispatchEvent(displayObject, isRightButton ? 'rightclick' : 'click', interactionEvent);
                    // because we can confirm that the mousedown happened on this object, flag for later emit of pointertap
                    isMouseTap = true;
                }
            }
            else if (isDown) {
                this.dispatchEvent(displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', interactionEvent);
            }
            // update the down state of the tracking data
            if (trackingData) {
                if (isRightButton) {
                    trackingData.rightDown = false;
                }
                else {
                    trackingData.leftDown = false;
                }
            }
        }
        // Pointers and Touches, and Mouse
        if (hit) {
            this.dispatchEvent(displayObject, 'pointerup', interactionEvent);
            if (isTouch)
                { this.dispatchEvent(displayObject, 'touchend', interactionEvent); }
            if (trackingData) {
                // emit pointertap if not a mouse, or if the mouse block decided it was a tap
                if (!isMouse || isMouseTap) {
                    this.dispatchEvent(displayObject, 'pointertap', interactionEvent);
                }
                if (isTouch) {
                    this.dispatchEvent(displayObject, 'tap', interactionEvent);
                    // touches are no longer over (if they ever were) when we get the touchend
                    // so we should ensure that we don't keep pretending that they are
                    trackingData.over = false;
                }
            }
        }
        else if (trackingData) {
            this.dispatchEvent(displayObject, 'pointerupoutside', interactionEvent);
            if (isTouch)
                { this.dispatchEvent(displayObject, 'touchendoutside', interactionEvent); }
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
    InteractionManager.prototype.onPointerMove = function (originalEvent) {
        // if we support touch events, then only use those for touch events, not pointer events
        if (this.supportsTouchEvents && originalEvent.pointerType === 'touch')
            { return; }
        var events = this.normalizeToPointerData(originalEvent);
        if (events[0].pointerType === 'mouse' || events[0].pointerType === 'pen') {
            this._didMove = true;
            this.cursor = null;
        }
        var eventLen = events.length;
        for (var i = 0; i < eventLen; i++) {
            var event = events[i];
            var interactionData = this.getInteractionDataForPointerId(event);
            var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
            interactionEvent.data.originalEvent = originalEvent;
            this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerMove, true);
            this.emit('pointermove', interactionEvent);
            if (event.pointerType === 'touch')
                { this.emit('touchmove', interactionEvent); }
            if (event.pointerType === 'mouse' || event.pointerType === 'pen')
                { this.emit('mousemove', interactionEvent); }
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
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    InteractionManager.prototype.processPointerMove = function (interactionEvent, displayObject, hit) {
        var data = interactionEvent.data;
        var isTouch = data.pointerType === 'touch';
        var isMouse = (data.pointerType === 'mouse' || data.pointerType === 'pen');
        if (isMouse) {
            this.processPointerOverOut(interactionEvent, displayObject, hit);
        }
        if (!this.moveWhenInside || hit) {
            this.dispatchEvent(displayObject, 'pointermove', interactionEvent);
            if (isTouch)
                { this.dispatchEvent(displayObject, 'touchmove', interactionEvent); }
            if (isMouse)
                { this.dispatchEvent(displayObject, 'mousemove', interactionEvent); }
        }
    };
    /**
     * Is called when the pointer is moved out of the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer being moved out
     */
    InteractionManager.prototype.onPointerOut = function (originalEvent) {
        // if we support touch events, then only use those for touch events, not pointer events
        if (this.supportsTouchEvents && originalEvent.pointerType === 'touch')
            { return; }
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
        this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerOverOut, false);
        this.emit('pointerout', interactionEvent);
        if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
            this.emit('mouseout', interactionEvent);
        }
        else {
            // we can get touchleave events after touchend, so we want to make sure we don't
            // introduce memory leaks
            this.releaseInteractionDataForPointerId(interactionData.identifier);
        }
    };
    /**
     * Processes the result of the pointer over/out check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    InteractionManager.prototype.processPointerOverOut = function (interactionEvent, displayObject, hit) {
        var data = interactionEvent.data;
        var id = interactionEvent.data.identifier;
        var isMouse = (data.pointerType === 'mouse' || data.pointerType === 'pen');
        var trackingData = displayObject.trackedPointers[id];
        // if we just moused over the display object, then we need to track that state
        if (hit && !trackingData) {
            trackingData = displayObject.trackedPointers[id] = new InteractionTrackingData(id);
        }
        if (trackingData === undefined)
            { return; }
        if (hit && this.mouseOverRenderer) {
            if (!trackingData.over) {
                trackingData.over = true;
                this.delayDispatchEvent(displayObject, 'pointerover', interactionEvent);
                if (isMouse) {
                    this.delayDispatchEvent(displayObject, 'mouseover', interactionEvent);
                }
            }
            // only change the cursor if it has not already been changed (by something deeper in the
            // display tree)
            if (isMouse && this.cursor === null) {
                this.cursor = displayObject.cursor;
            }
        }
        else if (trackingData.over) {
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
    InteractionManager.prototype.onPointerOver = function (originalEvent) {
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
        if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
            this.emit('mouseover', interactionEvent);
        }
    };
    /**
     * Get InteractionData for a given pointerId. Store that data as well
     *
     * @private
     * @param {PointerEvent} event - Normalized pointer event, output from normalizeToPointerData
     * @return {PIXI.InteractionData} - Interaction data for the given pointer identifier
     */
    InteractionManager.prototype.getInteractionDataForPointerId = function (event) {
        var pointerId = event.pointerId;
        var interactionData;
        if (pointerId === MOUSE_POINTER_ID || event.pointerType === 'mouse') {
            interactionData = this.mouse;
        }
        else if (this.activeInteractionData[pointerId]) {
            interactionData = this.activeInteractionData[pointerId];
        }
        else {
            interactionData = this.interactionDataPool.pop() || new InteractionData();
            interactionData.identifier = pointerId;
            this.activeInteractionData[pointerId] = interactionData;
        }
        // copy properties from the event, so that we can make sure that touch/pointer specific
        // data is available
        interactionData.copyEvent(event);
        return interactionData;
    };
    /**
     * Return unused InteractionData to the pool, for a given pointerId
     *
     * @private
     * @param {number} pointerId - Identifier from a pointer event
     */
    InteractionManager.prototype.releaseInteractionDataForPointerId = function (pointerId) {
        var interactionData = this.activeInteractionData[pointerId];
        if (interactionData) {
            delete this.activeInteractionData[pointerId];
            interactionData.reset();
            this.interactionDataPool.push(interactionData);
        }
    };
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
    InteractionManager.prototype.configureInteractionEventForDOMEvent = function (interactionEvent, pointerEvent, interactionData) {
        interactionEvent.data = interactionData;
        this.mapPositionToPoint(interactionData.global, pointerEvent.clientX, pointerEvent.clientY);
        // Not really sure why this is happening, but it's how a previous version handled things
        if (pointerEvent.pointerType === 'touch') {
            pointerEvent.globalX = interactionData.global.x;
            pointerEvent.globalY = interactionData.global.y;
        }
        interactionData.originalEvent = pointerEvent;
        interactionEvent.reset();
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
    InteractionManager.prototype.normalizeToPointerData = function (event) {
        var normalizedEvents = [];
        if (this.supportsTouchEvents && event instanceof TouchEvent) {
            for (var i = 0, li = event.changedTouches.length; i < li; i++) {
                var touch = event.changedTouches[i];
                if (typeof touch.button === 'undefined')
                    { touch.button = event.touches.length ? 1 : 0; }
                if (typeof touch.buttons === 'undefined')
                    { touch.buttons = event.touches.length ? 1 : 0; }
                if (typeof touch.isPrimary === 'undefined') {
                    touch.isPrimary = event.touches.length === 1 && event.type === 'touchstart';
                }
                if (typeof touch.width === 'undefined')
                    { touch.width = touch.radiusX || 1; }
                if (typeof touch.height === 'undefined')
                    { touch.height = touch.radiusY || 1; }
                if (typeof touch.tiltX === 'undefined')
                    { touch.tiltX = 0; }
                if (typeof touch.tiltY === 'undefined')
                    { touch.tiltY = 0; }
                if (typeof touch.pointerType === 'undefined')
                    { touch.pointerType = 'touch'; }
                if (typeof touch.pointerId === 'undefined')
                    { touch.pointerId = touch.identifier || 0; }
                if (typeof touch.pressure === 'undefined')
                    { touch.pressure = touch.force || 0.5; }
                if (typeof touch.twist === 'undefined')
                    { touch.twist = 0; }
                if (typeof touch.tangentialPressure === 'undefined')
                    { touch.tangentialPressure = 0; }
                // TODO: Remove these, as layerX/Y is not a standard, is deprecated, has uneven
                // support, and the fill ins are not quite the same
                // offsetX/Y might be okay, but is not the same as clientX/Y when the canvas's top
                // left is not 0,0 on the page
                if (typeof touch.layerX === 'undefined')
                    { touch.layerX = touch.offsetX = touch.clientX; }
                if (typeof touch.layerY === 'undefined')
                    { touch.layerY = touch.offsetY = touch.clientY; }
                // mark the touch as normalized, just so that we know we did it
                touch.isNormalized = true;
                normalizedEvents.push(touch);
            }
        }
        // apparently PointerEvent subclasses MouseEvent, so yay
        else if (event instanceof MouseEvent && (!this.supportsPointerEvents || !(event instanceof window.PointerEvent))) {
            var tempEvent = event;
            if (typeof tempEvent.isPrimary === 'undefined')
                { tempEvent.isPrimary = true; }
            if (typeof tempEvent.width === 'undefined')
                { tempEvent.width = 1; }
            if (typeof tempEvent.height === 'undefined')
                { tempEvent.height = 1; }
            if (typeof tempEvent.tiltX === 'undefined')
                { tempEvent.tiltX = 0; }
            if (typeof tempEvent.tiltY === 'undefined')
                { tempEvent.tiltY = 0; }
            if (typeof tempEvent.pointerType === 'undefined')
                { tempEvent.pointerType = 'mouse'; }
            if (typeof tempEvent.pointerId === 'undefined')
                { tempEvent.pointerId = MOUSE_POINTER_ID; }
            if (typeof tempEvent.pressure === 'undefined')
                { tempEvent.pressure = 0.5; }
            if (typeof tempEvent.twist === 'undefined')
                { tempEvent.twist = 0; }
            if (typeof tempEvent.tangentialPressure === 'undefined')
                { tempEvent.tangentialPressure = 0; }
            // mark the mouse event as normalized, just so that we know we did it
            tempEvent.isNormalized = true;
            normalizedEvents.push(tempEvent);
        }
        else {
            normalizedEvents.push(event);
        }
        return normalizedEvents;
    };
    /**
     * Destroys the interaction manager
     *
     */
    InteractionManager.prototype.destroy = function () {
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
    };
    return InteractionManager;
}(EventEmitter));

export { InteractionData, InteractionEvent, InteractionManager, InteractionTrackingData, interactiveTarget };
//# sourceMappingURL=interaction.es.js.map
