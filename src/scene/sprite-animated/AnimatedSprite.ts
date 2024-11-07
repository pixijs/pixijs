import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { UPDATE_PRIORITY } from '../../ticker/const';
import { Ticker } from '../../ticker/Ticker';
import { warn } from '../../utils/logging/warn';
import { quickRound } from '../../utils/math/floats';
import { Sprite } from '../sprite/Sprite';

import type { SpriteOptions } from '../sprite/Sprite';

export type AnimatedSpriteFrames = Texture[] | FrameObject[];

/**
 * Constructor options used for `AnimatedSprite` instances.
 * @see {@link scene.AnimatedSprite}
 * @memberof scene
 */
export interface AnimatedSpriteOptions extends SpriteOptions
{
    /** An array of {@link Texture} or frame objects that make up the animation. */
    textures: AnimatedSpriteFrames | null;
    /** Whether to use Ticker.shared to auto update animation time. */
    autoUpdate?: boolean;
}

/**
 * An AnimatedSprite is a simple way to display an animation depicted by a list of textures.
 *
 * ```js
 * import { AnimatedSprite, Texture } from 'pixi.js';
 *
 * const alienImages = [
 *     'image_sequence_01.png',
 *     'image_sequence_02.png',
 *     'image_sequence_03.png',
 *     'image_sequence_04.png',
 * ];
 * const textureArray = [];
 *
 * for (let i = 0; i < 4; i++)
 * {
 *     const texture = Texture.from(alienImages[i]);
 *     textureArray.push(texture);
 * }
 *
 * const animatedSprite = new AnimatedSprite(textureArray);
 * ```
 *
 * The more efficient and simpler way to create an animated sprite is using a {@link Spritesheet}
 * containing the animation definitions:
 * @example
 * import { AnimatedSprite, Assets } from 'pixi.js';
 *
 * const sheet = await Assets.load('assets/spritesheet.json');
 * animatedSprite = new AnimatedSprite(sheet.animations['image_sequence']);
 * @memberof scene
 */
export class AnimatedSprite extends Sprite
{
    /**
     * The speed that the AnimatedSprite will play at. Higher is faster, lower is slower.
     * @default 1
     */
    public animationSpeed: number;

    /**
     * Whether or not the animate sprite repeats after playing.
     * @default true
     */
    public loop: boolean;

    /**
     * Update anchor to [Texture's defaultAnchor]{@link Texture#defaultAnchor} when frame changes.
     *
     * Useful with [sprite sheet animations]{@link Spritesheet#animations} created with tools.
     * Changing anchor for each frame allows to pin sprite origin to certain moving feature
     * of the frame (e.g. left foot).
     *
     * Note: Enabling this will override any previously set `anchor` on each frame change.
     * @default false
     */
    public updateAnchor: boolean;

    /**
     * User-assigned function to call when an AnimatedSprite finishes playing.
     * @example
     * animation.onComplete = () => {
     *     // Finished!
     * };
     */
    public onComplete?: (() => void) | null | undefined;

    /**
     * User-assigned function to call when an AnimatedSprite changes which texture is being rendered.
     * @example
     * animation.onFrameChange = () => {
     *     // Updated!
     * };
     */
    public onFrameChange?: ((currentFrame: number) => void) | null | undefined;

    /**
     * User-assigned function to call when `loop` is true, and an AnimatedSprite is played and
     * loops around to start again.
     * @example
     * animation.onLoop = () => {
     *     // Looped!
     * };
     */
    public onLoop?: (() => void) | null | undefined;

    /**
     * User-assigned function to call at the beginning of each tick update, after calculating
     * updates to time and frame tracking variables. Primarily for debugging purposes.
     * @example
     * animation.onTickUpdate = (transitTime, currentTime, previousTime, currentFrame, previousFrame, ticker) => {
     *     // Ticked!
     * };
     */
    public onTickUpdate?: ((
        transitTime: number,
        currentTime: number,
        previousTime: number,
        currentFrame: number,
        previousFrame: number,
        ticker: Ticker) => void) | null | undefined;

    private _playing: boolean;
    private _textures: Texture[] | null;
    /** An array of durations (in milliseconds), which map to sprite frames at the same index. */
    private _durations: number[] | null;

