import { AnimatedGIFLoader, AnimatedGIF } from '../src';
import { expect } from 'chai';
import { Loader } from '@pixi/loaders';
import { createServer } from './resources';

describe('AnimatedGIFLoader', function ()
{
    before(function ()
    {
        Loader.registerPlugin(AnimatedGIFLoader);
        this.server = createServer(54311);
        this.baseUrl = 'http://localhost:54311';
    });

    after(function ()
    {
        this.server.close();
        this.server = null;
        this.baseUrl = null;
    });

    describe('use', function ()
    {
        it('should have a loader', function ()
        {
            expect(AnimatedGIFLoader).to.be.a('object');
        });

        it('should load a gif file', function (done)
        {
            this.slow(1000);
            const loader = new Loader();
            const url = `${this.baseUrl}/example.gif`;

            loader.add('test', url);
            loader.load(() =>
            {
                expect(loader.resources.test);
                expect(loader.resources.test.data).to.be.instanceOf(ArrayBuffer);
                expect(loader.resources.test.animation).to.be.instanceOf(AnimatedGIF);
                // Check for default values
                const { animation } = loader.resources.test;

                expect(animation.loop).to.be.true;
                expect(animation.currentFrame).equals(0);
                expect(animation.autoUpdate).to.be.true;
                expect(animation.playing).to.be.true;
                expect(animation.totalFrames).greaterThan(0);
                expect(animation.progress).equals(0);
                expect(animation.width).greaterThan(0);
                expect(animation.height).greaterThan(0);
                expect(animation.onComplete).equals(null);
                expect(animation.onFrameChange).equals(null);
                expect(animation.onLoop).equals(null);
                loader.destroy();
                done();
            });
        });
    });
});
