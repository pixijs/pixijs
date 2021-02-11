import { Texture } from '@pixi/core';
import { SHAPES, Matrix } from '@pixi/math';
import { canvasUtils, applyTransform } from '@pixi/canvas-renderer';
import { BLEND_MODES } from '@pixi/constants';
import { Offscreen } from './Offscreen';
import { Style, Tinted, Paint } from './graphics';

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

const ALIGNMENT = {
    MIN: 0,
    MAX: 1,
    MID: NaN,
};

ALIGNMENT.MID = ALIGNMENT.MIN + ((ALIGNMENT.MAX - ALIGNMENT.MIN) / 2);

const FILL = Style({
    alpha: 1,
    paint: '#000',
});

const STROKE = FILL({
    cap: 'square',
    join: 'miter',
});

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
     * Off-screen rendering via secondary CanvasRenderingContext2D.
     */
    private _offscreen: Offscreen;

    /**
     * @param {PIXI.CanvasRenderer} renderer - The current PIXI renderer.
     */
    constructor(renderer: CanvasRenderer)
    {
        this.renderer = renderer;
        this._svgMatrix = null;
        this._tempMatrix = new Matrix();

        this.renderer.on('prerender', () =>
        {
            this._offscreen = Offscreen.forge(this.renderer.view);
        });

        this.renderer.on('postrender', () =>
        {
            this._offscreen = null;
        });
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
     * Performs final drawing; the off-screen RenderingContext is drawn onto the main RenderingContext.
     */
    private _finalize(): void
    {
        const target = this.renderer.context;
        const source = this._offscreen.canvas;

        target.drawImage(source, 0, 0);
    }

    /**
     * Clears the off-screen RenderingContext;
     */
    private _erase(): void
    {
        this._offscreen.clear();
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
        const graphicsData = graphics.geometry.graphicsData;
        const asTinted = Tinted(graphics.tint);

        renderer.setBlendMode(graphics.blendMode);

        for (let i = 0; i < graphicsData.length; i++)
        {
            const data = graphicsData[i];

            const fillStyle = data.fillStyle;
            const fillVisible = fillStyle.visible;
            let contextFillStyle: string|CanvasPattern;

            if (fillVisible)
            {
                const tint = asTinted(fillStyle.color);

                contextFillStyle = this._calcCanvasStyle(fillStyle, tint);
            }

            const lineStyle = data.lineStyle;
            const { width: lineWidth } = lineStyle;
            let strokeVisible = lineStyle.visible && lineWidth > 0;
            let contextStrokeStyle: string|CanvasPattern;

            if (strokeVisible)
            {
                const tint = asTinted(lineStyle.color);

                contextStrokeStyle = this._calcCanvasStyle(lineStyle, tint);
            }

            const visible = fillVisible || strokeVisible;

            if (!visible) continue; // nothing needs drawing

            const { alignment } = lineStyle;
            let useOffscreen = false;

            if (strokeVisible)
            {
                useOffscreen = fillVisible || alignment !== ALIGNMENT.MID;
            }

            let context = renderer.context as CanvasRenderingContext2D;

            if (useOffscreen)
            {
                // Rendering will rely upon the off-screen context
                if (this._offscreen)
                {
                    context = this._offscreen.context;
                }
                else
                {
                    // If no fill shall be drawn, then...
                    if (!fillVisible) continue;

                    // Otherwise disable the stroke (off-screen context allows blending correctly)...
                    strokeVisible = false;

                    // ...so no more off-screen rendering
                    useOffscreen = false;
                }
            }

            const paint = (rect?: Rectangle) =>
            {
                if (rect)
                {
                    context.rect(rect.x, rect.y, rect.width, rect.height);
                }

                Paint(context, (fill, stroke) =>
                {
                    if (strokeVisible)
                    {
                        const details = Style({
                            ...lineStyle,
                            alpha: lineStyle.alpha * worldAlpha,
                            paint: contextStrokeStyle,
                            width: lineWidth,
                        });

                        if (alignment === ALIGNMENT.MID)
                        {
                            stroke(details);
                        }
                        else
                        {
                            const miterLimit = (lineStyle.miterLimit || 1) * 5;
                            const interior = STROKE({
                                miterLimit,
                                width: lineWidth * alignment * 2,
                            });
                            const exterior = STROKE({
                                miterLimit,
                                width: lineWidth * (ALIGNMENT.MAX - alignment) * 2,
                            });

                            fill(FILL);

                            if (alignment < ALIGNMENT.MID)
                            {
                                stroke(interior);

                                stroke(details({
                                    blendMode: blendModes[BLEND_MODES.SRC_IN],
                                    width: exterior('width'),
                                }));
                            }
                            else
                            {
                                stroke(interior({
                                    blendMode: blendModes[BLEND_MODES.SRC_OUT],
                                }));

                                stroke(exterior);

                                stroke(details({
                                    blendMode: blendModes[BLEND_MODES.SRC_IN],
                                    width: interior('width'),
                                }));
                            }
                        }
                    }

                    if (fillVisible)
                    {
                        fill({
                            alpha: fillStyle.alpha * worldAlpha,
                            paint: contextFillStyle,
                            blendMode: blendModes[useOffscreen ? BLEND_MODES.DST_OVER : BLEND_MODES.SRC_OVER],
                        });
                    }
                });

                if (useOffscreen)
                {
                    this._finalize();
                    this._erase();
                }
            };

            const shape = data.shape;
            let newTransform = transform;

            if (data.matrix)
            {
                newTransform = renderer.newContextTransform(worldTransform.copyTo(this._tempMatrix).append(data.matrix));
            }
            applyTransform(context, newTransform);

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

                paint();
            }
            else if (data.type === SHAPES.RECT)
            {
                paint(shape as Rectangle);
            }
            else if (data.type === SHAPES.CIRC)
            {
                const tempShape = shape as Circle;

                // TODO - need to be Undefined!
                context.beginPath();
                context.arc(tempShape.x, tempShape.y, tempShape.radius, 0, 2 * Math.PI);
                context.closePath();

                paint();
            }
            else if (data.type === SHAPES.ELIP)
            {
                // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-paint-an-oval-in-html5-canvas

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

                paint();
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

                paint();
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
