import CanvasRenderer from '../../renderers/canvas/CanvasRenderer';
import CONST from '../../const';

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's CanvasGraphicsRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/CanvasGraphicsRenderer.java
 */

/**
 * Renderer dedicated to drawing and batching graphics objects.
 *
 * @class
 * @private
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.SystemRenderer} The current PIXI renderer.
 */
class CanvasGraphicsRenderer
{
    constructor(renderer)
    {
        this.renderer = renderer;
    }

    /*
     * Renders a Graphics object to a canvas.
     *
     * @param graphics {PIXI.Graphics} the actual graphics object to render
     * @param context {CanvasRenderingContext2D} the 2d drawing method of the canvas
     */
    render(graphics)
    {
        let renderer = this.renderer;
        let context = renderer.context;
        let worldAlpha = graphics.worldAlpha;
        let transform = graphics.transform.worldTransform;
        let resolution = renderer.resolution;

         // if the tint has changed, set the graphics object to dirty.
        if (this._prevTint !== this.tint) {
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


        if (graphics.dirty)
        {
            this.updateGraphicsTint(graphics);
            graphics.dirty = false;
        }

        renderer.setBlendMode(graphics.blendMode);

        for (let i = 0; i < graphics.graphicsData.length; i++)
        {
            let data = graphics.graphicsData[i];
            let shape = data.shape;

            let fillColor = data._fillTint;
            let lineColor = data._lineTint;

            context.lineWidth = data.lineWidth;

            if (data.type === CONST.SHAPES.POLY)
            {
                context.beginPath();

                this.renderPolygon(shape.points, shape.closed, context);

                for (let j = 0; j < data.holes.length; j++)
                {
                    let hole = data.holes[j];
                    this.renderPolygon(hole.points, true, context);
                }


                if (data.fill)
                {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                    context.fill();
                }
                if (data.lineWidth)
                {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                    context.stroke();
                }
            }
            else if (data.type === CONST.SHAPES.RECT)
            {

                if (data.fillColor || data.fillColor === 0)
                {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                    context.fillRect(shape.x, shape.y, shape.width, shape.height);

                }
                if (data.lineWidth)
                {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                    context.strokeRect(shape.x, shape.y, shape.width, shape.height);
                }
            }
            else if (data.type === CONST.SHAPES.CIRC)
            {
                // TODO - need to be Undefined!
                context.beginPath();
                context.arc(shape.x, shape.y, shape.radius,0,2*Math.PI);
                context.closePath();

                if (data.fill)
                {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                    context.fill();
                }
                if (data.lineWidth)
                {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                    context.stroke();
                }
            }
            else if (data.type === CONST.SHAPES.ELIP)
            {
                // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

                let w = shape.width * 2;
                let h = shape.height * 2;

                let x = shape.x - w/2;
                let y = shape.y - h/2;

                context.beginPath();

                let kappa = 0.5522848,
                    ox = (w / 2) * kappa, // control point offset horizontal
                    oy = (h / 2) * kappa, // control point offset vertical
                    xe = x + w,           // x-end
                    ye = y + h,           // y-end
                    xm = x + w / 2,       // x-middle
                    ym = y + h / 2;       // y-middle

                context.moveTo(x, ym);
                context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
                context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
                context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

                context.closePath();

                if (data.fill)
                {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                    context.fill();
                }
                if (data.lineWidth)
                {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                    context.stroke();
                }
            }
            else if (data.type === CONST.SHAPES.RREC)
            {
                let rx = shape.x;
                let ry = shape.y;
                let width = shape.width;
                let height = shape.height;
                let radius = shape.radius;

                let maxRadius = Math.min(width, height) / 2 | 0;
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

                if (data.fillColor || data.fillColor === 0)
                {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                    context.fill();

                }
                if (data.lineWidth)
                {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                    context.stroke();
                }
            }
        }
    }

    /*
     * Updates the tint of a graphics object
     *
     * @private
     * @param graphics {PIXI.Graphics} the graphics that will have its tint updated
     *
     */
    updateGraphicsTint(graphics)
    {
        graphics._prevTint = graphics.tint;

        let tintR = (graphics.tint >> 16 & 0xFF) / 255;
        let tintG = (graphics.tint >> 8 & 0xFF) / 255;
        let tintB = (graphics.tint & 0xFF)/ 255;

        for (let i = 0; i < graphics.graphicsData.length; i++)
        {
            let data = graphics.graphicsData[i];

            let fillColor = data.fillColor | 0;
            let lineColor = data.lineColor | 0;

            // super inline cos im an optimization NAZI :)
            data._fillTint = (((fillColor >> 16 & 0xFF) / 255 * tintR*255 << 16) + ((fillColor >> 8 & 0xFF) / 255 * tintG*255 << 8) +  (fillColor & 0xFF) / 255 * tintB*255);
            data._lineTint = (((lineColor >> 16 & 0xFF) / 255 * tintR*255 << 16) + ((lineColor >> 8 & 0xFF) / 255 * tintG*255 << 8) +  (lineColor & 0xFF) / 255 * tintB*255);
        }
    }

    renderPolygon(points, close, context)
    {
        context.moveTo(points[0], points[1]);

        for (let j=1; j < points.length/2; j++)
        {
            context.lineTo(points[j * 2], points[j * 2 + 1]);
        }

        if (close)
        {
            context.closePath();
        }
    }

    /*
     * destroy graphics object
     *
     */
    destroy()
    {
      this.renderer = null;
    }
}

CanvasRenderer.registerPlugin('graphics', CanvasGraphicsRenderer);

export default CanvasGraphicsRenderer;