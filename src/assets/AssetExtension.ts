import type { ExtensionType } from '../extensions/Extensions';
import type { CacheParser } from './cache/CacheParser';
import type { FormatDetectionParser } from './detections/types';
import type { LoaderParser } from './loader/parsers/LoaderParser';
import type { ResolveURLParser } from './resolver/types';

/**
 * This developer convenience object allows developers to group
 * together the various asset parsers into a single object.
 */
interface AssetExtension<ASSET = any, META_DATA = any>
{
    extension: ExtensionType.Asset,
    loader?: Partial<LoaderParser<ASSET, META_DATA>>,
    resolver?: Partial<ResolveURLParser>,
    cache?: Partial<CacheParser<ASSET>>,
    detection?: Partial<FormatDetectionParser>,
}

export type { AssetExtension };
