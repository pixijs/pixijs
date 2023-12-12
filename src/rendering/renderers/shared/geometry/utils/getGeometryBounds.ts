import type { Bounds } from '../../../../../scene/container/bounds/Bounds';
import type { Geometry } from '../Geometry';

/**
 * Gets the 2D bounds of a geometry, based on a specific attribute.
 * @param geometry - Geometry to to measure
 * @param attributeId - AttributeId that contains the x,y data
 * @param bounds - Bounds to store the result in
 * @returns the bounds
 */
export function getGeometryBounds(geometry: Geometry, attributeId: string, bounds: Bounds): Bounds
{
    const attribute = geometry.getAttribute(attributeId);

    if (!attribute)
    {
        bounds.clear();

        return bounds;
    }

    const data = attribute.buffer.data as Float32Array;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const byteSize = data.BYTES_PER_ELEMENT;
    const offset = attribute.offset / byteSize;
    const stride = attribute.stride / byteSize;

    for (let i = offset; i < data.length; i += stride)
    {
        const x = data[i];
        const y = data[i + 1];

        if (x > maxX)maxX = x;
        if (y > maxY)maxY = y;
        if (x < minX)minX = x;
        if (y < minY)minY = y;
    }

    bounds.minX = minX;
    bounds.minY = minY;
    bounds.maxX = maxX;
    bounds.maxY = maxY;

    return bounds;
}
