import type { Container } from '../Container';
import type { CacheAsTextureOptions } from '../RenderGroup';

export interface CacheAsTextureMixinConstructor
{
    cacheAsTexture?: (val: boolean | CacheAsTextureOptions) => void;
}

export interface CacheAsTextureMixin extends Required<CacheAsTextureMixinConstructor>
{
    cacheAsTexture: (val: boolean | CacheAsTextureOptions) => void;
    updateCacheTexture: () => void;
    readonly isCachedAsTexture: boolean;
}

export const cacheAsTextureMixin: Partial<Container> = {
    /**
     * Is this container cached as a texture?
     * @readonly
     * @type {boolean}
     * @memberof scene.Container#
     */
    get isCachedAsTexture(): boolean
    {
        return !!this.renderGroup?.isCachedAsTexture;
    },

    /**
     * Setting cacheAsTexture to true will render the container to a texture instead of
     * rendering the container itself.
     * This can be great for performance if the container is static, as instead of rendering all the children etc.,
     * it will just render a single texture.
     *
     * The process of caching is relatively low cost.
     * The use of a texture does increase memory usage (for the texture itself).
     *
     * For more advanced options use `cacheAsTexture(OPTIONS)` as this allows you to set the texture options.
     * A cached texture can be updated by calling `updateCacheTexture()`.
     *
     * `updateCacheTexture()` is very performant once cacheAsTexture has been set!
     * @param val - the texture options to be set.
     * @memberof scene.Container#
     * @example
     * ```typescript
     *
     * // enable cacheAsTexture
     * container.cacheAsTexture(true);
     *
     * // alternatively enable with options
     * container.cacheAsTexture({ antialias: true, resolution: 2 });
     *
     * // want to update the texture!
     * container.updateCacheTexture();
     *
     * // you're done?
     * container.cacheAsTexture(false);
     *
     * ```
     */
    cacheAsTexture(val: boolean | CacheAsTextureOptions): void
    {
        if (typeof val === 'boolean' && val === false)
        {
            this.disableRenderGroup();
        }
        else
        {
            this.enableRenderGroup();
            this.renderGroup.enableCacheAsTexture(val === true ? {} : val);
        }
    },

    /**
     * Updates the cached texture. Will flag that this container's cached texture needs to be redrawn.
     * This will happen on the next render.
     * @memberof scene.Container#
     */
    updateCacheTexture(): void
    {
        this.renderGroup?.updateCacheTexture();
    },
} as Container;
