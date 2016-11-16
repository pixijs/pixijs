'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('../core');

var core = _interopRequireWildcard(_core);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @typedef FrameObject
 * @type {object}
 * @property {PIXI.Texture} texture - The {@link PIXI.Texture} of the frame
 * @property {number} time - the duration of the frame in ms
 */

/**
 * An AnimatedSprite is a simple way to display an animation depicted by a list of textures.
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
 * let mc = new PIXI.AnimatedSprite(textureArray);
 * ```
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI.extras
 */
var AnimatedSprite = function (_core$Sprite) {
    _inherits(AnimatedSprite, _core$Sprite);

    /**
     * @param {PIXI.Texture[]|FrameObject[]} textures - an array of {@link PIXI.Texture} or frame
     *  objects that make up the animation
     */
    function AnimatedSprite(textures) {
        _classCallCheck(this, AnimatedSprite);

        /**
         * @private
         */
        var _this = _possibleConstructorReturn(this, _core$Sprite.call(this, textures[0] instanceof core.Texture ? textures[0] : textures[0].texture));

        _this._textures = null;

        /**
         * @private
         */
        _this._durations = null;

        _this.textures = textures;

        /**
         * The speed that the AnimatedSprite will play at. Higher is faster, lower is slower
         *
         * @member {number}
         * @default 1
         */
        _this.animationSpeed = 1;

        /**
         * Whether or not the animate sprite repeats after playing.
         *
         * @member {boolean}
         * @default true
         */
        _this.loop = true;

        /**
         * Function to call when a AnimatedSprite finishes playing
         *
         * @method
         * @memberof PIXI.extras.AnimatedSprite#
         */
        _this.onComplete = null;

        /**
         * Function to call when a AnimatedSprite changes which texture is being rendered
         *
         * @method
         * @memberof PIXI.extras.AnimatedSprite#
         */
        _this.onFrameChange = null;

        /**
         * Elapsed time since animation has been started, used internally to display current texture
         *
         * @member {number}
         * @private
         */
        _this._currentTime = 0;

        /**
         * Indicates if the AnimatedSprite is currently playing
         *
         * @member {boolean}
         * @readonly
         */
        _this.playing = false;
        return _this;
    }

    /**
     * Stops the AnimatedSprite
     *
     */


    AnimatedSprite.prototype.stop = function stop() {
        if (!this.playing) {
            return;
        }

        this.playing = false;
        core.ticker.shared.remove(this.update, this);
    };

    /**
     * Plays the AnimatedSprite
     *
     */


    AnimatedSprite.prototype.play = function play() {
        if (this.playing) {
            return;
        }

        this.playing = true;
        core.ticker.shared.add(this.update, this);
    };

    /**
     * Stops the AnimatedSprite and goes to a specific frame
     *
     * @param {number} frameNumber - frame index to stop at
     */


    AnimatedSprite.prototype.gotoAndStop = function gotoAndStop(frameNumber) {
        this.stop();

        var previousFrame = this.currentFrame;

        this._currentTime = frameNumber;

        if (previousFrame !== this.currentFrame) {
            this.updateTexture();
        }
    };

    /**
     * Goes to a specific frame and begins playing the AnimatedSprite
     *
     * @param {number} frameNumber - frame index to start at
     */


    AnimatedSprite.prototype.gotoAndPlay = function gotoAndPlay(frameNumber) {
        var previousFrame = this.currentFrame;

        this._currentTime = frameNumber;

        if (previousFrame !== this.currentFrame) {
            this.updateTexture();
        }

        this.play();
    };

    /**
     * Updates the object transform for rendering.
     *
     * @private
     * @param {number} deltaTime - Time since last tick.
     */


    AnimatedSprite.prototype.update = function update(deltaTime) {
        var elapsed = this.animationSpeed * deltaTime;
        var previousFrame = this.currentFrame;

        if (this._durations !== null) {
            var lag = this._currentTime % 1 * this._durations[this.currentFrame];

            lag += elapsed / 60 * 1000;

            while (lag < 0) {
                this._currentTime--;
                lag += this._durations[this.currentFrame];
            }

            var sign = Math.sign(this.animationSpeed * deltaTime);

            this._currentTime = Math.floor(this._currentTime);

            while (lag >= this._durations[this.currentFrame]) {
                lag -= this._durations[this.currentFrame] * sign;
                this._currentTime += sign;
            }

            this._currentTime += lag / this._durations[this.currentFrame];
        } else {
            this._currentTime += elapsed;
        }

        if (this._currentTime < 0 && !this.loop) {
            this.gotoAndStop(0);

            if (this.onComplete) {
                this.onComplete();
            }
        } else if (this._currentTime >= this._textures.length && !this.loop) {
            this.gotoAndStop(this._textures.length - 1);

            if (this.onComplete) {
                this.onComplete();
            }
        } else if (previousFrame !== this.currentFrame) {
            this.updateTexture();
        }
    };

    /**
     * Updates the displayed texture to match the current frame index
     *
     * @private
     */


    AnimatedSprite.prototype.updateTexture = function updateTexture() {
        this._texture = this._textures[this.currentFrame];
        this._textureID = -1;

        if (this.onFrameChange) {
            this.onFrameChange(this.currentFrame);
        }
    };

    /**
     * Stops the AnimatedSprite and destroys it
     *
     */


    AnimatedSprite.prototype.destroy = function destroy() {
        this.stop();
        _core$Sprite.prototype.destroy.call(this);
    };

    /**
     * A short hand way of creating a movieclip from an array of frame ids
     *
     * @static
     * @param {string[]} frames - The array of frames ids the movieclip will use as its texture frames
     * @return {AnimatedSprite} The new animated sprite with the specified frames.
     */


    AnimatedSprite.fromFrames = function fromFrames(frames) {
        var textures = [];

        for (var i = 0; i < frames.length; ++i) {
            textures.push(core.Texture.fromFrame(frames[i]));
        }

        return new AnimatedSprite(textures);
    };

    /**
     * A short hand way of creating a movieclip from an array of image ids
     *
     * @static
     * @param {string[]} images - the array of image urls the movieclip will use as its texture frames
     * @return {AnimatedSprite} The new animate sprite with the specified images as frames.
     */


    AnimatedSprite.fromImages = function fromImages(images) {
        var textures = [];

        for (var i = 0; i < images.length; ++i) {
            textures.push(core.Texture.fromImage(images[i]));
        }

        return new AnimatedSprite(textures);
    };

    /**
     * totalFrames is the total number of frames in the AnimatedSprite. This is the same as number of textures
     * assigned to the AnimatedSprite.
     *
     * @readonly
     * @member {number}
     * @memberof PIXI.extras.AnimatedSprite#
     * @default 0
     */


    _createClass(AnimatedSprite, [{
        key: 'totalFrames',
        get: function get() {
            return this._textures.length;
        }

        /**
         * The array of textures used for this AnimatedSprite
         *
         * @member {PIXI.Texture[]}
         * @memberof PIXI.extras.AnimatedSprite#
         */

    }, {
        key: 'textures',
        get: function get() {
            return this._textures;
        }

        /**
         * Sets the textures.
         *
         * @param {PIXI.Texture[]} value - The texture to set.
         */
        ,
        set: function set(value) {
            if (value[0] instanceof core.Texture) {
                this._textures = value;
                this._durations = null;
            } else {
                this._textures = [];
                this._durations = [];

                for (var i = 0; i < value.length; i++) {
                    this._textures.push(value[i].texture);
                    this._durations.push(value[i].time);
                }
            }
        }

        /**
        * The AnimatedSprites current frame index
        *
        * @member {number}
        * @memberof PIXI.extras.AnimatedSprite#
        * @readonly
        */

    }, {
        key: 'currentFrame',
        get: function get() {
            var currentFrame = Math.floor(this._currentTime) % this._textures.length;

            if (currentFrame < 0) {
                currentFrame += this._textures.length;
            }

            return currentFrame;
        }
    }]);

    return AnimatedSprite;
}(core.Sprite);

exports.default = AnimatedSprite;
//# sourceMappingURL=AnimatedSprite.js.map