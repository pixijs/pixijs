/**
 * Check if a point is inside a triangle.
 * @param px - x coordinate of the point
 * @param py - y coordinate of the point
 * @param x1 - x coordinate of the first vertex of the triangle
 * @param y1 - y coordinate of the first vertex of the triangle
 * @param x2 - x coordinate of the second vertex of the triangle
 * @param y2 - y coordinate of the second vertex of the triangle
 * @param x3 - x coordinate of the third vertex of the triangle
 * @param y3 - y coordinate of the third vertex of the triangle
 * @returns `true` if the point is inside the triangle, `false` otherwise
 */
export function pointInTriangle(
    px: number, py: number,
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number
)
{
    // Calculate vectors from point p to each vertex of the triangle
    const v2x = x3 - x1;
    const v2y = y3 - y1;
    const v1x = x2 - x1;
    const v1y = y2 - y1;
    const v0x = px - x1;
    const v0y = py - y1;

    // Compute dot products
    const dot00 = (v2x * v2x) + (v2y * v2y);
    const dot01 = (v2x * v1x) + (v2y * v1y);
    const dot02 = (v2x * v0x) + (v2y * v0y);
    const dot11 = (v1x * v1x) + (v1y * v1y);
    const dot12 = (v1x * v0x) + (v1y * v0y);

    // Calculate barycentric coordinates
    const invDenom = 1 / ((dot00 * dot11) - (dot01 * dot01));
    const u = ((dot11 * dot02) - (dot01 * dot12)) * invDenom;
    const v = ((dot00 * dot12) - (dot01 * dot02)) * invDenom;

    // Check if point is in triangle
    return (u >= 0) && (v >= 0) && (u + v < 1);
}
