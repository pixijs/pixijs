import type { FederatedEventTarget } from './FederatedEventTarget';

/**
 * The tracking data for each pointer held in the state of an {@link PIXI.EventBoundary}.
 *
 * ```ts
 * pressTargetsByButton: {
 *     [id: number]: FederatedEventTarget[];
 * };
 * clicksByButton: {
 *     [id: number]: {
 *         clickCount: number;
 *         target: FederatedEventTarget;
 *         timeStamp: number;
 *     };
 * };
 * overTargets: FederatedEventTarget[];
 * ```
 * @typedef {object} TrackingData
 * @property {Record.<number, PIXI.FederatedEventTarget>} pressTargetsByButton - The pressed display objects'
 *  propagation paths by each button of the pointer.
 * @property {Record.<number, object>} clicksByButton - Holds clicking data for each button of the pointer.
 * @property {PIXI.DisplayObject[]} overTargets - The DisplayObject propagation path over which the pointer is hovering.
 * @memberof PIXI
 */
export type TrackingData = {
    pressTargetsByButton: {
        [id: number]: FederatedEventTarget[];
    };
    clicksByButton: {
        [id: number]: {
            clickCount: number;
            target: FederatedEventTarget;
            timeStamp: number;
        }
    };
    overTargets: FederatedEventTarget[];
};

/**
 * Internal storage of an event listener in EventEmitter.
 * @ignore
 */
type EmitterListener = { fn(...args: any[]): any, context: any, once: boolean };

/**
 * Internal storage of event listeners in EventEmitter.
 * @ignore
 */
export type EmitterListeners = Record<string, EmitterListener | EmitterListener[]>;

/**
 * Fired when a mouse button (usually a mouse left-button) is pressed on the display.
 * object. DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#mousedown
 * @param {PIXI.FederatedPointerEvent} event - The mousedown event.
 */

/**
 * Capture phase equivalent of {@code mousedown}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#mousedowncapture
 * @param {PIXI.FederatedPointerEvent} event - The capture phase mousedown.
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
 * on the display object. DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#rightdown
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code rightdown}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#rightdowncapture
 * @param {PIXI.FederatedPointerEvent} event - The rightdowncapture event.
 */

/**
 * Fired when a pointer device button (usually a mouse left-button) is released over the display
 * object. DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#mouseup
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseup}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#mouseupcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is released
 * over the display object. DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#rightup
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code rightup}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#rightupcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
 * the display object. DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * A {@code click} event fires after the {@code pointerdown} and {@code pointerup} events, in that
 * order. If the mouse is moved over another DisplayObject after the {@code pointerdown} event, the
 * {@code click} event is fired on the most specific common ancestor of the two target DisplayObjects.
 *
 * The {@code detail} property of the event is the number of clicks that occurred within a 200ms
 * window of each other upto the current click. For example, it will be {@code 2} for a double click.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#click
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code click}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#clickcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
 * and released on the display object. DisplayObject's `eventMode`
 * property must be set to `static` or 'dynamic' to fire event.
 *
 * This event follows the semantics of {@code click}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#rightclick
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code rightclick}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#rightclickcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button (usually a mouse left-button) is released outside the
 * display object that initially registered a
 * [mousedown]{@link PIXI.DisplayObject#event:mousedown}.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * This event is specific to the Federated Events API. It does not have a capture phase, unlike most of the
 * other events. It only bubbles to the most specific ancestor of the targets of the corresponding {@code pointerdown}
 * and {@code pointerup} events, i.e. the target of the {@code click} event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#mouseupoutside
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseupoutside}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#mouseupoutsidecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is released
 * outside the display object that initially registered a
 * [rightdown]{@link PIXI.DisplayObject#event:rightdown}.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#rightupoutside
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code rightupoutside}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#rightupoutsidecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved globally over the scene.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#globalmousemove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved while over the display object.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#mousemove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mousemove}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#mousemovecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved onto the display object.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#mouseover
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseover}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#mouseovercapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the mouse pointer is moved over a DisplayObject and its descendant's hit testing boundaries.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#mouseenter
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseenter}
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#mouseentercapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved off the display object.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * This may be fired on a DisplayObject that was removed from the scene graph immediately after
 * a {@code mouseover} event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#mouseout
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseout}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#mouseoutcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the mouse pointer exits a DisplayObject and its descendants.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#mouseleave
 * @param {PIXI.FederatedPointerEvent} event
 */

/**
 * Capture phase equivalent of {@code mouseleave}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#mouseleavecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is pressed on the display object.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointerdown
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerdown}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointerdowncapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is released over the display object.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointerup
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerup}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointerupcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the operating system cancels a pointer event.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointercancel
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointercancel}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointercancelcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is pressed and released on the display object.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointertap
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointertap}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointertapcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is released outside the display object that initially
 * registered a [pointerdown]{@link PIXI.DisplayObject#event:pointerdown}.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * This event is specific to the Federated Events API. It does not have a capture phase, unlike most of the
 * other events. It only bubbles to the most specific ancestor of the targets of the corresponding {@code pointerdown}
 * and {@code pointerup} events, i.e. the target of the {@code click} event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointerupoutside
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerupoutside}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointerupoutsidecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved globally over the scene.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#globalpointermove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved while over the display object.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointermove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointermove}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointermovecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved onto the display object.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointerover
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerover}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointerovercapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the pointer is moved over a DisplayObject and its descendant's hit testing boundaries.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointerenter
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerenter}
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointerentercapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved off the display object.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointerout
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerout}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointeroutcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the pointer leaves the hit testing boundaries of a DisplayObject and its descendants.
 *
 * This event notifies only the target and does not bubble.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointerleave
 * @param {PIXI.FederatedPointerEvent} event - The `pointerleave` event.
 */

/**
 * Capture phase equivalent of {@code pointerleave}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#pointerleavecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is placed on the display object.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#touchstart
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchstart}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#touchstartcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is removed from the display object.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#touchend
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchend}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#touchendcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the operating system cancels a touch.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#touchcancel
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchcancel}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#touchcancelcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is placed and removed from the display object.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#tap
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code tap}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#tapcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is removed outside of the display object that initially
 * registered a [touchstart]{@link PIXI.DisplayObject#event:touchstart}.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#touchendoutside
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchendoutside}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#touchendoutsidecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is moved globally over the scene.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#globaltouchmove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is moved along the display object.
 * DisplayObject's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#touchmove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchmove}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#touchmovecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a the user scrolls with the mouse cursor over a DisplayObject.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#wheel
 * @type {PIXI.FederatedWheelEvent}
 */

/**
 * Capture phase equivalent of {@code wheel}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.DisplayObject#wheelcapture
 * @type {PIXI.FederatedWheelEvent}
 */
