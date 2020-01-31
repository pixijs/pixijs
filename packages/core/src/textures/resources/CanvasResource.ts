import { BaseImageResource } from './BaseImageResource';

/**
 * @interface OffscreenCanvas
 */

/**
 * Resource type for HTMLCanvasElement.
 * @class
 * @extends PIXI.resources.BaseImageResource
 * @memberof PIXI.resources
 * @param {HTMLCanvasElement} source - Canvas element to use
 */
export class CanvasResource extends BaseImageResource
{
    /**
     * Used to auto-detect the type of resource.
     *
     * @static
     * @param {HTMLCanvasElement|OffscreenCanvas} source - The source object
     * @return {boolean} `true` if source is HTMLCanvasElement or OffscreenCanvas
     */
    static test(source: any): source is OffscreenCanvas|HTMLCanvasElement
    {
        const { OffscreenCanvas } = window;

        // Check for browsers that don't yet support OffscreenCanvas
        if (OffscreenCanvas && source instanceof OffscreenCanvas)
        {
            return true;
        }

        return source instanceof HTMLCanvasElement;
    }
}
