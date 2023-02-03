import { FederatedMouseEvent } from './FederatedMouseEvent';

/**
 * A {@link PIXI.FederatedEvent} for wheel events.
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
    readonly DOM_DELTA_LINE = WheelEvent.DOM_DELTA_LINE;

    /** Units specified in pages. */
    readonly DOM_DELTA_PAGE = WheelEvent.DOM_DELTA_PAGE;

    /** Units specified in pixels. */
    readonly DOM_DELTA_PIXEL = WheelEvent.DOM_DELTA_PIXEL;
}
