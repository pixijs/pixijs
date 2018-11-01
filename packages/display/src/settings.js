import { settings } from '@pixi/settings';

/**
 * If enabled, containers will automatically sort their children by zIndex value.
 * This actually changes the order of elements in the array, so should be treated
 * as a basic solution that is not performant compared to other solutions,
 * such as @link https://github.com/pixijs/pixi-display
 *
 * @static
 * @constant
 * @name ZINDEX_AUTO_SORT
 * @memberof PIXI.settings
 * @type {boolean}
 * @default true
 */
settings.ZINDEX_AUTO_SORT = true;

export { settings };
