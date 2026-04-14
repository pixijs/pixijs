import type { Matrix } from '../../../../maths/matrix/Matrix';
import type { Circle } from '../../../../maths/shapes/Circle';
import type { Ellipse } from '../../../../maths/shapes/Ellipse';
import type { Polygon } from '../../../../maths/shapes/Polygon';
import type { Rectangle } from '../../../../maths/shapes/Rectangle';
import type { RoundedRectangle } from '../../../../maths/shapes/RoundedRectangle';
import type { GraphicsPath, PathInstruction } from '../path/GraphicsPath';

const PI2 = Math.PI * 2;

const COMPLEX_ACTIONS = new Set<PathInstruction['action']>([
    'regularPoly',
    'roundPoly',
    'roundShape',
    'filletRect',
    'chamferRect',
    'arcTo',
]);

/**
 * Converts a `GraphicsPath` into an SVG path `d` attribute string.
 * Mirrors `parseSVGPath` but in the reverse direction.
 * @param path - The GraphicsPath to convert.
 * @param precision - Number of decimal places for coordinates.
 * @param flatten - When true, forces curve/arc geometry to be emitted as polylines.
 *                  Used when the parser's naive area estimator must parse every number
 *                  as a coordinate (e.g. hole subpaths).
 * @returns The SVG `d` attribute value.
 * @internal
 */
export function buildSVGPath(path: GraphicsPath, precision = 2, flatten = false): string
{
    if (path.instructions.some((inst) => COMPLEX_ACTIONS.has(inst.action)))
    {
        return buildFromShapePrimitives(path, precision, flatten);
    }

    const parts: string[] = [];
    let hasCurrent = false;

    for (let i = 0; i < path.instructions.length; i++)
    {
        const inst = path.instructions[i];
        const d = inst.data;

        switch (inst.action)
        {
            case 'moveTo':
                parts.push(`M${pt(d[0], d[1], null, precision)}`);
                hasCurrent = true;
                break;

            case 'lineTo':
                parts.push(`L${pt(d[0], d[1], null, precision)}`);
                hasCurrent = true;
                break;

            case 'quadraticCurveTo':
                parts.push(
                    `Q${pt(d[0], d[1], null, precision)} `
                    + `${pt(d[2], d[3], null, precision)}`
                );
                hasCurrent = true;
                break;

            case 'bezierCurveTo':
                parts.push(
                    `C${pt(d[0], d[1], null, precision)} `
                    + `${pt(d[2], d[3], null, precision)} `
                    + `${pt(d[4], d[5], null, precision)}`
                );
                hasCurrent = true;
                break;

            case 'arcToSvg':
                parts.push(
                    `A${n(d[0], precision)} ${n(d[1], precision)} `
                    + `${n(d[2], precision)} ${d[3]} ${d[4]} `
                    + `${pt(d[5], d[6], null, precision)}`
                );
                hasCurrent = true;
                break;

            case 'closePath':
                parts.push('Z');
                hasCurrent = false;
                break;

            case 'arc':
                parts.push(buildArc(d[0], d[1], d[2], d[3], d[4], !!d[5], hasCurrent, precision, flatten));
                hasCurrent = !isFullCircle(d[3], d[4], !!d[5]);
                break;

            case 'rect':
                parts.push(buildRect(d[0], d[1], d[2], d[3], d[4], precision));
                hasCurrent = false;
                break;

            case 'circle':
                parts.push(buildEllipseArc(d[0], d[1], d[2], d[2], d[3], precision, flatten));
                hasCurrent = false;
                break;

            case 'ellipse':
                parts.push(buildEllipseArc(d[0], d[1], d[2], d[3], d[4], precision, flatten));
                hasCurrent = false;
                break;

            case 'roundRect':
                parts.push(buildRoundRect(d[0], d[1], d[2], d[3], d[4] ?? 0, d[5], precision, flatten));
                hasCurrent = false;
                break;

            case 'poly':
                parts.push(buildPoly(d[0], d[1] ?? true, d[2], precision));
                hasCurrent = !(d[1] ?? true);
                break;

            case 'addPath':
                parts.push(buildAddPath(d[0] as GraphicsPath, d[1] as Matrix | undefined, precision, flatten));
                hasCurrent = true;
                break;
        }
    }

    return parts.join('');
}

