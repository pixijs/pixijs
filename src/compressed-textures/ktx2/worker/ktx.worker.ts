import { convertFormatIfRequired } from '../utils/convertFormatIfRequired';
import { createLevelBuffersFromKTX } from '../utils/createLevelBuffersFromKTX';
import { getTextureFormatFromKTXTexture } from '../utils/getTextureFormatFromKTXTexture';
import { gpuFormatToKTXBasisTranscoderFormat } from '../utils/gpuFormatToKTXBasisTranscoderFormat';

import type { TEXTURE_FORMATS } from '../../../rendering/renderers/shared/texture/const';
import type { TextureSourceOptions } from '../../../rendering/renderers/shared/texture/sources/TextureSource';
import type { COMPRESSED_TEXTURE_FORMATS, LIBKTXModule, LIBKTXModuleCreator } from '../types';

/**
 * -----------------------------------------------------------
 * This code includes parts that are adapted from the webGPU(GL) wizard @toji's web-texture-tool.
 * Massive thanks to @toji for making this tool and sharing it with the world.
 *
 * Original Repository: https://github.com/toji/web-texture-tool
 *
 * Modifications were made to integrate with PixiJS.
 * -----------------------------------------------------------
 */

declare let LIBKTX: LIBKTXModuleCreator;

const settings = {
    jsUrl: '',
    wasmUrl: '',
};

let basisTranscoderFormat: string;
let basisTranscodedTextureFormat: COMPRESSED_TEXTURE_FORMATS;

let ktxPromise: Promise<LIBKTXModule>;

async function getKTX(): Promise<LIBKTXModule>
{
    if (!ktxPromise)
    {
        const absoluteJsUrl = new URL(settings.jsUrl, location.origin).href;
        const absoluteWasmUrl = new URL(settings.wasmUrl, location.origin).href;

        importScripts(absoluteJsUrl);

        ktxPromise = new Promise((resolve) =>
        {
            LIBKTX({
                locateFile: (_file) =>
                    absoluteWasmUrl
            }).then((libktx: LIBKTXModule) =>
            {
                resolve(libktx);
            });
        });
    }

    return ktxPromise;
}

async function fetchKTXTexture(url: string, ktx: LIBKTXModule)
{
    const ktx2Response = await fetch(url);

    if (ktx2Response.ok)
    {
        const ktx2ArrayBuffer = await ktx2Response.arrayBuffer();

        return new ktx.ktxTexture(new Uint8Array(ktx2ArrayBuffer));
    }

    throw new Error(`Failed to load KTX(2) texture: ${url}`);
}

const preferredTranscodedFormat: Partial<TEXTURE_FORMATS>[] = [
    'bc7-rgba-unorm',
    'astc-4x4-unorm',
    'etc2-rgba8unorm',
    'bc3-rgba-unorm',
    'rgba8unorm',
];

async function load(url: string): Promise<TextureSourceOptions>
{
    const ktx = await getKTX();

    const ktxTexture = await fetchKTXTexture(url, ktx);

    let format: COMPRESSED_TEXTURE_FORMATS;

    if (ktxTexture.needsTranscoding)
    {
        format = basisTranscodedTextureFormat;

        const transcodeFormat = ktx.TranscodeTarget[basisTranscoderFormat];
        const result = ktxTexture.transcodeBasis(transcodeFormat, 0);

        if (result !== ktx.ErrorCode.SUCCESS)
        {
            throw new Error('Unable to transcode basis texture.');
        }
    }
    else
    {
        format = getTextureFormatFromKTXTexture(ktxTexture);
    }

    const levelBuffers = createLevelBuffersFromKTX(ktxTexture);

    const textureOptions = {
        width: ktxTexture.baseWidth,
        height: ktxTexture.baseHeight,
        format: format as TEXTURE_FORMATS,
        mipLevelCount: ktxTexture.numLevels,
        resource: levelBuffers,
        alphaMode: 'no-premultiply-alpha'
    } as TextureSourceOptions;

    convertFormatIfRequired(textureOptions);

    return textureOptions;
}

async function init(
    jsUrl: string,
    wasmUrl: string,
    supportedTextures: TEXTURE_FORMATS[]
): Promise<void>
{
    if (jsUrl)settings.jsUrl = jsUrl;
    if (wasmUrl)settings.wasmUrl = wasmUrl;

    basisTranscodedTextureFormat = preferredTranscodedFormat
        .filter((format) => supportedTextures.includes(format))[0] as COMPRESSED_TEXTURE_FORMATS;

    basisTranscoderFormat = gpuFormatToKTXBasisTranscoderFormat(basisTranscodedTextureFormat);

    await getKTX();
}

const messageHandlers = {
    init: async (data: { wasmUrl: string, jsUrl: string, supportedTextures: TEXTURE_FORMATS[]}) =>
    {
        const { jsUrl, wasmUrl, supportedTextures } = data;

        await init(jsUrl, wasmUrl, supportedTextures);
    },
    load: async (data: {url: string}) =>
    {
        // eslint-disable-next-line no-useless-catch
        try
        {
            const textureOptions = await load(data.url) as TextureSourceOptions<Uint8Array[]>;

            return {
                type: 'load',
                url: data.url,
                success: true,
                textureOptions,
                transferables: textureOptions.resource?.map((arr) => arr.buffer)
            };
        }
        catch (e)
        {
            throw e;
        }
    }

};

self.onmessage = (async (messageEvent) =>
{
    const message = messageEvent.data;
    const response = await messageHandlers[message.type as 'load' | 'init']?.(message as any);

    if (response)
    {
        (self as any).postMessage(response, response.transferables);
    }
});
