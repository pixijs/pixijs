import type { FillGradient } from '../../graphics/shared/fill/FillGradient';
import type { ConvertedFillStyle, ConvertedStrokeStyle } from '../../graphics/shared/GraphicsContext';
import type { TextStyle } from '../TextStyle';

const valuesToIterateForKeys = [
    '_fontFamily',
    '_fontStyle',
    '_fontSize',
    '_fontVariant',
    '_fontWeight',
    '_breakWords',
    '_align',
    '_leading',
    '_letterSpacing',
    '_lineHeight',
    '_textBaseline',
    '_whiteSpace',
    '_wordWrap',
    '_wordWrapWidth',
    '_padding',
    '_cssOverrides',
    '_trim'
];

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
        const prop = valuesToIterateForKeys[i];

        key[index++] = style[prop as keyof typeof style];
    }

    index = addFillStyleKey(style._fill, key as string[], index);
    index = addStokeStyleKey(style._stroke, key as string[], index);

    // TODO - we need to add some shadow stuff here!

    return key.join('-');
}

function addFillStyleKey(fillStyle: ConvertedFillStyle, key: (number | string)[], index: number)
{
    if (!fillStyle) return index;

    key[index++] = fillStyle.color;
    key[index++] = fillStyle.alpha;
    key[index++] = (fillStyle.fill as FillGradient)?.uid;

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
