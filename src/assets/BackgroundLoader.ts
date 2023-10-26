import type { Loader } from './loader/Loader';
import type { ResolvedAsset } from './types';

/**
 * Quietly Loads assets in the background.
 * @memberof assets
 */
export class BackgroundLoader
{
    /** Whether or not the loader should continue loading. */
    private _isActive: boolean;

    /** Assets to load. */
    private readonly _assetList: ResolvedAsset[];

    /** Whether or not the loader is loading. */
    private _isLoading: boolean;

    /** Number of assets to load at a time. */
    private readonly _maxConcurrent: number;

    /** Should the loader log to the console. */
    public verbose: boolean;
    private readonly _loader: Loader;

    /**
     * @param loader
     * @param verbose - should the loader log to the console
     */
    constructor(loader: Loader, verbose = false)
    {
        this._loader = loader;
        this._assetList = [];
        this._isLoading = false;
        this._maxConcurrent = 1;
        this.verbose = verbose;
    }

    /**
     * Adds an array of assets to load.
     * @param assetUrls - assets to load
     */
    public add(assetUrls: ResolvedAsset[]): void
    {
        assetUrls.forEach((a) =>
        {
            this._assetList.push(a);
        });

        if (this.verbose)
        {
            // eslint-disable-next-line no-console
            console.log('[BackgroundLoader] assets: ', this._assetList);
        }

        if (this._isActive && !this._isLoading)
        {
            void this._next();
        }
    }

    /**
     * Loads the next set of assets. Will try to load as many assets as it can at the same time.
     *
     * The max assets it will try to load at one time will be 4.
     */
    private async _next(): Promise<void>
    {
        if (this._assetList.length && this._isActive)
        {
            this._isLoading = true;

            const toLoad = [];

            const toLoadAmount = Math.min(this._assetList.length, this._maxConcurrent);

            for (let i = 0; i < toLoadAmount; i++)
            {
                toLoad.push(this._assetList.pop());
            }

            await this._loader.load(toLoad);

            this._isLoading = false;

            void this._next();
        }
    }

    /**
     * Activate/Deactivate the loading. If set to true then it will immediately continue to load the next asset.
     * @returns whether the class is active
     */
    get active(): boolean
    {
        return this._isActive;
    }

    set active(value: boolean)
    {
        if (this._isActive === value) return;

        this._isActive = value;

        if (value && !this._isLoading)
        {
            void this._next();
        }
    }
}
