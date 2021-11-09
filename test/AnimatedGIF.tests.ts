import { AnimatedGIF } from '../src';
import fs from 'fs';
import { expect } from 'chai';
import path from 'path';

function toArrayBuffer(buffer: Buffer): ArrayBuffer
{
    const ab = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(ab);

    for (let i = 0; i < buffer.length; ++i)
    {
        view[i] = buffer[i];
    }

    return ab;
}

describe('AnimatedGIF', function ()
{
    before(async function ()
    {
        this.arrayBuffer = toArrayBuffer(
            await fs.promises.readFile(path.join(__dirname, './resources/example.gif'))
        );
    });

    after(function ()
    {
        this.arrayBuffer = null;
    });

    describe('fromBuffer()', function ()
    {
        it('should return an instance of AnimatedGIF', function ()
        {
            this.slow(500);
            const animation = AnimatedGIF.fromBuffer(this.arrayBuffer);

            expect(animation).to.be.an.instanceof(AnimatedGIF);
            animation.destroy();
        });

        it('should throw an error if missing', function ()
        {
            expect(() => (AnimatedGIF as any).fromBuffer()).to.throw();
            expect(() => (AnimatedGIF as any).fromBuffer(new ArrayBuffer(0))).to.throw();
        });

        it('should handle options', function ()
        {
            this.slow(500);
            const animation = AnimatedGIF.fromBuffer(this.arrayBuffer, {
                autoPlay: false,
                loop: false,
                autoUpdate: false,
            });

            expect(animation.loop).equals(false);
            expect(animation.autoPlay).equals(false);
            expect(animation.autoUpdate).equals(false);
            animation.destroy();
        });
    });

    describe('currentFrame', function ()
    {
        it('should throw frames out-of-bounds', function ()
        {
            this.slow(500);
            const animation = AnimatedGIF.fromBuffer(this.arrayBuffer);

            expect(() => animation.currentFrame = -1).to.throw();
            expect(() => animation.currentFrame = animation.totalFrames).to.throw();
            animation.destroy();
        });

        it('should change dirty current frame', function ()
        {
            this.slow(500);
            const animation = AnimatedGIF.fromBuffer(this.arrayBuffer, { autoPlay: false });

            animation.dirty = false;
            animation.currentFrame = 0;
            expect(animation.dirty).equals(false);
            animation.currentFrame = 1;
            expect(animation.dirty).equals(true);
            animation.destroy();
        });
    });

    describe('play()', function ()
    {
        it('should do nothing when playing twice', function ()
        {
            this.slow(500);
            const animation = AnimatedGIF.fromBuffer(this.arrayBuffer);

            expect(animation.playing).equals(true);
            animation.play();
            animation.play();
            expect(animation.playing).equals(true);
            animation.destroy();
        });

        it('should change play state', function ()
        {
            this.slow(500);
            const animation = AnimatedGIF.fromBuffer(this.arrayBuffer, { autoPlay: false });

            expect(animation.playing).equals(false);
            animation.play();
            expect(animation.playing).equals(true);
            animation.destroy();
        });
    });

    describe('stop()', function ()
    {
        it('should stop playing', function ()
        {
            this.slow(500);
            const animation = AnimatedGIF.fromBuffer(this.arrayBuffer);

            expect(animation.playing).equals(true);
            animation.stop();
            expect(animation.playing).equals(false);
            animation.destroy();
        });

        it('should stop playing on destroy', function ()
        {
            this.slow(500);
            const animation = AnimatedGIF.fromBuffer(this.arrayBuffer);

            expect(animation.playing).equals(true);
            animation.destroy();
            expect(animation.playing).equals(false);
        });
    });

    describe('clone()', function ()
    {
        it('should clone the original', function ()
        {
            this.slow(500);
            const animation = AnimatedGIF.fromBuffer(this.arrayBuffer);
            const clone = animation.clone();

            expect(clone).to.be.an.instanceof(AnimatedGIF);
            expect(clone.totalFrames).equals(animation.totalFrames);
            expect(clone.duration).equals(animation.duration);
            animation.destroy();
            clone.destroy();
        });

        it('should clone the original preserving options', function ()
        {
            this.slow(500);
            const options = {
                autoPlay: false,
                loop: false,
                autoUpdate: false,
                animationSpeed: 0.5,
                onComplete: () => {},
                onLoop: () => {},
                onFrameChange: () => {},
            };
            const animation = AnimatedGIF.fromBuffer(this.arrayBuffer, options);
            const clone = animation.clone();

            expect(clone).to.be.an.instanceof(AnimatedGIF);
            expect(clone.playing).equals(false);
            expect(clone.loop).equals(animation.loop);
            expect(clone.autoPlay).equals(animation.autoPlay);
            expect(clone.autoUpdate).equals(animation.autoUpdate);
            expect(clone.onComplete).equals(animation.onComplete);
            expect(clone.animationSpeed).equals(animation.animationSpeed);
            expect(clone.onLoop).equals(animation.onLoop);
            expect(clone.onFrameChange).equals(animation.onFrameChange);
            animation.destroy();
            clone.destroy();
        });

        it('should not preserve play status', function ()
        {
            this.slow(500);
            const animation = AnimatedGIF.fromBuffer(this.arrayBuffer);

            animation.stop();
            expect(animation.playing).equals(false);
            const clone = animation.clone();

            expect(clone.playing).equals(true);
            animation.destroy();
            clone.destroy();
        });
    });
});
