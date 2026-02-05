import { type Polygon } from '../../../../maths/shapes/Polygon';

import type { GraphicsPath } from '../path/GraphicsPath';

/**
 * Computes the maximum miter ratio from polygon corner angles in a graphics path.
 * The miter ratio determines how much the stroke padding must expand to contain miter joins
 * at sharp angles. Returns a value >= 1, clamped by the miterLimit.
 * @param path - The graphics path containing polygon shapes
 * @param miterLimit - The maximum allowed miter ratio
 * @returns The maximum miter ratio found in all polygon corners, clamped by miterLimit
 * @internal
 */
export function getMaxMiterRatio(path: GraphicsPath, miterLimit: number): number
{
    let maxRatio = 1;

    const shapePrimitives = path.shapePath.shapePrimitives;

    for (let i = 0; i < shapePrimitives.length; i++)
    {
        const shape = shapePrimitives[i].shape;

        if (shape.type !== 'polygon') continue;

        const points = (shape as Polygon).points;
        const n = points.length;

        if (n < 6) continue;

        const closed = (shape as Polygon).closePath;

        for (let j = 0; j < n; j += 2)
        {
            // For open paths, skip first and last points (they use caps, not joins)
            if (!closed && (j === 0 || j === n - 2)) continue;

            const prevIdx = (j - 2 + n) % n;
            const nextIdx = (j + 2) % n;

            const x0 = points[prevIdx];
            const y0 = points[prevIdx + 1];
            const x1 = points[j];
            const y1 = points[j + 1];
            const x2 = points[nextIdx];
            const y2 = points[nextIdx + 1];

            const dx0 = x0 - x1;
            const dy0 = y0 - y1;
            const dx1 = x2 - x1;
            const dy1 = y2 - y1;

            const len0Sq = (dx0 * dx0) + (dy0 * dy0);
            const len1Sq = (dx1 * dx1) + (dy1 * dy1);

            if (len0Sq < 1e-12 || len1Sq < 1e-12) continue;

            const dot = (dx0 * dx1) + (dy0 * dy1);
            const cosAngle = dot / Math.sqrt(len0Sq * len1Sq);
            let clampedCos = cosAngle;

            if (clampedCos < -1) clampedCos = -1;
            else if (clampedCos > 1) clampedCos = 1;

            const sinHalfAngle = Math.sqrt((1 - clampedCos) * 0.5);

            if (sinHalfAngle < 1e-6) continue;

            const miterRatio = Math.min(1 / sinHalfAngle, miterLimit);

            if (miterRatio > maxRatio) maxRatio = miterRatio;
        }
    }

    return maxRatio;
}
