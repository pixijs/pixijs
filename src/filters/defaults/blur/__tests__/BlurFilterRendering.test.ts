import '~/scene/graphics/init';
import '~/rendering/init';
import { BlurFilter } from '../BlurFilter';
import { getWebGLRenderer } from '@test-utils';
import { RenderTexture, TexturePool } from '~/rendering';
import { Container, Graphics } from '~/scene';

describe('BlurFilter rendering', () =>
{
    it.each<[1 | 2, number]>([[1, 1], [1, 4], [2, 1], [2, 4]])(
        'should not sample pooled pixels with WebGL %i and quality %i', async (preferWebGLVersion, quality) =>
        {
            const renderer = await getWebGLRenderer({ width: 1000, height: 560, preferWebGLVersion });
            const output = RenderTexture.create({ width: 1000, height: 560 });
            const stage = new Container();
            const big = new Container({ x: 20, y: 50 });
            const small = new Container({ x: 600, y: 50 });
            const bigBlur = new BlurFilter({ strength: 8 });
            const smallBlur = new BlurFilter({ strength: 30, quality });

            big.addChild(new Graphics().rect(0, 0, 460, 460).fill(0xffffff));
            big.filters = [bigBlur];
            small.addChild(new Graphics()
                .circle(14, 14, 14).fill(0x44ff88)
                .circle(286, 286, 14)
                .fill(0x44ff88));
            small.filters = [smallBlur];
            stage.addChild(small);

            try
            {
                TexturePool.clear();
                renderer.render({ container: stage, target: output, clear: true });
                const expected = renderer.extract.pixels(output).pixels;

                TexturePool.clear();
                // Both filter frames use 512x512 pooled textures. Rendering the larger
                // object first leaves pixels outside the smaller object's filter frame.
                stage.addChildAt(big, 0);
                renderer.render({ container: stage, target: output, clear: true });
                const actual = renderer.extract.pixels(output).pixels;
                let maxDifference = 0;
                let maxAlpha = 0;

                for (let y = 0; y < 560; y++)
                {
                    for (let x = 540; x < 1000; x++)
                    {
                        const offset = ((y * 1000) + x) * 4;

                        maxAlpha = Math.max(maxAlpha, expected[offset + 3]);
                        for (let channel = 0; channel < 4; channel++)
                        {
                            const difference = Math.abs(actual[offset + channel] - expected[offset + channel]);

                            maxDifference = Math.max(maxDifference, difference);
                        }
                    }
                }

                expect(maxAlpha).toBeGreaterThan(0);
                expect(maxDifference).toBeLessThanOrEqual(1);
            }
            finally
            {
                stage.destroy({ children: true });
                bigBlur.destroy();
                smallBlur.destroy();
                output.destroy(true);
                TexturePool.clear();
                renderer.destroy();
            }
        });

    it.each([1, 4])('should repeat edge pixels with quality %i', async (quality) =>
    {
        const renderer = await getWebGLRenderer();
        const output = RenderTexture.create({ width: 40, height: 40 });
        const graphics = new Graphics().rect(0, 0, 40, 40).fill(0xffffff);
        const filter = new BlurFilter({ strength: 8, quality });

        filter.repeatEdgePixels = true;
        graphics.filters = [filter];

        try
        {
            TexturePool.clear();
            renderer.render({ container: graphics, target: output, clear: true });
            const { pixels } = renderer.extract.pixels(output);

            // Repeating a solid white edge must keep the entire rectangle opaque,
            // even when its backing texture is larger than the filter frame.
            expect(pixels.every((value) => value >= 253)).toBe(true);
        }
        finally
        {
            graphics.destroy();
            filter.destroy();
            output.destroy(true);
            TexturePool.clear();
            renderer.destroy();
        }
    });
});
