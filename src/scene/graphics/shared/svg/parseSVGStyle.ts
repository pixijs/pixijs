import { Color } from '../../../../color';
import { styleAttributes } from './SVGParser';
import { extractSvgUrlId } from './utils/extractSvgUrlId';

import type { ConvertedFillStyle, ConvertedStrokeStyle, FillStyle, StrokeStyle } from '../FillTypes';
import type { Session } from './SVGParser';

export type StyleResult = {
    strokeStyle: StrokeStyle;
    fillStyle: FillStyle;
    useFill: boolean;
    useStroke: boolean;
};

export function parseSVGStyle(svg: SVGElement, session: Session): StyleResult
{
    const style = svg.getAttribute('style');

    const strokeStyle: StrokeStyle = {};

    const fillStyle: FillStyle = {};

    const result: StyleResult = {
        strokeStyle,
        fillStyle,
        useFill: false,
        useStroke: false,
    };

    for (const key in styleAttributes)
    {
        const attribute = svg.getAttribute(key);

        if (attribute)
        {
            parseAttribute(session, result, key, attribute.trim());
        }
    }

    // override with style!
    if (style)
    {
        const styleParts = style.split(';');

        for (let i = 0; i < styleParts.length; i++)
        {
            // TODO is trim lame? use regex?
            const stylePart = styleParts[i].trim();

            const [key, value] = stylePart.split(':');

            if (styleAttributes[key as keyof typeof styleAttributes])
            {
                parseAttribute(session, result, key, value.trim());
            }
        }
    }

    return {
        strokeStyle: result.useStroke ? (strokeStyle as ConvertedStrokeStyle) : null,
        fillStyle: result.useFill ? (fillStyle as ConvertedFillStyle) : null,
        useFill: result.useFill,
        useStroke: result.useStroke,
    };
}

export function parseAttribute(
    session: Session,
    result: StyleResult,
    id: string,
    value: string
): void
{
    switch (id)
    {
        case 'stroke':
            if (value !== 'none')
            {
                if (value.startsWith('url('))
                {
                    // get id from in url..
                    const id = extractSvgUrlId(value);

                    result.strokeStyle.fill = session.defs[id];
                }
                else
                {
                    result.strokeStyle.color = Color.shared.setValue(value).toNumber();
                }

                result.useStroke = true;
            }

            break;
        case 'stroke-width':
            result.strokeStyle.width = Number(value);
            break;
        case 'fill':
            if (value !== 'none')
            {
                if (value.startsWith('url('))
                {
                    const id = extractSvgUrlId(value);

                    result.fillStyle.fill = session.defs[id];
                }
                else
                {
                    result.fillStyle.color = Color.shared.setValue(value).toNumber();
                }

                result.useFill = true;
            }
            break;
        case 'fill-opacity':
            result.fillStyle.alpha = Number(value);
            break;
        case 'stroke-opacity':
            result.strokeStyle.alpha = Number(value);
            break;
        case 'opacity':
            result.fillStyle.alpha = Number(value);
            result.strokeStyle.alpha = Number(value);
            break;
    }
}
