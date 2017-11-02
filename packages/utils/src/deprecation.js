import { deprecationWarn as warn } from './browser/deprecationWarn';

/**
 * @function PIXI.utils.getSvgSize
 * @see PIXI.SVGResource.getSize
 * @deprecated since 5.0.0
 */
export function getSvgSize()
{
    warn('PIXI.utils.getSvgSize has moved to PIXI.SVGResource.getSize');
}

/**
 * @constant
 * @name SVG_SIZE
 * @memberof PIXI.utils
 * @see PIXI.SVGResource.SVG_SIZE
 * @deprecated since 5.0.0
 */
export function SVG_SIZE()
{
    warn('PIXI.utils.SVG_SIZE has moved to PIXI.SVGResource.SVG_SIZE');
}
