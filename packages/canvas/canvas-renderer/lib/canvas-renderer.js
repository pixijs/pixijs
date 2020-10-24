/*!
 * @pixi/canvas-renderer - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/canvas-renderer is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@pixi/core');
var utils = require('@pixi/utils');
var math = require('@pixi/math');
var constants = require('@pixi/constants');
var settings = require('@pixi/settings');

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
 * A set of functions used to handle masking.
 *
 * Sprite masking is not supported on the CanvasRenderer.
 *
 * @class
 * @memberof PIXI
 */
var CanvasMaskManager = /** @class */ (function () {
    /**
     * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
     */
    function CanvasMaskManager(renderer) {
        this.renderer = renderer;
        this._foundShapes = [];
    }
    /**
     * This method adds it to the current stack of masks.
     *
     * @param {PIXI.MaskData | PIXI.Graphics} maskData - the maskData that will be pushed
     */
    CanvasMaskManager.prototype.pushMask = function (maskData) {
        var renderer = this.renderer;
        var maskObject = (maskData.maskObject || maskData);
        renderer.context.save();
        // TODO support sprite alpha masks??
        // lots of effort required. If demand is great enough..
        var foundShapes = this._foundShapes;
        this.recursiveFindShapes(maskObject, foundShapes);
        if (foundShapes.length > 0) {
            var context = renderer.context;
            context.beginPath();
            for (var i = 0; i < foundShapes.length; i++) {
                var shape = foundShapes[i];
                var transform = shape.transform.worldTransform;
                this.renderer.setContextTransform(transform);
                this.renderGraphicsShape(shape);
            }
            foundShapes.length = 0;
            context.clip();
        }
    };
    /**
     * Renders all PIXI.Graphics shapes in a subtree.
     *
     * @param {PIXI.Container} container - container to scan.
     * @param {PIXI.Graphics[]} out - where to put found shapes
     */
    CanvasMaskManager.prototype.recursiveFindShapes = function (container, out) {
        if (container.geometry && container.geometry.graphicsData) {
            out.push(container);
        }
        var children = container.children;
        if (children) {
            for (var i = 0; i < children.length; i++) {
                this.recursiveFindShapes(children[i], out);
            }
        }
    };
    /**
     * Renders a PIXI.Graphics shape.
     *
     * @param {PIXI.Graphics} graphics - The object to render.
     */
    CanvasMaskManager.prototype.renderGraphicsShape = function (graphics) {
        graphics.finishPoly();
        var context = this.renderer.context;
        var graphicsData = graphics.geometry.graphicsData;
        var len = graphicsData.length;
        if (len === 0) {
            return;
        }
        for (var i = 0; i < len; i++) {
            var data = graphicsData[i];
            var shape = data.shape;
            if (shape.type === math.SHAPES.POLY) {
                var points = shape.points;
                context.moveTo(points[0], points[1]);
                for (var j = 1; j < points.length / 2; j++) {
                    context.lineTo(points[j * 2], points[(j * 2) + 1]);
                }
                // if the first and last point are the same close the path - much neater :)
                if (points[0] === points[points.length - 2] && points[1] === points[points.length - 1]) {
                    context.closePath();
                }
            }
            else if (shape.type === math.SHAPES.RECT) {
                context.rect(shape.x, shape.y, shape.width, shape.height);
                context.closePath();
            }
            else if (shape.type === math.SHAPES.CIRC) {
                // TODO - need to be Undefined!
                context.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
                context.closePath();
            }
            else if (shape.type === math.SHAPES.ELIP) {
                // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
                var w = shape.width * 2;
                var h = shape.height * 2;
                var x = shape.x - (w / 2);
                var y = shape.y - (h / 2);
                var kappa = 0.5522848;
                var ox = (w / 2) * kappa; // control point offset horizontal
                var oy = (h / 2) * kappa; // control point offset vertical
                var xe = x + w; // x-end
                var ye = y + h; // y-end
                var xm = x + (w / 2); // x-middle
                var ym = y + (h / 2); // y-middle
                context.moveTo(x, ym);
                context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
                context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
                context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
                context.closePath();
            }
            else if (shape.type === math.SHAPES.RREC) {
                var rx = shape.x;
                var ry = shape.y;
                var width = shape.width;
                var height = shape.height;
                var radius = shape.radius;
                var maxRadius = Math.min(width, height) / 2 | 0;
                radius = radius > maxRadius ? maxRadius : radius;
                context.moveTo(rx, ry + radius);
                context.lineTo(rx, ry + height - radius);
                context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height);
                context.lineTo(rx + width - radius, ry + height);
                context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius);
                context.lineTo(rx + width, ry + radius);
                context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry);
                context.lineTo(rx + radius, ry);
                context.quadraticCurveTo(rx, ry, rx, ry + radius);
                context.closePath();
            }
        }
    };
    /**
     * Restores the current drawing context to the state it was before the mask was applied.
     *
     * @param {PIXI.CanvasRenderer} renderer - The renderer context to use.
     */
    CanvasMaskManager.prototype.popMask = function (renderer) {
        renderer.context.restore();
        renderer.invalidateBlendMode();
    };
    /**
     * Destroys this canvas mask manager.
     *
     */
    CanvasMaskManager.prototype.destroy = function () {
        /* empty */
    };
    return CanvasMaskManager;
}());

