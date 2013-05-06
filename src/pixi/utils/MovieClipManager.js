/**
 * @author Vsevolod Strukchinsky @floatdrop
 */


/**
 * A class MovieClipManager contains and manages MovieClips
 * @class MovieClipManager
 * @extends DisplayObjectContainer
 * @constructor
 */
PIXI.MovieClipManager = function () {
    PIXI.DisplayObjectContainer.call(this);

    /**
     * [read-only] The map of name to MovieClip objects.
     * @property _animations {Object}
     */
    this._animations = {};

    /**
     * [read-only] The current displaying animation.
     * @property children {MovieClip}
     */
    this._current = undefined;

    for (var argumentIndex in arguments) {
        var arg = arguments[argumentIndex];
        this.add(arg.name, arg.clip);
    }

};

PIXI.MovieClipManager.constructor = PIXI.MovieClipManager;
PIXI.MovieClipManager.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

/**
 * Gets movieClip with `name`
 * @method get
 * @param  name {String}
 * @return MovieClip
 */
PIXI.MovieClipManager.prototype.get = function (name) {
    return this._animations[name];
};


/**
 * Changes movieClip to another
 * @method set
 * @param  name {String}
 * @return DisplayObject
 */
PIXI.MovieClipManager.prototype.set = function (name) {
    if (this._current) {
        this._current.stop();
        this._current.visible = false;
    }
    this._current = this._animations[name];
    if (this._current) {
        this._current.visible = true;
    }
    return this;
};

/**
 * Plays movieClip
 * @method play
 * @param  name {String} (set as undefined to play current MovieClip)
 * @return DisplayObject
 */
PIXI.MovieClipManager.prototype.play = function (name) {
    if (name) {
        this.set(name);
    }
    if (this._current) {
        this._current.play();
    }
    return this;
};

/**
 * Stops the current MovieClip and goes to a specific frame
 * @method gotoAndStop
 * @param frameNumber {Number} frame index to stop at
 */
PIXI.MovieClipManager.prototype.gotoAndStop = function (frameNumber) {
    this._current.gotoAndStop(frameNumber);
    return this;
};

/**
 * Goes to a specific frame and begins playing the current MovieClip
 * @method gotoAndPlay
 * @param frameNumber {Number} frame index to start at
 */
PIXI.MovieClipManager.prototype.gotoAndPlay = function(frameNumber)
{
    this._current.gotoAndPlay(frameNumber);
    return this;
};

/**
 * Sets animationSpeed property on current MovieClip
 * @method animationSpeed
 * @param speed {Number}
 */
PIXI.MovieClipManager.prototype.animationSpeed = function(speed)
{
    this._current.animationSpeed = speed;
    return this;
};


/**
 * Sets loop property on current MovieClip
 * @method loop
 * @param isLooped {Boolean}
 */
PIXI.MovieClipManager.prototype.loop = function(isLooped)
{
    this._current.loop = isLooped;
    return this;
};

/**
 * Sets onComplete callback on current MovieClip
 * @method onComplete
 * @param frameNumber {Number} frame index to start at
 */
PIXI.MovieClipManager.prototype.onComplete = function(callback)
{
    this._current.onComplete = callback;
    return this;
};


/**
 * Stops current MovieClip
 * @method stop
 */
PIXI.MovieClipManager.prototype.stop = function () {
    if (this._current) {
        this._current.stop();
    }
    return this;
};

/**
 * Creates new animation with name `name`.
 * @method add
 * @param  name {String}
 * @param  movieClip {MovieClip}
 * @return DisplayObject
 */
PIXI.MovieClipManager.prototype.add = function (name, movieClip) {
    this._animations[name] = movieClip;
    this.addChild(movieClip);
    movieClip.visible = false;
    return this;
};


/**
 * Removes a animation from the container.
 * @method remove
 * @param name {String}
 */
PIXI.MovieClipManager.prototype.remove = function (name) {
    if (this._animations[name] === this._current) {
        this._current.visible = false;
        this._current = undefined;
    }
    delete this._animations[name];
};
