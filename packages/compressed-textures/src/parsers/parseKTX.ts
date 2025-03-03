import { BufferResource, FORMATS, TYPES } from '@pixi/core';
import { INTERNAL_FORMAT_TO_BYTES_PER_PIXEL, INTERNAL_FORMATS } from '../const';
import { CompressedTextureResource } from '../resources';

import type { CompressedLevelBuffer } from '../resources';

/**
 * The 12-byte KTX file identifier
 * @see https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/#2.1
 * @ignore
 */
const FILE_IDENTIFIER = [0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A];

/**
 * The value stored in the "endianness" field.
 * @see https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/#2.2
 * @ignore
 */
const ENDIANNESS = 0x04030201;

/**
 * Byte offsets of the KTX file header fields
 * @ignore
 */
const KTX_FIELDS = {
    FILE_IDENTIFIER: 0,
    ENDIANNESS: 12,
    GL_TYPE: 16,
    GL_TYPE_SIZE: 20,
    GL_FORMAT: 24,
    GL_INTERNAL_FORMAT: 28,
    GL_BASE_INTERNAL_FORMAT: 32,
    PIXEL_WIDTH: 36,
    PIXEL_HEIGHT: 40,
    PIXEL_DEPTH: 44,
    NUMBER_OF_ARRAY_ELEMENTS: 48,
    NUMBER_OF_FACES: 52,
    NUMBER_OF_MIPMAP_LEVELS: 56,
    BYTES_OF_KEY_VALUE_DATA: 60
};

/**
 * Byte size of the file header fields in {@code KTX_FIELDS}
 * @ignore
 */
const FILE_HEADER_SIZE = 64;

/**
 * Maps {@link PIXI.TYPES} to the bytes taken per component, excluding those ones that are bit-fields.
 * @ignore
 */
export const TYPES_TO_BYTES_PER_COMPONENT: { [id: number]: number } = {
    [TYPES.UNSIGNED_BYTE]: 1,
    [TYPES.UNSIGNED_SHORT]: 2,
    [TYPES.INT]: 4,
    [TYPES.UNSIGNED_INT]: 4,
    [TYPES.FLOAT]: 4,
    [TYPES.HALF_FLOAT]: 8
};

/**
 * Number of components in each {@link PIXI.FORMATS}
 * @ignore
 */
export const FORMATS_TO_COMPONENTS: { [id: number]: number } = {
    [FORMATS.RGBA]: 4,
    [FORMATS.RGB]: 3,
    [FORMATS.RG]: 2,
    [FORMATS.RED]: 1,
    [FORMATS.LUMINANCE]: 1,
    [FORMATS.LUMINANCE_ALPHA]: 2,
    [FORMATS.ALPHA]: 1
};

/**
 * Number of bytes per pixel in bit-field types in {@link PIXI.TYPES}
 * @ignore
 */
export const TYPES_TO_BYTES_PER_PIXEL: { [id: number]: number } = {
    [TYPES.UNSIGNED_SHORT_4_4_4_4]: 2,
    [TYPES.UNSIGNED_SHORT_5_5_5_1]: 2,
    [TYPES.UNSIGNED_SHORT_5_6_5]: 2
};

