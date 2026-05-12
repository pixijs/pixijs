import { JOINT_TYPE } from '../const';

import type { LineCap, LineJoin } from '../../../graphics/shared/const';
import type { SmoothBuildData } from '../SmoothBuildData';

/**
 * Maps v8 LineCap string to JOINT_TYPE cap constant.
 * @param cap - v8 cap style
 * @returns JOINT_TYPE cap value
 */
function mapCap(cap: LineCap): number
{
    switch (cap)
    {
        case 'square': return JOINT_TYPE.CAP_SQUARE;
        case 'round': return JOINT_TYPE.CAP_ROUND;
        default: return JOINT_TYPE.CAP_BUTT;
    }
}

/**
 * Maps v8 LineJoin string to JOINT_TYPE joint constant.
 * @param join - v8 join style
 * @returns JOINT_TYPE joint value
 */
function mapJoin(join: LineJoin): number
{
    switch (join)
    {
        case 'bevel': return JOINT_TYPE.JOINT_BEVEL;
        case 'round': return JOINT_TYPE.JOINT_ROUND;
        default: return JOINT_TYPE.JOINT_MITER;
    }
}

/**
 * Builds smooth line geometry from a point array into SmoothBuildData.
 * Port of PolyBuilder.line from graphics-smooth, adapted for v8 types.
 * @param points - Flat [x0,y0,x1,y1,...] point array
 * @param closed - Whether the path is closed
 * @param join - v8 LineJoin style
 * @param cap - v8 LineCap style
 * @param buildData - Target build data
 * @category scene
 * @advanced
 */
export function buildSmoothLine(
    points: number[],
    closed: boolean,
    join: LineJoin,
    cap: LineCap,
    buildData: SmoothBuildData,
): void
{
    const len = points.length;

    if (len <= 2)
    {
        return;
    }

    const { verts, joints } = buildData;
    const joint = mapJoin(join);
    const capType = mapCap(cap);

    let prevCap = 0;

    let prevX: number;
    let prevY: number;

    if (closed)
    {
        prevX = points[len - 2];
        prevY = points[len - 1];
        joints.push(JOINT_TYPE.NONE);
    }
    else
    {
        prevX = points[2];
        prevY = points[3];
        if (capType === JOINT_TYPE.CAP_ROUND)
        {
            verts.push(points[0], points[1]);
            joints.push(JOINT_TYPE.NONE);
            joints.push(JOINT_TYPE.CAP_ROUND);
            prevCap = 0;
        }
        else
        {
            prevCap = capType;
            joints.push(JOINT_TYPE.NONE);
        }
    }
    verts.push(prevX, prevY);

    for (let i = 0; i < len; i += 2)
    {
        const x1 = points[i];
        const y1 = points[i + 1];

        let endJoint = joint;

        if (i + 2 >= len)
        {
            if (!closed)
            {
                endJoint = JOINT_TYPE.NONE;
            }
        }
        else if (i + 4 >= len)
        {
            if (!closed)
            {
                if (capType === JOINT_TYPE.CAP_ROUND)
                {
                    endJoint = JOINT_TYPE.JOINT_CAP_ROUND;
                }
                else if (capType === JOINT_TYPE.CAP_BUTT)
                {
                    endJoint = JOINT_TYPE.JOINT_CAP_BUTT;
                }
                else if (capType === JOINT_TYPE.CAP_SQUARE)
                {
                    endJoint = JOINT_TYPE.JOINT_CAP_SQUARE;
                }
            }
        }

        endJoint += prevCap;
        prevCap = 0;

        verts.push(x1, y1);
        joints.push(endJoint);
    }

    if (closed)
    {
        verts.push(points[0], points[1]);
        joints.push(JOINT_TYPE.NONE);
        verts.push(points[2], points[3]);
        joints.push(JOINT_TYPE.NONE);
    }
    else
    {
        verts.push(points[len - 4], points[len - 3]);
        joints.push(JOINT_TYPE.NONE);
    }
}
