import { Texture } from '../../../src/rendering/renderers/shared/texture/Texture';
import { AnimatedSprite } from '../../../src/scene/sprite-animated/AnimatedSprite';

import type { Ticker } from '../../../src/ticker/Ticker';

const ticker1 = { deltaTime: 1 } as Ticker;
const ticker3 = { deltaTime: 3 } as Ticker;
const ticker4 = { deltaTime: 4 } as Ticker;
const ticker5 = { deltaTime: 5 } as Ticker;

describe('AnimatedSprite', () =>
{
    describe('instance', () =>
    {
        let textures: Texture[];
        let sprite: AnimatedSprite | null;

        beforeEach(() =>
        {
            textures = [Texture.EMPTY];
        });

        afterEach(() =>
        {
            expect(sprite?.animationSpeed).toEqual(1);
            expect(sprite?.loop).toBe(true);
            expect(sprite?.onComplete).toBeNull();
            expect(sprite?.onFrameChange).toBeNull();
            expect(sprite?.onLoop).toBeNull();
            expect(sprite?.playing).toBe(false);

            sprite?.destroy();
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
        let sprite: AnimatedSprite | null;

        beforeAll(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY], false);
        });

        afterAll(() =>
        {
            sprite?.destroy();
            sprite = null;
        });

        afterEach(() =>
        {
            sprite?.stop();
            expect(sprite?.playing).toBe(false);
        });

        // eslint-disable-next-line jest/expect-expect
        it('should stop playing if it is playing', () =>
        {
            if (sprite !== null)
            {
                sprite['_playing'] = true;
            }
        });

        // eslint-disable-next-line jest/expect-expect
        it('should do nothing if it is not playing', () =>
        {
            if (sprite !== null)
            {
                sprite['_playing'] = false;
            }
        });
    });

    describe('.play()', () =>
    {
        let sprite: AnimatedSprite | null;

        beforeAll(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY], false);
        });

        afterAll(() =>
        {
            sprite?.destroy();
            sprite = null;
        });

        afterEach(() =>
        {
            sprite?.play();
            expect(sprite?.playing).toBe(true);
        });

        it('should start playing if it is not playing', () =>
        {
            expect(sprite).not.toBeNull();
            if (sprite !== null)
            {
                sprite['_playing'] = false;
            }
        });

        it('should do nothing if it is playing', () =>
        {
            expect(sprite).not.toBeNull();
            if (sprite !== null)
            {
                sprite['_playing'] = true;
            }
        });
    });

    describe('.onComplete()', () =>
    {
        let sprite: AnimatedSprite | null;

        beforeAll(() =>
        {
            sprite = new AnimatedSprite([new Texture(), new Texture(), Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = false;
        });

        afterAll(() =>
        {
            sprite?.destroy();
            sprite = null;
        });

        it('should fire onComplete', () =>
            new Promise<void>((done) =>
            {
                expect(sprite).not.toBeNull();
                if (sprite !== null)
                {
                    sprite.onComplete = () =>
                    {
                        if (sprite !== null)
                        {
                            sprite.onComplete = null;
                        }
                        done();
                    };
                }
                sprite?.play();
                expect(sprite?.playing).toBe(true);
            }));

        it('should play the expected sequence of textures, every time, given a set number of ticks at speed', async () =>
        {
            let frameChangeSequence: number[] = [];
            const expectedFrameChangeSequence: number[][] = [
                [1, 2],
                [1, 2]
            ];

            expect(sprite).not.toBeNull();

            // Test the first play-through, and ensure the sequence is correct
            if (sprite !== null)
            {
                // Ensure we start at 0
                sprite.gotoAndStop(0);
                // enable looping, so we can test two loops
                sprite.autoUpdate = false;
                sprite.play();
                sprite.onFrameChange = ((frame) =>
                {
                    if (sprite !== null)
                    {
                        frameChangeSequence.push(frame);
                    }
                });
                sprite.onComplete = () =>
                {
                    expect(frameChangeSequence).toEqual(expectedFrameChangeSequence[0]);
                    if (sprite !== null)
                    {
                        sprite.onComplete = null;
                    }
                };
            }

            sprite?.update(ticker1);
            sprite?.update(ticker1);
            expect(sprite?.playing).toBe(true);

            sprite?.update(ticker1);
            sprite?.update(ticker1);
            expect(sprite?.playing).toBe(true);

            sprite?.update(ticker1);
            sprite?.update(ticker1);
            expect(sprite?.playing).toBe(false);

            // Test the second play-through, and ensure the sequence is correct

            // Reset the sequence array
            frameChangeSequence = [];
            if (sprite !== null)
            {
                sprite.play();
                sprite.onFrameChange = ((frame) =>
                {
                    if (sprite !== null)
                    {
                        frameChangeSequence.push(frame);
                    }
                });
                sprite.onComplete = () =>
                {
                    expect(frameChangeSequence).toEqual(expectedFrameChangeSequence[1]);
                    if (sprite !== null)
                    {
                        sprite.onComplete = null;
                    }
                };
            }

            sprite?.update(ticker1);
            sprite?.update(ticker1);
            expect(sprite?.playing).toBe(true);

            sprite?.update(ticker1);
            sprite?.update(ticker1);
            expect(sprite?.playing).toBe(true);

            sprite?.update(ticker1);
            sprite?.update(ticker1);
            expect(sprite?.playing).toBe(false);
        });
    });

    describe('.gotoAndPlay()', () =>
    {
        let sprite: AnimatedSprite | null;

        beforeAll(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY, Texture.EMPTY, Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = false;
        });

        afterAll(() =>
        {
            sprite?.destroy();
            if (sprite !== null)
            {
                sprite = null;
            }
        });

        it('should fire frame after start frame during one play and fire onComplete', () =>
            new Promise<void>((done) =>
            {
                const frameIds = [] as number[];

                expect(sprite).not.toBeNull();
                if (sprite !== null)
                {
                    sprite.onComplete = () =>
                    {
                        expect(frameIds).toEqual(expect.arrayContaining([1, 2]));
                        expect(sprite?.playing).toBe(false);
                        if (sprite !== null)
                        {
                            sprite.onComplete = null;
                            sprite.onFrameChange = null;
                        }
                        done();
                    };
                    sprite.onFrameChange = (frame) =>
                    {
                        frameIds.push(frame);
                    };
                    sprite.gotoAndPlay(1);
                }
                expect(sprite?.playing).toBe(true);
            }));
    });

    describe('.gotoAndStop()', () =>
    {
        let sprite: AnimatedSprite | null;

        beforeAll(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY, Texture.EMPTY, Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = false;
        });

        afterAll(() =>
        {
            sprite?.destroy();
            if (sprite !== null)
            {
                sprite = null;
            }
        });

        beforeEach(() =>
        {
            if (sprite !== null)
            {
                sprite['_playing'] = false;
            }
        });

        it('should fire onFrameChange on target frame', () =>
            new Promise<void>((done) =>
            {
                const targetFrame = 1;

                expect(sprite).not.toBeNull();
                if (sprite !== null)
                {
                    sprite.onFrameChange = (frame) =>
                    {
                        expect(frame).toEqual(targetFrame);
                        expect(sprite?.playing).toBe(false);
                        if (sprite !== null)
                        {
                            sprite.onComplete = null;
                            sprite.onFrameChange = null;
                        }
                        done();
                    };
                    sprite.gotoAndStop(targetFrame);
                }
                expect(sprite?.playing).toBe(false);
            }));

        it('should not fire onFrameChange on target frame if current is already target', () =>
        {
            let fired = false;
            const targetFrame = 1;

            expect(sprite).not.toBeNull();
            if (sprite !== null)
            {
                sprite.gotoAndStop(targetFrame);

                sprite.onFrameChange = () =>
                {
                    fired = true;
                };
                sprite.gotoAndStop(targetFrame);
            }
            expect(sprite?.playing).toBe(false);
            expect(fired).toBe(false);
        });
    });

    describe('.onFrameChange()', () =>
    {
        let sprite: AnimatedSprite | null;

        beforeEach(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY, Texture.WHITE, Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = false;
        });

        afterEach(() =>
        {
            sprite?.destroy();
            if (sprite !== null)
            {
                sprite = null;
            }
        });

        it('should fire every frame(except current) during one play', () =>
            new Promise<void>((done) =>
            {
                jest.setTimeout(5000);
                const frameIds = [] as number[];

                expect(sprite).not.toBeNull();
                if (sprite !== null)
                {
                    sprite.gotoAndStop(0);
                    sprite.onComplete = () =>
                    {
                        // From 0 to 2, triggers onFrameChange at 1,2.
                        expect(frameIds).toEqual(expect.arrayContaining([1, 2]));
                        // As the animation has completed, the 'currentFrame' actually  should be 0!
                        // That the currentFrame (i.e. next frame to be rendered) was expected to be 2 was incorrect,
                        // given how it's calculated, and the fact that we should be teeing up the next frame for render.
                        expect(sprite?.currentFrame).toEqual(0);
                        if (sprite !== null)
                        {
                            sprite.onComplete = null;
                            sprite.onFrameChange = null;
                        }
                        done();
                    };
                    sprite.onFrameChange = (frame) =>
                    {
                        frameIds.push(frame);
                    };
                    sprite.autoUpdate = false;
                    sprite.play();
                }
                expect(sprite?.playing).toBe(true);
                sprite?.update(ticker1);
                sprite?.update(ticker1);
                sprite?.update(ticker1);
                sprite?.update(ticker1);
                sprite?.update(ticker1);
                sprite?.update(ticker1);
            }));

        it('should fire every frame(except current) during one play - reverse', () =>
            new Promise<void>((done) =>
            {
                jest.setTimeout(5000);
                const frameIds = [] as number[];

                expect(sprite).not.toBeNull();
                if (sprite !== null)
                {
                    sprite.gotoAndStop(0);
                    sprite.animationSpeed = -1;
                    sprite.onComplete = () =>
                    {
                        // from 0 to 0, but negative animationSpeed!
                        expect(frameIds).toEqual(expect.arrayContaining([2, 1]));
                        expect(sprite?.currentFrame).toEqual(0);
                        if (sprite !== null)
                        {
                            sprite.onComplete = null;
                            sprite.onFrameChange = null;
                        }
                        done();
                    };
                    sprite.onFrameChange = (frame) =>
                    {
                        frameIds.push(frame);
                    };
                    sprite.autoUpdate = false;
                    sprite.play();
                }
                expect(sprite?.playing).toBe(true);
                sprite?.update(ticker1);
                sprite?.update(ticker1);
                sprite?.update(ticker1);
            }));

        it('should fire every frame(except current) during one play - from not start/end', () =>
            new Promise<void>((done) =>
            {
                jest.setTimeout(1000);
                const frameIds = [] as number[];

                expect(sprite).not.toBeNull();
                if (sprite !== null)
                {
                    sprite.gotoAndStop(1);
                    sprite.animationSpeed = -1;
                    sprite.onComplete = () =>
                    {
                        expect(frameIds).toEqual(expect.arrayContaining([0])); // from 1 to 0, triggers onFrameChange at 0.
                        // Again, here we have looped fully, and so the 'currentFrame' should be the initial frame.
                        expect(sprite?.currentFrame).toEqual(1);
                        if (sprite !== null)
                        {
                            sprite.onComplete = null;
                            sprite.onFrameChange = null;
                        }
                        done();
                    };
                    sprite.onFrameChange = (frame) =>
                    {
                        frameIds.push(frame);
                    };
                    sprite.autoUpdate = false;
                    sprite.play();
                }
                expect(sprite?.playing).toBe(true);
                sprite?.update(ticker1);
                sprite?.update(ticker1);
                sprite?.update(ticker1);
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
        let sprite: AnimatedSprite | null;

        beforeAll(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY, Texture.EMPTY, Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = false;
        });

        afterAll(() =>
        {
            sprite?.destroy();
            if (sprite !== null)
            {
                sprite = null;
            }
        });

        it('should get the same value after setting the value', () =>
        {
            if (sprite !== null)
            {
                sprite.currentFrame = 1;
            }
            expect(sprite?.currentFrame).toBe(1);
        });

        it('should throw on out-of-bounds', () =>
            new Promise<void>((done) =>
            {
                jest.setTimeout(5000);
                const notExistIndexes = [-1, 3];

                notExistIndexes.forEach((i) =>
                {
                    expect(() =>
                    {
                        if (sprite !== null)
                        {
                            sprite.currentFrame = i;
                        }
                    }).toThrow();

                    expect(() =>
                    {
                        if (sprite !== null)
                        {
                            sprite.gotoAndPlay(i);
                        }
                    }).toThrow();

                    expect(() =>
                    {
                        if (sprite !== null)
                        {
                            sprite.gotoAndStop(i);
                        }
                    }).toThrow();
                });

                if (sprite !== null)
                {
                    sprite.onComplete = () =>
                    {
                        if (sprite !== null)
                        {
                            sprite.onComplete = null;
                        }
                        done();
                    };
                }
                sprite?.play();
            }));
    });

    describe('.onLoop()', () =>
    {
        let sprite: AnimatedSprite | null;

        beforeEach(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY, Texture.WHITE, Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = true;
        });

        afterEach(() =>
        {
            if (sprite !== null)
            {
                sprite.destroy();
                sprite = null;
            }
        });

        it('should not fire if loop is false', () =>
        {
            let called = false;

            expect(sprite).not.toBeNull();
            if (sprite !== null)
            {
                sprite.loop = false;
                sprite.gotoAndStop(0);
                sprite.onLoop = () =>
                {
                    called = true;
                };
                sprite.autoUpdate = false;
                sprite.play();
                sprite.update(ticker1);
                sprite.update(ticker1);
                sprite.update(ticker1);
                sprite.update(ticker1);
                sprite.update(ticker1);
                sprite.update(ticker1);
            }
            expect(called).toBe(false);
        });

        it('should fire onLoop', () =>
        {
            let count = 0;

            expect(sprite).not.toBeNull();
            if (sprite !== null)
            {
                sprite.gotoAndStop(0);
                sprite.onLoop = () =>
                {
                    ++count;
                };
                sprite.autoUpdate = false;
                sprite.play();
            }

            // transitTime update to 2
            sprite?.update(ticker4);
            expect(count).toBe(0);

            // transitTime update to 2.5
            sprite?.update(ticker1);
            expect(count).toBe(0);

            // transitTime update to 3 (loop complete)
            sprite?.update(ticker1);
            expect(count).toBe(1);

            // transitTime update to 5.5
            sprite?.update(ticker5);
            expect(count).toBe(1);

            // transitTime update to 6 (second loop complete)
            sprite?.update(ticker1);
            expect(count).toBe(2);
        });

        it('should fire onLoop - reverse', () =>
        {
            let count = 0;

            expect(sprite).not.toBeNull();
            if (sprite !== null)
            {
                sprite.gotoAndStop(2);
                sprite.animationSpeed = -0.5;
                sprite.onLoop = () =>
                {
                    ++count;
                };
                sprite.autoUpdate = false;
                sprite.play();
            }

            // currentTime increments from 2 (initial) to 4 (4 % 3 == frame 1)
            sprite?.update(ticker4);
            expect(count).toBe(0);

            // currentTime increments from 4 to 4.5 (4 % 3 == frame 1)
            sprite?.update(ticker1);
            expect(count).toBe(0);

            // currentTime increments from 4.5 to 5 (5 % 3 == frame 2)
            sprite?.update(ticker1);
            expect(count).toBe(1);

            // transitTime update to 5.5
            sprite?.update(ticker5);
            expect(count).toBe(1);

            // transitTime update to 6 (second loop complete)
            sprite?.update(ticker1);
            expect(count).toBe(2);
        });
    });

    describe('.update()', () =>
    {
        let sprite: AnimatedSprite | null;

        beforeEach(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY, Texture.WHITE, Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = true;
        });

        afterEach(() =>
        {
            if (sprite !== null)
            {
                sprite.destroy();
                sprite = null;
            }
        });

        it.each([
            0, 1, 2
        ])('should continue playing after the initial loop, with starting frame %i', (startFrame) =>
        {
            let count = 0;

            expect(sprite).not.toBeNull();
            if (sprite !== null)
            {
                sprite.gotoAndStop(startFrame);
                sprite.onLoop = () =>
                {
                    ++count;
                };
                sprite.autoUpdate = false;
                sprite.play();
            }

            // increment transitTime and currentTime to 2.5
            sprite?.update(ticker5);
            expect(count).toBe(0);

            // Add .5, which completes the loop (3 time % 3 frames === 0)
            sprite?.update(ticker1);
            expect(count).toBe(1);

            // So, we have looped, and continue to loop, when time is 3.5
            sprite?.update(ticker1);
            expect(count).toBe(1);

            expect(sprite?.playing).toBe(true);
            if (sprite !== null)
            {
                sprite.loop = false;
            }

            expect(sprite?.playing).toBe(true);
            sprite?.update(ticker1);
            expect(count).toBe(1);
            expect(sprite?.playing).toBe(true);
        }
        );

        it.each([
            0, 1, 2
        ])('should continue playing after the initial loop, with starting frame %i - reverse', (startFrame) =>
        {
            let count = 0;

            expect(sprite).not.toBeNull();
            if (sprite !== null)
            {
                sprite.animationSpeed = -0.5;

                sprite.gotoAndStop(startFrame);
                sprite.onLoop = () =>
                {
                    ++count;
                };
                sprite.autoUpdate = false;
                sprite.play();
            }
            // increment transitTime and currentTime to 2.5
            sprite?.update(ticker5);
            expect(count).toBe(0);

            // Add .5, which completes the loop (3 time % 3 frames === 0)
            sprite?.update(ticker1);
            expect(count).toBe(1);

            // So, we have looped, and continue to loop, when time is 3.5
            sprite?.update(ticker1);
            expect(count).toBe(1);

            expect(sprite?.playing).toBe(true);
            if (sprite !== null)
            {
                sprite.loop = false;
            }

            expect(sprite?.playing).toBe(true);
            sprite?.update(ticker1);
            expect(count).toBe(1);
            expect(sprite?.playing).toBe(true);
        });

        it.each([
            0, 1, 2
        ])('should complete the current loop before stopping, when loop is set to false mid-loop, with starting frame %i',
            (startFrame) =>
            {
                let count = 0;

                expect(sprite).not.toBeNull();
                if (sprite !== null)
                {
                    sprite.animationSpeed = 1;
                    sprite.gotoAndStop(startFrame);
                    sprite.onLoop = () =>
                    {
                        ++count;
                    };
                    sprite.autoUpdate = false;
                    sprite.play();
                }

                // Set time to 3, which should add a loop
                sprite?.update(ticker3);
                expect(count).toBe(1);

                // Add 1, which puts us in the middle of a loop
                sprite?.update(ticker1);
                expect(count).toBe(1);

                // Set loop to false, indicating that we no longer want to repeat after this loop.
                if (sprite !== null)
                {
                    sprite.loop = false;
                }
                expect(sprite?.playing).toBe(true);

                // Update transitTime % frames to 2
                sprite?.update(ticker1);
                expect(sprite?.playing).toBe(true);
                // Update transitTime % frames to 3, completing the loop, and stopping the animation
                sprite?.update(ticker1);
                expect(sprite?.playing).toBe(false);
            });

        it.each([
            0, 1, 2
        ])('should complete the current loop before stopping, when loop is set to false mid-loop, '
            + 'with starting frame %i - reverse',
        (startFrame) =>
        {
            let count = 0;

            expect(sprite).not.toBeNull();
            if (sprite !== null)
            {
                sprite.animationSpeed = -1;
                sprite.gotoAndStop(startFrame);
                sprite.onLoop = () =>
                {
                    ++count;
                };
                sprite.autoUpdate = false;
                sprite.play();
            }

            // Set time to 3, which should add a loop
            sprite?.update(ticker3);
            expect(count).toBe(1);

            // Add 1, which puts us in the middle of a loop
            sprite?.update(ticker1);
            expect(count).toBe(1);

            // Set loop to false, indicating that we no longer want to repeat after this loop.
            if (sprite !== null)
            {
                sprite.loop = false;
            }
            expect(sprite?.playing).toBe(true);

            // Update transitTime % frames to 2
            sprite?.update(ticker1);
            expect(sprite?.playing).toBe(true);
            // Update transitTime % frames to 3, completing the loop, and stopping the animation
            sprite?.update(ticker1);
            expect(count).toBe(1);
            expect(sprite?.playing).toBe(false);
        });
    });

    describe('.update() with durations', () =>
    {
        let sprite: AnimatedSprite | null;
        // default target deltaMS
        const ticker = { deltaMS: 16.66 } as Ticker;

        beforeEach(() =>
        {
            sprite = new AnimatedSprite([
                Texture.EMPTY,
                Texture.WHITE,
                Texture.EMPTY,
                Texture.EMPTY,
                Texture.WHITE,
                Texture.EMPTY,
            ]);
            sprite.animationSpeed = 0.5;
            sprite.loop = true;
        });

        afterEach(() =>
        {
            if (sprite !== null)
            {
                sprite.destroy();
                sprite = null;
            }
        });

        // Number of ticks expected per frame run (number of ticks played), and their durations
        // given the default _durationAnimationStealMaxRate (.1)
        it.each([
            // This demonstrates the time steal across durations!
            [[7, 18, 6, 6, 18, 6], [100, 300, 100, 100, 300, 100]],
            // This one demonstrates the time-steal allowance granted by a large duration (the last frame)
            [[30, 6, 6, 6, 6, 7], [500, 100, 100, 100, 100, 100]]
        ])('should correctly handle durations', (expectedUpdates, durations) =>
        {
            let count = 0;

            expect(sprite).not.toBeNull();
            if (sprite !== null)
            {
                sprite.durationAnimationStealMaxRate = 0.1;
                sprite.durations = durations;
                sprite.gotoAndStop(0);
                sprite.onFrameChange = () =>
                {
                    ++count;
                };
                sprite.autoUpdate = false;
                sprite.play();
            }

            for (let i = 0; i < durations.length; i++)
            {
                for (let j = 0; j < expectedUpdates[i]; j++)
                {
                    expect(count).toBe(i);
                    sprite?.update(ticker);
                }

                // On the final update, we should have triggered a loop
                expect(count).toBe(1 + i);
            }
        });
    });
});
