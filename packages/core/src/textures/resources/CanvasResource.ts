import { BaseImageResource } from './BaseImageResource';

/**
 * @interface OffscreenCanvas
 */

/**
 * Resource type for HTMLCanvasElement.
 * @class
 * @extends PIXI.BaseImageResource
 * @memberof PIXI
 */
export class CanvasResource extends BaseImageResource
{
    /**
     * @param {HTMLCanvasElement} source - Canvas element to use
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(source: HTMLCanvasElement)
    {
        super(source);
    }

    /**
     * Used to auto-detect the type of resource.
     *
     * @static
     * @param {HTMLCanvasElement|OffscreenCanvas} source - The source object
     * @return {boolean} `true` if source is HTMLCanvasElement or OffscreenCanvas
     */
    static test(source: unknown): source is OffscreenCanvas|HTMLCanvasElement
    {
        const { OffscreenCanvas } = self;

        // Check for browsers that don't yet support OffscreenCanvas
        if (OffscreenCanvas && source instanceof OffscreenCanvas)
        {
            return true;
        }

        return self.HTMLCanvasElement && source instanceof HTMLCanvasElement;
    }
}
