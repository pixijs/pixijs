import { BaseImageResource } from './BaseImageResource';

/**
 * Resource type for ImageBitmap.
 *
 * @memberof PIXI
 */
export class ImageBitmapResource extends BaseImageResource
{
    /**
     * @param source - Image element to use
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(source: ImageBitmap)
    {
        super(source);
    }

    /**
     * Used to auto-detect the type of resource.
     *
     * @param {*} source - The source object
     * @return {boolean} `true` if source is an ImageBitmap
     */
    static test(source: unknown): source is ImageBitmap
    {
        return !!globalThis.createImageBitmap && source instanceof ImageBitmap;
    }
}
