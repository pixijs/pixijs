import { ENV } from '@pixi/constants';
import { settings } from '@pixi/settings';
import { deprecation } from '@pixi/utils';
import { BatchRenderer } from './batch/BatchRenderer';
import { Filter } from './filters/Filter';
import { Program } from './shader/Program';
import { BackgroundSystem, ContextSystem, StartupSystem, TextureGCSystem, ViewSystem } from './systems';
import { BaseTexture } from './textures/BaseTexture';

import type { GC_MODES, MIPMAP_MODES, MSAA_QUALITY, PRECISION, SCALE_MODES, WRAP_MODES } from '@pixi/constants';

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
 * {@link PIXI.Assets Loader}.
 * @static
 * @name STRICT_TEXTURE_CACHE
 * @memberof PIXI.settings
 * @type {boolean}
 * @default false
 */
settings.STRICT_TEXTURE_CACHE = false;

/**
 * The default render options if none are supplied to {@link PIXI.Renderer}
 * or {@link PIXI.CanvasRenderer}.
 * @static
 * @name RENDER_OPTIONS
 * @memberof PIXI.settings
 * @type {PIXI.IRendererOptions}
 */
settings.RENDER_OPTIONS = {
    ...ContextSystem.defaultOptions,
    ...BackgroundSystem.defaultOptions,
    ...ViewSystem.defaultOptions,
    ...StartupSystem.defaultOptions,
};

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
            if (process.env.DEBUG)
            {
                deprecation('7.1.0', 'settings.WRAP_MODE is deprecated, use BaseTexture.defaultOptions.wrapMode');
            }
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
            if (process.env.DEBUG)
            {
                deprecation('7.1.0', 'settings.SCALE_MODE is deprecated, use BaseTexture.defaultOptions.scaleMode');
            }
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
            if (process.env.DEBUG)
            {
                deprecation('7.1.0', 'settings.MIPMAP_TEXTURES is deprecated, use BaseTexture.defaultOptions.mipmap');
            }
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
            if (process.env.DEBUG)
            {
                deprecation(
                    '7.1.0', 'settings.ANISOTROPIC_LEVEL is deprecated, use BaseTexture.defaultOptions.anisotropicLevel');
            }
            BaseTexture.defaultOptions.anisotropicLevel = value;
        },

    },
    /**
     * Default filter resolution.
     * @static
     * @name FILTER_RESOLUTION
     * @memberof PIXI.settings
     * @deprecated since 7.1.0
     * @type {number|null}
     * @see PIXI.Filter.defaultResolution
     */
    FILTER_RESOLUTION: {
        get()
        {
            if (process.env.DEBUG)
            {
                deprecation('7.1.0', 'settings.FILTER_RESOLUTION is deprecated, use Filter.defaultResolution');
            }

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
     * @see PIXI.Filter.defaultMultisample
     */
    FILTER_MULTISAMPLE: {
        get()
        {
            if (process.env.DEBUG)
            {
                deprecation('7.1.0', 'settings.FILTER_MULTISAMPLE is deprecated, use Filter.defaultMultisample');
            }

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
            if (process.env.DEBUG)
            {
                deprecation('7.1.0', 'settings.SPRITE_MAX_TEXTURES is deprecated, use BatchRenderer.defaultMaxTextures');
            }
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
            if (process.env.DEBUG)
            {
                deprecation('7.1.0', 'settings.SPRITE_BATCH_SIZE is deprecated, use BatchRenderer.defaultBatchSize');
            }
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
            if (process.env.DEBUG)
            {
                // eslint-disable-next-line max-len
                deprecation('7.1.0', 'settings.CAN_UPLOAD_SAME_BUFFER is deprecated, use BatchRenderer.canUploadSameBuffer');
            }
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
     * @see PIXI.TextureGCSystem.defaultMode
     */
    GC_MODE: {
        get()
        {
            return TextureGCSystem.defaultMode;
        },
        set(value: GC_MODES)
        {
            if (process.env.DEBUG)
            {
                deprecation('7.1.0', 'settings.GC_MODE is deprecated, use TextureGCSystem.defaultMode');
            }
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
     * @see PIXI.TextureGCSystem.defaultMaxIdle
     */
    GC_MAX_IDLE: {
        get()
        {
            return TextureGCSystem.defaultMaxIdle;
        },
        set(value: number)
        {
            if (process.env.DEBUG)
            {
                deprecation('7.1.0', 'settings.GC_MAX_IDLE is deprecated, use TextureGCSystem.defaultMaxIdle');
            }
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
     * @see PIXI.TextureGCSystem.defaultCheckCountMax
     */
    GC_MAX_CHECK_COUNT: {
        get()
        {
            return TextureGCSystem.defaultCheckCountMax;
        },
        set(value: number)
        {
            if (process.env.DEBUG)
            {
                deprecation('7.1.0', 'settings.GC_MAX_CHECK_COUNT is deprecated, use TextureGCSystem.defaultCheckCountMax');
            }
            TextureGCSystem.defaultCheckCountMax = value;
        },
    },

    /**
     * Default specify float precision in vertex shader.
     * @static
     * @name PRECISION_VERTEX
     * @memberof PIXI.settings
     * @type {PIXI.PRECISION}
     * @deprecated since 7.1.0
     * @see PIXI.Program.defaultVertexPrecision
     */
    PRECISION_VERTEX: {
        get()
        {
            return Program.defaultVertexPrecision;
        },
        set(value: PRECISION)
        {
            if (process.env.DEBUG)
            {
                deprecation('7.1.0', 'settings.PRECISION_VERTEX is deprecated, use Program.defaultVertexPrecision');
            }
            Program.defaultVertexPrecision = value;
        },
    },

    /**
     * Default specify float precision in fragment shader.
     * @static
     * @name PRECISION_FRAGMENT
     * @memberof PIXI.settings
     * @type {PIXI.PRECISION}
     * @deprecated since 7.1.0
     * @see PIXI.Program.defaultFragmentPrecision
     */
    PRECISION_FRAGMENT: {
        get()
        {
            return Program.defaultFragmentPrecision;
        },
        set(value: PRECISION)
        {
            if (process.env.DEBUG)
            {
                deprecation('7.1.0', 'settings.PRECISION_FRAGMENT is deprecated, use Program.defaultFragmentPrecision');
            }
            Program.defaultFragmentPrecision = value;
        },
    },
});
