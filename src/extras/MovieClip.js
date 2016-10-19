import * as core from '../core';

/**
 * @typedef FrameObject
 * @type {object}
 * @property {PIXI.Texture} texture - The {@link PIXI.Texture} of the frame
 * @property {number} time - the duration of the frame in ms
 */

/**
 * A MovieClip is a simple way to display an animation depicted by a list of textures.
 *
 * ```js
 * let alienImages = ["image_sequence_01.png","image_sequence_02.png","image_sequence_03.png","image_sequence_04.png"];
 * let textureArray = [];
 *
 * for (let i=0; i < 4; i++)
 * {
 *      let texture = PIXI.Texture.fromImage(alienImages[i]);
 *      textureArray.push(texture);
 * };
 *
 * let mc = new PIXI.MovieClip(textureArray);
 * ```
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI.extras
 */
export default class MovieClip extends core.Sprite
{
    /**
     * @param {PIXI.Texture[]|FrameObject[]} textures - an array of {@link PIXI.Texture} or frame
     *  objects that make up the animation
     */
    constructor(textures)
    {
        super(textures[0] instanceof core.Texture ? textures[0] : textures[0].texture);

        /**
         * @private
         */
        this._textures = null;

        /**
         * @private
         */
        this._durations = null;

        this.textures = textures;

        /**
         * The speed that the MovieClip will play at. Higher is faster, lower is slower
         *
         * @member {number}
         * @default 1
         */
        this.animationSpeed = 1;

        /**
         * Whether or not the movie clip repeats after playing.
         *
         * @member {boolean}
         * @default true
         */
        this.loop = true;

        /**
         * Function to call when a MovieClip finishes playing
         *
         * @method
         * @memberof PIXI.extras.MovieClip#
         */
        this.onComplete = null;

        /**
         * Function to call when a MovieClip changes which texture is being rendered
         *
         * @method
         * @memberof PIXI.extras.MovieClip#
         */
        this.onFrameChange = null;

        /**
         * Elapsed time since animation has been started, used internally to display current texture
         *
         * @member {number}
         * @private
         */
        this._currentTime = 0;

        /**
         * Indicates if the MovieClip is currently playing
         *
         * @member {boolean}
         * @readonly
         */
        this.playing = false;
    }

    /**
     * Stops the MovieClip
     *
     */
    stop()
    {
        if (!this.playing)
        {
            return;
        }

        this.playing = false;
        core.ticker.shared.remove(this.update, this);
    }

    /**
     * Plays the MovieClip
     *
     */
    play()
    {
        if (this.playing)
        {
            return;
        }

        this.playing = true;
        core.ticker.shared.add(this.update, this);
    }

    /**
     * Stops the MovieClip and goes to a specific frame
     *
     * @param {number} frameNumber - frame index to stop at
     */
    gotoAndStop(frameNumber)
    {
        this.stop();

        const previousFrame = this.currentFrame;

        this._currentTime = frameNumber;

        if (previousFrame !== this.currentFrame)
        {
            this._texture = this._textures[this.currentFrame];
            this._textureID = -1;

            if (this.onFrameChange)
            {
                this.onFrameChange(this.currentFrame);
            }
        }
    }

    /**
     * Goes to a specific frame and begins playing the MovieClip
     *
     * @param {number} frameNumber - frame index to start at
     */
    gotoAndPlay(frameNumber)
    {
        this._currentTime = frameNumber;

        this.play();
    }

    /**
     * Updates the object transform for rendering.
     *
     * @private
     * @param {number} deltaTime - Time since last tick.
     */
    update(deltaTime)
    {
        const elapsed = this.animationSpeed * deltaTime;
        const previousFrame = this.currentFrame;

        if (this._durations !== null)
        {
            let lag = this._currentTime % 1 * this._durations[this.currentFrame];

            lag += elapsed / 60 * 1000;

            while (lag < 0)
            {
                this._currentTime--;
                lag += this._durations[this.currentFrame];
            }

            const sign = Math.sign(this.animationSpeed * deltaTime);

            this._currentTime = Math.floor(this._currentTime);

            while (lag >= this._durations[this.currentFrame])
            {
                lag -= this._durations[this.currentFrame] * sign;
                this._currentTime += sign;
            }

            this._currentTime += lag / this._durations[this.currentFrame];
        }
        else
        {
            this._currentTime += elapsed;
        }

        if (this._currentTime < 0 && !this.loop)
        {
            this.gotoAndStop(0);

            if (this.onComplete)
            {
                this.onComplete();
            }
        }
        else if (this._currentTime >= this._textures.length && !this.loop)
        {
            this.gotoAndStop(this._textures.length - 1);

            if (this.onComplete)
            {
                this.onComplete();
            }
        }
        else if (previousFrame !== this.currentFrame)
        {
            this._texture = this._textures[this.currentFrame];
            this._textureID = -1;

            if (this.onFrameChange)
            {
                this.onFrameChange(this.currentFrame);
            }
        }
    }

    /**
     * Stops the MovieClip and destroys it
     *
     */
    destroy()
    {
        this.stop();
        super.destroy();
    }

    /**
     * A short hand way of creating a movieclip from an array of frame ids
     *
     * @static
     * @param {string[]} frames - The array of frames ids the movieclip will use as its texture frames
     * @return {MovieClip} The new movie clip with the specified frames.
     */
    static fromFrames(frames)
    {
        const textures = [];

        for (let i = 0; i < frames.length; ++i)
        {
            textures.push(core.Texture.fromFrame(frames[i]));
        }

        return new MovieClip(textures);
    }

    /**
     * A short hand way of creating a movieclip from an array of image ids
     *
     * @static
     * @param {string[]} images - the array of image urls the movieclip will use as its texture frames
     * @return {MovieClip} The new movie clip with the specified images as frames.
     */
    static fromImages(images)
    {
        const textures = [];

        for (let i = 0; i < images.length; ++i)
        {
            textures.push(core.Texture.fromImage(images[i]));
        }

        return new MovieClip(textures);
    }

    /**
     * totalFrames is the total number of frames in the MovieClip. This is the same as number of textures
     * assigned to the MovieClip.
     *
     * @readonly
     * @member {number}
     * @memberof PIXI.extras.MovieClip#
     * @default 0
     */
    get totalFrames()
    {
        return this._textures.length;
    }

    /**
     * The array of textures used for this MovieClip
     *
     * @member {PIXI.Texture[]}
     * @memberof PIXI.extras.MovieClip#
     */
    get textures()
    {
        return this._textures;
    }

    /**
     * Sets the textures.
     *
     * @param {PIXI.Texture[]} value - The texture to set.
     */
    set textures(value)
    {
        if (value[0] instanceof core.Texture)
        {
            this._textures = value;
            this._durations = null;
        }
        else
        {
            this._textures = [];
            this._durations = [];

            for (let i = 0; i < value.length; i++)
            {
                this._textures.push(value[i].texture);
                this._durations.push(value[i].time);
            }
        }
    }

    /**
    * The MovieClips current frame index
    *
    * @member {number}
    * @memberof PIXI.extras.MovieClip#
    * @readonly
    */
    get currentFrame()
    {
        let currentFrame = Math.floor(this._currentTime) % this._textures.length;

        if (currentFrame < 0)
        {
            currentFrame += this._textures.length;
        }

        return currentFrame;
    }
}
