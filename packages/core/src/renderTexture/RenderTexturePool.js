import RenderTexture from './RenderTexture';
import BaseRenderTexture from './BaseRenderTexture';
import { nextPow2 } from '@pixi/utils';

/**
 * Experimental!
 *
 * Texture pool, used by FilterSystem and plugins
 * Stores collection of temporary pow2 or screen-sized renderTextures
 *
 * @class
 */
export default class RenderTexturePool
{
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     * @param {object} [textureOptions] - options that will be passed to BaseRenderTexture constructor
     */
    constructor(renderer, textureOptions)
    {
        this.renderer = renderer;
        this.texturePool = {};
        this.textureOptions = textureOptions || {};
        /**
         * Allow renderTextures of the same size as screen, not just pow2
         *
         * @member {boolean} [enableFullScreen=true]
         */
        this.enableFullScreen = true;
    }

    /**
     * creates of texture with params that were specified in pool constructor
     *
     * @param {number} realWidth width of texture in pixels
     * @param {number} realHeight height of texture in pixels
     * @returns {RenderTexture}
     */
    createTexture(realWidth, realHeight)
    {
        const baseRenderTexture = new BaseRenderTexture(Object.assign({
            width: realWidth,
            height: realHeight,
        }, this.textureOptions));

        return new RenderTexture(baseRenderTexture);
    }

    /**
     * Gets a Power-of-Two render texture or fullScreen texture
     *
     * @protected
     * @param {number} minWidth - The minimum width of the render texture in real pixels.
     * @param {number} minHeight - The minimum height of the render texture in real pixels.
     * @param {number} [resolution=1] - The resolution of the render texture.
     * @return {PIXI.RenderTexture} The new render texture.
     */
    getOptimalTexture(minWidth, minHeight, resolution = 1)
    {
        let key = RenderTexturePool.SCREEN_KEY;

        minWidth *= resolution;
        minHeight *= resolution;

        if (!this.enableFullScreen || minWidth !== this._pixelsWidth || minHeight !== this._pixelsHeight)
        {
            minWidth = nextPow2(minWidth);
            minHeight = nextPow2(minHeight);
            key = ((minWidth & 0xFFFF) << 16) | (minHeight & 0xFFFF);
        }

        if (!this.texturePool[key])
        {
            this.texturePool[key] = [];
        }

        let renderTexture = this.texturePool[key].pop();

        if (!renderTexture)
        {
            renderTexture = this.createTexture(minWidth, minHeight);
        }

        renderTexture.filterPoolKey = key;
        renderTexture.setResolution(resolution);

        return renderTexture;
    }

    /**
     * Gets extra texture of the same size as current renderTexture
     *
     * @param {number} [resolution] resolution, by default its the same as in current renderTexture
     * @returns {PIXI.RenderTexture}
     */
    getFilterTexture(resolution)
    {
        const rt = this.renderer.renderTexture.current;

        const filterTexture = this.getOptimalTexture(rt.width, rt.height, resolution || rt.baseTexture.resolution);

        filterTexture.filterFrame = rt.filterFrame;

        return filterTexture;
    }

    /**
     * Place a render texture back into the pool.
     * @param {PIXI.RenderTexture} renderTexture - The renderTexture to free
     */
    returnTexture(renderTexture)
    {
        const key = renderTexture.filterPoolKey;

        renderTexture.filterFrame = null;
        this.texturePool[key].push(renderTexture);
    }

    /**
     * Alias for returnTexture, to be compliant with FilterSystem interface
     * @param {PIXI.RenderTexture} renderTexture - The renderTexture to free
     */
    returnFilterTexture(renderTexture)
    {
        this.returnTexture(renderTexture);
    }

    /**
     * Clears the pool
     *
     * @member {boolean} [destroyTextures=true] destroy all stored textures
     */
    clear(destroyTextures)
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
     * resizes all textures who has the same size as screen
     */
    resize()
    {
        const screenKey = RenderTexturePool.SCREEN_KEY;
        const textures = this.texturePool[screenKey];

        if (textures)
        {
            for (let j = 0; j < textures.length; j++)
            {
                textures[j].destroy(true);
            }
        }
        this.texturePool[screenKey] = [];

        this._pixelsWidth = this.renderer.view.width;
        this._pixelsHeight = this.renderer.view.height;
    }
}

RenderTexturePool.SCREEN_KEY = 'screen';
