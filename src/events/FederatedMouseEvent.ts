import { Point } from '../maths/point/Point';
import { FederatedEvent } from './FederatedEvent';

import type { PointData } from '../maths/point/PointData';
import type { Container } from '../scene/container/Container';
import type { PixiTouch } from './FederatedEvent';

/**
 * A {@link FederatedEvent} for mouse events.
 * @memberof events
 */
export class FederatedMouseEvent extends FederatedEvent<
MouseEvent | PointerEvent | PixiTouch
> implements MouseEvent
{
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

    /** This is the number of clicks that occurs in 200ms/click of each other. */
    public detail: number;

    /** The movement in this pointer relative to the last `mousemove` event. */
    public movement: Point = new Point();

    /** @readonly */
    get movementX(): number { return this.movement.x; }

    /** @readonly */
    get movementY(): number { return this.movement.y; }

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

    /**
     * This will return the local coordinates of the specified container for this InteractionData
     * @param {Container} container - The Container that you would like the local
     *  coords off
     * @param {PointData} point - A Point object in which to store the value, optional (otherwise
     *  will create a new point)
     * @param {PointData} globalPos - A Point object containing your custom global coords, optional
     *  (otherwise will use the current global coords)
     * @returns - A point containing the coordinates of the InteractionData position relative
     *  to the Container
     */
    public getLocalPosition<P extends PointData = Point>(container: Container, point?: P, globalPos?: PointData): P
    {
        return container.worldTransform.applyInverse<P>(globalPos || this.global, point);
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
     * Not supported.
     * @param _typeArg
     * @param _canBubbleArg
     * @param _cancelableArg
     * @param _viewArg
     * @param _detailArg
     * @param _screenXArg
     * @param _screenYArg
     * @param _clientXArg
     * @param _clientYArg
     * @param _ctrlKeyArg
     * @param _altKeyArg
     * @param _shiftKeyArg
     * @param _metaKeyArg
     * @param _buttonArg
     * @param _relatedTargetArg
     * @deprecated since 7.0.0
     */
    // eslint-disable-next-line max-params
    public initMouseEvent(
        _typeArg: string,
        _canBubbleArg: boolean,
        _cancelableArg: boolean,
        _viewArg: Window,
        _detailArg: number,
        _screenXArg: number,
        _screenYArg: number,
        _clientXArg: number,
        _clientYArg: number,
        _ctrlKeyArg: boolean,
        _altKeyArg: boolean,
        _shiftKeyArg: boolean,
        _metaKeyArg: boolean,
        _buttonArg: number,
        _relatedTargetArg: EventTarget
    ): void
    {
        throw new Error('Method not implemented.');
    }
}
