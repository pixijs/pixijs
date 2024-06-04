import { Point } from '../../../../maths/point/Point';
import { closePointEps, curveEps } from '../const';
import { getOrientationOfPoints } from '../utils/getOrientationOfPoints';

import type { StrokeAttributes } from '../FillTypes';

/**
 * Buffers vertices to draw a square cap.
 *
 * Ignored from docs since it is not directly exposed.
 * @ignore
 * @private
 * @param {number} x - X-coord of end point
 * @param {number} y - Y-coord of end point
 * @param {number} nx - X-coord of line normal pointing inside
 * @param {number} ny - Y-coord of line normal pointing inside
 * @param {number} innerWeight - Weight of inner points
 * @param {number} outerWeight - Weight of outer points
 * @param {boolean} clockwise - Whether the cap is drawn clockwise
 * @param {Array<number>} verts - vertex buffer
 * @returns {number} - no. of vertices pushed
 */
function square(
    x: number,
    y: number,
    nx: number,
    ny: number,
    innerWeight: number,
    outerWeight: number,
    clockwise: boolean, /* rotation for square (true at left end, false at right end) */
    verts: Array<number>
): number
{
    const ix = x - (nx * innerWeight);
    const iy = y - (ny * innerWeight);
    const ox = x + (nx * outerWeight);
    const oy = y + (ny * outerWeight);

    /* Rotate nx,ny for extension vector */
    let exx; let
        eyy;

    if (clockwise)
    {
        exx = ny;
        eyy = -nx;
    }
    else
    {
        exx = -ny;
        eyy = nx;
    }

    /* [i|0]x,y extended at cap */
    const eix = ix + exx;
    const eiy = iy + eyy;
    const eox = ox + exx;
    const eoy = oy + eyy;

    /* Square itself must be inserted clockwise*/
    verts.push(eix, eiy);
    verts.push(eox, eoy);

    return 2;
}

/**
 * Buffers vertices to draw an arc at the line joint or cap.
 *
 * Ignored from docs since it is not directly exposed.
 * @ignore
 * @private
 * @param {number} cx - X-coord of center
 * @param {number} cy - Y-coord of center
 * @param {number} sx - X-coord of arc start
 * @param {number} sy - Y-coord of arc start
 * @param {number} ex - X-coord of arc end
 * @param {number} ey - Y-coord of arc end
 * @param {Array[]} verts - buffer of vertices
 * @param {boolean} clockwise - orientation of vertices
 * @returns {number} - no. of vertices pushed
 */
function round(
    cx: number,
    cy: number,
    sx: number,
    sy: number,
    ex: number,
    ey: number,
    verts: number[],
    clockwise: boolean, /* if not cap, then clockwise is turn of joint, otherwise rotation from angle0 to angle1 */
): number
{
    const cx2p0x = sx - cx;
    const cy2p0y = sy - cy;

    let angle0 = Math.atan2(cx2p0x, cy2p0y);
    let angle1 = Math.atan2(ex - cx, ey - cy);

    if (clockwise && angle0 < angle1)
    {
        angle0 += Math.PI * 2;
    }
    else if (!clockwise && angle0 > angle1)
    {
        angle1 += Math.PI * 2;
    }

    let startAngle = angle0;
    const angleDiff = angle1 - angle0;
    const absAngleDiff = Math.abs(angleDiff);

    const radius = Math.sqrt((cx2p0x * cx2p0x) + (cy2p0y * cy2p0y));
    const segCount = ((15 * absAngleDiff * Math.sqrt(radius) / Math.PI) >> 0) + 1;
    const angleInc = angleDiff / segCount;

    startAngle += angleInc;

    if (clockwise)
    {
        verts.push(cx, cy);
        verts.push(sx, sy);

        for (let i = 1, angle = startAngle; i < segCount; i++, angle += angleInc)
        {
            verts.push(cx, cy);
            verts.push(cx + ((Math.sin(angle) * radius)),
                cy + ((Math.cos(angle) * radius)));
        }

        verts.push(cx, cy);
        verts.push(ex, ey);
    }
    else
    {
        verts.push(sx, sy);
        verts.push(cx, cy);

        for (let i = 1, angle = startAngle; i < segCount; i++, angle += angleInc)
        {
            verts.push(cx + ((Math.sin(angle) * radius)),
                cy + ((Math.cos(angle) * radius)));
            verts.push(cx, cy);
        }

        verts.push(ex, ey);
        verts.push(cx, cy);
    }

    return segCount * 2;
}

