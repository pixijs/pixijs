import Resource from './Resource';

/**
 * Buffer resource with data of typed array.
 * @class
 * @extends PIXI.resources.Resource
 * @memberof PIXI.resources
 */
export default class BufferResource extends Resource
{
    constructor(data, width, height)
    {
        super(width, height);

        /**
         * Source array
         * Cannot be ClampedUint8Array because it cant be uploaded to WebGL
         *
         * @member {Float32Array|Uint8Array|Uint32Array}
         */
        this.data = data;

        // Already loaded!
        this._loaded = true;
    }

    /**
     * Upload the texture to the GPU.
     * @param {PIXI.Renderer} renderer Upload to the renderer
     * @param {PIXI.BaseTexture} baseTexture Reference to parent texture
     */
    upload(renderer, baseTexture)
    {
        renderer.gl.texImage2D(
            baseTexture.target,
            0,
            baseTexture.format,
            baseTexture.width,
            baseTexture.height,
            0,
            baseTexture.format,
            baseTexture.type,
            this.data
        );

        return true;
    }

    /**
     * Destroy and don't use after this
     * @override
     */
    dispose()
    {
        this.data = null;
    }
}
