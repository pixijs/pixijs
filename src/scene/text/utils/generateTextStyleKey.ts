import { Color } from '../../../color/Color';

import type { ConvertedFillStyle, ConvertedStrokeStyle } from '../../graphics/shared/FillTypes';
import type { HTMLTextStyle } from '../../text-html/HtmlTextStyle';
import type { TextStyle } from '../TextStyle';

const valuesToIterateForKeys: Partial<keyof TextStyle | keyof HTMLTextStyle>[] = [
    'align',
    'breakWords',
    'cssOverrides',
    'fontVariant',
    'fontWeight',
    'leading',
    'letterSpacing',
    'lineHeight',
    'padding',
    'textBaseline',
    'trim',
    'whiteSpace',
    'wordWrap',
    'wordWrapWidth',
    'fontFamily',
    'fontStyle',
    'fontSize',
] as const;

/**
 * Generates a unique key for the text style.
 * @param style - The style to generate a key for.
 * @returns the key for the style.
 */
export function generateTextStyleKey(style: TextStyle): string
{
    const key = [];

    let index = 0;

    for (let i = 0; i < valuesToIterateForKeys.length; i++)
    {
        const prop = `_${valuesToIterateForKeys[i]}`;

        key[index++] = style[prop as keyof typeof style];
    }

    index = addFillStyleKey(style._fill, key as string[], index);
    index = addStokeStyleKey(style._stroke, key as string[], index);
    index = addDropShadowKey(style.dropShadow, key as string[], index);

    return key.join('-');
}

function addFillStyleKey(fillStyle: ConvertedFillStyle, key: (number | string)[], index: number)
{
    if (!fillStyle) return index;

    key[index++] = fillStyle.color;
    key[index++] = fillStyle.alpha;
    key[index++] = fillStyle.fill?.styleKey;

    return index;
}

function addStokeStyleKey(strokeStyle: ConvertedStrokeStyle, key: (number | string)[], index: number)
{
    if (!strokeStyle) return index;

    index = addFillStyleKey(strokeStyle, key, index);

    key[index++] = strokeStyle.width;
    key[index++] = strokeStyle.alignment;
    key[index++] = strokeStyle.cap;
    key[index++] = strokeStyle.join;
    key[index++] = strokeStyle.miterLimit;

    return index;
}

function addDropShadowKey(dropShadow: TextStyle['dropShadow'], key: (number | string)[], index: number)
{
    if (!dropShadow) return index;

    key[index++] = dropShadow.alpha;
    key[index++] = dropShadow.angle;
    key[index++] = dropShadow.blur;
    key[index++] = dropShadow.distance;
    key[index++] = Color.shared.setValue(dropShadow.color).toNumber();

    return index;
}
