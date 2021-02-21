import { FederatedMouseEvent } from './FederatedMouseEvent';

/**
 * A {@link FederatedEvent} for pointer events.
 *
 * @memberof PIXI
 */
export class FederatedPointerEvent extends FederatedMouseEvent implements PointerEvent
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

    /**
     * This is the number of clicks that occurs in 200ms/click of each other.
     */
    public detail: number;
}
