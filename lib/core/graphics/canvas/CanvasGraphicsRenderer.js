'use strict';

exports.__esModule = true;

var _CanvasRenderer = require('../../renderers/canvas/CanvasRenderer');

var _CanvasRenderer2 = _interopRequireDefault(_CanvasRenderer);

var _const = require('../../const');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
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
 * @private
 * @memberof PIXI
 */
var CanvasGraphicsRenderer = function () {
    /**
     * @param {PIXI.CanvasRenderer} renderer - The current PIXI renderer.
     */
    function CanvasGraphicsRenderer(renderer) {
        _classCallCheck(this, CanvasGraphicsRenderer);

        this.renderer = renderer;
    }

    /**
     * Renders a Graphics object to a canvas.
     *
     * @param {PIXI.Graphics} graphics - the actual graphics object to render
     */


    CanvasGraphicsRenderer.prototype.render = function render(graphics) {
        var renderer = this.renderer;
        var context = renderer.context;
        var worldAlpha = graphics.worldAlpha;
        var transform = graphics.transform.worldTransform;
        var resolution = renderer.resolution;

        // if the tint has changed, set the graphics object to dirty.
        if (this._prevTint !== this.tint) {
            this.dirty = true;
        }

        context.setTransform(transform.a * resolution, transform.b * resolution, transform.c * resolution, transform.d * resolution, transform.tx * resolution, transform.ty * resolution);

        if (graphics.dirty) {
            this.updateGraphicsTint(graphics);
            graphics.dirty = false;
        }

        renderer.setBlendMode(graphics.blendMode);

        for (var i = 0; i < graphics.graphicsData.length; i++) {
            var data = graphics.graphicsData[i];
            var shape = data.shape;

            var fillColor = data._fillTint;
            var lineColor = data._lineTint;

            context.lineWidth = data.lineWidth;

            if (data.type === _const.SHAPES.POLY) {
                context.beginPath();

                this.renderPolygon(shape.points, shape.closed, context);

                for (var j = 0; j < data.holes.length; j++) {
                    this.renderPolygon(data.holes[j].points, true, context);
                }

                if (data.fill) {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = '#' + ('00000' + (fillColor | 0).toString(16)).substr(-6);
                    context.fill();
                }
                if (data.lineWidth) {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.strokeStyle = '#' + ('00000' + (lineColor | 0).toString(16)).substr(-6);
                    context.stroke();
                }
            } else if (data.type === _const.SHAPES.RECT) {
                if (data.fillColor || data.fillColor === 0) {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = '#' + ('00000' + (fillColor | 0).toString(16)).substr(-6);
                    context.fillRect(shape.x, shape.y, shape.width, shape.height);
                }
                if (data.lineWidth) {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.strokeStyle = '#' + ('00000' + (lineColor | 0).toString(16)).substr(-6);
                    context.strokeRect(shape.x, shape.y, shape.width, shape.height);
                }
            } else if (data.type === _const.SHAPES.CIRC) {
                // TODO - need to be Undefined!
                context.beginPath();
                context.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
                context.closePath();

                if (data.fill) {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = '#' + ('00000' + (fillColor | 0).toString(16)).substr(-6);
                    context.fill();
                }
                if (data.lineWidth) {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.strokeStyle = '#' + ('00000' + (lineColor | 0).toString(16)).substr(-6);
                    context.stroke();
                }
            } else if (data.type === _const.SHAPES.ELIP) {
                // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

                var w = shape.width * 2;
                var h = shape.height * 2;

                var x = shape.x - w / 2;
                var y = shape.y - h / 2;

                context.beginPath();

                var kappa = 0.5522848;
                var ox = w / 2 * kappa; // control point offset horizontal
                var oy = h / 2 * kappa; // control point offset vertical
                var xe = x + w; // x-end
                var ye = y + h; // y-end
                var xm = x + w / 2; // x-middle
                var ym = y + h / 2; // y-middle

                context.moveTo(x, ym);
                context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
                context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
                context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

                context.closePath();

                if (data.fill) {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = '#' + ('00000' + (fillColor | 0).toString(16)).substr(-6);
                    context.fill();
                }
                if (data.lineWidth) {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.strokeStyle = '#' + ('00000' + (lineColor | 0).toString(16)).substr(-6);
                    context.stroke();
                }
            } else if (data.type === _const.SHAPES.RREC) {
                var rx = shape.x;
                var ry = shape.y;
                var width = shape.width;
                var height = shape.height;
                var radius = shape.radius;

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

                if (data.fillColor || data.fillColor === 0) {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = '#' + ('00000' + (fillColor | 0).toString(16)).substr(-6);
                    context.fill();
                }

                if (data.lineWidth) {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.strokeStyle = '#' + ('00000' + (lineColor | 0).toString(16)).substr(-6);
                    context.stroke();
                }
            }
        }
    };

    /**
     * Updates the tint of a graphics object
     *
     * @private
     * @param {PIXI.Graphics} graphics - the graphics that will have its tint updated
     */


    CanvasGraphicsRenderer.prototype.updateGraphicsTint = function updateGraphicsTint(graphics) {
        graphics._prevTint = graphics.tint;

        var tintR = (graphics.tint >> 16 & 0xFF) / 255;
        var tintG = (graphics.tint >> 8 & 0xFF) / 255;
        var tintB = (graphics.tint & 0xFF) / 255;

        for (var i = 0; i < graphics.graphicsData.length; ++i) {
            var data = graphics.graphicsData[i];

            var fillColor = data.fillColor | 0;
            var lineColor = data.lineColor | 0;

            // super inline cos im an optimization NAZI :)
            data._fillTint = ((fillColor >> 16 & 0xFF) / 255 * tintR * 255 << 16) + ((fillColor >> 8 & 0xFF) / 255 * tintG * 255 << 8) + (fillColor & 0xFF) / 255 * tintB * 255;

            data._lineTint = ((lineColor >> 16 & 0xFF) / 255 * tintR * 255 << 16) + ((lineColor >> 8 & 0xFF) / 255 * tintG * 255 << 8) + (lineColor & 0xFF) / 255 * tintB * 255;
        }
    };

    /**
     * Renders a polygon.
     *
     * @param {PIXI.Point[]} points - The points to render
     * @param {boolean} close - Should the polygon be closed
     * @param {CanvasRenderingContext2D} context - The rendering context to use
     */


    CanvasGraphicsRenderer.prototype.renderPolygon = function renderPolygon(points, close, context) {
        context.moveTo(points[0], points[1]);

        for (var j = 1; j < points.length / 2; ++j) {
            context.lineTo(points[j * 2], points[j * 2 + 1]);
        }

        if (close) {
            context.closePath();
        }
    };

    /**
     * destroy graphics object
     *
     */


    CanvasGraphicsRenderer.prototype.destroy = function destroy() {
        this.renderer = null;
    };

    return CanvasGraphicsRenderer;
}();

exports.default = CanvasGraphicsRenderer;


_CanvasRenderer2.default.registerPlugin('graphics', CanvasGraphicsRenderer);
//# sourceMappingURL=CanvasGraphicsRenderer.js.map