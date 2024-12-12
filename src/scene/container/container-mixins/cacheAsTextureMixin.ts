import { deprecation } from '../../../utils/logging/deprecation';

import type { Container } from '../Container';
import type { CacheAsTextureOptions } from '../RenderGroup';

export interface CacheAsTextureMixinConstructor
{
    cacheAsTexture?: (val: boolean | CacheAsTextureOptions) => void;
}

export interface CacheAsTextureMixin extends Required<CacheAsTextureMixinConstructor>
{
    /**
     * Caches this container as a texture. This allows the container to be rendered as a single texture,
     * which can improve performance for complex static containers.
     * @param val - If true, enables caching with default options. If false, disables caching.
     * Can also pass options object to configure caching behavior.
     * @memberof scene.Container#
     */
    cacheAsTexture: (val: boolean | CacheAsTextureOptions) => void;

    /**
     * Updates the cached texture of this container. This will flag the container's cached texture
     * to be redrawn on the next render.
     * @memberof scene.Container#
     */
    updateCacheTexture: () => void;

    /**
     * Legacy property for backwards compatibility with PixiJS v7 and below.
     * Use `cacheAsTexture` instead.
     * @deprecated Since PixiJS v8
     * @memberof scene.Container#
     */
    cacheAsBitmap: boolean;

    /**
     * Whether this container is currently cached as a texture.
     * @readonly
     * @memberof scene.Container#
     */
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

    /**
     * Allows backwards compatibility with pixi.js below version v8. Use `cacheAsTexture` instead.
     * @deprecated
     */
    get cacheAsBitmap(): boolean
    {
        return this.isCachedAsTexture;
    },

    /**
     * @deprecated
     */
    set cacheAsBitmap(val: boolean)
    {
        // #if _DEBUG
        deprecation('v8.6.0', 'cacheAsBitmap is deprecated, use cacheAsTexture instead.');
        // #endif
        this.cacheAsTexture(val);
    },
} as Container;