    /**
     * The default allowable rate of steal from one animation frame into
     * another, which can occur when the deltaMS between ticks is larger
     * than the remaining animation duration of the frame.
     *
     * This variable is a range from 0-1, with respect to the frame
     * experiencing stolen duration.
     * @private
     */
    private _durationAnimationStealMaxRate = 0.1;

    /**
     * A carry-forward adjustment into the next frame, which indicates
     * how much time (in MS) was taken from the previous frame, due to
     * capping its maximum next-frame steal, and thus its own run-time,
     * at _durationAnimationStealMaxRate.
     * @private
     */
    private _durationPreviousFrameDonationMS = 0;

    /**
     * `true` uses Ticker.shared to auto update animation time.
     * @default true
     */
    private _autoUpdate: boolean;

    /**
     * `true` if the instance is currently connected to Ticker.shared to auto update animation time.
     * @default false
     */
    private _isConnectedToTicker: boolean;

    /**
     * Elapsed time since animation has been started, used internally to display current texture.
     * Note that this doesn't actually track time, but rather time-offsets against the beginning
     * of the spritesheet (relative currentTime to 0 index). For actual, transited time, reference
     * _transitTime.
     */
    private _currentTime: number;

    /**
     * transitTime tracks the total, actual animation play time since _playing was last
     * toggled from false to true.
     *
     * Note: If the Sprite is already playing, calling play() again will not
     * cause this to reset.
     */
    private _transitTime: number;

    /**
     * The elapsed time logged at the previous update, is critical for temporally tracking frames
     * and loops accurately, as animation speed can change, which makes previousFrame not ideal
     * in some scenarios.
     */
    private _previousTime: number;

    /**
     * initialFrame tracks the frame at which animation began, and is set in play().
     *
     * This allows true looping to occur for both duration-based and animationSpeed-based
     * sprites.
     */
    private _initialFrame: number | null | undefined;

    /** The texture index that was displayed last time. */
    private _previousFrame: number | null;

    /**
     * @param frames - Collection of textures or frames to use.
     * @param autoUpdate - Whether to use Ticker.shared to auto update animation time.
     */
    constructor(frames: AnimatedSpriteFrames, autoUpdate?: boolean);
    /**
     * @param options - The options for the AnimatedSprite.
     */
    constructor(options: AnimatedSpriteOptions);
    /** @ignore */
    constructor(...args: [AnimatedSpriteOptions?] | [SpriteOptions?] | [AnimatedSpriteFrames?, boolean?])
    {
        let options = args[0] as AnimatedSpriteOptions;

        if (Array.isArray(args[0]))
        {
            options = {
                textures: args[0] as AnimatedSpriteFrames,
                autoUpdate: args[1] ?? true,
            };
        }

        let firstFrame!: Texture | FrameObject;
        const { textures, autoUpdate, ...rest } = options;

        if (textures !== null)
        {
            [firstFrame] = textures;
        }

        super({
            ...rest,
            texture: firstFrame instanceof Texture ? firstFrame : firstFrame.texture,
        });

        this._textures = null;
        this._durations = null;
        this._autoUpdate = autoUpdate ?? true;
        this._isConnectedToTicker = false;

        this.animationSpeed = 1;
        this.loop = true;
        this.updateAnchor = false;
        this.onComplete = null;
        this.onFrameChange = null;
        this.onLoop = null;

        this._currentTime = 0;
        this._previousTime = 0;
        this._transitTime = 0;

        this._playing = false;
        this._previousFrame = null;

        this.textures = textures ?? [];
    }

    /**
     * A short hand way of creating an AnimatedSprite from an array of frame ids.
     * @param frames - The array of frames ids the AnimatedSprite will use as its texture frames.
     * @returns - The new animated sprite with the specified frames.
     */
    public static fromFrames(frames: string[]): AnimatedSprite
    {
        const textures = [];

        for (const item of frames)
        {
            textures.push(Texture.from(item));
        }

        return new AnimatedSprite(textures);
    }

    /**
     * A short hand way of creating an AnimatedSprite from an array of image ids.
     * @param images - The array of image urls the AnimatedSprite will use as its texture frames.
     * @returns The new animate sprite with the specified images as frames.
     */
    public static fromImages(images: string[]): AnimatedSprite
    {
        const textures = [];

        for (const item of images)
        {
            textures.push(Texture.from(item));
        }

        return new AnimatedSprite(textures);
    }

