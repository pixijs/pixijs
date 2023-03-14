import { PI_2 } from '@pixi/core';

import type { IPointData } from '@pixi/core';
import type { Graphics } from '@pixi/graphics';

/**
 * Typed and cleaned up version of:
 * https://stackoverflow.com/questions/44855794/html5-canvas-triangle-with-rounded-corners/44856925#44856925
 * @method PIXI.Graphics#drawRoundedShape
 * @param {PIXI.Graphics} g - Graphics to be drawn on
 * @param {(IPointData & {radius?: number})[]} points - Minimum length is 3
 * @param {number} radius - Corners default radius
 * @returns {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
function roundedShapeArc(
    g: Graphics,
    points: (IPointData & { radius?: number })[],
    radius: number
): void
{
    const vecFrom = (
        p: { x: number; y: number },
        pp: { x: number; y: number }
    ) =>
    {
        const x = pp.x - p.x;
        const y = pp.y - p.y;
        const len = Math.sqrt((x * x) + (y * y));
        const nx = x / len;
        const ny = y / len;
        const ang = Math.atan2(ny, nx);

        return { x, y, len, nx, ny, ang };
    };

    let p1 = points[points.length - 1];

    for (let i = 0; i < points.length; i++)
    {
        let p2 = points[i % points.length];
        const p3 = points[(i + 1) % points.length];
        const v1 = vecFrom(p2, p1);
        const v2 = vecFrom(p2, p3);
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

        const pRadius = p2.radius || radius;
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

        if (i === 0)
        {
            let startAngle = v1.ang + ((Math.PI / 2) * radDirection);
            let endAngle = v2.ang - ((Math.PI / 2) * radDirection);

            if (!drawDirection && endAngle <= startAngle)
            {
                endAngle += PI_2;
            }
            else if (drawDirection && startAngle <= endAngle)
            {
                startAngle += PI_2;
            }

            g.moveTo(
                cX + (Math.cos(startAngle) * pRadius),
                cY + (Math.sin(startAngle) * pRadius)
            );
        }

        g.arc(
            cX,
            cY,
            cRadius,
            v1.ang + ((Math.PI / 2) * radDirection),
            v2.ang - ((Math.PI / 2) * radDirection),
            drawDirection
        );

        p1 = p2;
        p2 = p3;
    }
}

/**
 * Typed and cleaned up version of:
 * https://stackoverflow.com/questions/44855794/html5-canvas-triangle-with-rounded-corners/56214413#56214413
 * @method PIXI.Graphics#drawRoundedShape
 * @param {PIXI.Graphics} g - Graphics to be drawn on
 * @param {(IPointData & {radius?: number})[]} points - Minimum length is 3
 * @param {number} radius - Corners default radius
 * @returns {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
function roundedShapeQuadraticCurve(
    g: Graphics,
    points: (IPointData & { radius?: number })[],
    radius: number
): void
{
    const distance = (p1: IPointData, p2: IPointData) =>
        Math.sqrt(((p1.x - p2.x) ** 2) + ((p1.y - p2.y) ** 2));

    const pointLerp = (p1: IPointData, p2: IPointData, t: number) => ({
        x: p1.x + ((p2.x - p1.x) * t),
        y: p1.y + ((p2.y - p1.y) * t)
    });

    const numPoints = points.length;

    const corners = [];

    for (let i = 0; i < numPoints; i++)
    {
        const lastPoint = points[i];
        const thisPoint = points[(i + 1) % numPoints];
        const nextPoint = points[(i + 2) % numPoints];

        const lastEdgeLength = distance(lastPoint, thisPoint);
        const lastOffsetDistance = Math.min(
            lastEdgeLength / 2,
            thisPoint.radius || radius
        );
        const start = pointLerp(
            thisPoint,
            lastPoint,
            lastOffsetDistance / lastEdgeLength
        );

        const nextEdgeLength = distance(nextPoint, thisPoint);
        const nextOffsetDistance = Math.min(
            nextEdgeLength / 2,
            thisPoint.radius || radius
        );
        const end = pointLerp(
            thisPoint,
            nextPoint,
            nextOffsetDistance / nextEdgeLength
        );

        corners.push([start, thisPoint, end]);
    }

    g.moveTo(corners[0][0].x, corners[0][0].y);
    for (const [start, ctrl, end] of corners)
    {
        g.lineTo(start.x, start.y);
        g.quadraticCurveTo(ctrl.x, ctrl.y, end.x, end.y);
    }
}

/**
 * Draw a Shape with rounded corners.
 * Supports custom radius for each point
 *
 * _Note: Only available with **@pixi/graphics-extras**._
 * @method PIXI.Graphics#drawRoundedShape
 * @param this
 * @param {(IPointData & {radius?: number})[]} points - Minimum length is 3
 * @param {number} radius - Corners default radius
 * @param {boolean} useQuadraticCurve - if true, rounded corners will be drawn using quadraticCurve instead of arc
 * @returns {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
export function drawRoundedShape(
    this: Graphics,
    points: (IPointData & { radius?: number })[],
    radius: number,
    useQuadraticCurve?: boolean
): Graphics
{
    if (points.length < 3)
    {
        return this;
    }

    if (useQuadraticCurve)
    {
        roundedShapeQuadraticCurve(this, points, radius);
    }
    else
    {
        roundedShapeArc(this, points, radius);
    }

    return this.closePath();
}
