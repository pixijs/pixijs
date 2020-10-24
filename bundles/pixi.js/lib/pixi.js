/*!
 * pixi.js - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * pixi.js is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('@pixi/polyfill');
var utils = require('@pixi/utils');
var accessibility = require('@pixi/accessibility');
var interaction = require('@pixi/interaction');
var app = require('@pixi/app');
var core = require('@pixi/core');
var extract = require('@pixi/extract');
var loaders = require('@pixi/loaders');
var compressedTextures = require('@pixi/compressed-textures');
var particles = require('@pixi/particles');
var prepare = require('@pixi/prepare');
var spritesheet = require('@pixi/spritesheet');
var spriteTiling = require('@pixi/sprite-tiling');
var textBitmap = require('@pixi/text-bitmap');
var ticker = require('@pixi/ticker');
var filterAlpha = require('@pixi/filter-alpha');
var filterBlur = require('@pixi/filter-blur');
var filterColorMatrix = require('@pixi/filter-color-matrix');
var filterDisplacement = require('@pixi/filter-displacement');
var filterFxaa = require('@pixi/filter-fxaa');
var filterNoise = require('@pixi/filter-noise');
require('@pixi/mixin-cache-as-bitmap');
require('@pixi/mixin-get-child-by-name');
require('@pixi/mixin-get-global-position');
var constants = require('@pixi/constants');
var display = require('@pixi/display');
var graphics = require('@pixi/graphics');
var math = require('@pixi/math');
var mesh = require('@pixi/mesh');
var meshExtras = require('@pixi/mesh-extras');
var runner = require('@pixi/runner');
var sprite = require('@pixi/sprite');
var spriteAnimated = require('@pixi/sprite-animated');
var text = require('@pixi/text');
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

var v5 = '5.0.0';
/**
 * Deprecations (backward compatibilities) are automatically applied for browser bundles
 * in the UMD module format. If using Webpack or Rollup, you'll need to apply these
 * deprecations manually by doing something like this:
 * @example
 * import * as PIXI from 'pixi.js';
 * PIXI.useDeprecated(); // MUST be bound to namespace
 * @memberof PIXI
 * @function useDeprecated
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function useDeprecated() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    var PIXI = this;
    Object.defineProperties(PIXI, {
        /**
         * @constant {RegExp|string} SVG_SIZE
         * @memberof PIXI
         * @see PIXI.SVGResource.SVG_SIZE
         * @deprecated since 5.0.0
         */
        SVG_SIZE: {
            get: function () {
                utils.deprecation(v5, 'PIXI.utils.SVG_SIZE property has moved to PIXI.SVGResource.SVG_SIZE');
                return PIXI.SVGResource.SVG_SIZE;
            },
        },
        /**
         * @class PIXI.TransformStatic
         * @deprecated since 5.0.0
         * @see PIXI.Transform
         */
        TransformStatic: {
            get: function () {
                utils.deprecation(v5, 'PIXI.TransformStatic class has been removed, use PIXI.Transform');
                return PIXI.Transform;
            },
        },
        /**
         * @class PIXI.TransformBase
         * @deprecated since 5.0.0
         * @see PIXI.Transform
         */
        TransformBase: {
            get: function () {
                utils.deprecation(v5, 'PIXI.TransformBase class has been removed, use PIXI.Transform');
                return PIXI.Transform;
            },
        },
        /**
         * Constants that specify the transform type.
         *
         * @static
         * @constant
         * @name TRANSFORM_MODE
         * @memberof PIXI
         * @enum {number}
         * @deprecated since 5.0.0
         * @property {number} STATIC
         * @property {number} DYNAMIC
         */
        TRANSFORM_MODE: {
            get: function () {
                utils.deprecation(v5, 'PIXI.TRANSFORM_MODE property has been removed');
                return { STATIC: 0, DYNAMIC: 1 };
            },
        },
        /**
         * @class PIXI.WebGLRenderer
         * @see PIXI.Renderer
         * @deprecated since 5.0.0
         */
        WebGLRenderer: {
            get: function () {
                utils.deprecation(v5, 'PIXI.WebGLRenderer class has moved to PIXI.Renderer');
                return PIXI.Renderer;
            },
        },
        /**
         * @class PIXI.CanvasRenderTarget
         * @see PIXI.utils.CanvasRenderTarget
         * @deprecated since 5.0.0
         */
        CanvasRenderTarget: {
            get: function () {
                utils.deprecation(v5, 'PIXI.CanvasRenderTarget class has moved to PIXI.utils.CanvasRenderTarget');
                return PIXI.utils.CanvasRenderTarget;
            },
        },
        /**
         * @memberof PIXI
         * @name loader
         * @type {PIXI.Loader}
         * @see PIXI.Loader.shared
         * @deprecated since 5.0.0
         */
        loader: {
            get: function () {
                utils.deprecation(v5, 'PIXI.loader instance has moved to PIXI.Loader.shared');
                return PIXI.Loader.shared;
            },
        },
        /**
         * @class PIXI.FilterManager
         * @see PIXI.FilterSystem
         * @deprecated since 5.0.0
         */
        FilterManager: {
            get: function () {
                utils.deprecation(v5, 'PIXI.FilterManager class has moved to PIXI.FilterSystem');
                return PIXI.FilterSystem;
            },
        },
        /**
         * @namespace PIXI.CanvasTinter
         * @see PIXI.canvasUtils
         * @deprecated since 5.2.0
         */
        CanvasTinter: {
            get: function () {
                utils.deprecation('5.2.0', 'PIXI.CanvasTinter namespace has moved to PIXI.canvasUtils');
                return PIXI.canvasUtils;
            },
        },
        /**
         * @namespace PIXI.GroupD8
         * @see PIXI.groupD8
         * @deprecated since 5.2.0
         */
        GroupD8: {
            get: function () {
                utils.deprecation('5.2.0', 'PIXI.GroupD8 namespace has moved to PIXI.groupD8');
                return PIXI.groupD8;
            },
        },
    });
    /**
     * @memberof PIXI
     * @namespace accessibility
     * @see PIXI
     * @deprecated since 5.3.0
     */
    PIXI.accessibility = {};
    Object.defineProperties(PIXI.accessibility, {
        /**
         * @memberof PIXI.accessibility
         * @class AccessibilityManager
         * @deprecated since 5.3.0
         * @see PIXI.AccessibilityManager
         */
        AccessibilityManager: {
            get: function () {
                utils.deprecation('5.3.0', 'PIXI.accessibility.AccessibilityManager moved to PIXI.AccessibilityManager');
                return PIXI.AccessibilityManager;
            },
        },
    });
    /**
     * @memberof PIXI
     * @namespace resources
     * @see PIXI
     * @deprecated since 5.4.0
     */
    Object.defineProperty(PIXI, 'resources', {
        get: function () {
            utils.deprecation('5.4.0', 'PIXI.resources.* has moved to PIXI.*');
            return PIXI;
        },
    });
    /**
     * @memberof PIXI
     * @namespace systems
     * @see PIXI
     * @deprecated since 5.4.0
     */
    Object.defineProperty(PIXI, 'systems', {
        get: function () {
            utils.deprecation('5.4.0', 'PIXI.systems.* has moved to PIXI.*');
            return PIXI;
        },
    });
    /**
     * @namespace PIXI.interaction
     * @see PIXI
     * @deprecated since 5.3.0
     */
    PIXI.interaction = {};
    Object.defineProperties(PIXI.interaction, {
        /**
         * @class PIXI.interaction.InteractionManager
         * @deprecated since 5.3.0
         * @see PIXI.InteractionManager
         */
        InteractionManager: {
            get: function () {
                utils.deprecation('5.3.0', 'PIXI.interaction.InteractionManager moved to PIXI.InteractionManager');
                return PIXI.InteractionManager;
            },
        },
        /**
         * @class PIXI.interaction.InteractionData
         * @deprecated since 5.3.0
         * @see PIXI.InteractionData
         */
        InteractionData: {
            get: function () {
                utils.deprecation('5.3.0', 'PIXI.interaction.InteractionData moved to PIXI.InteractionData');
                return PIXI.InteractionData;
            },
        },
        /**
         * @class PIXI.interaction.InteractionEvent
         * @deprecated since 5.3.0
         * @see PIXI.InteractionEvent
         */
        InteractionEvent: {
            get: function () {
                utils.deprecation('5.3.0', 'PIXI.interaction.InteractionEvent moved to PIXI.InteractionEvent');
                return PIXI.InteractionEvent;
            },
        },
    });
    /**
     * @namespace PIXI.prepare
     * @see PIXI
     * @deprecated since 5.2.1
     */
    PIXI.prepare = {};
    Object.defineProperties(PIXI.prepare, {
        /**
         * @class PIXI.prepare.BasePrepare
         * @deprecated since 5.2.1
         * @see PIXI.BasePrepare
         */
        BasePrepare: {
            get: function () {
                utils.deprecation('5.2.1', 'PIXI.prepare.BasePrepare moved to PIXI.BasePrepare');
                return PIXI.BasePrepare;
            },
        },
        /**
         * @class PIXI.prepare.Prepare
         * @deprecated since 5.2.1
         * @see PIXI.Prepare
         */
        Prepare: {
            get: function () {
                utils.deprecation('5.2.1', 'PIXI.prepare.Prepare moved to PIXI.Prepare');
                return PIXI.Prepare;
            },
        },
        /**
         * @class PIXI.prepare.CanvasPrepare
         * @deprecated since 5.2.1
         * @see PIXI.CanvasPrepare
         */
        CanvasPrepare: {
            get: function () {
                utils.deprecation('5.2.1', 'PIXI.prepare.CanvasPrepare moved to PIXI.CanvasPrepare');
                return PIXI.CanvasPrepare;
            },
        },
    });
    /**
     * @namespace PIXI.extract
     * @see PIXI
     * @deprecated since 5.2.1
     */
    PIXI.extract = {};
    Object.defineProperties(PIXI.extract, {
        /**
         * @class PIXI.extract.Extract
         * @deprecated since 5.2.1
         * @see PIXI.Extract
         */
        Extract: {
            get: function () {
                utils.deprecation('5.2.1', 'PIXI.extract.Extract moved to PIXI.Extract');
                return PIXI.Extract;
            },
        },
        /**
         * @class PIXI.extract.CanvasExtract
         * @deprecated since 5.2.1
         * @see PIXI.CanvasExtract
         */
        CanvasExtract: {
            get: function () {
                utils.deprecation('5.2.1', 'PIXI.extract.CanvasExtract moved to PIXI.CanvasExtract');
                return PIXI.CanvasExtract;
            },
        },
    });
    /**
     * This namespace has been removed. All classes previous nested
     * under this namespace have been moved to the top-level `PIXI` object.
     * @namespace PIXI.extras
     * @deprecated since 5.0.0
     */
    PIXI.extras = {};
    Object.defineProperties(PIXI.extras, {
        /**
         * @class PIXI.extras.TilingSprite
         * @see PIXI.TilingSprite
         * @deprecated since 5.0.0
         */
        TilingSprite: {
            get: function () {
                utils.deprecation(v5, 'PIXI.extras.TilingSprite class has moved to PIXI.TilingSprite');
                return PIXI.TilingSprite;
            },
        },
        /**
         * @class PIXI.extras.TilingSpriteRenderer
         * @see PIXI.TilingSpriteRenderer
         * @deprecated since 5.0.0
         */
        TilingSpriteRenderer: {
            get: function () {
                utils.deprecation(v5, 'PIXI.extras.TilingSpriteRenderer class has moved to PIXI.TilingSpriteRenderer');
                return PIXI.TilingSpriteRenderer;
            },
        },
        /**
         * @class PIXI.extras.AnimatedSprite
         * @see PIXI.AnimatedSprite
         * @deprecated since 5.0.0
         */
        AnimatedSprite: {
            get: function () {
                utils.deprecation(v5, 'PIXI.extras.AnimatedSprite class has moved to PIXI.AnimatedSprite');
                return PIXI.AnimatedSprite;
            },
        },
        /**
         * @class PIXI.extras.BitmapText
         * @see PIXI.BitmapText
         * @deprecated since 5.0.0
         */
        BitmapText: {
            get: function () {
                utils.deprecation(v5, 'PIXI.extras.BitmapText class has moved to PIXI.BitmapText');
                return PIXI.BitmapText;
            },
        },
    });
    /**
     * @static
     * @method PIXI.TilingSprite.fromFrame
     * @deprecated since 5.3.0
     * @see PIXI.TilingSprite.from
     */
    PIXI.TilingSprite.fromFrame = function fromFrame(frameId, width, height) {
        utils.deprecation('5.3.0', 'TilingSprite.fromFrame is deprecated, use TilingSprite.from');
        return PIXI.TilingSprite.from(frameId, { width: width, height: height });
    };
    /**
     * @static
     * @method PIXI.TilingSprite.fromImage
     * @deprecated since 5.3.0
     * @see PIXI.TilingSprite.from
     */
    PIXI.TilingSprite.fromImage = function fromImage(imageId, width, height, options) {
        if (options === void 0) { options = {}; }
        utils.deprecation('5.3.0', 'TilingSprite.fromImage is deprecated, use TilingSprite.from');
        // Fallback support for crossorigin, scaleMode parameters
        if (options && typeof options !== 'object') {
            options = {
                // eslint-disable-next-line prefer-rest-params
                scaleMode: arguments[4],
                resourceOptions: {
                    // eslint-disable-next-line prefer-rest-params
                    crossorigin: arguments[3],
                },
            };
        }
        options.width = width;
        options.height = height;
        return PIXI.TilingSprite.from(imageId, options);
    };
    Object.defineProperties(PIXI.utils, {
        /**
         * @function PIXI.utils.getSvgSize
         * @see PIXI.SVGResource.getSize
         * @deprecated since 5.0.0
         */
        getSvgSize: {
            get: function () {
                utils.deprecation(v5, 'PIXI.utils.getSvgSize function has moved to PIXI.SVGResource.getSize');
                return PIXI.SVGResource.getSize;
            },
        },
    });
    /**
     * All classes on this namespace have moved to the high-level `PIXI` object.
     * @namespace PIXI.mesh
     * @deprecated since 5.0.0
     */
    PIXI.mesh = {};
    Object.defineProperties(PIXI.mesh, {
        /**
         * @class PIXI.mesh.Mesh
         * @see PIXI.SimpleMesh
         * @deprecated since 5.0.0
         */
        Mesh: {
            get: function () {
                utils.deprecation(v5, 'PIXI.mesh.Mesh class has moved to PIXI.SimpleMesh');
                return PIXI.SimpleMesh;
            },
        },
        /**
         * @class PIXI.mesh.NineSlicePlane
         * @see PIXI.NineSlicePlane
         * @deprecated since 5.0.0
         */
        NineSlicePlane: {
            get: function () {
                utils.deprecation(v5, 'PIXI.mesh.NineSlicePlane class has moved to PIXI.NineSlicePlane');
                return PIXI.NineSlicePlane;
            },
        },
        /**
         * @class PIXI.mesh.Plane
         * @see PIXI.SimplePlane
         * @deprecated since 5.0.0
         */
        Plane: {
            get: function () {
                utils.deprecation(v5, 'PIXI.mesh.Plane class has moved to PIXI.SimplePlane');
                return PIXI.SimplePlane;
            },
        },
        /**
         * @class PIXI.mesh.Rope
         * @see PIXI.SimpleRope
         * @deprecated since 5.0.0
         */
        Rope: {
            get: function () {
                utils.deprecation(v5, 'PIXI.mesh.Rope class has moved to PIXI.SimpleRope');
                return PIXI.SimpleRope;
            },
        },
        /**
         * @class PIXI.mesh.RawMesh
         * @see PIXI.Mesh
         * @deprecated since 5.0.0
         */
        RawMesh: {
            get: function () {
                utils.deprecation(v5, 'PIXI.mesh.RawMesh class has moved to PIXI.Mesh');
                return PIXI.Mesh;
            },
        },
        /**
         * @class PIXI.mesh.CanvasMeshRenderer
         * @see PIXI.CanvasMeshRenderer
         * @deprecated since 5.0.0
         */
        CanvasMeshRenderer: {
            get: function () {
                utils.deprecation(v5, 'PIXI.mesh.CanvasMeshRenderer class has moved to PIXI.CanvasMeshRenderer');
                return PIXI.CanvasMeshRenderer;
            },
        },
        /**
         * @class PIXI.mesh.MeshRenderer
         * @see PIXI.MeshRenderer
         * @deprecated since 5.0.0
         */
        MeshRenderer: {
            get: function () {
                utils.deprecation(v5, 'PIXI.mesh.MeshRenderer class has moved to PIXI.MeshRenderer');
                return PIXI.MeshRenderer;
            },
        },
    });
    /**
     * This namespace has been removed and items have been moved to
     * the top-level `PIXI` object.
     * @namespace PIXI.particles
     * @deprecated since 5.0.0
     */
    PIXI.particles = {};
    Object.defineProperties(PIXI.particles, {
        /**
         * @class PIXI.particles.ParticleContainer
         * @deprecated since 5.0.0
         * @see PIXI.ParticleContainer
         */
        ParticleContainer: {
            get: function () {
                utils.deprecation(v5, 'PIXI.particles.ParticleContainer class has moved to PIXI.ParticleContainer');
                return PIXI.ParticleContainer;
            },
        },
        /**
         * @class PIXI.particles.ParticleRenderer
         * @deprecated since 5.0.0
         * @see PIXI.ParticleRenderer
         */
        ParticleRenderer: {
            get: function () {
                utils.deprecation(v5, 'PIXI.particles.ParticleRenderer class has moved to PIXI.ParticleRenderer');
                return PIXI.ParticleRenderer;
            },
        },
    });
    /**
     * This namespace has been removed and items have been moved to
     * the top-level `PIXI` object.
     * @namespace PIXI.ticker
     * @deprecated since 5.0.0
     */
    PIXI.ticker = {};
    Object.defineProperties(PIXI.ticker, {
        /**
         * @class PIXI.ticker.Ticker
         * @deprecated since 5.0.0
         * @see PIXI.Ticker
         */
        Ticker: {
            get: function () {
                utils.deprecation(v5, 'PIXI.ticker.Ticker class has moved to PIXI.Ticker');
                return PIXI.Ticker;
            },
        },
        /**
         * @name shared
         * @memberof PIXI.ticker
         * @type {PIXI.Ticker}
         * @deprecated since 5.0.0
         * @see PIXI.Ticker.shared
         */
        shared: {
            get: function () {
                utils.deprecation(v5, 'PIXI.ticker.shared instance has moved to PIXI.Ticker.shared');
                return PIXI.Ticker.shared;
            },
        },
    });
    /**
     * All classes on this namespace have moved to the high-level `PIXI` object.
     * @namespace PIXI.loaders
     * @deprecated since 5.0.0
     */
    PIXI.loaders = {};
    Object.defineProperties(PIXI.loaders, {
        /**
         * @class PIXI.loaders.Loader
         * @see PIXI.Loader
         * @deprecated since 5.0.0
         */
        Loader: {
            get: function () {
                utils.deprecation(v5, 'PIXI.loaders.Loader class has moved to PIXI.Loader');
                return PIXI.Loader;
            },
        },
        /**
         * @class PIXI.loaders.Resource
         * @see PIXI.LoaderResource
         * @deprecated since 5.0.0
         */
        Resource: {
            get: function () {
                utils.deprecation(v5, 'PIXI.loaders.Resource class has moved to PIXI.LoaderResource');
                return PIXI.LoaderResource;
            },
        },
        /**
         * @function PIXI.loaders.bitmapFontParser
         * @see PIXI.BitmapFontLoader.use
         * @deprecated since 5.0.0
         */
        bitmapFontParser: {
            get: function () {
                utils.deprecation(v5, 'PIXI.loaders.bitmapFontParser function has moved to PIXI.BitmapFontLoader.use');
                return PIXI.BitmapFontLoader.use;
            },
        },
        /**
         * @function PIXI.loaders.parseBitmapFontData
         * @deprecated since 5.0.0
         */
        parseBitmapFontData: {
            get: function () {
                utils.deprecation(v5, 'PIXI.loaders.parseBitmapFontData function has removed');
            },
        },
        /**
         * @function PIXI.loaders.spritesheetParser
         * @see PIXI.SpritesheetLoader.use
         * @deprecated since 5.0.0
         */
        spritesheetParser: {
            get: function () {
                utils.deprecation(v5, 'PIXI.loaders.spritesheetParser function has moved to PIXI.SpritesheetLoader.use');
                return PIXI.SpritesheetLoader.use;
            },
        },
        /**
         * @function PIXI.loaders.getResourcePath
         * @see PIXI.SpritesheetLoader.getResourcePath
         * @deprecated since 5.0.0
         */
        getResourcePath: {
            get: function () {
                utils.deprecation(v5, 'PIXI.loaders.getResourcePath property has moved to PIXI.SpritesheetLoader.getResourcePath');
                return PIXI.SpritesheetLoader.getResourcePath;
            },
        },
    });
    /**
     * @function PIXI.loaders.Loader.addPixiMiddleware
     * @see PIXI.Loader.registerPlugin
     * @deprecated since 5.0.0
     * @param {function} middleware
     */
    PIXI.Loader.addPixiMiddleware = function addPixiMiddleware(middleware) {
        utils.deprecation(v5, 'PIXI.loaders.Loader.addPixiMiddleware function is deprecated, use PIXI.loaders.Loader.registerPlugin');
        return PIXI.loaders.Loader.registerPlugin({ use: middleware() });
    };
    // convenience for converting event name to signal name
    var eventToSignal = function (event) {
        return "on" + event.charAt(0).toUpperCase() + event.slice(1);
    };
    Object.assign(PIXI.Loader.prototype, {
        /**
         * Use the corresponding signal, e.g., event `start`` is signal `onStart`.
         * @method PIXI.Loader#on
         * @deprecated since 5.0.0
         */
        on: function (event) {
            var signal = eventToSignal(event);
            utils.deprecation(v5, "PIXI.Loader#on is completely deprecated, use PIXI.Loader#" + signal + ".add");
        },
        /**
         * Use the corresponding signal, e.g., event `start`` is signal `onStart`.
         * @method PIXI.Loader#once
         * @deprecated since 5.0.0
         */
        once: function (event) {
            var signal = eventToSignal(event);
            utils.deprecation(v5, "PIXI.Loader#once is completely deprecated, use PIXI.Loader#" + signal + ".once");
        },
        /**
         * Use the corresponding signal, e.g., event `start`` is signal `onStart`.
         * @method PIXI.Loader#off
         * @deprecated since 5.0.0
         */
        off: function (event) {
            var signal = eventToSignal(event);
            utils.deprecation(v5, "PIXI.Loader#off is completely deprecated, use PIXI.Loader#" + signal + ".detach");
        },
    });
    /**
     * @class PIXI.extract.WebGLExtract
     * @deprecated since 5.0.0
     * @see PIXI.Extract
     */
    Object.defineProperty(PIXI.extract, 'WebGLExtract', {
        get: function () {
            utils.deprecation(v5, 'PIXI.extract.WebGLExtract method has moved to PIXI.Extract');
            return PIXI.Extract;
        },
    });
    /**
     * @class PIXI.prepare.WebGLPrepare
     * @deprecated since 5.0.0
     * @see PIXI.Prepare
     */
    Object.defineProperty(PIXI.prepare, 'WebGLPrepare', {
        get: function () {
            utils.deprecation(v5, 'PIXI.prepare.WebGLPrepare class has moved to PIXI.Prepare');
            return PIXI.Prepare;
        },
    });
    /**
     * @method PIXI.Container#_renderWebGL
     * @private
     * @deprecated since 5.0.0
     * @see PIXI.Container#render
     * @param {PIXI.Renderer} renderer - Instance of renderer
     */
    PIXI.Container.prototype._renderWebGL = function _renderWebGL(renderer) {
        utils.deprecation(v5, 'PIXI.Container._renderWebGL method has moved to PIXI.Container._render');
        this._render(renderer);
    };
    /**
     * @memberof PIXI.Container#
     * @method renderWebGL
     * @deprecated since 5.0.0
     * @see PIXI.Container#render
     * @param {PIXI.Renderer} renderer - Instance of renderer
     */
    PIXI.Container.prototype.renderWebGL = function renderWebGL(renderer) {
        utils.deprecation(v5, 'PIXI.Container.renderWebGL method has moved to PIXI.Container.render');
        this.render(renderer);
    };
    /**
     * @memberof PIXI.DisplayObject#
     * @method renderWebGL
     * @deprecated since 5.0.0
     * @see PIXI.DisplayObject#render
     * @param {PIXI.Renderer} renderer - Instance of renderer
     */
    PIXI.DisplayObject.prototype.renderWebGL = function renderWebGL(renderer) {
        utils.deprecation(v5, 'PIXI.DisplayObject.renderWebGL method has moved to PIXI.DisplayObject.render');
        this.render(renderer);
    };
    /**
     * @method PIXI.Container#renderAdvancedWebGL
     * @deprecated since 5.0.0
     * @see PIXI.Container#renderAdvanced
     * @param {PIXI.Renderer} renderer - Instance of renderer
     */
    PIXI.Container.prototype.renderAdvancedWebGL = function renderAdvancedWebGL(renderer) {
        utils.deprecation(v5, 'PIXI.Container.renderAdvancedWebGL method has moved to PIXI.Container.renderAdvanced');
        this.renderAdvanced(renderer);
    };
    Object.defineProperties(PIXI.settings, {
        /**
         * Default transform type.
         *
         * @static
         * @deprecated since 5.0.0
         * @memberof PIXI.settings
         * @member {PIXI.TRANSFORM_MODE}
         * @default PIXI.TRANSFORM_MODE.STATIC
         */
        TRANSFORM_MODE: {
            get: function () {
                utils.deprecation(v5, 'PIXI.settings.TRANSFORM_MODE property has been removed');
                return 0;
            },
            set: function () {
                utils.deprecation(v5, 'PIXI.settings.TRANSFORM_MODE property has been removed');
            },
        },
    });
    var BaseTextureAny = PIXI.BaseTexture;
    /**
     * @method loadSource
     * @memberof PIXI.BaseTexture#
     * @deprecated since 5.0.0
     */
    BaseTextureAny.prototype.loadSource = function loadSource(image) {
        utils.deprecation(v5, 'PIXI.BaseTexture.loadSource method has been deprecated');
        var resource = PIXI.autoDetectResource(image);
        resource.internal = true;
        this.setResource(resource);
        this.update();
    };
    var baseTextureIdDeprecation = false;
    Object.defineProperties(BaseTextureAny.prototype, {
        /**
         * @name hasLoaded
         * @memberof PIXI.BaseTexture#
         * @type {boolean}
         * @deprecated since 5.0.0
         * @readonly
         * @see PIXI.BaseTexture#valid
         */
        hasLoaded: {
            get: function () {
                utils.deprecation(v5, 'PIXI.BaseTexture.hasLoaded property has been removed, use PIXI.BaseTexture.valid');
                return this.valid;
            },
        },
        /**
         * @name imageUrl
         * @memberof PIXI.BaseTexture#
         * @type {string}
         * @deprecated since 5.0.0
         * @see PIXI.ImageResource#url
         */
        imageUrl: {
            get: function () {
                var _a;
                utils.deprecation(v5, 'PIXI.BaseTexture.imageUrl property has been removed, use PIXI.BaseTexture.resource.url');
                return (_a = this.resource) === null || _a === void 0 ? void 0 : _a.url;
            },
            set: function (imageUrl) {
                utils.deprecation(v5, 'PIXI.BaseTexture.imageUrl property has been removed, use PIXI.BaseTexture.resource.url');
                if (this.resource) {
                    this.resource.url = imageUrl;
                }
            },
        },
        /**
         * @name source
         * @memberof PIXI.BaseTexture#
         * @type {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|SVGElement}
         * @deprecated since 5.0.0
         * @readonly
         * @see PIXI.BaseImageResource#source
         */
        source: {
            get: function () {
                utils.deprecation(v5, 'PIXI.BaseTexture.source property has been moved, use `PIXI.BaseTexture.resource.source`');
                return this.resource.source;
            },
            set: function (source) {
                utils.deprecation(v5, 'PIXI.BaseTexture.source property has been moved, use `PIXI.BaseTexture.resource.source` '
                    + 'if you want to set HTMLCanvasElement. Otherwise, create new BaseTexture.');
                if (this.resource) {
                    this.resource.source = source;
                }
            },
        },
        /**
         * @name premultiplyAlpha
         * @memberof PIXI.BaseTexture#
         * @type {boolean}
         * @deprecated since 5.2.0
         * @readonly
         * @see PIXI.BaseTexture#alphaMode
         */
        premultiplyAlpha: {
            get: function () {
                utils.deprecation('5.2.0', 'PIXI.BaseTexture.premultiplyAlpha property has been changed to `alphaMode`'
                    + ', see `PIXI.ALPHA_MODES`');
                return this.alphaMode !== 0;
            },
            set: function (value) {
                utils.deprecation('5.2.0', 'PIXI.BaseTexture.premultiplyAlpha property has been changed to `alphaMode`'
                    + ', see `PIXI.ALPHA_MODES`');
                this.alphaMode = Number(value);
            },
        },
        /**
         * Batch local field, stores current texture location
         *
         * @name _id
         * @memberof PIXI.BaseTexture#
         * @deprecated since 5.2.0
         * @type {number}
         * @see PIXI.BaseTexture#_batchLocation
         */
        _id: {
            get: function () {
                if (!baseTextureIdDeprecation) {
                    // #popelyshev: That property was a hot place, I don't want to call deprecation method on it if possible
                    utils.deprecation('5.2.0', 'PIXI.BaseTexture._id batch local field has been changed to `_batchLocation`');
                    baseTextureIdDeprecation = true;
                }
                return this._batchLocation;
            },
            set: function (value) {
                this._batchLocation = value;
            },
        },
    });
    /**
     * @method fromImage
     * @static
     * @memberof PIXI.BaseTexture
     * @deprecated since 5.0.0
     * @see PIXI.BaseTexture.from
     */
    BaseTextureAny.fromImage = function fromImage(canvas, crossorigin, scaleMode, scale) {
        utils.deprecation(v5, 'PIXI.BaseTexture.fromImage method has been replaced with PIXI.BaseTexture.from');
        var resourceOptions = { scale: scale, crossorigin: crossorigin };
        return BaseTextureAny.from(canvas, { scaleMode: scaleMode, resourceOptions: resourceOptions });
    };
    /**
     * @method fromCanvas
     * @static
     * @memberof PIXI.BaseTexture
     * @deprecated since 5.0.0
     * @see PIXI.BaseTexture.from
     */
    BaseTextureAny.fromCanvas = function fromCanvas(canvas, scaleMode) {
        utils.deprecation(v5, 'PIXI.BaseTexture.fromCanvas method has been replaced with PIXI.BaseTexture.from');
        return BaseTextureAny.from(canvas, { scaleMode: scaleMode });
    };
    /**
     * @method fromSVG
     * @static
     * @memberof PIXI.BaseTexture
     * @deprecated since 5.0.0
     * @see PIXI.BaseTexture.from
     */
    BaseTextureAny.fromSVG = function fromSVG(canvas, crossorigin, scaleMode, scale) {
        utils.deprecation(v5, 'PIXI.BaseTexture.fromSVG method has been replaced with PIXI.BaseTexture.from');
        var resourceOptions = { scale: scale, crossorigin: crossorigin };
        return BaseTextureAny.from(canvas, { scaleMode: scaleMode, resourceOptions: resourceOptions });
    };
    Object.defineProperties(PIXI.ImageResource.prototype, {
        /**
         * @name premultiplyAlpha
         * @memberof PIXI.ImageResource#
         * @type {boolean}
         * @deprecated since 5.2.0
         * @readonly
         * @see PIXI.ImageResource#alphaMode
         */
        premultiplyAlpha: {
            get: function () {
                utils.deprecation('5.2.0', 'PIXI.ImageResource.premultiplyAlpha property '
                    + 'has been changed to `alphaMode`, see `PIXI.ALPHA_MODES`');
                return this.alphaMode !== 0;
            },
            set: function (value) {
                utils.deprecation('5.2.0', 'PIXI.ImageResource.premultiplyAlpha property '
                    + 'has been changed to `alphaMode`, see `PIXI.ALPHA_MODES`');
                this.alphaMode = Number(value);
            },
        },
    });
    /**
     * @method PIXI.Point#copy
     * @deprecated since 5.0.0
     * @see PIXI.Point#copyFrom
     */
    PIXI.Point.prototype.copy = function copy(p) {
        utils.deprecation(v5, 'PIXI.Point.copy method has been replaced with PIXI.Point.copyFrom');
        return this.copyFrom(p);
    };
    /**
     * @method PIXI.ObservablePoint#copy
     * @deprecated since 5.0.0
     * @see PIXI.ObservablePoint#copyFrom
     */
    PIXI.ObservablePoint.prototype.copy = function copy(p) {
        utils.deprecation(v5, 'PIXI.ObservablePoint.copy method has been replaced with PIXI.ObservablePoint.copyFrom');
        return this.copyFrom(p);
    };
    /**
     * @method PIXI.Rectangle#copy
     * @deprecated since 5.0.0
     * @see PIXI.Rectangle#copyFrom
     */
    PIXI.Rectangle.prototype.copy = function copy(p) {
        utils.deprecation(v5, 'PIXI.Rectangle.copy method has been replaced with PIXI.Rectangle.copyFrom');
        return this.copyFrom(p);
    };
    /**
     * @method PIXI.Matrix#copy
     * @deprecated since 5.0.0
     * @see PIXI.Matrix#copyTo
     */
    PIXI.Matrix.prototype.copy = function copy(p) {
        utils.deprecation(v5, 'PIXI.Matrix.copy method has been replaced with PIXI.Matrix.copyTo');
        return this.copyTo(p);
    };
    /**
     * @method PIXI.StateSystem#setState
     * @deprecated since 5.1.0
     * @see PIXI.StateSystem#set
     */
    PIXI.StateSystem.prototype.setState = function setState(s) {
        utils.deprecation('v5.1.0', 'StateSystem.setState has been renamed to StateSystem.set');
        return this.set(s);
    };
    Object.assign(PIXI.FilterSystem.prototype, {
        /**
         * @method PIXI.FilterManager#getRenderTarget
         * @deprecated since 5.0.0
         * @see PIXI.FilterSystem#getFilterTexture
         */
        getRenderTarget: function (_clear, resolution) {
            utils.deprecation(v5, 'PIXI.FilterManager.getRenderTarget method has been replaced with PIXI.FilterSystem#getFilterTexture');
            return this.getFilterTexture(null, resolution);
        },
        /**
         * @method PIXI.FilterManager#returnRenderTarget
         * @deprecated since 5.0.0
         * @see PIXI.FilterSystem#returnFilterTexture
         */
        returnRenderTarget: function (renderTexture) {
            utils.deprecation(v5, 'PIXI.FilterManager.returnRenderTarget method has been replaced with '
                + 'PIXI.FilterSystem.returnFilterTexture');
            this.returnFilterTexture(renderTexture);
        },
        /**
         * @method PIXI.FilterSystem#calculateScreenSpaceMatrix
         * @deprecated since 5.0.0
         * @param {PIXI.Matrix} outputMatrix - the matrix to output to.
         * @return {PIXI.Matrix} The mapped matrix.
         */
        calculateScreenSpaceMatrix: function (outputMatrix) {
            utils.deprecation(v5, 'PIXI.FilterSystem.calculateScreenSpaceMatrix method is removed, '
                + 'use `(vTextureCoord * inputSize.xy) + outputFrame.xy` instead');
            var mappedMatrix = outputMatrix.identity();
            var _a = this.activeState, sourceFrame = _a.sourceFrame, destinationFrame = _a.destinationFrame;
            mappedMatrix.translate(sourceFrame.x / destinationFrame.width, sourceFrame.y / destinationFrame.height);
            mappedMatrix.scale(destinationFrame.width, destinationFrame.height);
            return mappedMatrix;
        },
        /**
         * @method PIXI.FilterSystem#calculateNormalizedScreenSpaceMatrix
         * @deprecated since 5.0.0
         * @param {PIXI.Matrix} outputMatrix - The matrix to output to.
         * @return {PIXI.Matrix} The mapped matrix.
         */
        calculateNormalizedScreenSpaceMatrix: function (outputMatrix) {
            utils.deprecation(v5, 'PIXI.FilterManager.calculateNormalizedScreenSpaceMatrix method is removed, '
                + 'use `((vTextureCoord * inputSize.xy) + outputFrame.xy) / outputFrame.zw` instead.');
            var _a = this.activeState, sourceFrame = _a.sourceFrame, destinationFrame = _a.destinationFrame;
            var mappedMatrix = outputMatrix.identity();
            mappedMatrix.translate(sourceFrame.x / destinationFrame.width, sourceFrame.y / destinationFrame.height);
            var translateScaleX = (destinationFrame.width / sourceFrame.width);
            var translateScaleY = (destinationFrame.height / sourceFrame.height);
            mappedMatrix.scale(translateScaleX, translateScaleY);
            return mappedMatrix;
        },
    });
    Object.defineProperties(PIXI.RenderTexture.prototype, {
        /**
         * @name sourceFrame
         * @memberof PIXI.RenderTexture#
         * @type {PIXI.Rectangle}
         * @deprecated since 5.0.0
         * @readonly
         */
        sourceFrame: {
            get: function () {
                utils.deprecation(v5, 'PIXI.RenderTexture.sourceFrame property has been removed');
                return this.filterFrame;
            },
        },
        /**
         * @name size
         * @memberof PIXI.RenderTexture#
         * @type {PIXI.Rectangle}
         * @deprecated since 5.0.0
         * @readonly
         */
        size: {
            get: function () {
                utils.deprecation(v5, 'PIXI.RenderTexture.size property has been removed');
                return this._frame;
            },
        },
    });
    /**
     * @class BlurXFilter
     * @memberof PIXI.filters
     * @deprecated since 5.0.0
     * @see PIXI.filters.BlurFilterPass
     */
    var BlurXFilter = /** @class */ (function (_super) {
        __extends(BlurXFilter, _super);
        function BlurXFilter(strength, quality, resolution, kernelSize) {
            var _this = this;
            utils.deprecation(v5, 'PIXI.filters.BlurXFilter class is deprecated, use PIXI.filters.BlurFilterPass');
            _this = _super.call(this, true, strength, quality, resolution, kernelSize) || this;
            return _this;
        }
        return BlurXFilter;
    }(PIXI.filters.BlurFilterPass));
    /**
     * @class BlurYFilter
     * @memberof PIXI.filters
     * @deprecated since 5.0.0
     * @see PIXI.filters.BlurFilterPass
     */
    var BlurYFilter = /** @class */ (function (_super) {
        __extends(BlurYFilter, _super);
        function BlurYFilter(strength, quality, resolution, kernelSize) {
            var _this = this;
            utils.deprecation(v5, 'PIXI.filters.BlurYFilter class is deprecated, use PIXI.filters.BlurFilterPass');
            _this = _super.call(this, false, strength, quality, resolution, kernelSize) || this;
            return _this;
        }
        return BlurYFilter;
    }(PIXI.filters.BlurFilterPass));
    Object.assign(PIXI.filters, {
        BlurXFilter: BlurXFilter,
        BlurYFilter: BlurYFilter,
    });
    var SpriteAny = PIXI.Sprite, TextureAny = PIXI.Texture, GraphicsAny = PIXI.Graphics;
    // Support for pixi.js-legacy bifurcation
    // give users a friendly assist to use legacy
    if (!GraphicsAny.prototype.generateCanvasTexture) {
        GraphicsAny.prototype.generateCanvasTexture = function generateCanvasTexture() {
            utils.deprecation(v5, 'PIXI.Graphics.generateCanvasTexture method is only available in "pixi.js-legacy"');
        };
    }
    /**
     * @deprecated since 5.0.0
     * @member {PIXI.Graphics} PIXI.Graphics#graphicsData
     * @see PIXI.Graphics#geometry
     * @readonly
     */
    Object.defineProperty(GraphicsAny.prototype, 'graphicsData', {
        get: function () {
            utils.deprecation(v5, 'PIXI.Graphics.graphicsData property is deprecated, use PIXI.Graphics.geometry.graphicsData');
            return this.geometry.graphicsData;
        },
    });
    // Use these to deprecate all the Sprite from* methods
    function spriteFrom(name, source, crossorigin, scaleMode) {
        utils.deprecation(v5, "PIXI.Sprite." + name + " method is deprecated, use PIXI.Sprite.from");
        return SpriteAny.from(source, {
            resourceOptions: {
                scale: scaleMode,
                crossorigin: crossorigin,
            },
        });
    }
    /**
     * @deprecated since 5.0.0
     * @see PIXI.Sprite.from
     * @method PIXI.Sprite.fromImage
     * @return {PIXI.Sprite}
     */
    SpriteAny.fromImage = spriteFrom.bind(null, 'fromImage');
    /**
     * @deprecated since 5.0.0
     * @method PIXI.Sprite.fromSVG
     * @see PIXI.Sprite.from
     * @return {PIXI.Sprite}
     */
    SpriteAny.fromSVG = spriteFrom.bind(null, 'fromSVG');
    /**
     * @deprecated since 5.0.0
     * @method PIXI.Sprite.fromCanvas
     * @see PIXI.Sprite.from
     * @return {PIXI.Sprite}
     */
    SpriteAny.fromCanvas = spriteFrom.bind(null, 'fromCanvas');
    /**
     * @deprecated since 5.0.0
     * @method PIXI.Sprite.fromVideo
     * @see PIXI.Sprite.from
     * @return {PIXI.Sprite}
     */
    SpriteAny.fromVideo = spriteFrom.bind(null, 'fromVideo');
    /**
     * @deprecated since 5.0.0
     * @method PIXI.Sprite.fromFrame
     * @see PIXI.Sprite.from
     * @return {PIXI.Sprite}
     */
    SpriteAny.fromFrame = spriteFrom.bind(null, 'fromFrame');
    // Use these to deprecate all the Texture from* methods
    function textureFrom(name, source, crossorigin, scaleMode) {
        utils.deprecation(v5, "PIXI.Texture." + name + " method is deprecated, use PIXI.Texture.from");
        return TextureAny.from(source, {
            resourceOptions: {
                scale: scaleMode,
                crossorigin: crossorigin,
            },
        });
    }
    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromImage
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    TextureAny.fromImage = textureFrom.bind(null, 'fromImage');
    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromSVG
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    TextureAny.fromSVG = textureFrom.bind(null, 'fromSVG');
    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromCanvas
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    TextureAny.fromCanvas = textureFrom.bind(null, 'fromCanvas');
    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromVideo
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    TextureAny.fromVideo = textureFrom.bind(null, 'fromVideo');
    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromFrame
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    TextureAny.fromFrame = textureFrom.bind(null, 'fromFrame');
    /**
     * @deprecated since 5.0.0
     * @member {boolean} PIXI.AbstractRenderer#autoResize
     * @see PIXI.AbstractRenderer#autoDensity
     */
    Object.defineProperty(PIXI.AbstractRenderer.prototype, 'autoResize', {
        get: function () {
            utils.deprecation(v5, 'PIXI.AbstractRenderer.autoResize property is deprecated, '
                + 'use PIXI.AbstractRenderer.autoDensity');
            return this.autoDensity;
        },
        set: function (value) {
            utils.deprecation(v5, 'PIXI.AbstractRenderer.autoResize property is deprecated, '
                + 'use PIXI.AbstractRenderer.autoDensity');
            this.autoDensity = value;
        },
    });
    /**
     * @deprecated since 5.0.0
     * @member {PIXI.TextureSystem} PIXI.Renderer#textureManager
     * @see PIXI.Renderer#texture
     */
    Object.defineProperty(PIXI.Renderer.prototype, 'textureManager', {
        get: function () {
            utils.deprecation(v5, 'PIXI.Renderer.textureManager property is deprecated, use PIXI.Renderer.texture');
            return this.texture;
        },
    });
    /**
     * @namespace PIXI.utils.mixins
     * @deprecated since 5.0.0
     */
    PIXI.utils.mixins = {
        /**
         * @memberof PIXI.utils.mixins
         * @function mixin
         * @deprecated since 5.0.0
         */
        mixin: function () {
            utils.deprecation(v5, 'PIXI.utils.mixins.mixin function is no longer available');
        },
        /**
         * @memberof PIXI.utils.mixins
         * @function delayMixin
         * @deprecated since 5.0.0
         */
        delayMixin: function () {
            utils.deprecation(v5, 'PIXI.utils.mixins.delayMixin function is no longer available');
        },
        /**
         * @memberof PIXI.utils.mixins
         * @function performMixins
         * @deprecated since 5.0.0
         */
        performMixins: function () {
            utils.deprecation(v5, 'PIXI.utils.mixins.performMixins function is no longer available');
        },
    };
    /**
     * @memberof PIXI.BitmapText
     * @member {object} font
     * @deprecated since 5.3.0
     */
    Object.defineProperty(PIXI.BitmapText.prototype, 'font', {
        get: function () {
            utils.deprecation('5.3.0', 'PIXI.BitmapText.font property is deprecated, '
                + 'use fontName, fontSize, tint or align properties');
            return {
                name: this._fontName,
                size: this._fontSize,
                tint: this._tint,
                align: this._align,
            };
        },
        set: function (value) {
            utils.deprecation('5.3.0', 'PIXI.BitmapText.font property is deprecated, '
                + 'use fontName, fontSize, tint or align properties');
            if (!value) {
                return;
            }
            var style = { font: value };
            this._upgradeStyle(style);
            style.fontSize = style.fontSize || PIXI.BitmapFont.available[style.fontName].size;
            this._fontName = style.fontName;
            this._fontSize = style.fontSize;
            this.dirty = true;
        },
    });
}

