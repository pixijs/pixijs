import { extensions, ExtensionType } from '@pixi/core';

import type { CacheParser } from './cache';
import type { FormatDetectionParser } from './detections';
import type { LoaderParser } from './loader';
import type { ResolveURLParser } from './resolver';

const assetKeyMap = {
    loader: ExtensionType.LoadParser,
    resolver: ExtensionType.ResolveParser,
    cache: ExtensionType.CacheParser,
    detection: ExtensionType.DetectionParser,
};

type AssetType = keyof typeof assetKeyMap;

/**
 * This developer convenience object allows developers to group
 * together the various asset parsers into a single object.
 * @memberof PIXI
 */
interface AssetExtension<ASSET = any, META_DATA = any>
{
    extension: ExtensionType.Asset,
    loader?: Partial<LoaderParser<ASSET, META_DATA>>,
    resolver?: Partial<ResolveURLParser>,
    cache?: Partial<CacheParser<ASSET>>,
    detection?: Partial<FormatDetectionParser>,
}

// Split the Asset extension into it's various parts
// these are handled in the Assets.ts file
extensions.handle(ExtensionType.Asset, (extension) =>
{
    const ref = extension.ref as AssetExtension;

    Object.entries(assetKeyMap)
        .filter(([key]) => !!ref[key as AssetType])
        .forEach(([key, type]) => extensions.add(Object.assign(
            ref[key as AssetType],
            // Allow the function to optionally define it's own
            // ExtensionMetadata, the use cases here is priority for LoaderParsers
            { extension: ref[key as AssetType].extension ?? type },
        )));
}, (extension) =>
{
    const ref = extension.ref as AssetExtension;

    Object.keys(assetKeyMap)
        .filter((key) => !!ref[key as AssetType])
        .forEach((key) => extensions.remove(ref[key as AssetType]));
});

export type { AssetExtension };
