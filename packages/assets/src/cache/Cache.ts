import { BaseTexture, Texture } from '@pixi/core';
import { convertToList } from '../utils';
import { CacheParser } from './CacheParser';

/**
 * A single Cache for all assets.
 *
 * When assets are added to the cache via set they normally are added to the cache as key value pairs.
 *
 * With this cache you can add parsers that will take the object and convert it to a list of assets that can be cached.
 * for example a cacheSprite Sheet parser will add al of the textures found with in its sprite sheet directly to the cache.
 *
 * This give devs the flexibility to cache any type of object how every we want.
 *
 * It is not intended that this class is created by developers - it is part of the Asset package.
 * This is the first major system of PixiJS' main Assets class.
 *
 * This cache
 * @memberof PIXI
 * @class Cache
 */
class CacheClass
{
    /** All loader parsers registered */
    public parsers: CacheParser[] = [];

    private readonly _cache: Map<string, any> = new Map();
    private readonly _cacheMap: Map<string, {
        keys: string[],
        cacheKeys: string[],
    }> = new Map();

    /**
     * Use this to add any parsers to the `cache.set` function to
     * @param newParsers - a array of parsers to add to the cache, or just a single one
     */
    public addParser(...newParsers: CacheParser[]): void
    {
        this.parsers.push(...newParsers);
    }

    /**
     * For exceptional situations where a cache parser might be causing some trouble,
     * @param parsersToRemove - a array of parsers to remove from cache, or just a single one
     */
    public removeParser(...parsersToRemove: CacheParser[]): void
    {
        for (const parser of parsersToRemove)
        {
            const index = this.parsers.indexOf(parser);

            if (index >= 0) this.parsers.splice(index, 1);
        }
    }

    /** Clear all entries. */
    public reset(): void
    {
        this.parsers.length = 0;
        this._cache.clear();
    }

    /**
     * Check if key exists
     * @param key
     */
    public has(key: string): boolean
    {
        return this._cache.has(key);
    }

    /**
     * Fetch entry by key
     * @param key
     */
    public get<T = any>(key: string): T
    {
        const result = this._cache.get(key);

        if (!result)
        {
            console.warn(`[Assets] Asset id ${key} was not found in the Cache`);
        }

        return result as T;
    }

    /**
     * Set a value by key or keys name
     * @param key - the key or keys to set
     * @param value - the value to store in the cache or from which cacheable assets will be derived.
     */
    public set(key: string | string[], value: unknown): void
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

        if (!cacheableAssets)
        {
            cacheableAssets = {};

            keys.forEach((key) =>
            {
                cacheableAssets[key] = value;
            });
        }

        const cacheKeys = Object.keys(cacheableAssets);

        const cachedAssets = {
            cacheKeys,
            keys
        };

        // this is so we can remove them later..
        keys.forEach((key) =>
        {
            this._cacheMap.set(key, cachedAssets);
        });

        cacheKeys.forEach((key) =>
        {
            if (this._cache.has(key) && this._cache.get(key) !== value)
            {
                console.warn('[Cache] already has key:', key);
            }

            this._cache.set(key, cacheableAssets[key]);
        });

        // temporary to keep compatible with existing texture caching.. until we remove them!

        if (value instanceof Texture)
        {
            const texture: Texture = value;

            keys.forEach((key) =>
            {
                if (texture.baseTexture !== Texture.EMPTY.baseTexture)
                {
                    BaseTexture.addToCache(texture.baseTexture, key);
                }

                Texture.addToCache(texture, key);
            });
        }
    }

    /**
     * Remove entry by key
     *
     * This function will also remove any associated alias from the cache also.
     * @param key
     */
    public remove(key: string): void
    {
        this._cacheMap.get(key);

        if (!this._cacheMap.has(key))
        {
            console.warn(`[Assets] Asset id ${key} was not found in the Cache`);

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
}

export const Cache = new CacheClass();
