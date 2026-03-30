import { Color } from '../../color/Color';
import { RectangleLike } from '../../culling/Culler';
import { ObservablePoint } from '../../maths/point/ObservablePoint';
import { PointData } from '../../maths/point/PointData';
import { type Gl2dPoint2d, type Gl2dRectangle } from '../types/Gl2dTypes';

export const gl2dUtils = {
    compact: <T extends object>(
        value: { [K in keyof T]: T[K] | null | undefined },
        depth: number = 1,
    ): T =>
    {
        if (depth === 0) return value;

        if (Array.isArray(value))
        {
            // Iterate backwards so we can safely splice while iterating
            for (let i = value.length - 1; i >= 0; i--)
            {
                const item = value[i];

                if (item === undefined || item === null)
                {
                    value.splice(i, 1);
                }
                else
                {
                    gl2dUtils.compact(item, depth - 1);
                }
            }

            return value;
        }

        if (value && typeof value === 'object')
        {
            for (const key of Object.keys(value as object))
            {
                const val = (value as Record<string, unknown>)[key];

                if (val === undefined || val === null)
                {
                    delete (value as Record<string, unknown>)[key];
                }
                else
                {
                    gl2dUtils.compact(val as object, depth - 1);
                }
            }

            return value;
        }

        // Primitives are returned as-is
        return value;

    },
    checkObservablePoint: (point: ObservablePoint, defaultValue: Gl2dPoint2d): Gl2dPoint2d | null | undefined => {
        // check if the value exists
        if (!point) return undefined;

        // check if the value is the default value
        return point._x === defaultValue[0] && point._y === defaultValue[1] ? null : [point._x, point._y];
    },
    checkPoint: (point: PointData, defaultValue: Gl2dPoint2d): Gl2dPoint2d | null | undefined => {
        // check if the value exists
        if (!point) return undefined;

        // check if the value is the default value
        return point.x === defaultValue[0] && point.y === defaultValue[1] ? null : [point.x, point.y];
    },
    checkValue: <T>(value: T, defaultValue: T): T | null | undefined => {
        // check if the value exists
        // eslint-disable-next-line no-eq-null, eqeqeq
        if (value == null) return undefined;

        // check if the value is the default value
        return value === defaultValue ? null : value;
    },
    checkColor: (color: Color, defaultValue: string): string | null | undefined => {
        if (!color) return undefined;

        const hex = color.toHex();

        return hex === defaultValue ? null : hex;
    },
    checkArrayEquals: <T>(value: T[], defaultValue: T[]): T[] | null | undefined =>
    {
        // eslint-disable-next-line no-eq-null, eqeqeq
        if (value == null) return undefined;

        if (value.length !== defaultValue.length) return value;

        for (let i = 0; i < value.length; i++)
        {
            if (value[i] !== defaultValue[i]) return value;
        }

        return null;
    },
    cleanFontFamily: (fontFamily: string | string[]): string | string[] =>
    {
        if (typeof fontFamily === 'string')
        {
            return fontFamily.replace(/^["']|["']$/g, '');
        }

        return fontFamily.map((f) => f.replace(/^["']|["']$/g, ''));
    },
    checkRectangle: (rectangle: RectangleLike, defaultValue: Gl2dRectangle | null): Gl2dRectangle | null | undefined => {
        if (!rectangle) return undefined;
        if (!defaultValue) return [rectangle.x, rectangle.y, rectangle.width, rectangle.height];

        return rectangle.x === defaultValue[0] &&
            rectangle.y === defaultValue[1] &&
            rectangle.width === defaultValue[2] &&
            rectangle.height === defaultValue[3]
            ? null
            : [rectangle.x, rectangle.y, rectangle.width, rectangle.height];
    },
};
