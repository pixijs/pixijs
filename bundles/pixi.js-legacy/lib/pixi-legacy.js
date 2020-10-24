/*!
 * pixi.js-legacy - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * pixi.js-legacy is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var canvasRenderer = require('@pixi/canvas-renderer');
var canvasMesh = require('@pixi/canvas-mesh');
var canvasGraphics = require('@pixi/canvas-graphics');
var canvasSprite = require('@pixi/canvas-sprite');
var canvasExtract = require('@pixi/canvas-extract');
var canvasPrepare = require('@pixi/canvas-prepare');
require('@pixi/canvas-sprite-tiling');
require('@pixi/canvas-particles');
require('@pixi/canvas-display');
require('@pixi/canvas-text');

canvasRenderer.CanvasRenderer.registerPlugin('accessibility', pixi_js.AccessibilityManager);
canvasRenderer.CanvasRenderer.registerPlugin('extract', canvasExtract.CanvasExtract);
canvasRenderer.CanvasRenderer.registerPlugin('graphics', canvasGraphics.CanvasGraphicsRenderer);
canvasRenderer.CanvasRenderer.registerPlugin('interaction', pixi_js.InteractionManager);
canvasRenderer.CanvasRenderer.registerPlugin('mesh', canvasMesh.CanvasMeshRenderer);
canvasRenderer.CanvasRenderer.registerPlugin('prepare', canvasPrepare.CanvasPrepare);
canvasRenderer.CanvasRenderer.registerPlugin('sprite', canvasSprite.CanvasSpriteRenderer);

Object.keys(pixi_js).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return pixi_js[key];
        }
    });
});
Object.defineProperty(exports, 'CanvasRenderer', {
    enumerable: true,
    get: function () {
        return canvasRenderer.CanvasRenderer;
    }
});
Object.defineProperty(exports, 'canvasUtils', {
    enumerable: true,
    get: function () {
        return canvasRenderer.canvasUtils;
    }
});
Object.defineProperty(exports, 'CanvasMeshRenderer', {
    enumerable: true,
    get: function () {
        return canvasMesh.CanvasMeshRenderer;
    }
});
Object.defineProperty(exports, 'CanvasGraphicsRenderer', {
    enumerable: true,
    get: function () {
        return canvasGraphics.CanvasGraphicsRenderer;
    }
});
Object.defineProperty(exports, 'CanvasSpriteRenderer', {
    enumerable: true,
    get: function () {
        return canvasSprite.CanvasSpriteRenderer;
    }
});
Object.defineProperty(exports, 'CanvasExtract', {
    enumerable: true,
    get: function () {
        return canvasExtract.CanvasExtract;
    }
});
Object.defineProperty(exports, 'CanvasPrepare', {
    enumerable: true,
    get: function () {
        return canvasPrepare.CanvasPrepare;
    }
});
//# sourceMappingURL=pixi-legacy.js.map
