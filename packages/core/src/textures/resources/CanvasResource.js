import TextureResource from './TextureResource';

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
