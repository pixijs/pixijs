import { Color } from '../../../color/Color';
import { type TextDropShadow, TextStyle } from '../../text/TextStyle';
import { type HTMLTextStyle, type HTMLTextStyleOptions } from '../HTMLTextStyle';

import type { ConvertedStrokeStyle } from '../../graphics/shared/FillTypes';

/**
 * Internally converts all of the style properties into CSS equivalents.
 * @param style
 * @returns The CSS style string, for setting `style` property of root HTMLElement.
 * @internal
 */
export function textStyleToCSS(style: HTMLTextStyle): string
{
    const stroke = style._stroke;
    const fill = style._fill;

    const color = Color.shared.setValue(fill.color).setAlpha(fill.alpha ?? 1).toHexa();
    const cssStyleString = [
        `color: ${color}`,
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
            `word-break: ${style.breakWords ? 'break-all' : 'normal'}`,
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
    const dropshadowStyle = { ...dropShadowStyle };
    const color = Color.shared.setValue(dropshadowStyle.color).setAlpha(dropshadowStyle.alpha ?? 1).toHexa();
    const x = Math.round(Math.cos(dropshadowStyle.angle) * dropshadowStyle.distance);
    const y = Math.round(Math.sin(dropshadowStyle.angle) * dropshadowStyle.distance);

    const position = `${x}px ${y}px`;

    if (dropshadowStyle.blur > 0)
    {
        return `text-shadow: ${position} ${dropshadowStyle.blur}px ${color}`;
    }

    return `text-shadow: ${position} ${color}`;
}

function strokeToCSS(stroke: ConvertedStrokeStyle): string
{
    const color = Color.shared.setValue(stroke.color).setAlpha(stroke.alpha ?? 1).toHexa();

    return [
        `-webkit-text-stroke-width: ${stroke.width}px`,
        `-webkit-text-stroke-color: ${color}`,
        `text-stroke-width: ${stroke.width}px`,
        `text-stroke-color: ${color}`,
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
    fill: (value: string) => `color: ${Color.shared.setValue(value).toHexa()}`,
    breakWords: (value: string) => `word-break: ${value ? 'break-all' : 'normal'}`,
    stroke: strokeToCSS,
    dropShadow: (value: boolean | Partial<TextDropShadow>) =>
    {
        if (value === true)
        {
            return dropShadowToCSS(TextStyle.defaultDropShadow);
        }

        if (value && typeof value === 'object')
        {
            return dropShadowToCSS({ ...TextStyle.defaultDropShadow, ...value });
        }

        return '';
    }
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
