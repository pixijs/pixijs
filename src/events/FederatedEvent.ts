import { Point } from '../maths/point/Point';

import type { Container } from '../scene/container/Container';
import type { EventBoundary } from './EventBoundary';

/**
 * A PixiJS compatible touch event interface that extends the standard DOM Touch interface.
 * Provides additional properties to normalize touch input with mouse/pointer events.
 * @example
 * ```ts
 * // Access touch information
 * sprite.on('touchstart', (event) => {
 *     // Standard touch properties
 *     console.log('Touch position:', event.clientX, event.clientY);
 *     console.log('Touch ID:', event.pointerId);
 *
 *     // Additional PixiJS properties
 *     console.log('Pressure:', event.pressure);
 *     console.log('Size:', event.width, event.height);
 *     console.log('Tilt:', event.tiltX, event.tiltY);
 * });
 * ```
 * @category events
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Touch} DOM Touch Interface
 * @standard
 */
export interface PixiTouch extends Touch
{
    /** The button being pressed (0: left, 1: middle, 2: right) */
    button: number;

    /** Bitmap of currently pressed buttons */
    buttons: number;

    /** Whether this is the primary touch point */
    isPrimary: boolean;

    /** The width of the touch contact area */
    width: number;

    /** The height of the touch contact area */
    height: number;

    /** The angle of tilt along the x-axis (in degrees) */
    tiltX: number;

    /** The angle of tilt along the y-axis (in degrees) */
    tiltY: number;

    /** The type of pointer that triggered this event */
    pointerType: string;

    /** Unique identifier for this touch point */
    pointerId: number;

    /** The normalized pressure of the pointer (0 to 1) */
    pressure: number;

    /** The rotation angle of the pointer (e.g., pen) */
    twist: number;

    /** The normalized tangential pressure of the pointer */
    tangentialPressure: number;

    /** The x coordinate relative to the current layer */
    layerX: number;

    /** The y coordinate relative to the current layer */
    layerY: number;

    /** The x coordinate relative to the target's offset parent */
    offsetX: number;

    /** The y coordinate relative to the target's offset parent */
    offsetY: number;

    /** Whether the event was normalized by PixiJS */
    isNormalized: boolean;

    /** The type of touch event */
    type: string;
}

/**
 * A DOM-compatible synthetic event implementation for PixiJS's event system.
 * This class implements the standard DOM Event interface while providing additional
 * functionality specific to PixiJS events.
 * > [!NOTE] You wont receive an instance of this class directly, but rather a subclass
 * > of this class, such as {@link FederatedPointerEvent}, {@link FederatedMouseEvent}, or
 * > {@link FederatedWheelEvent}. This class is the base for all federated events.
 * @example
 * ```ts
 * // Basic event handling
 * sprite.on('pointerdown', (event: FederatedEvent) => {
 *     // Access standard DOM event properties
 *     console.log('Target:', event.target);
 *     console.log('Phase:', event.eventPhase);
 *     console.log('Type:', event.type);
 *
 *     // Control propagation
 *     event.stopPropagation();
 * });
 * ```
 * @typeParam N - The type of native event held. Can be either a UIEvent or PixiTouch.
 * @remarks
 * - Implements the standard DOM UIEvent interface
 * - Provides event bubbling and capturing phases
 * - Supports propagation control
 * - Manages event paths through display tree
 * - Normalizes native browser events
 * @see {@link https://dom.spec.whatwg.org/#event} DOM Event Specification
 * @see {@link FederatedPointerEvent} For pointer-specific events
 * @see {@link FederatedMouseEvent} For mouse-specific events
 * @see {@link FederatedWheelEvent} For wheel-specific events
 * @category events
 * @standard
 */
export class FederatedEvent<N extends UIEvent | PixiTouch = UIEvent | PixiTouch> implements UIEvent
{
    /** Flags whether this event bubbles. This will take effect only if it is set before propagation. */
    public bubbles = true;

    /** @deprecated since 7.0.0 */
    public cancelBubble = true;

    /**
     * Flags whether this event can be canceled using {@link FederatedEvent.preventDefault}. This is always
     * false (for now).
     */
    public readonly cancelable = false;

    /**
     * Flag added for compatibility with DOM `Event`. It is not used in the Federated Events
     * API.
     * @see https://dom.spec.whatwg.org/#dom-event-composed
     * @ignore
     */
    public readonly composed = false;

    /** The listeners of the event target that are being notified. */
    public currentTarget: Container;

    /** Flags whether the default response of the user agent was prevent through this event. */
    public defaultPrevented = false;

    /**
     * The propagation phase.
     * @default {@link FederatedEvent.NONE}
     */
    public eventPhase = FederatedEvent.prototype.NONE;

    /** Flags whether this is a user-trusted event */
    public isTrusted: boolean;

    /** @deprecated since 7.0.0 */
    public returnValue: boolean;

    /** @deprecated since 7.0.0 */
    public srcElement: EventTarget;

    /** The event target that this will be dispatched to. */
    public target: Container;

    /** The timestamp of when the event was created. */
    public timeStamp: number;

    /** The type of event, e.g. `"mouseup"`. */
    public type: string;

    /** The native event that caused the foremost original event. */
    public nativeEvent: N;

    /** The original event that caused this event, if any. */
    public originalEvent: FederatedEvent<N>;

    /** Flags whether propagation was stopped. */
    public propagationStopped = false;

    /** Flags whether propagation was immediately stopped. */
    public propagationImmediatelyStopped = false;

