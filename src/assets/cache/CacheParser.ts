import type { ExtensionMetadata } from '../../extensions/Extensions';

/**
 * For every asset that is cached, it will call the parsers test function
 * the flow is as follows:
 *
 * 1. `cacheParser.test()`: Test the asset.
 * 2. `cacheParser.getCacheableAssets()`: If the test passes call the getCacheableAssets function with the asset
 *
 * Useful if you want to add more than just a raw asset to the cache
 * (for example a spritesheet will want to make all its sub textures easily accessible in the cache)
 * @memberof assets
 */
export interface CacheParser<T=any>
{
    /** The extension type of this cache parser */
    extension?: ExtensionMetadata;

    /** A config to adjust the parser */
    config?: Record<string, any>

    /**
     * Gets called by the cache when a dev caches an asset
     * @param asset - the asset to test
     */
    test: (asset: T) => boolean;

    /**
     * If the test passes, this function is called to get the cacheable assets
     * an example may be that a spritesheet object will return all the sub textures it has so they can
     * be cached.
     * @param keys - The keys to cache the assets under
     * @param asset - The asset to get the cacheable assets from
     * @returns A key-value pair of cacheable assets
     */
    getCacheableAssets: (keys: string[], asset: T) => Record<string, any>;
}
