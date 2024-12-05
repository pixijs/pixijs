import type { ExtensionType } from '../extensions/Extensions';
import type { CacheParser } from './cache/CacheParser';
import type { FormatDetectionParser } from './detections/types';
import type { LoaderParserAdvanced } from './loader/parsers/LoaderParser';
import type { ResolveURLParser } from './resolver/types';

/**
 * A more verbose version of the AssetExtension,
 * allowing you to set the cached, loaded, parsed, and unloaded asset separately
 * @memberof assets
 */
interface AssetExtensionAdvanced<
    ASSET = any,
    PARSED_ASSET = ASSET,
    UNLOAD_ASSET = ASSET,
    CACHE_ASSET = ASSET,
    META_DATA = any
>
{
    /** The type of extension */
    extension: ExtensionType.Asset,
    /** the asset loader */
    loader?: LoaderParserAdvanced<ASSET, PARSED_ASSET, UNLOAD_ASSET, META_DATA>,
    /** the asset resolve parser */
    resolver?: Partial<ResolveURLParser>,
    /** the asset cache parser */
    cache?: Partial<CacheParser<CACHE_ASSET>>,
    /** the asset format detection parser */
    detection?: Partial<FormatDetectionParser>,
}

/**
 * This developer convenience object allows developers to group
 * together the various asset parsers into a single object.
 * @example
 * import { AssetExtension, extensions } from 'pixi.js';
 *
 * // create the CacheParser
 * const cache = {
 *    test(asset: item): boolean {
 *       // Gets called by the cache when a dev caches an asset
 *    },
 *    getCacheableAssets(keys: string[], asset: item): Record<string, any> {
 *       // If the test passes, this function is called to get the cacheable assets
 *       // an example may be that a spritesheet object will return all the sub textures it has so they can
 *       // be cached.
 *    },
 * };
 *
 * // create the ResolveURLParser
 * const resolver = {
 *    test(value: string): boolean {
 *       // the test to perform on the url to determine if it should be parsed
 *    },
 *    parse(value: string): ResolvedAsset {
 *       // the function that will convert the url into an object
 *    },
 * };
 *
 * // create the LoaderParser
 * const loader = {
 *    name: 'itemLoader',
 *    extension: {
 *       type: ExtensionType.LoadParser,
 *    },
 *    async testParse(asset: any, options: ResolvedAsset) {
 *       // This function is used to test if the parse function should be run on the asset
 *    },
 *    async parse(asset: any, options: ResolvedAsset, loader: Loader) {
 *       // Gets called on the asset it testParse passes. Useful to convert a raw asset into something more useful
 *    },
 *    unload(item: any) {
 *       // If an asset is parsed using this parser, the unload function will be called when the user requests an asset
 *       // to be unloaded. This is useful for things like sounds or textures that can be unloaded from memory
 *    },
 * };
 *
 * // put it all together and create the AssetExtension
 * extensions.add({
 *     extension: ExtensionType.Asset,
 *     cache,
 *     resolver,
 *     loader,
 * }
 * @memberof assets
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AssetExtension<ASSET = any, META_DATA = any> extends AssetExtensionAdvanced<ASSET, META_DATA>{}

export type { AssetExtension, AssetExtensionAdvanced };
