/**
 * Checks if the given value is an array.
 * @param item - The item to test
 * @internal
 */
export const isSingleItem = (item: unknown): boolean => (!Array.isArray(item));
