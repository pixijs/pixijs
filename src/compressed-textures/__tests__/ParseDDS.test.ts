import { readFileSync } from 'fs-extra';
import path from 'path';
import { DDS } from '../dds/const';
import { parseDDS } from '../dds/parseDDS';

describe('Parse DDS', () =>
{
    it('should throw Error Unsupported texture format', async () =>
    {
        const buffer = readFileSync(path.resolve(__dirname, 'textures/test.dxt1.dds'));
        const arrayBuffer = toArrayBuffer(buffer);

        expect(() =>
        {
            parseDDS(arrayBuffer, ['bc2-rgba-unorm']);
        }).toThrow(Error);
    });

    it('should parse a DDS DXT1 BC1 texture', async () =>
    {
        const buffer = readFileSync(path.resolve(__dirname, 'textures/test.dxt1.dds'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseDDS(arrayBuffer, ['bc1-rgba-unorm']);

        expect(result.width).toBe(64);
        expect(result.height).toBe(64);
        expect(result.format).toBe('bc1-rgba-unorm');
        expect(result.resource.length).toBe(1);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a DDS DXT1 BC1 mipmap texture', async () =>
    {
        const buffer = readFileSync(path.resolve(__dirname, 'textures/test.dxt1.mipmap.dds'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseDDS(arrayBuffer, ['bc1-rgba-unorm']);

        expect(result.width).toBe(64);
        expect(result.height).toBe(64);
        expect(result.format).toBe('bc1-rgba-unorm');
        expect(result.resource.length).toBe(7);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a DDS DXT3 BC2 texture', async () =>
    {
        const buffer = readFileSync(path.resolve(__dirname, 'textures/test.dxt3.dds'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseDDS(arrayBuffer, ['bc2-rgba-unorm']);

        expect(result.width).toBe(64);
        expect(result.height).toBe(64);
        expect(result.format).toBe('bc2-rgba-unorm');
        expect(result.resource.length).toBe(1);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a DDS DXT3 BC2 mipmap texture', async () =>
    {
        const buffer = readFileSync(path.resolve(__dirname, 'textures/test.dxt3.mipmap.dds'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseDDS(arrayBuffer, ['bc2-rgba-unorm']);

        expect(result.width).toBe(64);
        expect(result.height).toBe(64);
        expect(result.format).toBe('bc2-rgba-unorm');
        expect(result.resource.length).toBe(7);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a DDS DXT5 BC3 texture', async () =>
    {
        const buffer = readFileSync(path.resolve(__dirname, 'textures/test.dxt5.dds'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseDDS(arrayBuffer, ['bc3-rgba-unorm']);

        expect(result.width).toBe(64);
        expect(result.height).toBe(64);
        expect(result.format).toBe('bc3-rgba-unorm');
        expect(result.resource.length).toBe(1);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a DDS DXT5 BC3 mipmap texture', async () =>
    {
        const buffer = readFileSync(path.resolve(__dirname, 'textures/test.dxt5.mipmap.dds'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseDDS(arrayBuffer, ['bc3-rgba-unorm']);

        expect(result.width).toBe(64);
        expect(result.height).toBe(64);
        expect(result.format).toBe('bc3-rgba-unorm');
        expect(result.resource.length).toBe(7);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a DDS BC4 texture', async () =>
    {
        const buffer = readFileSync(path.resolve(__dirname, 'textures/test.bc4.dds'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseDDS(arrayBuffer, ['bc4-r-unorm']);

        expect(result.width).toBe(64);
        expect(result.height).toBe(64);
        expect(result.format).toBe('bc4-r-unorm');
        expect(result.resource.length).toBe(1);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a DDS BC4 mipmap texture', async () =>
    {
        const buffer = readFileSync(path.resolve(__dirname, 'textures/test.bc4.mipmap.dds'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseDDS(arrayBuffer, ['bc4-r-unorm']);

        expect(result.width).toBe(64);
        expect(result.height).toBe(64);
        expect(result.format).toBe('bc4-r-unorm');
        expect(result.resource.length).toBe(7);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a DDS BC5 texture', async () =>
    {
        const buffer = readFileSync(path.resolve(__dirname, 'textures/test.bc5.dds'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseDDS(arrayBuffer, ['bc5-rg-unorm']);

        expect(result.width).toBe(64);
        expect(result.height).toBe(64);
        expect(result.format).toBe('bc5-rg-unorm');
        expect(result.resource.length).toBe(1);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a DDS BC5 mipmap texture', async () =>
    {
        const buffer = readFileSync(path.resolve(__dirname, 'textures/test.bc5.mipmap.dds'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseDDS(arrayBuffer, ['bc5-rg-unorm']);

        expect(result.width).toBe(64);
        expect(result.height).toBe(64);
        expect(result.format).toBe('bc5-rg-unorm');
        expect(result.resource.length).toBe(7);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a DDS BC7 DX10 texture', async () =>
    {
        const buffer = readFileSync(path.resolve(__dirname, 'textures/test.bc7.dds'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseDDS(arrayBuffer, ['bc7-rgba-unorm']);

        expect(result.width).toBe(64);
        expect(result.height).toBe(64);
        expect(result.format).toBe('bc7-rgba-unorm');
        expect(result.resource.length).toBe(1);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a DDS RGBA8 texture', async () =>
    {
        const buffer = readFileSync(path.resolve(__dirname, 'textures/test.rgba8.dds'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseDDS(arrayBuffer, ['bgra8unorm']);

        expect(result.width).toBe(64);
        expect(result.height).toBe(64);
        expect(result.format).toBe('bgra8unorm');
        expect(result.resource.length).toBe(1);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a DDS RGBA8 mipmap texture', async () =>
    {
        const buffer = readFileSync(path.resolve(__dirname, 'textures/test.rgba8.mipmap.dds'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseDDS(arrayBuffer, ['bgra8unorm']);

        expect(result.width).toBe(64);
        expect(result.height).toBe(64);
        expect(result.format).toBe('bgra8unorm');
        expect(result.resource.length).toBe(7);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it.each([
        ['r8unorm', DDS.DXGI_FORMAT.DXGI_FORMAT_R8_UNORM, 1],
        ['rg8unorm', DDS.DXGI_FORMAT.DXGI_FORMAT_R8G8_UNORM, 2],
        ['r16uint', DDS.DXGI_FORMAT.DXGI_FORMAT_R16_UNORM, 2],
        ['rgba8unorm', DDS.DXGI_FORMAT.DXGI_FORMAT_R8G8B8A8_UNORM, 4],
        ['rgba32float', DDS.DXGI_FORMAT.DXGI_FORMAT_R32G32B32A32_FLOAT, 16],
    ] as const)('should size each mip level of an uncompressed %s mipmap texture', (format, dxgiFormat, bytesPerPixel) =>
    {
        const arrayBuffer = createUncompressedDDS(dxgiFormat, 4, 4, 3, bytesPerPixel);

        const result = parseDDS(arrayBuffer, [format]);

        expect(result.format).toBe(format);
        expect(result.resource.map((level) => level.byteLength))
            .toEqual([16 * bytesPerPixel, 4 * bytesPerPixel, bytesPerPixel]);
        result.resource.forEach((level, i) => expect(level.every((value) => value === i + 1)).toBe(true));
    });
});

/**
 * Builds a DDS file with a DX10 header holding an uncompressed texture.
 * Every byte of mip level `i` is set to `i + 1`.
 * @param dxgiFormat - DXGI format of the texture
 * @param width - width of the base level
 * @param height - height of the base level
 * @param levels - number of mip levels
 * @param bytesPerPixel - bytes per pixel of the format
 */
function createUncompressedDDS(dxgiFormat: number, width: number, height: number, levels: number,
    bytesPerPixel: number): ArrayBuffer
{
    const levelSizes: number[] = [];

    for (let i = 0, w = width, h = height; i < levels; i++, w = Math.max(w >> 1, 1), h = Math.max(h >> 1, 1))
    {
        levelSizes.push(w * h * bytesPerPixel);
    }

    const dataOffset = DDS.MAGIC_SIZE + DDS.HEADER_SIZE + DDS.HEADER_DX10_SIZE;
    const buffer = new ArrayBuffer(dataOffset + levelSizes.reduce((sum, size) => sum + size, 0));
    const header = new Uint32Array(buffer, 0, dataOffset / 4);
    const dx10Header = header.subarray((DDS.MAGIC_SIZE + DDS.HEADER_SIZE) / 4);

    header[DDS.HEADER_FIELDS.MAGIC] = DDS.MAGIC_VALUE;
    header[DDS.HEADER_FIELDS.SIZE] = DDS.HEADER_SIZE;
    header[DDS.HEADER_FIELDS.HEIGHT] = height;
    header[DDS.HEADER_FIELDS.WIDTH] = width;
    header[DDS.HEADER_FIELDS.MIPMAP_COUNT] = levels;
    header[DDS.HEADER_FIELDS.PF_FLAGS] = DDS.PIXEL_FORMAT_FLAGS.FOURCC;
    header[DDS.HEADER_FIELDS.FOURCC] = DDS.D3DFMT.DX10;
    dx10Header[DDS.HEADER_DX10_FIELDS.DXGI_FORMAT] = dxgiFormat;
    dx10Header[DDS.HEADER_DX10_FIELDS.RESOURCE_DIMENSION] = DDS.D3D10_RESOURCE_DIMENSION.DDS_DIMENSION_TEXTURE2D;
    dx10Header[DDS.HEADER_DX10_FIELDS.ARRAY_SIZE] = 1;

    let offset = dataOffset;

    levelSizes.forEach((size, i) =>
    {
        new Uint8Array(buffer, offset, size).fill(i + 1);
        offset += size;
    });

    return buffer;
}

function toArrayBuffer(buf: Buffer): ArrayBuffer
{
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);

    for (let i = 0; i < buf.length; ++i)
    {
        view[i] = buf[i];
    }

    return ab;
}
