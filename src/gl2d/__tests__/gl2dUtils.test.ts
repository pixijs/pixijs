import { gl2dUtils } from '../utils';
import { Color } from '~/color/Color';
import { ObservablePoint } from '~/maths/point/ObservablePoint';

describe('gl2dUtils', () =>
{
    describe('removeUndefinedOrNull', () =>
    {
        it('should remove undefined keys from objects', () =>
        {
            const obj = { a: 1, b: undefined, c: 3 };
            const result = gl2dUtils.removeUndefinedOrNull(obj);

            expect(result).toEqual({ a: 1, c: 3 });
            expect('b' in result).toBe(false);
        });

        it('should remove null keys from objects', () =>
        {
            const obj = { a: 1, b: null, c: 3 };
            const result = gl2dUtils.removeUndefinedOrNull(obj);

            expect(result).toEqual({ a: 1, c: 3 });
            expect('b' in result).toBe(false);
        });

        it('should remove undefined and null items from arrays', () =>
        {
            const arr = [1, undefined, 3, null, 5];
            const result = gl2dUtils.removeUndefinedOrNull(arr);

            expect(result).toEqual([1, 3, 5]);
        });

        it('should return value as-is when depth is 0', () =>
        {
            const obj = { a: 1, b: undefined, c: null };
            const result = gl2dUtils.removeUndefinedOrNull(obj, 0);

            expect(result).toEqual({ a: 1, b: undefined, c: null });
        });

        it('should handle nested objects recursively', () =>
        {
            const obj = { a: { b: undefined, c: 1 }, d: null };
            const result = gl2dUtils.removeUndefinedOrNull(obj);

            expect(result).toEqual({ a: { c: 1 } });
        });

        it('should return primitives as-is', () =>
        {
            expect(gl2dUtils.removeUndefinedOrNull(42)).toBe(42);
            expect(gl2dUtils.removeUndefinedOrNull('hello')).toBe('hello');
            expect(gl2dUtils.removeUndefinedOrNull(true)).toBe(true);
        });
    });

    describe('checkObservablePoint', () =>
    {
        const noop = () => { /* noop */ };

        it('should return [x, y] when different from default', () =>
        {
            const point = new ObservablePoint(noop, 10, 20);

            expect(gl2dUtils.checkObservablePoint(point, [0, 0])).toEqual([10, 20]);
        });

        it('should return null when equal to default', () =>
        {
            const point = new ObservablePoint(noop, 0, 0);

            expect(gl2dUtils.checkObservablePoint(point, [0, 0])).toBeNull();
        });

        it('should return undefined when point is falsy', () =>
        {
            expect(gl2dUtils.checkObservablePoint(null as any, [0, 0])).toBeUndefined();
        });
    });

    describe('checkPoint', () =>
    {
        it('should return [x, y] when different from default', () =>
        {
            expect(gl2dUtils.checkPoint({ x: 0.5, y: 0.5 }, [0, 0])).toEqual([0.5, 0.5]);
        });

        it('should return null when equal to default', () =>
        {
            expect(gl2dUtils.checkPoint({ x: 0, y: 0 }, [0, 0])).toBeNull();
        });

        it('should return undefined when point is falsy', () =>
        {
            expect(gl2dUtils.checkPoint(null as any, [0, 0])).toBeUndefined();
        });
    });

    describe('checkValue', () =>
    {
        it('should return value when different from default', () =>
        {
            expect(gl2dUtils.checkValue(5, 0)).toBe(5);
            expect(gl2dUtils.checkValue('add', 'normal')).toBe('add');
        });

        it('should return null when equal to default', () =>
        {
            expect(gl2dUtils.checkValue(0, 0)).toBeNull();
            expect(gl2dUtils.checkValue('normal', 'normal')).toBeNull();
        });

        it('should return undefined when value is null', () =>
        {
            expect(gl2dUtils.checkValue(null, 0)).toBeUndefined();
        });

        it('should return undefined when value is undefined', () =>
        {
            expect(gl2dUtils.checkValue(undefined, 0)).toBeUndefined();
        });
    });

    describe('checkColor', () =>
    {
        it('should return hex string when different from default', () =>
        {
            const color = new Color(0xff0000);

            expect(gl2dUtils.checkColor(color, '#ffffff')).toBe('#ff0000');
        });

        it('should return null when equal to default', () =>
        {
            const color = new Color(0xffffff);

            expect(gl2dUtils.checkColor(color, '#ffffff')).toBeNull();
        });

        it('should return undefined when color is falsy', () =>
        {
            expect(gl2dUtils.checkColor(null as any, '#ffffff')).toBeUndefined();
        });
    });

    describe('checkRectangle', () =>
    {
        it('should return [x, y, w, h] when different from default', () =>
        {
            const rect = { x: 10, y: 20, width: 100, height: 200 };

            expect(gl2dUtils.checkRectangle(rect, [0, 0, 0, 0])).toEqual([10, 20, 100, 200]);
        });

        it('should return null when equal to default', () =>
        {
            const rect = { x: 0, y: 0, width: 0, height: 0 };

            expect(gl2dUtils.checkRectangle(rect, [0, 0, 0, 0])).toBeNull();
        });

        it('should return undefined when rectangle is falsy', () =>
        {
            expect(gl2dUtils.checkRectangle(null as any, [0, 0, 0, 0])).toBeUndefined();
        });

        it('should return tuple when defaultValue is null', () =>
        {
            const rect = { x: 5, y: 10, width: 50, height: 60 };

            expect(gl2dUtils.checkRectangle(rect, null)).toEqual([5, 10, 50, 60]);
        });
    });
});
