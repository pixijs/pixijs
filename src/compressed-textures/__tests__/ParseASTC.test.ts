import { loadASTC } from '../astc/loadASTC';
import { parseASTC } from '../astc/parseASTC';
import { resolveCompressedTextureUrl } from '../shared/resolveCompressedTextureUrl';

import type { TEXTURE_FORMATS } from '~/rendering';

function file(blockWidth = 5, blockHeight = 5, width = 66, height = 66): ArrayBuffer
{
    const buffer = new ArrayBuffer(16 + (Math.ceil(width / blockWidth) * Math.ceil(height / blockHeight) * 16));
    const header = new DataView(buffer);

    header.setUint32(0, 0x5CA1AB13, true);
    new Uint8Array(buffer, 4, 3).set([blockWidth, blockHeight, 1]);
    const dimensions = [width, height, 1];

    for (let index = 0; index < dimensions.length; index++)
    {
        const value = dimensions[index];
        const offset = 7 + (index * 3);

        header.setUint8(offset, value & 255);
        header.setUint8(offset + 1, (value >> 8) & 255);
        header.setUint8(offset + 2, (value >> 16) & 255);
    }

    return buffer;
}

describe('Raw ASTC', () =>
{
    it.each(['4x4', '5x4', '5x5', '6x5', '6x6', '8x5', '8x6',
        '8x8', '10x5', '10x6', '10x8', '10x10', '12x10', '12x12'])(
        'parses %s linear and sRGB without copying the payload', (footprint) =>
        {
            const [x, y] = footprint.split('x').map(Number);
            const buffer = file(x, y);

            [false, true].forEach((srgb) =>
            {
                const format = `astc-${footprint}-unorm${srgb ? '-srgb' : ''}` as TEXTURE_FORMATS;
                const result = parseASTC(buffer, [format], srgb);

                expect(result).toMatchObject({
                    width: 66, height: 66, format,
                    alphaMode: 'no-premultiply-alpha', autoGenerateMipmaps: false
                });
                expect(result.resource).toHaveLength(1);
                expect(result.resource[0].buffer).toBe(buffer);
                expect(result.resource[0].byteOffset).toBe(16);
                expect(result.resource[0].byteLength).toBe(Math.ceil(66 / x) * Math.ceil(66 / y) * 16);
            });
        }
    );

    it('sizes the 66x66 5x5 regression case to 3136 bytes', () =>
    {
        expect(parseASTC(file(), ['astc-5x5-unorm']).resource[0].byteLength).toBe(3136);
    });

    it('reads all three dimension bytes', () =>
    {
        expect(parseASTC(file(12, 12, 65537, 1), ['astc-12x12-unorm']).width).toBe(65537);
        expect(parseASTC(file(8, 5, 1024, 512), ['astc-8x5-unorm'])).toMatchObject({ width: 1024, height: 512 });
    });

    it('rejects a short header and bad magic', () =>
    {
        expect(() => parseASTC(new ArrayBuffer(15), [])).toThrow('header');
        const buffer = file();

        new DataView(buffer).setUint32(0, 0);
        expect(() => parseASTC(buffer, [])).toThrow('magic');
    });

    it.each([4, 5, 6, 7, 10, 13])('rejects an invalid header field at byte %s', (offset) =>
    {
        const buffer = file();

        new Uint8Array(buffer)[offset] = 0;
        expect(() => parseASTC(buffer, ['astc-5x5-unorm'])).toThrow('ASTC');
    });

    it('rejects volume textures', () =>
    {
        const buffer = file();

        new Uint8Array(buffer)[13] = 2;
        expect(() => parseASTC(buffer, [])).toThrow('2D');
    });

    it('rejects missing hardware support, without falling back to RGBA', () =>
    {
        expect(() => parseASTC(file(), [])).toThrow('Unsupported ASTC');
    });

    it('rejects truncated or extra payload bytes', () =>
    {
        const buffer = file();

        expect(() => parseASTC(buffer.slice(0, -1), ['astc-5x5-unorm'])).toThrow('payload');
        expect(() => parseASTC(new ArrayBuffer(buffer.byteLength + 1), [])).toThrow('magic');
        const extra = new Uint8Array(buffer.byteLength + 1);

        extra.set(new Uint8Array(buffer));
        expect(() => parseASTC(extra.buffer, ['astc-5x5-unorm'])).toThrow('payload');
    });

    it('recognizes raw ASTC URLs and resolves dotted asset names', () =>
    {
        expect(loadASTC.test('image.astc?v=1')).toBe(true);
        expect(loadASTC.test('image.ktx')).toBe(false);
        expect(resolveCompressedTextureUrl.test('image.astc')).toBe(true);
        expect(resolveCompressedTextureUrl.parse('image.test@2x.astc')).toMatchObject({
            format: 'astc', resolution: 2,
        });
    });
});
