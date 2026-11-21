import '~/compressed-textures/dds/init';
import { Assets } from '~/assets';
import { DDS } from '~/compressed-textures/dds/const';
import { Sprite } from '~/scene';

import type { Texture } from '~/rendering';
import type { Container } from '~/scene';

// one color per mip level; R, RG and RGB each differ between levels, so one- and two-channel formats show distinct bars
const levelColors = [
    [1, 0, 0, 1],
    [0.25, 1, 0, 1],
    [0.75, 0, 1, 1],
    [0, 1, 1, 1],
    [0.5, 0.5, 0, 1],
];

// converts 0 or a normal float to half-float bits, which covers the level colors
function toHalf(value: number): number
{
    const bits = new Uint32Array(new Float32Array([value]).buffer)[0];
    const exponent = ((bits >>> 23) & 0xff) - 112;

    return exponent <= 0 ? 0 : (exponent << 10) | ((bits >>> 13) & 0x3ff);
}

type Write = (view: DataView, offset: number, color: number[]) => void;

const unorm8 = (channels: number[]): Write => (view, offset, color) =>
    channels.forEach((c, i) => view.setUint8(offset + i, Math.round(color[c] * 255)));
const float16 = (count: number): Write => (view, offset, color) =>
    color.slice(0, count).forEach((v, i) => view.setUint16(offset + (i * 2), toHalf(v), true));
const float32 = (count: number): Write => (view, offset, color) =>
    color.slice(0, count).forEach((v, i) => view.setFloat32(offset + (i * 4), v, true));
const unorm10 = (v: number) => Math.round(v * 1023);

const D = DDS.DXGI_FORMAT;

const formats: Record<string, { dxgi: number, bytes: number, write: Write }> = {
    rgba8unorm: { dxgi: D.DXGI_FORMAT_R8G8B8A8_UNORM, bytes: 4, write: unorm8([0, 1, 2, 3]) },
    bgra8unorm: { dxgi: D.DXGI_FORMAT_B8G8R8A8_UNORM, bytes: 4, write: unorm8([2, 1, 0, 3]) },
    'bgra8unorm-srgb': { dxgi: D.DXGI_FORMAT_B8G8R8A8_UNORM_SRGB, bytes: 4, write: unorm8([2, 1, 0, 3]) },
    r8unorm: { dxgi: D.DXGI_FORMAT_R8_UNORM, bytes: 1, write: unorm8([0]) },
    rg8unorm: { dxgi: D.DXGI_FORMAT_R8G8_UNORM, bytes: 2, write: unorm8([0, 1]) },
    rgb10a2unorm: {
        dxgi: D.DXGI_FORMAT_R10G10B10A2_UNORM,
        bytes: 4,
        write: (view, offset, [r, g, b, a]) => view.setUint32(
            offset, (unorm10(r) | (unorm10(g) << 10) | (unorm10(b) << 20) | ((a * 3) << 30)) >>> 0, true),
    },
    r16float: { dxgi: D.DXGI_FORMAT_R16_FLOAT, bytes: 2, write: float16(1) },
    rg16float: { dxgi: D.DXGI_FORMAT_R16G16_FLOAT, bytes: 4, write: float16(2) },
    rgba16float: { dxgi: D.DXGI_FORMAT_R16G16B16A16_FLOAT, bytes: 8, write: float16(4) },
    r32float: { dxgi: D.DXGI_FORMAT_R32_FLOAT, bytes: 4, write: float32(1) },
    rg32float: { dxgi: D.DXGI_FORMAT_R32G32_FLOAT, bytes: 8, write: float32(2) },
    rgba32float: { dxgi: D.DXGI_FORMAT_R32G32B32A32_FLOAT, bytes: 16, write: float32(4) },
};

/**
 * Builds a square DDS file with a full mip chain, each level filled with its color from `levelColors`.
 * @param format - the texture format the file holds, a key of `formats`
 * @param size - width and height of the base level, a power of two up to 16
 * @param legacyMasks - R, G, B and A bit masks for a pre-DX10 header; a DX10 header otherwise
 */
export function createUncompressedDDS(format: string, size: number, legacyMasks?: number[]): ArrayBuffer
{
    const { dxgi, bytes, write } = formats[format];
    const levels = Math.log2(size) + 1;
    const dataOffset = DDS.MAGIC_SIZE + DDS.HEADER_SIZE + (legacyMasks ? 0 : DDS.HEADER_DX10_SIZE);
    let dataSize = 0;

    for (let level = 0; level < levels; level++)
    {
        dataSize += ((size >> level) ** 2) * bytes;
    }

    const buffer = new ArrayBuffer(dataOffset + dataSize);
    const header = new Uint32Array(buffer, 0, dataOffset / 4);
    const fields = DDS.HEADER_FIELDS;

    header[fields.MAGIC] = DDS.MAGIC_VALUE;
    header[fields.SIZE] = DDS.HEADER_SIZE;
    header[fields.HEIGHT] = size;
    header[fields.WIDTH] = size;
    header[fields.MIPMAP_COUNT] = levels;

    if (legacyMasks)
    {
        header[fields.PF_FLAGS] = DDS.PIXEL_FORMAT_FLAGS.RGBA;
        header[fields.RGB_BITCOUNT] = 32;
        header.set(legacyMasks, fields.R_BIT_MASK);
    }
    else
    {
        const dx10 = header.subarray((DDS.MAGIC_SIZE + DDS.HEADER_SIZE) / 4);

        header[fields.PF_FLAGS] = DDS.PIXEL_FORMAT_FLAGS.FOURCC;
        header[fields.FOURCC] = DDS.D3DFMT.DX10;
        dx10[DDS.HEADER_DX10_FIELDS.DXGI_FORMAT] = dxgi;
        dx10[DDS.HEADER_DX10_FIELDS.RESOURCE_DIMENSION] = DDS.D3D10_RESOURCE_DIMENSION.DDS_DIMENSION_TEXTURE2D;
        dx10[DDS.HEADER_DX10_FIELDS.ARRAY_SIZE] = 1;
    }

    const view = new DataView(buffer);
    let offset = dataOffset;

    for (let level = 0; level < levels; level++)
    {
        for (let i = 0; i < (size >> level) ** 2; i++, offset += bytes)
        {
            write(view, offset, levelColors[level]);
        }
    }

    return buffer;
}

/**
 * Loads a DDS file and draws one bar per mip level from the top, level 0 first. A bar as tall as its level, and at
 * least as wide as the texture, samples exactly that level.
 * @param scene - the scene to add the bars to
 * @param file - the DDS file
 * @param x - left edge of the bars
 * @param y - top of the first bar
 * @param width - width of every bar, at least the texture's width
 */
export async function addMipBars(
    scene: Container,
    file: ArrayBuffer,
    x: number,
    y: number,
    width: number,
): Promise<void>
{
    const src = URL.createObjectURL(new Blob([file]));
    const texture = await Assets.load<Texture>({ src, parser: 'dds' });

    URL.revokeObjectURL(src);

    let top = y;

    for (let height = texture.source.pixelHeight; height >= 1; height >>= 1)
    {
        const sprite = new Sprite(texture);

        sprite.position.set(x, top);
        sprite.width = width;
        sprite.height = height;
        scene.addChild(sprite);

        top += height + 2;
    }
}
