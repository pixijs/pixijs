import { settings } from '@pixi/settings';
import { ENV } from '@pixi/constants';
import { isMobile } from '@pixi/utils';

/**
 * The maximum support for using WebGL. If a device does not
 * support WebGL version, for instance WebGL 2, it will still
 * attempt to fallback support to WebGL 1. If you want to
 * explicitly remove feature support to target a more stable
 * baseline, prefer a lower environment.
 *
 * Due to {@link https://bugs.chromium.org/p/chromium/issues/detail?id=934823|bug in chromium}
 * we disable webgl2 by default for all non-apple mobile devices.
 *
 * @static
 * @name PREFER_ENV
 * @memberof PIXI.settings
 * @type {number}
 * @default PIXI.ENV.WEBGL2
 */
settings.PREFER_ENV = isMobile.any ? ENV.WEBGL : ENV.WEBGL2;

/**
 * If set to `true`, Textures and BaseTexture objects stored
 * in the caches ({@link PIXI.utils.TextureCache TextureCache} and
 * {@link PIXI.utils.BaseTextureCache BaseTextureCache}) can *only* be
 * used when calling {@link PIXI.Texture.from Texture.from} or
 * {@link PIXI.BaseTexture.from BaseTexture.from}.
 * Otherwise, these `from` calls throw an exception. Using this property
 * can be useful if you want to enforce preloading all assets with
 * {@link PIXI.Loader Loader}.
 *
 * @static
 * @name STRICT_TEXTURE_CACHE
 * @memberof PIXI.settings
 * @type {boolean}
 * @default false
 */
settings.STRICT_TEXTURE_CACHE = false;

export { settings };
