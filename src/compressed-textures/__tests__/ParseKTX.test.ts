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

    it('should parse a KTX RGBA8 texture with multiple mip levels', () =>
    {
        const level0 = new Uint8Array(4 * 4 * 4).fill(0x11);
        const level1 = new Uint8Array(2 * 2 * 4).fill(0x22);
        const arrayBuffer = createUncompressedRgba8Ktx(4, 4, [level0, level1]);

        const result = parseKTX(arrayBuffer, ['rgba8unorm-srgb']);

        expect(result.width).toBe(4);
        expect(result.height).toBe(4);
        expect(result.format).toBe('rgba8unorm-srgb');
        expect(result.resource.length).toBe(2);
        expect(result.resource[0].byteLength).toBe(64);
        expect(result.resource[1].byteLength).toBe(16);
        expect(result.resource[1][0]).toBe(0x22);
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

// Minimal little-endian uncompressed KTX1 (GL_SRGB8_ALPHA8 -> rgba8unorm-srgb).
function createUncompressedRgba8Ktx(width: number, height: number, levels: Uint8Array[]): ArrayBuffer
{
    const identifier = [0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A];
    const headerSize = 64;
    let payloadSize = 0;

    for (let i = 0; i < levels.length; i++)
    {
        payloadSize += 4 + levels[i].byteLength;
    }

    const buffer = new ArrayBuffer(headerSize + payloadSize);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    bytes.set(identifier, 0);
    view.setUint32(12, 0x04030201, true); // endianness
    view.setUint32(16, 5121, true); // glType = GL_UNSIGNED_BYTE
    view.setUint32(20, 1, true); // glTypeSize
    view.setUint32(24, 6408, true); // glFormat = GL_RGBA
    view.setUint32(28, 35907, true); // glInternalFormat = GL_SRGB8_ALPHA8
    view.setUint32(32, 6408, true); // glBaseInternalFormat = GL_RGBA
    view.setUint32(36, width, true);
    view.setUint32(40, height, true);
    view.setUint32(44, 0, true); // pixelDepth
    view.setUint32(48, 0, true); // numberOfArrayElements
    view.setUint32(52, 1, true); // numberOfFaces
    view.setUint32(56, levels.length, true);
    view.setUint32(60, 0, true); // bytesOfKeyValueData

    let offset = headerSize;

    for (let i = 0; i < levels.length; i++)
    {
        view.setUint32(offset, levels[i].byteLength, true);
        offset += 4;
        bytes.set(levels[i], offset);
        offset += levels[i].byteLength;
    }

    return buffer;
}
