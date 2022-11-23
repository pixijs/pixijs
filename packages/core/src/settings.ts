import { settings } from '@pixi/settings';
import type { MSAA_QUALITY, MIPMAP_MODES, SCALE_MODES, WRAP_MODES, GC_MODES } from '@pixi/constants';
import { ENV } from '@pixi/constants';
import { BaseTexture } from './textures/BaseTexture';
import { Filter } from './filters/Filter';
import { deprecation } from '@pixi/utils';
import { BatchRenderer } from './batch/BatchRenderer';
import { TextureGCSystem } from './systems';

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
            deprecation('7.1.0', 'settings.WRAP_MODE is deprecated, use BaseTeture.defaultOptions.wrapMode');
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
            deprecation('7.1.0', 'settings.SCALE_MODE is deprecated, use BaseTeture.defaultOptions.scaleMode');
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
            deprecation('7.1.0', 'settings.MIPMAP_TEXTURES is deprecated, use BaseTeture.defaultOptions.mipmap');
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
            deprecation('7.1.0', 'settings.ANISOTROPIC_LEVEL is deprecated, use BaseTeture.defaultOptions.anisotropicLevel');
            // #endif
            BaseTexture.defaultOptions.anisotropicLevel = value;
        },

    },
    /**
     * Default filter resolution.
     * @static
     * @name FILTER_RESOLUTION
     * @memberof PIXI.settings
     * @deprecated since 7.1.0
     * @type {number}
     * @default 1
     * @see PIXI.Filter.defaultResolution
     */
    FILTER_RESOLUTION: {
        get()
        {
            // #if _DEBUG
            deprecation('7.1.0', 'settings.FILTER_RESOLUTION is deprecated, use Filter.defaultResolution');
            // #endif

            return Filter.defaultResolution;
        },
        set(value)
        {
            Filter.defaultResolution = value;
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
     * @see PIXI.Filter.defaultMultisample
     */
    FILTER_MULTISAMPLE: {
        get()
        {
            // #if _DEBUG
            deprecation('7.1.0', 'settings.FILTER_MULTISAMPLE is deprecated, use Filter.defaultMultisample');
            // #endif

            return Filter.defaultMultisample;
        },
        set(value: MSAA_QUALITY)
        {
            Filter.defaultMultisample = value;
        },
    },

    /**
     * The maximum textures that this device supports.
     * @static
     * @name SPRITE_MAX_TEXTURES
     * @memberof PIXI.settings
     * @deprecated since 7.1.0
     * @see PIXI.BatchRenderer.defaultMaxTextures
     * @type {number}
     */
    SPRITE_MAX_TEXTURES: {
        get()
        {
            return BatchRenderer.defaultMaxTextures;
        },
        set(value: number)
        {
            // #if _DEBUG
            deprecation('7.1.0', 'settings.SPRITE_MAX_TEXTURES is deprecated, use BatchRenderer.defaultMaxTextures');
            // #endif
            BatchRenderer.defaultMaxTextures = value;
        },
    },

    /**
     * The default sprite batch size.
     *
     * The default aims to balance desktop and mobile devices.
     * @static
     * @name SPRITE_BATCH_SIZE
     * @memberof PIXI.settings
     * @see PIXI.BatchRenderer.defaultBatchSize
     * @deprecated since 7.1.0
     * @type {number}
     */
    SPRITE_BATCH_SIZE: {
        get()
        {
            return BatchRenderer.defaultBatchSize;
        },
        set(value: number)
        {
            // #if _DEBUG
            deprecation('7.1.0', 'settings.SPRITE_BATCH_SIZE is deprecated, use BatchRenderer.defaultBatchSize');
            // #endif
            BatchRenderer.defaultBatchSize = value;
        },
    },

    /**
     * Can we upload the same buffer in a single frame?
     * @static
     * @name CAN_UPLOAD_SAME_BUFFER
     * @memberof PIXI.settings
     * @see PIXI.BatchRenderer.canUploadSameBuffer
     * @deprecated since 7.1.0
     * @type {boolean}
     */
    CAN_UPLOAD_SAME_BUFFER: {
        get()
        {
            return BatchRenderer.canUploadSameBuffer;
        },
        set(value: boolean)
        {
            // #if _DEBUG
            // eslint-disable-next-line max-len
            deprecation('7.1.0', 'settings.CAN_UPLOAD_SAME_BUFFER is deprecated, use BatchRenderer.canUploadSameBuffer');
            // #endif
            BatchRenderer.canUploadSameBuffer = value;
        },
    },

    /**
     * Default Garbage Collection mode.
     * @static
     * @name GC_MODE
     * @memberof PIXI.settings
     * @type {PIXI.GC_MODES}
     * @deprecated since 7.1.0
     */
    GC_MODE: {
        get()
        {
            return TextureGCSystem.defaultMode;
        },
        set(value: GC_MODES)
        {
            // #if _DEBUG
            deprecation('7.1.0', 'settings.GC_MODE is deprecated, use TextureGCSystem.defaultMode');
            // #endif
            TextureGCSystem.defaultMode = value;
        },
    },

    /**
     * Default Garbage Collection max idle.
     * @static
     * @name GC_MAX_IDLE
     * @memberof PIXI.settings
     * @type {number}
     * @deprecated since 7.1.0
     */
    GC_MAX_IDLE: {
        get()
        {
            return TextureGCSystem.defaultMaxIdle;
        },
        set(value: number)
        {
            // #if _DEBUG
            deprecation('7.1.0', 'settings.GC_MAX_IDLE is deprecated, use TextureGCSystem.defaultMaxIdle');
            // #endif
            TextureGCSystem.defaultMaxIdle = value;
        },
    },

    /**
     * Default Garbage Collection maximum check count.
     * @static
     * @name GC_MAX_CHECK_COUNT
     * @memberof PIXI.settings
     * @type {number}
     * @deprecated since 7.1.0
     */
    GC_MAX_CHECK_COUNT: {
        get()
        {
            return TextureGCSystem.defaultCheckCountMax;
        },
        set(value: number)
        {
            // #if _DEBUG
            deprecation('7.1.0', 'settings.GC_MAX_CHECK_COUNT is deprecated, use TextureGCSystem.defaultCheckCountMax');
            // #endif
            TextureGCSystem.defaultCheckCountMax = value;
        },
    },
});
