import * as core from '../core';

/**
 * @typedef FrameObject
 * @type {object}
 * @property {PIXI.Texture} texture - The {@link PIXI.Texture} of the frame
 * @property {number} time - the duration of the frame in ms
 */

/**
 * An MultiMultiAnimatedSprite can display several animations depicted by a map containing a list of textures.
 *
 * ```js
 * let walk = ["image_sequence_01.png","image_sequence_02.png","image_sequence_03.png","image_sequence_04.png"];
 * let stop = [PIXI.Texture.fromImage("image_sequence_02.png")];
 *
 * for (let i=0; i < 4; i++)
 *   walk[i] = PIXI.Texture.fromImage(walk[i]);
 *
 * let mc = new PIXI.MultiAnimatedSprite({walk, stop},"stop");
 * ```
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI.extras
 */
export default class MultiAnimatedSprite extends core.Sprite
{
    /**
     * @param {object} animationMap - a map of named animations, each animation is an array of {PIXI.Texture[]|FrameObject[]} textures.
     * @param {string} initialAnimation - name of the initial animation. must exist inside the animationMap
     * @param {boolean} [autoUpdate=true] - Whether to use PIXI.ticker.shared to auto update animation time.
     */
    constructor(animationMap, initialAnimation, autoUpdate)
    {
        super(animationMap[initialAnimation][0] instanceof core.Texture ? animationMap[initialAnimation][0] : animationMap[initialAnimation][0].texture);

        /**
         * @private
         */
        this._textures = null;

        /**
         * @private
         */
        this._durations = null;

        this.animationMap = animationMap;

        this.currentAnimation = initialAnimation;

        this.initialAnimation = initialAnimation;

        this.textures = animationMap[initialAnimation];

        /**
         * `true` uses PIXI.ticker.shared to auto update animation time.
         * @type {boolean}
         * @default true
         * @private
         */
        this._autoUpdate = autoUpdate !== false;

        /**
         * The speed that the MultiAnimatedSprite will play at. Higher is faster, lower is slower
         *
         * @member {number}
         * @default 1
         */
        this.animationSpeed = 1;

        /**
         * Whether or not the animate sprite repeats after playing.
         *
         * @member {boolean}
         * @default true
         */
        this.loop = true;

        /**
         * Function to call when a MultiAnimatedSprite finishes playing
         *
         * @member {Function}
         */
        this.onComplete = null;

        /**
         * Function to call when a MultiAnimatedSprite changes which texture is being rendered
         *
         * @member {Function}
         */
        this.onFrameChange = null;

         /**
         * Function to call when 'loop' is true, and an MultiAnimatedSprite is played and loops around to start again
         *
         * @member {Function}
         */
        this.onLoop = null;

        /**
         * Elapsed time since animation has been started, used internally to display current texture
         *
         * @member {number}
         * @private
         */
        this._currentTime = 0;

        /**
         * Indicates if the MultiAnimatedSprite is currently playing
         *
         * @member {boolean}
         * @readonly
         */
        this.playing = false;
    }

    /**
     * Stops the MultiAnimatedSprite
     *
     */
    stop()
    {
        if (!this.playing)
        {
            return;
        }

        this.playing = false;
        if (this._autoUpdate)
        {
            core.ticker.shared.remove(this.update, this);
        }
    }

    /**
     * Plays the requested animation from MultiAnimatedSprite
     * 
     * @param {string} animation - animation from animation map to be played 
     */
    play(animation)
    {
        
        if (this.playing || this.currentAnimation === animation)
        {
            return;
        }

        if(this.currentAnimation === animation) {
            this.currentFrame = 0;
            this.textures = this.animationMap[this.currentFrame];   
        }

        this.playing = true;
        if (this._autoUpdate)
        {
            core.ticker.shared.add(this.update, this, core.UPDATE_PRIORITY.HIGH);
        }
    }

    /**
     * Stops the MultiAnimatedSprite and goes to a specific frame
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
            this.updateTexture();
        }
    }

    /**
     * Goes to a specific frame and begins playing the MultiAnimatedSprite
     *
     * @param {number} frameNumber - frame index to start at
     */
    gotoAndPlay(frameNumber)
    {
        const previousFrame = this.currentFrame;

        this._currentTime = frameNumber;

        if (previousFrame !== this.currentFrame)
        {
            this.updateTexture();
        }

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
            if (this.loop && this.onLoop)
            {
                if (this.animationSpeed > 0 && this.currentFrame < previousFrame)
                {
                    this.onLoop();
                }
                else if (this.animationSpeed < 0 && this.currentFrame > previousFrame)
                {
                    this.onLoop();
                }
            }

            this.updateTexture();
        }
    }

    /**
     * Updates the displayed texture to match the current frame index
     *
     * @private
     */
    updateTexture()
    {
        this._texture = this._textures[this.currentFrame];
        this._textureID = -1;
        this.cachedTint = 0xFFFFFF;

        if (this.onFrameChange)
        {
            this.onFrameChange(this.currentFrame);
        }
    }

    /**
     * Stops the MultiAnimatedSprite and destroys it
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy
     *      method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the sprite as well
     * @param {boolean} [options.baseTexture=false] - Should it destroy the base texture of the sprite as well
     */
    destroy(options)
    {
        this.stop();
        super.destroy(options);
    }

    /**
     * A short hand way of creating a movieclip from an array of frame ids
     *
     * @static
     * @param {string[]} frames - The array of frames ids the movieclip will use as its texture frames
     * @return {MultiAnimatedSprite} The new animated sprite with the specified frames.
     */
    static fromFrames(frames)
    {
        const textures = [];

        for (let i = 0; i < frames.length; ++i)
        {
            textures.push(core.Texture.fromFrame(frames[i]));
        }

        return new MultiAnimatedSprite(textures);
    }

    /**
     * A short hand way of creating a movieclip from an array of image ids
     *
     * @static
     * @param {string[]} images - the array of image urls the movieclip will use as its texture frames
     * @return {MultiAnimatedSprite} The new animate sprite with the specified images as frames.
     */
    static fromImages(images)
    {
        const textures = [];

        for (let i = 0; i < images.length; ++i)
        {
            textures.push(core.Texture.fromImage(images[i]));
        }

        return new MultiAnimatedSprite(textures);
    }

    /**
     * totalFrames is the total number of frames in the MultiAnimatedSprite. This is the same as number of textures
     * assigned to the MultiAnimatedSprite.
     *
     * @readonly
     * @member {number}
     * @default 0
     */
    get totalFrames()
    {
        return this._textures.length;
    }

    /**
     * The array of textures used for this MultiAnimatedSprite
     *
     * @member {PIXI.Texture[]}
     */
    get textures()
    {
        return this._textures;
    }

    set textures(value) // eslint-disable-line require-jsdoc
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
        this.gotoAndStop(0);
        this.updateTexture();
    }

    /**
    * The MultiAnimatedSprites current frame index
    *
    * @member {number}
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
