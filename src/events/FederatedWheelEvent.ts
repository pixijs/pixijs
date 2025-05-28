import { FederatedMouseEvent } from './FederatedMouseEvent';

/**
 * A {@link FederatedEvent} for wheel events.
 * @category events
 * @standard
 */
export class FederatedWheelEvent extends FederatedMouseEvent implements WheelEvent
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

    /**
     * Units specified in pixels.
     * @ignore
     */
    public static readonly DOM_DELTA_PIXEL = 0;

    /**
     * Units specified in pixels.
     * @ignore
     */
    public readonly DOM_DELTA_PIXEL = 0;

    /**
     * Units specified in lines.
     * @ignore
     */
    public static readonly DOM_DELTA_LINE = 1;

    /**
     * Units specified in lines.
     * @ignore
     */
    public readonly DOM_DELTA_LINE = 1;

    /**
     * Units specified in pages.
     * @ignore
     */
    public static readonly DOM_DELTA_PAGE = 2;

    /**
     * Units specified in pages.
     * @ignore
     */
    public readonly DOM_DELTA_PAGE = 2;
}
