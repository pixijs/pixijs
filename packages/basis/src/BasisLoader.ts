import { INTERNAL_FORMATS, TYPES, MIPMAP_MODES, ALPHA_MODES } from '@pixi/constants';
import { resources, BaseTexture, Texture } from '@pixi/core';
import { Runner } from '@pixi/runner';
import {
    BASIS_FORMATS,
    BASIS_FORMAT_TO_INTERNAL_FORMAT,
    INTERNAL_FORMAT_TO_BASIS_FORMAT,
    BASIS_FORMATS_ALPHA,
    BasisTextureExtensions,
    BasisBinding
} from './Basis';
import { ITranscodeResponse } from './TranscoderWorkerWrapper';
import { TranscoderWorker } from './TranscoderWorker';
import { ILoaderResource, LoaderResource } from '@pixi/loaders';

const { CompressedTextureResource } = resources;

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
 */
export class BasisLoader
{
    /**
     * The maximum number of workers to be created for transcoding. By default, this is 1.
     */
    static WORKER_POOL_LIMIT = 1;

    static basisBinding: BasisBinding;
    static defaultRGBFormat: { basisFormat: BASIS_FORMATS, textureFormat: INTERNAL_FORMATS | TYPES };
    static defaultRGBAFormat: { basisFormat: BASIS_FORMATS, textureFormat: INTERNAL_FORMATS | TYPES };
    static onTranscoderInitializedRunner = new Runner('onTranscoderInitialized');

    static workerPool: TranscoderWorker[] = [];

    /**
     * Transcodes the *.basis data when the data is loaded. If the transcoder is not bound yet, it
     * will hook transcoding to {@link BasisResource#onTranscoderInitialized}.
     *
     * @param resource
     * @param next
     */
    public static use(resource: ILoaderResource, next: (...args: any[]) => void): void
    {
        if (resource.extension === 'basis' && resource.data)
        {
            if (BasisLoader.isTranscoderAvailable())
            {
                BasisLoader.transcode(resource, next);
            }
            else
            {
                BasisLoader.onTranscoderInitializedRunner.add(() =>
                {
                    BasisLoader.transcode(resource, next);
                });
            }
        }
        else
        {
            next();
        }
    }

    /**
     * Whether a transcoder is bound, either worker-based or main-thread based.
     */
    private static isTranscoderAvailable(): boolean
    {
        return !!BasisLoader.basisBinding || (!!BasisLoader.TranscoderWorker.wasmSource);
    }

    /**
     * Runs transcoding and populates {@link imageArray}. It will run the transcoding in a web worker
     * if they are available.
     */
    private static transcode(resource: ILoaderResource, next: (...args: any[]) => void): void
    {
        const data = resource.data;

        if (typeof Worker !== 'undefined' && BasisLoader.TranscoderWorker.wasmSource)
        {
            BasisLoader.transcodeAsync(data as ArrayBuffer)
                .then((resources) => { BasisLoader.registerTextures(resource.url, resources); })
                .then(() => { next(); });

            return;
        }

        BasisLoader.registerTextures(resource.url, BasisLoader.transcodeSync(data as ArrayBuffer));
        next();
    }

    private static registerTextures(url: string, resources: resources.CompressedTextureResource[]): void
    {
        if (!resources)
        {
            return;
        }

        resources.forEach((resource, i) =>
        {
            const baseTexture = new BaseTexture(resource, {
                mipmap: MIPMAP_MODES.OFF,
                alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA
            });
            const cacheID = `${url}-${i + 1}`;

            BaseTexture.addToCache(baseTexture, cacheID);
            Texture.addToCache(new Texture(baseTexture), cacheID);

            if (i === 0)
            {
                BaseTexture.addToCache(baseTexture, url);
                Texture.addToCache(new Texture(baseTexture), url);
            }
        });
    }

    /**
     * Finds a suitable worker for transcoding and sends a transcoding request
     */
    private static async transcodeAsync(arrayBuffer: ArrayBuffer): Promise<resources.CompressedTextureResource[]>
    {
        const workerPool = BasisLoader.workerPool;

        let leastLoad = 0x10000000;
        let worker = null;

        for (let i = 0, j = workerPool.length; i < j; i++)
        {
            if (workerPool[i].load < leastLoad)
            {
                worker = workerPool[i];
                leastLoad = worker.load;
            }
        }

        if (!worker)
        {
            /* eslint-disable-next-line no-use-before-define */
            worker = new TranscoderWorker();
            await worker.initAsync();

            workerPool.push(worker);
        }

        return worker.transcodeAsync(
            new Uint8Array(arrayBuffer),
            BasisLoader.defaultRGBAFormat.basisFormat,
            BasisLoader.defaultRGBFormat.basisFormat
        ).then(
            (response: ITranscodeResponse): resources.CompressedTextureResource[] =>
            {
                const imageArray = response.imageArray;
                const format = BASIS_FORMAT_TO_INTERNAL_FORMAT[response.basisFormat];

                // HINT: this.imageArray is CompressedTextureResource[]
                const imageResources = new Array<resources.CompressedTextureResource>(imageArray.length);

                for (let i = 0, j = imageArray.length; i < j; i++)
                {
                    imageResources[i] = new CompressedTextureResource(null, {
                        format,
                        width: imageArray[i].width,
                        height: imageArray[i].height,
                        levelBuffers: imageArray[i].levelArray,
                        levels: imageArray[i].levelArray.length
                    });
                }

                return imageResources;
            }, () =>
            {
                throw new Error('Basis worker failed to transcode data');
            });
    }

