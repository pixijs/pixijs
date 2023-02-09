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

    /** Units specified in pixels. */
    static readonly DOM_DELTA_PIXEL = 0;

    /** Units specified in pixels. */
    readonly DOM_DELTA_PIXEL = 0;

    /** Units specified in lines. */
    static readonly DOM_DELTA_LINE = 1;

    /** Units specified in lines. */
    readonly DOM_DELTA_LINE = 1;

    /** Units specified in pages. */
    static readonly DOM_DELTA_PAGE = 2;

    /** Units specified in pages. */
    readonly DOM_DELTA_PAGE = 2;
}
