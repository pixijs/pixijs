import { Point } from '../../maths/point/Point';

import type { PointData } from '../../maths/point/PointData';
import type { Container } from '../../scene/container/Container';

/**
 * An synthetic WheelEvent implementation that contains the original native WheelEvent.
 * @memberof input
 */
export class WheelInputEvent
{
    /**
     * The units of `deltaX`, `deltaY`, and `deltaZ`. This is one of `DOM_DELTA_LINE`,
     * `DOM_DELTA_PAGE`, `DOM_DELTA_PIXEL`.
     */
    public deltaMode: number;

    /** Horizontal scroll amount */
    public deltaX: number;

    /** Vertical scroll amount */
    public deltaY: number;

    /** z-axis scroll amount. */
    public deltaZ: number;

    /** The native event that caused the foremost original event. */
    public nativeEvent: WheelEvent;

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

    /** The propagation path for this event. */
    public composedPath(): Container[]
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
    /** @readonly */
    public get clientX(): number { return this.client.x; }
    /** @readonly */
    public get clientY(): number { return this.client.y; }
    /**
     * Alias for {@link FederatedMouseEvent.clientX this.clientX}.
     * @readonly
     */
    get x(): number { return this.clientX; }
    /**
     * Alias for {@link FederatedMouseEvent.clientY this.clientY}.
     * @readonly
     */
    get y(): number { return this.clientY; }

    /** The movement in this pointer relative to the last `pointermove` event. */
    public movement: Point = new Point();
    /** @readonly */
    get movementX(): number { return this.movement.x; }
    /** @readonly */
    get movementY(): number { return this.movement.y; }

    /** The coordinates of the event relative to the DOM document. This is a non-standard property. */
    public page: Point = new Point();

    /** The offset of the pointer coordinates w.r.t. target Container in world space. This is not supported at the moment. */
    public offset: Point = new Point();
    /** @readonly */
    get offsetX(): number { return this.offset.x; }
    /** @readonly */
    get offsetY(): number { return this.offset.y; }

    /** The pointer coordinates in world space. */
    public global: Point = new Point();
    /** @readonly */
    get globalX(): number { return this.global.x; }
    /** @readonly */
    get globalY(): number { return this.global.y; }

    /**
     * The pointer coordinates in the renderer's {@link Renderer.screen screen}. This has slightly
     * different semantics than native PointerEvent screenX/screenY.
     */
    public screen: Point = new Point();
    /**
     * The pointer coordinates in the renderer's screen. Alias for {@code screen.x}.
     * @readonly
     */
    get screenX(): number { return this.screen.x; }
    /**
     * The pointer coordinates in the renderer's screen. Alias for {@code screen.y}.
     * @readonly
     */
    get screenY(): number { return this.screen.y; }

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
     * Fallback for the deprecated @code{InteractionEvent.data}.
     * @deprecated since 7.0.0
     */
    get data(): WheelInputEvent
    {
        return this;
    }
}
