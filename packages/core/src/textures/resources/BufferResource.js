import TextureResource from './TextureResource';

/**
 * Buffer resource with data of typed array.
 * @class
 * @extends PIXI.TextureResource
 * @memberof PIXI
 */
export default class BufferResource extends TextureResource
{
    constructor(data, width, height)
    {
        super();

        /**
         * Source array
         * Cannot be ClampedUint8Array because it cant be uploaded to WebGL
         *
         * @member {Float32Array|Uint8Array|Uint32Array}
         */
        this.data = data;
        this._width = width || 0;
        this._height = height || 0;
    }

    get width()
    {
        return this._width;
    }

    get height()
    {
        return this._height;
    }

    onTextureUpload(renderer, baseTexture/* , glTexture*/)
    {
        const gl = renderer.gl;

        gl.texImage2D(baseTexture.target,
            0,
            baseTexture.format,
            baseTexture.width,
            baseTexture.height,
            0,
            baseTexture.format,
            baseTexture.type,
            this.data);

        return true;
    }
}
