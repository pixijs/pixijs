import { settings } from '@pixi/settings';
import type { MIPMAP_MODES, SCALE_MODES, WRAP_MODES } from '@pixi/constants';
import { ENV } from '@pixi/constants';
import { BaseTexture } from './textures/BaseTexture';
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

Object.defineProperties(settings, {
    /**
     * @static
     * @name WRAP_MODE
     * @memberof PIXI.settings
     * @type {PIXI.WRAP_MODES}
     * @deprecated since 7.1.0
     * @see PIXI.BaseTexture.defaultOptions.wrapMode
     */
    WRAP_MODE: {
        get()
        {
            return BaseTexture.defaultOptions.wrapMode;
        },
        set(value: WRAP_MODES)
        {
            // #if _DEBUG
            deprecation('7.1.0', 'PIXI.settings.WRAP_MODE is deprecated, use PIXI.BaseTeture.defaultOptions.wrapMode');
            // #endif
            BaseTexture.defaultOptions.wrapMode = value;
        },
    },

    /**
     * @static
     * @name SCALE_MODE
     * @memberof PIXI.settings
     * @type {PIXI.SCALE_MODES}
     * @deprecated since 7.1.0
     * @see PIXI.BaseTexture.defaultOptions.scaleMode
     */
    SCALE_MODE: {
        get()
        {
            return BaseTexture.defaultOptions.scaleMode;
        },
        set(value: SCALE_MODES)
        {
            // #if _DEBUG
            deprecation('7.1.0', 'PIXI.settings.SCALE_MODE is deprecated, use PIXI.BaseTeture.defaultOptions.scaleMode');
            // #endif
            BaseTexture.defaultOptions.scaleMode = value;
        },
    },

    /**
     * @static
     * @name MIPMAP_TEXTURES
     * @memberof PIXI.settings
     * @type {PIXI.MIPMAP_MODES}
     * @deprecated since 7.1.0
     * @see PIXI.BaseTexture.defaultOptions.mipmap
     */
    MIPMAP_TEXTURES:
    {
        get()
        {
            return BaseTexture.defaultOptions.mipmap;
        },
        set(value: MIPMAP_MODES)
        {
            // #if _DEBUG
            deprecation('7.1.0', 'PIXI.settings.MIPMAP_TEXTURES is deprecated, use PIXI.BaseTeture.defaultOptions.mipmap');
            // #endif
            BaseTexture.defaultOptions.mipmap = value;
        },
        // MIPMAP_MODES.POW2,
    },

    /**
     * @static
     * @name ANISOTROPIC_LEVEL
     * @memberof PIXI.settings
     * @type {number}
     * @deprecated since 7.1.0
     * @see PIXI.BaseTexture.defaultOptions.anisotropicLevel
     */
    ANISOTROPIC_LEVEL:
    {
        get()
        {
            return BaseTexture.defaultOptions.anisotropicLevel;
        },
        set(value: number)
        {
            // #if _DEBUG
            // eslint-disable-next-line max-len
            deprecation('7.1.0', 'PIXI.settings.ANISOTROPIC_LEVEL is deprecated, use PIXI.BaseTeture.defaultOptions.anisotropicLevel');
            // #endif
            BaseTexture.defaultOptions.anisotropicLevel = value;
        },

    },
});

export { settings };
