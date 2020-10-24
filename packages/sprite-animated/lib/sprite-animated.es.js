/*!
 * @pixi/sprite-animated - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/sprite-animated is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { Ticker, UPDATE_PRIORITY } from '@pixi/ticker';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/**
 * An AnimatedSprite is a simple way to display an animation depicted by a list of textures.
 *
 * ```js
 * let alienImages = ["image_sequence_01.png","image_sequence_02.png","image_sequence_03.png","image_sequence_04.png"];
 * let textureArray = [];
 *
 * for (let i=0; i < 4; i++)
 * {
 *      let texture = PIXI.Texture.from(alienImages[i]);
 *      textureArray.push(texture);
 * };
 *
 * let animatedSprite = new PIXI.AnimatedSprite(textureArray);
 * ```
 *
 * The more efficient and simpler way to create an animated sprite is using a {@link PIXI.Spritesheet}
 * containing the animation definitions:
 *
 * ```js
 * PIXI.Loader.shared.add("assets/spritesheet.json").load(setup);
 *
 * function setup() {
 *   let sheet = PIXI.Loader.shared.resources["assets/spritesheet.json"].spritesheet;
 *   animatedSprite = new PIXI.AnimatedSprite(sheet.animations["image_sequence"]);
 *   ...
 * }
 * ```
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI
 */
