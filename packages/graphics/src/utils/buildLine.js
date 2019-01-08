import { Point, PI_2 } from '@pixi/math';
import { LINE_JOIN } from '@pixi/constants';

const TOLERANCE = 0.0001;
const PI_LBOUND = Math.PI - TOLERANCE;
const PI_UBOUND = Math.PI + TOLERANCE;

/**
 * Builds a line to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {PIXI.WebGLGraphicsData} graphicsData - The graphics object containing all the necessary properties
 * @param {object} webGLData - an object containing all the webGL-specific information to create this shape
 * @param {object} webGLDataNativeLines - an object containing all the webGL-specific information to create nativeLines
 */
export default function (graphicsData, graphicsGeometry)
{
    if (graphicsData.lineStyle.native)
    {
        buildNativeLine(graphicsData, graphicsGeometry);
    }
    else
    {
        buildLine(graphicsData, graphicsGeometry);
    }
}

/**
 * Builds a line to draw using the polygon method.
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {PIXI.WebGLGraphicsData} graphicsData - The graphics object containing all the necessary properties
 * @param {object} webGLData - an object containing all the webGL-specific information to create this shape
 */
function buildLine(graphicsData, graphicsGeometry)
{
    // TODO OPTIMISE!
    let points = graphicsData.points || graphicsData.shape.points.slice();

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
    let lastPoint = new Point(points[points.length - 2], points[points.length - 1]);

    // if the first point is the last point - gonna have issues :)
    if (firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y)
    {
        // need to clone as we are going to slightly modify the shape..
        points = points.slice();

        points.pop();
        points.pop();

        lastPoint = new Point(points[points.length - 2], points[points.length - 1]);

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

    let midx = 0;
    let midy = 0;

    let dist12 = 0;
    let dist23 = 0;
    let distMid = 0;
    let minDist = 0;

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

        perp2x = -(p2y - p3y);
        perp2y = p2x - p3x;

        dist = len(perpx, perpy);
        perpx /= dist;
        perpy /= dist;
        perpx *= width;
        perpy *= width;

        dist = len(perp2x, perp2y);
        perp2x /= dist;
        perp2y /= dist;
        perp2x *= width;
        perp2y *= width;

        const a1 = p1y - p2y;
        const b1 = p2x - p1x;
        const a2 = p3y - p2y;
        const b2 = p2x - p3x;

        const denom = (a1 * b2) - (a2 * b1);
        const join = style.lineJoin;

        let px;
        let py;
        let pdist;

        // parallel or almost parallel ~0 or ~180 deg
        if (Math.abs(denom) < TOLERANCE)
        {
            // bevel, miter or round ~0deg
            if (join !== LINE_JOIN.ROUND || Math.abs(angleDiff(perpx, perpy, perp2x, perp2y)) < TOLERANCE)
            {
                verts.push(
                    p2x - (perpx * r1),
                    p2y - (perpy * r1)
                );

                verts.push(
                    p2x + (perpx * r2),
                    p2y + (perpy * r2)
                );

                continue;
            }
            else // round ~180deg
            {
                px = p2x;
                py = p2y;
                pdist = 0;
            }
        }
        else
        {
            const c1 = ((-perpx + p1x) * (-perpy + p2y)) - ((-perpx + p2x) * (-perpy + p1y));
            const c2 = ((-perp2x + p3x) * (-perp2y + p2y)) - ((-perp2x + p2x) * (-perp2y + p3y));

            px = ((b1 * c2) - (b2 * c1)) / denom;
            py = ((a2 * c1) - (a1 * c2)) / denom;
            pdist = ((px - p2x) * (px - p2x)) + ((py - p2y) * (py - p2y));
        }

        // funky comparison to have backwards compat which will fall back by default to miter
        // TODO: introduce miterLimit
        if (join !== LINE_JOIN.BEVEL && join !== LINE_JOIN.ROUND && pdist <= (196 * width * width))
        {
            verts.push(p2x + ((px - p2x) * r1), p2y + ((py - p2y) * r1));

            verts.push(p2x - ((px - p2x) * r2), p2y - ((py - p2y) * r2));
        }
        else
        {
            const flip = shouldFlip(p1x, p1y, p2x, p2y, p3x, p3y);

            dist12 = len(p2x - p1x, p2y - p1y);
            dist23 = len(p3x - p2x, p3y - p2y);
            minDist = Math.min(dist12, dist23);

            if (flip)
            {
                perpx = -perpx;
                perpy = -perpy;
                perp2x = -perp2x;
                perp2y = -perp2y;

                midx = (px - p2x) * r1;
                midy = (py - p2y) * r1;
                distMid = len(midx, midy);

                if (minDist < distMid)
                {
                    midx /= distMid;
                    midy /= distMid;
                    midx *= minDist;
                    midy *= minDist;
                }

                midx = p2x - midx;
                midy = p2y - midy;
            }
            else
            {
                midx = (px - p2x) * r2;
                midy = (py - p2y) * r2;
                distMid = len(midx, midy);

                if (minDist < distMid)
                {
                    midx /= distMid;
                    midy /= distMid;
                    midx *= minDist;
                    midy *= minDist;
                }

                midx += p2x;
                midy += p2y;
            }

            if (join === LINE_JOIN.ROUND)
            {
                const rad = flip ? r1 : r2;

                // eslint-disable-next-line max-params
                indexCount += buildRoundCap(midx, midy,
                    p2x + (perpx * rad), p2y + (perpy * rad),
                    p2x + (perp2x * rad), p2y + (perp2y * rad),
                    p3x, p3y,
                    verts,
                    flip);
            }
            else if (join === LINE_JOIN.BEVEL || pdist > (196 * width * width)) // TODO: introduce miterLimit
            {
                if (flip)
                {
                    verts.push(p2x + (perpx * r2), p2y + (perpy * r2));
                    verts.push(midx, midy);

                    verts.push(p2x + (perp2x * r2), p2y + (perp2y * r2));
                    verts.push(midx, midy);
                }
                else
                {
                    verts.push(midx, midy);
                    verts.push(p2x + (perpx * r1), p2y + (perpy * r1));

                    verts.push(midx, midy);
                    verts.push(p2x + (perp2x * r1), p2y + (perp2y * r1));
                }

                indexCount += 2;
            }
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

function len(x, y)
{
    return Math.sqrt((x * x) + (y * y));
}

/**
 * Check turn direction. If counterclockwise, we must invert prep vectors, otherwise they point 'inwards' the angle,
 * resulting in funky looking lines.
 *
 * @ignore
 * @private
 * @param {number} p0x - x of 1st point
 * @param {number} p0y - y of 1st point
 * @param {number} p1x - x of 2nd point
 * @param {number} p1y - y of 2nd point
 * @param {number} p2x - x of 3rd point
 * @param {number} p2y - y of 3rd point
 *
 * @returns {boolean} true if perpendicular vectors should be flipped, otherwise false
 */
function shouldFlip(p0x, p0y, p1x, p1y, p2x, p2y)
{
    return ((p1x - p0x) * (p2y - p0y)) - ((p2x - p0x) * (p1y - p0y)) < 0;
}

function angleDiff(p0x, p0y, p1x, p1y)
{
    const angle1 = Math.atan2(p0x, p0y);
    const angle2 = Math.atan2(p1x, p1y);

    if (angle2 > angle1)
    {
        if ((angle2 - angle1) >= PI_LBOUND)
        {
            return angle2 - PI_2 - angle1;
        }
    }
    else if ((angle1 - angle2) >= PI_LBOUND)
    {
        return angle2 - (angle1 - PI_2);
    }

    return angle2 - angle1;
}

// eslint-disable-next-line max-params
function buildRoundCap(cx, cy, p1x, p1y, p2x, p2y, nxtPx, nxtPy, verts, flipped)
{
    const cx2p0x = p1x - cx;
    const cy2p0y = p1y - cy;

    let angle0 = Math.atan2(cx2p0x, cy2p0y);
    let angle1 = Math.atan2(p2x - cx, p2y - cy);

    let startAngle = angle0;

    if (angle1 > angle0)
    {
        if ((angle1 - angle0) >= PI_LBOUND)
        {
            angle1 = angle1 - PI_2;
        }
    }
    else if ((angle0 - angle1) >= PI_LBOUND)
    {
        angle0 = angle0 - PI_2;
    }

    let angleDiff = angle1 - angle0;
    const absAngleDiff = Math.abs(angleDiff);

    if (absAngleDiff >= PI_LBOUND && absAngleDiff <= PI_UBOUND)
    {
        const r1x = cx - nxtPx;
        const r1y = cy - nxtPy;

        if (r1x === 0)
        {
            if (r1y > 0)
            {
                angleDiff = -angleDiff;
            }
        }
        else if (r1x >= -TOLERANCE)
        {
            angleDiff = -angleDiff;
        }
    }

    const radius = len(cx2p0x, cy2p0y);
    const segCount = ((15 * absAngleDiff * Math.sqrt(radius) / Math.PI) >> 0) + 1;
    const angleInc = angleDiff / segCount;

    startAngle += angleInc;

    if (flipped)
    {
        verts.push(p1x, p1y);
        verts.push(cx, cy);

        for (let i = 1, angle = startAngle; i < segCount; i++, angle += angleInc)
        {
            verts.push(cx + ((Math.sin(angle) * radius)),
                cy + ((Math.cos(angle) * radius)));
            verts.push(cx, cy);
        }

        verts.push(p2x, p2y);
        verts.push(cx, cy);
    }
    else
    {
        verts.push(cx, cy);
        verts.push(p1x, p1y);

        for (let i = 1, angle = startAngle; i < segCount; i++, angle += angleInc)
        {
            verts.push(cx, cy);
            verts.push(cx + ((Math.sin(angle) * radius)),
                cy + ((Math.cos(angle) * radius)));
        }

        verts.push(cx, cy);
        verts.push(cx + ((Math.sin(angle1) * radius)),
            cy + ((Math.cos(angle1) * radius)));
    }

    return segCount * 2;
}

/**
 * Builds a line to draw using the gl.drawArrays(gl.LINES) method
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {PIXI.WebGLGraphicsData} graphicsData - The graphics object containing all the necessary properties
 * @param {object} webGLData - an object containing all the webGL-specific information to create this shape
 */
function buildNativeLine(graphicsData, graphicsGeometry)
{
    let i = 0;

    const points = graphicsData.points || graphicsData.shape.points;

    if (points.length === 0) return;

    const verts = graphicsGeometry.points;
    const indices = graphicsGeometry.indices;
    const length = points.length / 2;

    let indexStart = verts.length / 2;
    // sort color

    for (i = 1; i < length; i++)
    {
        const p1x = points[(i - 1) * 2];
        const p1y = points[((i - 1) * 2) + 1];

        const p2x = points[i * 2];
        const p2y = points[(i * 2) + 1];

        verts.push(p1x, p1y);

        verts.push(p2x, p2y);

        indices.push(indexStart++, indexStart++);
    }
}
