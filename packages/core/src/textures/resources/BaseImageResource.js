import TextureResource from './TextureResource';

/**
 * Base for all the image/canvas resources
 */
export default class BaseImageResource extends TextureResource
{
    constructor(source)
    {
        super();
        this.source = source;
    }

    onTextureUpload(renderer, baseTexture, glTexture)
    {
        const gl = renderer.gl;

        gl.texImage2D(baseTexture.target,
            0,
            baseTexture.format,
            baseTexture.format,
            baseTexture.type,
            this.source);

        return true;
    }

    destroy()
    {
        this.source = null;
        super.destroy();
    }

    get width()
    {
        return this.source.width;
    }

    get height()
    {
        return this.source.height;
    }
}
