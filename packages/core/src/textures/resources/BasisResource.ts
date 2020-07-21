import { BlobResource } from './BlobResource';
import { Runner } from '@pixi/runner';
import { CompressedTextureResource } from './CompressedTextureResource';
import { INTERNAL_FORMATS, FORMATS, TYPES } from '@pixi/constants/src';
import { Renderer } from '../../Renderer';
import { BaseTexture } from '../BaseTexture';
import { GLTexture } from '../GLTexture';

/* eslint-disable camelcase */
enum BASIS_FORMATS {
    cTFETC1 = 0,
//    cTFETC2 = 1,
    cTFBC1 = 2,
    cTFBC3 = 3,
//    cTFBC4 = 4,
//    cTFBC5 = 5,
//    cTFBC7 = 6,
    cTFPVRTC1_4_RGB = 8,
    cTFPVRTC1_4_RGBA = 9,
    cTFASTC_4x4 = 10,
//    cTFATC_RGB = 11,
//    cTFATC_RGBA_INTERPOLATED_ALPHA = 12,
//    cTFRGBA32 = 13,
    cTFRGB565 = 14,
//    cTFBGR565 = 15,
//    cTFRGBA4444 = 16,
}
/* eslint-enable camelcase */

const BASIS_FORMAT_TO_INTERNAL_FORMAT: { [id: number]: number } = {
    [BASIS_FORMATS.cTFRGB565]: TYPES.UNSIGNED_SHORT_5_6_5,
    [BASIS_FORMATS.cTFETC1]: INTERNAL_FORMATS.COMPRESSED_RGB_ETC1_WEBGL,
    [BASIS_FORMATS.cTFBC1]: INTERNAL_FORMATS.COMPRESSED_RGB_S3TC_DXT1_EXT,
    [BASIS_FORMATS.cTFBC3]: INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT,
    [BASIS_FORMATS.cTFPVRTC1_4_RGB]: INTERNAL_FORMATS.COMPRESSED_RGB_PVRTC_4BPPV1_IMG,
    [BASIS_FORMATS.cTFPVRTC1_4_RGBA]: INTERNAL_FORMATS.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG
};

const INTERNAL_FORMAT_TO_BASIS_FORMAT: { [id: number]: number }
    = (Object.keys(BASIS_FORMAT_TO_INTERNAL_FORMAT) as string[])
        .map((key: string) => Number(key))
        .reduce((reverseMap: any, basisFormat: any) =>
        {
            reverseMap[(BASIS_FORMAT_TO_INTERNAL_FORMAT as any)[basisFormat]] = basisFormat;

            return reverseMap;
        }, {});

const BASIS_FORMATS_ALPHA: { [id: number]: boolean } = {
    [BASIS_FORMATS.cTFBC3]: true,
    [BASIS_FORMATS.cTFPVRTC1_4_RGBA]: true,
    [BASIS_FORMATS.cTFASTC_4x4]: true
};

/**
 * Binding to C++ {@code BasisFile} wrapper class.
 *
 * @internal
 * @see https://github.com/BinomialLLC/basis_universal/blob/master/webgl/transcoder/basis_wrappers.cpp
 */
declare class BasisFile
{
    constructor(buffer : Uint8Array);
    getNumImages(): number;
    getNumLevels(imageId: number): number;
    getImageWidth(imageId: number, level: number): number;
    getImageHeight(imageId: number, level: number): number;
    getHasAlpha(): boolean;
    startTranscoding(): boolean;
    getImageTranscodedSizeInBytes(
        imageId : number,
        level: number,
        basisFormat: number): number;
    transcodeImage(dstBuff: Uint8Array,
        imageId: number,
        level: number,
        basisFormat: BASIS_FORMATS,
        pvrtcWrapAddressing: boolean,
        getAlphaForOpaqueFormats: boolean): number;
    close(): void;
    delete(): void;
}

// Missing typings? - https://github.com/microsoft/TypeScript/issues/39655
/**
 * Compressed texture extensions relevant to the formats into which Basis can decompress into.
 */
/* eslint-disable camelcase */
type BasisTextureExtensions = {
    s3tc?: WEBGL_compressed_texture_s3tc,
    s3tc_sRGB: WEBGL_compressed_texture_s3tc_srgb,
    etc: any,
    etc1: any,
    pvrtc: any,
    atc: any,
    astc: WEBGL_compressed_texture_astc
};
/* eslint-enable camelcase */

/**
 * API provided by basis_universal WebGL library.
 *
 * @internal
 */
type BasisBinding = {
    BasisFile: typeof BasisFile,
    initializeBasis(): void
};

/**
 * Binding to basis_universal WebGL library.
 *
 * @internal
 * @see https://github.com/BinomialLLC/basis_universal/blob/master/webgl/transcoder/build/basis_transcoder.js
 */
