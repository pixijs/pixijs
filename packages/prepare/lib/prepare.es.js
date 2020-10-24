/*!
 * @pixi/prepare - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/prepare is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { settings } from '@pixi/settings';
import { Texture, BaseTexture } from '@pixi/core';
import { Graphics } from '@pixi/graphics';
import { Ticker, UPDATE_PRIORITY } from '@pixi/ticker';
import { Container } from '@pixi/display';
import { Text, TextStyle, TextMetrics } from '@pixi/text';

/**
 * Default number of uploads per frame using prepare plugin.
 *
 * @static
 * @memberof PIXI.settings
 * @name UPLOADS_PER_FRAME
 * @type {number}
 * @default 4
 */
settings.UPLOADS_PER_FRAME = 4;

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
 * CountLimiter limits the number of items handled by a {@link PIXI.BasePrepare} to a specified
 * number of items per frame.
 *
 * @class
 * @memberof PIXI
 */
var CountLimiter = /** @class */ (function () {
    /**
     * @param {number} maxItemsPerFrame - The maximum number of items that can be prepared each frame.
     */
    function CountLimiter(maxItemsPerFrame) {
        /**
         * The maximum number of items that can be prepared each frame.
         * @type {number}
         * @private
         */
        this.maxItemsPerFrame = maxItemsPerFrame;
        /**
         * The number of items that can be prepared in the current frame.
         * @type {number}
         * @private
         */
        this.itemsLeft = 0;
    }
    /**
     * Resets any counting properties to start fresh on a new frame.
     */
    CountLimiter.prototype.beginFrame = function () {
        this.itemsLeft = this.maxItemsPerFrame;
    };
    /**
     * Checks to see if another item can be uploaded. This should only be called once per item.
     * @return {boolean} If the item is allowed to be uploaded.
     */
    CountLimiter.prototype.allowedToUpload = function () {
        return this.itemsLeft-- > 0;
    };
    return CountLimiter;
}());

/**
 * Built-in hook to find multiple textures from objects like AnimatedSprites.
 *
 * @private
 * @param {PIXI.DisplayObject} item - Display object to check
 * @param {Array<*>} queue - Collection of items to upload
 * @return {boolean} if a PIXI.Texture object was found.
 */
function findMultipleBaseTextures(item, queue) {
    var result = false;
    // Objects with multiple textures
    if (item && item._textures && item._textures.length) {
        for (var i = 0; i < item._textures.length; i++) {
            if (item._textures[i] instanceof Texture) {
                var baseTexture = item._textures[i].baseTexture;
                if (queue.indexOf(baseTexture) === -1) {
                    queue.push(baseTexture);
                    result = true;
                }
            }
        }
    }
    return result;
}
/**
 * Built-in hook to find BaseTextures from Texture.
 *
 * @private
 * @param {PIXI.Texture} item - Display object to check
 * @param {Array<*>} queue - Collection of items to upload
 * @return {boolean} if a PIXI.Texture object was found.
 */
function findBaseTexture(item, queue) {
    if (item.baseTexture instanceof BaseTexture) {
        var texture = item.baseTexture;
        if (queue.indexOf(texture) === -1) {
            queue.push(texture);
        }
        return true;
    }
    return false;
}
/**
 * Built-in hook to find textures from objects.
 *
 * @private
 * @param {PIXI.DisplayObject} item - Display object to check
 * @param {Array<*>} queue - Collection of items to upload
 * @return {boolean} if a PIXI.Texture object was found.
 */
function findTexture(item, queue) {
    if (item._texture && item._texture instanceof Texture) {
        var texture = item._texture.baseTexture;
        if (queue.indexOf(texture) === -1) {
            queue.push(texture);
        }
        return true;
    }
    return false;
}
/**
 * Built-in hook to draw PIXI.Text to its texture.
 *
 * @private
 * @param {PIXI.AbstractRenderer|PIXI.BasePrepare} helper - Not used by this upload handler
 * @param {PIXI.DisplayObject} item - Item to check
 * @return {boolean} If item was uploaded.
 */
function drawText(_helper, item) {
    if (item instanceof Text) {
        // updating text will return early if it is not dirty
        item.updateText(true);
        return true;
    }
    return false;
}
/**
 * Built-in hook to calculate a text style for a PIXI.Text object.
 *
 * @private
 * @param {PIXI.AbstractRenderer|PIXI.BasePrepare} helper - Not used by this upload handler
 * @param {PIXI.DisplayObject} item - Item to check
 * @return {boolean} If item was uploaded.
 */
