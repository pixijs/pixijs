import { BaseImageResource } from './BaseImageResource';

import type { ICanvas } from '@pixi/settings';

/**
 * Resource type for HTMLCanvasElement and OffscreenCanvas.
 * @memberof PIXI
 */
export class CanvasResource extends BaseImageResource
{
    /**
     * @param source - Canvas element to use
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(source: ICanvas)
    {
        super(source);
    }

    /**
     * Used to auto-detect the type of resource.
     * @param {*} source - The source object
     * @returns {boolean} `true` if source is HTMLCanvasElement or OffscreenCanvas
     */
    static test(source: unknown): source is OffscreenCanvas | HTMLCanvasElement
    {
        const { OffscreenCanvas } = globalThis;

        // Check for browsers that don't yet support OffscreenCanvas
        if (OffscreenCanvas && source instanceof OffscreenCanvas)
        {
            return true;
        }

        return globalThis.HTMLCanvasElement && source instanceof HTMLCanvasElement;
    }
}
