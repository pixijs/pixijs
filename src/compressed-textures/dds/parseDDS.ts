import type { TEXTURE_FORMATS } from '../../rendering/renderers/shared/texture/const';
import type { TextureSourceOptions } from '../../rendering/renderers/shared/texture/sources/TextureSource';

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

// All values and structures referenced from:
// http://msdn.microsoft.com/en-us/library/bb943991.aspx/
const DDS_MAGIC = 0x20534444;
const DDSD_MIPMAPCOUNT = 0x20000;
const DDPF_FOURCC = 0x4;

/**
 * @param value
 */
function fourCCToInt32(value: string)
{
    return value.charCodeAt(0)
        + (value.charCodeAt(1) << 8)
        + (value.charCodeAt(2) << 16)
        + (value.charCodeAt(3) << 24);
}

/**
 * @param value
 */
function int32ToFourCC(value: number)
{
    return String.fromCharCode(
        value & 0xff,
        (value >> 8) & 0xff,
        (value >> 16) & 0xff,
        (value >> 24) & 0xff,
    );
}

const FOURCC_DXT1 = fourCCToInt32('DXT1');
const FOURCC_DXT3 = fourCCToInt32('DXT3');
const FOURCC_DXT5 = fourCCToInt32('DXT5');

const headerLengthInt = 31; // The header length in 32 bit ints

// Offsets into the header array
const offMagic = 0;

const offSize = 1;
const offFlags = 2;
const offHeight = 3;
const offWidth = 4;

const offMipmapCount = 7;

const offPfFlags = 20;
const offPfFourCC = 21;
const offRGBBitCount = 22;
const offRBitMask = 23;
const offGBitMask = 24;
const offBBitMask = 25;

export function parseDDS(buffer: ArrayBuffer, supportedFormats: TEXTURE_FORMATS[]): TextureSourceOptions<Uint8Array[]>
{
    const header = new Int32Array(buffer, 0, headerLengthInt);

    if (header[offMagic] !== DDS_MAGIC)
    {
        throw new Error('Invalid magic number in DDS header');
    }

    const headerIsZero = header[offPfFlags] === 0 ? 1 : 0;

    if (headerIsZero & DDPF_FOURCC)
    {
        throw new Error('Unsupported format, must contain a FourCC code');
    }

    const fourCC = header[offPfFourCC];
    let blockBytes = 0;
    let bytesPerPixel = 0;
    let format: TEXTURE_FORMATS;

    switch (fourCC)
    {
        case FOURCC_DXT1:
            blockBytes = 8;
            format = 'bc1-rgba-unorm';
            break;

        case FOURCC_DXT3:
            blockBytes = 16;
            format = 'bc2-rgba-unorm';
            break;

        case FOURCC_DXT5:
            blockBytes = 16;
            format = 'bc3-rgba-unorm';
            break;

        default: {
            const bitCount = header[offRGBBitCount];
            const rBitMask = header[offRBitMask];
            const gBitMask = header[offGBitMask];
            const bBitMask = header[offBBitMask];

            if (bitCount === 32)
            {
                if (rBitMask & 0xff
                    && gBitMask & 0xff00
                    && bBitMask & 0xff0000)
                {
                    format = 'rgba8unorm';
                    bytesPerPixel = 4;
                }
                else if (rBitMask & 0xff0000
                   && gBitMask & 0xff00
                   && bBitMask & 0xff)
                {
                    format = 'bgra8unorm';
                    bytesPerPixel = 4;
                }
            }
        }
    }

    const width = header[offWidth];
    const height = header[offHeight];
    let dataOffset = header[offSize] + 4;

    if (supportedFormats.indexOf(format) === -1)
    {
        throw new Error(`Unsupported texture format: ${int32ToFourCC(fourCC)} ${format}`);
    }

    if (blockBytes === 0)
    {
        return {
            format,
            width,
            height,
            resource: [new Uint8Array(buffer, dataOffset, width * height * bytesPerPixel)],
            alphaMode: 'no-premultiply-alpha'
        };
    }

    let mipmapCount = 1;

    if (header[offFlags] & DDSD_MIPMAPCOUNT)
    {
        mipmapCount = Math.max(1, header[offMipmapCount]);
    }

    const levelBuffers = [];

    let mipWidth = width;
    let mipHeight = height;

    for (let level = 0; level < mipmapCount; ++level)
    {
        const byteLength = blockBytes ? Math.max(4, mipWidth) / 4 * Math.max(4, mipHeight) / 4 * blockBytes
            : mipWidth * mipHeight * 4;

        const levelBuffer = new Uint8Array(buffer, dataOffset, byteLength);

        levelBuffers.push(levelBuffer);

        dataOffset += byteLength;

        mipWidth = Math.max(mipWidth >> 1, 1);
        mipHeight = Math.max(mipHeight >> 1, 1);
    }

    const textureOptions: TextureSourceOptions = {
        format,
        width,
        height,
        resource: levelBuffers,
        alphaMode: 'no-premultiply-alpha'
    };

    return textureOptions;
}