type BASIS = (opts?: { wasmBinary: ArrayBuffer }) => Promise<BasisBinding>;

/**
 * Resource that uses basis_universal to transcode *.basis supercompressed textures into one the supported
 * compressed texture formats at runtime.
 */
export class BasisResource extends BlobResource
{
    /**
     * The maximum number of workers to be created for transcoding. By default, this is 1.
     */
    static WORKER_POOL_LIMIT = 1;

    static basisBinding: BasisBinding;
    static defaultRGBFormat: { basisFormat: BASIS_FORMATS, textureFormat: INTERNAL_FORMATS | TYPES };
    static defaultRGBAFormat: { basisFormat: BASIS_FORMATS, textureFormat: INTERNAL_FORMATS | TYPES };
    static onTranscoderInitialized = new Runner('onTranscoderInitialized');

    static workerPool: TranscoderWorker[] = [];

    private imageArray: CompressedTextureResource[];

    /**
     * @param source - the basis file URL or binary-encoded contents
     */
    constructor(source: string | Uint8Array)
    {
        super(source, {
            width: 1,
            height: 1
        });

        this.imageArray = [];
    }

    /**
     * @override
     */
    upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean
    {
        if (!this.loaded || !this.imageArray[0])
        {
            return false;
        }

        this.imageArray[0].upload(renderer, baseTexture, glTexture);

        return true;
    }

    /**
     * Transcodes the *.basis data when the data is loaded. If the transcoder is not bound yet, it
     * will hook transcoding to {@link BasisResource#onTranscoderInitialized}.
     *
     * @param _
     */
    protected onBlobLoaded(_: ArrayBuffer): void
    {
        if (this.isTranscoderAvailable())
        {
            this.transcode();
        }
        else
        {
            BasisResource.onTranscoderInitialized.add(this);
        }
    }

    /**
     * Transcodes the data when once the transcoder is bound.
     */
    protected onTranscoderInitialized(): void
    {
        if (this.loaded)
        {
            this.transcode();
        }

        BasisResource.onTranscoderInitialized.remove(this);
    }

    /**
     * Whether a transcoder is bound, either worker-based or main-thread based.
     */
    protected isTranscoderAvailable(): boolean
    {
        return !!BasisResource.basisBinding || (!!BasisResource.TranscoderWorker.wasmSource);
    }

    /**
     * Runs transcoding and populates {@link imageArray}. It will run the transcoding in a web worker
     * if they are available.
     */
    protected transcode(): void
    {
        if (typeof Worker !== 'undefined' && BasisResource.TranscoderWorker.wasmSource)
        {
            this.transcodeAsync();

            return;
        }

        this.transcodeSync();
    }

    /**
     * Finds a suitable worker for transcoding and sends a transcoding request
     */
    protected async transcodeAsync(): Promise<void>
    {
        const workerPool = BasisResource.workerPool;

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

        console.log('INIT');

        worker.transcodeAsync(
            this.buffer.uint8View,
            BasisResource.defaultRGBAFormat.basisFormat,
            BasisResource.defaultRGBFormat.basisFormat
        ).then(
            (response: ITranscodeResponse) =>
            {
                const imageArray = response.imageArray;
                const format = BASIS_FORMAT_TO_INTERNAL_FORMAT[response.basisFormat];

                // HINT: this.imageArray is CompressedTextureResource[]
                this.imageArray.length = imageArray.length;

                for (let i = 0, j = imageArray.length; i < j; i++)
                {
                    this.imageArray[i] = new CompressedTextureResource(imageArray[i].levelArray[0].data, {
                        format,
                        width: imageArray[i].width,
                        height: imageArray[i].height
                    });
                }

                if (this.imageArray.length > 0)
                {
                    this.resize(this.imageArray[0].width, this.imageArray[0].height);
                }
            },
            () =>
            {
                throw new Error('Basis worker failed to transcode data');
            });
    }

    /**
     * Runs transcoding on the main thread.
     */
    protected transcodeSync(): void
    {
        const BASIS = BasisResource.basisBinding;

        const data = this.buffer.uint8View;
        const basisFile = new BASIS.BasisFile(data);
        const imageCount = basisFile.getNumImages();
        const hasAlpha = basisFile.getHasAlpha();

        const basisFormat = hasAlpha
            ? BasisResource.defaultRGBAFormat.basisFormat
            : BasisResource.defaultRGBFormat.basisFormat;

        this.imageArray.length = imageCount;

        if (!basisFile.startTranscoding())
        {
            console.error(`Basis failed to start transcoding ${this.origin}!`);

            basisFile.close();
            basisFile.delete();

            return;
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
                console.error(`Basis failed to transcode image ${i}, level ${0} in ${this.origin}!`);
                break;
            }

            this.imageArray[i] = imageResource;
        }