/**
 * Creates a little colored canvas
 *
 * @ignore
 * @param {string} color - The color to make the canvas
 * @return {canvas} a small canvas element
 */
function createColoredCanvas(color) {
    var canvas = document.createElement('canvas');
    canvas.width = 6;
    canvas.height = 1;
    var context = canvas.getContext('2d');
    context.fillStyle = color;
    context.fillRect(0, 0, 6, 1);
    return canvas;
}
/**
 * Checks whether the Canvas BlendModes are supported by the current browser
 *
 * @private
 * @return {boolean} whether they are supported
 */
function canUseNewCanvasBlendModes() {
    if (typeof document === 'undefined') {
        return false;
    }
    var magenta = createColoredCanvas('#ff00ff');
    var yellow = createColoredCanvas('#ffff00');
    var canvas = document.createElement('canvas');
    canvas.width = 6;
    canvas.height = 1;
    var context = canvas.getContext('2d');
    context.globalCompositeOperation = 'multiply';
    context.drawImage(magenta, 0, 0);
    context.drawImage(yellow, 2, 0);
    var imageData = context.getImageData(2, 0, 1, 1);
    if (!imageData) {
        return false;
    }
    var data = imageData.data;
    return (data[0] === 255 && data[1] === 0 && data[2] === 0);
}

/**
 * Maps blend combinations to Canvas.
 *
 * @memberof PIXI
 * @function mapCanvasBlendModesToPixi
 * @private
 * @param {string[]} [array=[]] - The array to output into.
 * @return {string[]} Mapped modes.
 */
