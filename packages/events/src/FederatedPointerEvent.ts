import { Point } from '@pixi/math';
import { FederatedEvent } from './FederatedEvent';

export class FederatedPointerEvent extends FederatedEvent<
    MouseEvent | PointerEvent | TouchEvent
> implements PointerEvent
{
    /**
     * The unique identifier of the pointer.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerId}
     */
    public pointerId: number;

    /**
     * The width of the pointer's contact along the x-axis, measured in CSS pixels.
     * radiusX of TouchEvents will be represented by this value.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/width
     */
    public width = 0;

    /**
     * The height of the pointer's contact along the y-axis, measured in CSS pixels.
     * radiusY of TouchEvents will be represented by this value.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/height
     */
    public height = 0;

    /**
     * Indicates whether or not the pointer device that created the event is the primary pointer.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/isPrimary
     */
    public isPrimary = false;
    public pointerType: string;
    public pressure: number;
    public tangentialPressure: number;
    public tiltX: number;
    public tiltY: number;
    public twist: number;
    public altKey: boolean;
    public button: number;
    public buttons: number;
    public clientX: number;
    public clientY: number;
    public ctrlKey: boolean;
    public metaKey: boolean;
    public movementX: number;
    public movementY: number;
    public pageX: number;
    public pageY: number;
    public relatedTarget: EventTarget = null;
    public shiftKey: boolean;
    public x: number;
    public y: number;

    /**
     * This is the number of clicks that occurs in 200ms/click of each other.
     */
    public detail: number;

    /**
     * The offset of the pointer coordinates w.r.t. target DisplayObject in world space.
     */
    public offset: Point = new Point();

    /**
     * @readonly
     */
    get offsetX(): number
    {
        return this.offset.x;
    }

    /**
     * @readonly
     */
    get offsetY(): number
    {
        return this.offset.y;
    }

    public global: Point = new Point();

    get globalX(): number
    {
        return this.global.x;
    }

    get globalY(): number
    {
        return this.global.y;
    }

    /**
     * The pointer coordinates in the renderer's {@link PIXI.Renderer.screen screen}. This has slightly
     * different semantics than native PointerEvent screenX/screenY.
     */
    public screen: Point = new Point();

    /**
     * The pointer coordinates in the renderer's screen. Alias for {@code screen.x}.
     *
     * @readonly
     */
    get screenX(): number
    {
        return this.screen.x;
    }

    /**
     * The pointer coordinates in the renderer's screen. Alias for {@code screen.y}.
     *
     * @readonly
     */
    get screenY(): number
    {
        return this.screen.y;
    }

    /**
     * Fallback for the deprecated {@link InteractionEvent.data}.
     *
     * @deprecated
     */
    get data(): FederatedPointerEvent
    {
        return this;
    }

    getModifierState(keyArg: string): boolean
    {
        return 'getModifierState' in this.nativeEvent && this.nativeEvent.getModifierState(keyArg);
    }

    /** Not supported. */
    // eslint-disable-next-line max-params
    initMouseEvent(
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

    detail: number;
    view: Window;
    which: number;
}
