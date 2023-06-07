import { buildArc } from './buildArc';

/**
 * The arcTo() method creates an arc/curve between two tangents on the canvas.
 *
 * "borrowed" from https://code.google.com/p/fxcanvas/ - thanks google!
 * @param points
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param radius
 */
export function buildArcTo(
    points: number[],
    x1: number, y1: number,
    x2: number, y2: number,
    radius: number,
): void
{
    const fromX = points[points.length - 2];
    const fromY = points[points.length - 1];

    const a1 = fromY - y1;
    const b1 = fromX - x1;
    const a2 = y2 - y1;
    const b2 = x2 - x1;
    const mm = Math.abs((a1 * b2) - (b1 * a2));

    if (mm < 1.0e-8 || radius === 0)
    {
        if (points[points.length - 2] !== x1 || points[points.length - 1] !== y1)
        {
            points.push(x1, y1);
        }

        return;
    }

    const dd = (a1 * a1) + (b1 * b1);
    const cc = (a2 * a2) + (b2 * b2);
    const tt = (a1 * a2) + (b1 * b2);
    const k1 = radius * Math.sqrt(dd) / mm;
    const k2 = radius * Math.sqrt(cc) / mm;
    const j1 = k1 * tt / dd;
    const j2 = k2 * tt / cc;
    const cx = (k1 * b2) + (k2 * b1);
    const cy = (k1 * a2) + (k2 * a1);
    const px = b1 * (k2 + j1);
    const py = a1 * (k2 + j1);
    const qx = b2 * (k1 + j2);
    const qy = a2 * (k1 + j2);
    const startAngle = Math.atan2(py - cy, px - cx);
    const endAngle = Math.atan2(qy - cy, qx - cx);

    buildArc(points,
        (cx + x1),
        (cy + y1),
        radius,
        startAngle,
        endAngle,
        b1 * a2 > b2 * a1
    );
}
