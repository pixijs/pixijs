/*!
 * @pixi/canvas-prepare - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/canvas-prepare is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@pixi/core');
var prepare = require('@pixi/prepare');

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

var CANVAS_START_SIZE = 16;
/**
 * Built-in hook to upload PIXI.Texture objects to the GPU.
 *
 * @private
 * @param {*} prepare - Instance of CanvasPrepare
 * @param {*} item - Item to check
 * @return {boolean} If item was uploaded.
 */
function uploadBaseTextures(prepare, item) {
    var tempPrepare = prepare;
    if (item instanceof core.BaseTexture) {
        var image = item.source;
        // Sometimes images (like atlas images) report a size of zero, causing errors on windows phone.
        // So if the width or height is equal to zero then use the canvas size
        // Otherwise use whatever is smaller, the image dimensions or the canvas dimensions.
        var imageWidth = image.width === 0 ? tempPrepare.canvas.width : Math.min(tempPrepare.canvas.width, image.width);
        var imageHeight = image.height === 0 ? tempPrepare.canvas.height
            : Math.min(tempPrepare.canvas.height, image.height);
        // Only a small subsections is required to be drawn to have the whole texture uploaded to the GPU
        // A smaller draw can be faster.
        tempPrepare.ctx.drawImage(image, 0, 0, imageWidth, imageHeight, 0, 0, tempPrepare.canvas.width, tempPrepare.canvas.height);
        return true;
    }
    return false;
}
/**
 * The prepare manager provides functionality to upload content to the GPU.
 *
 * This cannot be done directly for Canvas like in WebGL, but the effect can be achieved by drawing
 * textures to an offline canvas. This draw call will force the texture to be moved onto the GPU.
 *
 * An instance of this class is automatically created by default, and can be found at `renderer.plugins.prepare`
 *
 * @class
 * @extends PIXI.BasePrepare
 * @memberof PIXI
 */
var CanvasPrepare = /** @class */ (function (_super) {
    __extends(CanvasPrepare, _super);
    /**
     * @param {PIXI.CanvasRenderer} renderer - A reference to the current renderer
     */
    function CanvasPrepare(renderer) {
        var _this = _super.call(this, renderer) || this;
        _this.uploadHookHelper = _this;
        /**
        * An offline canvas to render textures to
        * @type {HTMLCanvasElement}
        * @private
        */
        _this.canvas = document.createElement('canvas');
        _this.canvas.width = CANVAS_START_SIZE;
        _this.canvas.height = CANVAS_START_SIZE;
        /**
         * The context to the canvas
        * @type {CanvasRenderingContext2D}
        * @private
        */
        _this.ctx = _this.canvas.getContext('2d');
        // Add textures to upload
        _this.registerUploadHook(uploadBaseTextures);
        return _this;
    }
    /**
     * Destroys the plugin, don't use after this.
     *
     */
    CanvasPrepare.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.ctx = null;
        this.canvas = null;
    };
    return CanvasPrepare;
}(prepare.BasePrepare));

exports.CanvasPrepare = CanvasPrepare;
//# sourceMappingURL=canvas-prepare.js.map
