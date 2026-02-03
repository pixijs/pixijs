import '~/rendering/init';
import { TextureSource } from '../sources/TextureSource';
import { TexturePoolClass } from '../TexturePool';

describe('TexturePool', () =>
{
    let pool: TexturePoolClass;

    beforeEach(() =>
    {
        pool = new TexturePoolClass();
    });

    afterEach(() =>
    {
        pool.clear(true);
    });

    describe('Pool Key Generation', () =>
    {
        it('should generate unique keys for different texture configurations', () =>
        {
            // Get textures with different configurations
            const texture1 = pool.getOptimalTexture(100, 100, 1, false, false);
            const texture2 = pool.getOptimalTexture(100, 100, 1, true, false); // different antialias
            const texture3 = pool.getOptimalTexture(100, 100, 1, false, true); // different mipmap
            const texture4 = pool.getOptimalTexture(200, 100, 1, false, false); // different width
            const texture5 = pool.getOptimalTexture(100, 200, 1, false, false); // different height

            // All textures should be different instances
            expect(texture1).not.toBe(texture2);
            expect(texture1).not.toBe(texture3);
            expect(texture1).not.toBe(texture4);
            expect(texture1).not.toBe(texture5);
            expect(texture2).not.toBe(texture3);
        });

        it('should return the same texture from pool for identical configurations', () =>
        {
            const texture1 = pool.getOptimalTexture(100, 100, 1, false, false);

            // Return it to the pool
            pool.returnTexture(texture1);

            // Get another with same config - should return the same instance
            const texture2 = pool.getOptimalTexture(100, 100, 1, false, false);

            expect(texture1).toBe(texture2);
        });

        it('should not mix textures with different mipmap settings', () =>
        {
            // Get a non-mipmapped texture
            const noMipmapTexture = pool.getOptimalTexture(128, 128, 1, false, false);

            expect(noMipmapTexture.source.autoGenerateMipmaps).toBe(false);

            // Return it to pool
            pool.returnTexture(noMipmapTexture);

            // Get a mipmapped texture with same dimensions
            const mipmappedTexture = pool.getOptimalTexture(128, 128, 1, false, true);

            expect(mipmappedTexture.source.autoGenerateMipmaps).toBe(true);

            // Should be different instances
            expect(noMipmapTexture).not.toBe(mipmappedTexture);
        });
    });

    describe('Bit Shift Operations', () =>
    {
        it('should correctly encode width in pool key (bit position 17)', () =>
        {
            // Create textures with different widths
            const texture128 = pool.getOptimalTexture(128, 64, 1, false, false);
            const texture256 = pool.getOptimalTexture(256, 64, 1, false, false);

            // Width should be encoded starting at bit 17
            // 128 (po2) << 17 = 16777216
            // 256 (po2) << 17 = 33554432
            // Keys should differ by this amount

            // Return first texture and get it again to verify pooling
            pool.returnTexture(texture128);
            const texture128Again = pool.getOptimalTexture(128, 64, 1, false, false);

            expect(texture128Again).toBe(texture128);

            // Different width should get different texture
            expect(texture256).not.toBe(texture128);
        });

        it('should correctly encode height in pool key (bit position 1)', () =>
        {
            const texture64 = pool.getOptimalTexture(64, 64, 1, false, false);
            const texture128 = pool.getOptimalTexture(64, 128, 1, false, false);

            // Height should be encoded starting at bit 1
            // Different heights should result in different pool keys
            expect(texture64).not.toBe(texture128);

            // Verify pooling works for same height
            pool.returnTexture(texture64);
            const texture64Again = pool.getOptimalTexture(64, 64, 1, false, false);

            expect(texture64Again).toBe(texture64);
        });

        it('should correctly encode antialias in pool key (bit position 0)', () =>
        {
            const textureNoAA = pool.getOptimalTexture(64, 64, 1, false, false);
            const textureWithAA = pool.getOptimalTexture(64, 64, 1, true, false);

            // Antialias flag should be at bit position 0
            expect(textureNoAA.source.antialias).toBe(false);
            expect(textureWithAA.source.antialias).toBe(true);
            expect(textureNoAA).not.toBe(textureWithAA);

            // Verify pooling
            pool.returnTexture(textureNoAA);
            const textureNoAA2 = pool.getOptimalTexture(64, 64, 1, false, false);

            expect(textureNoAA2).toBe(textureNoAA);
        });

        it('should correctly encode mipmap flag in pool key (bit position 2)', () =>
        {
            const textureNoMipmap = pool.getOptimalTexture(64, 64, 1, false, false);
            const textureWithMipmap = pool.getOptimalTexture(64, 64, 1, false, true);

            // Mipmap flag should be at bit position 2
            expect(textureNoMipmap.source.autoGenerateMipmaps).toBe(false);
            expect(textureWithMipmap.source.autoGenerateMipmaps).toBe(true);
            expect(textureNoMipmap).not.toBe(textureWithMipmap);

            // Verify they can coexist in pool
            pool.returnTexture(textureNoMipmap);
            pool.returnTexture(textureWithMipmap);

            const textureNoMipmap2 = pool.getOptimalTexture(64, 64, 1, false, false);
            const textureWithMipmap2 = pool.getOptimalTexture(64, 64, 1, false, true);

            expect(textureNoMipmap2).toBe(textureNoMipmap);
            expect(textureWithMipmap2).toBe(textureWithMipmap);
        });

        it('should handle all bit positions independently', () =>
        {
            // Test all combinations of flags with same dimensions
            const configs = [
                { aa: false, mipmap: false },
                { aa: true, mipmap: false },
                { aa: false, mipmap: true },
                { aa: true, mipmap: true },
            ];

            const textures = configs.map(({ aa, mipmap }) =>
                pool.getOptimalTexture(128, 128, 1, aa, mipmap));

            // All should be different instances
            for (let i = 0; i < textures.length; i++)
            {
                for (let j = i + 1; j < textures.length; j++)
                {
                    expect(textures[i]).not.toBe(textures[j]);
                }
            }

            // Verify each has correct properties
            expect(textures[0].source.antialias).toBe(false);
            expect(textures[0].source.autoGenerateMipmaps).toBe(false);

            expect(textures[1].source.antialias).toBe(true);
            expect(textures[1].source.autoGenerateMipmaps).toBe(false);

            expect(textures[2].source.antialias).toBe(false);
            expect(textures[2].source.autoGenerateMipmaps).toBe(true);

            expect(textures[3].source.antialias).toBe(true);
            expect(textures[3].source.autoGenerateMipmaps).toBe(true);
        });
    });

    describe('Mipmap Separation', () =>
    {
        it('should prevent mipmap textures from being used for non-mipmap requests', () =>
        {
            // Simulate the bug scenario: global mipmap setting enabled for text
            const originalDefault = TextureSource.defaultOptions.autoGenerateMipmaps;

            try
            {
                // Enable mipmaps globally (like user would for text quality)
                TextureSource.defaultOptions.autoGenerateMipmaps = true;

                // Text rendering requests texture WITH mipmaps
                const textTexture = pool.getOptimalTexture(256, 256, 1, false, true);

                expect(textTexture.source.autoGenerateMipmaps).toBe(true);

                // Return to pool
                pool.returnTexture(textTexture);

                // Filter system requests texture WITHOUT mipmaps (default behavior)
                const filterTexture = pool.getOptimalTexture(256, 256, 1, false, false);

                expect(filterTexture.source.autoGenerateMipmaps).toBe(false);

                // CRITICAL: Should NOT reuse the text texture
                expect(filterTexture).not.toBe(textTexture);
            }
            finally
            {
                // Restore original setting
                TextureSource.defaultOptions.autoGenerateMipmaps = originalDefault;
            }
        });

        it('should allow both mipmap and non-mipmap textures in the same pool', () =>
        {
            // Create both types
            const mipmapTexture1 = pool.getOptimalTexture(128, 128, 1, false, true);
            const normalTexture1 = pool.getOptimalTexture(128, 128, 1, false, false);

            expect(mipmapTexture1.source.autoGenerateMipmaps).toBe(true);
            expect(normalTexture1.source.autoGenerateMipmaps).toBe(false);

            // Return both to pool
            pool.returnTexture(mipmapTexture1);
            pool.returnTexture(normalTexture1);

            // Request them again in reverse order
            const normalTexture2 = pool.getOptimalTexture(128, 128, 1, false, false);
            const mipmapTexture2 = pool.getOptimalTexture(128, 128, 1, false, true);

            // Should get the correct ones back
            expect(normalTexture2).toBe(normalTexture1);
            expect(mipmapTexture2).toBe(mipmapTexture1);

            // Verify properties are still correct
            expect(normalTexture2.source.autoGenerateMipmaps).toBe(false);
            expect(mipmapTexture2.source.autoGenerateMipmaps).toBe(true);
        });

        it('should maintain separation across multiple pool operations', () =>
        {
            const iterations = 10;
            const mipmapTextures: any[] = [];
            const normalTextures: any[] = [];

            // Get multiple textures of each type
            for (let i = 0; i < iterations; i++)
            {
                mipmapTextures.push(pool.getOptimalTexture(64, 64, 1, false, true));
                normalTextures.push(pool.getOptimalTexture(64, 64, 1, false, false));
            }

            // All mipmap textures should have mipmaps
            mipmapTextures.forEach((tex) =>
            {
                expect(tex.source.autoGenerateMipmaps).toBe(true);
            });

            // All normal textures should NOT have mipmaps
            normalTextures.forEach((tex) =>
            {
                expect(tex.source.autoGenerateMipmaps).toBe(false);
            });

            // Return all to pool
            mipmapTextures.forEach((tex) => pool.returnTexture(tex));
            normalTextures.forEach((tex) => pool.returnTexture(tex));

            // Get them back - should maintain properties
            for (let i = 0; i < iterations; i++)
            {
                const mipmap = pool.getOptimalTexture(64, 64, 1, false, true);
                const normal = pool.getOptimalTexture(64, 64, 1, false, false);

                expect(mipmap.source.autoGenerateMipmaps).toBe(true);
                expect(normal.source.autoGenerateMipmaps).toBe(false);
            }
        });
    });

    describe('Default Parameter Behavior', () =>
    {
        it('should default autoGenerateMipmaps to false', () =>
        {
            // Call without the mipmap parameter (relies on default)
            const texture = pool.getOptimalTexture(64, 64, 1, false);

            expect(texture.source.autoGenerateMipmaps).toBe(false);
        });

        it('should respect explicit false for autoGenerateMipmaps', () =>
        {
            const texture = pool.getOptimalTexture(64, 64, 1, false, false);

            expect(texture.source.autoGenerateMipmaps).toBe(false);
        });

        it('should respect explicit true for autoGenerateMipmaps', () =>
        {
            const texture = pool.getOptimalTexture(64, 64, 1, false, true);

            expect(texture.source.autoGenerateMipmaps).toBe(true);
        });
    });

    describe('Backward Compatibility', () =>
    {
        it('should work with existing code that does not pass mipmap parameter', () =>
        {
            // Simulate existing filter/mask/render group code
            const texture1 = pool.getOptimalTexture(256, 256, 1, false);
            const texture2 = pool.getOptimalTexture(256, 256, 2, true);

            expect(texture1.source.autoGenerateMipmaps).toBe(false);
            expect(texture2.source.autoGenerateMipmaps).toBe(false);

            // Should still pool correctly
            pool.returnTexture(texture1);
            const texture3 = pool.getOptimalTexture(256, 256, 1, false);

            expect(texture3).toBe(texture1);
        });
    });

    describe('Power-of-2 Rounding', () =>
    {
        it('should round dimensions to power-of-2 and separate by mipmap flag', () =>
        {
            // Request 100x100, will be rounded to 128x128
            const texture1 = pool.getOptimalTexture(100, 100, 1, false, false);
            const texture2 = pool.getOptimalTexture(100, 100, 1, false, true);

            expect(texture1.source.pixelWidth).toBe(128);
            expect(texture1.source.pixelHeight).toBe(128);
            expect(texture2.source.pixelWidth).toBe(128);
            expect(texture2.source.pixelHeight).toBe(128);

            // Should be different instances due to mipmap flag
            expect(texture1).not.toBe(texture2);
            expect(texture1.source.autoGenerateMipmaps).toBe(false);
            expect(texture2.source.autoGenerateMipmaps).toBe(true);
        });
    });
});
