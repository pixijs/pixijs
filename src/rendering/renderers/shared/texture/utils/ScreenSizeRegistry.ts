/**
 * Tracks the screen size of every live renderer.
 *
 * Sizes are physical pixels. Each screen also has a resolution, which gives its size in the scene, so a
 * request at another resolution can be fitted to the screen at that resolution.
 * @category rendering
 * @internal
 */
export class ScreenSizeRegistry
{
    /** the live screen sizes in physical pixels, keyed by renderer uid */
    private readonly _screenSizes: Map<number, {pixelWidth: number, pixelHeight: number, resolution: number}>
        = new Map();
    /** the unique registered screen widths in physical pixels, sorted ascending */
    private _widths: number[] = [];
    /** the unique registered screen heights in physical pixels, sorted ascending */
    private _heights: number[] = [];
    /** the unique registered screen widths over their resolution, sorted ascending */
    private _logicalWidths: number[] = [];
    /** the unique registered screen heights over their resolution, sorted ascending */
    private _logicalHeights: number[] = [];

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
     * @param resolution - The resolution of the screen.
     * @returns `true` if this changed the registered screens, `false` if the size was already registered.
     */
    public set(rendererUid: number, pixelWidth: number, pixelHeight: number, resolution = 1): boolean
    {
        const current = this._screenSizes.get(rendererUid);

        if (current
            && current.pixelWidth === pixelWidth
            && current.pixelHeight === pixelHeight
            && current.resolution === resolution) return false;

        this._screenSizes.set(rendererUid, { pixelWidth, pixelHeight, resolution });

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
     * The smallest registered screen width the request fits in. A screen counts at its physical size and at
     * its size at the resolution of the request, so a resolution 1 request that covers a screen at 3x gets a
     * third of the screen's physical width, not all of it.
     * @param pixelWidth - The requested width in physical pixels.
     * @param resolution - The resolution of the request.
     * @returns The smallest live screen width that is at least `pixelWidth`, or `undefined` if none.
     */
    public getFittingWidth(pixelWidth: number, resolution = 1): number | undefined
    {
        return this._getFittingAxis(pixelWidth, resolution, this._widths, this._logicalWidths);
    }

    /**
     * The smallest registered screen height the request fits in, counted as
     * {@link ScreenSizeRegistry#getFittingWidth|getFittingWidth} counts widths.
     * @param pixelHeight - The requested height in physical pixels.
     * @param resolution - The resolution of the request.
     * @returns The smallest live screen height that is at least `pixelHeight`, or `undefined` if none.
     */
    public getFittingHeight(pixelHeight: number, resolution = 1): number | undefined
    {
        return this._getFittingAxis(pixelHeight, resolution, this._heights, this._logicalHeights);
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
     * @param resolution - The resolution of the request.
     * @param screenSizes - The live screen sizes on this axis in physical pixels, sorted ascending.
     * @param logicalSizes - The live screen sizes on this axis over their resolution, sorted ascending.
     * @returns The smallest screen size that is at least `pixelSize`, or `undefined` if none.
     */
    private _getFittingAxis(
        pixelSize: number,
        resolution: number,
        screenSizes: number[],
        logicalSizes: number[]
    ): number | undefined
    {
        let fitting: number | undefined;

        // both lists are sorted, so the first screen the request fits in is the smallest
        for (let i = 0; i < screenSizes.length; i++)
        {
            if (screenSizes[i] >= pixelSize)
            {
                fitting = screenSizes[i];
                break;
            }
        }

        for (let i = 0; i < logicalSizes.length; i++)
        {
            const screenSize = Math.ceil((logicalSizes[i] * resolution) - 1e-6);

            if (screenSize >= pixelSize)
            {
                return fitting === undefined ? screenSize : Math.min(fitting, screenSize);
            }
        }

        return fitting;
    }

    /** Rebuilds the sorted unique sizes for each axis. */
    private _update(): void
    {
        const screenSizes = [...this._screenSizes.values()];

        this._widths = sortedUnique(screenSizes.map((screenSize) => screenSize.pixelWidth));
        this._heights = sortedUnique(screenSizes.map((screenSize) => screenSize.pixelHeight));
        this._logicalWidths = sortedUnique(screenSizes.map((screenSize) => screenSize.pixelWidth / screenSize.resolution));
        this._logicalHeights = sortedUnique(
            screenSizes.map((screenSize) => screenSize.pixelHeight / screenSize.resolution)
        );
    }
}

function sortedUnique(sizes: number[]): number[]
{
    return sizes
        .filter((size, i) => sizes.indexOf(size) === i)
        .sort((a, b) => a - b);
}