// Install renderer plugins
core.Renderer.registerPlugin('accessibility', accessibility.AccessibilityManager);
core.Renderer.registerPlugin('extract', extract.Extract);
core.Renderer.registerPlugin('interaction', interaction.InteractionManager);
core.Renderer.registerPlugin('particle', particles.ParticleRenderer);
core.Renderer.registerPlugin('prepare', prepare.Prepare);
core.Renderer.registerPlugin('batch', core.BatchRenderer);
core.Renderer.registerPlugin('tilingSprite', spriteTiling.TilingSpriteRenderer);
// Install loader plugins
loaders.Loader.registerPlugin(textBitmap.BitmapFontLoader);
loaders.Loader.registerPlugin(compressedTextures.CompressedTextureLoader);
loaders.Loader.registerPlugin(compressedTextures.DDSLoader);
loaders.Loader.registerPlugin(compressedTextures.KTXLoader);
loaders.Loader.registerPlugin(spritesheet.SpritesheetLoader);
// Install application plugins
app.Application.registerPlugin(ticker.TickerPlugin);
app.Application.registerPlugin(loaders.AppLoaderPlugin);
/**
 * String of the current PIXI version.
 *
 * @static
 * @constant
 * @memberof PIXI
 * @name VERSION
 * @type {string}
 */
