import { BaseTexture, extensions, ExtensionType, settings, SVGResource, utils } from '@pixi/core';
import { checkDataUrl } from '../../../utils/checkDataUrl';
import { checkExtension } from '../../../utils/checkExtension';
import { LoaderParserPriority } from '../LoaderParser';
import { loadTextures } from './loadTextures';
import { createTexture } from './utils/createTexture';

import type { IBaseTextureOptions, Texture } from '@pixi/core';
import type { ResolvedAsset } from '../../../types';
import type { Loader } from '../../Loader';
import type { LoaderParser } from '../LoaderParser';

const validSVGExtension = '.svg';
const validSVGMIME = 'image/svg+xml';

/**
 * Loads SVG's into Textures.
 * @memberof PIXI
 */
export const loadSVG = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.High,
    },

    name: 'loadSVG',

    test(url: string): boolean
    {
        return checkDataUrl(url, validSVGMIME) || checkExtension(url, validSVGExtension);
    },

    async testParse(data: string): Promise<boolean>
    {
        return SVGResource.test(data);
    },

    async parse(asset: string, data: ResolvedAsset<IBaseTextureOptions>, loader: Loader): Promise<Texture>
    {
        const src = new SVGResource(asset, data?.data?.resourceOptions);

        await src.load();

        const base = new BaseTexture(src, {
            resolution: utils.getResolutionOfUrl(asset),
            ...data?.data,
        });

        base.resource.src = data.src;

        const texture = createTexture(base, loader, data.src);

        return texture;
    },

    async load(url: string, _options: ResolvedAsset): Promise<string>
    {
        const response = await settings.ADAPTER.fetch(url);

        return response.text();
    },

    unload: loadTextures.unload,

} as LoaderParser<Texture | string, IBaseTextureOptions>;

extensions.add(loadSVG);
