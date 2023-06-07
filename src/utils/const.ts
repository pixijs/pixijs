/**
 * Regexp for data URI.
 * Based on: {@link https://github.com/ragingwind/data-uri-regex}
 * @static
 * @type {RegExp}
 * @memberof PIXI
 * @example
 * import { DATA_URI } from 'pixi.js';
 *
 * DATA_URI.test('data:image/png;base64,foobar'); // => true
 */
export const DATA_URI = /^\s*data:(?:([\w-]+)\/([\w+.-]+))?(?:;charset=([\w-]+))?(?:;(base64))?,(.*)/i;
