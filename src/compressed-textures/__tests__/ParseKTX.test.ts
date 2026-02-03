import { readFileSync } from 'fs-extra';
import path from 'path';
import { parseKTX } from '../ktx/parseKTX';

describe('Parse KTX', () =>
{
    it('should throw Error Unsupported texture format', async () =>
    {
        const buffer = readFileSync(path.join(__dirname, 'textures/test.astc.4x4.ktx'));
        const arrayBuffer = toArrayBuffer(buffer);

        expect(() =>
        {
            parseKTX(arrayBuffer, ['astc-5x4-unorm']);
        }).toThrow(Error);
    });

    it('should parse a KTX ASTC 4x4 texture', async () =>
    {
        const buffer = readFileSync(path.join(__dirname, 'textures/test.astc.ktx'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseKTX(arrayBuffer, ['astc-4x4-unorm']);

        expect(result.width).toBe(64);
        expect(result.height).toBe(64);
        expect(result.format).toBe('astc-4x4-unorm');
        expect(result.resource.length).toBe(1);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a KTX ASTC 4x4 texture srgb', async () =>
    {
        const buffer = readFileSync(path.join(__dirname, 'textures/test.astc.4x4.ktx'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseKTX(arrayBuffer, ['astc-4x4-unorm-srgb']);

        expect(result.width).toBe(66);
        expect(result.height).toBe(66);
        expect(result.format).toBe('astc-4x4-unorm-srgb');
        expect(result.resource.length).toBe(1);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a KTX ASTC 5x5 texture', async () =>
    {
        const buffer = readFileSync(path.join(__dirname, 'textures/test.astc.5x5.ktx'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseKTX(arrayBuffer, ['astc-5x5-unorm-srgb']);

        expect(result.width).toBe(66);
        expect(result.height).toBe(66);
        expect(result.format).toBe('astc-5x5-unorm-srgb');
        expect(result.resource.length).toBe(1);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a KTX ASTC 12x12 texture', async () =>
    {
        const buffer = readFileSync(path.join(__dirname, 'textures/test.astc.12x12.ktx'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseKTX(arrayBuffer, ['astc-12x12-unorm-srgb']);

        expect(result.width).toBe(66);
        expect(result.height).toBe(66);
        expect(result.format).toBe('astc-12x12-unorm-srgb');
        expect(result.resource.length).toBe(1);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a KTX BC1 texture', async () =>
    {
        const buffer = readFileSync(path.join(__dirname, 'textures/test.bc1.ktx'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseKTX(arrayBuffer, ['bc1-rgba-unorm-srgb']);

        expect(result.width).toBe(66);
        expect(result.height).toBe(66);
        expect(result.format).toBe('bc1-rgba-unorm-srgb');
        expect(result.resource.length).toBe(1);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a KTX BC3 texture', async () =>
    {
        const buffer = readFileSync(path.join(__dirname, 'textures/test.bc3.ktx'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseKTX(arrayBuffer, ['bc3-rgba-unorm-srgb']);

        expect(result.width).toBe(66);
        expect(result.height).toBe(66);
        expect(result.format).toBe('bc3-rgba-unorm-srgb');
        expect(result.resource.length).toBe(1);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a KTX ETC2 texture', async () =>
    {
        const buffer = readFileSync(path.join(__dirname, 'textures/test.etc2.ktx'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseKTX(arrayBuffer, ['etc2-rgba8unorm-srgb']);

        expect(result.width).toBe(66);
        expect(result.height).toBe(66);
        expect(result.format).toBe('etc2-rgba8unorm-srgb');
        expect(result.resource.length).toBe(1);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a KTX RGBA8 texture', async () =>
    {
        const buffer = readFileSync(path.join(__dirname, 'textures/test.RGBA8.ktx'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseKTX(arrayBuffer, ['rgba8unorm-srgb']);

        expect(result.width).toBe(66);
        expect(result.height).toBe(66);
        expect(result.format).toBe('rgba8unorm-srgb');
        expect(result.resource.length).toBe(1);
        expect(result.alphaMode).toBe('no-premultiply-alpha');
    });

    it('should parse a KTX BC3 mipmap texture', async () =>
    {
        const buffer = readFileSync(path.join(__dirname, 'textures/test.bc3.mipmap.ktx'));
        const arrayBuffer = toArrayBuffer(buffer);

        const result = parseKTX(arrayBuffer, ['bc3-rgba-unorm']);

        expect(result.width).toBe(128);
        expect(result.height).toBe(128);
        expect(result.format).toBe('bc3-rgba-unorm');
        expect(result.resource.length).toBe(8);
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
