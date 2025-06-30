import { FederatedMouseEvent } from './FederatedMouseEvent';

/**
 * A specialized event class for pointer interactions in PixiJS applications.
 * Extends {@link FederatedMouseEvent} to provide advanced pointer-specific features
 * while maintaining compatibility with the DOM PointerEvent interface.
 *
 * Key features:
 * - Supports multi-touch interactions
 * - Provides pressure sensitivity
 * - Handles stylus input
 * - Tracks pointer dimensions
 * - Supports tilt detection
 * @example
 * ```ts
 * // Basic pointer event handling
 * sprite.on('pointerdown', (event: FederatedPointerEvent) => {
 *     // Access pointer information
 *     console.log('Pointer ID:', event.pointerId);
 *     console.log('Pointer Type:', event.pointerType);
 *     console.log('Is Primary:', event.isPrimary);
 *
 *     // Get pressure and tilt data
 *     console.log('Pressure:', event.pressure);
 *     console.log('Tilt:', event.tiltX, event.tiltY);
 *
 *     // Access contact geometry
 *     console.log('Size:', event.width, event.height);
 * });
 *
 * // Handle stylus-specific features
 * sprite.on('pointermove', (event: FederatedPointerEvent) => {
 *     if (event.pointerType === 'pen') {
 *         // Handle stylus tilt
 *         const tiltAngle = Math.atan2(event.tiltY, event.tiltX);
 *         console.log('Tilt angle:', tiltAngle);
 *
 *         // Use barrel button pressure
 *         console.log('Tangential pressure:', event.tangentialPressure);
 *     }
 * });
 * ```
 * @see {@link FederatedMouseEvent} For base mouse event functionality
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent} DOM PointerEvent Interface
 * @see {@link EventSystem} For the event management system
 * @category events
 * @standard
 */
export class FederatedPointerEvent extends FederatedMouseEvent implements PointerEvent
{
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
     * The angle in radians of a pointer or stylus measuring the vertical angle between
     * the device's surface to the pointer or stylus.
     * A stylus at 0 degrees would be directly parallel whereas at π/2 degrees it would be perpendicular.
     * @see https://developer.mozilla.org/docs/Web/API/PointerEvent/altitudeAngle)
     */
    public altitudeAngle: number;

    /**
     * The angle in radians of a pointer or stylus measuring an arc from the X axis of the device to
     * the pointer or stylus projected onto the screen's plane.
     * A stylus at 0 degrees would be pointing to the "0 o'clock" whereas at π/2 degrees it would be pointing at "6 o'clock".
     * @see https://developer.mozilla.org/docs/Web/API/PointerEvent/azimuthAngle)
     */
    public azimuthAngle: number;

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
     *s
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

    /** This is the number of clicks that occurs in 200ms/click of each other. */
    public detail: number;

    /**
     * Only included for completeness for now
     * @ignore
     */
    public getCoalescedEvents(): PointerEvent[]
    {
        if (this.type === 'pointermove' || this.type === 'mousemove' || this.type === 'touchmove')
        {
            return [this];
        }

        return [];
    }

    /**
     * Only included for completeness for now
     * @ignore
     */
    public getPredictedEvents(): PointerEvent[]
    {
        throw new Error('getPredictedEvents is not supported!');
    }
}
