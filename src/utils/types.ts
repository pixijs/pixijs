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
