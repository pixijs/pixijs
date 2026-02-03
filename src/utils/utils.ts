import earcutModule from 'earcut';

/**
 * A high performance event emitter
 * @see {@link https://github.com/primus/eventemitter3}
 * @class EventEmitter
 * @category utils
 */
export { default as EventEmitter } from 'eventemitter3';

/**
 * A polygon triangulation library
 * @see {@link https://github.com/mapbox/earcut}
 * @param {number[]} vertices - A flat array of vertex coordinates
 * @param {number[]} [holes] - An array of hole indices
 * @param {number} [dimensions=2] - The number of coordinates per vertex in the input array
 * @returns {number[]} Triangulated polygon
 * @category utils
 * @advanced
 */
export const earcut = ((earcutModule as any).default || earcutModule) as typeof earcutModule;
