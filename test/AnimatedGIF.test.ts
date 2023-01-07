import { AnimatedGIF } from '../src';
import fs from 'fs';
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

describe('AnimatedGIF', () =>
{
    const arrayBuffer = toArrayBuffer(
        fs.readFileSync(path.join(__dirname, './resources/example.gif'))
    );

    describe('fromBuffer()', () =>
    {
        it('should return an instance of AnimatedGIF', () =>
        {
            const animation = AnimatedGIF.fromBuffer(arrayBuffer);

            expect(animation).toBeInstanceOf(AnimatedGIF);
            animation.destroy();
        });

        it('should throw an error if missing', () =>
        {
            expect(() => (AnimatedGIF as any).fromBuffer()).toThrow();
            expect(() => (AnimatedGIF as any).fromBuffer(new ArrayBuffer(0))).toThrow();
        });

        it('should handle options', () =>
        {
            const animation = AnimatedGIF.fromBuffer(arrayBuffer, {
                autoPlay: false,
                loop: false,
                autoUpdate: false,
            });

            expect(animation.loop).toBe(false);
            expect(animation.autoPlay).toBe(false);
            expect(animation.autoUpdate).toBe(false);
            animation.destroy();
        });
    });

    describe('currentFrame', () =>
    {
        it('should throw frames out-of-bounds', () =>
        {
            const animation = AnimatedGIF.fromBuffer(arrayBuffer);

            expect(() => animation.currentFrame = -1).toThrow();
            expect(() => animation.currentFrame = animation.totalFrames).toThrow();
            animation.destroy();
        });

        it('should change dirty current frame', () =>
        {
            const animation = AnimatedGIF.fromBuffer(arrayBuffer, { autoPlay: false });

            animation.dirty = false;
            animation.currentFrame = 0;
            expect(animation.dirty).toBe(false);
            animation.currentFrame = 1;
            expect(animation.dirty).toBe(true);
            animation.destroy();
        });
    });

    describe('play()', () =>
    {
        it('should do nothing when playing twice', () =>
        {
            const animation = AnimatedGIF.fromBuffer(arrayBuffer);

            expect(animation.playing).toBe(true);
            animation.play();
            animation.play();
            expect(animation.playing).toBe(true);
            animation.destroy();
        });

        it('should change play state', () =>
        {
            const animation = AnimatedGIF.fromBuffer(arrayBuffer, { autoPlay: false });

            expect(animation.playing).toBe(false);
            animation.play();
            expect(animation.playing).toBe(true);
            animation.destroy();
        });
    });

    describe('stop()', () =>
    {
        it('should stop playing', () =>
        {
            const animation = AnimatedGIF.fromBuffer(arrayBuffer);

            expect(animation.playing).toBe(true);
            animation.stop();
            expect(animation.playing).toBe(false);
            animation.destroy();
        });

        it('should stop playing on destroy', () =>
        {
            const animation = AnimatedGIF.fromBuffer(arrayBuffer);

            expect(animation.playing).toBe(true);
            animation.destroy();
            expect(animation.playing).toBe(false);
        });
    });

    describe('clone()', () =>
    {
        it('should clone the original', () =>
        {
            const animation = AnimatedGIF.fromBuffer(arrayBuffer);
            const clone = animation.clone();

            expect(clone).toBeInstanceOf(AnimatedGIF);
            expect(clone.totalFrames).toBe(animation.totalFrames);
            expect(clone.duration).toBe(animation.duration);
            animation.destroy();
            clone.destroy();
        });

        it('should clone the original preserving options', () =>
        {
            const options = {
                autoPlay: false,
                loop: false,
                autoUpdate: false,
                animationSpeed: 0.5,
                onComplete: () => {},
                onLoop: () => {},
                onFrameChange: () => {},
            };
            const animation = AnimatedGIF.fromBuffer(arrayBuffer, options);
            const clone = animation.clone();

            expect(clone).toBeInstanceOf(AnimatedGIF);
            expect(clone.playing).toBe(false);
            expect(clone.loop).toBe(animation.loop);
            expect(clone.autoPlay).toBe(animation.autoPlay);
            expect(clone.autoUpdate).toBe(animation.autoUpdate);
            expect(clone.onComplete).toBe(animation.onComplete);
            expect(clone.animationSpeed).toBe(animation.animationSpeed);
            expect(clone.onLoop).toBe(animation.onLoop);
            expect(clone.onFrameChange).toBe(animation.onFrameChange);
            animation.destroy();
            clone.destroy();
        });

        it('should not preserve play status', () =>
        {
            const animation = AnimatedGIF.fromBuffer(arrayBuffer);

            animation.stop();
            expect(animation.playing).toBe(false);
            const clone = animation.clone();

            expect(clone.playing).toBe(true);
            animation.destroy();
            clone.destroy();
        });
    });
});
