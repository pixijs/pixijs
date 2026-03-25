import type { Circle } from '../../../../maths/shapes/Circle';
import type { Ellipse } from '../../../../maths/shapes/Ellipse';
import type { Polygon } from '../../../../maths/shapes/Polygon';
import type { Rectangle } from '../../../../maths/shapes/Rectangle';
import type { RoundedRectangle } from '../../../../maths/shapes/RoundedRectangle';
import type { GraphicsPath } from '../path/GraphicsPath';

const PI2 = Math.PI * 2;

/**
 * Converts a `GraphicsPath` into an SVG path `d` attribute string.
 * Mirrors `parseSVGPath` but in the reverse direction.
 * @param path - The GraphicsPath to convert.
 * @param precision - Number of decimal places for coordinates.
 * @returns The SVG `d` attribute value.
 * @internal
 */
export function buildSVGPath(path: GraphicsPath, precision = 2): string
{
    const parts: string[] = [];

    for (let i = 0; i < path.instructions.length; i++)
    {
        const inst = path.instructions[i];
        const d = inst.data;

        switch (inst.action)
        {
            case 'moveTo':
                parts.push(`M${n(d[0], precision)} ${n(d[1], precision)}`);
                break;

            case 'lineTo':
                parts.push(`L${n(d[0], precision)} ${n(d[1], precision)}`);
                break;

            case 'quadraticCurveTo':
                // data: cpx, cpy, x, y [, smoothness]
                parts.push(`Q${n(d[0], precision)} ${n(d[1], precision)} ${n(d[2], precision)} ${n(d[3], precision)}`);
                break;

            case 'bezierCurveTo':
                // data: cp1x, cp1y, cp2x, cp2y, x, y [, smoothness]
                parts.push(
                    `C${n(d[0], precision)} ${n(d[1], precision)} `
                    + `${n(d[2], precision)} ${n(d[3], precision)} `
                    + `${n(d[4], precision)} ${n(d[5], precision)}`
                );
                break;

            case 'arcToSvg':
                // data: rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y
                parts.push(
                    `A${n(d[0], precision)} ${n(d[1], precision)} `
                    + `${n(d[2], precision)} ${d[3]} ${d[4]} `
                    + `${n(d[5], precision)} ${n(d[6], precision)}`
                );
                break;

            case 'closePath':
                parts.push('Z');
                break;

            case 'arc':
                // data: cx, cy, radius, startAngle, endAngle, counterclockwise
                parts.push(buildArc(d[0], d[1], d[2], d[3], d[4], !!d[5], precision));
                break;

            case 'rect':
                // data: x, y, w, h [, transform]
                parts.push(buildRect(d[0], d[1], d[2], d[3], precision));
                break;

            case 'circle':
                // data: cx, cy, radius [, transform]
                parts.push(buildEllipseArc(d[0], d[1], d[2], d[2], precision));
                break;

            case 'ellipse':
                // data: cx, cy, rx, ry [, transform]
                parts.push(buildEllipseArc(d[0], d[1], d[2], d[3], precision));
                break;

            case 'roundRect':
                // data: x, y, w, h, radius [, transform]
                parts.push(buildRoundRect(d[0], d[1], d[2], d[3], d[4] ?? 0, precision));
                break;

            case 'poly':
                // data: points[], close [, transform]
                parts.push(buildPoly(d[0], d[1] ?? true, precision));
                break;

            case 'addPath':
                // data: GraphicsPath [, transform]
                parts.push(buildSVGPath(d[0] as GraphicsPath, precision));
                break;

            // Complex shapes – fall back to flattened polygon points via shapePath
            case 'regularPoly':
            case 'roundPoly':
            case 'roundShape':
            case 'filletRect':
            case 'chamferRect':
            case 'arcTo':
                parts.push(buildFallback(path, precision));
                break;
        }
    }

    return parts.join('');
}

/**
 * Rounds a number to the given decimal places, stripping trailing zeros.
 * @param value
 * @param precision
 */
function n(value: number, precision: number): string
{
    return parseFloat(value.toFixed(precision)).toString();
}

/**
 * Converts a canvas-style arc to SVG arc commands.
 * @param cx
 * @param cy
 * @param radius
 * @param startAngle
 * @param endAngle
 * @param ccw
 * @param precision
 */
function buildArc(
    cx: number, cy: number, radius: number,
    startAngle: number, endAngle: number, ccw: boolean,
    precision: number
): string
{
    let sweep = endAngle - startAngle;

    if (ccw)
    {
        if (sweep > 0) sweep -= PI2;
    }
    else if (sweep < 0)
    {
        sweep += PI2;
    }

    // Full circle – split into two half arcs
    if (Math.abs(sweep) >= PI2 - 1e-6)
    {
        return buildEllipseArc(cx, cy, radius, radius, precision);
    }

    const sx = cx + (radius * Math.cos(startAngle));
    const sy = cy + (radius * Math.sin(startAngle));
    const ex = cx + (radius * Math.cos(endAngle));
    const ey = cy + (radius * Math.sin(endAngle));

    const largeArc = Math.abs(sweep) > Math.PI ? 1 : 0;
    const sweepFlag = ccw ? 0 : 1;

    return `L${n(sx, precision)} ${n(sy, precision)}`
        + `A${n(radius, precision)} ${n(radius, precision)} 0 ${largeArc} ${sweepFlag} `
        + `${n(ex, precision)} ${n(ey, precision)}`;
}

