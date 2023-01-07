import { AnimatedGIFAsset, AnimatedGIF } from '../src';
import { Assets } from '@pixi/assets';
import { createServer } from './resources';

describe('AnimatedGIFLoader', () =>
{
    let server: any;
    let baseUrl: string;

    beforeAll(() =>
    {
        server = createServer(54311);
        baseUrl = 'http://localhost:54311';
    });

    afterAll(() =>
    {
        server.close();
        server = null;
    });

    afterEach(() =>
    {
        Assets.reset();
    });

    it('should have a loader', () =>
    {
        expect(typeof AnimatedGIFAsset).toBe('object');
    });

    it('should load a gif file', async () =>
    {
        const url = `${baseUrl}/example.gif`;

        Assets.add('test', url);
        const test = await Assets.load('test');

        expect(test);
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
        expect(test._frames);
        await Assets.unload('test');
        expect(test._frames).toBe(null);
    });

    it('should load a gif file with options', async () =>
    {
        const url = `${baseUrl}/example.gif`;

        const data = { loop: false, autoUpdate: false, animationSpeed: 2 };

        Assets.add('test1', url, data);
        const test = await Assets.load('test1');

        expect(test);
        expect(test).toBeInstanceOf(AnimatedGIF);
        expect(test.loop).toBe(false);
        expect(test.animationSpeed).toBe(2);
        expect(test.autoUpdate).toBe(false);
        await Assets.unload('test1');
    });
});
