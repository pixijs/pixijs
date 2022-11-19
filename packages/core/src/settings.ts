import { settings } from '@pixi/settings';
import type { MSAA_QUALITY } from '@pixi/constants';
import { ENV } from '@pixi/constants';
import { Filter } from './filters/Filter';
import { deprecation } from '@pixi/utils';

/**
 * The maximum support for using WebGL. If a device does not
 * support WebGL version, for instance WebGL 2, it will still
 * attempt to fallback support to WebGL 1. If you want to
 * explicitly remove feature support to target a more stable
 * baseline, prefer a lower environment.
 * @static
 * @name PREFER_ENV
 * @memberof PIXI.settings
 * @type {number}
 * @default PIXI.ENV.WEBGL2
 */
settings.PREFER_ENV = ENV.WEBGL2;

/**
 * If set to `true`, *only* Textures and BaseTexture objects stored
 * in the caches ({@link PIXI.utils.TextureCache TextureCache} and
 * {@link PIXI.utils.BaseTextureCache BaseTextureCache}) can be
 * used when calling {@link PIXI.Texture.from Texture.from} or
 * {@link PIXI.BaseTexture.from BaseTexture.from}.
 * Otherwise, these `from` calls throw an exception. Using this property
 * can be useful if you want to enforce preloading all assets with
 * {@link PIXI.Loader Loader}.
 * @static
 * @name STRICT_TEXTURE_CACHE
 * @memberof PIXI.settings
 * @type {boolean}
 * @default false
 */
settings.STRICT_TEXTURE_CACHE = false;

// Deprecations
Object.defineProperties(settings, {
    /**
     * Default filter resolution.
     * @static
     * @name FILTER_RESOLUTION
     * @memberof PIXI.settings
     * @deprecated since 7.1.0
     * @type {number}
     * @default 1
     * @see PIXI.Filter.resolution
     */
    FILTER_RESOLUTION: {
        get()
        {
            // #if _DEBUG
            deprecation('7.1.0', 'PIXI.settings.FILTER_RESOLUTION is deprecated, use PIXI.Filter.resolution');
            // #endif

            return Filter.resolution;
        },
        set(value)
        {
            Filter.resolution = value;
        },
    },

    /**
     * Default filter samples.
     * @static
     * @name FILTER_MULTISAMPLE
     * @memberof PIXI.settings
     * @deprecated since 7.1.0
     * @type {PIXI.MSAA_QUALITY}
     * @default PIXI.MSAA_QUALITY.NONE
     * @see PIXI.Filter.multisample
     */
    FILTER_MULTISAMPLE: {
        get()
        {
            // #if _DEBUG
            deprecation('7.1.0', 'PIXI.settings.FILTER_MULTISAMPLE is deprecated, use PIXI.Filter.multisample');
            // #endif

            return Filter.multisample;
        },
        set(value: MSAA_QUALITY)
        {
            Filter.multisample = value;
        },
    },

});

export { settings };
