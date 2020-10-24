/*!
 * @pixi/canvas-graphics - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/canvas-graphics is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var math = require('@pixi/math');
var canvasRenderer$1 = require('@pixi/canvas-renderer');
var graphics = require('@pixi/graphics');
var core = require('@pixi/core');

/*
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original PixiJS version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they
 * now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's CanvasGraphicsRenderer:
 * https://github.com/libgdx/libgdx/blob/1.0.0/gdx/src/com/badlogic/gdx/graphics/glutils/ShapeRenderer.java
 */
/**
 * Renderer dedicated to drawing and batching graphics objects.
 *
 * @class
 * @protected
 * @memberof PIXI
 */
var CanvasGraphicsRenderer = /** @class */ (function () {
    /**
     * @param {PIXI.CanvasRenderer} renderer - The current PIXI renderer.
     */
    function CanvasGraphicsRenderer(renderer) {
        this.renderer = renderer;
        this._svgMatrix = null;
        this._tempMatrix = new math.Matrix();
    }
    /**
     * calculates fill/stroke style for canvas
     *
     * @private
     * @param {PIXI.FillStyle} style
     * @param {number} tint
     * @returns {string|CanvasPattern}
     */
    CanvasGraphicsRenderer.prototype._calcCanvasStyle = function (style, tint) {
        var res;
        if (style.texture) {
            if (style.texture.valid) {
                res = canvasRenderer$1.canvasUtils.getTintedPattern(style.texture, tint);
                this.setPatternTransform(res, style.matrix || math.Matrix.IDENTITY);
            }
            else {
                res = '#808080';
            }
        }
        else {
            res = "#" + ("00000" + (tint | 0).toString(16)).substr(-6);
        }
        return res;
    };
    /**
     * Renders a Graphics object to a canvas.
     *
     * @param {PIXI.Graphics} graphics - the actual graphics object to render
     */
    CanvasGraphicsRenderer.prototype.render = function (graphics) {
        var renderer = this.renderer;
        var context = renderer.context;
        var worldAlpha = graphics.worldAlpha;
        var transform = graphics.transform.worldTransform;
        renderer.setContextTransform(transform);
        renderer.setBlendMode(graphics.blendMode);
        var graphicsData = graphics.geometry.graphicsData;
        var contextFillStyle;
        var contextStrokeStyle;
        var tintR = ((graphics.tint >> 16) & 0xFF) / 255;
        var tintG = ((graphics.tint >> 8) & 0xFF) / 255;
        var tintB = (graphics.tint & 0xFF) / 255;
        for (var i = 0; i < graphicsData.length; i++) {
            var data = graphicsData[i];
            var shape = data.shape;
            var fillStyle = data.fillStyle;
            var lineStyle = data.lineStyle;
            var fillColor = data.fillStyle.color | 0;
            var lineColor = data.lineStyle.color | 0;
            if (data.matrix) {
                renderer.setContextTransform(transform.copyTo(this._tempMatrix).append(data.matrix));
            }
            if (fillStyle.visible) {
                var fillTint = ((((fillColor >> 16) & 0xFF) / 255 * tintR * 255 << 16)
                    + (((fillColor >> 8) & 0xFF) / 255 * tintG * 255 << 8)
                    + (((fillColor & 0xFF) / 255) * tintB * 255));
                contextFillStyle = this._calcCanvasStyle(fillStyle, fillTint);
            }
            if (lineStyle.visible) {
                var lineTint = ((((lineColor >> 16) & 0xFF) / 255 * tintR * 255 << 16)
                    + (((lineColor >> 8) & 0xFF) / 255 * tintG * 255 << 8)
                    + (((lineColor & 0xFF) / 255) * tintB * 255));
                contextStrokeStyle = this._calcCanvasStyle(lineStyle, lineTint);
            }
            context.lineWidth = lineStyle.width;
            context.lineCap = lineStyle.cap;
            context.lineJoin = lineStyle.join;
            context.miterLimit = lineStyle.miterLimit;
            if (data.type === math.SHAPES.POLY) {
                context.beginPath();
                var tempShape = shape;
                var points = tempShape.points;
                var holes = data.holes;
                var outerArea = void 0;
                var innerArea = void 0;
                var px = void 0;
                var py = void 0;
                context.moveTo(points[0], points[1]);
                for (var j = 2; j < points.length; j += 2) {
                    context.lineTo(points[j], points[j + 1]);
                }
                if (tempShape.closeStroke) {
                    context.closePath();
                }
                if (holes.length > 0) {
                    outerArea = 0;
                    px = points[0];
                    py = points[1];
                    for (var j = 2; j + 2 < points.length; j += 2) {
                        outerArea += ((points[j] - px) * (points[j + 3] - py))
                            - ((points[j + 2] - px) * (points[j + 1] - py));
                    }
                    for (var k = 0; k < holes.length; k++) {
                        points = holes[k].shape.points;
                        if (!points) {
                            continue;
                        }
                        innerArea = 0;
                        px = points[0];
                        py = points[1];
                        for (var j = 2; j + 2 < points.length; j += 2) {
                            innerArea += ((points[j] - px) * (points[j + 3] - py))
                                - ((points[j + 2] - px) * (points[j + 1] - py));
                        }
                        if (innerArea * outerArea < 0) {
                            context.moveTo(points[0], points[1]);
                            for (var j = 2; j < points.length; j += 2) {
                                context.lineTo(points[j], points[j + 1]);
                            }
                        }
                        else {
                            context.moveTo(points[points.length - 2], points[points.length - 1]);
                            for (var j = points.length - 4; j >= 0; j -= 2) {
                                context.lineTo(points[j], points[j + 1]);
                            }
                        }
                        if (holes[k].shape.closeStroke) {
                            context.closePath();
                        }
                    }
                }
                if (fillStyle.visible) {
                    context.globalAlpha = fillStyle.alpha * worldAlpha;
                    context.fillStyle = contextFillStyle;
                    context.fill();
                }
                if (lineStyle.visible) {
                    context.globalAlpha = lineStyle.alpha * worldAlpha;
                    context.strokeStyle = contextStrokeStyle;
                    context.stroke();
                }
            }
            else if (data.type === math.SHAPES.RECT) {
                var tempShape = shape;
                if (fillStyle.visible) {
                    context.globalAlpha = fillStyle.alpha * worldAlpha;
                    context.fillStyle = contextFillStyle;
                    context.fillRect(tempShape.x, tempShape.y, tempShape.width, tempShape.height);
                }
                if (lineStyle.visible) {
                    context.globalAlpha = lineStyle.alpha * worldAlpha;
                    context.strokeStyle = contextStrokeStyle;
                    context.strokeRect(tempShape.x, tempShape.y, tempShape.width, tempShape.height);
                }
            }
            else if (data.type === math.SHAPES.CIRC) {
                var tempShape = shape;
                // TODO - need to be Undefined!
                context.beginPath();
                context.arc(tempShape.x, tempShape.y, tempShape.radius, 0, 2 * Math.PI);
                context.closePath();
                if (fillStyle.visible) {
                    context.globalAlpha = fillStyle.alpha * worldAlpha;
                    context.fillStyle = contextFillStyle;
                    context.fill();
                }
                if (lineStyle.visible) {
                    context.globalAlpha = lineStyle.alpha * worldAlpha;
                    context.strokeStyle = contextStrokeStyle;
                    context.stroke();
                }
            }
            else if (data.type === math.SHAPES.ELIP) {
                // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
                var tempShape = shape;
                var w = tempShape.width * 2;
                var h = tempShape.height * 2;
                var x = tempShape.x - (w / 2);
                var y = tempShape.y - (h / 2);
                context.beginPath();
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
                if (fillStyle.visible) {
                    context.globalAlpha = fillStyle.alpha * worldAlpha;
                    context.fillStyle = contextFillStyle;
                    context.fill();
                }
                if (lineStyle.visible) {
                    context.globalAlpha = lineStyle.alpha * worldAlpha;
                    context.strokeStyle = contextStrokeStyle;
                    context.stroke();
                }
            }
            else if (data.type === math.SHAPES.RREC) {
                var tempShape = shape;
                var rx = tempShape.x;
                var ry = tempShape.y;
                var width = tempShape.width;
                var height = tempShape.height;
                var radius = tempShape.radius;
                var maxRadius = Math.min(width, height) / 2 | 0;
                radius = radius > maxRadius ? maxRadius : radius;
                context.beginPath();
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
                if (fillStyle.visible) {
                    context.globalAlpha = fillStyle.alpha * worldAlpha;
                    context.fillStyle = contextFillStyle;
                    context.fill();
                }
                if (lineStyle.visible) {
                    context.globalAlpha = lineStyle.alpha * worldAlpha;
                    context.strokeStyle = contextStrokeStyle;
                    context.stroke();
                }
            }
        }
    };
    CanvasGraphicsRenderer.prototype.setPatternTransform = function (pattern, matrix) {
        if (this._svgMatrix === false) {
            return;
        }
        if (!this._svgMatrix) {
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            if (svg && svg.createSVGMatrix) {
                this._svgMatrix = svg.createSVGMatrix();
            }
            if (!this._svgMatrix || !pattern.setTransform) {
                this._svgMatrix = false;
                return;
            }
        }
        this._svgMatrix.a = matrix.a;
        this._svgMatrix.b = matrix.b;
        this._svgMatrix.c = matrix.c;
        this._svgMatrix.d = matrix.d;
        this._svgMatrix.e = matrix.tx;
        this._svgMatrix.f = matrix.ty;
        pattern.setTransform(this._svgMatrix.inverse());
    };
    /**
     * destroy graphics object
     *
     */
    CanvasGraphicsRenderer.prototype.destroy = function () {
        this.renderer = null;
        this._svgMatrix = null;
        this._tempMatrix = null;
    };
    return CanvasGraphicsRenderer;
}());

