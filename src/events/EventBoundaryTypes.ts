import type { Container } from '../scene/container/Container';

/**
 * The tracking data for each pointer held in the state of an {@link EventBoundary}.
 *
 * ```ts
 * pressTargetsByButton: {
 *     [id: number]: Container[];
 * };
 * clicksByButton: {
 *     [id: number]: {
 *         clickCount: number;
 *         target: Container;
 *         timeStamp: number;
 *     };
 * };
 * overTargets: Container[];
 * ```
 * @typedef {object} TrackingData
 * @property {Record.<number, Container>} pressTargetsByButton - The pressed containers'
 *  propagation paths by each button of the pointer.
 * @property {Record.<number, object>} clicksByButton - Holds clicking data for each button of the pointer.
 * @property {Container[]} overTargets - The Container propagation path over which the pointer is hovering.
 * @category events
 * @internal
 */
export type TrackingData = {
    pressTargetsByButton: {
        [id: number]: Container[];
    };
    clicksByButton: {
        [id: number]: {
            clickCount: number;
            target: Container;
            timeStamp: number;
        }
    };
    overTargets: Container[];
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
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#mousedown
 * @param {FederatedPointerEvent} event - The mousedown event.
 */

/**
 * Capture phase equivalent of `mousedown`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#mousedowncapture
 * @param {FederatedPointerEvent} event - The capture phase mousedown.
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
 * on the container. Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#rightdown
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `rightdown`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#rightdowncapture
 * @param {FederatedPointerEvent} event - The rightdowncapture event.
 */

/**
 * Fired when a pointer device button (usually a mouse left-button) is released over the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#mouseup
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `mouseup`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#mouseupcapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is released
 * over the container. Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#rightup
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `rightup`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#rightupcapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
 * the container. Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * A `click` event fires after the `pointerdown` and `pointerup` events, in that
 * order. If the mouse is moved over another Container after the `pointerdown` event, the
 * `click` event is fired on the most specific common ancestor of the two target Containers.
 *
 * The `detail` property of the event is the number of clicks that occurred within a 200ms
 * window of each other upto the current click. For example, it will be `2` for a double click.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#click
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `click`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#clickcapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
 * and released on the container. Container's `eventMode`
 * property must be set to `static` or 'dynamic' to fire event.
 *
 * This event follows the semantics of `click`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#rightclick
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `rightclick`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#rightclickcapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button (usually a mouse left-button) is released outside the
 * container that initially registered a
 * [mousedown]{@link Container#event:mousedown}.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * This event is specific to the Federated Events API. It does not have a capture phase, unlike most of the
 * other events. It only bubbles to the most specific ancestor of the targets of the corresponding `pointerdown`
 * and `pointerup` events, i.e. the target of the `click` event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#mouseupoutside
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `mouseupoutside`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#mouseupoutsidecapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is released
 * outside the container that initially registered a
 * [rightdown]{@link Container#event:rightdown}.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#rightupoutside
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `rightupoutside`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#rightupoutsidecapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved globally over the scene.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#globalmousemove
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved while over the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#mousemove
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `mousemove`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#mousemovecapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved onto the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#mouseover
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `mouseover`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#mouseovercapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when the mouse pointer is moved over a Container and its descendant's hit testing boundaries.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#mouseenter
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `mouseenter`
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#mouseentercapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved off the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * This may be fired on a Container that was removed from the scene graph immediately after
 * a `mouseover` event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#mouseout
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `mouseout`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#mouseoutcapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when the mouse pointer exits a Container and its descendants.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#mouseleave
 * @param {FederatedPointerEvent} event
 */

/**
 * Capture phase equivalent of `mouseleave`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#mouseleavecapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is pressed on the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointerdown
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `pointerdown`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointerdowncapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is released over the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointerup
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `pointerup`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointerupcapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when the operating system cancels a pointer event.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointercancel
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `pointercancel`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointercancelcapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is pressed and released on the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointertap
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `pointertap`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointertapcapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is released outside the container that initially
 * registered a [pointerdown]{@link Container#event:pointerdown}.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * This event is specific to the Federated Events API. It does not have a capture phase, unlike most of the
 * other events. It only bubbles to the most specific ancestor of the targets of the corresponding `pointerdown`
 * and `pointerup` events, i.e. the target of the `click` event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointerupoutside
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `pointerupoutside`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointerupoutsidecapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved globally over the scene.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#globalpointermove
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved while over the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointermove
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `pointermove`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointermovecapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved onto the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointerover
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `pointerover`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointerovercapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when the pointer is moved over a Container and its descendant's hit testing boundaries.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointerenter
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `pointerenter`
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointerentercapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved off the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointerout
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `pointerout`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointeroutcapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when the pointer leaves the hit testing boundaries of a Container and its descendants.
 *
 * This event notifies only the target and does not bubble.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointerleave
 * @param {FederatedPointerEvent} event - The `pointerleave` event.
 */

/**
 * Capture phase equivalent of `pointerleave`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#pointerleavecapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is placed on the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#touchstart
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `touchstart`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#touchstartcapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is removed from the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#touchend
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `touchend`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#touchendcapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when the operating system cancels a touch.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#touchcancel
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `touchcancel`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#touchcancelcapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is placed and removed from the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#tap
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `tap`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#tapcapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is removed outside of the container that initially
 * registered a [touchstart]{@link Container#event:touchstart}.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#touchendoutside
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `touchendoutside`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#touchendoutsidecapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is moved globally over the scene.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#globaltouchmove
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is moved along the container.
 * Container's `eventMode` property must be set to `static` or 'dynamic' to fire event.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#touchmove
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of `touchmove`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#touchmovecapture
 * @param {FederatedPointerEvent} event - Event
 */

/**
 * Fired when a the user scrolls with the mouse cursor over a Container.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#wheel
 * @type {FederatedWheelEvent}
 */

/**
 * Capture phase equivalent of `wheel`.
 *
 * These events are propagating from the {@link EventSystem EventSystem}.
 * @event Container#wheelcapture
 * @type {FederatedWheelEvent}
 */
