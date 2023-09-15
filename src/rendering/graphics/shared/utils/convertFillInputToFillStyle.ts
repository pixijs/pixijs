import { Color } from '../../../../color/Color';
import { Matrix } from '../../../../maths/Matrix';
import { Texture } from '../../../renderers/shared/texture/Texture';
import { FillGradient } from '../fill/FillGradient';
import { FillPattern } from '../fill/FillPattern';

import type { ColorSource } from '../../../../color/Color';
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

    if (Color.isColorLike(styleToMerge as ColorSource))
    {
        const temp = Color.shared.setValue(styleToMerge as ColorSource ?? 0);
        const opts = {
            ...fillStyleToParse,
            color: temp.toNumber(),
            texture: Texture.WHITE,
        };

        opts.alpha ??= temp.alpha;

        return opts;
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

    style.color = Color.shared.setValue(style.color).toNumber();

    // its a regular fill style!
    return style;
}
