import { BaseTexture, extensions, ExtensionType, settings, utils, VideoResource } from '@pixi/core';
import { checkDataUrl } from '../../../utils/checkDataUrl';
import { checkExtension } from '../../../utils/checkExtension';
import { LoaderParserPriority } from '../LoaderParser';
import { createTexture } from './utils/createTexture';

import type { IBaseTextureOptions, IVideoResourceOptions, Texture } from '@pixi/core';
import type { ResolvedAsset } from '../../../types';
import type { Loader } from '../../Loader';
import type { LoaderParser } from '../LoaderParser';

const validVideoExtensions = ['.mp4', '.m4v', '.webm', '.ogv'];
const validVideoMIMEs = [
    'video/mp4',
    'video/webm',
    'video/ogg',
];

/**
 * Configuration for the `loadVideo` loader paarser.
 * @memberof PIXI
 * @see PIXI.loadVideo
 */
export interface LoadVideoConfig
{
    /**
     * When set to `true`, the video will start playing automatically after being loaded,
     * otherwise it will not start playing automatically.
     * @default true
     */
    defaultAutoPlay: boolean;
}

/**
 * Loads videos into Textures.
 * @memberof PIXI
 */
export const loadVideo = {
    name: 'loadVideo',

    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.High,
    },

    config: {
        defaultAutoPlay: true,
    },

    test(url: string): boolean
    {
        return checkDataUrl(url, validVideoMIMEs) || checkExtension(url, validVideoExtensions);
    },

    async load(
        url: string,
        loadAsset?: ResolvedAsset<IBaseTextureOptions<IVideoResourceOptions>>,
        loader?: Loader): Promise<Texture>
    {
        let texture: Texture;
        const response = await settings.ADAPTER.fetch(url);
        const blob = await response.blob();
        const blobURL = URL.createObjectURL(blob);

        try
        {
            const options = {
                autoPlay: this.config.defaultAutoPlay,
                ...loadAsset?.data?.resourceOptions,
            };
            const src = new VideoResource(blobURL, options);

            await src.load();

            const base = new BaseTexture(src, {
                alphaMode: await utils.detectVideoAlphaMode(),
                resolution: utils.getResolutionOfUrl(url),
                ...loadAsset?.data,
            });

            base.resource.src = url;
            texture = createTexture(base, loader, url);
            texture.baseTexture.once('destroyed', () =>
            {
                URL.revokeObjectURL(blobURL);
            });
        }
        catch (e)
        {
            URL.revokeObjectURL(blobURL);

            throw e;
        }

        return texture;
    },

    unload(texture: Texture): void
    {
        texture.destroy(true);
    }
} as LoaderParser<Texture, IBaseTextureOptions<IVideoResourceOptions>, LoadVideoConfig>;

extensions.add(loadVideo);
