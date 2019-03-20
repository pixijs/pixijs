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
 * A simple JS library that detects mobile devices.
 *
 * @see {@link https://github.com/kaimallea/isMobile}
 *
 * @memberof PIXI.utils
 * @name isMobile
 * @type {Object}
 * @property {boolean} any - `true` if current platform is tablet or phone device
 * @property {boolean} tablet - `true` if current platform large-screen tablet device
 * @property {boolean} phone - `true` if current platform small-screen phone device
 * @property {object} apple
 * @property {boolean} apple.device - `true` if any Apple device
 * @property {boolean} apple.tablet - `true` if any Apple iPad
 * @property {boolean} apple.phone - `true` if any Apple iPhone
 * @property {boolean} apple.ipod - `true` if any iPod
 * @property {object} android
 * @property {boolean} android.device - `true` if any Android device
 * @property {boolean} android.tablet - `true` if any Android tablet
 * @property {boolean} android.phone - `true` if any Android phone
 * @property {object} amazon
 * @property {boolean} amazon.device - `true` if any Silk device
 * @property {boolean} amazon.tablet - `true` if any Silk tablet
 * @property {boolean} amazon.phone - `true` if any Silk phone
 * @property {object} windows
 * @property {boolean} windows.device - `true` if any Windows device
 * @property {boolean} windows.tablet - `true` if any Windows tablet
 * @property {boolean} windows.phone - `true` if any Windows phone
 */
export { isMobile } from '@pixi/settings';

/**
 * A high performance event emitter
 *
 * @see {@link https://github.com/primus/eventemitter3}
 *
 * @memberof PIXI.utils
 * @class EventEmitter
 * @type {EventEmitter}
 */
export { default as EventEmitter } from 'eventemitter3';

/**
 * A polygon triangulation library
 *
 * @see {@link https://github.com/mapbox/earcut}
 *
 * @memberof PIXI.utils
 * @function earcut
 * @param {number[]} vertices - A flat array of vertex coordinates
 * @param {number[]} [holes] - An array of hole indices
 * @param {number} [dimensions=2] The number of coordinates per vertex in the input array
 * @return {number[]} Triangulated polygon
 */
export { default as earcut } from 'earcut';

/**
 * Node.js compatible URL utilities.
 *
 * @see https://www.npmjs.com/package/url
 *
 * @memberof PIXI.utils
 * @name url
 * @type {object}
 */
export { default as url } from 'url';

import './settings';

export * from './browser';
export * from './color';
export * from './data';
export * from './media';
export * from './network';
export * from './const';
export * from './logging';
