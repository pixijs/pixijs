import type { ArrayFixed } from '../../../utils/types';
import type { PlaneGeometry } from '../../mesh-plane/PlaneGeometry';

/**
 * Apply a projective transformation to a plane geometry
 * @param width - The width of the plane
 * @param height - The height of the plane
 * @param geometry - The plane geometry to apply the transformation to
 * @param transformationMatrix - The transformation matrix to apply
 */
export function applyProjectiveTransformationToPlane(
    width: number,
    height: number,
    geometry: PlaneGeometry,
    transformationMatrix: ArrayFixed<number, 9>
)
{
    const buffer = geometry.buffers[0];

    // Access the vertices of the mesh
    const vertices = buffer.data;

    const { verticesX, verticesY } = geometry;

    const sizeX = (width) / (verticesX - 1);
    const sizeY = (height) / (verticesY - 1);

    let index = 0;

    const a00 = transformationMatrix[0];
    const a01 = transformationMatrix[1];
    const a02 = transformationMatrix[2];
    const a10 = transformationMatrix[3];
    const a11 = transformationMatrix[4];
    const a12 = transformationMatrix[5];
    const a20 = transformationMatrix[6];
    const a21 = transformationMatrix[7];
    const a22 = transformationMatrix[8];

    // Apply the transformation to each vertex
    for (let i = 0; i < vertices.length; i += 2)
    {
        const x = (index % verticesX) * sizeX;
        const y = ((index / verticesX) | 0) * sizeY;

        const newX = (a00 * x) + (a01 * y) + a02;
        const newY = (a10 * x) + (a11 * y) + a12;
        const w = (a20 * x) + (a21 * y) + a22;

        vertices[i] = newX / w;
        vertices[i + 1] = newY / w;

        index++;
    }

    // Update the mesh geometry to reflect the changes
    buffer.update();
}
