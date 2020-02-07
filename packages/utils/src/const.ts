/**
 * Regexp for data URI.
 * Based on: {@link https://github.com/ragingwind/data-uri-regex}
 *
 * @static
 * @constant {RegExp|string} DATA_URI
 * @memberof PIXI
 * @example data:image/png;base64
 */
export const DATA_URI = /^\s*data:(?:([\w-]+)\/([\w+.-]+))?(?:;charset=([\w-]+))?(?:;(base64))?,(.*)/i;
