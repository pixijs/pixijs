import { AnimatedGIFAsset, AnimatedGIF } from '../src';
import { Assets } from '@pixi/assets';
import { expect } from 'chai';
import { createServer } from './resources';

describe('AnimatedGIFLoader', function ()
{
    before(function ()
    {
        this.server = createServer(54311);
        this.baseUrl = 'http://localhost:54311';
    });

    after(function ()
    {
        this.server.close();
        this.server = null;
        this.baseUrl = null;
    });

    afterEach(function ()
    {
        Assets.reset();
    });

    it('should have a loader', function ()
    {
        expect(AnimatedGIFAsset).to.be.a('object');
    });

    it('should load a gif file', async function ()
    {
        this.slow(1000);
        const url = `${this.baseUrl}/example.gif`;

        Assets.add('test', url);
        const test = await Assets.load('test');

        expect(test);
        expect(test).to.be.instanceOf(AnimatedGIF);
        expect(test.loop).to.be.true;
        expect(test.currentFrame).equals(0);
        expect(test.autoUpdate).to.be.true;
        expect(test.playing).to.be.true;
        expect(test.totalFrames).greaterThan(0);
        expect(test.progress).equals(0);
        expect(test.width).greaterThan(0);
        expect(test.height).greaterThan(0);
        expect(test.onComplete).equals(null);
        expect(test.onFrameChange).equals(null);
        expect(test.onLoop).equals(null);
        expect(test._frames);
        await Assets.unload('test');
        expect(test._frames).equals(null);
    });

    it('should load a gif file with options', async function ()
    {
        this.slow(1000);
        const url = `${this.baseUrl}/example.gif`;

        const data = { loop: false, autoUpdate: false, animationSpeed: 2 };

        Assets.add('test1', url, data);
        const test = await Assets.load('test1');

        expect(test);
        expect(test).to.be.instanceOf(AnimatedGIF);
        expect(test.loop).to.be.false;
        expect(test.animationSpeed).equals(2);
        expect(test.autoUpdate).equals(false);
        await Assets.unload('test1');
    });
});
