import { Point, SHAPES } from '@pixi/math';

/**
 * Builds a line to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {PIXI.GraphicsData} graphicsData - The graphics object containing all the necessary properties
 * @param {PIXI.GraphicsGeometry} graphicsGeometry - Geometry where to append output
 */
export function buildLine(graphicsData, graphicsGeometry)
{
    if (graphicsData.lineStyle.native)
    {
        buildNativeLine(graphicsData, graphicsGeometry);
    }
    else
    {
        buildNonNativeLine(graphicsData, graphicsGeometry);
    }
}

/**
 * Builds a line to draw using the polygon method.
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {PIXI.GraphicsData} graphicsData - The graphics object containing all the necessary properties
 * @param {PIXI.GraphicsGeometry} graphicsGeometry - Geometry where to append output
 */
function buildNonNativeLine(graphicsData, graphicsGeometry)
{
    const shape = graphicsData.shape;
    let points = graphicsData.points || shape.points.slice();

    if (points.length === 0)
    {
        return;
    }
    // if the line width is an odd number add 0.5 to align to a whole pixel
    // commenting this out fixes #711 and #1620
    // if (graphicsData.lineWidth%2)
    // {
    //     for (i = 0; i < points.length; i++)
    //     {
    //         points[i] += 0.5;
    //     }
    // }

    const style = graphicsData.lineStyle;

    // get first and last point.. figure out the middle!
    const firstPoint = new Point(points[0], points[1]);
    const lastPoint = new Point(points[points.length - 2], points[points.length - 1]);
    const closedShape = shape.type !== SHAPES.POLY || shape.closeStroke;
    const closedPath = firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y;

    // if the first point is the last point - gonna have issues :)
    if (closedShape)
    {
        // need to clone as we are going to slightly modify the shape..
        points = points.slice();

        if (closedPath)
        {
            points.pop();
            points.pop();
            lastPoint.set(points[points.length - 2], points[points.length - 1]);
        }

        const midPointX = lastPoint.x + ((firstPoint.x - lastPoint.x) * 0.5);
        const midPointY = lastPoint.y + ((firstPoint.y - lastPoint.y) * 0.5);

        points.unshift(midPointX, midPointY);
        points.push(midPointX, midPointY);
    }

    const verts = graphicsGeometry.points;
    const length = points.length / 2;
    let indexCount = points.length;
    let indexStart = verts.length / 2;

    // DRAW the Line
    const width = style.width / 2;

    // sort color
    let p1x = points[0];
    let p1y = points[1];
    let p2x = points[2];
    let p2y = points[3];
    let p3x = 0;
    let p3y = 0;

    let perpx = -(p1y - p2y);
    let perpy = p1x - p2x;
    let perp2x = 0;
    let perp2y = 0;
    let perp3x = 0;
    let perp3y = 0;

    let dist = Math.sqrt((perpx * perpx) + (perpy * perpy));

    perpx /= dist;
    perpy /= dist;
    perpx *= width;
    perpy *= width;

    const ratio = style.alignment;// 0.5;
    const r1 = (1 - ratio) * 2;
    const r2 = ratio * 2;

    // start
    verts.push(
        p1x - (perpx * r1),
        p1y - (perpy * r1));

    verts.push(
        p1x + (perpx * r2),
        p1y + (perpy * r2));

    for (let i = 1; i < length - 1; ++i)
    {
        p1x = points[(i - 1) * 2];
        p1y = points[((i - 1) * 2) + 1];

        p2x = points[i * 2];
        p2y = points[(i * 2) + 1];

        p3x = points[(i + 1) * 2];
        p3y = points[((i + 1) * 2) + 1];

        perpx = -(p1y - p2y);
        perpy = p1x - p2x;

        dist = Math.sqrt((perpx * perpx) + (perpy * perpy));
        perpx /= dist;
        perpy /= dist;
        perpx *= width;
        perpy *= width;

        perp2x = -(p2y - p3y);
        perp2y = p2x - p3x;

        dist = Math.sqrt((perp2x * perp2x) + (perp2y * perp2y));
        perp2x /= dist;
        perp2y /= dist;
        perp2x *= width;
        perp2y *= width;

        const a1 = (-perpy + p1y) - (-perpy + p2y);
        const b1 = (-perpx + p2x) - (-perpx + p1x);
        const c1 = ((-perpx + p1x) * (-perpy + p2y)) - ((-perpx + p2x) * (-perpy + p1y));
        const a2 = (-perp2y + p3y) - (-perp2y + p2y);
        const b2 = (-perp2x + p2x) - (-perp2x + p3x);
        const c2 = ((-perp2x + p3x) * (-perp2y + p2y)) - ((-perp2x + p2x) * (-perp2y + p3y));

        let denom = (a1 * b2) - (a2 * b1);

        if (Math.abs(denom) < 0.1)
        {
            denom += 10.1;
            verts.push(
                p2x - (perpx * r1),
                p2y - (perpy * r1));

            verts.push(
                p2x + (perpx * r2),
                p2y + (perpy * r2));

            continue;
        }

        const px = ((b1 * c2) - (b2 * c1)) / denom;
        const py = ((a2 * c1) - (a1 * c2)) / denom;
        const pdist = ((px - p2x) * (px - p2x)) + ((py - p2y) * (py - p2y));

        if (pdist > (196 * width * width))
        {
            perp3x = perpx - perp2x;
            perp3y = perpy - perp2y;

            dist = Math.sqrt((perp3x * perp3x) + (perp3y * perp3y));
            perp3x /= dist;
            perp3y /= dist;
            perp3x *= width;
            perp3y *= width;

            verts.push(p2x - (perp3x * r1), p2y - (perp3y * r1));

            verts.push(p2x + (perp3x * r2), p2y + (perp3y * r2));

            verts.push(p2x - (perp3x * r2 * r1), p2y - (perp3y * r1));

            indexCount++;
        }
        else
        {
            verts.push(p2x + ((px - p2x) * r1), p2y + ((py - p2y) * r1));

            verts.push(p2x - ((px - p2x) * r2), p2y - ((py - p2y) * r2));
        }
    }

    p1x = points[(length - 2) * 2];
    p1y = points[((length - 2) * 2) + 1];

    p2x = points[(length - 1) * 2];
    p2y = points[((length - 1) * 2) + 1];

    perpx = -(p1y - p2y);
    perpy = p1x - p2x;

    dist = Math.sqrt((perpx * perpx) + (perpy * perpy));
    perpx /= dist;
    perpy /= dist;
    perpx *= width;
    perpy *= width;

    verts.push(p2x - (perpx * r1), p2y - (perpy * r1));

    verts.push(p2x + (perpx * r2), p2y + (perpy * r2));

    const indices = graphicsGeometry.indices;

    // indices.push(indexStart);

    for (let i = 0; i < indexCount - 2; ++i)
    {
        indices.push(indexStart, indexStart + 1, indexStart + 2);

        indexStart++;
    }
}

/**
 * Builds a line to draw using the gl.drawArrays(gl.LINES) method
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {PIXI.GraphicsData} graphicsData - The graphics object containing all the necessary properties
 * @param {PIXI.GraphicsGeometry} graphicsGeometry - Geometry where to append output
 */
function buildNativeLine(graphicsData, graphicsGeometry)
{
    let i = 0;

    const shape = graphicsData.shape;
    const points = graphicsData.points || shape.points;
    const closedShape = shape.type !== SHAPES.POLY || shape.closeStroke;

    if (points.length === 0) return;

    const verts = graphicsGeometry.points;
    const indices = graphicsGeometry.indices;
    const length = points.length / 2;

    const startIndex = verts.length / 2;
    let currentIndex = startIndex;

    verts.push(points[0], points[1]);

    for (i = 1; i < length; i++)
    {
        verts.push(points[i * 2], points[(i * 2) + 1]);
        indices.push(currentIndex, currentIndex + 1);

        currentIndex++;
    }

    if (closedShape)
    {
        indices.push(currentIndex, startIndex);
    }
}
