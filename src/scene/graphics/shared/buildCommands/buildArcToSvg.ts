import { buildAdaptiveBezier } from './buildAdaptiveBezier';

const TAU = Math.PI * 2;

const out = {
    centerX: 0,
    centerY: 0,
    ang1: 0,
    ang2: 0
};

const mapToEllipse = (
    { x, y }: {x: number, y: number},
    rx: number, ry: number,
    cosPhi: number, sinPhi: number,
    centerX: number, centerY: number,
    out: {x: number, y: number}
): {x: number, y: number} =>
{
    x *= rx;
    y *= ry;

    const xp = (cosPhi * x) - (sinPhi * y);
    const yp = (sinPhi * x) + (cosPhi * y);

    out.x = xp + centerX;
    out.y = yp + centerY;

    return out;
};

function approxUnitArc(ang1: number, ang2: number): {x: number, y: number}[]
{
    // If 90 degree circular arc, use a constant
    // as derived from http://spencermortensen.com/articles/bezier-circle

    const a1 = ang2 === -1.5707963267948966 ? -0.551915024494 : 4 / 3 * Math.tan(ang2 / 4);

    const a = ang2 === 1.5707963267948966 ? 0.551915024494 : a1;

    const x1 = Math.cos(ang1);
    const y1 = Math.sin(ang1);
    const x2 = Math.cos(ang1 + ang2);
    const y2 = Math.sin(ang1 + ang2);

    return [
        {
            x: x1 - (y1 * a),
            y: y1 + (x1 * a)
        },
        {
            x: x2 + (y2 * a),
            y: y2 - (x2 * a)
        },
        {
            x: x2,
            y: y2
        }
    ];
}

const vectorAngle = (ux: number, uy: number, vx: number, vy: number) =>
{
    const sign = ((ux * vy) - (uy * vx) < 0) ? -1 : 1;

    let dot = (ux * vx) + (uy * vy);

    if (dot > 1)
    {
        dot = 1;
    }

    if (dot < -1)
    {
        dot = -1;
    }

    return sign * Math.acos(dot);
};

const getArcCenter = (
    px: number,
    py: number,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    largeArcFlag: number,
    sweepFlag: number,
    sinPhi: number,
    cosPhi: number,
    pxp: number,
    pyp: number,
    out: {
        centerX: number,
        centerY: number,
        ang1: number,
        ang2: number
    }
// eslint-disable-next-line max-params
) =>
{
    const rxSq = Math.pow(rx, 2);
    const rySq = Math.pow(ry, 2);
    const pxpSq = Math.pow(pxp, 2);
    const pypSq = Math.pow(pyp, 2);

    let radicant = (rxSq * rySq) - (rxSq * pypSq) - (rySq * pxpSq);

    if (radicant < 0)
    {
        radicant = 0;
    }

    radicant /= (rxSq * pypSq) + (rySq * pxpSq);
    radicant = Math.sqrt(radicant) * (largeArcFlag === sweepFlag ? -1 : 1);

    const centerXp = radicant * rx / ry * pyp;
    const centerYp = radicant * -ry / rx * pxp;

    const centerX = (cosPhi * centerXp) - (sinPhi * centerYp) + ((px + cx) / 2);
    const centerY = (sinPhi * centerXp) + (cosPhi * centerYp) + ((py + cy) / 2);

    const vx1 = (pxp - centerXp) / rx;
    const vy1 = (pyp - centerYp) / ry;
    const vx2 = (-pxp - centerXp) / rx;
    const vy2 = (-pyp - centerYp) / ry;

    const ang1 = vectorAngle(1, 0, vx1, vy1);
    let ang2 = vectorAngle(vx1, vy1, vx2, vy2);

    if (sweepFlag === 0 && ang2 > 0)
    {
        ang2 -= TAU;
    }

    if (sweepFlag === 1 && ang2 < 0)
    {
        ang2 += TAU;
    }

    out.centerX = centerX;
    out.centerY = centerY;
    out.ang1 = ang1;
    out.ang2 = ang2;
};

export function buildArcToSvg(
    points: number[],
    px: number,
    py: number,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    xAxisRotation = 0,
    largeArcFlag = 0,
    sweepFlag = 0
): void
{
    if (rx === 0 || ry === 0)
    {
        return;
    }

    const sinPhi = Math.sin(xAxisRotation * TAU / 360);
    const cosPhi = Math.cos(xAxisRotation * TAU / 360);

    const pxp = (cosPhi * (px - cx) / 2) + (sinPhi * (py - cy) / 2);
    const pyp = (-sinPhi * (px - cx) / 2) + (cosPhi * (py - cy) / 2);

    if (pxp === 0 && pyp === 0)
    {
        return;
    }

    rx = Math.abs(rx);
    ry = Math.abs(ry);

    const lambda = (Math.pow(pxp, 2) / Math.pow(rx, 2)) + (Math.pow(pyp, 2) / Math.pow(ry, 2));

    if (lambda > 1)
    {
        rx *= Math.sqrt(lambda);
        ry *= Math.sqrt(lambda);
    }

    getArcCenter(
        px,
        py,
        cx,
        cy,
        rx,
        ry,
        largeArcFlag,
        sweepFlag,
        sinPhi,
        cosPhi,
        pxp,
        pyp,
        out
    );

    let { ang1, ang2 } = out;
    const { centerX, centerY } = out;

    // If 'ang2' == 90.0000000001, then `ratio` will devalue to
    // 1.0000000001. This causes `segments` to be greater than one, which is an
    // unnecessary split, and adds extra points to the bezier curve. To alleviate
    // this issue, we round to 1.0 when the ratio is close to 1.0.
    let ratio = Math.abs(ang2) / (TAU / 4);

    if (Math.abs(1.0 - ratio) < 0.0000001)
    {
        ratio = 1.0;
    }

    const segments = Math.max(Math.ceil(ratio), 1);

    ang2 /= segments;

    let lastX = points[points.length - 2];
    let lastY = points[points.length - 1];

    const outCurvePoint = { x: 0, y: 0 };

    for (let i = 0; i < segments; i++)
    {
        const curve = approxUnitArc(ang1, ang2);

        const { x: x1, y: y1 } = mapToEllipse(curve[0], rx, ry, cosPhi, sinPhi, centerX, centerY, outCurvePoint);
        const { x: x2, y: y2 } = mapToEllipse(curve[1], rx, ry, cosPhi, sinPhi, centerX, centerY, outCurvePoint);
        const { x, y } = mapToEllipse(curve[2], rx, ry, cosPhi, sinPhi, centerX, centerY, outCurvePoint);

        buildAdaptiveBezier(
            points,
            lastX, lastY,
            x1, y1, x2, y2, x, y
        );

        lastX = x;
        lastY = y;

        ang1 += ang2;
    }
}
