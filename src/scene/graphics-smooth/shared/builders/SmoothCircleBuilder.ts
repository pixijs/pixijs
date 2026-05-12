import { JOINT_TYPE } from '../const';

import type { SmoothBuildData } from '../SmoothBuildData';

/**
 * Generates optimally-distributed points for circles, ellipses, and rounded rectangles.
 * Uses a four-pointer walk algorithm for symmetric point placement.
 *
 * Port of CircleBuilder.path from graphics-smooth.
 * @param x - Center X
 * @param y - Center Y
 * @param rx - X radius
 * @param ry - Y radius
 * @param dx - Half-width beyond radius (for rounded rects)
 * @param dy - Half-height beyond radius (for rounded rects)
 * @returns Flat [x,y,...] point array
 * @category scene
 * @advanced
 */
export function buildSmoothCirclePath(
    x: number,
    y: number,
    rx: number,
    ry: number,
    dx: number,
    dy: number,
): number[]
{
    if (!(rx >= 0 && ry >= 0 && dx >= 0 && dy >= 0))
    {
        return [];
    }

    const n = Math.ceil(2.3 * Math.sqrt(rx + ry));
    const m = (n * 8) + (dx ? 4 : 0) + (dy ? 4 : 0);

    const points: number[] = new Array(m);

    if (m === 0)
    {
        return points;
    }

    if (n === 0)
    {
        points.length = 8;
        points[0] = points[6] = x + dx;
        points[1] = points[3] = y + dy;
        points[2] = points[4] = x - dx;
        points[5] = points[7] = y - dy;

        return points;
    }

    let j1 = 0;
    let j2 = (n * 4) + (dx ? 2 : 0) + 2;
    let j3 = j2;
    let j4 = m;

    {
        const x0 = dx + rx;
        const y0 = dy;
        const x1p = x + x0;
        const x2p = x - x0;
        const y1p = y + y0;

        points[j1++] = x1p;
        points[j1++] = y1p;
        points[--j2] = y1p;
        points[--j2] = x2p;

        if (dy)
        {
            const y2p = y - y0;

            points[j3++] = x2p;
            points[j3++] = y2p;
            points[--j4] = y2p;
            points[--j4] = x1p;
        }
    }

    for (let i = 1; i < n; i++)
    {
        const a = (Math.PI / 2) * (i / n);
        const x0 = dx + (Math.cos(a) * rx);
        const y0 = dy + (Math.sin(a) * ry);
        const x1p = x + x0;
        const x2p = x - x0;
        const y1p = y + y0;
        const y2p = y - y0;

        points[j1++] = x1p;
        points[j1++] = y1p;
        points[--j2] = y1p;
        points[--j2] = x2p;
        points[j3++] = x2p;
        points[j3++] = y2p;
        points[--j4] = y2p;
        points[--j4] = x1p;
    }

    {
        const x0 = dx;
        const y0 = dy + ry;
        const x1p = x + x0;
        const x2p = x - x0;
        const y1p = y + y0;
        const y2p = y - y0;

        points[j1++] = x1p;
        points[j1++] = y1p;
        points[--j4] = y2p;
        points[--j4] = x1p;

        if (dx)
        {
            points[j1++] = x2p;
            points[j1++] = y1p;
            points[--j4] = y2p;
            points[--j4] = x2p;
        }
    }

    return points;
}

/**
 * Builds a fan-triangulated circle/ellipse/rrect fill into SmoothBuildData.
 * @param cx - Center X (possibly transformed)
 * @param cy - Center Y (possibly transformed)
 * @param points - Perimeter points from buildSmoothCirclePath
 * @param fillAA - Enable FILL_EXPAND anti-aliasing
 * @param buildData - Target build data
 * @returns Triangle indices for non-AA path, empty array for AA path
 * @category scene
 * @advanced
 */
export function buildSmoothCircleFill(
    cx: number,
    cy: number,
    points: number[],
    fillAA: boolean,
    buildData: SmoothBuildData,
): number[]
{
    const { verts, joints } = buildData;

    if (points.length === 0)
    {
        return [];
    }

    if (!fillAA)
    {
        const triangles: number[] = [];
        let vertPos = 1;
        const center = 0;

        verts.push(cx, cy);
        joints.push(JOINT_TYPE.FILL);
        verts.push(points[0], points[1]);
        joints.push(JOINT_TYPE.FILL);

        for (let i = 2; i < points.length; i += 2)
        {
            verts.push(points[i], points[i + 1]);
            joints.push(JOINT_TYPE.FILL);
            triangles.push(vertPos++, center, vertPos);
        }

        triangles.push(center + 1, center, vertPos);

        return triangles;
    }

    // FILL_EXPAND AA path
    const len = points.length;

    let x1 = points[len - 2];
    let y1 = points[len - 1];

    let nx1 = y1 - points[len - 3];
    let ny1 = points[len - 4] - x1;
    const n1 = Math.sqrt((nx1 * nx1) + (ny1 * ny1));

    nx1 /= n1;
    ny1 /= n1;

    let bx1: number;
    let by1: number;

    for (let i = 0; i < len; i += 2)
    {
        const x2 = points[i];
        const y2 = points[i + 1];

        let nx2 = y2 - y1;
        let ny2 = x1 - x2;
        const n2 = Math.sqrt((nx2 * nx2) + (ny2 * ny2));

        nx2 /= n2;
        ny2 /= n2;

        let bx2 = nx1 + nx2;
        let by2 = ny1 + ny2;
        const b2 = (nx2 * bx2) + (ny2 * by2);

        bx2 /= b2;
        by2 /= b2;

        if (i > 0)
        {
            verts.push(bx2, by2);
        }
        else
        {
            bx1 = bx2;
            by1 = by2;
        }

        verts.push(cx, cy);
        verts.push(x1, y1);
        verts.push(x2, y2);

        verts.push(0, 0);
        verts.push(bx2, by2);

        joints.push(JOINT_TYPE.FILL_EXPAND + 2);
        joints.push(JOINT_TYPE.NONE);
        joints.push(JOINT_TYPE.NONE);
        joints.push(JOINT_TYPE.NONE);
        joints.push(JOINT_TYPE.NONE);
        joints.push(JOINT_TYPE.NONE);

        x1 = x2;
        y1 = y2;
        nx1 = nx2;
        ny1 = ny2;
    }

    verts.push(bx1!, by1!);

    return [];
}

/**
 * Builds smooth line joints for a circle/ellipse/rrect perimeter.
 * Uses JOINT_MITER+3 for arc segments.
 * @param points - Perimeter points
 * @param buildData - Target build data
 * @category scene
 * @advanced
 */
export function buildSmoothCircleLine(
    points: number[],
    buildData: SmoothBuildData,
): void
{
    const { verts, joints } = buildData;
    const joint = points.length === 8
        ? JOINT_TYPE.JOINT_MITER : JOINT_TYPE.JOINT_MITER + 3;
    const len = points.length;

    if (len === 0)
    {
        return;
    }

    verts.push(points[len - 2], points[len - 1]);
    joints.push(JOINT_TYPE.NONE);

    for (let i = 0; i < len; i += 2)
    {
        verts.push(points[i], points[i + 1]);
        joints.push(joint);
    }

    verts.push(points[0], points[1]);
    joints.push(JOINT_TYPE.NONE);
    verts.push(points[2], points[3]);
    joints.push(JOINT_TYPE.NONE);
}
