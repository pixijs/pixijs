import BaseImageResource from './BaseImageResource';

/**
 * Resource type for HTMLCanvasElement.
 * @class
 * @extends PIXI.BaseImageResource
 * @memberof PIXI
 * @param {HTMLCanvasElement} source - Canvas element to use
 */
export default class CanvasResource extends BaseImageResource
{
    constructor(source)
    {
        super(source);

        this._width = 0;
        this._height = 0;
    }

    update()
    {
        if (this.baseTexture)
        {
            this._validate();
        }
    }

    _validate()
    {
        const source = this.source;
        const baseTexture = this.baseTexture;

        if (this._width !== source.width || this._height !== source.height)
        {
            this._width = source.width;
            this._height = source.height;
            baseTexture.setRealSize(source.width, source.height);
        }
        else
        {
            baseTexture.update();
        }
    }

    static from(canvas)
    {
        return new CanvasResource(canvas);
    }
}
