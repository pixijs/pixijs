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
 * For most scenarios this should be left as true, as otherwise the user may have a poor experience.
 * However, it can be useful to disable under certain scenarios, such as headless unit tests.
 *
 * @static
 * @name FAIL_IF_MAJOR_PERFORMANCE_CAVEAT
 * @memberof PIXI.settings
 * @type {boolean}
 * @default true
 */
settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = true;

export { settings };
