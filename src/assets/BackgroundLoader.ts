import type { Loader } from './loader/Loader';
import type { ResolvedAsset } from './types';

/**
 * The BackgroundLoader handles loading assets passively in the background to prepare them for future use.
 * It loads one asset at a time to minimize impact on application performance.
 *
 * Key features:
 * - Sequential loading of assets
 * - Automatic pause when high-priority loads occur
 * - Configurable concurrency
 * @example
 * ```ts
 * import { Assets } from 'pixi.js';
 *
 * // Background load level assets while in menu
 * Assets.backgroundLoad([
 *     'level1/background.png',
 *     'level1/sprites.json',
 *     'level1/music.mp3'
 * ]);
 *
 * // Assets will be instantly available when needed
 * const assets = await Assets.load([
 *     'level1/background.png',
 *     'level1/sprites.json'
 * ]);
 *
 * // Background load bundles
 * Assets.backgroundLoadBundle('level2');
 *
 * // Later, instant access
 * const level2 = await Assets.loadBundle('level2');
 * ```
 * > [!NOTE] You typically do not need to use this class directly. Use the main {@link Assets.backgroundLoad} API instead.
 * @remarks
 * - Background loading is automatically paused when `Assets.load()` is called
 * - Assets are loaded sequentially to minimize performance impact
 * - Assets are cached as they complete loading
 * - No progress tracking is available for background loading
 * @see {@link Assets.backgroundLoad} For the main background loading API
 * @see {@link Assets.backgroundLoadBundle} For background loading bundles
 * @category assets
 * @advanced
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

    /**
     * Should the loader log to the console.
     * @advanced
     */
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
     * Adds assets to the background loading queue. Assets are loaded one at a time to minimize
     * performance impact.
     * @param assetUrls - Array of resolved assets to load in the background
     * @example
     * ```ts
     * // Add assets to background load queue
     * backgroundLoader.add([
     *     { src: 'images/level1/bg.png' },
     *     { src: 'images/level1/characters.json' }
     * ]);
     *
     * // Assets will load sequentially in the background
     * // The loader automatically pauses when high-priority loads occur
     * // e.g. Assets.load() is called
     * ```
     * @remarks
     * - Assets are loaded one at a time to minimize performance impact
     * - Loading automatically pauses when Assets.load() is called
     * - No progress tracking is available for background loading
     * - Assets are cached as they complete loading
     * @internal
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
     * Controls the active state of the background loader. When active, the loader will
     * continue processing its queue. When inactive, loading is paused.
     * @returns Whether the background loader is currently active
     * @example
     * ```ts
     * // Pause background loading
     * backgroundLoader.active = false;
     *
     * // Resume background loading
     * backgroundLoader.active = true;
     *
     * // Check current state
     * console.log(backgroundLoader.active); // true/false
     *
     * // Common use case: Pause during intensive operations
     * backgroundLoader.active = false;  // Pause background loading
     * ... // Perform high-priority tasks
     * backgroundLoader.active = true;   // Resume background loading
     * ```
     * @remarks
     * - Setting to true resumes loading immediately
     * - Setting to false pauses after current asset completes
     * - Background loading is automatically paused during `Assets.load()`
     * - Assets already being loaded will complete even when set to false
     */
    public get active(): boolean
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