        if (this.imageArray.length > 0)
        {
            this.resize(this.imageArray[0].width, this.imageArray[0].height);
        }

        basisFile.close();
        basisFile.delete();
    }

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
                BasisResource[detectWithAlpha ? 'defaultRGBAFormat' : 'defaultRGBFormat'] = {
                    textureFormat: internalFormat,
                    basisFormat,
                };
            }
            else
            {
                BasisResource[detectWithAlpha ? 'defaultRGBAFormat' : 'defaultRGBFormat'] = {
                    textureFormat: TYPES.UNSIGNED_SHORT_5_6_5,
                    basisFormat: BASIS_FORMATS.cTFRGB565
                };
            }
        }
    }

    /**
     * Binds the basis_universal transcoder to decompress *.basis files.
     *
     * @param basisu - the basis library object (generally found at {@code window.BASIS})
     */
    static bindTranscoder(basisu: BASIS = ((window as any).BASIS as BASIS)): void
    {
        // Initialize basis_universal library & then asynchronously bind it
        basisu().then((basisLibrary) =>
        {
            basisLibrary.initializeBasis();

            BasisResource.basisBinding = basisLibrary;
            BasisResource.onTranscoderInitialized.emit();
        });
    }

    static TranscoderWorker: typeof TranscoderWorker;
}

BasisResource.onTranscoderInitialized.add({
    onTranscoderInitialized()
    {
        BasisResource.autoDetectFormats();
    }
});

/**
     * Worker class for transcoding in background threads.
     *
     * To enable asynchronous transcoding, you need to provide the URL to the basis_universal transcoding
     * library.
     *
     * @memberof PIXI.resources.BasisResource
     */
class TranscoderWorker
{
    // TODO: Publish our own @pixi/basis-transcoder package & set default URL to jsdelivr/cdnjs
        /**
         * URL for the script containing the basis_universal library.
         */
        static bindingURL: string;
        static jsSource: string;
        static wasmSource: ArrayBuffer;

        isInit: boolean;
        load: number;
        requests: { [id: number]: {
            resolve: (data: ITranscodeResponse) => void,
            reject: () => void
        } } = {};

        private static _workerURL: string;
        private static _tempID = 0;

        /**
         * Generated URL for the transcoder worker script.
         */
        static get workerURL(): string
        {
            if (!TranscoderWorker._workerURL)
            {
                let workerSource = transcoderWorker.toString();

                const beginIndex = workerSource.indexOf('{');
                const endIndex = workerSource.lastIndexOf('}');

                workerSource = workerSource.slice(beginIndex + 1, endIndex);

                if (TranscoderWorker.jsSource)
                {
                    workerSource = `${TranscoderWorker.jsSource}\n${workerSource}`;
                }

                TranscoderWorker._workerURL = URL.createObjectURL(new Blob([workerSource]));
            }

            return TranscoderWorker._workerURL;
        }

        protected worker: Worker;
        protected initPromise: Promise<void>;
        protected onInit: () => void;

        constructor()
        {
            this.isInit = false;
            this.load = 0;
            this.initPromise = new Promise((resolve) => { this.onInit = resolve; });

            if (!TranscoderWorker.wasmSource)
            {
                console.warn('PIXI.resources.BasisResource.TranscoderWorker has not been given the transcoder WASM binary!');
            }

            this.worker = new Worker(TranscoderWorker.workerURL);
            this.worker.onmessage = this.onMessage;
            this.worker.postMessage({
                type: 'init',
                jsSource: TranscoderWorker.jsSource,
                wasmSource: TranscoderWorker.wasmSource
            });
        }

        initAsync(): Promise<void>
        {
            return this.initPromise;
        }

        async transcodeAsync(basisData: Uint8Array, rgbaFormat: BASIS_FORMATS, rgbFormat: BASIS_FORMATS): Promise<ITranscodeResponse>
        {
            ++this.load;

            const requestID = TranscoderWorker._tempID++;
            const requestPromise = new Promise((resolve: (data: ITranscodeResponse) => void, reject: () => void) =>
            {
                this.requests[requestID] = {
                    resolve,
                    reject
                };
            });

            this.worker.postMessage({
                requestID,
                basisData,
                rgbaFormat,
                rgbFormat,
                type: 'transcode'
            });

            return requestPromise;
        }

