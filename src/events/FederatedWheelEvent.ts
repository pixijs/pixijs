import { FederatedMouseEvent } from './FederatedMouseEvent';

/**
 * A specialized event class for wheel/scroll interactions in PixiJS applications.
 * Extends {@link FederatedMouseEvent} to provide wheel-specific properties while
 * maintaining compatibility with the DOM WheelEvent interface.
 *
 * Key features:
 * - Provides scroll delta information
 * - Supports different scroll modes (pixel, line, page)
 * - Inherits mouse event properties
 * - Normalizes cross-browser wheel events
 * @example
 * ```ts
 * // Basic wheel event handling
 * sprite.on('wheel', (event: FederatedWheelEvent) => {
 *     // Get scroll amount
 *     console.log('Vertical scroll:', event.deltaY);
 *     console.log('Horizontal scroll:', event.deltaX);
 *
 *     // Check scroll mode
 *     if (event.deltaMode === FederatedWheelEvent.DOM_DELTA_LINE) {
 *         console.log('Scrolling by lines');
 *     } else if (event.deltaMode === FederatedWheelEvent.DOM_DELTA_PAGE) {
 *         console.log('Scrolling by pages');
 *     } else {
 *         console.log('Scrolling by pixels');
 *     }
 *
 *     // Get scroll position
 *     console.log('Scroll at:', event.global.x, event.global.y);
 * });
 *
 * // Common use case: Zoom control
 * container.on('wheel', (event: FederatedWheelEvent) => {
 *     // Prevent page scrolling
 *     event.preventDefault();
 *
 *     // Zoom in/out based on scroll direction
 *     const zoomFactor = 1 + (event.deltaY / 1000);
 *     container.scale.set(container.scale.x * zoomFactor);
 * });
 * ```
 * @see {@link FederatedMouseEvent} For base mouse event functionality
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent} DOM WheelEvent Interface
 * @see {@link EventSystem} For the event management system
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
