import { LoaderParserPriority } from '../../../assets/loader/parsers/LoaderParser';
import { copySearchParams } from '../../../assets/utils/copySearchParams';
import { DOMAdapter } from '../../../environment/adapter';
import { ExtensionType } from '../../../extensions/Extensions';
import { path } from '../../../utils/path';
import { bitmapFontTextParser } from './bitmapFontTextParser';
import { bitmapFontXMLStringParser } from './bitmapFontXMLStringParser';

import type { CacheParser } from '../../../assets/cache/CacheParser';
import type { Loader } from '../../../assets/loader/Loader';
import type { LoaderParserAdvanced } from '../../../assets/loader/parsers/LoaderParser';
import type { ResolvedAsset } from '../../../assets/types';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { BitmapFont } from '../BitmapFont';

const validExtensions = ['.xml', '.fnt'];

/**
 * simple loader plugin for loading in bitmap fonts!
 * @category assets
 * @internal
 */
export const bitmapFontCachePlugin = {
    extension: {
        type: ExtensionType.CacheParser,
        name: 'cacheBitmapFont',
    },
    test: (asset: BitmapFont) => !!asset?.pages && !!asset?.chars && typeof asset?.fontFamily === 'string',
    getCacheableAssets(keys: string[], asset: BitmapFont)
    {
        const out: Record<string, BitmapFont> = {};

        keys.forEach((key) =>
        {
            out[key] = asset;
            out[`${key}-bitmap`] = asset;
        });

        out[`${asset.fontFamily}-bitmap`] = asset;

        return out;
    }
} satisfies CacheParser<BitmapFont>;

/**
 * Loader plugin for loading bitmap fonts.
 * It supports both XML and text formats, and can handle distance field fonts.
 * @category assets
 * @advanced
 */
export const loadBitmapFont = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Normal,
    },

    /** used for deprecation purposes */
    name: 'loadBitmapFont',
    id: 'bitmap-font',

    test(url: string): boolean
    {
        return validExtensions.includes(path.extname(url).toLowerCase());
    },

    async testParse(data: string): Promise<boolean>
    {
        return bitmapFontTextParser.test(data) || bitmapFontXMLStringParser.test(data);
    },

    async parse(asset: string, data: ResolvedAsset, loader: Loader): Promise<BitmapFont>
    {
        const bitmapFontData = bitmapFontTextParser.test(asset)
            ? bitmapFontTextParser.parse(asset)
            : bitmapFontXMLStringParser.parse(asset);

        const { src } = data;
        const { pages } = bitmapFontData;
        const textureUrls = [];

        // if we have a distance field - we can assume this is a signed distance field font
        // and we should use force linear filtering and no alpha premultiply
        const textureOptions = (bitmapFontData.distanceField) ? {
            scaleMode: 'linear',
            alphaMode: 'premultiply-alpha-on-upload',
            autoGenerateMipmaps: false,
            resolution: 1,
        } : {};

        for (let i = 0; i < pages.length; ++i)
        {
            const pageFile = pages[i].file;
            let imagePath = path.join(path.dirname(src), pageFile);

            imagePath = copySearchParams(imagePath, src);

            textureUrls.push({
                src: imagePath,
                data: textureOptions
            });
        }

        const [loadedTextures, { BitmapFont }] = await Promise.all([
            loader.load<Texture>(textureUrls),
            import('../BitmapFont'),
        ]);
        const textures = textureUrls.map((url) => loadedTextures[url.src]);

        const bitmapFont = new BitmapFont({
            data: bitmapFontData,
            textures
        }, src);

        return bitmapFont;
    },

    async load(url: string, _options: ResolvedAsset): Promise<string>
    {
        const response = await DOMAdapter.get().fetch(url);

        return await response.text();
    },

    async unload(bitmapFont: BitmapFont, _resolvedAsset, loader): Promise<void>
    {
        await Promise.all(bitmapFont.pages.map((page) => loader.unload(page.texture.source._sourceOrigin)));

        bitmapFont.destroy();
    }
} satisfies LoaderParserAdvanced<string, BitmapFont, BitmapFont>;
