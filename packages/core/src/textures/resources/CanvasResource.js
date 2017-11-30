import BaseImageResource from './BaseImageResource';

/**
 * Resource type for HTMLCanvasElement.
 * @class
 * @extends PIXI.resources.BaseImageResource
 * @memberof PIXI.resources
 * @param {HTMLCanvasElement} source - Canvas element to use
 */
export default class CanvasResource extends BaseImageResource
{
    constructor(source)
    {
        super(source);

        this._canvasWidth = 0;
        this._canvasHeight = 0;

        this.loaded = true;
    }

    update()
    {
        if (this.parent)
        {
            this._validate();
        }
    }

    _validate()
    {
        const { source, parent } = this;

        if (this._canvasWidth !== source.width || this._canvasHeight !== source.height)
        {
            this._canvasWidth = source.width;
            this._canvasHeight = source.height;
            parent.setRealSize(source.width, source.height);
        }
        else
        {
            parent.update();
        }
    }
}
