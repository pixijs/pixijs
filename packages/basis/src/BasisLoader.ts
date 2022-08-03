import type { TYPES } from '@pixi/constants';
import { MIPMAP_MODES, ALPHA_MODES, FORMATS } from '@pixi/constants';
import type { BufferResource, ExtensionMetadata } from '@pixi/core';
import { extensions, BaseTexture, ExtensionType, Texture } from '@pixi/core';
import { CompressedTextureResource } from '@pixi/compressed-textures';
import type {
    BasisBinding } from './Basis';
import {
    BASIS_FORMATS,
    BASIS_FORMAT_TO_TYPE,
} from './Basis';
import { TranscoderWorker } from './TranscoderWorker';
import { LoaderResource } from '@pixi/loaders';

import type { IResourceMetadata } from '@pixi/loaders';
import type { TranscodedResourcesArray } from './BasisParser';
import { BasisParser } from './BasisParser';

/**
 * Result when calling registerCompressedTextures.
 * @ignore
 */
 type BasisTexturesResult = Pick<LoaderResource, 'textures' | 'texture'>;

LoaderResource.setExtensionXhrType('basis', LoaderResource.XHR_RESPONSE_TYPE.BUFFER);

/**
 * Loader plugin for handling BASIS supercompressed texture files.
 *
 * To use this loader, you must bind the basis_universal WebAssembly transcoder. There are two ways of
 * doing this:
 *
 * 1. Adding a &lt;script&gt; tag to your HTML page to the transcoder bundle in this package, and serving
 * the WASM binary from the same location.
 *
 * ```js
 * // Copy ./node_modules/@pixi/basis/assets/basis_.wasm into your assets directory
 * // as well, so it is served from the same folder as the JavaScript!
 * &lt;script src="./node_modules/@pixi/basis/assets/basis_transcoder.js" /&gt;
 * ```
 *
 * NOTE: `basis_transcoder.js` expects the WebAssembly binary to be named `basis_transcoder.wasm`.
 * NOTE-2: This method supports transcoding on the main-thread. Only use this if you have 1 or 2 *.basis
 * files.
 *
 * 2. Loading the transcoder source from a URL.
 *
 * ```js
 * // Use this if you to use the default CDN url for @pixi/basis
 * BasisLoader.loadTranscoder();
 *
 * // Use this if you want to serve the transcoder on your own
 * BasisLoader.loadTranscoder('./basis_transcoder.js', './basis_transcoder.wasm');
 * ```
 *
 * NOTE: This can only be used with web-workers.
 * @class
 * @memberof PIXI
 * @implements {PIXI.ILoaderPlugin}
 */
export class BasisLoader
{
    /** @ignore */
    static extension: ExtensionMetadata = ExtensionType.Loader;

    /**
     * Transcodes the *.basis data when the data is loaded. If the transcoder is not bound yet, it
     * will hook transcoding to {@link BasisResource#onTranscoderInitialized}.
     * @see PIXI.Loader.loaderMiddleware
     * @param resource - loader resource that is checked to see if it is a basis file
     * @param next - callback Function to call when done
     */
    public static use(resource: LoaderResource, next: (...args: any[]) => void): void
    {
        if (resource.extension === 'basis' && resource.data)
        {
            (async () =>
            {
                if (!BasisParser.basisBinding && (!BasisParser.TranscoderWorker.wasmSource))
                {
                    await TranscoderWorker.onTranscoderInitialized;
                }

                const resources = await BasisParser.transcode(resource.data);

                Object.assign(resource, BasisLoader.registerTextures(
                    resource.url,
                    resources,
                    resource.metadata,
                ));

                next();
            })();
        }
        else
        {
            next();
        }
    }

    /**
     * Creates textures and adds them to the texture cache
     * @private
     * @param url - url of the texture to be used as its ID for the texture cache
     * @param resources - the transcoded resources
     * @param metadata - resource metadata
     */
    private static registerTextures(
        url: string,
        resources: TranscodedResourcesArray,
        metadata: IResourceMetadata,
    ): BasisTexturesResult
    {
        const result: BasisTexturesResult = {
            textures: {},
            texture: null,
        };

        if (!resources)
        {
            return result;
        }

        // Should be a valid TYPES, FORMATS for uncompressed basis formats
        const type: TYPES = BASIS_FORMAT_TO_TYPE[resources.basisFormat];
        const format: FORMATS = resources.basisFormat !== BASIS_FORMATS.cTFRGBA32 ? FORMATS.RGB : FORMATS.RGBA;
        const resourceList = resources as Array<CompressedTextureResource | BufferResource>;

        const textures = resourceList.map((resource) =>
            (
                new Texture(new BaseTexture(resource, Object.assign({
                    mipmap: resource instanceof CompressedTextureResource && resource.levels > 1
                        ? MIPMAP_MODES.ON_MANUAL
                        : MIPMAP_MODES.OFF,
                    alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA,
                    type,
                    format,
                }, metadata)))
            ));

        textures.forEach((texture: Texture, i: number) =>
        {
            const { baseTexture } = texture;
            const cacheID = `${url}-${i + 1}`;

            BaseTexture.addToCache(baseTexture, cacheID);
            Texture.addToCache(texture, cacheID);

            if (i === 0)
            {
                BaseTexture.addToCache(baseTexture, url);
                Texture.addToCache(texture, url);
                result.texture = texture;
            }

            result.textures[cacheID] = texture;
        });

        return result;
    }

    /**
     * Binds the basis_universal transcoder to decompress *.basis files. You must initialize the transcoder library yourself.
     *
     * ```js
     * import { BasisLoader } from '@pixi/basis';
     * import { Loader } from '@pixi/loaders';
     *
     * // window.BASIS() returns a Promise-like object
     * window.BASIS().then((basisLibrary) =>
     * {
     *     // Initialize basis-library; otherwise, transcoded results maybe corrupt!
     *     basisLibrary.initializeBasis();
     *
     *     // Bind BasisLoader to the transcoder
     *     BasisLoader.bindTranscoder(basisLibrary);
     * });
     * ```
     * @param basisLibrary - the initialized transcoder library
     * @private
     */
    static bindTranscoder(basisLibrary: BasisBinding): void
    {
        BasisParser.basisBinding = basisLibrary;
    }

    /**
     * Loads the transcoder source code for use in {@link PIXI.BasisLoader.TranscoderWorker}.
     * @private
     * @param jsURL - URL to the javascript basis transcoder
     * @param wasmURL - URL to the wasm basis transcoder
     */
    static loadTranscoder(jsURL: string, wasmURL: string): Promise<[void, void]>
    {
        return BasisParser.TranscoderWorker.loadTranscoder(jsURL, wasmURL);
    }

    /**
     * Set the transcoder source code directly
     * @private
     * @param jsSource - source for the javascript basis transcoder
     * @param wasmSource - source for the wasm basis transcoder
     */
    static setTranscoder(jsSource: string, wasmSource: ArrayBuffer): void
    {
        BasisParser.TranscoderWorker.setTranscoder(jsSource, wasmSource);
    }
}

extensions.add(BasisLoader);
