import { SHAPES } from '../../../const';
import CanvasPool from './CanvasPool';

/**
 * A set of functions used to handle masking.
 *
 * @class
 * @memberof PIXI
 */
export default class CanvasMaskManager
{
    /**
     * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
     */
    constructor(renderer)
    {
        this.renderer = renderer;
        this._maskStates = [];
        this._pool = new CanvasPool();
    }

    /**
     * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
     * @returns {Canvas} a new canvas object with the same attributes as the one used in the rendering context.
     */
    _copyCanvas(renderer)
    {
        const canvas = document.createElement('canvas');

        canvas.width = renderer.context.canvas.width;
        canvas.height = renderer.context.canvas.height;

        return canvas;
    }

    /**
     * This function sets up and returns a context in the given canvas copying the
     * data from the canvas used in the renderer class.
     *
     * @param {Canvas} canvas - The canvas to setup the context for.
     * @param {PIXI.CanvasRenderer} renderer - The canvas renderer to copy the setup from.
     * @param {object} maskData - the maskData that will be pushed
     * @returns {Context} a new 2d rendering context created to draw in the given canvas.
     */
    _setupContext(canvas, renderer, maskData)
    {
        const context = canvas.getContext('2d');
        const transform = maskData.worldTransform;
        const resolution = renderer.resolution;

        context.setTransform(
            transform.a * resolution,
            transform.b * resolution,
            transform.c * resolution,
            transform.d * resolution,
            transform.tx * resolution,
            transform.ty * resolution
        );

        return context;
    }

    /**
     * This method adds it to the current stack of masks.
     *
     * @param {object} maskData - the maskData that will be pushed
     */
    pushMask(maskData)
    {
        const renderer = this.renderer;

        renderer.context.save();

        const cacheAlpha = maskData.alpha;
        const transform = maskData.transform.worldTransform;
        const resolution = renderer.resolution;

        renderer.context.setTransform(
            transform.a * resolution,
            transform.b * resolution,
            transform.c * resolution,
            transform.d * resolution,
            transform.tx * resolution,
            transform.ty * resolution
        );

        if (maskData._texture)
        {
            const key = this._pool.getKey(renderer.context.canvas);
            const maskableCanvas = this._pool.popElementOrCreate(key, this._copyCanvas.bind(null, renderer));
            const maskState = {
                originalContext: renderer.context,
                maskableContext: this._setupContext(maskableCanvas, renderer, maskData),
                maskData,
            };

            this._maskStates.push(maskState);
            renderer.context = maskState.maskableContext;
        }
        else
        {
            this.renderGraphicsShape(maskData);
            renderer.context.clip();
        }

        maskData.worldAlpha = cacheAlpha;
    }

    /**
     * Renders a PIXI.Graphics shape.
     *
     * @param {PIXI.Graphics} graphics - The object to render.
     */
    renderGraphicsShape(graphics)
    {
        const context = this.renderer.context;
        const len = graphics.graphicsData.length;

        if (len === 0)
        {
            return;
        }

        context.beginPath();

        for (let i = 0; i < len; i++)
        {
            const data = graphics.graphicsData[i];
            const shape = data.shape;

            if (data.type === SHAPES.POLY)
            {
                const points = shape.points;

                context.moveTo(points[0], points[1]);

                for (let j = 1; j < points.length / 2; j++)
                {
                    context.lineTo(points[j * 2], points[(j * 2) + 1]);
                }

                // if the first and last point are the same close the path - much neater :)
                if (points[0] === points[points.length - 2] && points[1] === points[points.length - 1])
                {
                    context.closePath();
                }
            }
            else if (data.type === SHAPES.RECT)
            {
                context.rect(shape.x, shape.y, shape.width, shape.height);
                context.closePath();
            }
            else if (data.type === SHAPES.CIRC)
            {
                // TODO - need to be Undefined!
                context.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
                context.closePath();
            }
            else if (data.type === SHAPES.ELIP)
            {
                // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

                const w = shape.width * 2;
                const h = shape.height * 2;

                const x = shape.x - (w / 2);
                const y = shape.y - (h / 2);

                const kappa = 0.5522848;
                const ox = (w / 2) * kappa; // control point offset horizontal
                const oy = (h / 2) * kappa; // control point offset vertical
                const xe = x + w;           // x-end
                const ye = y + h;           // y-end
                const xm = x + (w / 2);       // x-middle
                const ym = y + (h / 2);       // y-middle

                context.moveTo(x, ym);
                context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
                context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
                context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
                context.closePath();
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
    }

    /**
     * Makes the black on the giben context transparent. This is necessary to make this canvas mask act as the
     * webgl version with black masks.
     * @param {Context} context - The context in which we want to convert black pixels into transparent.
     */
    _makeBlackTransparent(context)
    {
        const imgd = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
        const pix = imgd.data;

        for (let i = 0, n = pix.length; i < n; i += 4)
        {
            if (pix[i] === 0 && pix[i + 1] === 0 && pix[i + 2] === 0)
            {
                pix[i + 3] = 0;
            }
        }

        context.putImageData(imgd, 0, 0);
    }

    /**
     * Restores the current drawing context to the state it was before the mask was applied.
     *
     * @param {PIXI.CanvasRenderer} renderer - The renderer context to use.
     */
    popMask(renderer)
    {
        this._freeCanvasOnNextFrame = this._freeCanvasOnNextFrame || [];
        this._freeCanvasOnNextFrame.forEach((canvas) => this._pool.freeElement(canvas));

        if (this._maskStates.length > 0)
        {
            const maskState = this._maskStates.pop();
            const key = this._pool.getKey(renderer.context.canvas);
            const maskCanvas = this._pool.popElementOrCreate(key, this._copyCanvas.bind(null, renderer));
            const maskContext = this._setupContext(maskCanvas, renderer, maskState.maskData);

            renderer.context = maskContext;

            // Render the mask data to cull the content
            maskState.maskData._renderCanvas(renderer);
            // Black is transparent with the webgl mask, this forces this to be transparent too.
            this._makeBlackTransparent(maskContext);
            // Render the stuff to be masked into the mask context
            maskContext.globalCompositeOperation = 'source-in';
            maskContext.drawImage(maskState.maskableContext.canvas, -maskCanvas.width / 2, -maskCanvas.height / 2);
            this._pool.freeElement(maskState.maskableContext.canvas);

            // Restore the original context
            renderer.context = maskState.originalContext;
            // draw the masked content into the original context
            renderer.context.drawImage(maskCanvas, -maskCanvas.width / 2, -maskCanvas.height / 2);
            // freeing the maskCanvas here makes it create weird artifacts for some reason I haven't
            // been able to figure out, if someone knows of a better solution, please fix this.
            this._clearOnNextFrame.push(maskCanvas);
        }

        renderer.context.restore();
    }

    /**
     * Destroys this canvas mask manager.
     *
     */
    destroy()
    {
        this._pool.emptyPool();
    }
}
