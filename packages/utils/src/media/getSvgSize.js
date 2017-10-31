import { SVG_SIZE } from '../const';

/**
 * Typedef for Size object.
 *
 * @typedef {object} Size
 * @property {width} Width component
 * @property {height} Height component
 */

/**
 * Get size from an svg string using regexp.
 *
 * @memberof PIXI.utils
 * @function getSvgSize
 * @param {string} svgString - a serialized svg element
 * @return {Size|undefined} image extension
 */
export function getSvgSize(svgString)
{
    const sizeMatch = SVG_SIZE.exec(svgString);
    const size = {};

    if (sizeMatch)
    {
        size[sizeMatch[1]] = Math.round(parseFloat(sizeMatch[3]));
        size[sizeMatch[5]] = Math.round(parseFloat(sizeMatch[7]));
    }

    return size;
}
