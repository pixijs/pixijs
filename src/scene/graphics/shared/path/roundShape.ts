import type { PointData } from '../../../../maths/point/PointData';
import type { ShapePath } from './ShapePath';

/**
 * Typed and cleaned up version of:
 * https://stackoverflow.com/questions/44855794/html5-canvas-triangle-with-rounded-corners/44856925#44856925
 * @param g - Graphics to be drawn on.
 * @param points - Corners of the shape to draw. Minimum length is 3.
 * @param radius - Corners default radius.
 * @ignore
 */
export function roundedShapeArc(
    g: ShapePath,
    points: RoundedPoint[],
    radius: number
): void
{
    const vecFrom = (p: PointData, pp: PointData) =>
    {
        const x = pp.x - p.x;
        const y = pp.y - p.y;
        const len = Math.sqrt((x * x) + (y * y));
        const nx = x / len;
        const ny = y / len;

        return { len, nx, ny };
    };

    const sharpCorner = (i: number, p: PointData) =>
    {
        if (i === 0)
        {
            g.moveTo(p.x, p.y);
        }
        else
        {
            g.lineTo(p.x, p.y);
        }
    };

    let p1 = points[points.length - 1];

    for (let i = 0; i < points.length; i++)
    {
        const p2 = points[i % points.length];
        const pRadius = p2.radius ?? radius;

        if (pRadius <= 0)
        {
            sharpCorner(i, p2);
            p1 = p2;
            continue;
        }

        const p3 = points[(i + 1) % points.length];
        const v1 = vecFrom(p2, p1);
        const v2 = vecFrom(p2, p3);

        if (v1.len < 1e-4 || v2.len < 1e-4)
        {
            sharpCorner(i, p2);
            p1 = p2;
            continue;
        }

        let angle = Math.asin((v1.nx * v2.ny) - (v1.ny * v2.nx));
        let radDirection = 1;
        let drawDirection = false;

        if ((v1.nx * v2.nx) - (v1.ny * -v2.ny) < 0)
        {
            if (angle < 0)
            {
                angle = Math.PI + angle;
            }
            else
            {
                angle = Math.PI - angle;
                radDirection = -1;
                drawDirection = true;
            }
        }
        else if (angle > 0)
        {
            radDirection = -1;
            drawDirection = true;
        }

        const halfAngle = angle / 2;

        let cRadius: number;
        let lenOut = Math.abs(
            (Math.cos(halfAngle) * pRadius) / Math.sin(halfAngle)
        );

        if (lenOut > Math.min(v1.len / 2, v2.len / 2))
        {
            lenOut = Math.min(v1.len / 2, v2.len / 2);
            cRadius = Math.abs((lenOut * Math.sin(halfAngle)) / Math.cos(halfAngle));
        }
        else
        {
            cRadius = pRadius;
        }

        const cX = p2.x + (v2.nx * lenOut) + (-v2.ny * cRadius * radDirection);
        const cY = p2.y + (v2.ny * lenOut) + (v2.nx * cRadius * radDirection);
        const startAngle = Math.atan2(v1.ny, v1.nx) + ((Math.PI / 2) * radDirection);
        const endAngle = Math.atan2(v2.ny, v2.nx) - ((Math.PI / 2) * radDirection);

        if (i === 0)
        {
            g.moveTo(
                cX + (Math.cos(startAngle) * cRadius),
                cY + (Math.sin(startAngle) * cRadius)
            );
        }

        g.arc(cX, cY, cRadius, startAngle, endAngle, drawDirection);

        p1 = p2;
    }
}

export type RoundedPoint = PointData & { radius?: number };

/**
 * Typed and cleaned up version of:
 * https://stackoverflow.com/questions/44855794/html5-canvas-triangle-with-rounded-corners/56214413#56214413
 * @param g - Graphics to be drawn on.
 * @param points - Corners of the shape to draw. Minimum length is 3.
 * @param radius - Corners default radius.
 * @ignore
 */
export function roundedShapeQuadraticCurve(
    g: ShapePath,
    points: RoundedPoint[],
    radius: number,
    smoothness?: number,
): void
{
    const distance = (p1: PointData, p2: PointData) =>
        Math.sqrt(((p1.x - p2.x) ** 2) + ((p1.y - p2.y) ** 2));

    const pointLerp = (p1: PointData, p2: PointData, t: number) => ({
        x: p1.x + ((p2.x - p1.x) * t),
        y: p1.y + ((p2.y - p1.y) * t),
    });

    const numPoints = points.length;

    for (let i = 0; i < numPoints; i++)
    {
        const thisPoint = points[(i + 1) % numPoints];
        const pRadius = thisPoint.radius ?? radius;

        if (pRadius <= 0)
        {
            if (i === 0)
            {
                g.moveTo(thisPoint.x, thisPoint.y);
            }
            else
            {
                g.lineTo(thisPoint.x, thisPoint.y);
            }

            continue;
        }

        const lastPoint = points[i];
        const nextPoint = points[(i + 2) % numPoints];

        const lastEdgeLength = distance(lastPoint, thisPoint);
        let start;

        if (lastEdgeLength < 1e-4)
        {
            start = thisPoint;
        }
        else
        {
            const lastOffsetDistance = Math.min(lastEdgeLength / 2, pRadius);

            start = pointLerp(
                thisPoint,
                lastPoint,
                lastOffsetDistance / lastEdgeLength
            );
        }

        const nextEdgeLength = distance(nextPoint, thisPoint);
        let end;

        if (nextEdgeLength < 1e-4)
        {
            end = thisPoint;
        }
        else
        {
            const nextOffsetDistance = Math.min(nextEdgeLength / 2, pRadius);

            end = pointLerp(
                thisPoint,
                nextPoint,
                nextOffsetDistance / nextEdgeLength
            );
        }

        if (i === 0)
        {
            g.moveTo(start.x, start.y);
        }
        else
        {
            g.lineTo(start.x, start.y);
        }
        g.quadraticCurveTo(thisPoint.x, thisPoint.y, end.x, end.y, smoothness);
    }
}
