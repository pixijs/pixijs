import EventEmitter from 'eventemitter3';

/**
 * Regexp for data URI.
 * Based on: {@link https://github.com/ragingwind/data-uri-regex}
 * @type {RegExp}
 * @default /(?:^data:image\/([\w+]+);(?:[\w=]+|charset=[\w-]+)?(?:;base64)?,)/i
 * @example
 * import { DATA_URI } from 'pixi.js';
 *
 * DATA_URI.test('data:image/png;base64,foobar'); // => true
 * @category utils
 * @advanced
 */
export const DATA_URI = /^\s*data:(?:([\w-]+)\/([\w+.-]+))?(?:;charset=([\w-]+))?(?:;(base64))?,(.*)/i;

// export the event emitter so we can use it in external modules
export { EventEmitter };

/**
 * The current version of PixiJS. This is automatically replaced by the build process.
 * @internal
 */
export const VERSION = '$_VERSION';
