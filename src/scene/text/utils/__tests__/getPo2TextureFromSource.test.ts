import { getPo2TextureFromSource } from '../getPo2TextureFromSource';

describe('getPo2TextureFromSource', () =>
{
    it('should give correct texture', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 100;
        canvas.height = 100;

        const texture = getPo2TextureFromSource(canvas, 100, 100, 1);

        expect(texture.frame).toEqual(expect.objectContaining({
            width: 100,
            height: 100,
        }));

        expect(texture.source).toEqual(expect.objectContaining({
            pixelWidth: 128,
            pixelHeight: 128,
            width: 128,
            height: 128,
        }));

        canvas.width = 200;
        canvas.height = 200;

        const texture2 = getPo2TextureFromSource(canvas, 100, 100, 2);

        expect(texture2.frame).toEqual(expect.objectContaining({
            width: 50,
            height: 50,
        }));

        expect(texture2.source).toEqual(expect.objectContaining({
            pixelWidth: 256,
            pixelHeight: 256,
            width: 128,
            height: 128,
        }));
    });

    describe('autoGenerateMipmaps parameter', () =>
    {
        it('should create texture with mipmaps when autoGenerateMipmaps is true', () =>
        {
            const canvas = document.createElement('canvas');

            canvas.width = 100;
            canvas.height = 100;

            const texture = getPo2TextureFromSource(canvas, 100, 100, 1, true);

            expect(texture.source.autoGenerateMipmaps).toBe(true);
        });

        it('should create texture without mipmaps when autoGenerateMipmaps is false', () =>
        {
            const canvas = document.createElement('canvas');

            canvas.width = 100;
            canvas.height = 100;

            const texture = getPo2TextureFromSource(canvas, 100, 100, 1, false);

            expect(texture.source.autoGenerateMipmaps).toBe(false);
        });

        it('should default to false when autoGenerateMipmaps is not provided', () =>
        {
            const canvas = document.createElement('canvas');

            canvas.width = 100;
            canvas.height = 100;

            const texture = getPo2TextureFromSource(canvas, 100, 100, 1);

            expect(texture.source.autoGenerateMipmaps).toBe(false);
        });

        it('should not mix textures with different mipmap settings in the pool', () =>
        {
            const canvas = document.createElement('canvas');

            canvas.width = 128;
            canvas.height = 128;

            const textureWithoutMipmaps = getPo2TextureFromSource(canvas, 128, 128, 1, false);
            const textureWithMipmaps = getPo2TextureFromSource(canvas, 128, 128, 1, true);

            expect(textureWithoutMipmaps.source.autoGenerateMipmaps).toBe(false);
            expect(textureWithMipmaps.source.autoGenerateMipmaps).toBe(true);
            expect(textureWithoutMipmaps).not.toBe(textureWithMipmaps);
        });
    });
});
