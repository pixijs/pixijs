var core = require('../core');
/**
 * A MovieClip is a simple way to display an animation depicted by a list of textures.
 *
 * ```js
 * var alienImages = ["image_sequence_01.png","image_sequence_02.png","image_sequence_03.png","image_sequence_04.png"];
 * var textureArray = [];
 *
 * for (var i=0; i < 4; i++)
 * {
 *      var texture = PIXI.Texture.fromImage(alienImages[i]);
 *      textureArray.push(texture);
 * };
 *
 * var mc = new PIXI.MovieClip(textureArray);
 * ```
 *
 * @typedef FrameObject
 * @type {object}
 * @property texture {PIXI.Texture} The {@link PIXI.Texture} of the frame
 * @property time {number} the duration of the frame in ms
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI.extras
 * @param textures {PIXI.Texture[]|FrameObject[]} an array of {@link PIXI.Texture} or frame objects that make up the animation
 */
function MovieClip(textures)
{
    core.Sprite.call(this, textures[0] instanceof core.Texture ? textures[0] : textures[0].texture);

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

// constructor
MovieClip.prototype = Object.create(core.Sprite.prototype);
MovieClip.prototype.constructor = MovieClip;
module.exports = MovieClip;

Object.defineProperties(MovieClip.prototype, {
    /**
     * totalFrames is the total number of frames in the MovieClip. This is the same as number of textures
     * assigned to the MovieClip.
     *
     * @member {number}
     * @memberof PIXI.extras.MovieClip#
     * @default 0
     * @readonly
     */
    totalFrames: {
        get: function()
        {
            return this._textures.length;
        }
    },

    /**
     * The array of textures used for this MovieClip
     *
     * @member {PIXI.Texture[]}
     * @memberof PIXI.extras.MovieClip#
     *
     */
    textures: {
        get: function ()
        {
            return this._textures;
        },
        set: function (value)
        {
            if(value[0] instanceof core.Texture)
            {
                this._textures = value;
                this._durations = null;
            }
            else
            {
                this._textures = [];
                this._durations = [];
                for(var i = 0; i < value.length; i++)
                {
                    this._textures.push(value[i].texture);
                    this._durations.push(value[i].time);
                }
            }
        }
    },

    /**
    * The MovieClips current frame index
    *
    * @member {number}
    * @memberof PIXI.extras.MovieClip#
    * @readonly
    */
    currentFrame: {
        get: function ()
        {
            var currentFrame = Math.floor(this._currentTime) % this._textures.length;
            if (currentFrame < 0)
            {
                currentFrame += this._textures.length;
            }
            return currentFrame;
        }
    }

});

/**
 * Stops the MovieClip
 *
 */
MovieClip.prototype.stop = function ()
{
    if(!this.playing)
    {
        return;
    }

    this.playing = false;
    core.ticker.shared.remove(this.update, this);
};

/**
 * Plays the MovieClip
 *
 */
MovieClip.prototype.play = function ()
{
    if(this.playing)
    {
        return;
    }

    this.playing = true;
    core.ticker.shared.add(this.update, this);
};

/**
 * Stops the MovieClip and goes to a specific frame
 *
 * @param frameNumber {number} frame index to stop at
 */
MovieClip.prototype.gotoAndStop = function (frameNumber)
{
    this.stop();

    this._currentTime = frameNumber;

    this._texture = this._textures[this.currentFrame];
};

/**
 * Goes to a specific frame and begins playing the MovieClip
 *
 * @param frameNumber {number} frame index to start at
 */
MovieClip.prototype.gotoAndPlay = function (frameNumber)
{
    this._currentTime = frameNumber;

    this.play();
};

/*
 * Updates the object transform for rendering
 * @private
 */
MovieClip.prototype.update = function (deltaTime)
{
    var elapsed = this.animationSpeed * deltaTime;

    if (this._durations !== null)
    {
        var lag = this._currentTime % 1 * this._durations[this.currentFrame];

        lag += elapsed / 60 * 1000;

        while (lag < 0)
        {
            this._currentTime--;
            lag += this._durations[this.currentFrame];
        }

        var sign = Math.sign(this.animationSpeed * deltaTime);
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
    else
    {
        this._texture = this._textures[this.currentFrame];
    }

};

/*
 * Stops the MovieClip and destroys it
 *
 */
MovieClip.prototype.destroy = function ( )
{
    this.stop();
    core.Sprite.prototype.destroy.call(this);
};

/**
 * A short hand way of creating a movieclip from an array of frame ids
 *
 * @static
 * @param frames {string[]} the array of frames ids the movieclip will use as its texture frames
 */
MovieClip.fromFrames = function (frames)
{
    var textures = [];

    for (var i = 0; i < frames.length; ++i)
    {
        textures.push(new core.Texture.fromFrame(frames[i]));
    }

    return new MovieClip(textures);
};

/**
 * A short hand way of creating a movieclip from an array of image ids
 *
 * @static
 * @param images {string[]} the array of image urls the movieclip will use as its texture frames
 */
MovieClip.fromImages = function (images)
{
    var textures = [];

    for (var i = 0; i < images.length; ++i)
    {
        textures.push(new core.Texture.fromImage(images[i]));
    }

    return new MovieClip(textures);
};
