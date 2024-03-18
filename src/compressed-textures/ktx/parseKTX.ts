import { KTX } from '../ktx2/const';

import type { TEXTURE_FORMATS } from '../../rendering/renderers/shared/texture/const';
import type { TextureSourceOptions } from '../../rendering/renderers/shared/texture/sources/TextureSource';

export function parseKTX(arrayBuffer: ArrayBuffer, supportedFormats: TEXTURE_FORMATS[]): TextureSourceOptions<Uint8Array[]>
{
    const dataView = new DataView(arrayBuffer);

    if (!validate(dataView))
    {
        throw new Error('Invalid KTX identifier in header');
    }

    const {
        littleEndian,
        glType,
        glFormat,
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

    const imagePixelByteSize = getImagePixelByteSize(glType, glFormat, glInternalFormat);

    const imageBuffers = getImageBuffers(dataView, glType, imagePixelByteSize, pixelWidth, pixelHeight, offset,
        numberOfMipmapLevels, littleEndian);

    return {
        format: textureFormat,
        width: pixelWidth,
        height: pixelHeight,
        resource: imageBuffers,
        alphaMode: 'no-premultiply-alpha'
    };
}

function getImageBuffers(dataView: DataView, glType: number, imagePixelByteSize: number, pixelWidth: number,
    pixelHeight: number, offset: number, numberOfMipmapLevels: number, littleEndian: boolean)
{
    const alignedWidth = (pixelWidth + 3) & ~3;
    const alignedHeight = (pixelHeight + 3) & ~3;
    let imagePixels = pixelWidth * pixelHeight;

    if (glType === 0)
    {
        // Align to 16 pixels (4x4 blocks)
        imagePixels = alignedWidth * alignedHeight;
    }

    let mipByteSize = imagePixels * imagePixelByteSize;
    let mipWidth = pixelWidth;
    let mipHeight = pixelHeight;
    let alignedMipWidth = alignedWidth;
    let alignedMipHeight = alignedHeight;
    let imageOffset = offset;

    const imageBuffers = new Array<Uint8Array>(numberOfMipmapLevels);

    for (let mipmapLevel = 0; mipmapLevel < numberOfMipmapLevels; mipmapLevel++)
    {
        const imageSize = dataView.getUint32(imageOffset, littleEndian);
        let elementOffset = imageOffset + 4;

        imageBuffers[mipmapLevel] = new Uint8Array(dataView.buffer, elementOffset, mipByteSize);

        elementOffset += mipByteSize;

        // HINT: Aligns to 4-byte boundary after jumping imageSize (in lieu of mipPadding)
        imageOffset += imageSize + 4;// (+4 to jump the imageSize field itself)
        imageOffset = imageOffset % 4 !== 0 ? imageOffset + 4 - (imageOffset % 4) : imageOffset;

        // Calculate mipWidth, mipHeight for _next_ iteration
        mipWidth = (mipWidth >> 1) || 1;
        mipHeight = (mipHeight >> 1) || 1;
        alignedMipWidth = (mipWidth + 4 - 1) & ~(4 - 1);
        alignedMipHeight = (mipHeight + 4 - 1) & ~(4 - 1);

        // Each mipmap level is 4-times smaller?
        mipByteSize = alignedMipWidth * alignedMipHeight * imagePixelByteSize;
    }

    return imageBuffers;
}

function getImagePixelByteSize(glType: number, glFormat: number, glInternalFormat: number)
{
    let imagePixelByteSize = KTX.INTERNAL_FORMAT_TO_BYTES_PER_PIXEL[glInternalFormat];

    if (glType !== 0)
    {
        // Uncompressed texture format
        if (KTX.TYPES_TO_BYTES_PER_COMPONENT[glType])
        {
            imagePixelByteSize = KTX.TYPES_TO_BYTES_PER_COMPONENT[glType] * KTX.FORMATS_TO_COMPONENTS[glFormat];
        }
        else
        {
            imagePixelByteSize = KTX.TYPES_TO_BYTES_PER_PIXEL[glType];
        }
    }

    if (imagePixelByteSize === undefined)
    {
        throw new Error('Unable to resolve the pixel format stored in the *.ktx file!');
    }

    return imagePixelByteSize;
}

function parseKTXHeader(dataView: DataView)
{
    const littleEndian = dataView.getUint32(KTX.FIELDS.ENDIANNESS, true) === KTX.ENDIANNESS;
    const glType = dataView.getUint32(KTX.FIELDS.GL_TYPE, littleEndian);
    const glFormat = dataView.getUint32(KTX.FIELDS.GL_FORMAT, littleEndian);
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
        glType,
        glFormat,
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
