import Tess2 from 'tess2';

export { Tess2 };

/**
 * Tessellates a polygon with holes using tess2 (GLU tessellator).
 * Unlike earcut, tess2 correctly handles winding rules (nonzero, evenodd),
 * self-intersecting polygons, and overlapping contours.
 * @param points - Flat array of [x,y,x,y,...] for the outer polygon + all holes concatenated
 * @param holes - Array of vertex indices where each hole contour starts
 * @param vertices - Output vertex array
 * @param verticesStride - Stride between vertices in the output
 * @param verticesOffset - Starting vertex offset in output
 * @param indices - Output triangle index array
 * @param indicesOffset - Starting index offset in output
 * @param windingRule - tess2 winding rule (default: WINDING_NONZERO)
 * @internal
 */
export function triangulateWithHoles(
    points: number[],
    holes: number[],
    vertices: number[],
    verticesStride: number,
    verticesOffset: number,

    indices: number[],
    indicesOffset: number,
    windingRule: number = Tess2.WINDING_NONZERO,
)
{
    // Split flat points array into separate contours for tess2,
    // delimited by the hole index boundaries.
    const contours: number[][] = [];

    if (holes.length > 0)
    {
        const boundaries = [0, ...holes.map((h: number) => h * 2), points.length];

        for (let i = 0; i < boundaries.length - 1; i++)
        {
            const start = boundaries[i];
            const end = boundaries[i + 1];

            if (end > start)
            {
                contours.push(points.slice(start, end));
            }
        }
    }
    else
    {
        contours.push(points.slice());
    }

    const result = Tess2.tesselate({
        contours,
        windingRule,
        elementType: Tess2.POLYGONS,
        polySize: 3,
        vertexSize: 2,
    });

    if (!result || !result.elements || result.elements.length === 0)
    {
        return;
    }

    for (let i = 0; i < result.elements.length; i += 3)
    {
        indices[indicesOffset++] = (result.elements[i] + verticesOffset);
        indices[indicesOffset++] = (result.elements[i + 1] + verticesOffset);
        indices[indicesOffset++] = (result.elements[i + 2] + verticesOffset);
    }

    let index = verticesOffset * verticesStride;

    for (let i = 0; i < result.vertices.length; i += 2)
    {
        vertices[index] = result.vertices[i];
        vertices[index + 1] = result.vertices[i + 1];

        index += verticesStride;
    }
}