export function parseKTX(url: string, arrayBuffer: ArrayBuffer, loadKeyValueData = false): {
    compressed?: CompressedTextureResource[]
    uncompressed?: { resource: BufferResource, type: TYPES, format: FORMATS }[]
    kvData: Map<string, DataView> | null
}
{
    const dataView = new DataView(arrayBuffer);

    if (!validate(url, dataView))
    {
        return null;
    }

    const littleEndian = dataView.getUint32(KTX_FIELDS.ENDIANNESS, true) === ENDIANNESS;
    const glType = dataView.getUint32(KTX_FIELDS.GL_TYPE, littleEndian);
    // const glTypeSize = dataView.getUint32(KTX_FIELDS.GL_TYPE_SIZE, littleEndian);
    const glFormat = dataView.getUint32(KTX_FIELDS.GL_FORMAT, littleEndian);
    const glInternalFormat = dataView.getUint32(KTX_FIELDS.GL_INTERNAL_FORMAT, littleEndian);
    const pixelWidth = dataView.getUint32(KTX_FIELDS.PIXEL_WIDTH, littleEndian);
    const pixelHeight = dataView.getUint32(KTX_FIELDS.PIXEL_HEIGHT, littleEndian) || 1;// "pixelHeight = 0" -> "1"
    const pixelDepth = dataView.getUint32(KTX_FIELDS.PIXEL_DEPTH, littleEndian) || 1;// ^^
    const numberOfArrayElements = dataView.getUint32(KTX_FIELDS.NUMBER_OF_ARRAY_ELEMENTS, littleEndian) || 1;// ^^
    const numberOfFaces = dataView.getUint32(KTX_FIELDS.NUMBER_OF_FACES, littleEndian);
    const numberOfMipmapLevels = dataView.getUint32(KTX_FIELDS.NUMBER_OF_MIPMAP_LEVELS, littleEndian);
    const bytesOfKeyValueData = dataView.getUint32(KTX_FIELDS.BYTES_OF_KEY_VALUE_DATA, littleEndian);

    // Whether the platform architecture is little endian. If littleEndian !== platformLittleEndian, then the
    // file contents must be endian-converted!
    // TODO: Endianness conversion
    // const platformLittleEndian = new Uint8Array((new Uint32Array([ENDIANNESS])).buffer)[0] === 0x01;

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
        // TODO: Support splitting array-textures into multiple BaseTextures
        throw new Error('WebGL does not support array textures');
    }

    const imageBuffers = new Array<CompressedLevelBuffer[]>(numberOfArrayElements);
    let imagePixelByteSize: number;

    // Get block dimensions for the format
    let blockWidth = 4;
    let blockHeight = 4;

    // Special case for PVRTC 2bpp formats
    if (glInternalFormat === INTERNAL_FORMATS.COMPRESSED_RGB_PVRTC_2BPPV1_IMG ||
        glInternalFormat === INTERNAL_FORMATS.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG) {
        blockWidth = 8;
        blockHeight = 4;
    }

    if (glType !== 0)
    {
        // Uncompressed texture format
        if (TYPES_TO_BYTES_PER_COMPONENT[glType])
        {
            imagePixelByteSize = TYPES_TO_BYTES_PER_COMPONENT[glType] * FORMATS_TO_COMPONENTS[glFormat];
        }
        else
        {
            imagePixelByteSize = TYPES_TO_BYTES_PER_PIXEL[glType];
        }
    }
    else
    {
        // For compressed textures
        imagePixelByteSize = INTERNAL_FORMAT_TO_BYTES_PER_PIXEL[glInternalFormat];

        if (!imagePixelByteSize)
        {
            throw new Error(`Unsupported compressed format: 0x${glInternalFormat.toString(16)}`);
        }
    }

    const kvData: Map<string, DataView> | null = loadKeyValueData
        ? parseKvData(dataView, bytesOfKeyValueData, littleEndian)
        : null;

    let mipWidth = pixelWidth;
    let mipHeight = pixelHeight;
    let imageOffset = FILE_HEADER_SIZE + bytesOfKeyValueData;

    for (let mipmapLevel = 0; mipmapLevel < numberOfMipmapLevels; mipmapLevel++)
    {
        const imageSize = dataView.getUint32(imageOffset, littleEndian);
        let elementOffset = imageOffset + 4;

        // For compressed textures, align dimensions to block size
        const alignedWidth = glType === 0 ? ((mipWidth + blockWidth - 1) & ~(blockWidth - 1)) : mipWidth;
        const alignedHeight = glType === 0 ? ((mipHeight + blockHeight - 1) & ~(blockHeight - 1)) : mipHeight;

        for (let arrayElement = 0; arrayElement < numberOfArrayElements; arrayElement++)
        {
            let mips = imageBuffers[arrayElement];

            if (!mips)
            {
                mips = imageBuffers[arrayElement] = new Array(numberOfMipmapLevels);
            }

            mips[mipmapLevel] = {
                levelID: mipmapLevel,
                levelWidth: numberOfMipmapLevels > 1 || glType !== 0 ? mipWidth : alignedWidth,
                levelHeight: numberOfMipmapLevels > 1 || glType !== 0 ? mipHeight : alignedHeight,
                levelBuffer: new Uint8Array(arrayBuffer, elementOffset, imageSize / numberOfArrayElements)
            };
            elementOffset += imageSize / numberOfArrayElements;
        }

        imageOffset += 4 + imageSize;
        // Calculate next mip level dimensions
        mipWidth = Math.max(1, mipWidth >> 1);
        mipHeight = Math.max(1, mipHeight >> 1);
    }

    // We use the levelBuffers feature of CompressedTextureResource b/c texture data is image-major, not level-major.
    if (glType !== 0)
    {
        return {
            uncompressed: imageBuffers.map((levelBuffers) =>
            {
                let buffer: Float32Array | Uint32Array | Int32Array | Uint8Array = levelBuffers[0].levelBuffer;
                let convertToInt = false;

                if (glType === TYPES.FLOAT)
                {
                    buffer = new Float32Array(
                        levelBuffers[0].levelBuffer.buffer,
                        levelBuffers[0].levelBuffer.byteOffset,
                        levelBuffers[0].levelBuffer.byteLength / 4);
                }
                else if (glType === TYPES.UNSIGNED_INT)
                {
                    convertToInt = true;
                    buffer = new Uint32Array(
                        levelBuffers[0].levelBuffer.buffer,
                        levelBuffers[0].levelBuffer.byteOffset,
                        levelBuffers[0].levelBuffer.byteLength / 4);
                }
                else if (glType === TYPES.INT)
                {
                    convertToInt = true;
                    buffer = new Int32Array(
                        levelBuffers[0].levelBuffer.buffer,
                        levelBuffers[0].levelBuffer.byteOffset,
                        levelBuffers[0].levelBuffer.byteLength / 4);
                }

                return {
                    resource: new BufferResource(
                        buffer,
                        {
                            width: levelBuffers[0].levelWidth,
                            height: levelBuffers[0].levelHeight,
                        }
                    ),
                    type: glType,
                    format: convertToInt ? convertFormatToInteger(glFormat) : glFormat,
                };
            }),
            kvData
        };
    }

    return {
        compressed: imageBuffers.map((levelBuffers) => new CompressedTextureResource(null, {
            format: glInternalFormat,
            width: pixelWidth,
            height: pixelHeight,
            levels: numberOfMipmapLevels,
            levelBuffers,
        })),
        kvData
    };
}