    /** Stops the AnimatedSprite. */
    public stop(): void
    {
        if (!this._playing)
        {
            return;
        }

        this._playing = false;
        if (this._autoUpdate && this._isConnectedToTicker)
        {
            Ticker.shared.remove(this.update, this);
            this._isConnectedToTicker = false;
        }
    }

    /** Plays the AnimatedSprite. */
    public play(): void
    {
        if (this._playing)
        {
            return;
        }

        // If gotoAndPlay was called while already playing, we may still
        // need to update the initial frame.
        //
        // That use case should be handled within gotoAndPlay, as this function doesn't stop
        // the runtime.
        this._initialFrame = this.currentFrame;

        this._playing = true;
        this._transitTime = 0;
        if (this._autoUpdate && !this._isConnectedToTicker)
        {
            Ticker.shared.add(this.update, this, UPDATE_PRIORITY.HIGH);
            this._isConnectedToTicker = true;
        }
    }

    /**
     * Stops the AnimatedSprite and goes to a specific frame.
     * @param frameNumber - Frame index to stop at.
     */
    public gotoAndStop(frameNumber: number): void
    {
        this.stop();
        this.currentFrame = frameNumber;
    }

    /**
     * Goes to a specific frame and begins playing the AnimatedSprite.
     * @param frameNumber - Frame index to start at.
     */
    public gotoAndPlay(frameNumber: number): void
    {
        this._initialFrame = this.currentFrame = frameNumber;
        this.play();
    }

