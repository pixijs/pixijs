import type { ISize } from '@pixi/math';

export type Canvas = HTMLCanvasElement | OffscreenCanvas;

type SetterFn = (canvas: Canvas, src: unknown) => Canvas;

const hasOffscreenCanvas = typeof OffscreenCanvas === 'function';

function checkValue(value: unknown): boolean
{
    if (value === undefined) return false;

    if (value === null) return false;

    return true;
}

function makeSetterFn(property: string): SetterFn
{
    /**
     * Assigns given property to given target canvas from given src instance or value.
     *
     * @param {Canvas} canvas - The target Canvas instance
     * @param {unknown} src - The source instance or value
     * @return {Canvas} The given target canvas
     */
    return (canvas: Canvas, src: unknown): Canvas =>
    {
        if (canvas && src)
        {
            const value = (src as any)[property] || src;

            if (checkValue(value))
            {
                (canvas as any)[property] = value;
            }
        }

        return canvas;
    };
}

/**
 * Assigns the width property to given target canvas from given src instance or value.
 *
 * @param {Canvas} canvas - The target Canvas instance
 * @param {unknown} src - The source instance or value
 * @return {Canvas} The given target canvas
 */
export const setWidth = makeSetterFn('width');

/**
 * Assigns the height property to given target canvas from given src.
 *
 * @param {Canvas} canvas - The target Canvas instance
 * @param {unknown} src - The source instance or value
 * @return {Canvas} The given target canvas
 */
export const setHeight = makeSetterFn('height');

/**
 * Creates a new Canvas instance based on given width (and height).
 * Provides (off-screen) rendering for e.g. double-buffering.
 *
 * @param {PIXI.ISize|number} width - The canvas width
 * @param {number} [height] - The canvas height
 * @return {PIXI.Canvas} The newly created Canvas
 */
export function forge(width: ISize|number, height?: number): Canvas
{
    if (typeof width === 'number')
    {
        if (typeof height !== 'number')
        {
            height = width as number;
        }
    }
    else if (width)
    {
        height = (width as ISize).height;
        width = (width as ISize).width;
    }

    let canvas: Canvas;

    if (hasOffscreenCanvas)
    {
        canvas = new OffscreenCanvas(width as number, height);
    }
    else
    {
        canvas = document.createElement('canvas') as Canvas;
        setWidth(canvas, width);
        setHeight(canvas, height);
    }

    return canvas;
}
