/**
 *
 * for every asset that is cached, it will call the parsers test function
 * the flow is as follows:
 *
 * 1. Test the asset.
 * 2. If test passes call the getCacheableAssets function with the asset
 *
 * useful if you want to add more than just a raw asset to the cache
 * (for example a spritesheet will want to make all its sub textures easily accessible in the cache)
 */
export interface CacheParser<T=any>
{
    /**
     * gets called by the cache when a dev caches an asset
     * @param asset - the asset to test
     */
    test: (asset: T) => boolean;

    /**
     * if the test passes, this function is called to get the cacheable assets
     * an example may be that a spritesheet object will return all the sub textures it has so they can
     * be cached.
     * @param keys - the keys to cache the assets under
     * @param asset - the asset to get the cacheable assets from
     * @returns a key value pair of cacheable assets
     */
    getCacheableAssets: (keys: string[], asset: T) => Record<string, any>;
}
