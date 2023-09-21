import { ExtensionType } from '../../../../extensions/Extensions';
import { VideoSource } from '../../../../rendering/renderers/shared/texture/sources/VideoSource';
import { getResolutionOfUrl } from '../../../../utils/network/getResolutionOfUrl';
import { checkDataUrl } from '../../../utils/checkDataUrl';
import { checkExtension } from '../../../utils/checkExtension';
import { LoaderParserPriority } from '../LoaderParser';
import { createTexture } from './utils/createTexture';

import type { TextureSourceOptions } from '../../../../rendering/renderers/shared/texture/sources/TextureSource';
import type {
    VideoResourceOptionsElement,
    VideoSourceOptions
} from '../../../../rendering/renderers/shared/texture/sources/VideoSource';
import type { Texture } from '../../../../rendering/renderers/shared/texture/Texture';
import type { ResolvedAsset } from '../../../types';
import type { Loader } from '../../Loader';
import type { LoaderParser } from '../LoaderParser';

const extensions = VideoSource.TYPES.map((ext) => `.${ext}`);

/**
 * Set cross origin based detecting the url and the crossorigin
 * @param element - Element to apply crossOrigin
 * @param url - URL to check
 * @param crossorigin - Cross origin value to use
 */
export function crossOrigin(element: HTMLImageElement | HTMLVideoElement, url: string, crossorigin?: boolean | string): void
{
    if (crossorigin === undefined && !url.startsWith('data:'))
    {
        element.crossOrigin = determineCrossOrigin(url);
    }
    else if (crossorigin !== false)
    {
        element.crossOrigin = typeof crossorigin === 'string' ? crossorigin : 'anonymous';
    }
}

/**
 * Sets the `crossOrigin` property for this resource based on if the url
 * for this resource is cross-origin. If crossOrigin was manually set, this
 * function does nothing.
 * Nipped from the resource loader!
 * @ignore
 * @param {string} url - The url to test.
 * @param {object} [loc=window.location] - The location object to test against.
 * @returns {string} The crossOrigin value to use (or empty string for none).
 */
export function determineCrossOrigin(url: string, loc: Location = globalThis.location): string
{
    // data: and javascript: urls are considered same-origin
    if (url.startsWith('data:'))
    {
        return '';
    }

    // default is window.location
    loc = loc || globalThis.location;

    const parsedUrl = new URL(url, document.baseURI);

    // if cross origin
    if (parsedUrl.hostname !== loc.hostname || parsedUrl.port !== loc.port || parsedUrl.protocol !== loc.protocol)
    {
        return 'anonymous';
    }

    return '';
}

/**
 * Loads our textures!
 * this makes use of imageBitmaps where available.
 * We load the ImageBitmap on a different thread using the WorkerManager
 * We can then use the ImageBitmap as a source for a Pixi Texture
 *
 * You can customize the behavior of this loader by setting the `config` property.
 * ```js
 * // Set the config
 * import { loadTextures } from '@pixi/assets';
 * loadTextures.config = {
 *    // If true we will use a worker to load the ImageBitmap
 *    preferWorkers: true,
 *    // If false we will use new Image() instead of createImageBitmap
 *    // If false then this will also disable the use of workers as it requires createImageBitmap
 *    preferCreateImageBitmap: true,
 *    crossOrigin: 'anonymous',
 * };
 * ```
 */

export const loadVideoTextures = {

    name: 'loadVideoTextures',

    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.High,
    },

    config: null,

    test(url: string): boolean
    {
        return checkDataUrl(url, Object.values(VideoSource.MIME_TYPES)) || checkExtension(url, extensions);
    },

    async load(
        url: Array<string | VideoResourceOptionsElement>
        | string, asset: ResolvedAsset<TextureSourceOptions>,
        loader: Loader
    ): Promise<Texture>
    {
        const firstSrc = typeof url === 'string'
            ? url
            : (url[0] as VideoResourceOptionsElement).src || url[0] as string;

        // Merge provided options with default ones
        const options: VideoSourceOptions = {
            ...VideoSource.defaultOptions,
            resolution: asset.data?.resolution || getResolutionOfUrl(firstSrc),
            ...asset.data,
        };

        let source = url;

        // Create a new HTMLVideoElement with the given options
        const videoElement = document.createElement('video');

        if (options.autoLoad !== false)
        {
            videoElement.setAttribute('preload', 'auto');
        }
        if (options.playsinline !== false)
        {
            videoElement.setAttribute('webkit-playsinline', '');
            videoElement.setAttribute('playsinline', '');
        }
        if (options.muted === true)
        {
            videoElement.setAttribute('muted', '');
            videoElement.muted = true;
        }
        if (options.loop === true)
        {
            videoElement.setAttribute('loop', '');
        }
        if (options.autoPlay !== false)
        {
            videoElement.setAttribute('autoplay', '');
        }

        // Convert single string source to an array
        if (typeof source === 'string')
        {
            source = [source];
        }

        crossOrigin(videoElement, firstSrc, options.crossorigin);

        // Handle array of objects or strings
        for (const srcOption of source)
        {
            const sourceElement = document.createElement('source');
            let { src, mime } = srcOption as VideoResourceOptionsElement;

            src = src ?? srcOption as string;

            if (src.startsWith('data:'))
            {
                mime = src.slice(5, src.indexOf(';'));
            }
            else if (!src.startsWith('blob:'))
            {
                const ext = src.split('?')[0].slice(src.lastIndexOf('.') + 1).toLowerCase();

                mime = mime || VideoSource.MIME_TYPES[ext] || `video/${ext}`;
            }

            sourceElement.src = src;

            if (mime)
            {
                sourceElement.type = mime;
            }

            videoElement.appendChild(sourceElement);
        }

        const base = new VideoSource({ ...options, resource: videoElement });

        return createTexture(base, loader, firstSrc);
    },

    unload(texture: Texture): void
    {
        texture.destroy(true);
    }
} as LoaderParser<Texture, VideoSourceOptions, null>;
