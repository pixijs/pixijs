import type { TEXTURE_FORMATS } from '../../rendering/renderers/shared/texture/const';
import type { TextureSourceOptions } from '../../rendering/renderers/shared/texture/sources/TextureSource';

const footprints = new Set([
    '4x4', '5x4', '5x5', '6x5', '6x6', '8x5', '8x6',
    '8x8', '10x5', '10x6', '10x8', '10x10', '12x10', '12x12',
]);

/**
 * Parses a raw 2D `.astc` file into options for a single-level compressed texture, without decoding its blocks
 *
 * The 16-byte header stores no color space, so `srgb` picks between the `-unorm` and `-unorm-srgb` formats.
 * @param buffer - the whole file, header included
 * @param supportedFormats - the formats the device can sample
 * @param srgb - picks the `-srgb` format, which the GPU converts from sRGB to linear when sampling
 * @returns the texture options, with the image's width and height in pixels
 * @internal
 */
export function parseASTC(
    buffer: ArrayBuffer,
    supportedFormats: TEXTURE_FORMATS[],
    srgb = false,
): TextureSourceOptions<Uint8Array[]>
{
    if (buffer.byteLength < 16)
    {
        throw new Error('Invalid ASTC file: truncated header');
    }

    const header = new DataView(buffer);

    if (header.getUint32(0, true) !== 0x5CA1AB13)
    {
        throw new Error('Invalid ASTC file: incorrect magic');
    }

    const blockWidth = header.getUint8(4);
    const blockHeight = header.getUint8(5);
    const footprint = `${blockWidth}x${blockHeight}`;
    const read24 = (offset: number): number => header.getUint8(offset)
        | (header.getUint8(offset + 1) << 8) | (header.getUint8(offset + 2) << 16);
    const width = read24(7);
    const height = read24(10);
    const depth = read24(13);

    if (header.getUint8(6) !== 1 || depth !== 1)
    {
        throw new Error('Invalid ASTC file: only 2D textures with depth 1 are supported');
    }
    if (!width || !height)
    {
        throw new Error('Invalid ASTC file: dimensions must be nonzero');
    }
    if (!footprints.has(footprint))
    {
        throw new Error(`Invalid ASTC block footprint: ${footprint}`);
    }

    const format = `astc-${footprint}-unorm${srgb ? '-srgb' : ''}` as TEXTURE_FORMATS;

    if (!supportedFormats.includes(format))
    {
        throw new Error(`Unsupported ASTC texture format: ${format}`);
    }

    const byteLength = Math.ceil(width / blockWidth) * Math.ceil(height / blockHeight) * 16;

    if (buffer.byteLength !== 16 + byteLength)
    {
        throw new Error(`Invalid ASTC payload: expected ${byteLength} bytes, got ${buffer.byteLength - 16}`);
    }

    return {
        width,
        height,
        format,
        resource: [new Uint8Array(buffer, 16, byteLength)],
        alphaMode: 'no-premultiply-alpha',
        autoGenerateMipmaps: false,
    };
}