    /**
     * Updates the object transform for rendering.
     * @param ticker - the ticker to use to update the object.
     */
    public update(ticker: Ticker): void
    {
        // If the animation isn't playing, no update is needed.
        if (!this._playing)
        {
            return;
        }

        // For durations, elapsed is deltaMS, for everything else, it's deltaTime
        let elapsed: number;
        const previousFrame = this.currentFrame;

        // If there are specific durations set for each frame:
        if (this.durations !== null)
        {
            // Calculate elapsed time based on ticker's deltaTime and animation speed.
            //
            // Note that any scaling/capping occurs in the Ticker implementation,
            // so we shouldn't have to worry about that here.
            let deltaMS = ticker.deltaMS;

            this._previousTime = this._currentTime;
            this._transitTime += quickRound(deltaMS, 4);

            // First, account for any time-steal from the previous frame, in the case
            // where the previous frame's continuing execution would have stolen time from
            // this current frame, in excess of the _durationAnimationStealMaxRate
            if (this._durationPreviousFrameDonationMS !== 0)
            {
                // If, as is the common case, deltaMS consumes the time-debt,
                // continue processing this tick.
                if (deltaMS > this._durationPreviousFrameDonationMS)
                {
                    deltaMS -= this._durationPreviousFrameDonationMS;
                    // now that we've consumed the donation, reset it
                    this._durationPreviousFrameDonationMS = 0;
                }
                else
                {
                    // Otherwise, there's no need: no frame or texture changes,
                    // call the onTick callback and early-return.
                    this._durationPreviousFrameDonationMS -= deltaMS;

                    if (this.onTickUpdate)
                    {
                        this.onTickUpdate(
                            this._transitTime,
                            this._currentTime,
                            this._previousTime,
                            this.currentFrame,
                            previousFrame,
                            ticker,
                        );
                    }

                    return;
                }
            }

            // A duration is the target total milliseconds on screen.
            //   duration / ticker.deltaMS === TARGET_FRAMES_ON_SCREEN (think FPS frames)
            //   for the current 'frame' (spritesheet frame)
            //
            //   previousFrame is the most recent execution, so we'll reference it here,
            //   as we calculate its remaining duration, and/or its encroachment on
            //   the next frame (number of ms over the allotted target duration time).
            const previousFrameTargetDuration = this.durations[previousFrame];

            // We must update the currentTime with respect to the frame's target duration.
            //
            // An example:
            //   - Assume a deltaMS of 10.00 for demonstration purposes (makes the math easier to share).
            //   - Assume a targetFrameDuration of 100ms for the previousFrame.
            //
            // 100% animation completion, in milliseconds, then is 100ms (the target runtime duration).
            // And 10ms (the previous duration runtime) is 10ms/100ms === 10% of that target.
            //
            // Then, currentTime is used as a running percentage progress tracker for the animation.
            // When 100%, the frame changes.
            // When > 100%, the previous animation has effectively stolen some time from the next animation.
            // When < 100%, the previous animation should continue to play into the next deltaMS.
            //   - Note, that for the last consideration, we can ameliorate the time-steal if we take into account some
            //     maximum-allowed progress time-steal. This can really help in scenarios when, say, only 0.5% progress
            //     remains, but the next deltaMS of progress will steal an out-sized amount of runtime from the next
            //     frame (perhaps it's a short-running frame).
            const previousFrameProgressPct = quickRound(deltaMS / previousFrameTargetDuration, 4);

            // If the total progress so far is > 100%, then we need to do two things:
            //   1. Ensure that currentTime is incremented to the next frame (cleanly, with 0 decimal values)
            //      - Note: we can't simply add the percentage progress excess from the current frame into the next,
            //        because they might have different durations.
            //   2. Calculate how much time-steal has occurred from the next frame, and subtract that from
            //      the next frame's run-time duration, by adding the remainder to currentTime after the increment from 1.
            //      - Note: another question we must confront: what is the maximum allowable steal? Or, put another way,
            //        what is the minimum % run-time of each frame in an animation sequence, such that we cap the % steal
            //        to ensure a consistent viewing experience?

            this._currentTime = quickRound(this._currentTime + previousFrameProgressPct, 4);
            const currentTimeFloor = Math.floor(this._currentTime);
            const previousTimeFloor = Math.floor(this._previousTime);

            // Have we completed the runtime duration for the current frame?
            if (currentTimeFloor > previousTimeFloor)
            {
                // Subtract the previous time floor and 100% of the current time from the currentTime,
                // which is thought of as percentage progress,
                // and multiply the excess percentage against the target duration in MS, to get MS.
                //
                // So, if current is 15.66; previous floor would be 14 (given the conditional for this branch),
                // and we'd have (15.66 - 14 - 1) % 1 === 0.66
                // This is done, rather than just a modulo, in the event that the currentTime jumps much further than 1
                // duration of the current frame.
                const nextFrameTimeStealMS = ((this._currentTime - previousTimeFloor - 1) % 1) * previousFrameTargetDuration;

                // Ensure currentTime increments and add in our time steal,
                // effectively stealing time from the next frame.
                this._currentTime = currentTimeFloor + quickRound(nextFrameTimeStealMS / 1000, 4);
            }
            else
            {
                // Calculate the projected rate of steal (if any) using the ticker's target deltaMS;
                // Since deltaMS may be modified to handle time-steal frames, we **must** use the
                // expected value directly from the ticker, not our [potentially] modified local variable!
                const expectedFrameProgressPct = quickRound(ticker.deltaMS / previousFrameTargetDuration, 4);
                const nextTime = this._currentTime + expectedFrameProgressPct;
                const nextTimeFrame = this._frameFromTime(nextTime);

                // Would the next delta bump us into a new frame? If so, we may skip ahead to the next
                // frame to avoid eating too much of that frame's run-time with another tick.
                //
                // otherwise, we are free to continue looping.
                if (nextTimeFrame !== this.currentFrame)
                {
                    // If so, calculate the expected time steal, if this frame were to run
                    // for another delta.
                    const nextFrameTimeStealMS = ((nextTime - currentTimeFloor - 1) % 1) * previousFrameTargetDuration;
                    // calculate the percentage for the next frame
                    const nextFrameTargetDuration = this.durations[nextTimeFrame];
                    const nextFrameTimeStealPct = quickRound(nextFrameTimeStealMS / nextFrameTargetDuration, 4);
                    // If it's too much steal, we need to kick off the next frame,
                    // knowing that it will account for this early-switch (see above).

                    if (nextFrameTimeStealPct > this.durationAnimationStealMaxRate)
                    {
                        // The remaining time left of this frame, which it will lose out on, to be monitored by the
                        // next frame.
                        this._durationPreviousFrameDonationMS = quickRound(
                            ((1 - (this._currentTime % 1)) * previousFrameTargetDuration),
                            4
                        );
                        this._currentTime = Math.floor(nextTimeFrame);
                    }
                }
            }
        }
        else
        {
            // Calculate elapsed time based on ticker's deltaTime and animation speed.
            const deltaTime = ticker.deltaTime;

            elapsed = this.animationSpeed * deltaTime;

            // Update previousTime before increasing currentTime.
            // currently this is duplicated in both branches, due to the differing ways
            // currentTime is updated.
            this._previousTime = this._currentTime;

            // If no specific durations set, simply adjust the current time by elapsed time,
            // which will then reflect transitTime.
            this._currentTime += Math.abs(elapsed);
            this._transitTime += Math.abs(elapsed);
        }

        if (this.onTickUpdate)
        {
            this.onTickUpdate(
                this._transitTime,
                this._currentTime,
                this._previousTime,
                this.currentFrame,
                previousFrame,
                ticker,
            );
        }

        // Animation completion check. Note: if an animation is on its final loop,
        // it will trigger onCompleted, but *not* onLoop.
        if (
            // We have textures
            this._textures !== null
            // And don't want to repeat anymore
            && !this.loop
            // And any transit time has elapsed (that is, we're not at the absolute start of the animation)
            && (this._transitTime > 0)
            // And a previous frame exists, and it is, crucially, not the same as our current frame (for durations)
            // OR, we've landed at the same frame, but from different points in time - for when deltaTime causes an
            // animationSpeed-based loop all at once.
            && (
                previousFrame !== this.currentFrame
                || (Math.floor(this._previousTime) !== Math.floor(this._currentTime))
            )
            // Finally, the current frame is actually equal to the animation's initial frame when play was called
            && (this.currentFrame === this.initialFrame)
        )
        {
            // We only reach this branch of code IF and only IF the animation has looped through
            // to completion, from whichever frame it started at, in the current loop.
            //
            // Rather than resetting the animation's reference starting frame, we trust that the user
            // will manage the start frame if they had previously changed it from the 0th index, as
            // that's the only way that the current frame would not be the next in the sequence.
            //
            // To clarify: if the animation started at frame 0, then at time of execution in this branch,
            // the currentFrame will be 0.
            this.stop();

            // If there's an onComplete callback, call it.
            if (this.onComplete)
            {
                this.onComplete();

                return;
            }
        }

        // onLoop conditional check.
        //
        // Note: this will *not* be triggered on an animation's final loop. Rather, onComplete will be called.
        if (
            // See above for logic explanations; some of the same conditional checks as exiting a loop!
            (this.currentFrame === this.initialFrame)
            && (
                previousFrame !== this.currentFrame
                || (Math.floor(this._previousTime) !== Math.floor(this._currentTime))
            )
        )
        {
            if (this.loop && this.onLoop)
            {
                // If the animation loops, and there's an onLoop callback, call it.
                this.onLoop();
            }
        }

        // If we need to update the texture, do so now
        if (previousFrame !== this.currentFrame)
        {
            // Update the texture for the current frame.
            this._updateTexture();
        }
    }

