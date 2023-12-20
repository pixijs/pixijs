// T stands for (content) type, L stands for the array fixed length
export type ArrayFixed<T, L extends number> = [ T, ...Array<T> ] & { length: L };

export type Dict<T> = {[key: string]: T};

/**
 * A collection of utility functions used by Pixi, but also handy for your games and applications.
 *
 * ```js
 * import { isWebGLSupported } from 'pixi.js';
 *
 * if (isWebGLSupported()) {
 *    // WebGL is supported, proceed!
 * }
 * ```
 * @namespace utils
 */
