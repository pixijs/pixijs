import { GraphicsPath } from '../path/GraphicsPath';
import { parseSVGDefinitions } from './parseSVGDefinitions';
import { parseSVGFloatAttribute } from './parseSVGFloatAttribute';
import { parseSVGStyle } from './parseSVGStyle';

import type { FillGradient } from '../fill/FillGradient';
import type { FillStyle, StrokeStyle } from '../FillTypes';
import type {
    GraphicsContext,
} from '../GraphicsContext';

export const styleAttributes = {
    fill: { type: 'paint', default: 0 },
    'fill-opacity': { type: 'number', default: 1 },

    stroke: { type: 'paint', default: 0 },
    'stroke-width': { type: 'number', default: 1 },
    'stroke-opacity': { type: 'number', default: 1 },
    'stroke-linecap': { type: 'string', default: 'butt' },
    'stroke-linejoin': { type: 'string', default: 'miter' },
    'stroke-miterlimit': { type: 'number', default: 10 },
    'stroke-dasharray': { type: 'string', default: 'none' },
    'stroke-dashoffset': { type: 'number', default: 0 },

    opacity: { type: 'number', default: 1 },
};

export interface Session
{
    context: GraphicsContext;
    path: GraphicsPath;
    // TODO add more here as we expand!
    defs: Record<string, FillGradient>;
}

export function SVGParser(
    svg: string | SVGElement | SVGSVGElement,
    graphicsContext?: GraphicsContext
): GraphicsContext
{
    if (typeof svg === 'string')
    {
        const div = document.createElement('div');

        div.innerHTML = svg.trim();
        svg = div.querySelector('svg') as SVGElement;
    }

    const session = {
        context: graphicsContext,
        defs: {},
        path: new GraphicsPath(),
    };

    parseSVGDefinitions(svg, session);

    const children = svg.children;

    for (let i = 0; i < children.length; i++)
    {
        const child = children[i] as SVGElement;

        if (child.nodeName.toLowerCase() === 'defs') continue;

        renderChildren(child, session, null, null);
    }

    return graphicsContext;
}

function renderChildren(svg: SVGElement, session: Session, fillStyle: FillStyle, strokeStyle: StrokeStyle): void
{
    const children = svg.children;

    const { fillStyle: f1, strokeStyle: s1 } = parseSVGStyle(svg, session);

    if (f1 && fillStyle)
    {
        fillStyle = { ...fillStyle, ...f1 };
    }
    else if (f1)
    {
        fillStyle = f1;
    }

    if (s1 && strokeStyle)
    {
        strokeStyle = { ...strokeStyle, ...s1 };
    }
    else if (s1)
    {
        strokeStyle = s1;
    }

    // default is black fill, no stroke
    if (!fillStyle && !strokeStyle)
    {
        fillStyle = { color: 0 };
    }

    let x;
    let y;
    let x1;
    let y1;
    let x2;
    let y2;
    let cx;
    let cy;
    let r;
    let rx;
    let ry;
    let points;
    let pointsString;
    let d;
    let graphicsPath;
    let width;
    let height;

    switch (svg.nodeName.toLowerCase())
    {
        case 'path':
            d = svg.getAttribute('d') as string;

            graphicsPath = new GraphicsPath(d);

            session.context.path(graphicsPath);

            if (fillStyle) session.context.fill(fillStyle);
            if (strokeStyle) session.context.stroke(strokeStyle);

            break;
        case 'circle':
            cx = parseSVGFloatAttribute(svg, 'cx', 0);
            cy = parseSVGFloatAttribute(svg, 'cy', 0);

            r = parseSVGFloatAttribute(svg, 'r', 0);

            session.context.ellipse(cx, cy, r, r);

            if (fillStyle) session.context.fill(fillStyle);
            if (strokeStyle) session.context.stroke(strokeStyle);

            break;
        case 'rect':
            x = parseSVGFloatAttribute(svg, 'x', 0);
            y = parseSVGFloatAttribute(svg, 'y', 0);

            width = parseSVGFloatAttribute(svg, 'width', 0);
            height = parseSVGFloatAttribute(svg, 'height', 0);

            rx = parseSVGFloatAttribute(svg, 'rx', 0);
            ry = parseSVGFloatAttribute(svg, 'ry', 0);

            if (rx || ry)
            {
                session.context.roundRect(x, y, width, height, rx || ry);
            }
            else
            {
                session.context.rect(x, y, width, height);
            }

            if (fillStyle) session.context.fill(fillStyle);
            if (strokeStyle) session.context.stroke(strokeStyle);

            break;
        case 'ellipse':
            cx = parseSVGFloatAttribute(svg, 'cx', 0);
            cy = parseSVGFloatAttribute(svg, 'cy', 0);

            rx = parseSVGFloatAttribute(svg, 'rx', 0);
            ry = parseSVGFloatAttribute(svg, 'ry', 0);

            session.context.beginPath();
            session.context.ellipse(cx, cy, rx, ry); // , 0, Math.PI * 2);

            if (fillStyle) session.context.fill(fillStyle);
            if (strokeStyle) session.context.stroke(strokeStyle);

            break;
        case 'line':
            x1 = parseSVGFloatAttribute(svg, 'x1', 0);
            y1 = parseSVGFloatAttribute(svg, 'y1', 0);

            x2 = parseSVGFloatAttribute(svg, 'x2', 0);
            y2 = parseSVGFloatAttribute(svg, 'y2', 0);

            session.context.beginPath();
            session.context.moveTo(x1, y1);
            session.context.lineTo(x2, y2);

            if (strokeStyle) session.context.stroke(strokeStyle);

            break;

        case 'polygon':
            pointsString = svg.getAttribute('points') as string;

            points = pointsString.match(/\d+/g).map((n) => parseInt(n, 10));

            session.context.poly(points, true);

            if (fillStyle) session.context.fill(fillStyle);
            if (strokeStyle) session.context.stroke(strokeStyle);

            break;
        case 'polyline':
            pointsString = svg.getAttribute('points') as string;

            points = pointsString.match(/\d+/g).map((n) => parseInt(n, 10));

            session.context.poly(points, false);

            if (strokeStyle) session.context.stroke(strokeStyle);

            break;
        // children will cover these two..
        case 'g':
        case 'svg':
            break;
        default: {
            // eslint-disable-next-line no-console
            console.info(`[SVG parser] <${svg.nodeName}> elements unsupported`);
            break;
        }
    }

    for (let i = 0; i < children.length; i++)
    {
        renderChildren(children[i] as SVGElement, session, fillStyle, strokeStyle);
    }
}

