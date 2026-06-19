import { measureResizeTarget } from './measureResizeTarget';

/**
 * A render-agnostic, throttled auto-resize controller. It listens for `resize` events on a
 * {@link Window} or {@link HTMLElement} target, coalesces them to a single resize per animation
 * frame, and forwards the measured CSS-pixel size to a `doResize` callback.
 *
 * Shared by {@link ResizePlugin} (which resizes the renderer) and {@link RenderView} (which resizes
 * a single secondary view), so the throttling and listener bookkeeping live in one place.
 * @category app
 * @internal
 */
export class ResizeController
{
    /** Callback invoked with the measured CSS-pixel size whenever a resize lands. */
    private readonly _doResize: (width: number, height: number) => void;

    /** Bound {@link ResizeController.queueResize} used as the `resize` event listener. */
    private readonly _boundQueueResize: () => void;

    /** Handle of the pending `requestAnimationFrame`, or `null` when no resize is queued. */
    private _resizeId: number | null = null;

    /** The current auto-resize target, or `null` when auto-resize is disabled. */
    private _resizeTo: Window | HTMLElement | null = null;

    /**
     * @param doResize - invoked with the target's measured CSS-pixel width and height each time a
     * queued or immediate resize is flushed.
     */
    constructor(doResize: (width: number, height: number) => void)
    {
        this._doResize = doResize;
        this._boundQueueResize = (): void => this.queueResize();
    }

    /**
     * The element or window the controller auto-resizes to. Setting a target attaches a `resize`
     * listener and resizes immediately; setting `null` detaches the listener and stops auto-resize.
     */
    public get resizeTo(): Window | HTMLElement | null
    {
        return this._resizeTo;
    }

    public set resizeTo(target: Window | HTMLElement | null)
    {
        globalThis.removeEventListener('resize', this._boundQueueResize);
        this._resizeTo = target;

        if (target)
        {
            globalThis.addEventListener('resize', this._boundQueueResize);
            this.resizeNow();
        }
    }

    /**
     * Queues a resize for the next animation frame, coalescing multiple calls within the same frame
     * into a single resize. Does nothing when there is no resize target.
     */
    public queueResize(): void
    {
        if (!this._resizeTo)
        {
            return;
        }

        this.cancelResize();
        this._resizeId = globalThis.requestAnimationFrame((): void => this.resizeNow());
    }

    /**
     * Cancels a resize queued by {@link ResizeController.queueResize}, if any. Safe to call when no
     * resize is pending, including when the pending frame handle is `0`.
     */
    public cancelResize(): void
    {
        if (this._resizeId !== null)
        {
            globalThis.cancelAnimationFrame(this._resizeId);
            this._resizeId = null;
        }
    }

    /**
     * Cancels any queued resize, measures the current target, and resizes immediately. Does nothing
     * when there is no resize target.
     */
    public resizeNow(): void
    {
        this.cancelResize();

        if (!this._resizeTo)
        {
            return;
        }

        const { width, height } = measureResizeTarget(this._resizeTo);

        this._doResize(width, height);
    }

    /**
     * Detaches the `resize` listener, cancels any queued resize, and releases the target so the
     * controller can be garbage collected.
     */
    public destroy(): void
    {
        globalThis.removeEventListener('resize', this._boundQueueResize);
        this.cancelResize();
        this._resizeTo = null;
    }
}
