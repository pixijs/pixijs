var core    = require('../core'),
    Ticker  = require('./Ticker');

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
 * @class
 * @extends Sprite
 * @memberof PIXI.extras
 * @param textures {Texture[]} an array of {Texture} objects that make up the animation
 */
function MovieClip(textures)
{
    core.Sprite.call(this, textures[0]);

    /**
     * The array of textures that make up the animation
     *
     * @member {Texture[]}
     */
    this._textures = textures;

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
     * @memberof MovieClip#
     */
    this.onComplete = null;

    /**
     * The MovieClips current frame index (this may not have to be a whole number)
     *
     * @member {number}
     * @default 0
     * @readonly
     */
    this.currentFrame = 0;

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
     * @member
     * @memberof MovieClip#
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
     * @member
     * @memberof MovieClip#
     *
     */
    textures: {
        get: function ()
        {
            return this._textures;
        },
        set: function (value)
        {
            this._textures = value;

            this.texture = this._textures[Math.floor(this.currentFrame) % this._textures.length];
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
    Ticker.off('tick', this.update);
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
    Ticker.on('tick', this.update, this);
};

/**
 * Stops the MovieClip and goes to a specific frame
 *
 * @param frameNumber {number} frame index to stop at
 */
MovieClip.prototype.gotoAndStop = function (frameNumber)
{
    this.stop();

    this.currentFrame = frameNumber;

    var round = Math.floor(this.currentFrame);
    this.texture = this._textures[round % this._textures.length];
};

/**
 * Goes to a specific frame and begins playing the MovieClip
 *
 * @param frameNumber {number} frame index to start at
 */
MovieClip.prototype.gotoAndPlay = function (frameNumber)
{
    this.currentFrame = frameNumber;
    this.play();
};

/*
 * Updates the object transform for rendering
 * @private
 */
MovieClip.prototype.update = function (deltaTime)
{

    this.currentFrame += this.animationSpeed * deltaTime;

    var floor = Math.floor(this.currentFrame);

    if (floor < 0)
    {
        if (this.loop)
        {
            this.currentFrame += this._textures.length;
            this.texture = this._textures[this.currentFrame];
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
    else if (this.loop || floor < this._textures.length)
    {
        this.texture = this._textures[floor % this._textures.length];
    }
    else if (floor >= this._textures.length)
    {
        this.gotoAndStop(this.textures.length - 1);

        if (this.onComplete)
        {
            this.onComplete();
        }
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
