/**
 * Tracks the screen size of every live renderer.
 *
 * Sizes are always physical pixels.
 * @category rendering
 * @internal
 */
export class ScreenSizeRegistry
{
    /** the live screen sizes in physical pixels, keyed by renderer uid */
    private readonly _screenSizes: Map<number, {pixelWidth: number, pixelHeight: number}> = new Map();
    /** the unique registered screen widths in physical pixels, sorted ascending */
    private _widths: number[] = [];
    /** the unique registered screen heights in physical pixels, sorted ascending */
    private _heights: number[] = [];

    /** The number of renderers with a registered screen. */
    public get size(): number
    {
        return this._screenSizes.size;
    }

    /**
     * Registers, or updates, the screen size of a renderer.
     * @param rendererUid - The uid of the renderer, used to update or remove this screen later.
     * @param pixelWidth - The width of the screen in physical pixels.
     * @param pixelHeight - The height of the screen in physical pixels.
     * @returns `true` if this changed the registered screens, `false` if the size was already registered.
     */
    public set(rendererUid: number, pixelWidth: number, pixelHeight: number): boolean
    {
        const current = this._screenSizes.get(rendererUid);

        if (current && current.pixelWidth === pixelWidth && current.pixelHeight === pixelHeight) return false;

        this._screenSizes.set(rendererUid, { pixelWidth, pixelHeight });

        this._update();

        return true;
    }

    /**
     * Removes the screen of a renderer.
     * @param rendererUid - The uid the screen was registered with.
     * @returns `true` if a screen was removed, `false` if the renderer had none registered.
     */
    public remove(rendererUid: number): boolean
    {
        if (!this._screenSizes.delete(rendererUid)) return false;

        this._update();

        return true;
    }

    /**
     * The smallest registered screen width the request fits in.
     * @param pixelWidth - The requested width in physical pixels.
     * @returns The smallest live screen width that is at least `pixelWidth`, or `undefined` if none.
     */
    public getFittingWidth(pixelWidth: number): number | undefined
    {
        return this._getFittingAxis(pixelWidth, this._widths);
    }

    /**
     * The smallest registered screen height the request fits in.
     * @param pixelHeight - The requested height in physical pixels.
     * @returns The smallest live screen height that is at least `pixelHeight`, or `undefined` if none.
     */
    public getFittingHeight(pixelHeight: number): number | undefined
    {
        return this._getFittingAxis(pixelHeight, this._heights);
    }

    /**
     * Whether a live screen uses this width.
     * @param width - The width in physical pixels.
     */
    public hasWidth(width: number): boolean
    {
        return this._widths.includes(width);
    }

    /**
     * Whether a live screen uses this height.
     * @param height - The height in physical pixels.
     */
    public hasHeight(height: number): boolean
    {
        return this._heights.includes(height);
    }

    /**
     * The smallest registered screen on this axis that the request still fits in.
     * @param pixelSize - The requested size on this axis in physical pixels.
     * @param screenSizes - The live screen sizes on this axis, sorted ascending.
     * @returns The smallest screen size that is at least `pixelSize`, or `undefined` if none.
     */
    private _getFittingAxis(pixelSize: number, screenSizes: number[]): number | undefined
    {
        for (let i = 0; i < screenSizes.length; i++)
        {
            const screenSize = screenSizes[i];

            // the list is sorted, so this is the smallest screen the request still fits in
            if (screenSize >= pixelSize) return screenSize;
        }

        return undefined;
    }

    /** Rebuilds the sorted unique sizes for each axis. */
    private _update(): void
    {
        this._widths = [...this._screenSizes.values()]
            .map((screenSize) => screenSize.pixelWidth)
            .filter((width, i, widths) => widths.indexOf(width) === i)
            .sort((a, b) => a - b);

        this._heights = [...this._screenSizes.values()]
            .map((screenSize) => screenSize.pixelHeight)
            .filter((height, i, heights) => heights.indexOf(height) === i)
            .sort((a, b) => a - b);
    }
}
