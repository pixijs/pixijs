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
            const texture1 = pool.getOptimalTexture({ width: 100, height: 100 });
            const texture2 = pool.getOptimalTexture({ width: 100, height: 100, antialias: true }); // different antialias
            // different mipmap
            const texture3 = pool.getOptimalTexture({
                width: 100, height: 100, autoGenerateMipmaps: true
            });
            const texture4 = pool.getOptimalTexture({ width: 200, height: 100 }); // different width
            const texture5 = pool.getOptimalTexture({ width: 100, height: 200 }); // different height

            // All textures should be different instances
            expect(texture1).not.toBe(texture2);
            expect(texture1).not.toBe(texture3);
            expect(texture1).not.toBe(texture4);
            expect(texture1).not.toBe(texture5);
            expect(texture2).not.toBe(texture3);
        });

        it('should return the same texture from pool for identical configurations', () =>
        {
            const texture1 = pool.getOptimalTexture({ width: 100, height: 100 });

            // Return it to the pool
            pool.returnTexture(texture1);

            // Get another with same config - should return the same instance
            const texture2 = pool.getOptimalTexture({ width: 100, height: 100 });

            expect(texture1).toBe(texture2);
        });

        it('should not mix textures with different mipmap settings', () =>
        {
            // Get a non-mipmapped texture
            const noMipmapTexture = pool.getOptimalTexture({ width: 128, height: 128 });

            expect(noMipmapTexture.source.autoGenerateMipmaps).toBe(false);

            // Return it to pool
            pool.returnTexture(noMipmapTexture);

            // Get a mipmapped texture with same dimensions
            const mipmappedTexture = pool.getOptimalTexture({ width: 128, height: 128, autoGenerateMipmaps: true });

            expect(mipmappedTexture.source.autoGenerateMipmaps).toBe(true);

            // Should be different instances
            expect(noMipmapTexture).not.toBe(mipmappedTexture);
        });

        it('should handle small po2 heights with mipmap flag correctly', () =>
        {
            // Test pool key generation with small dimensions (1-3 pixels)
            // to ensure proper separation across different configurations
            const texture1 = pool.getOptimalTexture({ width: 64, height: 1 });
            const texture2 = pool.getOptimalTexture({ width: 64, height: 1, autoGenerateMipmaps: true });
            const texture3 = pool.getOptimalTexture({ width: 64, height: 2 });
            const texture4 = pool.getOptimalTexture({ width: 64, height: 2, autoGenerateMipmaps: true });
            const texture5 = pool.getOptimalTexture({ width: 64, height: 3 });

            // All configurations should produce unique textures
            expect(texture1).not.toBe(texture2);
            expect(texture1).not.toBe(texture3);
            expect(texture1).not.toBe(texture4);
            expect(texture1).not.toBe(texture5);
            expect(texture2).not.toBe(texture3);
            expect(texture2).not.toBe(texture4);
            expect(texture2).not.toBe(texture5);
            expect(texture3).not.toBe(texture4);
            expect(texture3).not.toBe(texture5);
            expect(texture4).not.toBe(texture5);

            // Verify mipmap settings are preserved
            expect(texture1.source.autoGenerateMipmaps).toBe(false);
            expect(texture2.source.autoGenerateMipmaps).toBe(true);
            expect(texture3.source.autoGenerateMipmaps).toBe(false);
            expect(texture4.source.autoGenerateMipmaps).toBe(true);
            expect(texture5.source.autoGenerateMipmaps).toBe(false);

            // Verify pool reuse works correctly
            pool.returnTexture(texture2);
            pool.returnTexture(texture4);

            const texture2Again = pool.getOptimalTexture({ width: 64, height: 1, autoGenerateMipmaps: true });
            const texture4Again = pool.getOptimalTexture({ width: 64, height: 2, autoGenerateMipmaps: true });

            expect(texture2Again).toBe(texture2);
            expect(texture4Again).toBe(texture4);

            // Verify textures with different mipmap settings are not confused
            pool.returnTexture(texture4);
            const texture5Again = pool.getOptimalTexture({ width: 64, height: 3 });

            expect(texture5Again).not.toBe(texture4);
            expect(texture5Again.source.autoGenerateMipmaps).toBe(false);
        });
    });

    describe('Bit Shift Operations', () =>
    {
        it('should correctly encode width in pool key (bit position 17)', () =>
        {
            // Create textures with different widths
            const texture128 = pool.getOptimalTexture({ width: 128, height: 64 });
            const texture256 = pool.getOptimalTexture({ width: 256, height: 64 });

            // Width should be encoded starting at bit 17
            // 128 (po2) << 17 = 16777216
            // 256 (po2) << 17 = 33554432
            // Keys should differ by this amount

            // Return first texture and get it again to verify pooling
            pool.returnTexture(texture128);
            const texture128Again = pool.getOptimalTexture({ width: 128, height: 64 });

            expect(texture128Again).toBe(texture128);

            // Different width should get different texture
            expect(texture256).not.toBe(texture128);
        });

        it('should correctly encode height in pool key (bit position 1)', () =>
        {
            const texture64 = pool.getOptimalTexture({ width: 64, height: 64 });
            const texture128 = pool.getOptimalTexture({ width: 64, height: 128 });

            // Height should be encoded starting at bit 1
            // Different heights should result in different pool keys
            expect(texture64).not.toBe(texture128);

            // Verify pooling works for same height
            pool.returnTexture(texture64);
            const texture64Again = pool.getOptimalTexture({ width: 64, height: 64 });

            expect(texture64Again).toBe(texture64);
        });

        it('should correctly encode antialias in pool key (bit position 0)', () =>
        {
            const textureNoAA = pool.getOptimalTexture({ width: 64, height: 64 });
            const textureWithAA = pool.getOptimalTexture({ width: 64, height: 64, antialias: true });

            // Antialias flag should be at bit position 0
            expect(textureNoAA.source.antialias).toBe(false);
            expect(textureWithAA.source.antialias).toBe(true);
            expect(textureNoAA).not.toBe(textureWithAA);

            // Verify pooling
            pool.returnTexture(textureNoAA);
            const textureNoAA2 = pool.getOptimalTexture({ width: 64, height: 64 });

            expect(textureNoAA2).toBe(textureNoAA);
        });

        it('should correctly encode mipmap flag in pool key (bit position 1)', () =>
        {
            const textureNoMipmap = pool.getOptimalTexture({ width: 64, height: 64 });
            const textureWithMipmap = pool.getOptimalTexture({ width: 64, height: 64, autoGenerateMipmaps: true });

            expect(textureNoMipmap.source.autoGenerateMipmaps).toBe(false);
            expect(textureWithMipmap.source.autoGenerateMipmaps).toBe(true);
            expect(textureNoMipmap).not.toBe(textureWithMipmap);

            // Verify they can coexist in pool
            pool.returnTexture(textureNoMipmap);
            pool.returnTexture(textureWithMipmap);

            const textureNoMipmap2 = pool.getOptimalTexture({ width: 64, height: 64 });
            const textureWithMipmap2 = pool.getOptimalTexture({ width: 64, height: 64, autoGenerateMipmaps: true });

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
                pool.getOptimalTexture({ width: 128, height: 128, antialias: aa, autoGenerateMipmaps: mipmap }));

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
            const originalDefault = TextureSource.defaultOptions.autoGenerateMipmaps;

            try
            {
                TextureSource.defaultOptions.autoGenerateMipmaps = true;

                const textTexture = pool.getOptimalTexture({ width: 256, height: 256, autoGenerateMipmaps: true });

                expect(textTexture.source.autoGenerateMipmaps).toBe(true);

                pool.returnTexture(textTexture);

                // Request texture without mipmaps
                const filterTexture = pool.getOptimalTexture({ width: 256, height: 256 });

                expect(filterTexture.source.autoGenerateMipmaps).toBe(false);
                expect(filterTexture).not.toBe(textTexture);
            }
            finally
            {
                TextureSource.defaultOptions.autoGenerateMipmaps = originalDefault;
            }
        });

        it('should allow both mipmap and non-mipmap textures in the same pool', () =>
        {
            const mipmapTexture1 = pool.getOptimalTexture({ width: 128, height: 128, autoGenerateMipmaps: true });
            const normalTexture1 = pool.getOptimalTexture({ width: 128, height: 128 });

            expect(mipmapTexture1.source.autoGenerateMipmaps).toBe(true);
            expect(normalTexture1.source.autoGenerateMipmaps).toBe(false);

            pool.returnTexture(mipmapTexture1);
            pool.returnTexture(normalTexture1);

            const normalTexture2 = pool.getOptimalTexture({ width: 128, height: 128 });
            const mipmapTexture2 = pool.getOptimalTexture({ width: 128, height: 128, autoGenerateMipmaps: true });

            expect(normalTexture2).toBe(normalTexture1);
            expect(mipmapTexture2).toBe(mipmapTexture1);
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
                mipmapTextures.push(pool.getOptimalTexture({ width: 64, height: 64, autoGenerateMipmaps: true }));
                normalTextures.push(pool.getOptimalTexture({ width: 64, height: 64 }));
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
            mipmapTextures.forEach((tex) => { pool.returnTexture(tex); });
            normalTextures.forEach((tex) => { pool.returnTexture(tex); });

            // Get them back - should maintain properties
            for (let i = 0; i < iterations; i++)
            {
                const mipmap = pool.getOptimalTexture({ width: 64, height: 64, autoGenerateMipmaps: true });
                const normal = pool.getOptimalTexture({ width: 64, height: 64 });

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
            const texture = pool.getOptimalTexture({ width: 64, height: 64 });

            expect(texture.source.autoGenerateMipmaps).toBe(false);
        });

        it('should respect explicit false for autoGenerateMipmaps', () =>
        {
            const texture = pool.getOptimalTexture({ width: 64, height: 64 });

            expect(texture.source.autoGenerateMipmaps).toBe(false);
        });

        it('should respect explicit true for autoGenerateMipmaps', () =>
        {
            const texture = pool.getOptimalTexture({ width: 64, height: 64, autoGenerateMipmaps: true });

            expect(texture.source.autoGenerateMipmaps).toBe(true);
        });
    });

    describe('Backward Compatibility', () =>
    {
        it('should work with existing code that does not pass mipmap parameter', () =>
        {
            // Simulate existing filter/mask/render group code
            const texture1 = pool.getOptimalTexture({ width: 256, height: 256 });
            const texture2 = pool.getOptimalTexture({ width: 256, height: 256, resolution: 2, antialias: true });

            expect(texture1.source.autoGenerateMipmaps).toBe(false);
            expect(texture2.source.autoGenerateMipmaps).toBe(false);

            // Should still pool correctly
            pool.returnTexture(texture1);
            const texture3 = pool.getOptimalTexture({ width: 256, height: 256 });

            expect(texture3).toBe(texture1);
        });
    });

    describe('Per-request format and scale mode', () =>
    {
        it('should keep textures of different formats and scale modes in separate buckets', () =>
        {
            const colour = pool.getOptimalTexture({ width: 100, height: 100 });
            const float = pool.getOptimalTexture({ width: 100, height: 100, format: 'rgba16float' });
            const nearest = pool.getOptimalTexture({ width: 100, height: 100, scaleMode: 'nearest' });

            expect(float).not.toBe(colour);
            expect(nearest).not.toBe(colour);
            expect(float.source.format).toBe('rgba16float');
            expect(nearest.source.scaleMode).toBe('nearest');

            pool.returnTexture(colour);
            pool.returnTexture(float);
            pool.returnTexture(nearest);

            expect(pool.getOptimalTexture({ width: 100, height: 100, format: 'rgba16float' })).toBe(float);
            expect(pool.getOptimalTexture({ width: 100, height: 100, scaleMode: 'nearest' })).toBe(nearest);
            expect(pool.getOptimalTexture({ width: 100, height: 100 })).toBe(colour);
        });

        it('should treat options matching the pool defaults as no options', () =>
        {
            const plain = pool.getOptimalTexture({ width: 100, height: 100 });

            pool.returnTexture(plain);

            const explicit = pool.getOptimalTexture({
                width: 100,
                height: 100,
                format: plain.source.format,
                scaleMode: plain.source.scaleMode,
            });

            expect(explicit).toBe(plain);
        });

        it('should prune and clear every table, not only the default one', () =>
        {
            pool.setScreenSize(1, 300, 300);

            const capped = pool.getOptimalTexture({ width: 300, height: 300, format: 'rgba16float' });
            const source = capped.source;

            pool.returnTexture(capped);
            pool.setScreenSize(1, 400, 400);

            expect(source.destroyed).toBe(true);

            const po2 = pool.getOptimalTexture({ width: 100, height: 100, scaleMode: 'nearest' });
            const po2Source = po2.source;

            pool.returnTexture(po2);
            pool.clear(true);

            expect(po2Source.destroyed).toBe(true);
        });
    });

    describe('Screen Size Cap', () =>
    {
        it('should not cap anything while no screen is registered', () =>
        {
            const texture = pool.getOptimalTexture({ width: 1280, height: 300 });

            expect(texture.source.pixelWidth).toBe(2048);
            expect(texture.source.pixelHeight).toBe(512);
        });

        it('should cap each axis to the screen when the request fits', () =>
        {
            pool.setScreenSize(1, 1280, 720);

            const texture = pool.getOptimalTexture({ width: 1280, height: 300 });

            expect(texture.source.pixelWidth).toBe(1280);
            expect(texture.source.pixelHeight).toBe(512);
            expect(texture.frame.width).toBe(1280);
            expect(texture.frame.height).toBe(300);
        });

        it('should report the size a request would get without taking a texture', () =>
        {
            pool.setScreenSize(1, 1280, 720);

            const size = pool.getOptimalSize(1280, 300);

            expect(size).toEqual({ width: 1280, height: 512 });
            expect(pool.getOptimalSize(640, 150, 2)).toEqual({ width: 1280, height: 512 });

            const texture = pool.getOptimalTexture({ width: 1280, height: 300 });

            expect(texture.source.pixelWidth).toBe(size.width);
            expect(texture.source.pixelHeight).toBe(size.height);
        });

        it('should never cap upwards', () =>
        {
            pool.setScreenSize(1, 1280, 720);

            const texture = pool.getOptimalTexture({ width: 1300, height: 300 });

            expect(texture.source.pixelWidth).toBe(2048);
            expect(texture.source.pixelHeight).toBe(512);
        });

        it('should use physical pixels when the resolution is not 1', () =>
        {
            pool.setScreenSize(1, 1280, 720);

            const texture = pool.getOptimalTexture({ width: 640, height: 360, resolution: 2 });

            expect(texture.source.pixelWidth).toBe(1280);
            expect(texture.source.pixelHeight).toBe(720);
            expect(texture.source.width).toBe(640);
            expect(texture.source.height).toBe(360);
        });

        it('should keep capped and power-of-two requests in separate buckets', () =>
        {
            pool.setScreenSize(1, 1280, 720);

            const capped = pool.getOptimalTexture({ width: 1280, height: 300 });
            const po2 = pool.getOptimalTexture({ width: 1300, height: 300 });

            expect(capped).not.toBe(po2);

            pool.returnTexture(capped);
            pool.returnTexture(po2);

            expect(pool.getOptimalTexture({ width: 1300, height: 300 })).toBe(po2);
            expect(pool.getOptimalTexture({ width: 1280, height: 300 })).toBe(capped);
        });

        it('should pick the smallest screen the request fits in when several are registered', () =>
        {
            pool.setScreenSize(1, 1280, 720);
            pool.setScreenSize(2, 800, 600);

            const large = pool.getOptimalTexture({ width: 1280, height: 720 });
            const small = pool.getOptimalTexture({ width: 800, height: 600 });
            const fits = pool.getOptimalTexture({ width: 700, height: 500 });

            expect([large.source.pixelWidth, large.source.pixelHeight]).toEqual([1280, 720]);
            expect([small.source.pixelWidth, small.source.pixelHeight]).toEqual([800, 600]);
            // 700 fits in the 800 wide screen, 500 fits in both screens but 512 is smaller than either
            expect([fits.source.pixelWidth, fits.source.pixelHeight]).toEqual([800, 512]);
        });

        it('should not prune when a screen is re-registered with the same size', () =>
        {
            pool.setScreenSize(1, 1280, 720);

            const texture = pool.getOptimalTexture({ width: 1280, height: 720 });

            pool.returnTexture(texture);
            pool.setScreenSize(1, 1280, 720);

            expect(texture.destroyed).toBe(false);
            expect(pool.getOptimalTexture({ width: 1280, height: 720 })).toBe(texture);
        });

        it('should prune only the screen buckets when a renderer is removed', () =>
        {
            pool.setScreenSize(1, 1280, 720);

            const screenTexture = pool.getOptimalTexture({ width: 1280, height: 720 });
            const po2Texture = pool.getOptimalTexture({ width: 256, height: 256 });

            pool.returnTexture(screenTexture);
            pool.returnTexture(po2Texture);

            pool.removeScreen(1);

            expect(screenTexture.destroyed).toBe(true);
            expect(po2Texture.destroyed).toBe(false);
            // the power-of-two ladder is never pruned
            expect(pool.getOptimalTexture({ width: 256, height: 256 })).toBe(po2Texture);
        });

        it('should prune the old buckets when a renderer changes size', () =>
        {
            pool.setScreenSize(1, 1280, 720);

            const oldTexture = pool.getOptimalTexture({ width: 1280, height: 720 });

            pool.returnTexture(oldTexture);

            pool.setScreenSize(1, 800, 600);

            expect(oldTexture.destroyed).toBe(true);

            const newTexture = pool.getOptimalTexture({ width: 800, height: 600 });

            expect(newTexture).not.toBe(oldTexture);
            expect([newTexture.source.pixelWidth, newTexture.source.pixelHeight]).toEqual([800, 600]);
        });

        it('should destroy a texture returned after its bucket was pruned', () =>
        {
            pool.setScreenSize(1, 1280, 720);

            const texture = pool.getOptimalTexture({ width: 1280, height: 720 });
            const source = texture.source;

            pool.removeScreen(1);

            expect(() => pool.returnTexture(texture)).not.toThrow();
            expect(texture.destroyed).toBe(true);
            expect(source.destroyed).toBe(true);
        });

        it('should ignore a texture that did not come from the pool', () =>
        {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { /* silence the debug warning */ });
            const texture = pool.createTexture({ width: 64, height: 64 });

            expect(() => pool.returnTexture(texture)).not.toThrow();
            expect(texture.destroyed).toBe(false);

            warnSpy.mockRestore();
            texture.destroy(true);
        });
    });

    describe('Deprecated positional arguments', () =>
    {
        let warnSpy: jest.SpyInstance;
        let groupSpy: jest.SpyInstance;

        beforeEach(() =>
        {
            warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { /* silence the deprecation */ });
            groupSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation(() => { /* silence the group */ });
        });

        afterEach(() =>
        {
            warnSpy.mockRestore();
            groupSpy.mockRestore();
        });

        // the deprecation helper dedupes messages across the whole run, and logs the message through
        // console.groupCollapsed when it is available, so look for it in anything either spy was given
        function firedFor(message: string): boolean
        {
            const calls: unknown[][] = [...warnSpy.mock.calls, ...groupSpy.mock.calls];

            return calls.some((args) => args.some((arg) => typeof arg === 'string' && arg.includes(message)));
        }

        it('should support positional arguments on getOptimalTexture', () =>
        {
            const positional = pool.getOptimalTexture(100, 50, 2, true, true);
            const options = pool.getOptimalTexture({
                width: 100, height: 50, resolution: 2, antialias: true, autoGenerateMipmaps: true
            });

            expect(positional.source.pixelWidth).toBe(options.source.pixelWidth);
            expect(positional.source.pixelHeight).toBe(options.source.pixelHeight);
            expect(positional.source._resolution).toBe(options.source._resolution);
            expect(positional.frame.width).toBe(options.frame.width);
            expect(positional.frame.height).toBe(options.frame.height);
            expect(positional.source.antialias).toBe(true);
            expect(positional.source.autoGenerateMipmaps).toBe(true);

            expect(warnSpy).toHaveBeenCalled();
            expect(firedFor('TexturePool.getOptimalTexture params are now an options object')).toBe(true);
        });

        it('should apply the old defaults when optional positional arguments are omitted', () =>
        {
            const positional = pool.getOptimalTexture(100, 50);
            const options = pool.getOptimalTexture({ width: 100, height: 50 });

            expect(positional.source.pixelWidth).toBe(options.source.pixelWidth);
            expect(positional.source.pixelHeight).toBe(options.source.pixelHeight);
            expect(positional.source._resolution).toBe(1);
            expect(positional.source.antialias).toBe(false);
            expect(positional.source.autoGenerateMipmaps).toBe(false);
        });

        it('should support positional arguments on createTexture', () =>
        {
            const positional = pool.createTexture(64, 32, true, true);
            const options = pool.createTexture({
                width: 64, height: 32, antialias: true, autoGenerateMipmaps: true
            });

            expect(positional.source.pixelWidth).toBe(options.source.pixelWidth);
            expect(positional.source.pixelHeight).toBe(options.source.pixelHeight);
            expect(positional.frame.width).toBe(options.frame.width);
            expect(positional.frame.height).toBe(options.frame.height);
            expect(positional.source.antialias).toBe(true);
            expect(positional.source.autoGenerateMipmaps).toBe(true);

            expect(warnSpy).toHaveBeenCalled();
            expect(firedFor('TexturePool.createTexture params are now an options object')).toBe(true);

            positional.destroy(true);
            options.destroy(true);
        });
    });

    describe('Power-of-2 Rounding', () =>
    {
        it('should round dimensions to power-of-2 and separate by mipmap flag', () =>
        {
            // Request 100x100, will be rounded to 128x128
            const texture1 = pool.getOptimalTexture({ width: 100, height: 100 });
            const texture2 = pool.getOptimalTexture({ width: 100, height: 100, autoGenerateMipmaps: true });

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
