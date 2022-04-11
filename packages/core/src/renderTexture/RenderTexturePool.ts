import { RenderTexture } from './RenderTexture';
import { BaseRenderTexture } from './BaseRenderTexture';
import { nextPow2 } from '@pixi/utils';
import { MSAA_QUALITY } from '@pixi/constants';

import type { IBaseTextureOptions } from '../textures/BaseTexture';
import type { ISize } from '@pixi/math';

/**
 * Texture pool, used by FilterSystem and plugins.
 *
 * Stores collection of temporary pow2 or screen-sized renderTextures
 *
 * If you use custom RenderTexturePool for your filters, you can use methods
 * `getFilterTexture` and `returnFilterTexture` same as in
 *
 * @memberof PIXI
 */
export class RenderTexturePool
{
    public textureOptions: IBaseTextureOptions;

    /**
     * Allow renderTextures of the same size as screen, not just pow2
     *
     * Automatically sets to true after `setScreenSize`
     *
     * @default false
     */
    public enableFullScreen: boolean;
    texturePool: {[x in string|number]: RenderTexture[]};
    private _pixelsWidth: number;
    private _pixelsHeight: number;

    /**
     * @param textureOptions - options that will be passed to BaseRenderTexture constructor
     * @param {PIXI.SCALE_MODES} [textureOptions.scaleMode] - See {@link PIXI.SCALE_MODES} for possible values.
     */
    constructor(textureOptions?: IBaseTextureOptions)
    {
        this.texturePool = {};
        this.textureOptions = textureOptions || {};
        this.enableFullScreen = false;

        this._pixelsWidth = 0;
        this._pixelsHeight = 0;
    }

    /**
     * Creates texture with params that were specified in pool constructor.
     *
     * @param realWidth - Width of texture in pixels.
     * @param realHeight - Height of texture in pixels.
     * @param multisample - Number of samples of the framebuffer.
     */
    createTexture(realWidth: number, realHeight: number, multisample = MSAA_QUALITY.NONE): RenderTexture
    {
        const baseRenderTexture = new BaseRenderTexture(Object.assign({
            width: realWidth,
            height: realHeight,
            resolution: 1,
            multisample,
        }, this.textureOptions));

        return new RenderTexture(baseRenderTexture);
    }

    /**
     * Gets a Power-of-Two render texture or fullScreen texture
     *
     * @param minWidth - The minimum width of the render texture.
     * @param minHeight - The minimum height of the render texture.
     * @param resolution - The resolution of the render texture.
     * @param multisample - Number of samples of the render texture.
     * @return The new render texture.
     */
    getOptimalTexture(minWidth: number, minHeight: number, resolution = 1, multisample = MSAA_QUALITY.NONE): RenderTexture
    {
        let key;

        minWidth = Math.ceil((minWidth * resolution) - 1e-6);
        minHeight = Math.ceil((minHeight * resolution) - 1e-6);

        if (!this.enableFullScreen || minWidth !== this._pixelsWidth || minHeight !== this._pixelsHeight)
        {
            minWidth = nextPow2(minWidth);
            minHeight = nextPow2(minHeight);
            key = (((minWidth & 0xFFFF) << 16) | (minHeight & 0xFFFF)) >>> 0;

            if (multisample > 1)
            {
                key += multisample * 0x100000000;
            }
        }
        else
        {
            key = multisample > 1 ? -multisample : -1;
        }

        if (!this.texturePool[key])
        {
            this.texturePool[key] = [];
        }

        let renderTexture = this.texturePool[key].pop();

        if (!renderTexture)
        {
            renderTexture = this.createTexture(minWidth, minHeight, multisample);
        }

        renderTexture.filterPoolKey = key;
        renderTexture.setResolution(resolution);

        return renderTexture;
    }

    /**
     * Gets extra texture of the same size as input renderTexture
     *
     * `getFilterTexture(input, 0.5)` or `getFilterTexture(0.5, input)`
     *
     * @param input - renderTexture from which size and resolution will be copied
     * @param resolution - override resolution of the renderTexture
     *  It overrides, it does not multiply
     * @param multisample - number of samples of the renderTexture
     * @returns
     */
    getFilterTexture(input: RenderTexture, resolution?: number, multisample?: MSAA_QUALITY): RenderTexture
    {
        const filterTexture = this.getOptimalTexture(input.width, input.height, resolution || input.resolution,
            multisample || MSAA_QUALITY.NONE);

        filterTexture.filterFrame = input.filterFrame;

        return filterTexture;
    }

    /**
     * Place a render texture back into the pool.
     *
     * @param renderTexture - The renderTexture to free
     */
    returnTexture(renderTexture: RenderTexture): void
    {
        const key = renderTexture.filterPoolKey;

        renderTexture.filterFrame = null;
        this.texturePool[key].push(renderTexture);
    }

    /**
     * Alias for returnTexture, to be compliant with FilterSystem interface.
     *
     * @param renderTexture - The renderTexture to free
     */
    returnFilterTexture(renderTexture: RenderTexture): void
    {
        this.returnTexture(renderTexture);
    }

    /**
     * Clears the pool.
     *
     * @param destroyTextures - Destroy all stored textures.
     */
    clear(destroyTextures?: boolean): void
    {
        destroyTextures = destroyTextures !== false;
        if (destroyTextures)
        {
            for (const i in this.texturePool)
            {
                const textures = this.texturePool[i];

                if (textures)
                {
                    for (let j = 0; j < textures.length; j++)
                    {
                        textures[j].destroy(true);
                    }
                }
            }
        }

        this.texturePool = {};
    }

    /**
     * If screen size was changed, drops all screen-sized textures,
     * sets new screen size, sets `enableFullScreen` to true
     *
     * Size is measured in pixels, `renderer.view` can be passed here, not `renderer.screen`
     *
     * @param size - Initial size of screen.
     */
    setScreenSize(size: ISize): void
    {
        if (size.width === this._pixelsWidth
            && size.height === this._pixelsHeight)
        {
            return;
        }

        this.enableFullScreen = size.width > 0 && size.height > 0;

        for (const i in this.texturePool)
        {
            if (!(Number(i) < 0))
            {
                continue;
            }

            const textures = this.texturePool[i];

            if (textures)
            {
                for (let j = 0; j < textures.length; j++)
                {
                    textures[j].destroy(true);
                }
            }

            this.texturePool[i] = [];
        }

        this._pixelsWidth = size.width;
        this._pixelsHeight = size.height;
    }

    /**
     * Key that is used to store fullscreen renderTextures in a pool
     *
     * @constant
     */
    static SCREEN_KEY = -1;
}
