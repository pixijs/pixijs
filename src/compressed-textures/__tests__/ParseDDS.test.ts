import { readFileSync } from 'fs-extra';
import path from 'path';
import { DDS } from '../dds/const';
import { parseDDS } from '../dds/parseDDS';

import type { TEXTURE_FORMATS } from '~/rendering';

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

    it('should parse a DDS R8 texture', async () =>
    {
        const arrayBuffer = createDx10UncompressedDDS({
            dxgiFormat: DDS.DXGI_FORMAT.DXGI_FORMAT_R8_UNORM,
            width: 4,
            height: 4,
            mipmapCount: 1,
            bytesPerPixel: 1,
        });

        const result = parseDDS(arrayBuffer, ['r8unorm']);

        expect(result.width).toBe(4);
        expect(result.height).toBe(4);
        expect(result.format).toBe('r8unorm');
        expect(result.resource.length).toBe(1);
        expect(result.resource[0].byteLength).toBe(16);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it.each<[string, number, TEXTURE_FORMATS, number, number[]]>([
        ['R8', DDS.DXGI_FORMAT.DXGI_FORMAT_R8_UNORM, 'r8unorm', 1, [16, 4]],
        ['RG8', DDS.DXGI_FORMAT.DXGI_FORMAT_R8G8_UNORM, 'rg8unorm', 2, [32, 8]],
        ['R16', DDS.DXGI_FORMAT.DXGI_FORMAT_R16_UNORM, 'r16uint', 2, [32, 8]],
        ['RGBA8', DDS.DXGI_FORMAT.DXGI_FORMAT_R8G8B8A8_UNORM, 'rgba8unorm', 4, [64, 16]],
    ])('should parse a DDS %s mipmap texture using format bytes per pixel', (
        _name,
        dxgiFormat,
        format,
        bytesPerPixel,
        expectedSizes
    ) =>
    {
        const arrayBuffer = createDx10UncompressedDDS({
            dxgiFormat,
            width: 4,
            height: 4,
            mipmapCount: 2,
            bytesPerPixel,
        });

        const result = parseDDS(arrayBuffer, [format]);

        expect(result.width).toBe(4);
        expect(result.height).toBe(4);
        expect(result.format).toBe(format);
        expect(result.resource.length).toBe(2);
        expect(result.resource.map((level) => level.byteLength)).toEqual(expectedSizes);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });
});

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

function createDx10UncompressedDDS(options: {
    dxgiFormat: number;
    width: number;
    height: number;
    mipmapCount: number;
    bytesPerPixel: number;
}): ArrayBuffer
{
    const headerBytes = DDS.MAGIC_SIZE + DDS.HEADER_SIZE + DDS.HEADER_DX10_SIZE;
    let payloadBytes = 0;
    let mipWidth = options.width;
    let mipHeight = options.height;

    for (let i = 0; i < options.mipmapCount; ++i)
    {
        payloadBytes += mipWidth * mipHeight * options.bytesPerPixel;
        mipWidth = Math.max(mipWidth >> 1, 1);
        mipHeight = Math.max(mipHeight >> 1, 1);
    }

    const buffer = new ArrayBuffer(headerBytes + payloadBytes);
    const header = new Uint32Array(buffer, 0, DDS.HEADER_SIZE / Uint32Array.BYTES_PER_ELEMENT);

    header[DDS.HEADER_FIELDS.MAGIC] = DDS.MAGIC_VALUE;
    header[DDS.HEADER_FIELDS.SIZE] = DDS.HEADER_SIZE;
    header[DDS.HEADER_FIELDS.HEIGHT] = options.height;
    header[DDS.HEADER_FIELDS.WIDTH] = options.width;
    header[DDS.HEADER_FIELDS.MIPMAP_COUNT] = options.mipmapCount;
    header[DDS.HEADER_FIELDS.PIXEL_FORMAT] = 32;
    header[DDS.HEADER_FIELDS.PF_FLAGS] = DDS.PIXEL_FORMAT_FLAGS.FOURCC;
    header[DDS.HEADER_FIELDS.FOURCC] = DDS.D3DFMT.DX10;

    const dx10 = new Uint32Array(
        buffer,
        DDS.MAGIC_SIZE + DDS.HEADER_SIZE,
        DDS.HEADER_DX10_SIZE / Uint32Array.BYTES_PER_ELEMENT
    );

    dx10[DDS.HEADER_DX10_FIELDS.DXGI_FORMAT] = options.dxgiFormat;
    dx10[DDS.HEADER_DX10_FIELDS.RESOURCE_DIMENSION] = DDS.D3D10_RESOURCE_DIMENSION.DDS_DIMENSION_TEXTURE2D;
    dx10[DDS.HEADER_DX10_FIELDS.ARRAY_SIZE] = 1;

    return buffer;
}
