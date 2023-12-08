import { extensions, ExtensionType } from '../extensions/Extensions';
import { bitmapFontCachePlugin, loadBitmapFont } from '../scene/text-bitmap/asset/loadBitmapFont';
import { cacheTextureArray } from './cache/parsers/cacheTextureArray';
import { detectAvif } from './detections/parsers/detectAvif';
import { detectDefaults } from './detections/parsers/detectDefaults';
import { detectMp4 } from './detections/parsers/detectMp4';
import { detectOgv } from './detections/parsers/detectOgv';
import { detectWebm } from './detections/parsers/detectWebm';
import { detectWebp } from './detections/parsers/detectWebp';
import { loadJson } from './loader/parsers/loadJson';
import { loadTxt } from './loader/parsers/loadTxt';
import { loadWebFont } from './loader/parsers/loadWebFont';
import { loadSvg } from './loader/parsers/textures/loadSVG';
import { loadTextures } from './loader/parsers/textures/loadTextures';
import { loadVideoTextures } from './loader/parsers/textures/loadVideoTextures';
import { resolveTextureUrl } from './resolver/parsers/resolveTextureUrl';

import type { AssetExtension } from './AssetExtension';

extensions.add(
    cacheTextureArray,

    detectDefaults,
    detectAvif,
    detectWebp,
    detectMp4,
    detectOgv,
    detectWebm,

    loadJson,
    loadTxt,
    loadWebFont,
    loadSvg,
    loadTextures,
    loadVideoTextures,

    resolveTextureUrl,

    // TODO: these should probably be moved to its own init, along with splitting out all the
    // text pipeline stuff
    loadBitmapFont,
    bitmapFontCachePlugin
);

const assetKeyMap = {
    loader: ExtensionType.LoadParser,
    resolver: ExtensionType.ResolveParser,
    cache: ExtensionType.CacheParser,
    detection: ExtensionType.DetectionParser,
};

type AssetType = keyof typeof assetKeyMap;

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