var VERSION = '5.3.2';
/**
 * @namespace PIXI
 */
/**
 * This namespace contains WebGL-only display filters that can be applied
 * to DisplayObjects using the {@link PIXI.DisplayObject#filters filters} property.
 *
 * Since PixiJS only had a handful of built-in filters, additional filters
 * can be downloaded {@link https://github.com/pixijs/pixi-filters here} from the
 * PixiJS Filters repository.
 *
 * All filters must extend {@link PIXI.Filter}.
 *
 * @example
 * // Create a new application
 * const app = new PIXI.Application();
 *
 * // Draw a green rectangle
 * const rect = new PIXI.Graphics()
 *     .beginFill(0x00ff00)
 *     .drawRect(40, 40, 200, 200);
 *
 * // Add a blur filter
 * rect.filters = [new PIXI.filters.BlurFilter()];
 *
 * // Display rectangle
 * app.stage.addChild(rect);
 * document.body.appendChild(app.view);
 * @namespace PIXI.filters
 */
var filters = {
    AlphaFilter: filterAlpha.AlphaFilter,
    BlurFilter: filterBlur.BlurFilter,
    BlurFilterPass: filterBlur.BlurFilterPass,
    ColorMatrixFilter: filterColorMatrix.ColorMatrixFilter,
    DisplacementFilter: filterDisplacement.DisplacementFilter,
    FXAAFilter: filterFxaa.FXAAFilter,
    NoiseFilter: filterNoise.NoiseFilter,
};

