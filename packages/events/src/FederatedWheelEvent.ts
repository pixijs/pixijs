import { FederatedMouseEvent } from './FederatedMouseEvent';

/**
 * A {@link PIXI.FederatedEvent} for wheel events.
 *
 * @memberof PIXI
 */
export class FederatedWheelEvent extends FederatedMouseEvent implements WheelEvent
{
    /**
     * The units of `deltaX`, `deltaY`, and `deltaZ`. This is one of `DOM_DELTA_LINE`,
     * `DOM_DELTA_PAGE`, `DOM_DELTA_PIXEL`.
     */
    deltaMode: number;

    /** Horizontal scroll amount */
    deltaX: number;

    /** Vertical scroll amount */
    deltaY: number;

    /** z-axis scroll amount. */
    deltaZ: number;

    /** Units specified in lines. */
    DOM_DELTA_LINE = 0;

    /** Units specified in pages. */
    DOM_DELTA_PAGE = 1;

    /** Units specified in pixels. */
    DOM_DELTA_PIXEL = 2;
}
