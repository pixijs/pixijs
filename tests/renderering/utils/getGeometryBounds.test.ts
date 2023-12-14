import { getGeometryBounds } from '../../../src/rendering/renderers/shared/geometry/utils/getGeometryBounds';
import { Bounds } from '../../../src/scene/container/bounds/Bounds';
import { getGeometry } from '../../utils/getGeometry';

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
