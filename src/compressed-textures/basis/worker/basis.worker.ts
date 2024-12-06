import { createLevelBuffers } from '../utils/createLevelBuffers';
import { gpuFormatToBasisTranscoderFormat } from '../utils/gpuFormatToBasisTranscoderFormat';

import type { TEXTURE_FORMATS } from '../../../rendering/renderers/shared/texture/const';
import type { TextureSourceOptions } from '../../../rendering/renderers/shared/texture/sources/TextureSource';
import type { BASISModuleCreator, BasisTextureConstructor } from '../types';

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

declare let BASIS: BASISModuleCreator;

const settings = {
    jsUrl: 'basis/basis_transcoder.js',
    wasmUrl: 'basis/basis_transcoder.wasm',
};

let basisTranscoderFormat: number;
let basisTranscodedTextureFormat: TEXTURE_FORMATS;

let basisPromise: Promise<BasisTextureConstructor>;

async function getBasis(): Promise<BasisTextureConstructor>
{
    if (!basisPromise)
    {
        const absoluteJsUrl = new URL(settings.jsUrl, location.origin).href;
        const absoluteWasmUrl = new URL(settings.wasmUrl, location.origin).href;

        importScripts(absoluteJsUrl);

        basisPromise = new Promise((resolve) =>
        {
            BASIS({
                locateFile: (_file) =>
                    absoluteWasmUrl
            }).then((module) =>
            {
                module.initializeBasis();
                resolve(module.BasisFile);
            });
        });
    }

    return basisPromise;
}

async function fetchBasisTexture(url: string, BasisTexture: BasisTextureConstructor)
{
    const basisResponse = await fetch(url);

    if (basisResponse.ok)
    {
        const basisArrayBuffer = await basisResponse.arrayBuffer();

        return new BasisTexture(new Uint8Array(basisArrayBuffer));
    }

    throw new Error(`Failed to load Basis texture: ${url}`);
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
    const BasisTexture = await getBasis();

    const basisTexture = await fetchBasisTexture(url, BasisTexture);

    const levelBuffers = createLevelBuffers(basisTexture, basisTranscoderFormat);

    return {
        width: basisTexture.getImageWidth(0, 0),
        height: basisTexture.getImageHeight(0, 0),
        format: basisTranscodedTextureFormat,
        resource: levelBuffers,
        alphaMode: 'no-premultiply-alpha'
    } as TextureSourceOptions;
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
        .filter((format) => supportedTextures.includes(format))[0] as TEXTURE_FORMATS;

    basisTranscoderFormat = gpuFormatToBasisTranscoderFormat(basisTranscodedTextureFormat);

    await getBasis();
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
    const response = await messageHandlers[message.type as 'load' | 'init'](message as any);

    if (response)
    {
        (self as any).postMessage(response, response.transferables);
    }
});
