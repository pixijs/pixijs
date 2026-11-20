import { parseKTX } from '../ktx/parseKTX';
import { createCompressedTexture } from '../shared/createCompressedTexture';
import { Loader } from '~/assets';
import { TextureSource } from '~/rendering';

/**
 * Builds a KTX1 file of ASTC 12x12 levels in which every byte holds its own offset, so each block is distinct.
 * @param size - width and height of the base level
 * @param levelCount - number of mip levels
 */
function createAstc12x12KTX(size: number, levelCount: number): ArrayBuffer
{
    const levelSizes = Array.from({ length: levelCount }, (_, i) => (Math.ceil(Math.max(size >> i, 1) / 12) ** 2) * 16);
    const buffer = new ArrayBuffer(64 + levelSizes.reduce((sum, s) => sum + 4 + s, 0));
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);

    bytes.set([0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A]);
    view.setUint32(12, 0x04030201, true); // endianness
    view.setUint32(20, 1, true); // glTypeSize
    view.setUint32(28, 0x93BD, true); // glInternalFormat: COMPRESSED_RGBA_ASTC_12x12_KHR
    view.setUint32(32, 0x1908, true); // glBaseInternalFormat: RGBA
    view.setUint32(36, size, true);
    view.setUint32(40, size, true);
    view.setUint32(52, 1, true); // numberOfFaces
    view.setUint32(56, levelCount, true);

    let offset = 64;

    for (const levelSize of levelSizes)
    {
        view.setUint32(offset, levelSize, true);
        offset += 4;

        for (let i = 0; i < levelSize; i++, offset++) bytes[offset] = offset;
    }

    return buffer;
}

describe('createCompressedTexture', () =>
{
    it('should pad a size that is not whole blocks and frame the texture to the image', () =>
    {
        const parsed = parseKTX(createAstc12x12KTX(25, 5), ['astc-12x12-unorm']);
        const texture = createCompressedTexture(
            parsed, 'test@2x.ktx', { src: 'test@2x.ktx', data: { resolution: 2 } }, new Loader()
        );
        const levels = texture.source.resource as Uint8Array[];

        expect(texture.source.pixelWidth).toBe(36);
        expect(texture.source.pixelHeight).toBe(36);
        expect(texture.frame.width).toBe(12.5);
        expect(texture.frame.height).toBe(12.5);
        expect(levels.map((level) => level.byteLength)).toEqual([144, 64, 16, 16, 16]);
        expect(Array.from(levels[1])).toEqual(Array(4).fill(Array.from(parsed.resource[1])).flat());
    });

    it('should not pad or frame a size that is whole blocks', () =>
    {
        const parsed = parseKTX(createAstc12x12KTX(24, 1), ['astc-12x12-unorm']);
        const texture = createCompressedTexture(parsed, 'test.ktx', { src: 'test.ktx' }, new Loader());

        expect(texture.source.pixelWidth).toBe(24);
        expect(texture.noFrame).toBe(true);
        expect(texture.source.resource).toEqual(parsed.resource);
    });

    it('should pad at the file size whatever TextureSource.defaultOptions.resolution is', () =>
    {
        const defaultResolution = TextureSource.defaultOptions.resolution;

        TextureSource.defaultOptions.resolution = 2;

        try
        {
            const parsed = parseKTX(createAstc12x12KTX(25, 1), ['astc-12x12-unorm']);
            const texture = createCompressedTexture(parsed, 'test.ktx', { src: 'test.ktx' }, new Loader());

            expect(texture.source.pixelWidth).toBe(36);
            expect(texture.frame.width).toBe(25);
        }
        finally
        {
            TextureSource.defaultOptions.resolution = defaultResolution;
        }
    });
});
