import type { ISVGResourceOptions, Texture } from '@pixi/core';
import { BaseTexture, ExtensionType, SVGResource } from '@pixi/core';
import { settings } from '@pixi/settings';
import { getResolutionOfUrl } from '@pixi/utils';
import { extname } from '../../../utils';
import type { Loader } from '../../Loader';
import type { LoadAsset } from '../../types';

import type { LoaderParser } from '../LoaderParser';
import { loadTextures } from './loadTexture';
import { createTexture } from './utils/createTexture';

export type SVGTextureData = {
    baseTexture: BaseTexture;
    svgResource: ISVGResourceOptions;
};

/** Loads SVG's into Textures */
export const loadSVG = {
    extension: ExtensionType.LoadParser,

    test(url: string): boolean
    {
        return (extname(url).includes('.svg'));
    },

    async testParse(data: string): Promise<boolean>
    {
        return SVGResource.test(data);
    },

    async parse(asset: string, data: LoadAsset<SVGTextureData>, loader: Loader): Promise<Texture>
    {
        const src = new SVGResource(asset, data?.data?.svgResource);

        const base = new BaseTexture(src, {
            resolution: getResolutionOfUrl(asset),
            ...data?.data?.baseTexture,
        });

        base.resource.src = asset;

        const texture = createTexture(base, loader, asset);

        if (!data?.data?.svgResource?.autoLoad)
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

} as LoaderParser<Texture | string, SVGTextureData>;
