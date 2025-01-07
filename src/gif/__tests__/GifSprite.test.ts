import { GifSource } from '../GifSource';
import { GifSprite, type GifSpriteOptions } from '../GifSprite';
import { toArrayBuffer } from '@test-utils';

describe('GifSprite', () =>
{
    const arrayBuffer = toArrayBuffer('gif/example.gif');
    const createAnimation = (options?: Partial<GifSpriteOptions>) =>
        new GifSprite({
            source: GifSource.from(arrayBuffer),
            ...options,
        });

    describe('constructor', () =>
    {
        it('should create an instance from only source', () =>
        {
            const source = GifSource.from(arrayBuffer);
            const animation = new GifSprite(source);

            expect(animation.duration).toBeGreaterThan(0);
            animation.destroy(true);
        });

        it('should create an instance from options source', () =>
        {
            const source = GifSource.from(arrayBuffer);
            const animation = new GifSprite({ source });

            expect(animation.duration).toBeGreaterThan(0);
            animation.destroy(true);
        });

        it('should support Sprite options', () =>
        {
            const source = GifSource.from(arrayBuffer);
            const animation = new GifSprite({ source, x: 100, y: 200 });

            expect(animation.x).toBe(100);
            expect(animation.y).toBe(200);
            animation.destroy(true);
        });
    });

    describe('currentFrame', () =>
    {
        it('should throw frames out-of-bounds', () =>
        {
            const animation = createAnimation();

            expect(() =>
            {
                animation.currentFrame = -1;
            }).toThrow();
            expect(() =>
            {
                animation.currentFrame = animation.totalFrames;
            }).toThrow();
            animation.destroy(true);
        });

        it('should change dirty current frame', () =>
        {
            const animation = createAnimation({ autoPlay: false });

            animation.dirty = false;
            animation.currentFrame = 0;
            expect(animation.dirty).toBe(false);
            animation.currentFrame = 1;
            expect(animation.dirty).toBe(true);
            animation.destroy(true);
        });
    });

    describe('destroy()', () =>
    {
        it('should not destroy the animation source', () =>
        {
            const animation = createAnimation();
            const source = animation.source;

            animation.destroy();
            expect(source.duration).toBeGreaterThan(0);
            expect(source.totalFrames).toBeGreaterThan(0);
            source.destroy();
            expect(source.duration).toBe(0);
            expect(source.totalFrames).toBe(0);
        });

        it('should destroy the animation source with parameter', () =>
        {
            const animation = createAnimation();
            const source = animation.source;

            animation.destroy(true);
            expect(source.duration).toBe(0);
            expect(source.totalFrames).toBe(0);
        });
    });

    describe('play()', () =>
    {
        it('should do nothing when playing twice', () =>
        {
            const animation = createAnimation();

            expect(animation.playing).toBe(true);
            animation.play();
            animation.play();
            expect(animation.playing).toBe(true);
            animation.destroy(true);
        });

        it('should change play state', () =>
        {
            const animation = createAnimation({ autoPlay: false });

            expect(animation.playing).toBe(false);
            animation.play();
            expect(animation.playing).toBe(true);
            animation.destroy(true);
        });
    });

    describe('stop()', () =>
    {
        it('should stop playing', () =>
        {
            const animation = createAnimation();

            expect(animation.playing).toBe(true);
            animation.stop();
            expect(animation.playing).toBe(false);
            animation.destroy(true);
        });

        it('should stop playing on destroy', () =>
        {
            const animation = createAnimation();

            expect(animation.playing).toBe(true);
            animation.destroy(true);
            expect(animation.playing).toBe(false);
        });
    });

    describe('clone()', () =>
    {
        it('should clone the original', () =>
        {
            const animation = createAnimation();
            const clone = animation.clone();

            expect(clone).toBeInstanceOf(GifSprite);
            expect(clone.totalFrames).toBe(animation.totalFrames);
            expect(clone.duration).toBe(animation.duration);
            animation.destroy();
            clone.destroy(true);
        });

        it('should clone the original preserving options', () =>
        {
            const options = {
                autoPlay: false,
                loop: false,
                autoUpdate: false,
                animationSpeed: 0.5,
                /* eslint-disable @typescript-eslint/no-empty-function */
                onComplete: () => {},
                onLoop: () => {},
                onFrameChange: () => {},
                /* eslint-enable @typescript-eslint/no-empty-function */
            };
            const animation = createAnimation(options);
            const clone = animation.clone();

            expect(clone).toBeInstanceOf(GifSprite);
            expect(clone.playing).toBe(false);
            expect(clone.loop).toBe(animation.loop);
            expect(clone.autoPlay).toBe(animation.autoPlay);
            expect(clone.autoUpdate).toBe(animation.autoUpdate);
            expect(clone.onComplete).toBe(animation.onComplete);
            expect(clone.animationSpeed).toBe(animation.animationSpeed);
            expect(clone.onLoop).toBe(animation.onLoop);
            expect(clone.onFrameChange).toBe(animation.onFrameChange);
            animation.destroy();
            clone.destroy(true);
        });

        it('should not preserve play status', () =>
        {
            const animation = createAnimation();

            animation.stop();
            expect(animation.playing).toBe(false);
            const clone = animation.clone();

            expect(clone.playing).toBe(true);
            animation.destroy();
            clone.destroy(true);
        });
    });
});
