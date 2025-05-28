/**
 * A utility type that represents a tuple of length L containing elements of type T.
 * @category utils
 * @advanced
 */
export type ArrayFixed<T, L extends number> = [ T, ...Array<T> ] & { length: L };

/**
 * A dictionary type that maps string keys to values of type T.
 * @category utils
 * @advanced
 */
export type Dict<T> = {[key: string]: T};

/**
 * @module
 * @categoryDescription utils
 * A collection of utility functions used by Pixi, but also handy for your games and applications.
 *
 * ```js
 * import { isWebGLSupported } from 'pixi.js';
 *
 * if (isWebGLSupported()) {
 *    // WebGL is supported, proceed!
 * }
 * ```
 */
