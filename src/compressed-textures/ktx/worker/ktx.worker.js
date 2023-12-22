import { convertFormatIfRequired } from '../utils/convertFormatIfRequired';
import { createLevelBuffersFromKTX } from '../utils/createLevelBuffersFromKTX';
import { getTextureFormatFromKTXTexture } from '../utils/getTextureFormatFromKTXTexture';
import { gpuFormatToKTXBasisTranscoderFormat } from '../utils/gpuFormatToKTXBasisTranscoderFormat';

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

let LIBKTX;

const settings = {
    jsUrl: '',
    wasmUrl: '',
};

let basisTranscoderFormat;
let basisTranscodedTextureFormat;

let ktxPromise;

async function getKTX()
{
    if (!ktxPromise)
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
            console.warn('Failed to load KTX(2) in worker via importScripts. Falling back to eval.');
            // #endif

            const response = await fetch(absoluteJsUrl);
            let text = await response.text();

            text += '\nself.LIBKTX = LIBKTX;';

            // eslint-disable-next-line no-eval
            eval(text);
        }

        ktxPromise = new Promise((resolve) =>
        {
            LIBKTX({
                locateFile: (_file) =>
                    absoluteWasmUrl
            }).then((libktx) =>
            {
                resolve(libktx);
            });
        });
    }

    return ktxPromise;
}

async function fetchKTXTexture(url, ktx)
{
    const ktx2Response = await fetch(url);

    if (ktx2Response.ok)
    {
        const ktx2ArrayBuffer = await ktx2Response.arrayBuffer();

        return new ktx.ktxTexture(new Uint8Array(ktx2ArrayBuffer));
    }

    throw new Error(`Failed to load KTX(2) texture: ${url}`);
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
    const ktx = await getKTX();

    const ktxTexture = await fetchKTXTexture(url, ktx);

    let format;

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
        format,
        mipLevelCount: ktxTexture.numLevels,
        resource: levelBuffers,
        alphaMode: 'no-premultiply-alpha'
    };

    convertFormatIfRequired(textureOptions);

    return textureOptions;
}

async function init(
    jsUrl,
    wasmUrl,
    supportedTextures,
)
{
    if (jsUrl)settings.jsUrl = jsUrl;
    if (wasmUrl)settings.wasmUrl = wasmUrl;

    basisTranscodedTextureFormat = preferredTranscodedFormat
        .filter((format) => supportedTextures.includes(format))[0];

    basisTranscoderFormat = gpuFormatToKTXBasisTranscoderFormat(basisTranscodedTextureFormat);

    await getKTX();
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
    const response = await messageHandlers[message.type]?.message;

    if (response)
    {
        self.postMessage(response, response.transferables);
    }
});