function isFullCircle(startAngle: number, endAngle: number, ccw: boolean): boolean
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

    return Math.abs(sweep) >= PI2 - 1e-6;
}

function n(value: number, precision: number): string
{
    return parseFloat(value.toFixed(precision)).toString();
}

function pt(x: number, y: number, matrix: Matrix | null | undefined, precision: number): string
{
    if (matrix && !matrix.isIdentity())
    {
        const tx = (matrix.a * x) + (matrix.c * y) + matrix.tx;
        const ty = (matrix.b * x) + (matrix.d * y) + matrix.ty;

        return `${n(tx, precision)} ${n(ty, precision)}`;
    }

    return `${n(x, precision)} ${n(y, precision)}`;
}

function buildArc(
    cx: number, cy: number, radius: number,
    startAngle: number, endAngle: number, ccw: boolean,
    hasCurrent: boolean,
    precision: number,
    flatten = false
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

    if (Math.abs(sweep) >= PI2 - 1e-6)
    {
        return buildEllipseArc(cx, cy, radius, radius, null, precision, flatten);
    }

    if (flatten)
    {
        const segments = 32;
        const parts: string[] = [];

        for (let i = 0; i <= segments; i++)
        {
            const a = startAngle + ((i / segments) * sweep);
            const px = cx + (radius * Math.cos(a));
            const py = cy + (radius * Math.sin(a));
            // eslint-disable-next-line no-nested-ternary
            const cmd = i === 0 ? (hasCurrent ? 'L' : 'M') : 'L';

            parts.push(`${cmd}${n(px, precision)} ${n(py, precision)}`);
        }

        return parts.join('');
    }

    const sx = cx + (radius * Math.cos(startAngle));
    const sy = cy + (radius * Math.sin(startAngle));
    const ex = cx + (radius * Math.cos(endAngle));
    const ey = cy + (radius * Math.sin(endAngle));

    const largeArc = Math.abs(sweep) > Math.PI ? 1 : 0;
    const sweepFlag = ccw ? 0 : 1;
    const start = hasCurrent ? 'L' : 'M';

    return `${start}${n(sx, precision)} ${n(sy, precision)}`
        + `A${n(radius, precision)} ${n(radius, precision)} 0 ${largeArc} ${sweepFlag} `
        + `${n(ex, precision)} ${n(ey, precision)}`;
}

function buildEllipseArc(
    cx: number, cy: number, rx: number, ry: number,
    matrixArg: Matrix | null | undefined,
    precision: number,
    flatten = false
): string
{
    const matrix = matrixArg && !matrixArg.isIdentity() ? matrixArg : null;

    // SVG arc params don't compose with an arbitrary matrix, so flatten under transform.
    if (!matrix && !flatten)
    {
        return `M${n(cx - rx, precision)} ${n(cy, precision)}`
            + `A${n(rx, precision)} ${n(ry, precision)} 0 1 1 ${n(cx + rx, precision)} ${n(cy, precision)}`
            + `A${n(rx, precision)} ${n(ry, precision)} 0 1 1 ${n(cx - rx, precision)} ${n(cy, precision)}Z`;
    }

    const segments = 64;
    const parts: string[] = [];

    for (let i = 0; i < segments; i++)
    {
        const a = (i / segments) * PI2;
        const x = cx + (rx * Math.cos(a));
        const y = cy + (ry * Math.sin(a));

        parts.push(`${i === 0 ? 'M' : 'L'}${pt(x, y, matrix, precision)}`);
    }

    parts.push('Z');

    return parts.join('');
}

function buildRect(
    x: number, y: number, w: number, h: number,
    matrix: Matrix | null | undefined,
    precision: number
): string
{
    return `M${pt(x, y, matrix, precision)}`
        + `L${pt(x + w, y, matrix, precision)}`
        + `L${pt(x + w, y + h, matrix, precision)}`
        + `L${pt(x, y + h, matrix, precision)}Z`;
}

