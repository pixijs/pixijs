var core = require('../core');

/**
 * A MovieClip is a simple way to display an animation depicted by a list of textures.
 *
 * @class
 * @extends Sprite
 * @namespace PIXI
 * @param textures {Texture[]} an array of {Texture} objects that make up the animation
 */
function MovieClip(textures)
{
    core.Sprite.call(this, textures[0]);

    /**
     * The array of textures that make up the animation
     *
     * @member Texture[]
     */
    this.textures = textures;

    /**
     * The speed that the MovieClip will play at. Higher is faster, lower is slower
     *
     * @member number
     * @default 1
     */
    this.animationSpeed = 1;

    /**
     * Whether or not the movie clip repeats after playing.
     *
     * @member boolean
     * @default true
     */
    this.loop = true;

    /**
     * Function to call when a MovieClip finishes playing
     *
     * @method
     * @memberof MovieClip#
     */
    this.onComplete = null;

    /**
     * The MovieClips current frame index (this may not have to be a whole number)
     *
     * @member number
     * @default 0
     * @readonly
     */
    this.currentFrame = 0;

    /**
     * Indicates if the MovieClip is currently playing
     *
     * @member boolean
     * @readonly
     */
    this.playing = false;
}

// constructor
MovieClip.prototype = Object.create(core.Sprite.prototype);
MovieClip.prototype.constructor = MovieClip;

Object.defineProperties(MovieClip.prototype, {
    /**
     * totalFrames is the total number of frames in the MovieClip. This is the same as number of textures
     * assigned to the MovieClip.
     *
     * @member
     * @memberof MovieClip#
     * @default 0
     * @readonly
     */
    totalFrames: {
        get: function()
        {
            return this.textures.length;
        }
    }
});

/**
 * Stops the MovieClip
 *
 */
MovieClip.prototype.stop = function ()
{
    this.playing = false;
};

/**
 * Plays the MovieClip
 *
 */
MovieClip.prototype.play = function ()
{
    this.playing = true;
};

/**
 * Stops the MovieClip and goes to a specific frame
 *
 * @param frameNumber {number} frame index to stop at
 */
MovieClip.prototype.gotoAndStop = function (frameNumber)
{
    this.playing = false;
    this.currentFrame = frameNumber;

    var round = Math.round(this.currentFrame);
    this.texture = this.textures[round % this.textures.length];
};

/**
 * Goes to a specific frame and begins playing the MovieClip
 *
 * @param frameNumber {number} frame index to start at
 */
MovieClip.prototype.gotoAndPlay = function (frameNumber)
{
    this.currentFrame = frameNumber;
    this.playing = true;
};

/*
 * Updates the object transform for rendering
 *
 * @private
 */
MovieClip.prototype.updateTransform = function ()
{
    this.containerUpdateTransform();

    if (!this.playing)
    {
        return;
    }

    this.currentFrame += this.animationSpeed;

    var round = Math.round(this.currentFrame);

    if (round < 0)
    {
        if (this.loop)
        {
            this.currentFrame += this.textures.length;
            this.texture = this.textures[this.currentFrame];
        }
        else
        {
            this.gotoAndStop(0);

            if (this.onComplete)
            {
                this.onComplete();
            }
        }
    }
    else if (this.loop || round < this.textures.length)
    {
        this.texture = this.textures[round % this.textures.length];
    }
    else if (round >= this.textures.length)
    {
        this.gotoAndStop(this.textures.length - 1);

        if (this.onComplete)
        {
            this.onComplete();
        }
    }
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