Object.keys(accessibility).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return accessibility[key];
        }
    });
});
Object.keys(interaction).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return interaction[key];
        }
    });
});
Object.keys(app).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return app[key];
        }
    });
});
Object.keys(core).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return core[key];
        }
    });
});
Object.keys(extract).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return extract[key];
        }
    });
});
Object.keys(loaders).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return loaders[key];
        }
    });
});
Object.keys(compressedTextures).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return compressedTextures[key];
        }
    });
});
Object.keys(particles).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return particles[key];
        }
    });
});
Object.keys(prepare).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return prepare[key];
        }
    });
});
Object.keys(spritesheet).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return spritesheet[key];
        }
    });
});
Object.keys(spriteTiling).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return spriteTiling[key];
        }
    });
});
Object.keys(textBitmap).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return textBitmap[key];
        }
    });
});
Object.keys(ticker).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return ticker[key];
        }
    });
});
Object.keys(constants).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return constants[key];
        }
    });
});
Object.keys(display).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return display[key];
        }
    });
});
Object.keys(graphics).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return graphics[key];
        }
    });
});
Object.keys(math).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return math[key];
        }
    });
});
Object.keys(mesh).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return mesh[key];
        }
    });
});
Object.keys(meshExtras).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return meshExtras[key];
        }
    });
});
Object.keys(runner).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return runner[key];
        }
    });
});
Object.keys(sprite).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return sprite[key];
        }
    });
});
Object.keys(spriteAnimated).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return spriteAnimated[key];
        }
    });
});
Object.keys(text).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return text[key];
        }
    });
});
Object.keys(settings).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return settings[key];
        }
    });
});
exports.utils = utils;
exports.VERSION = VERSION;
exports.filters = filters;
exports.useDeprecated = useDeprecated;
//# sourceMappingURL=pixi.js.map
