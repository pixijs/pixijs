import { Color } from '../../../../color/Color';

import type { HTMLTextStyle } from '../../HtmlTextStyle';
import type { TextStyle } from '../../TextStyle';

/**
 * Internally converts all of the style properties into CSS equivalents.
 * @param style
 * @returns The CSS style string, for setting `style` property of root HTMLElement.
 */
export function textStyleToCSS(style: HTMLTextStyle): string
{
    const stroke = style._stroke;
    const fill = style._fill;

    return [
        `transform-origin: top left`,
        'display: inline-block',
        `color: ${Color.shared.setValue(fill.color).toHex()}`,
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
            `-webkit-text-stroke-color: ${Color.shared.setValue(stroke.color).toHex()}`,
            `text-stroke-width: ${stroke.width}px`,
            `text-stroke-color: ${Color.shared.setValue(stroke.color).toHex()}`,
            'paint-order: stroke',
        ] : [],
        ...style.dropShadow ? [dropShadowToCSS(style.dropShadow)] : [],
        ...style.cssOverrides,
    ].join(';');
}

function dropShadowToCSS(dropShadowStyle: TextStyle['dropShadow']): string
{
    const color = Color.shared.setValue(dropShadowStyle.color).setAlpha(dropShadowStyle.alpha).toHexa();
    const x = Math.round(Math.cos(dropShadowStyle.angle) * dropShadowStyle.distance);
    const y = Math.round(Math.sin(dropShadowStyle.angle) * dropShadowStyle.distance);

    const position = `${x}px ${y}px`;

    if (dropShadowStyle.blur > 0)
    {
        return `text-shadow: ${position} ${dropShadowStyle.blur}px ${color}`;
    }

    return `text-shadow: ${position} ${color}`;
}
