import { BaseTexture, Texture } from '@pixi/core';

/**
 * Super simple Cache for all assets... key value pairs.. that's it!
 *
 * It is not intended that this class is created by developers - it is part of the Asset package.
 * This is the first major system of PixiJS' main Assets class.
 * @memberof PIXI
 * @class Cache
 */
class CacheClass
{
    private readonly _cache: Map<string, any> = new Map();

    /** Clear all entries. */
    public reset(): void
    {
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
     * Set a value by key name
     * @param key
     * @param value
     */
    public set(key: string, value: unknown): void
    {
        if (this._cache.has(key) && this._cache.get(key) !== value)
        {
            console.warn('[Cache] already has key:', key);
        }

        // temporary to keep compatible with existing texture caching.. until we remove them!

        if (value instanceof Texture)
        {
            const texture: Texture = value;

            if (texture.baseTexture !== Texture.EMPTY.baseTexture)
            {
                BaseTexture.addToCache(texture.baseTexture, key);
            }

            Texture.addToCache(texture, key);
        }

        //

        this._cache.set(key, value);
    }

    /**
     * Remove entry by key
     * @param key
     */
    public remove(key: string): void
    {
        this._cache.delete(key);
    }
}

export const Cache = new CacheClass();
