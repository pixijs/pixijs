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
};

PIXI.MovieClipManager.constructor = PIXI.MovieClipManager;
PIXI.MovieClipManager.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

/**
 * Changes movieClip to another
 * @method swap
 * @param  name {String}
 * @return DisplayObject
 */
PIXI.Layers.prototype.swap = function (name) {
    if (this._current) {
        this._current.stop();
        this.removeChild(this._current);
    }
    this._current = this._animations[name];
    this.addChild(this._current);
    return this;
};

/**
 * Plays movieClip with name `name`
 * @method play
 * @param  name {String}
 * @return DisplayObject
 */
PIXI.Layers.prototype.play = function (name) {
    this._current.play();
    return this;
};

/**
 * Stops current MovieClip
 * @method stop
 */
PIXI.Layers.prototype.stop = function () {
    this._current.stop();
    return this;
};

/**
 * Creates new animation with name `name`.
 * @method add
 * @param  name {String}
 * @param  movieClip {MovieClip}
 * @return DisplayObject
 */
PIXI.Layers.prototype.add = function (name, movieClip) {
    this._animations[name] = movieClip;
    return this;
};


/**
 * Removes a animation from the container.
 * @method remove
 * @param name {String}
 */
PIXI.Layers.prototype.remove = function (name) {
    delete this._animations[name];
};
