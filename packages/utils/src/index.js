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
export { default as isMobile } from 'ismobilejs';

/**
 * @see {@link https://github.com/mreinstein/remove-array-items}
 *
 * @memberof PIXI.utils
 * @function removeItems
 * @type {Object}
 */
export { default as removeItems } from 'remove-array-items';

/**
 * @see {@link https://github.com/primus/eventemitter3}
 *
 * @memberof PIXI.utils
 * @class EventEmitter
 * @type {EventEmitter}
 */
export { default as EventEmitter } from 'eventemitter3';

export * from './browser';
export * from './color';
export * from './data';
export * from './media';
export * from './network';
export * from './plugin';

export * from './const';

import './settings';
