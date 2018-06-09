import { SHAPES } from '@pixi/math';

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
 * @private
 * @memberof PIXI
 */
export default class CanvasGraphicsRenderer
{
    /**
     * @param {PIXI.CanvasRenderer} renderer - The current PIXI renderer.
     */
    constructor(renderer)
    {
        this.renderer = renderer;
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
        const resolution = renderer.resolution;

        // if the tint has changed, set the graphics object to dirty.
        if (this._prevTint !== this.tint)
        {
            this.dirty = true;
        }

        context.setTransform(
            transform.a * resolution,
            transform.b * resolution,
            transform.c * resolution,
            transform.d * resolution,
            transform.tx * resolution,
            transform.ty * resolution
        );

        const geometry = graphics.geometry;

        if (geometry.dirty !== geometry.cacheDirty)
        {
            this.updateGraphicsTint(geometry, graphics.tint);
            geometry.cacheDirty = geometry.dirty;
        }

        renderer.setBlendMode(graphics.blendMode);

        for (let i = 0; i < geometry.graphicsData.length; i++)
        {
            const data = geometry.graphicsData[i];
            const shape = data.shape;

            const fillStyle = data.fillStyle;
            const lineStyle = data.lineStyle;

            const fillTint = data._fillTint;
            const lineTint = data._lineTint;

            if (lineStyle)
            {
                context.lineWidth = lineStyle.width;
            }

            if (data.type === SHAPES.POLY)
            {
                context.beginPath();
               
                this.renderPolygon(shape.points, shape.closed, context);

                for (let j = 0; j < data.holes.length; j++)
                {
                    this.renderPolygon(data.holes[j].points, true, context);
                }

                if (fillStyle)
                {
                    //   console.log(data)
                    context.globalAlpha = fillStyle.alpha * worldAlpha;
                    context.fillStyle = `#${(`00000${(fillTint | 0).toString(16)}`).substr(-6)}`;
                    // console.log()
                    context.fill();
                }
                if (lineStyle)
                {
                    context.globalAlpha = lineStyle.alpha * worldAlpha;
                    context.strokeStyle = `#${(`00000${(lineTint | 0).toString(16)}`).substr(-6)}`;
                    context.stroke();
                }
            }
            else if (data.type === SHAPES.RECT)
            {
                // console.log(data.type)
                if (fillStyle)
                {
                    context.globalAlpha = fillStyle.alpha * worldAlpha;
                    context.fillStyle = `#${(`00000${(fillTint | 0).toString(16)}`).substr(-6)}`;
                    context.fillRect(shape.x, shape.y, shape.width, shape.height);
                }
                if (lineStyle)
                {
                    context.globalAlpha = lineStyle.alpha * worldAlpha;
                    context.strokeStyle = `#${(`00000${(lineTint | 0).toString(16)}`).substr(-6)}`;
                    context.strokeRect(shape.x, shape.y, shape.width, shape.height);
                }
            }
            else if (data.type === SHAPES.CIRC)
            {
                // TODO - need to be Undefined!
                context.beginPath();
                context.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
                context.closePath();

                if (fillStyle)
                {
                    context.globalAlpha = fillStyle.alpha * worldAlpha;
                    context.fillStyle = `#${(`00000${(fillTint | 0).toString(16)}`).substr(-6)}`;
                    context.fill();
                }
                if (lineStyle)
                {
                    context.globalAlpha = lineStyle.alpha * worldAlpha;
                    context.strokeStyle = `#${(`00000${(lineTint | 0).toString(16)}`).substr(-6)}`;
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

                if (fillStyle)
                {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = `#${(`00000${(fillTint | 0).toString(16)}`).substr(-6)}`;
                    context.fill();
                }
                if (lineStyle)
                {
                    context.globalAlpha = lineStyle.alpha * worldAlpha;
                    context.strokeStyle = `#${(`00000${(lineTint | 0).toString(16)}`).substr(-6)}`;
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

                if (fillStyle)
                {
                    context.globalAlpha = fillStyle.alpha * worldAlpha;
                    context.fillStyle = `#${(`00000${(fillTint | 0).toString(16)}`).substr(-6)}`;
                    context.fill();
                }

                if (lineStyle)
                {
                    context.globalAlpha = lineStyle.alpha * worldAlpha;
                    context.strokeStyle = `#${(`00000${(fillTint | 0).toString(16)}`).substr(-6)}`;
                    context.stroke();
                }
            }
        }
    }

    /**
     * Updates the tint of a graphics object
     *
     * @private
     * @param {PIXI.Graphics} graphics - the graphics that will have its tint updated
     */
    updateGraphicsTint(geometry, tint)
    {
        geometry._prevTint = geometry.tint;

        const tintR = ((tint >> 16) & 0xFF) / 255;
        const tintG = ((tint >> 8) & 0xFF) / 255;
        const tintB = (tint & 0xFF) / 255;

        for (let i = 0; i < geometry.graphicsData.length; ++i)
        {
            const data = geometry.graphicsData[i];

            if (data.fillStyle)
            {
                const fillColor = data.fillStyle.color || 0;

                data._fillTint = (
                    (((fillColor >> 16) & 0xFF) / 255 * tintR * 255 << 16)
                    + (((fillColor >> 8) & 0xFF) / 255 * tintG * 255 << 8)
                    + (((fillColor & 0xFF) / 255) * tintB * 255)
                );
            }

            if (data.lineStyle)
            {
                const lineColor = data.lineStyle.color || 0;

                // super inline, cos optimization :)

                data._lineTint = (
                    (((lineColor >> 16) & 0xFF) / 255 * tintR * 255 << 16)
                    + (((lineColor >> 8) & 0xFF) / 255 * tintG * 255 << 8)
                    + (((lineColor & 0xFF) / 255) * tintB * 255)
                );
            }
        }
    }

    /**
     * Renders a polygon.
     *
     * @param {PIXI.Point[]} points - The points to render
     * @param {boolean} close - Should the polygon be closed
     * @param {CanvasRenderingContext2D} context - The rendering context to use
     */
    renderPolygon(points, close, context)
    {
        context.moveTo(points[0], points[1]);

        for (let j = 1; j < points.length / 2; ++j)
        {
            context.lineTo(points[j * 2], points[(j * 2) + 1]);
        }

        if (close)
        {
            context.closePath();
        }
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
