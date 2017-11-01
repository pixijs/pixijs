/**
 * Regexp for image type by extension.
 *
 * @static
 * @constant
 * @memberof PIXI
 * @type {RegExp|string}
 * @example `image.png`
 */
export const URL_FILE_EXTENSION = /\.(\w{3,4})(?:$|\?|#)/i;

/**
 * Regexp for data URI.
 * Based on: {@link https://github.com/ragingwind/data-uri-regex}
 *
 * @static
 * @constant
 * @name DATA_URI
 * @memberof PIXI
 * @type {RegExp|string}
 * @example data:image/png;base64
 */
export const DATA_URI = /^\s*data:(?:([\w-]+)\/([\w+.-]+))?(?:;(charset=[\w-]+|base64))?,(.*)/i;
