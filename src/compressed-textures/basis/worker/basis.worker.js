import { createLevelBuffers } from '../utils/createLevelBuffers';
import { gpuFormatToBasisTranscoderFormat } from '../utils/gpuFormatToBasisTranscoderFormat';

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

let BASIS;

const settings = {
    jsUrl: 'basis/basis_transcoder.js',
    wasmUrl: 'basis/basis_transcoder.wasm',
};

let basisTranscoderFormat;
let basisTranscodedTextureFormat;

let basisPromise;

async function getBasis()
{
    if (!basisPromise)
    {
        const absoluteJsUrl = new URL(settings.jsUrl, location.origin).href;
        const absoluteWasmUrl = new URL(settings.wasmUrl, location.origin).href;

        try
        {
            // eslint-disable-next-line no-undef
            importScripts(absoluteJsUrl);
        }
        catch (e)
        {
            // #if _DEBUG
            console.warn('[Pixi.js] Failed to load Basis in worker via importScripts. Falling back to eval.');
            // #endif

            const response = await fetch(absoluteJsUrl);
            let text = await response.text();

            text += '\nself.BASIS = BASIS;';

            // eslint-disable-next-line no-eval
            eval(text);
        }

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

async function fetchBasisTexture(url, BasisTexture)
{
    const basisResponse = await fetch(url);

    if (basisResponse.ok)
    {
        const basisArrayBuffer = await basisResponse.arrayBuffer();

        return new BasisTexture(new Uint8Array(basisArrayBuffer));
    }

    throw new Error(`Failed to load Basis texture: ${url}`);
}

const preferredTranscodedFormat = [
    'etc2-rgba8unorm',
    'bc7-rgba-unorm',
    'bc3-rgba-unorm',
    'astc-4x4-unorm',
    'rgba8unorm',
];

async function load(url)
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
    };
}

async function init(
    jsUrl,
    wasmUrl,
    supportedTextures
)
{
    if (jsUrl)settings.jsUrl = jsUrl;
    if (wasmUrl)settings.wasmUrl = wasmUrl;

    basisTranscodedTextureFormat = preferredTranscodedFormat
        .filter((format) => supportedTextures.includes(format))[0];

    basisTranscoderFormat = gpuFormatToBasisTranscoderFormat(basisTranscodedTextureFormat);

    await getBasis();
}

const messageHandlers = {
    init: async (data) =>
    {
        const { jsUrl, wasmUrl, supportedTextures } = data;

        await init(jsUrl, wasmUrl, supportedTextures);
    },
    load: async (data) =>
    {
        try
        {
            const textureOptions = await load(data.url);

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
    const response = await messageHandlers[message.type](message);

    if (response)
    {
        self.postMessage(response, response.transferables);
    }
});

