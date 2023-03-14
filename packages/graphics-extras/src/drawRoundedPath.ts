import { PI_2 } from '@pixi/core';

import type { IPointData } from '@pixi/core';
import type { Graphics } from '@pixi/graphics';

/**
 * Draw a path with rounded corners.
 * Supports custom radius for each point
 *
 * _Note: Only available with **@pixi/graphics-extras**._
 * @method PIXI.Graphics#drawRoundedPath
 * @param this
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {(IPointData & {radius?: number})[]} points - Minimum length is 3
 * @param {number} radius - Corners default radius
 * @returns {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
export function drawRoundedPath(
    this: Graphics,
    x: number,
    y: number,
    points: (IPointData & { radius?: number })[],
    radius: number
): Graphics
{
    if (points.length < 3)
    {
        return this;
    }

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

        const pRadius = p2.radius !== undefined ? p2.radius : radius;
        const halfAngle = angle / 2;

        let cRadius: number;
        let lenOut = Math.abs(
            (Math.cos(halfAngle) * pRadius) / Math.sin(halfAngle)
        );

        if (lenOut > Math.min(v1.len / 2, v2.len / 2))
        {
            lenOut = Math.min(v1.len / 2, v2.len / 2);
            cRadius = Math.abs(
                (lenOut * Math.sin(halfAngle)) / Math.cos(halfAngle)
            );
        }
        else
        {
            cRadius = pRadius;
        }

        const cX = p2.x + (v2.nx * lenOut) + x + (-v2.ny * cRadius * radDirection);
        const cY = p2.y + (v2.ny * lenOut) + y + (v2.nx * cRadius * radDirection);

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

            this.moveTo(
                cX + (Math.cos(startAngle) * pRadius),
                cY + (Math.sin(startAngle) * pRadius)
            );
        }

        this.arc(
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

    return this.closePath();
}
