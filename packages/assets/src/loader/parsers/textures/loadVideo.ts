import { BaseTexture, extensions, ExtensionType, utils, VideoResource } from '@pixi/core';
import { checkDataUrl } from '../../../utils/checkDataUrl';
import { checkExtension } from '../../../utils/checkExtension';
import { LoaderParserPriority } from '../LoaderParser';
import { createTexture } from './utils/createTexture';

import type { IBaseTextureOptions, Texture } from '@pixi/core';
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
 * Loads videos into Textures.
 * @memberof PIXI
 */
export const loadVideo = {
    name: 'loadVideo',

    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.High,
    },

    test(url: string): boolean
    {
        return checkDataUrl(url, validVideoExtensions) || checkExtension(url, validVideoMIMEs);
    },

    async load(url: string, loadAsset?: ResolvedAsset<IBaseTextureOptions>, loader?: Loader): Promise<Texture>
    {
        const src = new VideoResource(url, loadAsset?.data?.resourceOptions);

        const base = new BaseTexture(src, {
            resolution: utils.getResolutionOfUrl(url),
            ...loadAsset?.data,
        });

        base.resource.src = url;

        const texture = createTexture(base, loader, url);

        return texture;
    },

    unload(texture: Texture): void
    {
        texture.destroy(true);
    }
} as LoaderParser<Texture, IBaseTextureOptions>;

extensions.add(loadVideo);
