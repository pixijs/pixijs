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

    it('should size each mip level of an uncompressed RGBA8 texture by its own dimensions', async () =>
    {
        const arrayBuffer = createUncompressedKTX(4, 4, 3);

        const result = parseKTX(arrayBuffer, ['rgba8unorm-srgb']);

        expect(result.resource.map((level) => level.byteLength)).toEqual([64, 16, 4]);
        result.resource.forEach((level, i) => expect(level.every((value) => value === i + 1)).toBe(true));
    });

    it('should parse an uncompressed RGBA8 mipmap texture whose size is not a multiple of 4', async () =>
    {
        const arrayBuffer = createUncompressedKTX(3, 3, 2);

        const result = parseKTX(arrayBuffer, ['rgba8unorm-srgb']);

        expect(result.resource.map((level) => level.byteLength)).toEqual([36, 4]);
        result.resource.forEach((level, i) => expect(level.every((value) => value === i + 1)).toBe(true));
    });
});

/**
 * Builds a KTX1 file holding an uncompressed SRGB8_ALPHA8 texture.
 * Every byte of mip level `i` is set to `i + 1`.
 * @param width - width of the base level
 * @param height - height of the base level
 * @param levels - number of mip levels
 */
function createUncompressedKTX(width: number, height: number, levels: number): ArrayBuffer
{
    const levelSizes: number[] = [];

    for (let i = 0, w = width, h = height; i < levels; i++, w = (w >> 1) || 1, h = (h >> 1) || 1)
    {
        levelSizes.push(w * h * 4);
    }

    const headerSize = 64;
    const buffer = new ArrayBuffer(headerSize + levelSizes.reduce((sum, size) => sum + 4 + size, 0));
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);

    bytes.set([0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A]);
    view.setUint32(12, 0x04030201, true); // endianness
    view.setUint32(16, 0x1401, true); // glType: UNSIGNED_BYTE
    view.setUint32(20, 1, true); // glTypeSize
    view.setUint32(24, 0x1908, true); // glFormat: RGBA
    view.setUint32(28, 0x8C43, true); // glInternalFormat: SRGB8_ALPHA8
    view.setUint32(32, 0x1908, true); // glBaseInternalFormat: RGBA
    view.setUint32(36, width, true);
    view.setUint32(40, height, true);
    view.setUint32(52, 1, true); // numberOfFaces
    view.setUint32(56, levels, true);

    let offset = headerSize;

    levelSizes.forEach((size, i) =>
    {
        view.setUint32(offset, size, true); // imageSize
        bytes.fill(i + 1, offset + 4, offset + 4 + size);
        offset += 4 + size;
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
