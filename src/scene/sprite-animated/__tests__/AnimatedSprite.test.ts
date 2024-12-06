import { AnimatedSprite } from '../AnimatedSprite';
import { Texture } from '~/rendering';

import type { Ticker } from '~/ticker';

const ticker1 = { deltaTime: 1 } as Ticker;
const ticker4 = { deltaTime: 4 } as Ticker;
const ticker5 = { deltaTime: 5 } as Ticker;

describe('AnimatedSprite', () =>
{
    describe('instance', () =>
    {
        let textures: Texture[];
        let sprite: AnimatedSprite;

        beforeEach(() =>
        {
            textures = [Texture.EMPTY];
        });

        afterEach(() =>
        {
            expect(sprite.animationSpeed).toEqual(1);
            expect(sprite.loop).toBe(true);
            expect(sprite.onComplete).toBeNull();
            expect(sprite.onFrameChange).toBeNull();
            expect(sprite.onLoop).toBeNull();
            expect(sprite.playing).toBe(false);

            sprite.destroy();
            sprite = null;
        });

        it('should be correct with default options', () =>
        {
            sprite = new AnimatedSprite(textures);
            expect(sprite['_autoUpdate']).toBe(true);
        });

        it('should support other sprite options', () =>
        {
            sprite = new AnimatedSprite({ textures, x: 10, y: 20, alpha: 0.5 });
            expect(sprite.x).toBe(10);
            expect(sprite.y).toBe(20);
            expect(sprite.alpha).toBe(0.5);
        });

        it('should be correct with autoUpdate=false', () =>
        {
            sprite = new AnimatedSprite(textures, false);
            expect(sprite['_autoUpdate']).toBe(false);
        });

        it('should be correct with autoUpdate=true but then turned off via setter', () =>
        {
            sprite = new AnimatedSprite(textures, true);
            expect(sprite['_autoUpdate']).toBe(true);
            sprite.autoUpdate = false;
            expect(sprite['_autoUpdate']).toBe(false);
        });
    });

    describe('.stop()', () =>
    {
        let sprite: AnimatedSprite;

        beforeAll(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY], false);
        });

        afterAll(() =>
        {
            sprite.destroy();
            sprite = null;
        });

        afterEach(() =>
        {
            sprite.stop();
            expect(sprite.playing).toBe(false);
        });

        // eslint-disable-next-line jest/expect-expect
        it('should stop playing if it is playing', () =>
        {
            sprite['_playing'] = true;
        });

        // eslint-disable-next-line jest/expect-expect
        it('should do nothing if it is not playing', () =>
        {
            sprite['_playing'] = false;
        });
    });

    describe('.play()', () =>
    {
        let sprite: AnimatedSprite;

        beforeAll(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY], false);
        });

        afterAll(() =>
        {
            sprite.destroy();
            sprite = null;
        });

        afterEach(() =>
        {
            sprite.play();
            expect(sprite.playing).toBe(true);
        });

        // eslint-disable-next-line jest/expect-expect
        it('should start playing if it is not playing', () =>
        {
            sprite['_playing'] = false;
        });

        // eslint-disable-next-line jest/expect-expect
        it('should do nothing if it is playing', () =>
        {
            sprite['_playing'] = true;
        });
    });

    describe('.onComplete()', () =>
    {
        let sprite: AnimatedSprite;

        beforeAll(() =>
        {
            sprite = new AnimatedSprite([new Texture(), new Texture(), Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = false;
        });

        afterAll(() =>
        {
            sprite.destroy();
            sprite = null;
        });

        it('should fire onComplete', () =>
            new Promise<void>((done) =>
            {
                jest.setTimeout(5000);
                sprite.onComplete = () =>
                {
                    sprite.onComplete = null;
                    done();
                };
                sprite.play();
                expect(sprite.playing).toBe(true);
            }));

        it('should the current texture be the last item in textures', () =>
            new Promise<void>((done) =>
            {
                jest.setTimeout(5000);
                sprite.play();
                sprite.onComplete = () =>
                {
                    expect(sprite.texture === sprite.textures[sprite.currentFrame]).toBe(true);
                    sprite.onComplete = null;
                    done();
                };
            }));
    });

    describe('.gotoAndPlay()', () =>
    {
        let sprite: AnimatedSprite;

        beforeAll(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY, Texture.EMPTY, Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = false;
        });

        afterAll(() =>
        {
            sprite.destroy();
            sprite = null;
        });

        it('should fire frame after start frame during one play and fire onComplete', () =>
            new Promise<void>((done) =>
            {
                jest.setTimeout(5000);
                const frameIds = [] as number[];

                sprite.onComplete = () =>
                {
                    expect(frameIds).toEqual(expect.arrayContaining([1, 2]));
                    expect(sprite.playing).toBe(false);
                    sprite.onComplete = null;
                    sprite.onFrameChange = null;
                    done();
                };
                sprite.onFrameChange = (frame) =>
                {
                    frameIds.push(frame);
                };
                sprite.gotoAndPlay(1);
                expect(sprite.playing).toBe(true);
            }));
    });

    describe('.gotoAndStop()', () =>
    {
        let sprite: AnimatedSprite;

        beforeAll(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY, Texture.EMPTY, Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = false;
        });

        afterAll(() =>
        {
            sprite.destroy();
            sprite = null;
        });

        beforeEach(() =>
        {
            sprite['_playing'] = false;
        });

        it('should fire onFrameChange on target frame', () =>
            new Promise<void>((done) =>
            {
                const targetFrame = 1;

                sprite.onFrameChange = (frame) =>
                {
                    expect(frame).toEqual(targetFrame);
                    expect(sprite.playing).toBe(false);
                    sprite.onComplete = null;
                    sprite.onFrameChange = null;
                    done();
                };
                sprite.gotoAndStop(targetFrame);
                expect(sprite.playing).toBe(false);
            }));

        it('should not fire onFrameChange on target frame if current is already target', () =>
        {
            let fired = false;
            const targetFrame = 1;

            sprite.gotoAndStop(targetFrame);

            sprite.onFrameChange = () =>
            {
                fired = true;
            };
            sprite.gotoAndStop(targetFrame);
            expect(sprite.playing).toBe(false);
            expect(fired).toBe(false);
        });
    });

    describe('.onFrameChange()', () =>
    {
        let sprite: AnimatedSprite;

        beforeEach(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY, Texture.WHITE, Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = false;
        });

        afterEach(() =>
        {
            sprite.destroy();
            sprite = null;
        });

        it('should fire every frame(except current) during one play', () =>
            new Promise<void>((done) =>
            {
                jest.setTimeout(10000);
                const frameIds = [] as number[];

                sprite.gotoAndStop(0);
                sprite.onComplete = () =>
                {
                    expect(frameIds).toEqual(expect.arrayContaining([1, 2])); // from 0 to 2, triggers onFrameChange at 1,2.
                    expect(sprite.currentFrame).toEqual(2);
                    sprite.onComplete = null;
                    sprite.onFrameChange = null;
                    done();
                };
                sprite.onFrameChange = (frame) =>
                {
                    frameIds.push(frame);
                };
                sprite.autoUpdate = false;
                sprite.play();
                expect(sprite.playing).toBe(true);
                sprite.update(ticker1);
                sprite.update(ticker1);
                sprite.update(ticker1);
                sprite.update(ticker1);
                sprite.update(ticker1);
                sprite.update(ticker1);
            }));

        it('should fire every frame(except current) during one play - reverse', () =>
            new Promise<void>((done) =>
            {
                jest.setTimeout(10000);
                const frameIds = [] as number[];

                sprite.gotoAndStop(2);
                sprite.animationSpeed = -1;
                sprite.onComplete = () =>
                {
                    expect(frameIds).toEqual(expect.arrayContaining([1, 0])); // from 2 to 0, triggers onFrameChange at 1,0.
                    expect(sprite.currentFrame).toEqual(0);
                    sprite.onComplete = null;
                    sprite.onFrameChange = null;
                    done();
                };
                sprite.onFrameChange = (frame) =>
                {
                    frameIds.push(frame);
                };
                sprite.autoUpdate = false;
                sprite.play();
                expect(sprite.playing).toBe(true);
                sprite.update(ticker1);
                sprite.update(ticker1);
                sprite.update(ticker1);
            }));

        it('should fire every frame(except current) during one play - from not start/end', () =>
            new Promise<void>((done) =>
            {
                jest.setTimeout(10000);
                const frameIds = [] as number[];

                sprite.gotoAndStop(1);
                sprite.animationSpeed = -1;
                sprite.onComplete = () =>
                {
                    expect(frameIds).toEqual(expect.arrayContaining([0])); // from 1 to 0, triggers onFrameChange at 0.
                    expect(sprite.currentFrame).toEqual(0);
                    sprite.onComplete = null;
                    sprite.onFrameChange = null;
                    done();
                };
                sprite.onFrameChange = (frame) =>
                {
                    frameIds.push(frame);
                };
                sprite.autoUpdate = false;
                sprite.play();
                expect(sprite.playing).toBe(true);
                sprite.update(ticker1);
                sprite.update(ticker1);
                sprite.update(ticker1);
            }));
    });

    describe('.textures', () =>
    {
        it('should set the first frame when setting new textures', () =>
            new Promise<void>((done) =>
            {
                const orig1 = new Texture();
                const orig2 = new Texture();
                const orig3 = new Texture();
                const sprite = new AnimatedSprite([orig1, orig2, orig3]);

                sprite.gotoAndPlay(0);
                sprite.loop = false;

                sprite.onComplete = () =>
                {
                    sprite.gotoAndStop(0);

                    const frame1 = new Texture();
                    const frame2 = new Texture();
                    const frame3 = new Texture();

                    sprite.textures = [frame1, frame2, frame3];

                    expect(sprite.currentFrame).toEqual(0);
                    expect(sprite.texture).toEqual(frame1);

                    done();
                };
            }));
    });

    describe('.currentFrame', () =>
    {
        let sprite: AnimatedSprite;

        beforeAll(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY, Texture.EMPTY, Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = false;
        });

        afterAll(() =>
        {
            sprite.destroy();
            sprite = null;
        });

        it('should get the same value after setting the value', () =>
        {
            sprite.currentFrame = 1;
            expect(sprite.currentFrame).toBe(1);
        });

        it('should throw on out-of-bounds', () =>
            new Promise<void>((done) =>
            {
                jest.setTimeout(10000);

                const notExistIndexes = [-1, 3];

                notExistIndexes.forEach((i) =>
                {
                    expect(() =>
                    {
                        sprite.currentFrame = i;
                    }).toThrow();

                    expect(() =>
                    {
                        sprite.gotoAndPlay(i);
                    }).toThrow();

                    expect(() =>
                    {
                        sprite.gotoAndStop(i);
                    }).toThrow();
                });

                sprite.onComplete = () =>
                {
                    sprite.onComplete = null;
                    done();
                };
                sprite.play();
            }));
    });

    describe('.onLoop()', () =>
    {
        let sprite: AnimatedSprite;

        beforeEach(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY, Texture.WHITE, Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = true;
        });

        afterEach(() =>
        {
            sprite.destroy();
            sprite = null;
        });

        it('should not fire if loop is false', () =>
        {
            let called = false;

            sprite.loop = false;
            sprite.gotoAndStop(0);
            sprite.onLoop = () => { called = true; };
            sprite.autoUpdate = false;
            sprite.play();
            sprite.update(ticker1);
            sprite.update(ticker1);
            sprite.update(ticker1);
            sprite.update(ticker1);
            sprite.update(ticker1);
            sprite.update(ticker1);
            expect(called).toBe(false);
        });

        it('should fire onLoop', () =>
        {
            let count = 0;

            sprite.gotoAndStop(0);
            sprite.onLoop = () => { ++count; };
            sprite.autoUpdate = false;
            sprite.play();
            sprite.update(ticker5);
            expect(count).toBe(0);
            sprite.update(ticker1);
            expect(count).toBe(1);
            sprite.update(ticker5);
            expect(count).toBe(1);
            sprite.update(ticker1);
            expect(count).toBe(2);
        });

        it('should fire onLoop - reverse', () =>
        {
            let count = 0;

            sprite.gotoAndStop(2);
            sprite.animationSpeed = -0.5;
            sprite.onLoop = () => { ++count; };
            sprite.autoUpdate = false;
            sprite.play();
            sprite.update(ticker4);
            expect(count).toBe(0);
            sprite.update(ticker1);
            expect(count).toBe(1);
            sprite.update(ticker5);
            expect(count).toBe(1);
            sprite.update(ticker1);
            expect(count).toBe(2);
        });
    });
});