function buildRoundRect(
    x: number, y: number, w: number, h: number, r: number,
    matrixArg: Matrix | null | undefined,
    precision: number,
    flatten = false
): string
{
    const matrix = matrixArg && !matrixArg.isIdentity() ? matrixArg : null;

    if (r <= 0) return buildRect(x, y, w, h, matrix, precision);

    r = Math.min(r, Math.min(w, h) / 2);

    if (matrix || flatten)
    {
        const parts: string[] = [];
        const cornerSegments = 8;
        // [centerX, centerY, startAngle] per quarter-circle corner
        const corners: [number, number, number][] = [
            [x + w - r, y + r, -Math.PI / 2],
            [x + w - r, y + h - r, 0],
            [x + r, y + h - r, Math.PI / 2],
            [x + r, y + r, Math.PI],
        ];

        let first = true;

        for (let c = 0; c < corners.length; c++)
        {
            const [cx, cy, start] = corners[c];

            for (let i = 0; i <= cornerSegments; i++)
            {
                const a = start + ((i / cornerSegments) * (Math.PI / 2));
                const px = cx + (r * Math.cos(a));
                const py = cy + (r * Math.sin(a));

                parts.push(`${first ? 'M' : 'L'}${pt(px, py, matrix, precision)}`);
                first = false;
            }
        }

        parts.push('Z');

        return parts.join('');
    }

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

function buildPoly(
    points: number[] | { x: number, y: number }[],
    close: boolean,
    matrix: Matrix | null | undefined,
    precision: number
): string
{
    if (points.length === 0) return '';

    const parts: string[] = [];
    const isFlat = typeof points[0] === 'number';

    if (isFlat)
    {
        const pts = points as number[];

        parts.push(`M${pt(pts[0], pts[1], matrix, precision)}`);

        for (let i = 2; i < pts.length; i += 2)
        {
            parts.push(`L${pt(pts[i], pts[i + 1], matrix, precision)}`);
        }
    }
    else
    {
        const pts = points as { x: number, y: number }[];

        parts.push(`M${pt(pts[0].x, pts[0].y, matrix, precision)}`);

        for (let i = 1; i < pts.length; i++)
        {
            parts.push(`L${pt(pts[i].x, pts[i].y, matrix, precision)}`);
        }
    }

    if (close) parts.push('Z');

    return parts.join('');
}

function buildAddPath(inner: GraphicsPath, matrix: Matrix | undefined, precision: number, flatten: boolean): string
{
    if (!matrix || matrix.isIdentity()) return buildSVGPath(inner, precision, flatten);

    return buildSVGPath(inner.clone(true).transform(matrix), precision, flatten);
}

function buildFromShapePrimitives(path: GraphicsPath, precision: number, flatten: boolean): string
{
    const shapePrimitives = path.shapePath.shapePrimitives;
    const parts: string[] = [];

    for (const primitive of shapePrimitives)
    {
        const shape = primitive.shape;
        const transform = primitive.transform;

        switch (shape.type)
        {
            case 'polygon': {
                const poly = shape as Polygon;

                parts.push(buildPoly(poly.points, poly.closePath, transform, precision));
                break;
            }
            case 'circle': {
                const c = shape as Circle;

                parts.push(buildEllipseArc(c.x, c.y, c.radius, c.radius, transform, precision, flatten));
                break;
            }
            case 'ellipse': {
                const e = shape as Ellipse;

                parts.push(buildEllipseArc(e.x, e.y, e.halfWidth, e.halfHeight, transform, precision, flatten));
                break;
            }
            case 'rectangle': {
                const r = shape as Rectangle;

                parts.push(buildRect(r.x, r.y, r.width, r.height, transform, precision));
                break;
            }
            case 'roundedRectangle': {
                const rr = shape as RoundedRectangle;

                parts.push(buildRoundRect(rr.x, rr.y, rr.width, rr.height, rr.radius, transform, precision, flatten));
                break;
            }
        }
    }

    return parts.join('');
}
