// T stands for (content) type, L stands for the array fixed length
export type ArrayFixed<T, L extends number> = [ T, ...Array<T> ] & { length: L };

export type Dict<T> = {[key: string]: T};