function mapCanvasBlendModesToPixi(array) {
    if (array === void 0) { array = []; }
    if (canUseNewCanvasBlendModes()) {
        array[constants.BLEND_MODES.NORMAL] = 'source-over';
        array[constants.BLEND_MODES.ADD] = 'lighter'; // IS THIS OK???
        array[constants.BLEND_MODES.MULTIPLY] = 'multiply';
        array[constants.BLEND_MODES.SCREEN] = 'screen';
        array[constants.BLEND_MODES.OVERLAY] = 'overlay';
        array[constants.BLEND_MODES.DARKEN] = 'darken';
        array[constants.BLEND_MODES.LIGHTEN] = 'lighten';
        array[constants.BLEND_MODES.COLOR_DODGE] = 'color-dodge';
        array[constants.BLEND_MODES.COLOR_BURN] = 'color-burn';
        array[constants.BLEND_MODES.HARD_LIGHT] = 'hard-light';
        array[constants.BLEND_MODES.SOFT_LIGHT] = 'soft-light';
        array[constants.BLEND_MODES.DIFFERENCE] = 'difference';
        array[constants.BLEND_MODES.EXCLUSION] = 'exclusion';
        array[constants.BLEND_MODES.HUE] = 'hue';
        array[constants.BLEND_MODES.SATURATION] = 'saturate';
        array[constants.BLEND_MODES.COLOR] = 'color';
        array[constants.BLEND_MODES.LUMINOSITY] = 'luminosity';
    }
    else {
        // this means that the browser does not support the cool new blend modes in canvas 'cough' ie 'cough'
        array[constants.BLEND_MODES.NORMAL] = 'source-over';
        array[constants.BLEND_MODES.ADD] = 'lighter'; // IS THIS OK???
        array[constants.BLEND_MODES.MULTIPLY] = 'source-over';
        array[constants.BLEND_MODES.SCREEN] = 'source-over';
        array[constants.BLEND_MODES.OVERLAY] = 'source-over';
        array[constants.BLEND_MODES.DARKEN] = 'source-over';
        array[constants.BLEND_MODES.LIGHTEN] = 'source-over';
        array[constants.BLEND_MODES.COLOR_DODGE] = 'source-over';
        array[constants.BLEND_MODES.COLOR_BURN] = 'source-over';
        array[constants.BLEND_MODES.HARD_LIGHT] = 'source-over';
        array[constants.BLEND_MODES.SOFT_LIGHT] = 'source-over';
        array[constants.BLEND_MODES.DIFFERENCE] = 'source-over';
        array[constants.BLEND_MODES.EXCLUSION] = 'source-over';
        array[constants.BLEND_MODES.HUE] = 'source-over';
        array[constants.BLEND_MODES.SATURATION] = 'source-over';
        array[constants.BLEND_MODES.COLOR] = 'source-over';
        array[constants.BLEND_MODES.LUMINOSITY] = 'source-over';
    }
    // not-premultiplied, only for webgl
    array[constants.BLEND_MODES.NORMAL_NPM] = array[constants.BLEND_MODES.NORMAL];
    array[constants.BLEND_MODES.ADD_NPM] = array[constants.BLEND_MODES.ADD];
    array[constants.BLEND_MODES.SCREEN_NPM] = array[constants.BLEND_MODES.SCREEN];
    // composite operations
    array[constants.BLEND_MODES.SRC_IN] = 'source-in';
    array[constants.BLEND_MODES.SRC_OUT] = 'source-out';
    array[constants.BLEND_MODES.SRC_ATOP] = 'source-atop';
    array[constants.BLEND_MODES.DST_OVER] = 'destination-over';
    array[constants.BLEND_MODES.DST_IN] = 'destination-in';
    array[constants.BLEND_MODES.DST_OUT] = 'destination-out';
    array[constants.BLEND_MODES.DST_ATOP] = 'destination-atop';
    array[constants.BLEND_MODES.XOR] = 'xor';
    // SUBTRACT from flash, does not exist in canvas
    array[constants.BLEND_MODES.SUBTRACT] = 'source-over';
    return array;
}

var tempMatrix = new math.Matrix();
/**
 * The CanvasRenderer draws the scene and all its content onto a 2d canvas.
 *
 * This renderer should be used for browsers that do not support WebGL.
 * Don't forget to add the CanvasRenderer.view to your DOM or you will not see anything!
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.AbstractRenderer
 */
