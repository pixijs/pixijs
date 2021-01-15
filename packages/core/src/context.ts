import { setWidth, setHeight } from './canvas';

/**
 * Creates a new RenderingContext instance based on given src.
 * Facilitates off-screen rendering for e.g. double-buffering.
 *
 * @param {RenderingContext|string} src - The source RenderingContext or context type (i.e. '2d' etc.)
 * @return {RenderingContext} The newly created RenderingContext
 */
export function OffscreenContext(src?: RenderingContext|string): RenderingContext
{
    if (src == null) return src as RenderingContext;

    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    let type: string;

    if (typeof src === 'object')
    {
        const srcCanvas = src.canvas;

        setWidth(canvas, srcCanvas);
        setHeight(canvas, srcCanvas);

        type = getContextType(src);
    }
    else if (typeof src === 'string')
    {
        type = src;
    }

    if (type)
    {
        return canvas.getContext(type) as RenderingContext;
    }
}

/**
 * Returns the context type of given context (e.g. '2d').
 *
 * @param {RenderingContext} context - The context to inspect
 * @return {string} The type of given context
 */
export function getContextType(context: RenderingContext): string
{
    if (context == null) return context as string;
    if (isContext2D(context)) return '2d';
}

/**
 * Determines whether given context is a CanvasRenderingContext2D instance.context
 *
 * @param {object} context - The object to inspect
 * @return {boolean}
 */
export function isContext2D(context: object): boolean
{
    return context instanceof CanvasRenderingContext2D;
}