function calculateTextStyle(_helper, item) {
    if (item instanceof TextStyle) {
        var font = item.toFontString();
        TextMetrics.measureFont(font);
        return true;
    }
    return false;
}
/**
 * Built-in hook to find Text objects.
 *
 * @private
 * @param {PIXI.DisplayObject} item - Display object to check
 * @param {Array<*>} queue - Collection of items to upload
 * @return {boolean} if a PIXI.Text object was found.
 */
function findText(item, queue) {
    if (item instanceof Text) {
        // push the text style to prepare it - this can be really expensive
        if (queue.indexOf(item.style) === -1) {
            queue.push(item.style);
        }
        // also push the text object so that we can render it (to canvas/texture) if needed
        if (queue.indexOf(item) === -1) {
            queue.push(item);
        }
        // also push the Text's texture for upload to GPU
        var texture = item._texture.baseTexture;
        if (queue.indexOf(texture) === -1) {
            queue.push(texture);
        }
        return true;
    }
    return false;
}
/**
 * Built-in hook to find TextStyle objects.
 *
 * @private
 * @param {PIXI.TextStyle} item - Display object to check
 * @param {Array<*>} queue - Collection of items to upload
 * @return {boolean} if a PIXI.TextStyle object was found.
 */
function findTextStyle(item, queue) {
    if (item instanceof TextStyle) {
        if (queue.indexOf(item) === -1) {
            queue.push(item);
        }
        return true;
    }
    return false;
}
/**
 * The prepare manager provides functionality to upload content to the GPU.
 *
 * BasePrepare handles basic queuing functionality and is extended by
 * {@link PIXI.Prepare} and {@link PIXI.CanvasPrepare}
 * to provide preparation capabilities specific to their respective renderers.
 *
 * @example
 * // Create a sprite
 * const sprite = PIXI.Sprite.from('something.png');
 *
 * // Load object into GPU
 * app.renderer.plugins.prepare.upload(sprite, () => {
 *
 *     //Texture(s) has been uploaded to GPU
 *     app.stage.addChild(sprite);
 *
 * })
 *
 * @abstract
 * @class
 * @memberof PIXI
 */
