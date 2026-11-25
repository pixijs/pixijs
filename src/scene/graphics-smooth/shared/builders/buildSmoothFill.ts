import { getOrientationOfPoints } from '../../../../maths/misc/getOrientationOfPoints';
import { earcut } from '../../../../utils/utils';
import { closePointEps } from '../../../graphics/shared/const';
import { FILL_EXPAND_BASES, JOINT_TYPE } from '../const';
import { buildSmoothCircleFill } from './SmoothCircleBuilder';

import type { SmoothBuildData } from '../SmoothBuildData';

const tempPn: number[] = [];
const tempOwner: number[] = [];
const tempNormals: number[] = [];
const tempBisectors: number[] = [];

/** Limits the length of bisectors at sharp corners, as a multiple of the AA width */
const MAX_BISECTOR = 3;

/**
 * Removes consecutive duplicate points of a closed polygon, including a last point equal to the first one.
 * @param points - flat [x,y,...] array, modified in place
 * @returns the same array
 */
function removeDuplicatePoints(points: number[]): number[]
{
    let n = 0;

    for (let i = 0; i < points.length; i += 2)
    {
        const x = points[i];
        const y = points[i + 1];

        if (n > 0 && Math.abs(x - points[n - 2]) < closePointEps && Math.abs(y - points[n - 1]) < closePointEps)
        {
            continue;
        }
        points[n++] = x;
        points[n++] = y;
    }

    while (n > 2 && Math.abs(points[0] - points[n - 2]) < closePointEps
        && Math.abs(points[1] - points[n - 1]) < closePointEps)
    {
        n -= 2;
    }

    points.length = n;

    return points;
}

/**
 * Whether a polygon is convex (collinear points allowed).
 * @param points - flat [x,y,...] array
 */
function isConvex(points: number[]): boolean
{
    const n = points.length / 2;
    let sign = 0;

    for (let i = 0; i < n; i++)
    {
        const i1 = ((i + 1) % n) * 2;
        const i2 = ((i + 2) % n) * 2;
        const cross = ((points[i1] - points[i * 2]) * (points[i2 + 1] - points[i1 + 1]))
            - ((points[i1 + 1] - points[(i * 2) + 1]) * (points[i2] - points[i1]));

        if (Math.abs(cross) < closePointEps) continue;
        if (sign === 0) sign = Math.sign(cross);
        else if (sign !== Math.sign(cross)) return false;
    }

    return true;
}

/**
 * Fix polygon winding orientation for earcut.
 * Outer rings must be CCW, holes must be CW.
 * @param points - flat [x,y,...] array
 * @param hole - true if this is a hole (should be clockwise)
 */
function fixOrientation(points: number[], hole = false): void
{
    const m = points.length;

    if (m < 6) return;

    const orientation = getOrientationOfPoints(points);
    const needsReverse = (!hole && orientation === 1) || (hole && orientation === -1);

    if (needsReverse)
    {
        const n = m / 2;

        for (let i = n + (n % 2); i < m; i += 2)
        {
            const i1 = m - i - 2;
            const i2 = m - i - 1;

            [points[i1], points[i]] = [points[i], points[i1]];
            [points[i2], points[i + 1]] = [points[i + 1], points[i2]];
        }
    }
}

/**
 * Builds smooth fill geometry (earcut triangulation) into SmoothBuildData.
 * Supports optional FILL_EXPAND AA for solid-color fills without holes.
 * @param points - Flat [x,y,...] outer polygon points
 * @param holes - Array of hole polygons (each a flat [x,y,...] array)
 * @param fillAA - Enable FILL_EXPAND anti-aliasing
 * @param buildData - Target build data
 * @returns Earcut triangle indices (relative to fill vertex start), or empty array
 * @category scene
 * @internal
 */
