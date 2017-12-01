import IResource from './IResource';

/**
 * Texture resource for single baseTexture that can be loaded and validated
 *
 * @class
 * @memberof PIXI
 */
export default class TextureResource extends IResource
{
    constructor()
    {
        super();
        this.baseTexture = null;
        this.loaded = true;
        this.destroyed = false;
    }

    onTextureNew(baseTexture)
    {
        if (!this.baseTexture)
        {
            this.baseTexture = baseTexture;
        }

        if (this.loaded)
        {
            this._validate();
        }
    }

    get width()
    {
        return 0;
    }

    get height()
    {
        return 0;
    }

    /**
     * called when both BaseTexture and Resource are ready for work
     *
     * @protected
     */
    _validate()
    {
        this.baseTexture.setRealSize(this.width, this.height);
    }

    destroy()
    {
        this.source = null;
        this.baseTexture = null;
        this.destroyed = true;
    }

    onTextureDestroy(baseTexture)
    {
        if (this.baseTexture === baseTexture && !this.destroyed)
        {
            this.destroy();
        }

        return true;
    }

    load()
    {
        return Promise.resolve();
    }
}
