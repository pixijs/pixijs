// thanks to https://github.com/mattdesl/adaptive-bezier-curve
// for the original code!

import { GraphicsContextSystem } from '../GraphicsContextSystem';

const RECURSION_LIMIT = 8;
const FLT_EPSILON = 1.19209290e-7;
const PATH_DISTANCE_EPSILON = 1.0;

const curveAngleToleranceEpsilon = 0.01;
const mAngleTolerance = 0;
const mCuspLimit = 0;

export function buildAdaptiveBezier(
    points: number[],
    sX: number, sY: number,
    cp1x: number, cp1y: number,
    cp2x: number, cp2y: number,
    eX: number, eY: number,
    smoothness?: number,
)
{
    // TODO expose as a parameter
    const scale = 1;
    const smoothing = Math.min(
        0.99, // a value of 1.0 actually inverts smoothing, so we cap it at 0.99
        Math.max(0, smoothness ?? GraphicsContextSystem.defaultOptions.bezierSmoothness)
    );
    let distanceTolerance = (PATH_DISTANCE_EPSILON - smoothing) / scale;

    distanceTolerance *= distanceTolerance;
    begin(sX, sY, cp1x, cp1y, cp2x, cp2y, eX, eY, points, distanceTolerance);

    return points;
}

// //// Based on:
// //// https://github.com/pelson/antigrain/blob/master/agg-2.4/src/agg_curves.cpp

function begin(
    sX: number, sY: number,
    cp1x: number, cp1y: number,
    cp2x: number, cp2y: number,
    eX: number, eY: number,
    points: number[],
    distanceTolerance: number
)
{
    // dont need to actually ad this!
    // points.push(sX, sY);
    recursive(sX, sY, cp1x, cp1y, cp2x, cp2y, eX, eY, points, distanceTolerance, 0);
    points.push(eX, eY);
}

// eslint-disable-next-line max-params
function recursive(
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number,
    x4: number, y4: number,
    points: number[],
    distanceTolerance: number,
    level: number)
{
    if (level > RECURSION_LIMIT)
    { return; }

    const pi = Math.PI;

    // Calculate all the mid-points of the line segments
    // ----------------------
    const x12 = (x1 + x2) / 2;
    const y12 = (y1 + y2) / 2;
    const x23 = (x2 + x3) / 2;
    const y23 = (y2 + y3) / 2;
    const x34 = (x3 + x4) / 2;
    const y34 = (y3 + y4) / 2;
    const x123 = (x12 + x23) / 2;
    const y123 = (y12 + y23) / 2;
    const x234 = (x23 + x34) / 2;
    const y234 = (y23 + y34) / 2;
    const x1234 = (x123 + x234) / 2;
    const y1234 = (y123 + y234) / 2;

    if (level > 0)
    { // Enforce subdivision first time
        // Try to approximate the full cubic curve by a single straight line
        // ------------------
        let dx = x4 - x1;
        let dy = y4 - y1;

        const d2 = Math.abs(((x2 - x4) * dy) - ((y2 - y4) * dx));
        const d3 = Math.abs(((x3 - x4) * dy) - ((y3 - y4) * dx));

        let da1; let da2;

        if (d2 > FLT_EPSILON && d3 > FLT_EPSILON)
        {
            // Regular care
            // -----------------
            if ((d2 + d3) * (d2 + d3) <= distanceTolerance * ((dx * dx) + (dy * dy)))
            {
                // If the curvature doesn't exceed the distanceTolerance value
                // we tend to finish subdivisions.
                // ----------------------
                if (mAngleTolerance < curveAngleToleranceEpsilon)
                {
                    points.push(x1234, y1234);

                    return;
                }

                // Angle & Cusp Condition
                // ----------------------
                const a23 = Math.atan2(y3 - y2, x3 - x2);

                da1 = Math.abs(a23 - Math.atan2(y2 - y1, x2 - x1));
                da2 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - a23);
                if (da1 >= pi) da1 = (2 * pi) - da1;
                if (da2 >= pi) da2 = (2 * pi) - da2;

                if (da1 + da2 < mAngleTolerance)
                {
                    // Finally we can stop the recursion
                    // ----------------------
                    points.push(x1234, y1234);

                    return;
                }

                if (mCuspLimit !== 0.0)
                {
                    if (da1 > mCuspLimit)
                    {
                        points.push(x2, y2);

                        return;
                    }

                    if (da2 > mCuspLimit)
                    {
                        points.push(x3, y3);

                        return;
                    }
                }
            }
        }
        else if (d2 > FLT_EPSILON)
        {
            // p1,p3,p4 are collinear, p2 is considerable
            // ----------------------
            if (d2 * d2 <= distanceTolerance * ((dx * dx) + (dy * dy)))
            {
                if (mAngleTolerance < curveAngleToleranceEpsilon)
                {
                    points.push(x1234, y1234);

                    return;
                }

                // Angle Condition
                // ----------------------
                da1 = Math.abs(Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1));
                if (da1 >= pi) da1 = (2 * pi) - da1;

                if (da1 < mAngleTolerance)
                {
                    points.push(x2, y2);
                    points.push(x3, y3);

                    return;
                }

                if (mCuspLimit !== 0.0)
                {
                    if (da1 > mCuspLimit)
                    {
                        points.push(x2, y2);

                        return;
                    }
                }
            }
        }
        else if (d3 > FLT_EPSILON)
        {
            // p1,p2,p4 are collinear, p3 is considerable
            // ----------------------
            if (d3 * d3 <= distanceTolerance * ((dx * dx) + (dy * dy)))
            {
                if (mAngleTolerance < curveAngleToleranceEpsilon)
                {
                    points.push(x1234, y1234);

                    return;
                }

                // Angle Condition
                // ----------------------
                da1 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y3 - y2, x3 - x2));
                if (da1 >= pi) da1 = (2 * pi) - da1;

                if (da1 < mAngleTolerance)
                {
                    points.push(x2, y2);
                    points.push(x3, y3);

                    return;
                }

                if (mCuspLimit !== 0.0)
                {
                    if (da1 > mCuspLimit)
                    {
                        points.push(x3, y3);

                        return;
                    }
                }
            }
        }
        else
        {
            // Collinear case
            // -----------------
            dx = x1234 - ((x1 + x4) / 2);
            dy = y1234 - ((y1 + y4) / 2);
            if ((dx * dx) + (dy * dy) <= distanceTolerance)
            {
                points.push(x1234, y1234);

                return;
            }
        }
    }

    // Continue subdivision
    // ----------------------
    recursive(x1, y1, x12, y12, x123, y123, x1234, y1234, points, distanceTolerance, level + 1);
    recursive(x1234, y1234, x234, y234, x34, y34, x4, y4, points, distanceTolerance, level + 1);
}

