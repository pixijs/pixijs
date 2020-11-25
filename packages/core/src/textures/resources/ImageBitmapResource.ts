import { BaseImageResource } from './BaseImageResource';

/**
 * Resource type for ImageBitmap.
 * @class
 * @extends PIXI.BaseImageResource
 * @memberof PIXI
 */
export class ImageBitmapResource extends BaseImageResource
{
    /**
     * @param {ImageBitmap} source - Image element to use
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(source: ImageBitmap)
    {
        super(source);
    }

    /**
     * Used to auto-detect the type of resource.
     *
     * @static
     * @param {ImageBitmap} source - The source object
     * @return {boolean} `true` if source is an ImageBitmap
     */
    static test(source: unknown): source is ImageBitmap
    {
        return !!self.createImageBitmap && source instanceof ImageBitmap;
    }
}
