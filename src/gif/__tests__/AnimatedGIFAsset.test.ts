import { AnimatedGIF } from '../AnimatedGIF';
import { AnimatedGIFAsset } from '../AnimatedGIFAsset';
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
        const test = await Assets.load<AnimatedGIF>({ alias: 'test', src: 'gif/example.gif' });

        expect(test).toBeInstanceOf(AnimatedGIF);
        expect(test.loop).toBe(true);
        expect(test.currentFrame).toBe(0);
        expect(test.autoUpdate).toBe(true);
        expect(test.playing).toBe(true);
        expect(test.totalFrames).toBeGreaterThan(0);
        expect(test.progress).toBe(0);
        expect(test.width).toBeGreaterThan(0);
        expect(test.height).toBeGreaterThan(0);
        expect(test.onComplete).toBe(null);
        expect(test.onFrameChange).toBe(null);
        expect(test.onLoop).toBe(null);
        expect(test['_frames']).toBeDefined();
        await Assets.unload('test');
        expect(test['_frames']).toBe(null);
    });

    it('should load a gif file with options', async () =>
    {
        const data = { loop: false, autoUpdate: false, animationSpeed: 2 };
        const test = await Assets.load<AnimatedGIF>({ alias: 'test1', src: 'gif/example.gif', data });

        expect(test).toBeInstanceOf(AnimatedGIF);
        expect(test.loop).toBe(false);
        expect(test.animationSpeed).toBe(2);
        expect(test.autoUpdate).toBe(false);
        await Assets.unload('test1');
    });
});
