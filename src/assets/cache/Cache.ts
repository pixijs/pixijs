import { warn } from '../../utils/logging/warn';
import { convertToList } from '../utils/convertToList';

import type { CacheParser } from './CacheParser';

/**
 * A single Cache for all assets.
 *
 * When assets are added to the cache via set they normally are added to the cache as key-value pairs.
 *
 * With this cache, you can add parsers that will take the object and convert it to a list of assets that can be cached.
 * for example a cacheSpritesheet parser will add all of the textures found within its sprite sheet directly to the cache.
 *
 * This gives devs the flexibility to cache any type of object however we want.
 *
 * It is not intended that this class is created by developers - it is part of the Asset package.
 * This is the first major system of PixiJS' main Assets class.
 * @example
 * import { Cache } from 'pixi.js';
 *
 * Cache.set('bunny', bunnyTexture);
 * @class Cache
 * @memberof assets
 */
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

    /** All loader parsers registered */
    public get parsers(): CacheParser[]
    {
        return this._parsers;
    }
}

export const Cache = new CacheClass();
