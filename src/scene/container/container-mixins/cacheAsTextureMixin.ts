import type { Container } from '../Container';
import type { CacheAsTextureOptions } from '../RenderGroup';

export interface CacheAsTextureMixinConstructor
{
    cacheAsTexture?: boolean;
}

export interface CacheAsTextureMixin extends Required<CacheAsTextureMixinConstructor>
{
    cacheAsTexture: boolean;
    updateCacheTexture: () => void;
    enableCacheAsTexture: (options?: CacheAsTextureOptions) => void;
    disableCacheAsTexture: () => void;
}

export const cacheAsTextureMixin: Partial<Container> = {
    /**
     * Setting cacheAsTexture property to true will render the container to a texture instead of
     * rendering the container itself.
     * This can be great for performance if the container is static, as instead of rendering all the children etc.,
     * it will just render a single texture.
     *
     * The process of caching is relatively low cost.
     * The use of a texture does increase memory usage (for the texture itself).
     *
     * For more advanced options use setCacheAsTexture() as this allows you to set the texture options.
     * A cached texture can be updated by calling `updateCacheTexture()`.
     *
     * `updateCacheTexture()` is very performant once cacheAsTexture has been set!
     * @example
     * ```typescript
     *
     * // enable cacheAsTexture
     * container.cacheAsTexture = true;
     *
     * // alternatively enable with options
     * container.setCacheAsTexture({ antialias: true, resolution: 2 });
     *
     * // want to update the texture!
     * container.updateCacheTexture();
     *
     * // you're done?
     * container.cacheAsTexture = false;
     *
     * ```
     */
    set cacheAsTexture(value: boolean)
    {
        if (value)
        {
            this.enableCacheAsTexture();
        }
        else
        {
            this.disableCacheAsTexture();
        }
    },

    get cacheAsTexture(): boolean
    {
        return !!this.renderGroup?.cacheAsTexture;
    },

    /**
     * Updates the cached texture. Will flag that this container's cached texture needs to be redrawn.
     * This will happen on the next render.
     */
    updateCacheTexture(): void
    {
        this.renderGroup?.updateCacheTexture();
    },

    /**
     * enable cacheAsTexture
     * @param options -  the texture options will be set.
     */
    enableCacheAsTexture(options?: CacheAsTextureOptions): void
    {
        this.enableRenderGroup();
        this.renderGroup.enableCacheAsTexture(options);
    },

    /** disable cacheAsTexture */
    disableCacheAsTexture(): void
    {
        this.disableRenderGroup();
    }

} as Container;
