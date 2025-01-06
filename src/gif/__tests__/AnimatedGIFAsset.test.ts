import { AnimatedGIFAsset } from '../AnimatedGIFAsset';
import { AnimatedGIFSource } from '../AnimatedGIFSource';
import { basePath } from '@test-utils';
import { Assets } from '~/assets';
import { extensions } from '~/extensions';

describe('AnimatedGIFLoader', () =>
{
    beforeEach(async () =>
    {
        extensions.add(AnimatedGIFAsset);
        await Assets.init({
            basePath,
        });
    });

    afterEach(() =>
    {
        Assets.reset();
        extensions.remove(AnimatedGIFAsset);
    });

    it('should have a loader', () =>
    {
        expect(typeof AnimatedGIFAsset).toBe('object');
    });

    it('should load a gif file', async () =>
    {
        const test = await Assets.load<AnimatedGIFSource>({ alias: 'test', src: 'gif/example.gif' });

        expect(test).toBeInstanceOf(AnimatedGIFSource);
        expect(test.totalFrames).toBeGreaterThan(0);
        expect(test.width).toBeGreaterThan(0);
        expect(test.height).toBeGreaterThan(0);
        expect(test.frames).toBeDefined();
        expect(test.textures).toBeDefined();
        await Assets.unload('test');
        expect(test.frames).toBe(null);
        expect(test.textures).toBe(null);
    });

    it('should load a gif file with options', async () =>
    {
        const data = { fps: 15 };
        const test = await Assets.load<AnimatedGIFSource>({ alias: 'test1', src: 'gif/example.gif', data });

        expect(test).toBeInstanceOf(AnimatedGIFSource);
        await Assets.unload('test1');
    });
});
