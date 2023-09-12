import { Matrix } from '../../../../maths/Matrix';
import { convertColorToNumber } from '../../../../utils/color/convertColorToNumber';
import { Texture } from '../../../renderers/shared/texture/Texture';
import { FillGradient } from '../fill/FillGradient';
import { FillPattern } from '../fill/FillPattern';

import type {
    FillStyle,
    FillStyleInputs,
    PatternFillStyle,
} from '../GraphicsContext';

export function convertFillInputToFillStyle(
    value: FillStyleInputs,
    defaultStyle: FillStyle
): FillStyle
{
    if (!value)
    {
        return null;
    }

    let fillStyleToParse: FillStyle;
    let styleToMerge: FillStyleInputs;

    if ((value as PatternFillStyle)?.fill)
    {
        styleToMerge = (value as PatternFillStyle).fill;
        fillStyleToParse = { ...defaultStyle, ...(value as PatternFillStyle) };
    }
    else
    {
        styleToMerge = value;
        fillStyleToParse = defaultStyle;
    }

    if (typeof styleToMerge === 'number' || typeof styleToMerge === 'string')
    {
        return {
            ...fillStyleToParse,
            color: convertColorToNumber(styleToMerge),
            texture: Texture.WHITE,
        };
    }
    else if (styleToMerge instanceof FillPattern)
    {
        const pattern = styleToMerge as FillPattern;

        return {
            ...fillStyleToParse,
            color: 0xffffff,
            texture: pattern.texture,
            matrix: pattern.transform,
        };
    }

    // // TODO Texture
    else if (styleToMerge instanceof FillGradient)
    {
        const gradient = styleToMerge as FillGradient;

        gradient.buildLinearGradient();

        return {
            ...fillStyleToParse,
            color: 0xffffff,
            texture: gradient.texture,
            matrix: gradient.transform,
        };
    }

    const style = { ...defaultStyle, ...(value as FillStyle) };

    if (style.texture !== Texture.WHITE)
    {
        const m = style.matrix || new Matrix();

        m.scale(1 / style.texture.frameWidth, 1 / style.texture.frameHeight);

        style.matrix = m;

        style.color = 0xffffff;
    }

    style.color = convertColorToNumber(style.color);

    // its a regular fill style!
    return style;
}