var AnimatedSprite = /** @class */ (function (_super) {
    __extends(AnimatedSprite, _super);
    /**
     * @param {PIXI.Texture[]|PIXI.AnimatedSprite.FrameObject[]} textures - An array of {@link PIXI.Texture} or frame
     *  objects that make up the animation.
     * @param {boolean} [autoUpdate=true] - Whether to use PIXI.Ticker.shared to auto update animation time.
     */
    function AnimatedSprite(textures, autoUpdate) {
        if (autoUpdate === void 0) { autoUpdate = true; }
        var _this = _super.call(this, textures[0] instanceof Texture ? textures[0] : textures[0].texture) || this;
        /**
         * @type {PIXI.Texture[]}
         * @private
         */
        _this._textures = null;
        /**
         * @type {number[]}
         * @private
         */
        _this._durations = null;
        /**
         * `true` uses PIXI.Ticker.shared to auto update animation time.
         *
         * @type {boolean}
         * @default true
         * @private
         */
        _this._autoUpdate = autoUpdate;
        /**
         * `true` if the instance is currently connected to PIXI.Ticker.shared to auto update animation time.
         *
         * @type {boolean}
         * @default false
         * @private
         */
        _this._isConnectedToTicker = false;
        /**
         * The speed that the AnimatedSprite will play at. Higher is faster, lower is slower.
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
         * Update anchor to [Texture's defaultAnchor]{@link PIXI.Texture#defaultAnchor} when frame changes.
         *
         * Useful with [sprite sheet animations]{@link PIXI.Spritesheet#animations} created with tools.
         * Changing anchor for each frame allows to pin sprite origin to certain moving feature
         * of the frame (e.g. left foot).
         *
         * Note: Enabling this will override any previously set `anchor` on each frame change.
         *
         * @member {boolean}
         * @default false
         */
        _this.updateAnchor = false;
        /**
         * User-assigned function to call when an AnimatedSprite finishes playing.
         *
         * @example
         * animation.onComplete = function () {
         *   // finished!
         * };
         * @member {Function}
         */
        _this.onComplete = null;
        /**
         * User-assigned function to call when an AnimatedSprite changes which texture is being rendered.
         *
         * @example
         * animation.onFrameChange = function () {
         *   // updated!
         * };
         * @member {Function}
         */
        _this.onFrameChange = null;
        /**
         * User-assigned function to call when `loop` is true, and an AnimatedSprite is played and
         * loops around to start again.
         *
         * @example
         * animation.onLoop = function () {
         *   // looped!
         * };
         * @member {Function}
         */
        _this.onLoop = null;
        /**
         * Elapsed time since animation has been started, used internally to display current texture.
         *
         * @member {number}
         * @private
         */
        _this._currentTime = 0;
        _this._playing = false;
        /**
         * The texture index that was displayed last time
         *
         * @member {number}
         * @private
         */
        _this._previousFrame = null;
        _this.textures = textures;
        return _this;
    }
    /**
     * Stops the AnimatedSprite.
     *
     */
    AnimatedSprite.prototype.stop = function () {
        if (!this._playing) {
            return;
        }
        this._playing = false;
        if (this._autoUpdate && this._isConnectedToTicker) {
            Ticker.shared.remove(this.update, this);
            this._isConnectedToTicker = false;
        }
    };
    /**
     * Plays the AnimatedSprite.
     *
     */
    AnimatedSprite.prototype.play = function () {
        if (this._playing) {
            return;
        }
        this._playing = true;
        if (this._autoUpdate && !this._isConnectedToTicker) {
            Ticker.shared.add(this.update, this, UPDATE_PRIORITY.HIGH);
            this._isConnectedToTicker = true;
        }
    };
    /**
     * Stops the AnimatedSprite and goes to a specific frame.
     *
     * @param {number} frameNumber - Frame index to stop at.
     */
    AnimatedSprite.prototype.gotoAndStop = function (frameNumber) {
        this.stop();
        var previousFrame = this.currentFrame;
        this._currentTime = frameNumber;
        if (previousFrame !== this.currentFrame) {
            this.updateTexture();
        }
    };
    /**
     * Goes to a specific frame and begins playing the AnimatedSprite.
     *
     * @param {number} frameNumber - Frame index to start at.
     */
    AnimatedSprite.prototype.gotoAndPlay = function (frameNumber) {
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
     * @param {number} deltaTime - Time since last tick.
     */
    AnimatedSprite.prototype.update = function (deltaTime) {
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
        }
        else {
            this._currentTime += elapsed;
        }
        if (this._currentTime < 0 && !this.loop) {
            this.gotoAndStop(0);
            if (this.onComplete) {
                this.onComplete();
            }
        }
        else if (this._currentTime >= this._textures.length && !this.loop) {
            this.gotoAndStop(this._textures.length - 1);
            if (this.onComplete) {
                this.onComplete();
            }
        }
        else if (previousFrame !== this.currentFrame) {
            if (this.loop && this.onLoop) {
                if (this.animationSpeed > 0 && this.currentFrame < previousFrame) {
                    this.onLoop();
                }
                else if (this.animationSpeed < 0 && this.currentFrame > previousFrame) {
                    this.onLoop();
                }
            }
            this.updateTexture();
        }
    };
    /**
     * Updates the displayed texture to match the current frame index.
     *
     * @private
     */
    AnimatedSprite.prototype.updateTexture = function () {
        var currentFrame = this.currentFrame;
        if (this._previousFrame === currentFrame) {
            return;
        }
        this._previousFrame = currentFrame;
        this._texture = this._textures[currentFrame];
        this._textureID = -1;
        this._textureTrimmedID = -1;
        this._cachedTint = 0xFFFFFF;
        this.uvs = this._texture._uvs.uvsFloat32;
        if (this.updateAnchor) {
            this._anchor.copyFrom(this._texture.defaultAnchor);
        }
        if (this.onFrameChange) {
            this.onFrameChange(this.currentFrame);
        }
    };
    /**
     * Stops the AnimatedSprite and destroys it.
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value.
     * @param {boolean} [options.children=false] - If set to true, all the children will have their destroy
     *      method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the sprite as well.
     * @param {boolean} [options.baseTexture=false] - Should it destroy the base texture of the sprite as well.
     */
    AnimatedSprite.prototype.destroy = function (options) {
        this.stop();
        _super.prototype.destroy.call(this, options);
        this.onComplete = null;
        this.onFrameChange = null;
        this.onLoop = null;
    };
    /**
     * A short hand way of creating an AnimatedSprite from an array of frame ids.
     *
     * @static
     * @param {string[]} frames - The array of frames ids the AnimatedSprite will use as its texture frames.
     * @return {PIXI.AnimatedSprite} The new animated sprite with the specified frames.
     */
    AnimatedSprite.fromFrames = function (frames) {
        var textures = [];
        for (var i = 0; i < frames.length; ++i) {
            textures.push(Texture.from(frames[i]));
        }
        return new AnimatedSprite(textures);
    };
    /**
     * A short hand way of creating an AnimatedSprite from an array of image ids.
     *
     * @static
     * @param {string[]} images - The array of image urls the AnimatedSprite will use as its texture frames.
     * @return {PIXI.AnimatedSprite} The new animate sprite with the specified images as frames.
     */
    AnimatedSprite.fromImages = function (images) {
        var textures = [];
        for (var i = 0; i < images.length; ++i) {
            textures.push(Texture.from(images[i]));
        }
        return new AnimatedSprite(textures);
    };
    Object.defineProperty(AnimatedSprite.prototype, "totalFrames", {
        /**
         * The total number of frames in the AnimatedSprite. This is the same as number of textures
         * assigned to the AnimatedSprite.
         *
         * @readonly
         * @member {number}
         * @default 0
         */
        get: function () {
            return this._textures.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnimatedSprite.prototype, "textures", {
        /**
         * The array of textures used for this AnimatedSprite.
         *
         * @member {PIXI.Texture[]}
         */
        get: function () {
            return this._textures;
        },
        set: function (value) {
            if (value[0] instanceof Texture) {
                this._textures = value;
                this._durations = null;
            }
            else {
                this._textures = [];
                this._durations = [];
                for (var i = 0; i < value.length; i++) {
                    this._textures.push(value[i].texture);
                    this._durations.push(value[i].time);
                }
            }
            this._previousFrame = null;
            this.gotoAndStop(0);
            this.updateTexture();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnimatedSprite.prototype, "currentFrame", {
        /**
        * The AnimatedSprites current frame index.
        *
        * @member {number}
        * @readonly
        */
        get: function () {
            var currentFrame = Math.floor(this._currentTime) % this._textures.length;
            if (currentFrame < 0) {
                currentFrame += this._textures.length;
            }
            return currentFrame;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnimatedSprite.prototype, "playing", {
        /**
         * Indicates if the AnimatedSprite is currently playing.
         *
         * @member {boolean}
         * @readonly
         */
        get: function () {
            return this._playing;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnimatedSprite.prototype, "autoUpdate", {
        /**
         * Whether to use PIXI.Ticker.shared to auto update animation time
         *
         * @member {boolean}
         */
        get: function () {
            return this._autoUpdate;
        },
        set: function (value) {
            if (value !== this._autoUpdate) {
                this._autoUpdate = value;
                if (!this._autoUpdate && this._isConnectedToTicker) {
                    Ticker.shared.remove(this.update, this);
                    this._isConnectedToTicker = false;
                }
                else if (this._autoUpdate && !this._isConnectedToTicker && this._playing) {
                    Ticker.shared.add(this.update, this);
                    this._isConnectedToTicker = true;
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    return AnimatedSprite;
}(Sprite));
/**
 * @memberof PIXI.AnimatedSprite
 * @typedef {object} FrameObject
 * @type {object}
 * @property {PIXI.Texture} texture - The {@link PIXI.Texture} of the frame
 * @property {number} time - the duration of the frame in ms
 */

export { AnimatedSprite };
//# sourceMappingURL=sprite-animated.es.js.map
