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

export { settings };