    /** The composed path of the event's propagation. The `target` is at the end. */
    public path: Container[];

    /** The {@link EventBoundary} that manages this event. Null for root events. */
    public readonly manager: EventBoundary;

    /** Event-specific detail */
    public detail: number;

    /** The global Window object. */
    public view: WindowProxy;

    /**
     * Not supported.
     * @deprecated since 7.0.0
     * @ignore
     */
    public which: number;

    /** The coordinates of the event relative to the nearest DOM layer. This is a non-standard property. */
    public layer: Point = new Point();

    /** @readonly */
    get layerX(): number { return this.layer.x; }

    /** @readonly */
    get layerY(): number { return this.layer.y; }

    /** The coordinates of the event relative to the DOM document. This is a non-standard property. */
    public page: Point = new Point();

    /** @readonly */
    get pageX(): number { return this.page.x; }

    /** @readonly */
    get pageY(): number { return this.page.y; }

    /**
     * @param manager - The event boundary which manages this event. Propagation can only occur
     *  within the boundary's jurisdiction.
     */
    constructor(manager: EventBoundary)
    {
        this.manager = manager;
    }

    /**
     * Fallback for the deprecated `InteractionEvent.data`.
     * @deprecated since 7.0.0
     */
    get data(): this
    {
        return this;
    }

    /**
     * The propagation path for this event. Alias for {@link EventBoundary.propagationPath}.
     * @advanced
     */
    public composedPath(): Container[]
    {
        // Find the propagation path if it isn't cached or if the target has changed since since
        // the last evaluation.
        if (this.manager && (!this.path || this.path[this.path.length - 1] !== this.target))
        {
            this.path = this.target ? this.manager.propagationPath(this.target) : [];
        }

        return this.path;
    }

    /**
     * Unimplemented method included for implementing the DOM interface `Event`. It will throw an `Error`.
     * @deprecated
     * @ignore
     * @param _type
     * @param _bubbles
     * @param _cancelable
     */
    public initEvent(_type: string, _bubbles?: boolean, _cancelable?: boolean): void
    {
        throw new Error('initEvent() is a legacy DOM API. It is not implemented in the Federated Events API.');
    }

    /**
     * Unimplemented method included for implementing the DOM interface `UIEvent`. It will throw an `Error`.
     * @ignore
     * @deprecated
     * @param _typeArg
     * @param _bubblesArg
     * @param _cancelableArg
     * @param _viewArg
     * @param _detailArg
     */
    public initUIEvent(_typeArg: string, _bubblesArg?: boolean, _cancelableArg?: boolean, _viewArg?: Window | null,
        _detailArg?: number): void
    {
        throw new Error('initUIEvent() is a legacy DOM API. It is not implemented in the Federated Events API.');
    }

    /**
     * Prevent default behavior of both PixiJS and the user agent.
     * @example
     * ```ts
     * sprite.on('click', (event) => {
     *     // Prevent both browser's default click behavior
     *     // and PixiJS's default handling
     *     event.preventDefault();
     *
     *     // Custom handling
     *     customClickHandler();
     * });
     * ```
     * @remarks
     * - Only works if the native event is cancelable
     * - Does not stop event propagation
     */
    public preventDefault(): void
    {
        if (this.nativeEvent instanceof Event && this.nativeEvent.cancelable)
        {
            this.nativeEvent.preventDefault();
        }

        this.defaultPrevented = true;
    }

    /**
     * Stop this event from propagating to any additional listeners, including those
     * on the current target and any following targets in the propagation path.
     * @example
     * ```ts
     * container.on('pointerdown', (event) => {
     *     // Stop all further event handling
     *     event.stopImmediatePropagation();
     *
     *     // These handlers won't be called:
     *     // - Other pointerdown listeners on this container
     *     // - Any pointerdown listeners on parent containers
     * });
     * ```
     * @remarks
     * - Immediately stops all event propagation
     * - Prevents other listeners on same target from being called
     * - More aggressive than stopPropagation()
     */
    public stopImmediatePropagation(): void
    {
        this.propagationImmediatelyStopped = true;
    }

    /**
     * Stop this event from propagating to the next target in the propagation path.
     * The rest of the listeners on the current target will still be notified.
     * @example
     * ```ts
     * child.on('pointermove', (event) => {
     *     // Handle event on child
     *     updateChild();
     *
     *     // Prevent parent handlers from being called
     *     event.stopPropagation();
     * });
     *
     * // This won't be called if child handles the event
     * parent.on('pointermove', (event) => {
     *     updateParent();
     * });
     * ```
     * @remarks
     * - Stops event bubbling to parent containers
     * - Does not prevent other listeners on same target
     * - Less aggressive than stopImmediatePropagation()
     */
    public stopPropagation(): void
    {
        this.propagationStopped = true;
    }

    /**
     * The event propagation phase NONE that indicates that the event is not in any phase.
     * @default 0
     * @advanced
     */
    public readonly NONE = 0;
    /**
     * The event propagation phase CAPTURING_PHASE that indicates that the event is in the capturing phase.
     * @default 1
     * @advanced
     */
    public readonly CAPTURING_PHASE = 1;
    /**
     * The event propagation phase AT_TARGET that indicates that the event is at the target.
     * @default 2
     * @advanced
     */
    public readonly AT_TARGET = 2;
    /**
     * The event propagation phase BUBBLING_PHASE that indicates that the event is in the bubbling phase.
     * @default 3
     * @advanced
     */
    public readonly BUBBLING_PHASE = 3;
}
