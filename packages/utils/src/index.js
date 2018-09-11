/**
 * Generalized convenience utilities for PIXI.
 * @example
 * // Extend PIXI's internal Event Emitter.
 * class MyEmitter extends PIXI.utils.EventEmitter {
 *   constructor() {
 *      super();
 *      console.log("Emitter created!");
 *   }
 * }
 *
 * // Get info on current device
 * console.log(PIXI.utils.isMobile);
 *
 * // Convert hex color to string
 * console.log(PIXI.utils.hex2string(0xff00ff)); // returns: "#ff00ff"
 * @namespace PIXI.utils
 */

/**
 * @see {@link https://github.com/kaimallea/isMobile}
 *
 * @memberof PIXI.utils
 * @function isMobile
 * @type {Object}
 */
import isMobile from 'ismobilejs';
export { isMobile };

/**
 * @see {@link https://github.com/mreinstein/remove-array-items}
 *
 * @memberof PIXI.utils
 * @function removeItems
 * @type {Object}
 */
import removeItems from 'remove-array-items';
export { removeItems };

/**
 * @see {@link https://github.com/primus/eventemitter3}
 *
 * @memberof PIXI.utils
 * @class EventEmitter
 * @type {EventEmitter}
 */
import EventEmitter from 'eventemitter3';
export { EventEmitter };

/**
 * @namespace PIXI.utils.mixins
 */
import * as mixins from './mixins';
export { mixins };

/**
 * @see {@link https://github.com/mapbox/earcut}
 *
 * @memberof PIXI.utils
 * @function earcut
 * @param {number[]} vertices - A flat array of vertex coordinates
 * @param {number[]} [holes] - An array of hole indices
 * @param {number} [dimensions=2] The number of coordinates per vertex in the input array
 * @return {number[]} Triangulated polygon
 */
import earcut from 'earcut';
export { earcut };

export * from './browser';
export * from './color';
export * from './data';
export * from './media';
export * from './network';
export * from './const';

import './settings';
