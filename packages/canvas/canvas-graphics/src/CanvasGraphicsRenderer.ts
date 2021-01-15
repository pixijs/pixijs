import { Texture } from '@pixi/core';
import { SHAPES, Matrix } from '@pixi/math';
import { canvasUtils } from '@pixi/canvas-renderer';
import { BLEND_MODES } from '@pixi/constants';

import type { CanvasRenderer } from '@pixi/canvas-renderer';
import type { FillStyle, Graphics } from '@pixi/graphics';
import type { Polygon, Rectangle, Circle, Ellipse, RoundedRectangle } from '@pixi/math';

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
export class CanvasGraphicsRenderer
{
    public renderer: CanvasRenderer;
    private _svgMatrix: DOMMatrix|boolean;
    private _tempMatrix: Matrix;

    /**
     * @param {PIXI.CanvasRenderer} renderer - The current PIXI renderer.
     */
    constructor(renderer: CanvasRenderer)
    {
        this.renderer = renderer;
        this._svgMatrix = null;
        this._tempMatrix = new Matrix();
    }

    /**
     * calculates fill/stroke style for canvas
     *
     * @private
     * @param {PIXI.FillStyle} style
     * @param {number} tint
     * @returns {string|CanvasPattern}
     */
    private _calcCanvasStyle(style: FillStyle, tint: number): string|CanvasPattern
    {
        let res;

        if (style.texture && style.texture.baseTexture !== Texture.WHITE.baseTexture)
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
    public render(graphics: Graphics): void
    {
        const renderer = this.renderer;
        const { blendModes } = renderer;
        const worldAlpha = graphics.worldAlpha;
        const { worldTransform } = graphics.transform;

        const transform = renderer.newContextTransform(worldTransform);
        renderer.setBlendMode(graphics.blendMode);

        const graphicsData = graphics.geometry.graphicsData;

        const tintR = ((graphics.tint >> 16) & 0xFF) / 255;
        const tintG = ((graphics.tint >> 8) & 0xFF) / 255;
        const tintB = (graphics.tint & 0xFF) / 255;

        for (let i = 0; i < graphicsData.length; i++)
        {
            const data = graphicsData[i];
            const shape = data.shape;
            const fillStyle = data.fillStyle;
            const lineStyle = data.lineStyle;

            let contextFillStyle;
            let contextStrokeStyle;

            if (fillStyle.visible)
            {
                const fillColor = fillStyle.color | 0;
                const fillTint = (
                    (((fillColor >> 16) & 0xFF) / 255 * tintR * 255 << 16)
                    + (((fillColor >> 8) & 0xFF) / 255 * tintG * 255 << 8)
                    + (((fillColor & 0xFF) / 255) * tintB * 255)
                );

                contextFillStyle = this._calcCanvasStyle(fillStyle, fillTint);
            }
            if (lineStyle.visible)
            {
                const lineColor = lineStyle.color | 0;
                const lineTint = (
                    (((lineColor >> 16) & 0xFF) / 255 * tintR * 255 << 16)
                    + (((lineColor >> 8) & 0xFF) / 255 * tintG * 255 << 8)
                    + (((lineColor & 0xFF) / 255) * tintB * 255)
                );

                contextStrokeStyle = this._calcCanvasStyle(lineStyle, lineTint);
            }

            const { width: lineWidth, alignment } = lineStyle;

            const strokeVisible = contextStrokeStyle != null && lineWidth > 0;
            const fillVisible = contextFillStyle != null;
            const visible = fillVisible || strokeVisible;

            if (!visible) continue; // nothing needs drawing

            let context: CanvasRenderingContext2D, finalize: Function, erase: Function;

            // If the stroke has to be drawn and its either not in the middle or the fill must
            //   also be drawn, then rendering shall be performed a secondary RenderingContext
            if (strokeVisible)
            {
                // Obtain the secondary RenderingContext, along with the functions for the final
                //   drawing and erasing, respectively
                [context, finalize, erase] = renderer.forgeContext();
            }

            if (!context) {
                // No secondary RenderingContext, so the stroke cannot be drawn - disable it
                strokeVisible = false;

                // Revert to main RenderingContext
                context = renderer.context;

                // If no fill is to be drawn, simply move on
                if (!fillVisible) continue;
            }

            if (data.matrix)
            {
                transform = renderer.newContextTransform(worldTransform.copyTo(this._tempMatrix).append(data.matrix));
            }
            renderer.applyTransform(transform, context);

            const draw = (rect?: Rectangle) =>
            {
                if (rect)
                {
                    context.rect(rect.x, rect.y, rect.width, rect.height);
                }

                if (strokeVisible)
                {
                    context.lineWidth = lineWidth;
                    context.lineCap = lineStyle.cap;
                    context.lineJoin = lineStyle.join;
                    context.miterLimit = lineStyle.miterLimit;

                    context.globalAlpha = lineStyle.alpha * worldAlpha;
                    context.strokeStyle = contextStrokeStyle;
                    context.stroke();

                    if (fillVisible) {
                        // The fill shall be drawn last, beneath the stroke
                        context.globalCompositeOperation = blendModes[BLEND_MODES.DST_OVER];
                    }
                }
                if (fillVisible)
                {
                    context.globalAlpha = fillStyle.alpha * worldAlpha;
                    context.fillStyle = contextFillStyle;

                    // The actual fill is drawn
                    context.fill();
                }

                if (finalize)
                {
                    finalize();
                    erase();
                }
            }

            if (data.type === SHAPES.POLY)
            {
                context.beginPath();

                const tempShape = shape as Polygon;
                let points = tempShape.points;
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

                if (tempShape.closeStroke)
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
                        points = (holes[k].shape as Polygon).points;

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

                        if ((holes[k].shape as Polygon).closeStroke)
                        {
                            context.closePath();
                        }
                    }
                }

                draw();
            }
            else if (data.type === SHAPES.RECT)
            {
                draw(shape as Rectangle);
            }
            else if (data.type === SHAPES.CIRC)
            {
                const tempShape = shape as Circle;

                // TODO - need to be Undefined!
                context.beginPath();
                context.arc(tempShape.x, tempShape.y, tempShape.radius, 0, 2 * Math.PI);
                context.closePath();

                draw();
            }
            else if (data.type === SHAPES.ELIP)
            {
                // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

                const tempShape = shape as Ellipse;

                const w = tempShape.width * 2;
                const h = tempShape.height * 2;

                const x = tempShape.x - (w / 2);
                const y = tempShape.y - (h / 2);

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

                draw();
            }
            else if (data.type === SHAPES.RREC)
            {
                const tempShape = shape as RoundedRectangle;

                const rx = tempShape.x;
                const ry = tempShape.y;
                const width = tempShape.width;
                const height = tempShape.height;
                let radius = tempShape.radius;

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

                draw();
            }
        }
    }

    public setPatternTransform(pattern: CanvasPattern, matrix: Matrix): void
    {
        if (this._svgMatrix === false)
        {
            return;
        }
        if (!this._svgMatrix)
        {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

            if (svg && svg.createSVGMatrix)
            {
                this._svgMatrix = svg.createSVGMatrix();
            }
            if (!this._svgMatrix || !pattern.setTransform)
            {
                this._svgMatrix = false;

                return;
            }
        }

        (this._svgMatrix as DOMMatrix).a = matrix.a;
        (this._svgMatrix as DOMMatrix).b = matrix.b;
        (this._svgMatrix as DOMMatrix).c = matrix.c;
        (this._svgMatrix as DOMMatrix).d = matrix.d;
        (this._svgMatrix as DOMMatrix).e = matrix.tx;
        (this._svgMatrix as DOMMatrix).f = matrix.ty;
        pattern.setTransform((this._svgMatrix as DOMMatrix).inverse());
    }
    /**
     * destroy graphics object
     *
     */
    public destroy(): void
    {
        this.renderer = null;
        this._svgMatrix = null;
        this._tempMatrix = null;
    }
}
