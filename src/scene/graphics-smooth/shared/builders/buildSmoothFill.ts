import { earcut } from '../../../../utils/utils';
import { closePointEps } from '../../../graphics/shared/const';
import { getOrientationOfPoints } from '../../../graphics/shared/utils/getOrientationOfPoints';
import { JOINT_TYPE } from '../const';

import type { SmoothBuildData } from '../SmoothBuildData';

const tempPn: number[] = [];

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
 * @advanced
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

    if (points.length < 6)
    {
        return [];
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

    // FILL_EXPAND AA path: emit per-triangle expanded vertices with bisector normals
    const len = allPoints.length;

    // Build prev/next neighbor arrays
    const pn = tempPn;

    if (pn.length < allPoints.length)
    {
        pn.length = allPoints.length;
    }

    let start = 0;

    for (let i = 0; i <= holeArray.length; i++)
    {
        let finish = points.length / 2;

        if (i > 0)
        {
            finish = i < holeArray.length ? holeArray[i] : (allPoints.length >> 1);
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

    // Determine boundary edge flags per triangle
    for (let i = 0; i < triangles.length; i += 3)
    {
        let flag = 0;

        for (let j = 0; j < 3; j++)
        {
            const ind1 = triangles[i + j];
            const ind2 = triangles[i + ((j + 1) % 3)];

            if (pn[ind1 * 2] === ind2 || pn[(ind1 * 2) + 1] === ind2)
            {
                flag |= (1 << j);
            }
        }
        joints.push(JOINT_TYPE.FILL_EXPAND + flag);
        joints.push(JOINT_TYPE.NONE);
        joints.push(JOINT_TYPE.NONE);
        joints.push(JOINT_TYPE.NONE);
        joints.push(JOINT_TYPE.NONE);
        joints.push(JOINT_TYPE.NONE);
    }

    // Compute bisector normals, reusing pn
    for (let ind = 0; ind < len / 2; ind++)
    {
        const prev = pn[ind * 2];
        const next = pn[(ind * 2) + 1];
        let nx1 = allPoints[(next * 2) + 1] - allPoints[(ind * 2) + 1];
        let ny1 = -(allPoints[next * 2] - allPoints[ind * 2]);
        let nx2 = allPoints[(ind * 2) + 1] - allPoints[(prev * 2) + 1];
        let ny2 = -(allPoints[ind * 2] - allPoints[prev * 2]);
        const d1 = Math.sqrt((nx1 * nx1) + (ny1 * ny1));

        nx1 /= d1;
        ny1 /= d1;
        const d2 = Math.sqrt((nx2 * nx2) + (ny2 * ny2));

        nx2 /= d2;
        ny2 /= d2;

        let bx = nx1 + nx2;
        let by = ny1 + ny2;
        const d = (bx * nx1) + (by * ny1);

        if (Math.abs(d) < eps)
        {
            bx = nx1;
            by = ny1;
        }
        else
        {
            bx /= d;
            by /= d;
        }
        pn[ind * 2] = bx;
        pn[(ind * 2) + 1] = by;
    }

    // Emit expanded triangle vertices
    for (let i = 0; i < triangles.length; i += 3)
    {
        const prev = triangles[i];
        const ind = triangles[i + 1];
        const next = triangles[i + 2];
        const nx1 = allPoints[(next * 2) + 1] - allPoints[(ind * 2) + 1];
        const ny1 = -(allPoints[next * 2] - allPoints[ind * 2]);
        const nx2 = allPoints[(ind * 2) + 1] - allPoints[(prev * 2) + 1];
        const ny2 = -(allPoints[ind * 2] - allPoints[prev * 2]);

        let j1 = 1;

        if ((nx1 * ny2) - (nx2 * ny1) > 0.0)
        {
            j1 = 2;
        }

        for (let j = 0; j < 3; j++)
        {
            const idx = triangles[i + ((j * j1) % 3)];

            verts.push(allPoints[idx * 2], allPoints[(idx * 2) + 1]);
        }
        for (let j = 0; j < 3; j++)
        {
            const idx = triangles[i + ((j * j1) % 3)];

            verts.push(pn[idx * 2], pn[(idx * 2) + 1]);
        }
    }

    return [];
}