/**
 * Checks whether the arrayBuffer contains a valid *.ktx file.
 * @param url
 * @param dataView
 */
function validate(url: string, dataView: DataView): boolean
{
    // NOTE: Do not optimize this into 3 32-bit integer comparison because the endianness
    // of the data is not specified.
    for (let i = 0; i < FILE_IDENTIFIER.length; i++)
    {
        if (dataView.getUint8(i) !== FILE_IDENTIFIER[i])
        {
            if (process.env.DEBUG)
            {
                console.error(`${url} is not a valid *.ktx file!`);
            }

            return false;
        }
    }

    return true;
}

function convertFormatToInteger(format: FORMATS)
{
    switch (format)
    {
        case FORMATS.RGBA: return FORMATS.RGBA_INTEGER;
        case FORMATS.RGB: return FORMATS.RGB_INTEGER;
        case FORMATS.RG: return FORMATS.RG_INTEGER;
        case FORMATS.RED: return FORMATS.RED_INTEGER;
        default: return format;
    }
}

function parseKvData(dataView: DataView, bytesOfKeyValueData: number, littleEndian: boolean): Map<string, DataView>
{
    const kvData = new Map<string, DataView>();
    let bytesIntoKeyValueData = 0;

    while (bytesIntoKeyValueData < bytesOfKeyValueData)
    {
        const keyAndValueByteSize = dataView.getUint32(FILE_HEADER_SIZE + bytesIntoKeyValueData, littleEndian);
        const keyAndValueByteOffset = FILE_HEADER_SIZE + bytesIntoKeyValueData + 4;
        const valuePadding = 3 - ((keyAndValueByteSize + 3) % 4);

        // Bounds check
        if (keyAndValueByteSize === 0 || keyAndValueByteSize > bytesOfKeyValueData - bytesIntoKeyValueData)
        {
            console.error('KTXLoader: keyAndValueByteSize out of bounds');
            break;
        }

        // Note: keyNulByte can't be 0 otherwise the key is an empty string.
        let keyNulByte = 0;

        for (; keyNulByte < keyAndValueByteSize; keyNulByte++)
        {
            if (dataView.getUint8(keyAndValueByteOffset + keyNulByte) === 0x00)
            {
                break;
            }
        }

        if (keyNulByte === -1)
        {
            console.error('KTXLoader: Failed to find null byte terminating kvData key');
            break;
        }

        const key = new TextDecoder().decode(
            new Uint8Array(dataView.buffer, keyAndValueByteOffset, keyNulByte)
        );
        const value = new DataView(
            dataView.buffer,
            keyAndValueByteOffset + keyNulByte + 1,
            keyAndValueByteSize - keyNulByte - 1,
        );

        kvData.set(key, value);

        // 4 = the keyAndValueByteSize field itself
        // keyAndValueByteSize = the bytes taken by the key and value
        // valuePadding = extra padding to align with 4 bytes
        bytesIntoKeyValueData += 4 + keyAndValueByteSize + valuePadding;
    }

    return kvData;
}