var BasePrepare = /** @class */ (function () {
    /**
     * @param {PIXI.AbstractRenderer} renderer - A reference to the current renderer
     */
    function BasePrepare(renderer) {
        var _this = this;
        /**
         * The limiter to be used to control how quickly items are prepared.
         * @type {PIXI.CountLimiter|PIXI.TimeLimiter}
         */
        this.limiter = new CountLimiter(settings.UPLOADS_PER_FRAME);
        /**
         * Reference to the renderer.
         * @type {PIXI.AbstractRenderer}
         * @protected
         */
        this.renderer = renderer;
        /**
         * The only real difference between CanvasPrepare and Prepare is what they pass
         * to upload hooks. That different parameter is stored here.
         * @type {object}
         * @protected
         */
        this.uploadHookHelper = null;
        /**
         * Collection of items to uploads at once.
         * @type {Array<*>}
         * @private
         */
        this.queue = [];
        /**
         * Collection of additional hooks for finding assets.
         * @type {Array<Function>}
         * @private
         */
        this.addHooks = [];
        /**
         * Collection of additional hooks for processing assets.
         * @type {Array<Function>}
         * @private
         */
        this.uploadHooks = [];
        /**
         * Callback to call after completed.
         * @type {Array<Function>}
         * @private
         */
        this.completes = [];
        /**
         * If prepare is ticking (running).
         * @type {boolean}
         * @private
         */
        this.ticking = false;
        /**
         * 'bound' call for prepareItems().
         * @type {Function}
         * @private
         */
        this.delayedTick = function () {
            // unlikely, but in case we were destroyed between tick() and delayedTick()
            if (!_this.queue) {
                return;
            }
            _this.prepareItems();
        };
        // hooks to find the correct texture
        this.registerFindHook(findText);
        this.registerFindHook(findTextStyle);
        this.registerFindHook(findMultipleBaseTextures);
        this.registerFindHook(findBaseTexture);
        this.registerFindHook(findTexture);
        // upload hooks
        this.registerUploadHook(drawText);
        this.registerUploadHook(calculateTextStyle);
    }
    /**
     * Upload all the textures and graphics to the GPU.
     *
     * @param {Function|PIXI.DisplayObject|PIXI.Container|PIXI.BaseTexture|PIXI.Texture|PIXI.Graphics|PIXI.Text} item -
     *        Either the container or display object to search for items to upload, the items to upload themselves,
     *        or the callback function, if items have been added using `prepare.add`.
     * @param {Function} [done] - Optional callback when all queued uploads have completed
     */
    BasePrepare.prototype.upload = function (item, done) {
        if (typeof item === 'function') {
            done = item;
            item = null;
        }
        // If a display object, search for items
        // that we could upload
        if (item) {
            this.add(item);
        }
        // Get the items for upload from the display
        if (this.queue.length) {
            if (done) {
                this.completes.push(done);
            }
            if (!this.ticking) {
                this.ticking = true;
                Ticker.system.addOnce(this.tick, this, UPDATE_PRIORITY.UTILITY);
            }
        }
        else if (done) {
            done();
        }
    };
    /**
     * Handle tick update
     *
     * @private
     */
    BasePrepare.prototype.tick = function () {
        setTimeout(this.delayedTick, 0);
    };
    /**
     * Actually prepare items. This is handled outside of the tick because it will take a while
     * and we do NOT want to block the current animation frame from rendering.
     *
     * @private
     */
    BasePrepare.prototype.prepareItems = function () {
        this.limiter.beginFrame();
        // Upload the graphics
        while (this.queue.length && this.limiter.allowedToUpload()) {
            var item = this.queue[0];
            var uploaded = false;
            if (item && !item._destroyed) {
                for (var i = 0, len = this.uploadHooks.length; i < len; i++) {
                    if (this.uploadHooks[i](this.uploadHookHelper, item)) {
                        this.queue.shift();
                        uploaded = true;
                        break;
                    }
                }
            }
            if (!uploaded) {
                this.queue.shift();
            }
        }
        // We're finished
        if (!this.queue.length) {
            this.ticking = false;
            var completes = this.completes.slice(0);
            this.completes.length = 0;
            for (var i = 0, len = completes.length; i < len; i++) {
                completes[i]();
            }
        }
        else {
            // if we are not finished, on the next rAF do this again
            Ticker.system.addOnce(this.tick, this, UPDATE_PRIORITY.UTILITY);
        }
    };
    /**
     * Adds hooks for finding items.
     *
     * @param {Function} addHook - Function call that takes two parameters: `item:*, queue:Array`
     *          function must return `true` if it was able to add item to the queue.
     * @return {this} Instance of plugin for chaining.
     */
    BasePrepare.prototype.registerFindHook = function (addHook) {
        if (addHook) {
            this.addHooks.push(addHook);
        }
        return this;
    };
    /**
     * Adds hooks for uploading items.
     *
     * @param {Function} uploadHook - Function call that takes two parameters: `prepare:CanvasPrepare, item:*` and
     *          function must return `true` if it was able to handle upload of item.
     * @return {this} Instance of plugin for chaining.
     */
    BasePrepare.prototype.registerUploadHook = function (uploadHook) {
        if (uploadHook) {
            this.uploadHooks.push(uploadHook);
        }
        return this;
    };
    /**
     * Manually add an item to the uploading queue.
     *
     * @param {PIXI.DisplayObject|PIXI.Container|PIXI.BaseTexture|PIXI.Texture|PIXI.Graphics|PIXI.Text|*} item - Object to
     *        add to the queue
     * @return {this} Instance of plugin for chaining.
     */
    BasePrepare.prototype.add = function (item) {
        // Add additional hooks for finding elements on special
        // types of objects that
        for (var i = 0, len = this.addHooks.length; i < len; i++) {
            if (this.addHooks[i](item, this.queue)) {
                break;
            }
        }
        // Get children recursively
        if (item instanceof Container) {
            for (var i = item.children.length - 1; i >= 0; i--) {
                this.add(item.children[i]);
            }
        }
        return this;
    };
    /**
     * Destroys the plugin, don't use after this.
     *
     */
    BasePrepare.prototype.destroy = function () {
        if (this.ticking) {
            Ticker.system.remove(this.tick, this);
        }
        this.ticking = false;
        this.addHooks = null;
        this.uploadHooks = null;
        this.renderer = null;
        this.completes = null;
        this.queue = null;
        this.limiter = null;
        this.uploadHookHelper = null;
    };
    return BasePrepare;
}());

/**
 * Built-in hook to upload PIXI.Texture objects to the GPU.
 *
 * @private
 * @param {PIXI.Renderer} renderer - instance of the webgl renderer
 * @param {PIXI.BaseTexture} item - Item to check
 * @return {boolean} If item was uploaded.
 */
