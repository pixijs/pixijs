/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * A MovieClip is a simple way to display an animation depicted by a list of textures.
 * @class MovieClip
 * @extends Sprite
 * @constructor
 * @param textures {Array} an array of {Texture} objects that make up the animation
 */
PIXI.MovieClip = function(textures)
{
	PIXI.Sprite.call( this, textures[0]);
	
	/**
	 * The array of textures that make up the animation
	 * @property textures
	 * @type Array
	 */
	this.textures = textures;
	
	/**
	 * [read only] The index MovieClips current frame (this may not have to be a whole number)
	 * @property currentFrame
	 * @type Number
	 */
	this.currentFrame = 0; 
	
	/**
	 * The speed that the MovieClip will play at. Higher is faster, lower is slower
	 * @property animationSpeed
	 * @type Number
	 */
	this.animationSpeed = 1;

	/**
	 * Whether or not the movie clip repeats after playing.
	 * @property loop
	 * @type Boolean
	 */
	this.loop = true;

	/**
	 * Function to call when a MovieClip finishes playing
	 * @property onComplete
	 * @type Function
	 */
	this.onComplete = null;
	
	/**
	 * [read only] indicates if the MovieClip is currently playing
	 * @property playing
	 * @type Boolean
	 */
	this.playing;
}

// constructor
PIXI.MovieClip.constructor = PIXI.MovieClip;
PIXI.MovieClip.prototype = Object.create( PIXI.Sprite.prototype );

/**
 * Stops the MovieClip
 * @method stop
 */
PIXI.MovieClip.prototype.stop = function()
{
	this.playing = false;
}

/**
 * Plays the MovieClip
 * @method play
 */
PIXI.MovieClip.prototype.play = function()
{
	this.playing = true;
}

/**
 * Stops the MovieClip and goes to a specific frame
 * @method gotoAndStop
 * @param frameNumber {Number} frame index to stop at
 */
PIXI.MovieClip.prototype.gotoAndStop = function(frameNumber)
{
	this.playing = false;
	this.currentFrame = frameNumber;
	var round = (this.currentFrame + 0.5) | 0;
	this.setTexture(this.textures[round % this.textures.length]);
}

/**
 * Goes to a specific frame and begins playing the MovieClip
 * @method gotoAndPlay
 * @param frameNumber {Number} frame index to start at
 */
PIXI.MovieClip.prototype.gotoAndPlay = function(frameNumber)
{
	this.currentFrame = frameNumber;
	this.playing = true;
}

PIXI.MovieClip.prototype.updateTransform = function()
{
	PIXI.Sprite.prototype.updateTransform.call(this);
	
	if(!this.playing)return;
	
	this.currentFrame += this.animationSpeed;
	var round = (this.currentFrame + 0.5) | 0;
	if(this.loop || round < this.textures.length)
	{
		this.setTexture(this.textures[round % this.textures.length]);
	}
	else if(round >= this.textures.length)
	{
		this.gotoAndStop(this.textures.length - 1);
		if(this.onComplete)
		{
			this.onComplete();
		}
	}
}