    /**
     * Runs transcoding on the main thread.
     */
    private static transcodeSync(arrayBuffer: ArrayBuffer): resources.CompressedTextureResource[]
    {
        const BASIS = BasisLoader.basisBinding;

        const data = new Uint8Array(arrayBuffer);
        const basisFile = new BASIS.BasisFile(data);
        const imageCount = basisFile.getNumImages();
        const hasAlpha = basisFile.getHasAlpha();

        const basisFormat = hasAlpha
            ? BasisLoader.defaultRGBAFormat.basisFormat
            : BasisLoader.defaultRGBFormat.basisFormat;

        const imageResources = new Array<resources.CompressedTextureResource>(imageCount);

        if (!basisFile.startTranscoding())
        {
            console.error(`Basis failed to start transcoding!`);

            basisFile.close();
            basisFile.delete();

            return null;
        }

        for (let i = 0; i < imageCount; i++)
        {
            // TODO: Support mipmap levels
            // TODO: Handle RGB565 case
            // We do assume there is at least one level per image :confused:

            const width = basisFile.getImageWidth(i, 0);
            const height = basisFile.getImageHeight(i, 0);
            const byteSize = basisFile.getImageTranscodedSizeInBytes(i, 0, basisFormat);

            const alignedWidth = (width + 3) & ~3;
            const alignedHeight = (height + 3) & ~3;

            const imageBuffer = new Uint8Array(byteSize);
            const imageResource = new CompressedTextureResource(imageBuffer, {
                format: BASIS_FORMAT_TO_INTERNAL_FORMAT[basisFormat],
                width: alignedWidth,
                height: alignedHeight
            });

            if (!basisFile.transcodeImage(imageBuffer, i, 0, basisFormat, false, false))
            {
                console.error(`Basis failed to transcode image ${i}, level ${0}!`);
                break;
            }

            imageResources[i] = imageResource;
        }

        basisFile.close();
        basisFile.delete();

        return imageResources;
    }

    /**
     * Detects the available compressed texture formats on the device.
     *
     * @param extensions - extensions provided by a WebGL context
     * @ignore
     */
    static autoDetectFormats(extensions?: Partial<BasisTextureExtensions>): void
    {
        // Auto-detect WebGL compressed-texture extensions
        if (!extensions)
        {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');

            if (!gl)
            {
                console.error('WebGL not available for BASIS transcoding. Silently failing.');

                return;
            }

            extensions = {
                s3tc: gl.getExtension('WEBGL_compressed_texture_s3tc'),
                s3tc_sRGB: gl.getExtension('WEBGL_compressed_texture_s3tc_srgb'), /* eslint-disable-line camelcase */
                etc: gl.getExtension('WEBGL_compressed_texture_etc'),
                etc1: gl.getExtension('WEBGL_compressed_texture_etc1'),
                pvrtc: gl.getExtension('WEBGL_compressed_texture_pvrtc'),
                atc: gl.getExtension('WEBGL_compressed_texture_atc'),
                astc: gl.getExtension('WEBGL_compressed_texture_astc')
            };
        }

        // Discover the available texture formats
        const supportedFormats: { [id: string]: INTERNAL_FORMATS } = {};

        for (const key in extensions)
        {
            const extension = (extensions as any)[key];

            if (!extension)
            {
                continue;
            }

            Object.assign(supportedFormats, Object.getPrototypeOf(extension));
        }

        // Set the default alpha/non-alpha output formats for basisu transcoding
        for (let i = 0; i < 2; i++)
        {
            const detectWithAlpha = !!i;
            let internalFormat: number;
            let basisFormat: number;

            for (const id in supportedFormats)
            {
                internalFormat = supportedFormats[id];
                basisFormat = INTERNAL_FORMAT_TO_BASIS_FORMAT[internalFormat];

                if (basisFormat !== undefined)
                {
                    if ((detectWithAlpha && BASIS_FORMATS_ALPHA[basisFormat])
                        || (!detectWithAlpha && !BASIS_FORMATS_ALPHA[basisFormat]))
                    {
                        break;
                    }
                }
            }

            if (internalFormat)
            {
                BasisLoader[detectWithAlpha ? 'defaultRGBAFormat' : 'defaultRGBFormat'] = {
                    textureFormat: internalFormat,
                    basisFormat,
                };
            }
            else
            {
                BasisLoader[detectWithAlpha ? 'defaultRGBAFormat' : 'defaultRGBFormat'] = {
                    textureFormat: TYPES.UNSIGNED_SHORT_5_6_5,
                    basisFormat: BASIS_FORMATS.cTFRGB565
                };
            }
        }
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
     *
     * @param basisu - the initialized transcoder library
     */
    static bindTranscoder(basisLibrary: BasisBinding): void
    {
        BasisLoader.basisBinding = basisLibrary;
    }

    /**
     * Loads the transcoder source code for use in {@link PIXI.BasisLoader.TranscoderWorker}.
     *
     * @param jsURL
     * @param wasmURL
     */
    static loadTranscoder(jsURL: string, wasmURL: string): Promise<[void, void]>
    {
        return BasisLoader.TranscoderWorker.loadTranscoder(jsURL, wasmURL);
    }

    /**
     * Set the transcoder source code directly
     *
     * @param jsSource
     * @param wasmSource
     */
    static setTranscoder(jsSource: string, wasmSource: ArrayBuffer): void
    {
        BasisLoader.TranscoderWorker.setTranscoder(jsSource, wasmSource);
    }

    static TranscoderWorker: typeof TranscoderWorker = TranscoderWorker;
}

// Auto-detect compressed texture formats once @pixi/basis is imported!
BasisLoader.autoDetectFormats();