var CanvasRenderer = /** @class */ (function (_super) {
    __extends(CanvasRenderer, _super);
    /**
     * @param {object} [options] - The optional renderer parameters
     * @param {number} [options.width=800] - the width of the screen
     * @param {number} [options.height=600] - the height of the screen
     * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
     * @param {boolean} [options.transparent=false] - If the render view is transparent, default false
     * @param {boolean} [options.autoDensity=false] - Resizes renderer view in CSS pixels to allow for
     *   resolutions other than 1
     * @param {boolean} [options.antialias=false] - sets antialias
     * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer. The
     *  resolution of the renderer retina would be 2.
     * @param {boolean} [options.preserveDrawingBuffer=false] - enables drawing buffer preservation,
     *  enable this if you need to call toDataUrl on the webgl context.
     * @param {boolean} [options.clearBeforeRender=true] - This sets if the renderer will clear the canvas or
     *      not before the new render pass.
     * @param {number} [options.backgroundColor=0x000000] - The background color of the rendered area
     *  (shown if not transparent).
     */
    function CanvasRenderer(options) {
        var _this = _super.call(this, constants.RENDERER_TYPE.CANVAS, options) || this;
        /**
         * The root canvas 2d context that everything is drawn with.
         *
         * @member {CanvasRenderingContext2D}
         */
        _this.rootContext = _this.view.getContext('2d', { alpha: _this.transparent });
        /**
         * The currently active canvas 2d context (could change with renderTextures)
         *
         * @member {CanvasRenderingContext2D}
         */
        _this.context = _this.rootContext;
        /**
         * Boolean flag controlling canvas refresh.
         *
         * @member {boolean}
         */
        _this.refresh = true;
        /**
         * Instance of a CanvasMaskManager, handles masking when using the canvas renderer.
         *
         * @member {PIXI.CanvasMaskManager}
         */
        _this.maskManager = new CanvasMaskManager(_this);
        /**
         * The canvas property used to set the canvas smoothing property.
         *
         * @member {string}
         */
        _this.smoothProperty = 'imageSmoothingEnabled';
        if (!_this.rootContext.imageSmoothingEnabled) {
            var rc = _this.rootContext;
            if (rc.webkitImageSmoothingEnabled) {
                _this.smoothProperty = 'webkitImageSmoothingEnabled';
            }
            else if (rc.mozImageSmoothingEnabled) {
                _this.smoothProperty = 'mozImageSmoothingEnabled';
            }
            else if (rc.oImageSmoothingEnabled) {
                _this.smoothProperty = 'oImageSmoothingEnabled';
            }
            else if (rc.msImageSmoothingEnabled) {
                _this.smoothProperty = 'msImageSmoothingEnabled';
            }
        }
        _this.initPlugins(CanvasRenderer.__plugins);
        /**
         * Tracks the blend modes useful for this renderer.
         *
         * @member {object<number, string>}
         */
        _this.blendModes = mapCanvasBlendModesToPixi();
        _this._activeBlendMode = null;
        _this._outerBlend = false;
        /**
         * Projection transform, passed in render() stored here
         * @type {null}
         * @private
         */
        _this._projTransform = null;
        _this.renderingToScreen = false;
        utils.sayHello('Canvas');
        /**
         * Fired after rendering finishes.
         *
         * @event PIXI.CanvasRenderer#postrender
         */
        /**
         * Fired before rendering starts.
         *
         * @event PIXI.CanvasRenderer#prerender
         */
        _this.resize(_this.options.width, _this.options.height);
        return _this;
    }
    /**
     * Renders the object to this canvas view
     *
     * @param {PIXI.DisplayObject} displayObject - The object to be rendered
     * @param {PIXI.RenderTexture} [renderTexture] - A render texture to be rendered to.
     *  If unset, it will render to the root context.
     * @param {boolean} [clear=this.clearBeforeRender] - Whether to clear the canvas before drawing
     * @param {PIXI.Matrix} [transform] - A transformation to be applied
     * @param {boolean} [skipUpdateTransform=false] - Whether to skip the update transform
     */
    CanvasRenderer.prototype.render = function (displayObject, renderTexture, clear, transform, skipUpdateTransform) {
        if (!this.view) {
            return;
        }
        // can be handy to know!
        this.renderingToScreen = !renderTexture;
        this.emit('prerender');
        var rootResolution = this.resolution;
        if (renderTexture) {
            renderTexture = renderTexture.castToBaseTexture();
            if (!renderTexture._canvasRenderTarget) {
                renderTexture._canvasRenderTarget = new utils.CanvasRenderTarget(renderTexture.width, renderTexture.height, renderTexture.resolution);
                renderTexture.resource = new core.CanvasResource(renderTexture._canvasRenderTarget.canvas);
                renderTexture.valid = true;
            }
            this.context = renderTexture._canvasRenderTarget.context;
            this.resolution = renderTexture._canvasRenderTarget.resolution;
        }
        else {
            this.context = this.rootContext;
        }
        var context = this.context;
        this._projTransform = transform || null;
        if (!renderTexture) {
            this._lastObjectRendered = displayObject;
        }
        if (!skipUpdateTransform) {
            // update the scene graph
            var cacheParent = displayObject.enableTempParent();
            displayObject.updateTransform();
            displayObject.disableTempParent(cacheParent);
        }
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.globalAlpha = 1;
        this._activeBlendMode = constants.BLEND_MODES.NORMAL;
        this._outerBlend = false;
        context.globalCompositeOperation = this.blendModes[constants.BLEND_MODES.NORMAL];
        if (clear !== undefined ? clear : this.clearBeforeRender) {
            if (this.renderingToScreen) {
                if (this.transparent) {
                    context.clearRect(0, 0, this.width, this.height);
                }
                else {
                    context.fillStyle = this._backgroundColorString;
                    context.fillRect(0, 0, this.width, this.height);
                }
            }
            else {
                renderTexture = renderTexture;
                renderTexture._canvasRenderTarget.clear();
                var clearColor = renderTexture.clearColor;
                if (clearColor[3] > 0) {
                    context.fillStyle = utils.hex2string(utils.rgb2hex(clearColor));
                    context.fillRect(0, 0, renderTexture.realWidth, renderTexture.realHeight);
                }
            }
        }
        // TODO RENDER TARGET STUFF HERE..
        var tempContext = this.context;
        this.context = context;
        displayObject.renderCanvas(this);
        this.context = tempContext;
        context.restore();
        this.resolution = rootResolution;
        this._projTransform = null;
        this.emit('postrender');
    };
    /**
     * sets matrix of context
     * called only from render() methods
     * takes care about resolution
     * @param {PIXI.Matrix} transform - world matrix of current element
     * @param {boolean} [roundPixels] - whether to round (tx,ty) coords
     * @param {number} [localResolution] - If specified, used instead of `renderer.resolution` for local scaling
     */
    CanvasRenderer.prototype.setContextTransform = function (transform, roundPixels, localResolution) {
        var mat = transform;
        var proj = this._projTransform;
        var resolution = this.resolution;
        localResolution = localResolution || resolution;
        if (proj) {
            mat = tempMatrix;
            mat.copyFrom(transform);
            mat.prepend(proj);
        }
        if (roundPixels) {
            this.context.setTransform(mat.a * localResolution, mat.b * localResolution, mat.c * localResolution, mat.d * localResolution, (mat.tx * resolution) | 0, (mat.ty * resolution) | 0);
        }
        else {
            this.context.setTransform(mat.a * localResolution, mat.b * localResolution, mat.c * localResolution, mat.d * localResolution, mat.tx * resolution, mat.ty * resolution);
        }
    };
    /**
     * Clear the canvas of renderer.
     *
     * @param {string} [clearColor] - Clear the canvas with this color, except the canvas is transparent.
     */
    CanvasRenderer.prototype.clear = function (clearColor) {
        var context = this.context;
        clearColor = clearColor || this._backgroundColorString;
        if (!this.transparent && clearColor) {
            context.fillStyle = clearColor;
            context.fillRect(0, 0, this.width, this.height);
        }
        else {
            context.clearRect(0, 0, this.width, this.height);
        }
    };
    /**
     * Sets the blend mode of the renderer.
     *
     * @param {number} blendMode - See {@link PIXI.BLEND_MODES} for valid values.
     * @param {boolean} [readyForOuterBlend=false] - Some blendModes are dangerous, they affect outer space of sprite.
     * Pass `true` only if you are ready to use them.
     */
    CanvasRenderer.prototype.setBlendMode = function (blendMode, readyForOuterBlend) {
        var outerBlend = blendMode === constants.BLEND_MODES.SRC_IN
            || blendMode === constants.BLEND_MODES.SRC_OUT
            || blendMode === constants.BLEND_MODES.DST_IN
            || blendMode === constants.BLEND_MODES.DST_ATOP;
        if (!readyForOuterBlend && outerBlend) {
            blendMode = constants.BLEND_MODES.NORMAL;
        }
        if (this._activeBlendMode === blendMode) {
            return;
        }
        this._activeBlendMode = blendMode;
        this._outerBlend = outerBlend;
        this.context.globalCompositeOperation = this.blendModes[blendMode];
    };
    /**
     * Removes everything from the renderer and optionally removes the Canvas DOM element.
     *
     * @param {boolean} [removeView=false] - Removes the Canvas element from the DOM.
     */
    CanvasRenderer.prototype.destroy = function (removeView) {
        // call the base destroy
        _super.prototype.destroy.call(this, removeView);
        this.context = null;
        this.refresh = true;
        this.maskManager.destroy();
        this.maskManager = null;
        this.smoothProperty = null;
    };
    /**
     * Resizes the canvas view to the specified width and height.
     *
     * @extends PIXI.AbstractRenderer#resize
     *
     * @param {number} screenWidth - the new width of the screen
     * @param {number} screenHeight - the new height of the screen
     */
    CanvasRenderer.prototype.resize = function (screenWidth, screenHeight) {
        _super.prototype.resize.call(this, screenWidth, screenHeight);
        // reset the scale mode.. oddly this seems to be reset when the canvas is resized.
        // surely a browser bug?? Let PixiJS fix that for you..
        if (this.smoothProperty) {
            this.rootContext[this.smoothProperty] = (settings.settings.SCALE_MODE === constants.SCALE_MODES.LINEAR);
        }
    };
    /**
     * Checks if blend mode has changed.
     */
    CanvasRenderer.prototype.invalidateBlendMode = function () {
        this._activeBlendMode = this.blendModes.indexOf(this.context.globalCompositeOperation);
    };
    /**
     * Collection of installed plugins. These are included by default in PIXI, but can be excluded
     * by creating a custom build. Consult the README for more information about creating custom
     * builds and excluding plugins.
     * @member {object} plugins
     * @readonly
     * @property {PIXI.AccessibilityManager} accessibility Support tabbing interactive elements.
     * @property {PIXI.CanvasExtract} extract Extract image data from renderer.
     * @property {PIXI.InteractionManager} interaction Handles mouse, touch and pointer events.
     * @property {PIXI.CanvasPrepare} prepare Pre-render display objects.
     */
    /**
     * Adds a plugin to the renderer.
     *
     * @param {string} pluginName - The name of the plugin.
     * @param {Function} ctor - The constructor function or class for the plugin.
     */
    CanvasRenderer.registerPlugin = function (pluginName, ctor) {
        CanvasRenderer.__plugins = CanvasRenderer.__plugins || {};
        CanvasRenderer.__plugins[pluginName] = ctor;
    };
    return CanvasRenderer;
}(core.AbstractRenderer));