/**
 * Two half-arcs forming a full ellipse.
 * @param cx
 * @param cy
 * @param rx
 * @param ry
 * @param precision
 */
function buildEllipseArc(cx: number, cy: number, rx: number, ry: number, precision: number): string
{
    return `M${n(cx - rx, precision)} ${n(cy, precision)}`
        + `A${n(rx, precision)} ${n(ry, precision)} 0 1 1 ${n(cx + rx, precision)} ${n(cy, precision)}`
        + `A${n(rx, precision)} ${n(ry, precision)} 0 1 1 ${n(cx - rx, precision)} ${n(cy, precision)}Z`;
}

/**
 * Rectangle as M/L/Z path.
 * @param x
 * @param y
 * @param w
 * @param h
 * @param precision
 */
function buildRect(x: number, y: number, w: number, h: number, precision: number): string
{
    return `M${n(x, precision)} ${n(y, precision)}`
        + `L${n(x + w, precision)} ${n(y, precision)}`
        + `L${n(x + w, precision)} ${n(y + h, precision)}`
        + `L${n(x, precision)} ${n(y + h, precision)}Z`;
}

/**
 * Rounded rectangle using lines + arcs.
 * @param x
 * @param y
 * @param w
 * @param h
 * @param r
 * @param precision
 */
function buildRoundRect(x: number, y: number, w: number, h: number, r: number, precision: number): string
{
    if (r <= 0) return buildRect(x, y, w, h, precision);

    r = Math.min(r, Math.min(w, h) / 2);

    return `M${n(x + r, precision)} ${n(y, precision)}`
        + `L${n(x + w - r, precision)} ${n(y, precision)}`
        + `A${n(r, precision)} ${n(r, precision)} 0 0 1 ${n(x + w, precision)} ${n(y + r, precision)}`
        + `L${n(x + w, precision)} ${n(y + h - r, precision)}`
        + `A${n(r, precision)} ${n(r, precision)} 0 0 1 ${n(x + w - r, precision)} ${n(y + h, precision)}`
        + `L${n(x + r, precision)} ${n(y + h, precision)}`
        + `A${n(r, precision)} ${n(r, precision)} 0 0 1 ${n(x, precision)} ${n(y + h - r, precision)}`
        + `L${n(x, precision)} ${n(y + r, precision)}`
        + `A${n(r, precision)} ${n(r, precision)} 0 0 1 ${n(x + r, precision)} ${n(y, precision)}Z`;
}

/**
 * Polygon / polyline from flat number array or PointData array.
 * @param points
 * @param close
 * @param precision
 */
function buildPoly(points: number[] | { x: number, y: number }[], close: boolean, precision: number): string
{
    if (points.length === 0) return '';

    const parts: string[] = [];
    const isFlat = typeof points[0] === 'number';

    if (isFlat)
    {
        const pts = points as number[];

        parts.push(`M${n(pts[0], precision)} ${n(pts[1], precision)}`);

        for (let i = 2; i < pts.length; i += 2)
        {
            parts.push(`L${n(pts[i], precision)} ${n(pts[i + 1], precision)}`);
        }
    }
    else
    {
        const pts = points as { x: number, y: number }[];

        parts.push(`M${n(pts[0].x, precision)} ${n(pts[0].y, precision)}`);

        for (let i = 1; i < pts.length; i++)
        {
            parts.push(`L${n(pts[i].x, precision)} ${n(pts[i].y, precision)}`);
        }
    }

    if (close) parts.push('Z');

    return parts.join('');
}

/**
 * Fallback for complex shape instructions that have no direct SVG equivalent.
 * Uses the ShapePath tessellation to get flattened polygon points.
 * @param path
 * @param precision
 */
function buildFallback(path: GraphicsPath, precision: number): string
{
    const shapePrimitives = path.shapePath.shapePrimitives;
    const parts: string[] = [];

    for (const primitive of shapePrimitives)
    {
        const shape = primitive.shape;

        switch (shape.type)
        {
            case 'polygon': {
                const poly = shape as Polygon;

                parts.push(buildPoly(poly.points, poly.closePath, precision));
                break;
            }
            case 'circle': {
                const c = shape as Circle;

                parts.push(buildEllipseArc(c.x, c.y, c.radius, c.radius, precision));
                break;
            }
            case 'ellipse': {
                const e = shape as Ellipse;

                parts.push(buildEllipseArc(e.x, e.y, e.halfWidth, e.halfHeight, precision));
                break;
            }
            case 'rectangle': {
                const r = shape as Rectangle;

                parts.push(buildRect(r.x, r.y, r.width, r.height, precision));
                break;
            }
            case 'roundedRectangle': {
                const rr = shape as RoundedRectangle;

                parts.push(buildRoundRect(rr.x, rr.y, rr.width, rr.height, rr.radius, precision));
                break;
            }
        }
    }

    return parts.join('');
}