    /** Stops the AnimatedSprite and destroys it. */
    public destroy(): void
    {
        this.stop();
        super.destroy();

        this.onComplete = null;
        this.onFrameChange = null;
        this.onLoop = null;
    }

    /** The maximum allowable rate of steal for duration-based animations. */
    public get durationAnimationStealMaxRate(): number
    {
        return this._durationAnimationStealMaxRate;
    }

    public set durationAnimationStealMaxRate(value: number)
    {
        if (value > 1)
        {
            warn(`durationAnimationStealMaxRate should be between 0 and 1, and exceeds 1 (${value}). Setting to 1.`);
            value = 1;
        }
        if (value < 0)
        {
            warn(`durationAnimationStealMaxRate should be between 0 and 1, and is below 0 (${value}). Setting to 0.`);
            value = 0;
        }
        this._durationAnimationStealMaxRate = value;
    }

    /**
     * The total number of frames in the AnimatedSprite. This is the same as number of textures
     * assigned to the AnimatedSprite.
     * @readonly
     * @default 0
     */
    public get totalFrames(): number
    {
        return this._textures?.length ?? 0;
    }

    /** The array of textures used for this AnimatedSprite. */
    public get textures(): Texture[] | null
    {
        return this._textures;
    }

    public set textures(value: AnimatedSpriteFrames)
    {
        if (value[0] instanceof Texture)
        {
            this._textures = value as Texture[];
            this._durations = null;
        }
        else
        {
            this._textures = [];
            this._durations = [];

            for (const animatedSpriteFrame of value)
            {
                this._textures.push((animatedSpriteFrame as FrameObject).texture);
                this._durations.push((animatedSpriteFrame as FrameObject).time);
            }
        }
        this._previousFrame = null;
        this.gotoAndStop(0);
        this._updateTexture();
    }