/**
 * Builds a line to draw using the polygon method.
 * @param points
 * @param lineStyle
 * @param flipAlignment
 * @param closed
 * @param vertices
 * @param _verticesStride
 * @param _verticesOffset
 * @param indices
 * @param _indicesOffset
 */
export function buildLine(
    points: number[],
    lineStyle: StrokeAttributes,
    flipAlignment: boolean,
    closed: boolean,
    // alignment:number,

    vertices: number[],
    _verticesStride: number,
    _verticesOffset: number,

    indices: number[],
    _indicesOffset: number,

): void
{
    // const shape = graphicsData.shape as Polygon;
    //   let points = graphicsData.points || shape.points.slice();
    const eps = closePointEps;

    if (points.length === 0)
    {
        return;
    }

    const style = lineStyle;

    let alignment = style.alignment;

    if (lineStyle.alignment !== 0.5)
    {
        // rotate the points!
        let orientation = getOrientationOfPoints(points);

        if (flipAlignment)orientation *= -1;

        alignment = ((alignment - 0.5) * orientation) + 0.5;
    }

    // get first and last point.. figure out the middle!
    const firstPoint = new Point(points[0], points[1]);
    const lastPoint = new Point(points[points.length - 2], points[points.length - 1]);
    const closedShape = closed;
    const closedPath = Math.abs(firstPoint.x - lastPoint.x) < eps
        && Math.abs(firstPoint.y - lastPoint.y) < eps;

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

        const midPointX = (firstPoint.x + lastPoint.x) * 0.5;
        const midPointY = (lastPoint.y + firstPoint.y) * 0.5;

        points.unshift(midPointX, midPointY);
        points.push(midPointX, midPointY);
    }

    const verts = vertices;

    const length = points.length / 2;
    let indexCount = points.length;
    const indexStart = verts.length / 2;

    // Max. inner and outer width
    const width = style.width / 2;
    const widthSquared = width * width;
    const miterLimitSquared = style.miterLimit * style.miterLimit;

    /* Line segments of interest where (x1,y1) forms the corner. */
    let x0 = points[0];
    let y0 = points[1];
    let x1 = points[2];
    let y1 = points[3];
    let x2 = 0;
    let y2 = 0;

    /* perp[?](x|y) = the line normal with magnitude lineWidth. */
    let perpX = -(y0 - y1);
    let perpY = x0 - x1;
    let perp1x = 0;
    let perp1y = 0;

    let dist = Math.sqrt((perpX * perpX) + (perpY * perpY));

    perpX /= dist;
    perpY /= dist;
    perpX *= width;
    perpY *= width;

    const ratio = alignment;// 0.5;
    const innerWeight = (1 - ratio) * 2;
    const outerWeight = ratio * 2;

    if (!closedShape)
    {
        if (style.cap === 'round')
        {
            indexCount += round(
                x0 - (perpX * (innerWeight - outerWeight) * 0.5),
                y0 - (perpY * (innerWeight - outerWeight) * 0.5),
                x0 - (perpX * innerWeight),
                y0 - (perpY * innerWeight),
                x0 + (perpX * outerWeight),
                y0 + (perpY * outerWeight),
                verts,
                true,
            ) + 2;
        }
        else if (style.cap === 'square')
        {
            indexCount += square(x0, y0, perpX, perpY, innerWeight, outerWeight, true, verts);
        }
    }

    // Push first point (below & above vertices)
    verts.push(
        x0 - (perpX * innerWeight),
        y0 - (perpY * innerWeight));
    verts.push(
        x0 + (perpX * outerWeight),
        y0 + (perpY * outerWeight));

    for (let i = 1; i < length - 1; ++i)
    {
        x0 = points[(i - 1) * 2];
        y0 = points[((i - 1) * 2) + 1];

        x1 = points[i * 2];
        y1 = points[(i * 2) + 1];

        x2 = points[(i + 1) * 2];
        y2 = points[((i + 1) * 2) + 1];

        perpX = -(y0 - y1);
        perpY = x0 - x1;

        dist = Math.sqrt((perpX * perpX) + (perpY * perpY));
        perpX /= dist;
        perpY /= dist;
        perpX *= width;
        perpY *= width;

        perp1x = -(y1 - y2);
        perp1y = x1 - x2;

        dist = Math.sqrt((perp1x * perp1x) + (perp1y * perp1y));
        perp1x /= dist;
        perp1y /= dist;
        perp1x *= width;
        perp1y *= width;

        /* d[x|y](0|1) = the component displacement between points p(0,1|1,2) */
        const dx0 = x1 - x0;
        const dy0 = y0 - y1;
        const dx1 = x1 - x2;
        const dy1 = y2 - y1;

        /* +ve if internal angle < 90 degree, -ve if internal angle > 90 degree. */
        const dot = (dx0 * dx1) + (dy0 * dy1);
        /* +ve if internal angle counterclockwise, -ve if internal angle clockwise. */
        const cross = (dy0 * dx1) - (dy1 * dx0);
        const clockwise = (cross < 0);

        /* Going nearly parallel? */
        /* atan(0.001) ~= 0.001 rad ~= 0.057 degree */
        if (Math.abs(cross) < 0.001 * Math.abs(dot))
        {
            verts.push(
                x1 - (perpX * innerWeight),
                y1 - (perpY * innerWeight));
            verts.push(
                x1 + (perpX * outerWeight),
                y1 + (perpY * outerWeight));

            /* 180 degree corner? */
            if (dot >= 0)
            {
                if (style.join === 'round')
                {
                    indexCount += round(
                        x1, y1,
                        x1 - (perpX * innerWeight), y1 - (perpY * innerWeight),
                        x1 - (perp1x * innerWeight), y1 - (perp1y * innerWeight),
                        verts, false) + 4;
                }
                else
                {
                    indexCount += 2;
                }

                verts.push(
                    x1 - (perp1x * outerWeight),
                    y1 - (perp1y * outerWeight));
                verts.push(
                    x1 + (perp1x * innerWeight),
                    y1 + (perp1y * innerWeight));
            }

            continue;
        }

        /* p[x|y] is the miter point. pDist is the distance between miter point and p1. */
        const c1 = ((-perpX + x0) * (-perpY + y1)) - ((-perpX + x1) * (-perpY + y0));
        const c2 = ((-perp1x + x2) * (-perp1y + y1)) - ((-perp1x + x1) * (-perp1y + y2));
        const px = ((dx0 * c2) - (dx1 * c1)) / cross;
        const py = ((dy1 * c1) - (dy0 * c2)) / cross;
        const pDist = ((px - x1) * (px - x1)) + ((py - y1) * (py - y1));

        /* Inner miter point */
        const imx = x1 + ((px - x1) * innerWeight);
        const imy = y1 + ((py - y1) * innerWeight);
        /* Outer miter point */
        const omx = x1 - ((px - x1) * outerWeight);
        const omy = y1 - ((py - y1) * outerWeight);

        /* Is the inside miter point too far away, creating a spike? */
        const smallerInsideSegmentSq = Math.min((dx0 * dx0) + (dy0 * dy0), (dx1 * dx1) + (dy1 * dy1));
        const insideWeight = clockwise ? innerWeight : outerWeight;
        const smallerInsideDiagonalSq = smallerInsideSegmentSq + (insideWeight * insideWeight * widthSquared);
        const insideMiterOk = pDist <= smallerInsideDiagonalSq;

        if (insideMiterOk)
        {
            if (style.join === 'bevel' || pDist / widthSquared > miterLimitSquared)
            {
                if (clockwise) /* rotating at inner angle */
                {
                    verts.push(imx, imy); // inner miter point
                    verts.push(x1 + (perpX * outerWeight), y1 + (perpY * outerWeight)); // first segment's outer vertex
                    verts.push(imx, imy); // inner miter point
                    verts.push(x1 + (perp1x * outerWeight), y1 + (perp1y * outerWeight)); // second segment's outer vertex
                }
                else /* rotating at outer angle */
                {
                    verts.push(x1 - (perpX * innerWeight), y1 - (perpY * innerWeight)); // first segment's inner vertex
                    verts.push(omx, omy); // outer miter point
                    verts.push(x1 - (perp1x * innerWeight), y1 - (perp1y * innerWeight)); // second segment's outer vertex
                    verts.push(omx, omy); // outer miter point
                }

                indexCount += 2;
            }
            else if (style.join === 'round')
            {
                if (clockwise) /* arc is outside */
                {
                    verts.push(imx, imy);
                    verts.push(x1 + (perpX * outerWeight), y1 + (perpY * outerWeight));

                    indexCount += round(
                        x1, y1,
                        x1 + (perpX * outerWeight), y1 + (perpY * outerWeight),
                        x1 + (perp1x * outerWeight), y1 + (perp1y * outerWeight),
                        verts, true
                    ) + 4;

                    verts.push(imx, imy);
                    verts.push(x1 + (perp1x * outerWeight), y1 + (perp1y * outerWeight));
                }
                else /* arc is inside */
                {
                    verts.push(x1 - (perpX * innerWeight), y1 - (perpY * innerWeight));
                    verts.push(omx, omy);

                    indexCount += round(
                        x1, y1,
                        x1 - (perpX * innerWeight), y1 - (perpY * innerWeight),
                        x1 - (perp1x * innerWeight), y1 - (perp1y * innerWeight),
                        verts, false
                    ) + 4;

                    verts.push(x1 - (perp1x * innerWeight), y1 - (perp1y * innerWeight));
                    verts.push(omx, omy);
                }
            }
            else
            {
                verts.push(imx, imy);
                verts.push(omx, omy);
            }
        }
        else // inside miter is NOT ok
        {
            verts.push(x1 - (perpX * innerWeight), y1 - (perpY * innerWeight)); // first segment's inner vertex
            verts.push(x1 + (perpX * outerWeight), y1 + (perpY * outerWeight)); // first segment's outer vertex
            if (style.join === 'round')
            {
                if (clockwise) /* arc is outside */
                {
                    indexCount += round(
                        x1, y1,
                        x1 + (perpX * outerWeight), y1 + (perpY * outerWeight),
                        x1 + (perp1x * outerWeight), y1 + (perp1y * outerWeight),
                        verts, true
                    ) + 2;
                }
                else /* arc is inside */
                {
                    indexCount += round(
                        x1, y1,
                        x1 - (perpX * innerWeight), y1 - (perpY * innerWeight),
                        x1 - (perp1x * innerWeight), y1 - (perp1y * innerWeight),
                        verts, false
                    ) + 2;
                }
            }
            else if (style.join === 'miter' && pDist / widthSquared <= miterLimitSquared)
            {
                if (clockwise)
                {
                    verts.push(omx, omy); // inner miter point
                    verts.push(omx, omy); // inner miter point
                }
                else
                {
                    verts.push(imx, imy); // outer miter point
                    verts.push(imx, imy); // outer miter point
                }
                indexCount += 2;
            }
            verts.push(x1 - (perp1x * innerWeight), y1 - (perp1y * innerWeight)); // second segment's inner vertex
            verts.push(x1 + (perp1x * outerWeight), y1 + (perp1y * outerWeight)); // second segment's outer vertex
            indexCount += 2;
        }
    }

    x0 = points[(length - 2) * 2];
    y0 = points[((length - 2) * 2) + 1];

    x1 = points[(length - 1) * 2];
    y1 = points[((length - 1) * 2) + 1];

    perpX = -(y0 - y1);
    perpY = x0 - x1;

    dist = Math.sqrt((perpX * perpX) + (perpY * perpY));
    perpX /= dist;
    perpY /= dist;
    perpX *= width;
    perpY *= width;

    verts.push(x1 - (perpX * innerWeight), y1 - (perpY * innerWeight));
    verts.push(x1 + (perpX * outerWeight), y1 + (perpY * outerWeight));

    if (!closedShape)
    {
        if (style.cap === 'round')
        {
            indexCount += round(
                x1 - (perpX * (innerWeight - outerWeight) * 0.5),
                y1 - (perpY * (innerWeight - outerWeight) * 0.5),
                x1 - (perpX * innerWeight),
                y1 - (perpY * innerWeight),
                x1 + (perpX * outerWeight),
                y1 + (perpY * outerWeight),
                verts,
                false
            ) + 2;
        }
        else if (style.cap === 'square')
        {
            indexCount += square(x1, y1, perpX, perpY, innerWeight, outerWeight, false, verts);
        }
    }

    // const indices = graphicsGeometry.indices;
    const eps2 = curveEps * curveEps;

    // indices.push(indexStart);
    for (let i = indexStart; i < indexCount + indexStart - 2; ++i)
    {
        x0 = verts[(i * 2)];
        y0 = verts[(i * 2) + 1];

        x1 = verts[(i + 1) * 2];
        y1 = verts[((i + 1) * 2) + 1];

        x2 = verts[(i + 2) * 2];
        y2 = verts[((i + 2) * 2) + 1];

        /* Skip zero area triangles */
        if (Math.abs((x0 * (y1 - y2)) + (x1 * (y2 - y0)) + (x2 * (y0 - y1))) < eps2)
        {
            continue;
        }

        indices.push(i, i + 1, i + 2);
    }
}

