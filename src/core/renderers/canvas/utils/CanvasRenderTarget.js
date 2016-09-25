import { RESOLUTION } from '../../../const';

/**
 * Creates a Canvas element of the given size.
 *
 * @class
 * @memberof PIXI
 */
export default class CanvasRenderTarget
{
    /**
     * @param {number} width - the width for the newly created canvas
     * @param {number} height - the height for the newly created canvas
     * @param {number} [resolution=1] - The resolution / device pixel ratio of the canvas
     */
    constructor(width, height, resolution)
    {
        /**
         * The Canvas object that belongs to this CanvasRenderTarget.
         *
         * @member {HTMLCanvasElement}
         */
        this.canvas = document.createElement('canvas');

        /**
         * A CanvasRenderingContext2D object representing a two-dimensional rendering context.
         *
         * @member {CanvasRenderingContext2D}
         */
        this.context = this.canvas.getContext('2d');

        this.resolution = resolution || RESOLUTION;

        this.resize(width, height);
    }

    /**
     * Clears the canvas that was created by the CanvasRenderTarget class.
     *
     * @private
     */
    clear()
    {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Resizes the canvas to the specified width and height.
     *
     * @param {number} width - the new width of the canvas
     * @param {number} height - the new height of the canvas
     */
    resize(width, height)
    {
        this.canvas.width = width * this.resolution;
        this.canvas.height = height * this.resolution;
    }

    /**
     * Destroys this canvas.
     *
     */
    destroy()
    {
        this.context = null;
        this.canvas = null;
    }

    /**
     * The width of the canvas buffer in pixels.
     *
     * @member {number}
     * @memberof PIXI.CanvasRenderTarget#
     */
    get width()
    {
        return this.canvas.width;
    }

    /**
     * Sets the width.
     *
     * @param {number} val - The value to set.
     */
    set width(val)
    {
        this.canvas.width = val;
    }

    /**
     * The height of the canvas buffer in pixels.
     *
     * @member {number}
     * @memberof PIXI.CanvasRenderTarget#
     */
    get height()
    {
        return this.canvas.height;
    }

    /**
     * Sets the height.
     *
     * @param {number} val - The value to set.
     */
    set height(val)
    {
        this.canvas.height = val;
    }
}