export function buildSmoothFill(
    points: number[],
    holes: number[][],
    fillAA: boolean,
    buildData: SmoothBuildData,
): number[]
{
    const { verts, joints } = buildData;
    const eps = closePointEps;

    // Zero length edges (e.g. a closing point equal to the first one) would break the edge normals
    removeDuplicatePoints(points);
    holes = holes.map((hole) => removeDuplicatePoints(hole)).filter((hole) => hole.length >= 6);

    if (points.length < 6)
    {
        return [];
    }

    // A fan from the centroid gives every triangle exactly one boundary edge, which is ideal for FILL_EXPAND
    if (fillAA && holes.length === 0 && isConvex(points))
    {
        let cx = 0;
        let cy = 0;

        for (let i = 0; i < points.length; i += 2)
        {
            cx += points[i];
            cy += points[i + 1];
        }

        return buildSmoothCircleFill(cx * 2 / points.length, cy * 2 / points.length, points, true, buildData);
    }

    let allPoints = points;
    const holeArray: number[] = [];

    fixOrientation(points, false);

    for (let i = 0; i < holes.length; i++)
    {
        const hole = holes[i];

        fixOrientation(hole, true);
        holeArray.push(allPoints.length / 2);
        allPoints = allPoints.concat(hole);
    }

    const triangles = earcut(allPoints, holeArray, 2);

    if (!triangles || triangles.length === 0)
    {
        return [];
    }

    if (!fillAA)
    {
        for (let i = 0; i < allPoints.length; i += 2)
        {
            verts.push(allPoints[i], allPoints[i + 1]);
            joints.push(JOINT_TYPE.FILL);
        }

        return triangles;
    }

    // AA path: each boundary edge gets a strip from 1px inside to 1px outside of the shape, clipped by
    // that edge only, and the triangles are shrunk by 1px to meet the inner side of the strips.
    // Strips of adjacent edges meet along the same bisector, so no pixel is blended twice, and the
    // clipping never extends past the ends of an edge.
    const n = allPoints.length >> 1;

    // Build prev/next neighbor arrays: pn[i * 2] = prev, pn[(i * 2) + 1] = next
    const pn = tempPn;

    pn.length = n * 2;

    let start = 0;

    for (let i = 0; i <= holeArray.length; i++)
    {
        let finish = points.length / 2;

        if (i > 0)
        {
            finish = i < holeArray.length ? holeArray[i] : n;
        }

        pn[start * 2] = finish - 1;
        pn[((finish - 1) * 2) + 1] = start;

        for (let j = start; j + 1 < finish; j++)
        {
            pn[(j * 2) + 1] = j + 1;
            pn[(j * 2) + 2] = j;
        }
        start = finish;
    }

    // The third vertex of the triangle owning each boundary edge, indexed by the edge start (i -> next(i))
    const owner = tempOwner;

    owner.length = n;
    owner.fill(-1);

    for (let i = 0; i < triangles.length; i += 3)
    {
        for (let j = 0; j < 3; j++)
        {
            const a = triangles[i + j];
            const b = triangles[i + ((j + 1) % 3)];
            const c = triangles[i + ((j + 2) % 3)];

            if (pn[(a * 2) + 1] === b)
            {
                owner[a] = c;
            }
            else if (pn[(b * 2) + 1] === a)
            {
                owner[b] = c;
            }
        }
    }

    // Outward unit normal of each boundary edge, pointing away from its owner triangle
    const normals = tempNormals;

    normals.length = n * 2;

    for (let i = 0; i < n; i++)
    {
        const next = pn[(i * 2) + 1];
        const dx = allPoints[next * 2] - allPoints[i * 2];
        const dy = allPoints[(next * 2) + 1] - allPoints[(i * 2) + 1];
        const d = Math.sqrt((dx * dx) + (dy * dy));
        let nx = 0;
        let ny = 0;

        if (owner[i] >= 0 && d > eps)
        {
            nx = dy / d;
            ny = -dx / d;

            const c = owner[i];

            if ((nx * (allPoints[c * 2] - allPoints[i * 2])) + (ny * (allPoints[(c * 2) + 1] - allPoints[(i * 2) + 1])) > 0)
            {
                nx = -nx;
                ny = -ny;
            }
        }
        normals[i * 2] = nx;
        normals[(i * 2) + 1] = ny;
    }

    // Bisector of each vertex, scaled so that it projects to 1 on the normals of both adjacent edges
    const bisectors = tempBisectors;

    bisectors.length = n * 2;

    for (let i = 0; i < n; i++)
    {
        const prev = pn[i * 2];
        let nx1 = normals[prev * 2];
        let ny1 = normals[(prev * 2) + 1];
        let nx2 = normals[i * 2];
        let ny2 = normals[(i * 2) + 1];

        if (nx1 === 0 && ny1 === 0)
        {
            nx1 = nx2;
            ny1 = ny2;
        }
        else if (nx2 === 0 && ny2 === 0)
        {
            nx2 = nx1;
            ny2 = ny1;
        }

        let bx = nx1 + nx2;
        let by = ny1 + ny2;
        const d = (bx * nx1) + (by * ny1);

        if (d < eps)
        {
            // the edges go back on themselves
            bx = nx1;
            by = ny1;
        }
        else
        {
            bx /= d;
            by /= d;
        }

        const bLen = Math.sqrt((bx * bx) + (by * by));

        if (bLen > MAX_BISECTOR)
        {
            bx *= MAX_BISECTOR / bLen;
            by *= MAX_BISECTOR / bLen;
        }

        bisectors[i * 2] = bx;
        bisectors[(i * 2) + 1] = by;
    }

    // Triangles, not clipped, with all their (boundary) vertices moved 1px inside
    for (let i = 0; i < triangles.length; i += 3)
    {
        joints.push(JOINT_TYPE.FILL_EXPAND, JOINT_TYPE.NONE, JOINT_TYPE.NONE,
            JOINT_TYPE.NONE, JOINT_TYPE.NONE, JOINT_TYPE.NONE);

        for (let j = 0; j < 3; j++)
        {
            const idx = triangles[i + j];

            verts.push(allPoints[idx * 2], allPoints[(idx * 2) + 1]);
        }
        for (let j = 0; j < 3; j++)
        {
            const idx = triangles[i + j];

            verts.push(-bisectors[idx * 2], -bisectors[(idx * 2) + 1]);
        }
    }

    // Strip of each boundary edge: (a - bisector(a), b - bisector(b), b + bisector(b), a + bisector(a)),
    // as two triangles that are clipped by the edge a -> b of the owner triangle (flag of its second edge)
    for (let a = 0; a < n; a++)
    {
        const c = owner[a];

        if (c < 0 || (normals[a * 2] === 0 && normals[(a * 2) + 1] === 0)) continue;

        const b = pn[(a * 2) + 1];
        const ax = allPoints[a * 2];
        const ay = allPoints[(a * 2) + 1];
        const bx = allPoints[b * 2];
        const by = allPoints[(b * 2) + 1];
        const cx = allPoints[c * 2];
        const cy = allPoints[(c * 2) + 1];

        joints.push(JOINT_TYPE.FILL_EXPAND + 2 + FILL_EXPAND_BASES.FRINGE_1, JOINT_TYPE.NONE, JOINT_TYPE.NONE,
            JOINT_TYPE.NONE, JOINT_TYPE.NONE, JOINT_TYPE.NONE);
        verts.push(cx, cy, ax, ay, bx, by,
            -bisectors[a * 2], -bisectors[(a * 2) + 1], -bisectors[b * 2], -bisectors[(b * 2) + 1],
            bisectors[b * 2], bisectors[(b * 2) + 1]);

        joints.push(JOINT_TYPE.FILL_EXPAND + 2 + FILL_EXPAND_BASES.FRINGE_2, JOINT_TYPE.NONE, JOINT_TYPE.NONE,
            JOINT_TYPE.NONE, JOINT_TYPE.NONE, JOINT_TYPE.NONE);
        verts.push(cx, cy, ax, ay, bx, by,
            -bisectors[a * 2], -bisectors[(a * 2) + 1], bisectors[b * 2], bisectors[(b * 2) + 1],
            bisectors[a * 2], bisectors[(a * 2) + 1]);
    }

    return [];
}