/**
 * Utility methods for Sprite/Texture tinting.
 *
 * Tinting with the CanvasRenderer involves creating a new canvas to use as a texture,
 * so be aware of the performance implications.
 *
 * @namespace PIXI.canvasUtils
 * @memberof PIXI
 */
var canvasUtils = {
    canvas: null,
    /**
     * Basically this method just needs a sprite and a color and tints the sprite with the given color.
     *
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Sprite} sprite - the sprite to tint
     * @param {number} color - the color to use to tint the sprite with
     * @return {HTMLCanvasElement} The tinted canvas
     */
    getTintedCanvas: function (sprite, color) {
        var texture = sprite.texture;
        color = canvasUtils.roundColor(color);
        var stringColor = "#" + ("00000" + (color | 0).toString(16)).substr(-6);
        texture.tintCache = texture.tintCache || {};
        var cachedCanvas = texture.tintCache[stringColor];
        var canvas;
        if (cachedCanvas) {
            if (cachedCanvas.tintId === texture._updateID) {
                return texture.tintCache[stringColor];
            }
            canvas = texture.tintCache[stringColor];
        }
        else {
            canvas = document.createElement('canvas');
        }
        canvasUtils.tintMethod(texture, color, canvas);
        canvas.tintId = texture._updateID;
        if (canvasUtils.convertTintToImage) {
            // is this better?
            var tintImage = new Image();
            tintImage.src = canvas.toDataURL();
            texture.tintCache[stringColor] = tintImage;
        }
        else {
            texture.tintCache[stringColor] = canvas;
        }
        return canvas;
    },
    /**
     * Basically this method just needs a sprite and a color and tints the sprite with the given color.
     *
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Texture} texture - the sprite to tint
     * @param {number} color - the color to use to tint the sprite with
     * @return {HTMLCanvasElement} The tinted canvas
     */
    getTintedPattern: function (texture, color) {
        color = canvasUtils.roundColor(color);
        var stringColor = "#" + ("00000" + (color | 0).toString(16)).substr(-6);
        texture.patternCache = texture.patternCache || {};
        var pattern = texture.patternCache[stringColor];
        if (pattern && pattern.tintId === texture._updateID) {
            return pattern;
        }
        if (!canvasUtils.canvas) {
            canvasUtils.canvas = document.createElement('canvas');
        }
        canvasUtils.tintMethod(texture, color, canvasUtils.canvas);
        pattern = canvasUtils.canvas.getContext('2d').createPattern(canvasUtils.canvas, 'repeat');
        pattern.tintId = texture._updateID;
        texture.patternCache[stringColor] = pattern;
        return pattern;
    },
    /**
     * Tint a texture using the 'multiply' operation.
     *
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Texture} texture - the texture to tint
     * @param {number} color - the color to use to tint the sprite with
     * @param {HTMLCanvasElement} canvas - the current canvas
     */
    tintWithMultiply: function (texture, color, canvas) {
        var context = canvas.getContext('2d');
        var crop = texture._frame.clone();
        var resolution = texture.baseTexture.resolution;
        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;
        canvas.width = Math.ceil(crop.width);
        canvas.height = Math.ceil(crop.height);
        context.save();
        context.fillStyle = "#" + ("00000" + (color | 0).toString(16)).substr(-6);
        context.fillRect(0, 0, crop.width, crop.height);
        context.globalCompositeOperation = 'multiply';
        var source = texture.baseTexture.getDrawableSource();
        context.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
        context.globalCompositeOperation = 'destination-atop';
        context.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
        context.restore();
    },
    /**
     * Tint a texture using the 'overlay' operation.
     *
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Texture} texture - the texture to tint
     * @param {number} color - the color to use to tint the sprite with
     * @param {HTMLCanvasElement} canvas - the current canvas
     */
    tintWithOverlay: function (texture, color, canvas) {
        var context = canvas.getContext('2d');
        var crop = texture._frame.clone();
        var resolution = texture.baseTexture.resolution;
        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;
        canvas.width = Math.ceil(crop.width);
        canvas.height = Math.ceil(crop.height);
        context.save();
        context.globalCompositeOperation = 'copy';
        context.fillStyle = "#" + ("00000" + (color | 0).toString(16)).substr(-6);
        context.fillRect(0, 0, crop.width, crop.height);
        context.globalCompositeOperation = 'destination-atop';
        context.drawImage(texture.baseTexture.getDrawableSource(), crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
        // context.globalCompositeOperation = 'copy';
        context.restore();
    },
    /**
     * Tint a texture pixel per pixel.
     *
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Texture} texture - the texture to tint
     * @param {number} color - the color to use to tint the sprite with
     * @param {HTMLCanvasElement} canvas - the current canvas
     */
    tintWithPerPixel: function (texture, color, canvas) {
        var context = canvas.getContext('2d');
        var crop = texture._frame.clone();
        var resolution = texture.baseTexture.resolution;
        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;
        canvas.width = Math.ceil(crop.width);
        canvas.height = Math.ceil(crop.height);
        context.save();
        context.globalCompositeOperation = 'copy';
        context.drawImage(texture.baseTexture.getDrawableSource(), crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
        context.restore();
        var rgbValues = utils.hex2rgb(color);
        var r = rgbValues[0];
        var g = rgbValues[1];
        var b = rgbValues[2];
        var pixelData = context.getImageData(0, 0, crop.width, crop.height);
        var pixels = pixelData.data;
        for (var i = 0; i < pixels.length; i += 4) {
            pixels[i + 0] *= r;
            pixels[i + 1] *= g;
            pixels[i + 2] *= b;
        }
        context.putImageData(pixelData, 0, 0);
    },
    /**
     * Rounds the specified color according to the canvasUtils.cacheStepsPerColorChannel.
     *
     * @memberof PIXI.canvasUtils
     * @param {number} color - the color to round, should be a hex color
     * @return {number} The rounded color.
     */
    roundColor: function (color) {
        var step = canvasUtils.cacheStepsPerColorChannel;
        var rgbValues = utils.hex2rgb(color);
        rgbValues[0] = Math.min(255, (rgbValues[0] / step) * step);
        rgbValues[1] = Math.min(255, (rgbValues[1] / step) * step);
        rgbValues[2] = Math.min(255, (rgbValues[2] / step) * step);
        return utils.rgb2hex(rgbValues);
    },
    /**
     * Number of steps which will be used as a cap when rounding colors.
     *
     * @memberof PIXI.canvasUtils
     * @type {number}
     */
    cacheStepsPerColorChannel: 8,
    /**
     * Tint cache boolean flag.
     *
     * @memberof PIXI.canvasUtils
     * @type {boolean}
     */
    convertTintToImage: false,
    /**
     * Whether or not the Canvas BlendModes are supported, consequently the ability to tint using the multiply method.
     *
     * @memberof PIXI.canvasUtils
     * @type {boolean}
     */
    canUseMultiply: canUseNewCanvasBlendModes(),
    /**
     * The tinting method that will be used.
     *
     * @memberof PIXI.canvasUtils
     * @type {Function}
     */
    tintMethod: null,
};
canvasUtils.tintMethod = canvasUtils.canUseMultiply ? canvasUtils.tintWithMultiply : canvasUtils.tintWithPerPixel;

// Reference to Renderer.create static function
var parentCreate = core.Renderer.create;
/**
 * Override the Renderer.create to fallback to use CanvasRenderer.
 * Also supports forceCanvas option with Application or autoDetectRenderer.
 * @private
 */
core.Renderer.create = function create(options) {
    var forceCanvas = options && options.forceCanvas;
    if (!forceCanvas) {
        try {
            return parentCreate(options);
        }
        catch (err) {
            // swallow WebGL-unsupported error
        }
    }
    return new CanvasRenderer(options);
};

/**
 * Get the drawable source, such as HTMLCanvasElement or HTMLImageElement suitable
 * for rendering with CanvasRenderer. Provided by **@pixi/canvas-renderer** package.
 * @method getDrawableSource
 * @memberof PIXI.BaseTexture#
 * @return {PIXI.ICanvasImageSource} Source to render with CanvasRenderer
 */
core.BaseTexture.prototype.getDrawableSource = function getDrawableSource() {
    var resource = this.resource;
    return resource ? (resource.bitmap || resource.source) : null;
};
/**
 * A reference to the canvas render target (we only need one as this can be shared across renderers)
 *
 * @protected
 * @member {PIXI.utils.CanvasRenderTarget} _canvasRenderTarget
 * @memberof PIXI.BaseRenderTexture#
 */
core.BaseRenderTexture.prototype._canvasRenderTarget = null;
core.Texture.prototype.patternCache = null;
core.Texture.prototype.tintCache = null;

exports.CanvasRenderer = CanvasRenderer;
exports.canUseNewCanvasBlendModes = canUseNewCanvasBlendModes;
exports.canvasUtils = canvasUtils;
//# sourceMappingURL=canvas-renderer.js.map