function uploadBaseTextures(renderer, item) {
    if (item instanceof BaseTexture) {
        // if the texture already has a GL texture, then the texture has been prepared or rendered
        // before now. If the texture changed, then the changer should be calling texture.update() which
        // reuploads the texture without need for preparing it again
        if (!item._glTextures[renderer.CONTEXT_UID]) {
            renderer.texture.bind(item);
        }
        return true;
    }
    return false;
}
/**
 * Built-in hook to upload PIXI.Graphics to the GPU.
 *
 * @private
 * @param {PIXI.Renderer} renderer - instance of the webgl renderer
 * @param {PIXI.DisplayObject} item - Item to check
 * @return {boolean} If item was uploaded.
 */
function uploadGraphics(renderer, item) {
    if (!(item instanceof Graphics)) {
        return false;
    }
    var geometry = item.geometry;
    // update dirty graphics to get batches
    item.finishPoly();
    geometry.updateBatches();
    var batches = geometry.batches;
    // upload all textures found in styles
    for (var i = 0; i < batches.length; i++) {
        var texture = batches[i].style.texture;
        if (texture) {
            uploadBaseTextures(renderer, texture.baseTexture);
        }
    }
    // if its not batchable - update vao for particular shader
    if (!geometry.batchable) {
        renderer.geometry.bind(geometry, item._resolveDirectShader(renderer));
    }
    return true;
}
/**
 * Built-in hook to find graphics.
 *
 * @private
 * @param {PIXI.DisplayObject} item - Display object to check
 * @param {Array<*>} queue - Collection of items to upload
 * @return {boolean} if a PIXI.Graphics object was found.
 */
function findGraphics(item, queue) {
    if (item instanceof Graphics) {
        queue.push(item);
        return true;
    }
    return false;
}
/**
 * The prepare plugin provides renderer-specific plugins for pre-rendering DisplayObjects. These plugins are useful for
 * asynchronously preparing and uploading to the GPU assets, textures, graphics waiting to be displayed.
 *
 * Do not instantiate this plugin directly. It is available from the `renderer.plugins` property.
 * See {@link PIXI.CanvasRenderer#plugins} or {@link PIXI.Renderer#plugins}.
 * @example
 * // Create a new application
 * const app = new PIXI.Application();
 * document.body.appendChild(app.view);
 *
 * // Don't start rendering right away
 * app.stop();
 *
 * // create a display object
 * const rect = new PIXI.Graphics()
 *     .beginFill(0x00ff00)
 *     .drawRect(40, 40, 200, 200);
 *
 * // Add to the stage
 * app.stage.addChild(rect);
 *
 * // Don't start rendering until the graphic is uploaded to the GPU
 * app.renderer.plugins.prepare.upload(app.stage, () => {
 *     app.start();
 * });
 *
 * @class
 * @extends PIXI.BasePrepare
 * @memberof PIXI
 */
var Prepare = /** @class */ (function (_super) {
    __extends(Prepare, _super);
    /**
     * @param {PIXI.Renderer} renderer - A reference to the current renderer
     */
    function Prepare(renderer) {
        var _this = _super.call(this, renderer) || this;
        _this.uploadHookHelper = _this.renderer;
        // Add textures and graphics to upload
        _this.registerFindHook(findGraphics);
        _this.registerUploadHook(uploadBaseTextures);
        _this.registerUploadHook(uploadGraphics);
        return _this;
    }
    return Prepare;
}(BasePrepare));

/**
 * TimeLimiter limits the number of items handled by a {@link PIXI.BasePrepare} to a specified
 * number of milliseconds per frame.
 *
 * @class
 * @memberof PIXI
 */
var TimeLimiter = /** @class */ (function () {
    /**
     * @param {number} maxMilliseconds - The maximum milliseconds that can be spent preparing items each frame.
     */
    function TimeLimiter(maxMilliseconds) {
        /**
         * The maximum milliseconds that can be spent preparing items each frame.
         * @type {number}
         * @private
         */
        this.maxMilliseconds = maxMilliseconds;
        /**
         * The start time of the current frame.
         * @type {number}
         * @private
         */
        this.frameStart = 0;
    }
    /**
     * Resets any counting properties to start fresh on a new frame.
     */
    TimeLimiter.prototype.beginFrame = function () {
        this.frameStart = Date.now();
    };
    /**
     * Checks to see if another item can be uploaded. This should only be called once per item.
     * @return {boolean} If the item is allowed to be uploaded.
     */
    TimeLimiter.prototype.allowedToUpload = function () {
        return Date.now() - this.frameStart < this.maxMilliseconds;
    };
    return TimeLimiter;
}());

export { BasePrepare, CountLimiter, Prepare, TimeLimiter };
//# sourceMappingURL=prepare.es.js.map
