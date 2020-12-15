import { settings } from '@pixi/settings';

/**
 * The prefix that denotes a URL is for a retina asset.
 *
 * @static
 * @name RETINA_PREFIX
 * @memberof PIXI.settings
 * @type {RegExp}
 * @default /@([0-9\.]+)x/
 * @example `@2x`
 */
settings.RETINA_PREFIX = /@([0-9\.]+)x/;

/**
 * Should the `failIfMajorPerformanceCaveat` flag be enabled as a context option used in the `isWebGLSupported` function.
 * If set to true, a WebGL renderer can fail to be created if the browser thinks there could be performance issues when
 * using WebGL.
 *
 * In PixiJS v6 this has changed from true to false by default, to allow WebGL to work in as many scenarios as possible.
 * However, some users may have a poor experience, for example, if a user has a gpu or driver version blacklisted by the
 * browser.
 *
 * If your application requires high performance rendering, you may wish to set this to false.
 * We recommend one of two options if you decide to set this flag to false:
 *
 * 1: Use the `pixi.js-legacy` package, which includes a Canvas renderer as a fallback in case high performance WebGL is
 *    not supported.
 *
 * 2: Call `isWebGLSupported` (which if found in the PIXI.utils package) in your code before attempting to create a PixiJS
 *    renderer, and show an error message to the user if the function returns false, explaining that their device & browser
 *    combination does not support high performance WebGL.
 *    This is a much better strategy than trying to create a PixiJS renderer and finding it then fails.
 *
 * @static
 * @name FAIL_IF_MAJOR_PERFORMANCE_CAVEAT
 * @memberof PIXI.settings
 * @type {boolean}
 * @default false
 */
settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false;

export { settings };
