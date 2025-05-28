import { deprecation } from '../../../utils/logging/deprecation';

import type { Container } from '../Container';
import type { CacheAsTextureOptions } from '../RenderGroup';

/** @ignore */
export interface CacheAsTextureMixinConstructor
{
    cacheAsTexture?: (val: boolean | CacheAsTextureOptions) => void;
}

/**
 * The CacheAsTextureMixin interface provides methods and properties for caching a container as a texture.
 * This can improve rendering performance for complex static containers by allowing them to be rendered as a single texture.
 * It includes methods to enable or disable caching, update the cached texture, and check
 * 1if the container is currently cached.
 * @category scene
 * @standard
 */
export interface CacheAsTextureMixin extends Required<CacheAsTextureMixinConstructor>
{
    /**
     * Caches this container as a texture. This allows the container to be rendered as a single texture,
     * which can improve performance for complex static containers.
     * @param val - If true, enables caching with default options. If false, disables caching.
     * Can also pass options object to configure caching behavior.
     */
    cacheAsTexture: (val: boolean | CacheAsTextureOptions) => void;

    /**
     * Updates the cached texture of this container. This will flag the container's cached texture
     * to be redrawn on the next render.
     */
    updateCacheTexture: () => void;

    /**
     * Legacy property for backwards compatibility with PixiJS v7 and below.
     * Use `cacheAsTexture` instead.
     * @deprecated since 8.0.0
     */
    cacheAsBitmap: boolean;

    /**
     * Whether this container is currently cached as a texture.
     * @readonly
     */
    readonly isCachedAsTexture: boolean;
}

/** @internal */
export const cacheAsTextureMixin: Partial<Container> = {
    get isCachedAsTexture(): boolean
    {
        return !!this.renderGroup?.isCachedAsTexture;
    },

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

    updateCacheTexture(): void
    {
        this.renderGroup?.updateCacheTexture();
    },

    get cacheAsBitmap(): boolean
    {
        return this.isCachedAsTexture;
    },

    set cacheAsBitmap(val: boolean)
    {
        // #if _DEBUG
        deprecation('v8.6.0', 'cacheAsBitmap is deprecated, use cacheAsTexture instead.');
        // #endif
        this.cacheAsTexture(val);
    },
} as Container;
