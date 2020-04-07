import { SHAPES, Matrix } from '@pixi/math';
import { canvasUtils } from '@pixi/canvas-renderer';
/**
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
export class CanvasGraphicsRenderer
{
    /**
     * @param {PIXI.CanvasRenderer} renderer - The current PIXI renderer.
     */
    constructor(renderer)
    {
        this.renderer = renderer;
        this._svgMatrix = null;
    }

    /**
     * calculates fill/stroke style for canvas
     *
     * @private
     * @param {PIXI.FillStyle} style
     * @param {number} tint
     * @returns {string|CanvasPattern}
     */
    _calcCanvasStyle(style, tint)
    {
        let res;

        if (style.texture)
        {
            if (style.texture.valid)
            {
                res = canvasUtils.getTintedPattern(style.texture, tint);
                this.setPatternTransform(res, style.matrix || Matrix.IDENTITY);
            }
            else
            {
                res = '#808080';
            }
        }
        else
        {
            res = `#${(`00000${(tint | 0).toString(16)}`).substr(-6)}`;
        }

        return res;
    }

    /**
     * Renders a Graphics object to a canvas.
     *
     * @param {PIXI.Graphics} graphics - the actual graphics object to render
     */
    render(graphics)
    {
        const renderer = this.renderer;
        const context = renderer.context;
        const worldAlpha = graphics.worldAlpha;
        const transform = graphics.transform.worldTransform;

        renderer.setContextTransform(transform);
        renderer.setBlendMode(graphics.blendMode);

        const graphicsData = graphics.geometry.graphicsData;

        let contextFillStyle;
        let contextStrokeStyle;

        const tintR = ((graphics.tint >> 16) & 0xFF) / 255;
        const tintG = ((graphics.tint >> 8) & 0xFF) / 255;
        const tintB = (graphics.tint & 0xFF) / 255;

        for (let i = 0; i < graphicsData.length; i++)
        {
            const data = graphicsData[i];
            const shape = data.shape;
            const fillStyle = data.fillStyle;
            const lineStyle = data.lineStyle;

            const fillColor = data.fillStyle.color | 0;
            const lineColor = data.lineStyle.color | 0;

            if (fillStyle.visible)
            {
                const fillTint = (
                    (((fillColor >> 16) & 0xFF) / 255 * tintR * 255 << 16)
                    + (((fillColor >> 8) & 0xFF) / 255 * tintG * 255 << 8)
                    + (((fillColor & 0xFF) / 255) * tintB * 255)
                );

                contextFillStyle = this._calcCanvasStyle(fillStyle, fillTint);
            }
            if (lineStyle.visible)
            {
                const lineTint = (
                    (((lineColor >> 16) & 0xFF) / 255 * tintR * 255 << 16)
                    + (((lineColor >> 8) & 0xFF) / 255 * tintG * 255 << 8)
                    + (((lineColor & 0xFF) / 255) * tintB * 255)
                );

                contextStrokeStyle = this._calcCanvasStyle(lineStyle, lineTint);
            }

            context.lineWidth = lineStyle.width;
            context.lineCap = lineStyle.cap;
            context.lineJoin = lineStyle.join;
            context.miterLimit = lineStyle.miterLimit;

            if (data.type === SHAPES.POLY)
            {
                context.beginPath();

                let points = shape.points;
                const holes = data.holes;
                let outerArea;
                let innerArea;
                let px;
                let py;

                context.moveTo(points[0], points[1]);

                for (let j = 2; j < points.length; j += 2)
                {
                    context.lineTo(points[j], points[j + 1]);
                }

                if (shape.closeStroke)
                {
                    context.closePath();
                }

                if (holes.length > 0)
                {
                    outerArea = 0;
                    px = points[0];
                    py = points[1];
                    for (let j = 2; j + 2 < points.length; j += 2)
                    {
                        outerArea += ((points[j] - px) * (points[j + 3] - py))
                            - ((points[j + 2] - px) * (points[j + 1] - py));
                    }

                    for (let k = 0; k < holes.length; k++)
                    {
                        points = holes[k].shape.points;

                        if (!points)
                        {
                            continue;
                        }

                        innerArea = 0;
                        px = points[0];
                        py = points[1];
                        for (let j = 2; j + 2 < points.length; j += 2)
                        {
                            innerArea += ((points[j] - px) * (points[j + 3] - py))
                                - ((points[j + 2] - px) * (points[j + 1] - py));
                        }

                        if (innerArea * outerArea < 0)
                        {
                            context.moveTo(points[0], points[1]);

                            for (let j = 2; j < points.length; j += 2)
                            {
                                context.lineTo(points[j], points[j + 1]);
                            }
                        }
                        else
                        {
                            context.moveTo(points[points.length - 2], points[points.length - 1]);

                            for (let j = points.length - 4; j >= 0; j -= 2)
                            {
                                context.lineTo(points[j], points[j + 1]);
                            }
                        }

                        if (holes[k].shape.closeStroke)
                        {
                            context.closePath();
                        }
                    }
                }

                if (fillStyle.visible)
                {
                    context.globalAlpha = fillStyle.alpha * worldAlpha;
                    context.fillStyle = contextFillStyle;
                    context.fill();
                }

                if (lineStyle.visible)
                {
                    context.globalAlpha = lineStyle.alpha * worldAlpha;
                    context.strokeStyle = contextStrokeStyle;
                    context.stroke();
                }
            }
            else if (data.type === SHAPES.RECT)
            {
                if (fillStyle.visible)
                {
                    context.globalAlpha = fillStyle.alpha * worldAlpha;
                    context.fillStyle = contextFillStyle;
                    context.fillRect(shape.x, shape.y, shape.width, shape.height);
                }
                if (lineStyle.visible)
                {
                    context.globalAlpha = lineStyle.alpha * worldAlpha;
                    context.strokeStyle = contextStrokeStyle;
                    context.strokeRect(shape.x, shape.y, shape.width, shape.height);
                }
            }
            else if (data.type === SHAPES.CIRC)
            {
                // TODO - need to be Undefined!
                context.beginPath();
                context.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
                context.closePath();

                if (fillStyle.visible)
                {
                    context.globalAlpha = fillStyle.alpha * worldAlpha;
                    context.fillStyle = contextFillStyle;
                    context.fill();
                }

                if (lineStyle.visible)
                {
                    context.globalAlpha = lineStyle.alpha * worldAlpha;
                    context.strokeStyle = contextStrokeStyle;
                    context.stroke();
                }
            }
            else if (data.type === SHAPES.ELIP)
            {
                // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

                const w = shape.width * 2;
                const h = shape.height * 2;

                const x = shape.x - (w / 2);
                const y = shape.y - (h / 2);

                context.beginPath();

                const kappa = 0.5522848;
                const ox = (w / 2) * kappa; // control point offset horizontal
                const oy = (h / 2) * kappa; // control point offset vertical
                const xe = x + w; // x-end
                const ye = y + h; // y-end
                const xm = x + (w / 2); // x-middle
                const ym = y + (h / 2); // y-middle

                context.moveTo(x, ym);
                context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
                context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
                context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

                context.closePath();

                if (fillStyle.visible)
                {
                    context.globalAlpha = fillStyle.alpha * worldAlpha;
                    context.fillStyle = contextFillStyle;
                    context.fill();
                }
                if (lineStyle.visible)
                {
                    context.globalAlpha = lineStyle.alpha * worldAlpha;
                    context.strokeStyle = contextStrokeStyle;
                    context.stroke();
                }
            }
            else if (data.type === SHAPES.RREC)
            {
                const rx = shape.x;
                const ry = shape.y;
                const width = shape.width;
                const height = shape.height;
                let radius = shape.radius;

                const maxRadius = Math.min(width, height) / 2 | 0;

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

                if (fillStyle.visible)
                {
                    context.globalAlpha = fillStyle.alpha * worldAlpha;
                    context.fillStyle = contextFillStyle;
                    context.fill();
                }
                if (lineStyle.visible)
                {
                    context.globalAlpha = lineStyle.alpha * worldAlpha;
                    context.strokeStyle = contextStrokeStyle;
                    context.stroke();
                }
            }
        }
    }

    setPatternTransform(pattern, matrix)
    {
        if (this._svgMatrix === false)
        {
            return;
        }
        if (!this._svgMatrix)
        {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

            if (svg)
            {
                this._svgMatrix = svg.createSVGMatrix();
            }
            if (!this._svgMatrix)
            {
                this._svgMatrix = false;
            }
        }

        this._svgMatrix.a = matrix.a;
        this._svgMatrix.b = matrix.b;
        this._svgMatrix.c = matrix.c;
        this._svgMatrix.d = matrix.d;
        this._svgMatrix.e = matrix.tx;
        this._svgMatrix.f = matrix.ty;
        pattern.setTransform(this._svgMatrix.inverse());
    }
    /**
     * destroy graphics object
     *
     */
    destroy()
    {
        this.renderer = null;
    }
}
