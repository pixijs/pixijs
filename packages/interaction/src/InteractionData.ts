import { Point, IPointData } from '@pixi/math';

import type { DisplayObject } from '@pixi/display';

export type InteractivePointerEvent = PointerEvent | TouchEvent | MouseEvent;

/**
 * Holds all information related to an Interaction event
 *
 * @memberof PIXI
 */
export class InteractionData
{
    /** This point stores the global coords of where the touch/mouse event happened. */
    public global: Point;

    /** The target Sprite that was interacted with. */
    public target: DisplayObject;

    /**
     * When passed to an event handler, this will be the original DOM Event that was captured
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
     * @see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent
     * @member {MouseEvent|TouchEvent|PointerEvent}
     */
    public originalEvent: InteractivePointerEvent;

    /** Unique identifier for this interaction. */
    public identifier: number;

    /**
     * Indicates whether or not the pointer device that created the event is the primary pointer.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/isPrimary
     */
    public isPrimary: boolean;

    /**
     * Indicates which button was pressed on the mouse or pointer device to trigger the event.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
     */
    public button: number;

    /**
     * Indicates which buttons are pressed on the mouse or pointer device when the event is triggered.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
     */
    public buttons: number;

    /**
     * The width of the pointer's contact along the x-axis, measured in CSS pixels.
     * radiusX of TouchEvents will be represented by this value.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/width
     */
    public width: number;

    /**
     * The height of the pointer's contact along the y-axis, measured in CSS pixels.
     * radiusY of TouchEvents will be represented by this value.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/height
     */
    public height: number;

    /**
     * The angle, in degrees, between the pointer device and the screen.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltX
     */
    public tiltX: number;

    /**
     * The angle, in degrees, between the pointer device and the screen.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltY
     */
    public tiltY: number;

    /**
     * The type of pointer that triggered the event.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType
     */
    public pointerType: string;

    /**
     * Pressure applied by the pointing device during the event. A Touch's force property
     * will be represented by this value.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure
     */
    public pressure = 0;

    /**
     * From TouchEvents (not PointerEvents triggered by touches), the rotationAngle of the Touch.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Touch/rotationAngle
     */
    public rotationAngle = 0;

    /**
     * Twist of a stylus pointer.
     *
     * @see https://w3c.github.io/pointerevents/#pointerevent-interface
     */
    public twist = 0;

    /**
     * Barrel pressure on a stylus pointer.
     *
     * @see https://w3c.github.io/pointerevents/#pointerevent-interface
     */
    public tangentialPressure = 0;

    constructor()
    {
        this.global = new Point();
        this.target = null;
        this.originalEvent = null;
        this.identifier = null;
        this.isPrimary = false;
        this.button = 0;
        this.buttons = 0;
        this.width = 0;
        this.height = 0;
        this.tiltX = 0;
        this.tiltY = 0;
        this.pointerType = null;
        this.pressure = 0;
        this.rotationAngle = 0;
        this.twist = 0;
        this.tangentialPressure = 0;
    }

    /**
     * The unique identifier of the pointer. It will be the same as `identifier`.
     *
     * @readonly
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerId
     */
    get pointerId(): number
    {
        return this.identifier;
    }

    /**
     * This will return the local coordinates of the specified displayObject for this InteractionData
     *
     * @param displayObject - The DisplayObject that you would like the local
     *  coords off
     * @param point - A Point object in which to store the value, optional (otherwise
     *  will create a new point)
     * @param globalPos - A Point object containing your custom global coords, optional
     *  (otherwise will use the current global coords)
     * @return - A point containing the coordinates of the InteractionData position relative
     *  to the DisplayObject
     */
    public getLocalPosition<P extends IPointData = Point>(displayObject: DisplayObject, point?: P, globalPos?: IPointData): P
    {
        return displayObject.worldTransform.applyInverse<P>(globalPos || this.global, point);
    }

    /**
     * Copies properties from normalized event data.
     *
     * @param {Touch|MouseEvent|PointerEvent} event - The normalized event data
     */
    public copyEvent(event: Touch | InteractivePointerEvent): void
    {
        // isPrimary should only change on touchstart/pointerdown, so we don't want to overwrite
        // it with "false" on later events when our shim for it on touch events might not be
        // accurate
        if ('isPrimary' in event && event.isPrimary)
        {
            this.isPrimary = true;
        }
        this.button = 'button' in event && event.button;
        // event.buttons is not available in all browsers (ie. Safari), but it does have a non-standard
        // event.which property instead, which conveys the same information.
        const buttons = 'buttons' in event && event.buttons;

        this.buttons = Number.isInteger(buttons) ? buttons : 'which' in event && event.which;
        this.width = 'width' in event && event.width;
        this.height = 'height' in event && event.height;
        this.tiltX = 'tiltX' in event && event.tiltX;
        this.tiltY = 'tiltY' in event && event.tiltY;
        this.pointerType = 'pointerType' in event && event.pointerType;
        this.pressure = 'pressure' in event && event.pressure;
        this.rotationAngle = 'rotationAngle' in event && event.rotationAngle;
        this.twist = ('twist' in event && event.twist) || 0;
        this.tangentialPressure = ('tangentialPressure' in event && event.tangentialPressure) || 0;
    }

    /** Resets the data for pooling. */
    public reset(): void
    {
        // isPrimary is the only property that we really need to reset - everything else is
        // guaranteed to be overwritten
        this.isPrimary = false;
    }
}
