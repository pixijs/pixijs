import TextureResource from './TextureResource';

/**
 * Resource type for HTMLCanvasElement.
 * @class
 * @extends PIXI.TextureResource
 * @memberof PIXI
 * @param {HTMLCanvasElement} source - Canvas element to use
 */
export default class CanvasResource extends TextureResource
{
    constructor(source)
    {
        super(source);

        this.loaded = true; // TODO rename to ready?
        this.width = source.width;
        this.height = source.height;

        this.uploadable = true;

        this.load = new Promise((resolve) =>
        {
            resolve(this);
        });
    }

    static from(canvas)
    {
        return new CanvasResource(canvas);
    }
}
