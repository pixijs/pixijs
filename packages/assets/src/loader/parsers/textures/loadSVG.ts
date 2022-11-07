import { settings, utils, BaseTexture, ExtensionType, SVGResource } from '@pixi/core';
import { LoaderParserPriority } from '../LoaderParser';
import { loadTextures } from './loadTextures';
import { createTexture } from './utils/createTexture';

import type { IBaseTextureOptions, Texture } from '@pixi/core';
import type { Loader } from '../../Loader';
import type { LoadAsset } from '../../types';
import type { LoaderParser } from '../LoaderParser';

/** Loads SVG's into Textures */
export const loadSVG = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.High,
    },

    test(url: string): boolean
    {
        return (utils.path.extname(url).includes('.svg'));
    },

    async testParse(data: string): Promise<boolean>
    {
        return SVGResource.test(data);
    },

    async parse(asset: string, data: LoadAsset<IBaseTextureOptions>, loader: Loader): Promise<Texture>
    {
        const src = new SVGResource(asset, data?.data?.resourceOptions);

        const base = new BaseTexture(src, {
            resolution: utils.getResolutionOfUrl(asset),
            ...data?.data,
        });

        base.resource.src = asset;

        const texture = createTexture(base, loader, asset);

        if (!data?.data?.resourceOptions?.autoLoad)
        {
            await src.load();
        }

        return texture;
    },

    async load(url: string, _options: LoadAsset): Promise<string>
    {
        const response = await settings.ADAPTER.fetch(url);

        return response.text();
    },

    unload: loadTextures.unload,

} as LoaderParser<Texture | string, IBaseTextureOptions>;
