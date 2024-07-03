import { Point } from '../maths/point/Point';

import type { PointData } from '../maths/point/PointData';
import type { Container } from '../scene/container/Container';

export class InputEvent
{
    /** The native event that caused the foremost original event. */
    public nativeEvent: PointerEvent;

    /** The original event that caused this event, if any. */
    public originalEvent: InputEvent;

    /** Event-specific detail */
    public detail: number;

    /** The event target that this will be dispatched to. */
    public target: Container;

    /** The listeners of the event target that are being notified. */
    public currentTarget: Container;

    /** The composed path of the event's propagation. The {@code target} is at the start. */
    public path: Container[];

    public get composedPath(): Container[]
    {
        if (!this.path)
        {
            return [];
        }
        const arr = [];

        for (let i = this.path.length - 1; i >= 0; --i)
        {
            arr.push(this.path[i]);
        }

        return arr;
    }

    /**
     * The unique identifier of the pointer.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerId}
     */
    public pointerId: number;

    /**
     * The width of the pointer's contact along the x-axis, measured in CSS pixels.
     * radiusX of TouchEvents will be represented by this value.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/width
     */
    public width = 0;

    /**
     * The height of the pointer's contact along the y-axis, measured in CSS pixels.
     * radiusY of TouchEvents will be represented by this value.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/height
     */
    public height = 0;

    /**
     * Indicates whether or not the pointer device that created the event is the primary pointer.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/isPrimary
     */
    public isPrimary = false;

    /**
     * The type of pointer that triggered the event.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType
     */
    public pointerType: string;

    /**
     * Pressure applied by the pointing device during the event.
     * s
     * A Touch's force property will be represented by this value.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure
     */
    public pressure: number;

    /**
     * Barrel pressure on a stylus pointer.
     * @see https://w3c.github.io/pointerevents/#pointerevent-interface
     */
    public tangentialPressure: number;

    /**
     * The angle, in degrees, between the pointer device and the screen.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltX
     */
    public tiltX: number;

    /**
     * The angle, in degrees, between the pointer device and the screen.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltY
     */
    public tiltY: number;

    /**
     * Twist of a stylus pointer.
     * @see https://w3c.github.io/pointerevents/#pointerevent-interface
     */
    public twist: number;

    /** Flags whether this is a user-trusted event */
    public isTrusted: boolean;

    /** @deprecated since 7.0.0 */
    public srcElement: EventTarget;

    /** The timestamp of when the event was created. */
    public timeStamp: number;

    /** The type of event, e.g. {@code "mouseup"}. */
    public type: string;

    /** Whether the "alt" key was pressed when this mouse event occurred. */
    public altKey: boolean;

    /** The specific button that was pressed in this mouse event. */
    public button: number;

    /** The button depressed when this event occurred. */
    public buttons: number;

    /** Whether the "control" key was pressed when this mouse event occurred. */
    public ctrlKey: boolean;

    /** Whether the "meta" key was pressed when this mouse event occurred. */
    public metaKey: boolean;

    /** This is currently not implemented in the Federated Events API. */
    public relatedTarget: EventTarget;

    /** Whether the "shift" key was pressed when this mouse event occurred. */
    public shiftKey: boolean;

    /** The coordinates of the mouse event relative to the canvas. */
    public client: Point = new Point();

    /** The movement in this pointer relative to the last `pointermove` event. */
    public movement: Point = new Point();

    /** The coordinates of the event relative to the DOM document. This is a non-standard property. */
    public page: Point = new Point();

    /** The offset of the pointer coordinates w.r.t. target Container in world space. This is not supported at the moment. */
    public offset: Point = new Point();

    /** The pointer coordinates in world space. */
    public global: Point = new Point();

    /**
     * The pointer coordinates in the renderer's {@link Renderer.screen screen}. This has slightly
     * different semantics than native PointerEvent screenX/screenY.
     */
    public screen: Point = new Point();

    /** Flags whether the default response of the user agent was prevent through this event. */
    public defaultPrevented = false;
    /** Prevent default behavior of PixiJS and the user agent. */
    public preventDefault(): void
    {
        if (this.nativeEvent instanceof Event && this.nativeEvent.cancelable)
        {
            this.nativeEvent.preventDefault();
        }

        this.defaultPrevented = true;
    }

    /** Flags whether propagation was stopped. */
    public propagationStopped = false;
    /**
     * Stop this event from propagating to the next {@link FederatedEventTarget}. The rest of the listeners
     * on the {@link FederatedEventTarget.currentTarget currentTarget} will still be notified.
     */
    public stopPropagation(): void
    {
        this.propagationStopped = true;
    }

    /**
     * This will return the local coordinates of the specified container for this InteractionData
     * @param container - The Container that you would like the local
     *  coords off
     * @param point - A Point object in which to store the value, optional (otherwise
     *  will create a new point)
     * @param globalPos - A Point object containing your custom global coords, optional
     *  (otherwise will use the current global coords)
     * @returns - A point containing the coordinates of the InteractionData position relative
     *  to the Container
     */
    public getLocalPosition<P extends PointData = Point>(container: Container, point?: P, globalPos?: PointData): P
    {
        return container.worldTransform.applyInverse<P>(globalPos ?? this.global, point);
    }

    /**
     * Whether the modifier key was pressed when this event natively occurred.
     * @param key - The modifier key.
     */
    public getModifierState(key: string): boolean
    {
        return 'getModifierState' in this.nativeEvent && this.nativeEvent.getModifierState(key);
    }

    /**
     * The data of the event.
     * @deprecated since 7.0.0
     * @see {@link InputEvent}
     */
    get data(): InputEvent
    {
        return this;
    }
}
