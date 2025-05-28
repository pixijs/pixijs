import { Point } from '../maths/point/Point';

import type { Container } from '../scene/container/Container';
import type { EventBoundary } from './EventBoundary';

/**
 * A PixiJS compatible `Touch` event.
 * @category events
 * @standard
 */
export interface PixiTouch extends Touch
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
    type: string;
}

/**
 * An DOM-compatible synthetic event implementation that is "forwarded" on behalf of an original
 * FederatedEvent or native {@link https://dom.spec.whatwg.org/#event Event}.
 * @typeParam N - The type of native event held.
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
     * @ingnore
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

    /** Prevent default behavior of PixiJS and the user agent. */
    public preventDefault(): void
    {
        if (this.nativeEvent instanceof Event && this.nativeEvent.cancelable)
        {
            this.nativeEvent.preventDefault();
        }

        this.defaultPrevented = true;
    }

    /**
     * Stop this event from propagating to any addition listeners, including on the
     * {@link FederatedEvent.currentTarget} and also the following
     * event targets on the propagation path.
     */
    public stopImmediatePropagation(): void
    {
        this.propagationImmediatelyStopped = true;
    }

    /**
     * Stop this event from propagating to the next {@link FederatedEvent}. The rest of the listeners
     * on the {@link FederatedEvent.currentTarget} will still be notified.
     */
    public stopPropagation(): void
    {
        this.propagationStopped = true;
    }

    /**
     * The event propagation phase NONE that indicates that the event is not in any phase.
     * @constant
     * @default 0
     * @advanced
     */
    public readonly NONE = 0;
    /**
     * The event propagation phase CAPTURING_PHASE that indicates that the event is in the capturing phase.
     * @constant
     * @default 1
     * @advanced
     */
    public readonly CAPTURING_PHASE = 1;
    /**
     * The event propagation phase AT_TARGET that indicates that the event is at the target.
     * @constant
     * @default 2
     * @advanced
     */
    public readonly AT_TARGET = 2;
    /**
     * The event propagation phase BUBBLING_PHASE that indicates that the event is in the bubbling phase.
     * @constant
     * @default 3
     * @advanced
     */
    public readonly BUBBLING_PHASE = 3;
}
