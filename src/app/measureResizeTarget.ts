/**
 * The CSS-pixel size of an auto-resize target, used by {@link ResizePlugin} and {@link RenderView}
 * to size a canvas to a {@link Window} or {@link HTMLElement}.
 * @category app
 * @advanced
 */
export interface ResizeTargetSize
{
    /** The target's width in CSS pixels. */
    width: number;
    /** The target's height in CSS pixels. */
    height: number;
}

/**
 * Measures the CSS-pixel size of an auto-resize target. The window is measured with
 * `innerWidth`/`innerHeight`; any other element with `clientWidth`/`clientHeight`.
 * @param target - the window or element being resized to
 * @returns the target's width and height in CSS pixels
 * @category app
 * @advanced
 */
export function measureResizeTarget(target: Window | HTMLElement): ResizeTargetSize
{
    if (target === globalThis.window)
    {
        return { width: globalThis.innerWidth, height: globalThis.innerHeight };
    }

    const { clientWidth, clientHeight } = target as HTMLElement;

    return { width: clientWidth, height: clientHeight };
}
