export const isSingleItem = (item: unknown): boolean =>
    (!Array.isArray(item));
