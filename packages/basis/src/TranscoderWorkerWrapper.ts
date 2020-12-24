import type { BASIS, BASIS_FORMATS, BasisBinding } from './Basis';

/**
 * Initialization message sent by the main thread.
 *
 * @ignore
 */
export interface IInitializeTranscoderMessage {
    wasmSource: ArrayBuffer;
    type: 'init';
}

/**
 * Request parameters for transcoding basis files. It only supports transcoding all of the basis file at once.
 *
 * @ignore
 */
export interface ITranscodeMessage
{
    requestID?: number;
    rgbFormat: number;
    rgbaFormat?: number;
    basisData?: Uint8Array;
    type: 'transcode';
}

/**
 * @ignore
 */
export interface ITranscodedImage {
    imageID: number;
    levelArray: Array<{
        levelID: number,
        levelWidth: number,
        levelHeight: number,
        levelBuffer: Uint8Array
    }>;
    width: number;
    height: number;
}

/**
 * Response format for {@link TranscoderWorker}.
 *
 * @ignore
 */
export interface ITranscodeResponse {
    type: 'init' | 'transcode';
    requestID?: number;
    success: boolean;
    basisFormat?: BASIS_FORMATS;
    imageArray?: Array<{
        imageID: number,
        levelArray: Array<{
            levelID: number,
            levelWidth: number,
            levelHeight: number,
            levelBuffer: Uint8Array
        }>,
        width: number,
        height: number
    }>;
}

declare global {
    interface Window {
        BASIS: BASIS;
    }
}

/**
 * This wraps the transcoder web-worker functionality; it can be converted into a string to get the source code. It expects
 * you to prepend the transcoder JavaScript code so that the `BASIS` namespace is available.
 *
 * The transcoder worker responds to two types of messages: "init" and "transcode". You must always send the first "init"
 * {@link IInitializeTranscoderMessage} message with the WebAssembly binary; if the transcoder is successfully initialized,
 * the web-worker will respond by sending another {@link ITranscodeResponse} message with `success: true`.
 *
 * @ignore
 */
export function TranscoderWorkerWrapper(): void
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
            const basisFallbackFormat = 14;// BASIS_FORMATS.cTFRGB565 (cannot import values into web-worker!)
            const imageArray = new Array(imageCount);

            let fallbackMode = false;

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
                const levels = basisFile.getNumLevels(i);
                const imageResource: ITranscodedImage = {
                    imageID: i,
                    levelArray: new Array<{
                        levelID: number,
                        levelWidth: number,
                        levelHeight: number,
                        levelBuffer: Uint8Array
                    }>(),
                    width: null,
                    height: null
                };

                for (let j = 0; j < levels; j++)
                {
                    const format = !fallbackMode ? basisFormat : basisFallbackFormat;

                    const width = basisFile.getImageWidth(i, j);
                    const height = basisFile.getImageHeight(i, j);
                    const byteSize = basisFile.getImageTranscodedSizeInBytes(i, j, format);

                    const alignedWidth = (width + 3) & ~3;
                    const alignedHeight = (height + 3) & ~3;

                    // Level 0 is texture's actual width, height
                    if (j === 0)
                    {
                        imageResource.width = alignedWidth;
                        imageResource.height = alignedHeight;
                    }

                    const imageBuffer = new Uint8Array(byteSize);

                    if (!basisFile.transcodeImage(imageBuffer, i, j, format, false, false))
                    {
                        if (fallbackMode)
                        {
                            // We failed in fallback mode as well!
                            console.error(`Basis failed to transcode image ${i}, level ${j}!`);

                            return { type: 'transcode', requestID: message.requestID, success: false };
                        }

                        /* eslint-disable-next-line max-len */
                        console.warn(`Basis failed to transcode image ${i}, level ${j}! Retrying to an uncompressed texture format!`);
                        i = -1;
                        fallbackMode = true;

                        break;
                    }

                    imageResource.levelArray.push({
                        levelID: j,
                        levelWidth: width,
                        levelHeight: height,
                        levelBuffer: imageBuffer
                    });
                }

                imageArray[i] = imageResource;
            }

            basisFile.close();
            basisFile.delete();

            return {
                type: 'transcode',
                requestID: message.requestID,
                success: true,
                basisFormat: !fallbackMode ? basisFormat : basisFallbackFormat,
                imageArray
            };
        }
    };

    self.onmessage = (e: { data: Partial<IInitializeTranscoderMessage | ITranscodeMessage> }): void =>
    {
        const msg = e.data;
        const response = messageHandlers[msg.type](msg as any);

        if (response)
        {
            (self as any).postMessage(response);
        }
    };
}
