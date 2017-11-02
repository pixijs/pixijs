import { settings } from '@pixi/settings';

/**
 * The prefix that denotes a URL is for a retina asset.
 *
 * @static
 * @constant
 * @name RETINA_PREFIX
 * @memberof PIXI
 * @type {RegExp}
 * @example `@2x`
 * @default /@([0-9\.]+)x/
 */
settings.RETINA_PREFIX = /@([0-9\.]+)x/;

export { settings };
