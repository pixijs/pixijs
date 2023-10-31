import type { ExtensionType } from '../extensions/Extensions';
import type { CacheParser } from './cache/CacheParser';
import type { FormatDetectionParser } from './detections/types';
import type { LoaderParser } from './loader/parsers/LoaderParser';
import type { ResolveURLParser } from './resolver/types';

/**
 * This developer convenience object allows developers to group
 * together the various asset parsers into a single object.
 * @example
 * import { AssetExtension, extensions } from 'pixi.js';
 *
 * extensions.add({
 *     extension: ExtensionType.Asset,
 *     cache: {
 *         test: (asset: item) => {},
 *         getCacheableAssets: (keys: string[], asset: item) => {},
 *     },
 *     resolver: {
 *         test: (value: string): boolean =>{},
 *         parse: (value: string): UnresolvedAsset =>{},
 *     },
 *     loader: {
 *         name: 'itemLoader',
 *         extension: {
 *             type: ExtensionType.LoadParser,
 *         },
 *         async testParse(asset: any, options: ResolvedAsset) {},
 *         async parse(asset: any, options: ResolvedAsset, loader: Loader) {},
 *         unload(item: any){},
 *     },
 * }
 * @memberof assets
 */
interface AssetExtension<ASSET = any, META_DATA = any>
{
    /** The type of extension */
    extension: ExtensionType.Asset,
    /** the asset loader */
    loader?: LoaderParser<ASSET, META_DATA>,
    /** the asset resolve parser */
    resolver?: Partial<ResolveURLParser>,
    /** the asset cache parser */
    cache?: Partial<CacheParser<ASSET>>,
    /** the asset format detection parser */
    detection?: Partial<FormatDetectionParser>,
}

export type { AssetExtension };
