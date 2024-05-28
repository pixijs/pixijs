import { Color } from '../../../color/Color';

import type { ConvertedStrokeStyle } from '../../graphics/shared/FillTypes';
import type { TextStyle } from '../../text/TextStyle';
import type { HTMLTextStyle, HTMLTextStyleOptions } from '../HtmlTextStyle';

/**
 * Internally converts all of the style properties into CSS equivalents.
 * @param style
 * @returns The CSS style string, for setting `style` property of root HTMLElement.
 */
export function textStyleToCSS(style: HTMLTextStyle): string
{
    const stroke = style._stroke;
    const fill = style._fill;

    const cssStyleString = [
        `color: ${Color.shared.setValue(fill.color).toHex()}`,
        `font-size: ${(style.fontSize as number)}px`,
        `font-family: ${style.fontFamily}`,
        `font-weight: ${style.fontWeight}`,
        `font-style: ${style.fontStyle}`,
        `font-variant: ${style.fontVariant}`,
        `letter-spacing: ${style.letterSpacing}px`,
        `text-align: ${style.align}`,
        `padding: ${style.padding}px`,
        `white-space: ${(style.whiteSpace === 'pre' && style.wordWrap) ? 'pre-wrap' : style.whiteSpace}`,
        ...style.lineHeight ? [`line-height: ${style.lineHeight}px`] : [],
        ...style.wordWrap ? [
            `word-wrap: ${style.breakWords ? 'break-all' : 'break-word'}`,
            `max-width: ${style.wordWrapWidth}px`
        ] : [],
        ...stroke ? [strokeToCSS(stroke)] : [],
        ...style.dropShadow ? [dropShadowToCSS(style.dropShadow)] : [],
        ...style.cssOverrides,
    ].join(';');

    const cssStyles = [`div { ${cssStyleString} }`];

    tagStyleToCSS(style.tagStyles, cssStyles);

    return cssStyles.join(' ');
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

function strokeToCSS(stroke: ConvertedStrokeStyle): string
{
    return [
        `-webkit-text-stroke-width: ${stroke.width}px`,
        `-webkit-text-stroke-color: ${Color.shared.setValue(stroke.color).toHex()}`,
        `text-stroke-width: ${stroke.width}px`,
        `text-stroke-color: ${Color.shared.setValue(stroke.color).toHex()}`,
        'paint-order: stroke',
    ].join(';');
}

/** Converts the tag styles into CSS. */
const templates = {
    fontSize: `font-size: {{VALUE}}px`,
    fontFamily: `font-family: {{VALUE}}`,
    fontWeight: `font-weight: {{VALUE}}`,
    fontStyle: `font-style: {{VALUE}}`,
    fontVariant: `font-variant: {{VALUE}}`,
    letterSpacing: `letter-spacing: {{VALUE}}px`,
    align: `text-align: {{VALUE}}`,
    padding: `padding: {{VALUE}}px`,
    whiteSpace: `white-space: {{VALUE}}`,
    lineHeight: `line-height: {{VALUE}}px`,
    wordWrapWidth: `max-width: {{VALUE}}px`,
};

/** Converts the tag styles into CSS if modifications are required */
const transform = {
    fill: (value: string) => `color: ${Color.shared.setValue(value).toHex()}`,
    breakWords: (value: string) => `word-wrap: ${value ? 'break-all' : 'break-word'}`,
    stroke: strokeToCSS,
    dropShadow: dropShadowToCSS
};

function tagStyleToCSS(tagStyles: Record<string, HTMLTextStyleOptions>, out: string[])
{
    for (const i in tagStyles)
    {
        const tagStyle = tagStyles[i];
        const cssTagStyle = [];

        for (const j in tagStyle)
        {
            if (transform[j as keyof typeof transform])
            {
                // eslint-disable-next-line max-len
                cssTagStyle.push(transform[j as keyof typeof transform](tagStyle[j as keyof HTMLTextStyleOptions] as any));
            }
            else if (templates[j as keyof typeof templates])
            {
                // eslint-disable-next-line max-len
                cssTagStyle.push(templates[j as keyof typeof templates].replace('{{VALUE}}', tagStyle[j as keyof HTMLTextStyleOptions] as any));
            }
        }

        out.push(`${i} { ${cssTagStyle.join(';')} }`);
    }
}
