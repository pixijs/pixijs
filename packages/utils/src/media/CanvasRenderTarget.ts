import { settings } from '@pixi/settings';

/**
 * Creates a Canvas element of the given size to be used as a target for rendering to.
 *
 * @class
 * @memberof PIXI.utils
 */
export class CanvasRenderTarget
{
    public canvas: HTMLCanvasElement;

    public context: CanvasRenderingContext2D;

    public resolution: number;

    /**
     * @param {number} width - the width for the newly created canvas
     * @param {number} height - the height for the newly created canvas
     * @param {number} [resolution=1] - The resolution / device pixel ratio of the canvas
     */
    constructor(width: number, height: number, resolution: number)
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

        this.resolution = resolution || settings.RESOLUTION;

        this.resize(width, height);
    }

    /**
     * Clears the canvas that was created by the CanvasRenderTarget class.
     *
     * @private
     */
    clear(): void
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
    resize(width: number, height: number): void
    {
        this.canvas.width = width * this.resolution;
        this.canvas.height = height * this.resolution;
    }

    /**
     * Destroys this canvas.
     *
     */
    destroy(): void
    {
        this.context = null;
        this.canvas = null;
    }

    /**
     * The width of the canvas buffer in pixels.
     *
     * @member {number}
     */
    get width(): number
    {
        return this.canvas.width;
    }

    set width(val: number) // eslint-disable-line require-jsdoc
    {
        this.canvas.width = val;
    }

    /**
     * The height of the canvas buffer in pixels.
     *
     * @member {number}
     */
    get height(): number
    {
        return this.canvas.height;
    }

    set height(val: number) // eslint-disable-line require-jsdoc
    {
        this.canvas.height = val;
    }
}
