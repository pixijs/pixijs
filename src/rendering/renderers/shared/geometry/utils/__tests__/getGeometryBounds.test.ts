import { getGeometryBounds } from '../getGeometryBounds';
import { getGeometry } from '@test-utils';
import { Bounds } from '~/scene';

describe('getGeometryBounds', () =>
{
    it('should return bounds', () =>
    {
        const geometry = getGeometry();
        const bounds = new Bounds();

        jest.spyOn(bounds, 'clear');

        const result = getGeometryBounds(geometry, 'aPosition', bounds);

        expect(result).toBe(bounds);
        expect(bounds.clear).toHaveBeenCalledTimes(0);
        expect(bounds.minX).toBe(1);
        expect(bounds.minY).toBe(2);
        expect(bounds.maxX).toBe(3);
        expect(bounds.maxY).toBe(2);
    });

    it('should return bounds if attribute is not found', () =>
    {
        const geometry = getGeometry();
        const bounds = new Bounds();

        const result = getGeometryBounds(geometry, 'some-bad-id', bounds);

        expect(result).toBe(bounds);

        expect(bounds.minX).toBe(0);
        expect(bounds.minY).toBe(0);
        expect(bounds.maxX).toBe(0);
        expect(bounds.maxY).toBe(0);
    });
});
