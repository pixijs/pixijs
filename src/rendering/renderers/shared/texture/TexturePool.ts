import { nextPow2 } from '../../../../maths/misc/pow2';
import { TextureSource } from './sources/TextureSource';
import { Texture } from './Texture';

import type { TextureSourceOptions } from './sources/TextureSource';

let count = 0;

/**
 * Texture pool, used by FilterSystem and plugins.
 *
 * Stores collection of temporary pow2 or screen-sized renderTextures
 *
 * If you use custom RenderTexturePool for your filters, you can use methods
 * `getFilterTexture` and `returnFilterTexture` same as in default pool
 * @memberof rendering
 * @name TexturePool
 */
export class TexturePoolClass
{
    /** The default options for texture pool */
    public textureOptions: TextureSourceOptions;

    /**
     * Allow renderTextures of the same size as screen, not just pow2
     *
     * Automatically sets to true after `setScreenSize`
     * @default false
     */
    public enableFullScreen: boolean;

    private _texturePool: {[x in string | number]: Texture[]};
    private _poolKeyHash: Record<number, number> = Object.create(null);

    /**
     * @param textureOptions - options that will be passed to BaseRenderTexture constructor
     * @param {SCALE_MODE} [textureOptions.scaleMode] - See {@link SCALE_MODE} for possible values.
     */
    constructor(textureOptions?: TextureSourceOptions)
    {
        this._texturePool = {};
        this.textureOptions = textureOptions || {};
        this.enableFullScreen = false;
    }

    /**
     * Creates texture with params that were specified in pool constructor.
     * @param pixelWidth - Width of texture in pixels.
     * @param pixelHeight - Height of texture in pixels.
     * @param antialias
     */
    public createTexture(pixelWidth: number, pixelHeight: number, antialias: boolean): Texture
    {
        const textureSource = new TextureSource({
            ...this.textureOptions,

            width: pixelWidth,
            height: pixelHeight,
            resolution: 1,
            antialias,
            autoGarbageCollect: false,
        });

        return new Texture({
            source: textureSource,
            label: `texturePool_${count++}`,
        });
    }

    /**
     * Gets a Power-of-Two render texture or fullScreen texture
     * @param frameWidth - The minimum width of the render texture.
     * @param frameHeight - The minimum height of the render texture.
     * @param resolution - The resolution of the render texture.
     * @param antialias
     * @returns The new render texture.
     */
    public getOptimalTexture(frameWidth: number, frameHeight: number, resolution = 1, antialias: boolean): Texture
    {
        let po2Width = Math.ceil((frameWidth * resolution) - 1e-6);
        let po2Height = Math.ceil((frameHeight * resolution) - 1e-6);

        po2Width = nextPow2(po2Width);
        po2Height = nextPow2(po2Height);

        const key = (po2Width << 17) + (po2Height << 1) + (antialias ? 1 : 0);

        if (!this._texturePool[key])
        {
            this._texturePool[key] = [];
        }

        let texture = this._texturePool[key].pop();

        if (!texture)
        {
            texture = this.createTexture(po2Width, po2Height, antialias);
        }

        texture.source._resolution = resolution;
        texture.source.width = po2Width / resolution;
        texture.source.height = po2Height / resolution;
        texture.source.pixelWidth = po2Width;
        texture.source.pixelHeight = po2Height;

        // fit the layout to the requested original size
        texture.frame.x = 0;
        texture.frame.y = 0;
        texture.frame.width = frameWidth;
        texture.frame.height = frameHeight;

        texture.updateUvs();

        this._poolKeyHash[texture.uid] = key;

        return texture;
    }

    /**
     * Gets extra texture of the same size as input renderTexture
     * @param texture - The texture to check what size it is.
     * @param antialias - Whether to use antialias.
     * @returns A texture that is a power of two
     */
    public getSameSizeTexture(texture: Texture, antialias = false)
    {
        const source = texture.source;

        return this.getOptimalTexture(texture.width, texture.height, source._resolution, antialias);
    }

    /**
     * Place a render texture back into the pool.
     * @param renderTexture - The renderTexture to free
     */
    public returnTexture(renderTexture: Texture): void
    {
        const key = this._poolKeyHash[renderTexture.uid];

        this._texturePool[key].push(renderTexture);
    }

    /**
     * Clears the pool.
     * @param destroyTextures - Destroy all stored textures.
     */
    public clear(destroyTextures?: boolean): void
    {
        destroyTextures = destroyTextures !== false;
        if (destroyTextures)
        {
            for (const i in this._texturePool)
            {
                const textures = this._texturePool[i];

                if (textures)
                {
                    for (let j = 0; j < textures.length; j++)
                    {
                        textures[j].destroy(true);
                    }
                }
            }
        }

        this._texturePool = {};
    }
}

export const TexturePool = new TexturePoolClass();