var canvasRenderer;
var tempMatrix = new math.Matrix();
/**
 * Generates a canvas texture. Only available with **pixi.js-legacy** bundle
 * or the **@pixi/canvas-graphics** package.
 * @method generateCanvasTexture
 * @memberof PIXI.Graphics#
 * @param {PIXI.SCALE_MODES} scaleMode - The scale mode of the texture.
 * @param {number} resolution - The resolution of the texture.
 * @return {PIXI.Texture} The new texture.
 */
graphics.Graphics.prototype.generateCanvasTexture = function generateCanvasTexture(scaleMode, resolution) {
    if (resolution === void 0) { resolution = 1; }
    var bounds = this.getLocalBounds();
    var canvasBuffer = core.RenderTexture.create({
        width: bounds.width,
        height: bounds.height,
        scaleMode: scaleMode,
        resolution: resolution,
    });
    if (!canvasRenderer) {
        canvasRenderer = new canvasRenderer$1.CanvasRenderer();
    }
    this.transform.updateLocalTransform();
    this.transform.localTransform.copyTo(tempMatrix);
    tempMatrix.invert();
    tempMatrix.tx -= bounds.x;
    tempMatrix.ty -= bounds.y;
    canvasRenderer.render(this, canvasBuffer, true, tempMatrix);
    var texture = core.Texture.from(canvasBuffer.baseTexture._canvasRenderTarget.canvas, {
        scaleMode: scaleMode,
    });
    texture.baseTexture.setResolution(resolution);
    return texture;
};
graphics.Graphics.prototype.cachedGraphicsData = [];
/**
 * Renders the object using the Canvas renderer
 *
 * @method _renderCanvas
 * @memberof PIXI.Graphics#
 * @private
 * @param {PIXI.CanvasRenderer} renderer - The renderer
 */
graphics.Graphics.prototype._renderCanvas = function _renderCanvas(renderer) {
    if (this.isMask === true) {
        return;
    }
    this.finishPoly();
    renderer.plugins.graphics.render(this);
};

exports.CanvasGraphicsRenderer = CanvasGraphicsRenderer;
//# sourceMappingURL=canvas-graphics.js.map
