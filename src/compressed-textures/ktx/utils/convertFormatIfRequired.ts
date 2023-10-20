import type { TEXTURE_FORMATS } from '../../../rendering/renderers/shared/texture/const';
import type { TextureSourceOptions } from '../../../rendering/renderers/shared/texture/sources/TextureSource';

interface ColorConverter
{
    convertedFormat: TEXTURE_FORMATS,
    convertFunction: (levelBuffer: Uint8Array) => Uint8Array
}

const converters: Record<string, ColorConverter> = {
    rgb8unorm: {
        convertedFormat: 'rgba8unorm',
        convertFunction: convertRGBtoRGBA,
    },
    'rgb8unorm-srgb': {
        convertedFormat: 'rgba8unorm-srgb',
        convertFunction: convertRGBtoRGBA,
    }
};

export function convertFormatIfRequired(textureOptions: TextureSourceOptions)
{
    const format = textureOptions.format;

    if (converters[format])
    {
        const convertFunction = converters[format].convertFunction;

        const levelBuffers = textureOptions.resource;

        for (let i = 0; i < levelBuffers.length; i++)
        {
            levelBuffers[i] = convertFunction(levelBuffers[i]);
        }

        textureOptions.format = converters[format].convertedFormat;
    }
}

function convertRGBtoRGBA(levelBuffer: Uint8Array): Uint8Array
{
    const pixelCount = levelBuffer.byteLength / 3;

    const levelBufferWithAlpha = new Uint32Array(pixelCount);

    for (let i = 0; i < pixelCount; ++i)
    {
        levelBufferWithAlpha[i] = (levelBuffer[i * 3]) // R
               + (levelBuffer[(i * 3) + 1] << 8) // G
               + (levelBuffer[(i * 3) + 2] << 16) // B
               + 0xff000000; // A (255)
    }

    return new Uint8Array(levelBufferWithAlpha.buffer);
}
