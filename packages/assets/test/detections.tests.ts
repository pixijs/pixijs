import { Assets, detectCompressedTextures } from '@pixi/assets';

describe('Detections', () =>
{
    beforeEach(() => Assets.reset());

    it('should add compressed texture formats', async () =>
    {
        await Assets.init();
        expect((Assets.resolver['_preferredOrder'][0].params.format as string[]).includes('s3tc')).toBe(true);
    });

    it('should remove any unsupported formats', async () =>
    {
        detectCompressedTextures.test = jest.fn(async () => false);
        await Assets.init();
        expect(Assets.resolver['_preferredOrder'][0].params.format).toEqual(
            ['webp', 'avif', 'png', 'jpg', 'jpeg']
        );
    });
});
