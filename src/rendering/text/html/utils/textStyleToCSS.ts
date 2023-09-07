import { hex2string, rgb2hex } from '../../../../utils/color/hex';

import type { FillStyle, StrokeStyle } from '../../../graphics/shared/GraphicsContext';
import type { HTMLTextStyle } from '../../HtmlTextStyle';
import type { TextStyle } from '../../TextStyle';

/**
 * Internally converts all of the style properties into CSS equivalents.
 * @param style
 * @returns The CSS style string, for setting `style` property of root HTMLElement.
 */
export function textStyleToCSS(style: HTMLTextStyle): string
{
    const stroke: StrokeStyle = style._stroke as StrokeStyle;
    const fill: FillStyle = style._fill as FillStyle;

    return [
        `transform-origin: top left`,
        'display: inline-block',
        `color: ${normalizeColor(fill.color)}`,
        `font-size: ${(style.fontSize as number)}px`,
        `font-family: ${style.fontFamily}`,
        `font-weight: ${style.fontWeight}`,
        `font-style: ${style.fontStyle}`,
        `font-variant: ${style.fontVariant}`,
        `letter-spacing: ${style.letterSpacing}px`,
        `text-align: ${style.align}`,
        `padding: ${style.padding}px`,
        `white-space: ${style.whiteSpace}`,
        ...style.lineHeight ? [`line-height: ${style.lineHeight}px`] : [],
        ...style.wordWrap ? [
            `word-wrap: ${style.breakWords ? 'break-all' : 'break-word'}`,
            `max-width: ${style.wordWrapWidth}px`
        ] : [],
        ...stroke ? [
            `-webkit-text-stroke-width: ${stroke.width}px`,
            `-webkit-text-stroke-color: ${normalizeColor(stroke.fill)}`,
            `text-stroke-width: ${stroke.width}px`,
            `text-stroke-color: ${normalizeColor(stroke.color)}`,
            'paint-order: stroke',
        ] : [],
        ...style.dropShadow ? [dropShadowToCSS(style.dropShadow)] : [],
        ...style.cssOverrides,
    ].join(';');
}

function dropShadowToCSS(dropShadowStyle: TextStyle['dropShadow']): string
{
    let color = normalizeColor(dropShadowStyle.color);
    const alpha = dropShadowStyle.alpha;
    const x = Math.round(Math.cos(dropShadowStyle.angle) * dropShadowStyle.distance);
    const y = Math.round(Math.sin(dropShadowStyle.angle) * dropShadowStyle.distance);

    // Append alpha to color
    if (color.startsWith('#') && alpha < 1)
    {
        color += (alpha * 255 | 0).toString(16).padStart(2, '0');
    }

    const position = `${x}px ${y}px`;

    if (dropShadowStyle.blur > 0)
    {
        return `text-shadow: ${position} ${dropShadowStyle.blur}px ${color}`;
    }

    return `text-shadow: ${position} ${color}`;
}

function normalizeColor(color: any): string
{
    if (Array.isArray(color))
    {
        color = rgb2hex(color);
    }

    if (typeof color === 'number')
    {
        return hex2string(color);
    }

    return color;
}
