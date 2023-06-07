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
 * @property {Record.<number, PIXI.FederatedEventTarget>} pressTargetsByButton - The pressed containers'
 *  propagation paths by each button of the pointer.
 * @property {Record.<number, object>} clicksByButton - Holds clicking data for each button of the pointer.
 * @property {PIXI.Container[]} overTargets - The Container propagation path over which the pointer is hovering.
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
 * Fired when a mouse button (usually a mouse left-button) is pressed on the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#mousedown
 * @param {PIXI.FederatedPointerEvent} event - The mousedown event.
 */

/**
 * Capture phase equivalent of {@code mousedown}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#mousedowncapture
 * @param {PIXI.FederatedPointerEvent} event - The capture phase mousedown.
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
 * on the container. Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#rightdown
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code rightdown}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#rightdowncapture
 * @param {PIXI.FederatedPointerEvent} event - The rightdowncapture event.
 */

/**
 * Fired when a pointer device button (usually a mouse left-button) is released over the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#mouseup
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseup}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#mouseupcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is released
 * over the container. Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#rightup
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code rightup}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#rightupcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
 * the container. Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * A {@code click} event fires after the {@code pointerdown} and {@code pointerup} events, in that
 * order. If the mouse is moved over another Container after the {@code pointerdown} event, the
 * {@code click} event is fired on the most specific common ancestor of the two target Containers.
 *
 * The {@code detail} property of the event is the number of clicks that occurred within a 200ms
 * window of each other upto the current click. For example, it will be {@code 2} for a double click.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#click
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code click}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#clickcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
 * and released on the container. Container's `eventMode`
 * property must be set to `static` or 'dynamic' to fire event.
 *
 * This event follows the semantics of {@code click}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#rightclick
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code rightclick}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#rightclickcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button (usually a mouse left-button) is released outside the
 * container that initially registered a
 * [mousedown]{@link PIXI.Container#event:mousedown}.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * This event is specific to the Federated Events API. It does not have a capture phase, unlike most of the
 * other events. It only bubbles to the most specific ancestor of the targets of the corresponding {@code pointerdown}
 * and {@code pointerup} events, i.e. the target of the {@code click} event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#mouseupoutside
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseupoutside}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#mouseupoutsidecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is released
 * outside the container that initially registered a
 * [rightdown]{@link PIXI.Container#event:rightdown}.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#rightupoutside
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code rightupoutside}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#rightupoutsidecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved globally over the scene.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#globalmousemove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved while over the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#mousemove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mousemove}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#mousemovecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved onto the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#mouseover
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseover}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#mouseovercapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the mouse pointer is moved over a Container and its descendant's hit testing boundaries.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#mouseenter
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseenter}
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#mouseentercapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved off the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * This may be fired on a Container that was removed from the scene graph immediately after
 * a {@code mouseover} event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#mouseout
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseout}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#mouseoutcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the mouse pointer exits a Container and its descendants.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#mouseleave
 * @param {PIXI.FederatedPointerEvent} event
 */

/**
 * Capture phase equivalent of {@code mouseleave}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#mouseleavecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is pressed on the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointerdown
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerdown}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointerdowncapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is released over the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointerup
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerup}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointerupcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the operating system cancels a pointer event.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointercancel
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointercancel}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointercancelcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is pressed and released on the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointertap
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointertap}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointertapcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is released outside the container that initially
 * registered a [pointerdown]{@link PIXI.Container#event:pointerdown}.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * This event is specific to the Federated Events API. It does not have a capture phase, unlike most of the
 * other events. It only bubbles to the most specific ancestor of the targets of the corresponding {@code pointerdown}
 * and {@code pointerup} events, i.e. the target of the {@code click} event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointerupoutside
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerupoutside}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointerupoutsidecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved globally over the scene.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#globalpointermove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved while over the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointermove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointermove}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointermovecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved onto the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointerover
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerover}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointerovercapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the pointer is moved over a Container and its descendant's hit testing boundaries.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointerenter
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerenter}
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointerentercapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved off the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointerout
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerout}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointeroutcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the pointer leaves the hit testing boundaries of a Container and its descendants.
 *
 * This event notifies only the target and does not bubble.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointerleave
 * @param {PIXI.FederatedPointerEvent} event - The `pointerleave` event.
 */

/**
 * Capture phase equivalent of {@code pointerleave}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#pointerleavecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is placed on the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#touchstart
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchstart}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#touchstartcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is removed from the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#touchend
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchend}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#touchendcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the operating system cancels a touch.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#touchcancel
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchcancel}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#touchcancelcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is placed and removed from the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#tap
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code tap}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#tapcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is removed outside of the container that initially
 * registered a [touchstart]{@link PIXI.Container#event:touchstart}.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#touchendoutside
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchendoutside}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#touchendoutsidecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is moved globally over the scene.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#globaltouchmove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is moved along the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#touchmove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchmove}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#touchmovecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a the user scrolls with the mouse cursor over a Container.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#wheel
 * @type {PIXI.FederatedWheelEvent}
 */

/**
 * Capture phase equivalent of {@code wheel}.
 *
 * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
 * @event PIXI.Container#wheelcapture
 * @type {PIXI.FederatedWheelEvent}
 */
