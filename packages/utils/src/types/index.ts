import type {
    CmykaColor,
    CmykColor,
    HslaColor,
    HslColor,
    HsvaColor,
    HsvColor,
    RgbaColor,
    RgbColor
} from 'colord/types';

export type Color = string | number | number[] | Float32Array
| CmykColor | CmykaColor | HslColor | HslaColor | HsvColor | HsvaColor | RgbColor | RgbaColor;

// T stands for (content) type, L stands for the array fixed length
export type ArrayFixed<T, L extends number> = [ T, ...Array<T> ] & { length: L };

export type Dict<T> = {[key: string]: T};
