import { readFileSync } from 'fs-extra';
import path from 'path';
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
