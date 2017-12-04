import Resource from './Resource';

/**
 * Buffer resource with data of typed array.
 * @class
 * @extends PIXI.resources.Resource
 * @memberof PIXI.resources
 */
export default class BufferResource extends Resource
{
    /**
     * @param {Float32Array|Uint8Array|Uint32Array} source - Source buffer
     * @param {object} options - Options
     * @param {number} options.width - Width of the texture
     * @param {number} options.height - Height of the texture
     */
    constructor(source, options)
    {
        super(options);

        /**
         * Source array
         * Cannot be ClampedUint8Array because it cant be uploaded to WebGL
         *
         * @member {Float32Array|Uint8Array|Uint32Array}
         */
        this.data = source;

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

    /**
     * Used to auto-detect the type of resource.
     *
     * @static
     * @param {*} source - The source object
     * @return {boolean} `true` if <canvas>
     */
    static test(source)
    {
        return source instanceof Float32Array || source instanceof Uint8Array;
    }
}
