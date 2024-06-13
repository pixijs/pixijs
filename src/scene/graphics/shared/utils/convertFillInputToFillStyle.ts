import { Color } from '../../../../color/Color';
import { Matrix } from '../../../../maths/matrix/Matrix';
import { Texture } from '../../../../rendering/renderers/shared/texture/Texture';
import { FillGradient } from '../fill/FillGradient';
import { FillPattern } from '../fill/FillPattern';

import type { ColorSource } from '../../../../color/Color';
import type {
    ConvertedFillStyle,
    ConvertedStrokeStyle,
    FillInput,
    FillStyle,
    StrokeInput,
} from '../FillTypes';

function isColorLike(value: unknown): value is ColorSource
{
    return Color.isColorLike(value as ColorSource);
}

function isFillPattern(value: unknown): value is FillPattern
{
    return value instanceof FillPattern;
}

function isFillGradient(value: unknown): value is FillGradient
{
    return value instanceof FillGradient;
}

/**
 * Handles the case where the value is a ColorLike
 * @param fill
 * @param value
 * @param defaultStyle
 * @example
 * graphics.fill(0xff0000)
 * graphics.fill(new Color(0xff0000))
 * graphics.fill({ r: 255, g: 0, b: 0 })
 */
function handleColorLike(
    fill: FillStyle,
    value: ColorSource,
    defaultStyle: ConvertedFillStyle
): ConvertedFillStyle
{
    const temp = Color.shared.setValue(value ?? 0);

    fill.color = temp.toNumber();
    fill.alpha = temp.alpha === 1 ? defaultStyle.alpha : temp.alpha;
    fill.texture = Texture.WHITE;

    return { ...defaultStyle, ...fill } as ConvertedFillStyle;
}

/**
 * Handles the case where the value is a FillPattern
 * @param fill
 * @param value
 * @param defaultStyle
 * @example
 * graphics.fill(new FillPattern(0xff0000))
 */
function handleFillPattern(
    fill: FillStyle,
    value: FillPattern,
    defaultStyle: ConvertedFillStyle
): ConvertedFillStyle
{
    fill.fill = value;
    fill.color = 0xffffff;
    fill.texture = value.texture;
    fill.matrix = value.transform;

    return { ...defaultStyle, ...fill } as ConvertedFillStyle;
}

/**
 * Handles the case where the value is a FillGradient
 * @param fill
 * @param value
 * @param defaultStyle
 * @example
 * graphics.fill(new FillGradient(0, 0, 200, 0))
 */
function handleFillGradient(
    fill: FillStyle,
    value: FillGradient,
    defaultStyle: ConvertedFillStyle
): ConvertedFillStyle
{
    value.buildLinearGradient();
    fill.fill = value;
    fill.color = 0xffffff;
    fill.texture = value.texture;
    fill.matrix = value.transform;

    return { ...defaultStyle, ...fill } as ConvertedFillStyle;
}

/**
 * Handles the case where the value is not a direct Pixi Color, PatternFill, or GradientFill but instead
 * an object with potentially `color`
 * @example
 * {
 *   color: new Color(0xff0000)
 *   alpha: 0.5,
 *   texture?: null,
 *   matrix?: null,
 * }
 * @param value
 * @param defaultStyle
 */
function handleFillObject(value: FillStyle, defaultStyle: ConvertedFillStyle): ConvertedFillStyle
{
    const style = { ...defaultStyle, ...(value as FillStyle) };

    if (style.texture)
    {
        if (style.texture !== Texture.WHITE)
        {
            const m = style.matrix?.invert() || new Matrix();

            m.scale(1 / style.texture.frame.width, 1 / style.texture.frame.height);

            style.matrix = m;
        }

        const sourceStyle = style.texture.source.style;

        if (sourceStyle.addressMode === 'clamp-to-edge')
        {
            sourceStyle.addressMode = 'repeat';
        }
    }

    const color = Color.shared.setValue(style.color);

    style.alpha *= color.alpha;
    style.color = color.toNumber();
    style.matrix = style.matrix ? style.matrix.clone() : null; // todo: lets optimise this!

    return style as ConvertedFillStyle;
}

/**
 * Converts a value to a fill style, we do this as PixiJS has a number of ways to define a fill style
 * They can be a direct color, a texture, a gradient, or an object with these values in them
 * This function will take any of these input types and convert them into a single object
 * that PixiJS can understand and use internally.
 * @param value - The value to convert to a fill style
 * @param defaultStyle - The default fill style to use
 * @private
 */
export function toFillStyle<T extends FillInput>(
    value: T,
    defaultStyle: ConvertedFillStyle
): ConvertedFillStyle
{
    if (value === undefined || value === null)
    {
        return null;
    }

    const fill: ConvertedFillStyle = {} as ConvertedFillStyle;
    const objectStyle = value as FillStyle;

    if (isColorLike(value))
    {
        return handleColorLike(fill, value, defaultStyle);
    }
    else if (isFillPattern(value))
    {
        return handleFillPattern(fill, value, defaultStyle);
    }
    else if (isFillGradient(value))
    {
        return handleFillGradient(fill, value, defaultStyle);
    }
    else if (objectStyle.fill && isFillPattern(objectStyle.fill))
    {
        return handleFillPattern(objectStyle, objectStyle.fill, defaultStyle);
    }
    else if (objectStyle.fill && isFillGradient(objectStyle.fill))
    {
        return handleFillGradient(objectStyle, objectStyle.fill, defaultStyle);
    }

    return handleFillObject(objectStyle, defaultStyle);
}

/**
 * Converts a value to a stroke style, similar to `toFillStyle` but for strokes
 * @param value - The value to convert to a stroke style
 * @param defaultStyle - The default stroke style to use
 * @private
 */
export function toStrokeStyle(value: StrokeInput, defaultStyle: ConvertedStrokeStyle): ConvertedStrokeStyle
{
    const { width, alignment, miterLimit, cap, join, ...rest } = defaultStyle;
    const fill = toFillStyle(value, rest);

    if (!fill)
    {
        return null;
    }

    return {
        width,
        alignment,
        miterLimit,
        cap,
        join,
        ...fill,
    };
}
