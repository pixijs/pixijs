import { Assets, detectCompressedTextures } from '@pixi/assets';
import { extensions } from '@pixi/core';

describe('Detections', () =>
{
    beforeEach(() => Assets.reset());

    it('should have default detections', () =>
    {
        expect(Assets['_detections']).toHaveLength(2);
    });

    it('should add compressed texture formats', async () =>
    {
        extensions.add(detectCompressedTextures);
        await Assets.init();
        expect((Assets.resolver['_preferredOrder'][0].params.format as string[]).includes('s3tc')).toBe(true);
        extensions.remove(detectCompressedTextures);
    });

    it('should remove any unsupported formats', async () =>
    {
        extensions.add(detectCompressedTextures);
        detectCompressedTextures.test = jest.fn(async () => false);
        await Assets.init();
        expect(Assets.resolver['_preferredOrder'][0].params.format).toEqual(
            ['avif', 'webp', 'png', 'jpg', 'jpeg']
        );
        extensions.remove(detectCompressedTextures);
    });
});
