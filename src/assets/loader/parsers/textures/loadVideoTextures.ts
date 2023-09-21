import { ExtensionType } from '../../../../extensions/Extensions';
import { VideoSource } from '../../../../rendering/renderers/shared/texture/sources/VideoSource';
import { getResolutionOfUrl } from '../../../../utils/network/getResolutionOfUrl';
import { checkDataUrl } from '../../../utils/checkDataUrl';
import { checkExtension } from '../../../utils/checkExtension';
import { LoaderParserPriority } from '../LoaderParser';
import { createTexture } from './utils/createTexture';

import type { TextureSourceOptions } from '../../../../rendering/renderers/shared/texture/sources/TextureSource';
import type { VideoSourceOptions } from '../../../../rendering/renderers/shared/texture/sources/VideoSource';
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
 * Loads our video textures!
 *
 * You can pass VideoSource options to the loader via the .data property of the asset
 * when using Asset.load().
 * ```js
 * // Set the data
 * const texture = await Assets.load({
 *     src: './assets/city.mp4',
 *     data: {
 *         preload: true,
 *         autoPlay: true,
 *     },
 * });
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

    async load(url: string, asset: ResolvedAsset<TextureSourceOptions>, loader: Loader): Promise<Texture>
    {
        // --- Merge default and provided options ---
        const options: VideoSourceOptions = {
            ...VideoSource.defaultOptions,
            resolution: asset.data?.resolution || getResolutionOfUrl(url), // Assume getResolutionOfUrl is globally available
            ...asset.data,
        };

        // --- Create and configure HTMLVideoElement ---
        const videoElement = document.createElement('video');

        // Set attributes based on options
        const attributeMap = {
            preload: options.autoLoad !== false ? 'auto' : undefined,
            'webkit-playsinline': options.playsinline !== false ? '' : undefined,
            playsinline: options.playsinline !== false ? '' : undefined,
            muted: options.muted === true ? '' : undefined,
            loop: options.loop === true ? '' : undefined,
            autoplay: options.autoPlay !== false ? '' : undefined
        };

        Object.keys(attributeMap).forEach((key) =>
        {
            const value = attributeMap[key as keyof typeof attributeMap];

            if (value !== undefined) videoElement.setAttribute(key, value);
        });

        if (options.muted === true)
        {
            videoElement.muted = true;
        }

        crossOrigin(videoElement, url, options.crossorigin); // Assume crossOrigin is globally available

        // --- Set up source and MIME type ---
        const sourceElement = document.createElement('source');

        // Determine MIME type
        let mime: string | undefined;

        if (url.startsWith('data:'))
        {
            mime = url.slice(5, url.indexOf(';'));
        }
        else if (!url.startsWith('blob:'))
        {
            const ext = url.split('?')[0].slice(url.lastIndexOf('.') + 1).toLowerCase();

            mime = VideoSource.MIME_TYPES[ext] || `video/${ext}`;
        }

        sourceElement.src = url;

        if (mime)
        {
            sourceElement.type = mime;
        }

        videoElement.appendChild(sourceElement);

        // --- Create texture ---
        const base = new VideoSource({ ...options, resource: videoElement });

        return createTexture(base, loader, url);
    },

    unload(texture: Texture): void
    {
        texture.destroy(true);
    }
} as LoaderParser<Texture, VideoSourceOptions, null>;
