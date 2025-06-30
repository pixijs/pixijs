import { warn } from '../../utils/logging/warn';
import { convertToList } from '../utils/convertToList';

import type { CacheParser } from './CacheParser';

/** @internal */
class CacheClass
{
    private readonly _parsers: CacheParser[] = [];

    private readonly _cache: Map<any, any> = new Map();
    private readonly _cacheMap: Map<string, {
        keys: string[],
        cacheKeys: string[],
    }> = new Map();

    /** Clear all entries. */
    public reset(): void
    {
        this._cacheMap.clear();
        this._cache.clear();
    }

    /**
     * Check if the key exists
     * @param key - The key to check
     */
    public has(key: any): boolean
    {
        return this._cache.has(key);
    }

    /**
     * Fetch entry by key
     * @param key - The key of the entry to get
     */
    public get<T = any>(key: any): T
    {
        const result = this._cache.get(key);

        if (!result)
        {
            // #if _DEBUG
            warn(`[Assets] Asset id ${key} was not found in the Cache`);
            // #endif
        }

        return result as T;
    }

    /**
     * Set a value by key or keys name
     * @param key - The key or keys to set
     * @param value - The value to store in the cache or from which cacheable assets will be derived.
     */
    public set(key: any | any[], value: unknown): void
    {
        const keys = convertToList<string>(key);

        let cacheableAssets: Record<string, any>;

        for (let i = 0; i < this.parsers.length; i++)
        {
            const parser = this.parsers[i];

            if (parser.test(value))
            {
                cacheableAssets = parser.getCacheableAssets(keys, value);

                break;
            }
        }

        // convert cacheable assets to a map of key-value pairs
        const cacheableMap = new Map(Object.entries(cacheableAssets || {}));

        if (!cacheableAssets)
        {
            keys.forEach((key) =>
            {
                cacheableMap.set(key, value);
            });
        }

        const cacheKeys = [...cacheableMap.keys()];

        const cachedAssets = {
            cacheKeys,
            keys
        };

        // this is so we can remove them later..
        keys.forEach((key) =>
        {
            this._cacheMap.set(key, cachedAssets as any);
        });

        cacheKeys.forEach((key) =>
        {
            const val = cacheableAssets ? cacheableAssets[key] : value;

            if (this._cache.has(key) && this._cache.get(key) !== val)
            {
                // #if _DEBUG
                warn('[Cache] already has key:', key);
                // #endif
            }

            this._cache.set(key, cacheableMap.get(key));
        });
    }

    /**
     * Remove entry by key
     *
     * This function will also remove any associated alias from the cache also.
     * @param key - The key of the entry to remove
     */
    public remove(key: any): void
    {
        if (!this._cacheMap.has(key))
        {
            // #if _DEBUG
            warn(`[Assets] Asset id ${key} was not found in the Cache`);
            // #endif

            return;
        }

        const cacheMap = this._cacheMap.get(key);

        const cacheKeys = cacheMap.cacheKeys;

        cacheKeys.forEach((key) =>
        {
            this._cache.delete(key);
        });

        cacheMap.keys.forEach((key: string) =>
        {
            this._cacheMap.delete(key);
        });
    }

    /**
     * All loader parsers registered
     * @advanced
     */
    public get parsers(): CacheParser[]
    {
        return this._parsers;
    }
}

/**
 * A global cache for all assets in your PixiJS application. The cache system provides fast
 * access to loaded assets and prevents duplicate loading.
 *
 * Key Features:
 * - Automatic caching of loaded assets
 * - Support for custom cache parsers
 * - Automatic parsing of complex assets (e.g., spritesheets)
 * - Memory management utilities
 * > [!IMPORTANT] You typically do not need to use this class directly.
 * > Use the main {@link Assets} class for high-level asset management.
 * > `Assets.get(key)` will automatically use the cache.
 * @example
 * ```ts
 * import { Cache } from 'pixi.js';
 *
 * // Store an asset in the cache
 * Cache.set('myTexture', texture);
 *
 * // Retrieve an asset
 * const texture = Cache.get('myTexture');
 *
 * // Check if an asset exists
 * if (Cache.has('myTexture')) {
 *     // Use the cached asset
 *     const sprite = new Sprite(Cache.get('myTexture'));
 * }
 *
 * // Remove an asset from cache
 * Cache.remove('myTexture');
 *
 * // Clear all cached assets
 * Cache.reset();
 * ```
 * @remarks
 * The Cache is a core component of PixiJS' asset management system:
 * - Used internally by the {@link Assets} class
 * - Supports automatic parsing via {@link CacheParser}
 * - Handles complex asset types like spritesheets
 * - Manages memory through asset removal
 *
 * > [!IMPORTANT]
 * > This is a singleton class and should not be instantiated directly.
 * > Use the exported `Cache` instance instead.
 * @see {@link Assets} For high-level asset management
 * @see {@link CacheParser} For custom cache parsing
 * @category assets
 * @class
 * @advanced
 */
export const Cache = new CacheClass();