    /** An array of durations, which map to sprite frames at the same index */
    public get durations(): number[] | null
    {
        return this._durations;
    }

    public set durations(value: number[])
    {
        if (value.length !== this.textures?.length)
        {
            throw new Error(`[AnimatedSprite]: Invalid frame durations length (${value.length}), `
                + `expected to equal to the number of textures (${this.textures?.length}).`);
        }
        this._durations = value;
    }

    /** The AnimatedSprite's current frame index. */
    public get currentFrame(): number
    {
        return this._frameFromTime(this._currentTime);
    }

    public set currentFrame(value: number)
    {
        if (value < 0 || value > this.totalFrames - 1)
        {
            throw new Error(`[AnimatedSprite]: Invalid frame index value ${value}, `
                + `expected to be between 0 and totalFrames ${this.totalFrames}.`);
        }

        const previousFrame = this.currentFrame;

        this._currentTime = value;

        if (previousFrame !== this.currentFrame)
        {
            this._updateTexture();
        }
    }

    /**
     * Indicates if the AnimatedSprite is currently playing.
     * @readonly
     */
    public get playing(): boolean
    {
        return this._playing;
    }

    /** Whether to use Ticker.shared to auto update animation time. */
    public get autoUpdate(): boolean
    {
        return this._autoUpdate;
    }

    public set autoUpdate(value: boolean)
    {
        if (value !== this._autoUpdate)
        {
            this._autoUpdate = value;

            if (!this._autoUpdate && this._isConnectedToTicker)
            {
                Ticker.shared.remove(this.update, this);
                this._isConnectedToTicker = false;
            }
            else if (this._autoUpdate && !this._isConnectedToTicker && this._playing)
            {
                Ticker.shared.add(this.update, this);
                this._isConnectedToTicker = true;
            }
        }
    }

    /** Set the initial frame of animation for looping and tracking purposes */
    public get initialFrame(): number
    {
        if (this._initialFrame === null || this._initialFrame === undefined)
        {
            throw new Error(`[AnimatedSprite]: internal access of initialFrame, but it `
                + `was null or undefined (${this._initialFrame}).`);
        }

        return this._initialFrame;
    }

    /** Updates the displayed texture to match the current frame index. */
    private _updateTexture(): void
    {
        const currentFrame = this.currentFrame;

        if (this._previousFrame === currentFrame)
        {
            return;
        }

        this._previousFrame = currentFrame;

        if (this.textures !== null)
        {
            this.texture = this.textures[currentFrame];
        }

        if (this.updateAnchor && this.texture?.defaultAnchor)
        {
            this.anchor.copyFrom(this.texture.defaultAnchor);
        }

        if (this.onFrameChange)
        {
            this.onFrameChange(this.currentFrame);
        }
    }

    /**
     * The AnimatedSprite's frame index given a target time.
     * @param targetTime
     */
    private _frameFromTime(targetTime: number): number
    {
        if (this._textures === null)
        {
            throw new Error('[AnimatedSprite]: attempted to access this._textures, but it was null.');
        }

        // If we allowed this to occur, we would incorrectly return frame 0 for empty texture arrays
        if (this._textures.length === 0)
        {
            throw new Error('[AnimatedSprite]: attempted to access this._textures, but it was empty.');
        }

        let targetFrame = Math.floor(targetTime) % (this._textures.length);

        if (targetFrame < 0)
        {
            targetFrame += (this._textures.length);
        }

        // Avoid negative 0
        return targetFrame + 0;
    }
}

/**
 * A reference to a frame in an {@link scene.AnimatedSprite}
 * @memberof scene
 */
export interface FrameObject
{
    /** The {@link Texture} of the frame. */
    texture: Texture;

    /** The duration of the frame, in milliseconds. */
    time: number;
}