        protected onMessage = (e: MessageEvent): void =>
        {
            const data = e.data as ITranscodeResponse;

            if (data.type === 'init')
            {
                if (!data.success)
                {
                    throw new Error('BasisResource.TranscoderWorker failed to initialize.');
                }

                this.isInit = true;
                this.onInit();
            }
            else if (data.type === 'transcode')
            {
                --this.load;

                const requestID = data.requestID;

                if (data.success)
                {
                    this.requests[requestID].resolve(data);
                }
                else
                {
                    this.requests[requestID].reject();
                }

                delete this.requests[requestID];
            }
        };

        /**
         * Loads the transcoder source code
         *
         * @param jsURL
         * @param wasmURL
         */
        static loadTranscoder(jsURL: string, wasmURL: string): Promise<[void, void]>
        {
            const jsPromise = fetch(jsURL)
                .then((res: Response) => res.text())
                .then((text: string) => { TranscoderWorker.jsSource = text; });
            const wasmPromise = fetch(wasmURL)
                .then((res: Response) => res.arrayBuffer())
                .then((arrayBuffer: ArrayBuffer) => { TranscoderWorker.wasmSource = arrayBuffer; });

            return Promise.all([jsPromise, wasmPromise]).then((data) =>
            {
                BasisResource.onTranscoderInitialized.emit();

                return data;
            });
        }

        /**
         * Set the transcoder source code directly
         *
         * @param jsSource
         * @param wasmSource
         */
        static setTranscoder(jsSource: string, wasmSource: ArrayBuffer): void
        {
            TranscoderWorker.jsSource = jsSource;
            TranscoderWorker.wasmSource = wasmSource;
        }
}

BasisResource.TranscoderWorker = TranscoderWorker;

interface IInitializeTranscoderMessage {
    jsSource: string;
    wasmSource: ArrayBuffer;
    type: 'init';
}

/**
 * Request parameters for transcoding basis files. It only supports transcoding all of the basis file at once.
 *
 * @internal
 */
interface ITranscodeMessage
{
    requestID?: number;
    rgbFormat: number;
    rgbaFormat?: number;
    basisData?: Uint8Array;
    type: 'transcode';
}

interface ITranscodeResponse {
    type: 'init' | 'transcode';
    requestID?: number;
    success: boolean;
    basisFormat?: BASIS_FORMATS;
    imageArray?: Array<{
        imageID: number,
        levelArray: Array<{ levelID: number, data: Uint8Array }>,
        width: number,
        height: number
    }>;
}

declare global {
    interface Window {
        BASIS: BASIS;
    }
}

function transcoderWorker()
{
    let basisBinding: BasisBinding;

    const messageHandlers = {
        init: (message: IInitializeTranscoderMessage): ITranscodeResponse =>
        {
            if (!self.BASIS)
            {
                console.warn('jsSource was not prepended?');

                return {
                    type: 'init',
                    success: false
                };
            }

            self.BASIS({ wasmBinary: message.wasmSource }).then((basisLibrary) =>
            {
                basisLibrary.initializeBasis();
                basisBinding = basisLibrary;

                (self as any).postMessage({
                    type: 'init',
                    success: true
                });
            });

            return null;
        },
        transcode(message: ITranscodeMessage): ITranscodeResponse
        {
            const basisData = message.basisData;
            const BASIS = basisBinding;

            const data = basisData;
            const basisFile = new BASIS.BasisFile(data);
            const imageCount = basisFile.getNumImages();
            const hasAlpha = basisFile.getHasAlpha();

            const basisFormat = hasAlpha
                ? message.rgbaFormat
                : message.rgbFormat;
            const imageArray = new Array(imageCount);

            if (!basisFile.startTranscoding())
            {
                basisFile.close();
                basisFile.delete();

                return {
                    type: 'transcode',
                    requestID: message.requestID,
                    success: false,
                    imageArray: null
                };
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
                const imageResource = {
                    imageID: i,
                    levelArray: new Array<{ levelID: number, data: Uint8Array}>(),
                    width: alignedWidth,
                    height: alignedHeight
                };

                if (!basisFile.transcodeImage(imageBuffer, i, 0, basisFormat, false, false))
                {
                    console.error(`Basis failed to transcode image ${i}, level ${0}!`);
                    break;
                }

                imageResource.levelArray.push({
                    levelID: 0,
                    data: imageBuffer
                });

                imageArray[i] = imageResource;
            }

            basisFile.close();
            basisFile.delete();

            return {
                type: 'transcode',
                requestID: message.requestID,
                success: true,
                basisFormat,
                imageArray
            };
        }
    };

    self.onmessage = (e: { data: Partial<IInitializeTranscoderMessage | ITranscodeMessage> }): void =>
    {
        console.log('RECEIVED MESSAGE');
        const msg = e.data;
        const response = messageHandlers[msg.type](msg as any);

        if (response)
        {
            (self as any).postMessage(response);
        }
    };

    console.log('__HERE__');
}
