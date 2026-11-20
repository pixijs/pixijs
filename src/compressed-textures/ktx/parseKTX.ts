import { KTX } from '../ktx2/const';

import type { TEXTURE_FORMATS } from '../../rendering/renderers/shared/texture/const';
import type { TextureSourceOptions } from '../../rendering/renderers/shared/texture/sources/TextureSource';

/**
 * @param arrayBuffer
 * @param supportedFormats
 * @internal
 */
export function parseKTX(arrayBuffer: ArrayBuffer, supportedFormats: TEXTURE_FORMATS[]): TextureSourceOptions<Uint8Array[]>
{
    const dataView = new DataView(arrayBuffer);

    if (!validate(dataView))
    {
        throw new Error('Invalid KTX identifier in header');
    }

    const {
        littleEndian,
        glInternalFormat,
        pixelWidth,
        pixelHeight,
        numberOfMipmapLevels,
        offset,
    } = parseKTXHeader(dataView);

    const textureFormat = KTX.INTERNAL_FORMAT_TO_TEXTURE_FORMATS[glInternalFormat];

    if (!textureFormat)
    {
        throw new Error(`Unknown texture format ${glInternalFormat}`);
    }
    if (!supportedFormats.includes(textureFormat))
    {
        throw new Error(`Unsupported texture format: ${textureFormat}, supportedFormats: ${supportedFormats}`);
    }

    const imageBuffers = getImageBuffers(dataView, offset, numberOfMipmapLevels, littleEndian);

    return {
        format: textureFormat,
        width: pixelWidth,
        height: pixelHeight,
        resource: imageBuffers,
        alphaMode: 'no-premultiply-alpha'
    };
}

function getImageBuffers(dataView: DataView, offset: number, numberOfMipmapLevels: number, littleEndian: boolean)
{
    let imageOffset = offset;

    const imageBuffers = new Array<Uint8Array>(numberOfMipmapLevels);

    for (let mipmapLevel = 0; mipmapLevel < numberOfMipmapLevels; mipmapLevel++)
    {
        const imageSize = dataView.getUint32(imageOffset, littleEndian);

        imageBuffers[mipmapLevel] = new Uint8Array(dataView.buffer, imageOffset + 4, imageSize);

        // Skip the imageSize field, the level data and its mipPadding to the next 4-byte boundary
        imageOffset += imageSize + 4;
        imageOffset = imageOffset % 4 !== 0 ? imageOffset + 4 - (imageOffset % 4) : imageOffset;
    }

    return imageBuffers;
}

function parseKTXHeader(dataView: DataView)
{
    const littleEndian = dataView.getUint32(KTX.FIELDS.ENDIANNESS, true) === KTX.ENDIANNESS;
    const glInternalFormat = dataView.getUint32(KTX.FIELDS.GL_INTERNAL_FORMAT, littleEndian);
    const pixelWidth = dataView.getUint32(KTX.FIELDS.PIXEL_WIDTH, littleEndian);
    const pixelHeight = dataView.getUint32(KTX.FIELDS.PIXEL_HEIGHT, littleEndian) || 1;// "pixelHeight = 0" -> "1"
    const pixelDepth = dataView.getUint32(KTX.FIELDS.PIXEL_DEPTH, littleEndian) || 1;// ^^
    const numberOfArrayElements = dataView.getUint32(KTX.FIELDS.NUMBER_OF_ARRAY_ELEMENTS, littleEndian) || 1;// ^^
    const numberOfFaces = dataView.getUint32(KTX.FIELDS.NUMBER_OF_FACES, littleEndian);
    const numberOfMipmapLevels = dataView.getUint32(KTX.FIELDS.NUMBER_OF_MIPMAP_LEVELS, littleEndian);
    const bytesOfKeyValueData = dataView.getUint32(KTX.FIELDS.BYTES_OF_KEY_VALUE_DATA, littleEndian);

    if (pixelHeight === 0 || pixelDepth !== 1)
    {
        throw new Error('Only 2D textures are supported');
    }
    if (numberOfFaces !== 1)
    {
        throw new Error('CubeTextures are not supported by KTXLoader yet!');
    }
    if (numberOfArrayElements !== 1)
    {
        throw new Error('WebGL does not support array textures');
    }

    return {
        littleEndian,
        glInternalFormat,
        pixelWidth,
        pixelHeight,
        numberOfMipmapLevels,
        offset: KTX.FILE_HEADER_SIZE + bytesOfKeyValueData
    };
}

/**
 * Checks whether the arrayBuffer contains a valid *.ktx file.
 * @param dataView
 */
function validate(dataView: DataView): boolean
{
    // NOTE: Do not optimize this into 3 32-bit integer comparison because the endianness
    // of the data is not specified.
    for (let i = 0; i < KTX.FILE_IDENTIFIER.length; i++)
    {
        if (dataView.getUint8(i) !== KTX.FILE_IDENTIFIER[i])
        {
            return false;
        }
    }

    return true;
}
