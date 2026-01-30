/* eslint-disable no-restricted-globals */
import { type ImageLike } from '../../../../environment/ImageLike';
import { ExtensionType } from '../../../../extensions/Extensions';
import { VideoSource } from '../../../../rendering/renderers/shared/texture/sources/VideoSource';
import { detectVideoAlphaMode } from '../../../../utils/browser/detectVideoAlphaMode';
import { getResolutionOfUrl } from '../../../../utils/network/getResolutionOfUrl';
import { testVideoFormat } from '../../../detections/utils/testVideoFormat';
import { checkDataUrl } from '../../../utils/checkDataUrl';
import { checkExtension } from '../../../utils/checkExtension';
import { createTexture } from './utils/createTexture';

import type { VideoSourceOptions } from '../../../../rendering/renderers/shared/texture/sources/VideoSource';
import type { Texture } from '../../../../rendering/renderers/shared/texture/Texture';
import type { ResolvedAsset } from '../../../types';
import type { Loader } from '../../Loader';
import type { LoaderParser } from '../LoaderParser';

const potentialVideoExtensions = ['.mp4', '.m4v', '.webm', '.ogg', '.ogv', '.h264', '.avi', '.mov'];
let validVideoExtensions: string[];
let validVideoMIMEs: string[];

/**
 * Set cross origin based detecting the url and the crossorigin
 * @param element - Element to apply crossOrigin
 * @param url - URL to check
 * @param crossorigin - Cross origin value to use
 * @category assets
 * @advanced
 */
export function crossOrigin(element: ImageLike | HTMLVideoElement, url: string, crossorigin?: boolean | string): void
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
 * Preload a video element
 * @param element - Video element to preload
 * @internal
 */
export function preloadVideo(element: HTMLVideoElement): Promise<void>
{
    return new Promise((resolve, reject) =>
    {
        element.addEventListener('canplaythrough', loaded);
        element.addEventListener('error', error);

        element.load();

        function loaded(): void
        {
            cleanup();
            resolve();
        }

        function error(err: ErrorEvent): void
        {
            cleanup();
            reject(err);
        }

        function cleanup(): void
        {
            element.removeEventListener('canplaythrough', loaded);
            element.removeEventListener('error', error);
        }
    });
}

/**
 * Sets the `crossOrigin` property for this resource based on if the url
 * for this resource is cross-origin. If crossOrigin was manually set, this
 * function does nothing.
 * Nipped from the resource loader!
 * @ignore
 * @param url - The url to test.
 * @param {object} [loc=window.location] - The location object to test against.
 * @returns The crossOrigin value to use (or empty string for none).
 * @category assets
 */
export function determineCrossOrigin(url: string, loc: Location = globalThis.location): string
{
    // data: and javascript: urls are considered same-origin
    if (url.startsWith('data:'))
    {
        return '';
    }

    // default is window.location
    loc ||= globalThis.location;

    const parsedUrl = new URL(url, document.baseURI);

    // if cross origin
    if (parsedUrl.hostname !== loc.hostname || parsedUrl.port !== loc.port || parsedUrl.protocol !== loc.protocol)
    {
        return 'anonymous';
    }

    return '';
}

type LoadVideoData = VideoSourceOptions & {
    mime?: string;
};

/**
 * Get the supported video extensions and MIME types based on the browser's capabilities.
 * This function checks the potential video extensions against the browser's supported formats.
 * @returns An object containing valid video extensions and MIME types.
 * @internal
 */
function getBrowserSupportedVideoExtensions()
{
    const supportedExtensions: string[] = [];
    const supportedMimes: string[] = [];

    for (const ext of potentialVideoExtensions)
    {
        const mimeType = VideoSource.MIME_TYPES[ext.substring(1)] || `video/${ext.substring(1)}`;

        if (testVideoFormat(mimeType))
        {
            supportedExtensions.push(ext);
            if (!supportedMimes.includes(mimeType))
            {
                supportedMimes.push(mimeType);
            }
        }
    }

    return {
        validVideoExtensions: supportedExtensions,
        validVideoMime: supportedMimes
    };
}

/**
 * A simple plugin to load video textures.
 *
 * You can pass VideoSource options to the loader via the .data property of the asset descriptor
 * when using Assets.load().
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
 * @category assets
 * @advanced
 */
export const loadVideoTextures = {

    /** used for deprecation purposes */
    name: 'loadVideo',
    id: 'video',

    extension: {
        type: ExtensionType.LoadParser,
        name: 'loadVideo',
    },

    test(url: string): boolean
    {
        if (!validVideoExtensions || !validVideoMIMEs)
        {
            const { validVideoExtensions: ve, validVideoMime: vm } = getBrowserSupportedVideoExtensions();

            validVideoExtensions = ve;
            validVideoMIMEs = vm;
        }
        const isValidDataUrl = checkDataUrl(url, validVideoMIMEs);
        const isValidExtension = checkExtension(url, validVideoExtensions);

        return isValidDataUrl || isValidExtension;
    },

    async load(url: string, asset: ResolvedAsset<LoadVideoData>, loader: Loader): Promise<Texture>
    {
        // --- Merge default and provided options ---
        const options: LoadVideoData = {
            ...VideoSource.defaultOptions,
            resolution: asset.data?.resolution || getResolutionOfUrl(url),
            alphaMode: asset.data?.alphaMode || await detectVideoAlphaMode(),
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

        if (options.mime)
        {
            mime = options.mime;
        }
        else if (url.startsWith('data:'))
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

        // this promise will make sure that video is ready to play - as in we have a valid width, height and it can be
        // uploaded to the GPU. Our textures are kind of dumb now, and don't want to handle resizing right now.
        return new Promise((resolve, reject) =>
        {
            if (options.preload && !options.autoPlay)
            {
                videoElement.load();
            }

            videoElement.addEventListener('canplay', onCanPlay);
            videoElement.addEventListener('error', onError);
            sourceElement.addEventListener('error', onError);
            videoElement.appendChild(sourceElement);

            async function onCanPlay()
            {
                const base = new VideoSource({ ...options, resource: videoElement });

                cleanup();

                if (asset.data.preload)
                {
                    await preloadVideo(videoElement);
                }

                resolve(createTexture(base, loader, url));
            }

            function onError(event: Event | ErrorEvent)
            {
                cleanup();
                reject(event);
            }

            function cleanup()
            {
                videoElement.removeEventListener('canplay', onCanPlay);
                videoElement.removeEventListener('error', onError);
                sourceElement.removeEventListener('error', onError);
            }
        });
    },

    unload(texture: Texture): void
    {
        texture.destroy(true);
    }
} satisfies LoaderParser<Texture, LoadVideoData>;
