import { Color } from '../../../../color/Color';
import { FillGradient } from '../../../../scene/graphics/shared/fill/FillGradient';
import { FillPattern } from '../../../../scene/graphics/shared/fill/FillPattern';
import {
    PIXI_TEXT_STYLE_DEFAULTS,
    TEXT_STYLE_DEFAULTS,
    TEXT_STYLE_SHADOW_DEFAULTS,
    TEXT_STYLE_STROKE_DEFAULTS,
} from '../../../defaults';
import { type Gl2dRef, type Gl2dSerializerInput } from '../../../types/Gl2dTypes';
import { gl2dUtils } from '../../../utils';
import { serializeFillGradient } from '../fills/serializeFillGradient';
import { serializeFillPattern } from '../fills/serializeFillPattern';

import type { ColorSource } from '../../../../color/Color';
import type { ConvertedFillStyle, ConvertedStrokeStyle } from '../../../../scene/graphics/shared/FillTypes';
import type { TextStyle, TextStyleOptions } from '../../../../scene/text/TextStyle';
import type { Gl2dSerializeContext } from '../../../serializeContext';
import type { Gl2dTextStyleStroke } from '../../../types/Gl2DResources';
import type {
    Gl2dPixiTextStyleResource,
    Gl2dPixiTextStyleResourceExtension,
} from '../../../types/pixi/PixiGl2dResources';

function serializeFillValue(
    fill: FillGradient | FillPattern | ColorSource,
    ctx: Gl2dSerializeContext,
): string | Gl2dRef
{
    if (fill instanceof FillGradient) return serializeFillGradient(fill, ctx);
    if (fill instanceof FillPattern) return serializeFillPattern(fill, ctx);

    return Color.shared.setValue(fill).toHex();
}

function serializeConvertedFill(
    fill: ConvertedFillStyle,
    ctx: Gl2dSerializeContext,
): string | Gl2dRef | undefined
{
    if (!fill) return undefined;

    if (fill.fill instanceof FillGradient || fill.fill instanceof FillPattern)
    {
        return serializeFillValue(fill.fill, ctx);
    }

    return Color.shared.setValue(fill.color).toHex();
}

function serializeStroke(
    stroke: ConvertedStrokeStyle,
    ctx: Gl2dSerializeContext,
): Gl2dTextStyleStroke | undefined
{
    if (!stroke) return undefined;

    const fill = serializeConvertedFill(stroke, ctx);

    if (!fill) return undefined;

    return gl2dUtils.compact<Gl2dTextStyleStroke>({
        fill,
        width: gl2dUtils.checkValue(stroke.width, TEXT_STYLE_STROKE_DEFAULTS.width),
        alignment: gl2dUtils.checkValue(stroke.alignment, TEXT_STYLE_STROKE_DEFAULTS.alignment),
        cap: gl2dUtils.checkValue(stroke.cap, TEXT_STYLE_STROKE_DEFAULTS.cap),
        join: gl2dUtils.checkValue(stroke.join, TEXT_STYLE_STROKE_DEFAULTS.join),
        miterLimit: gl2dUtils.checkValue(stroke.miterLimit, TEXT_STYLE_STROKE_DEFAULTS.miterLimit),
    });
}

function serializeShadow(
    shadow: TextStyle['dropShadow'],
): Record<string, unknown> | undefined
{
    if (!shadow) return undefined;

    const offsetX = Math.cos(shadow.angle) * shadow.distance;
    const offsetY = Math.sin(shadow.angle) * shadow.distance;
    const color = Color.shared.setValue(shadow.color).toHex();

    const shadowObj = gl2dUtils.compact({
        color: color === TEXT_STYLE_SHADOW_DEFAULTS.color ? null : color,
        offsetX: gl2dUtils.checkValue(offsetX, TEXT_STYLE_SHADOW_DEFAULTS.offsetX),
        offsetY: gl2dUtils.checkValue(offsetY, TEXT_STYLE_SHADOW_DEFAULTS.offsetY),
        blur: gl2dUtils.checkValue(shadow.blur, TEXT_STYLE_SHADOW_DEFAULTS.blur),
        alpha: gl2dUtils.checkValue(shadow.alpha, TEXT_STYLE_SHADOW_DEFAULTS.alpha),
    });

    if (Object.keys(shadowObj).length === 0) return undefined;

    return shadowObj;
}

function serializeWordWrap(
    wordWrap: boolean,
    wordWrapWidth: number,
): { enabled: true; width: number } | undefined
{
    if (!wordWrap) return undefined;

    return { enabled: true, width: wordWrapWidth };
}

function serializeTagStyleFill(
    fill: TextStyleOptions['fill'],
    ctx: Gl2dSerializeContext,
): string | Gl2dRef | undefined
{
    // eslint-disable-next-line no-eq-null, eqeqeq
    if (fill == null) return undefined;

    return serializeFillValue(fill as FillGradient | FillPattern | ColorSource, ctx);
}

function serializeTagStyles(
    tagStyles: Record<string, TextStyleOptions> | undefined,
    ctx: Gl2dSerializeContext,
): Record<string, Record<string, unknown>> | undefined
{
    if (!tagStyles) return undefined;

    const entries = Object.entries(tagStyles);

    if (entries.length === 0) return undefined;

    const result: Record<string, Record<string, unknown>> = {};

    for (const [tag, opts] of entries)
    {
        const serialized = gl2dUtils.compact({
            fontFamily: opts.fontFamily ? gl2dUtils.cleanFontFamily(opts.fontFamily) : undefined,
            fontSize: gl2dUtils.checkValue(opts.fontSize, TEXT_STYLE_DEFAULTS.fontSize),
            fontStyle: gl2dUtils.checkValue(opts.fontStyle, TEXT_STYLE_DEFAULTS.fontStyle),
            fontVariant: gl2dUtils.checkValue(opts.fontVariant, TEXT_STYLE_DEFAULTS.fontVariant),
            fontWeight: gl2dUtils.checkValue(opts.fontWeight, TEXT_STYLE_DEFAULTS.fontWeight),
            fill: serializeTagStyleFill(opts.fill, ctx),
            align: gl2dUtils.checkValue(opts.align, TEXT_STYLE_DEFAULTS.align),
            letterSpacing: gl2dUtils.checkValue(opts.letterSpacing, TEXT_STYLE_DEFAULTS.letterSpacing),
            padding: gl2dUtils.checkValue(opts.padding, TEXT_STYLE_DEFAULTS.padding),
            textBaseline: gl2dUtils.checkValue(opts.textBaseline, TEXT_STYLE_DEFAULTS.textBaseline),
            breakWords: gl2dUtils.checkValue(opts.breakWords, TEXT_STYLE_DEFAULTS.breakWords),
            whiteSpace: gl2dUtils.checkValue(opts.whiteSpace, TEXT_STYLE_DEFAULTS.whiteSpace),
        });

        if (Object.keys(serialized).length > 0)
        {
            result[tag] = serialized;
        }
    }

    if (Object.keys(result).length === 0) return undefined;

    return result;
}

/**
 * Serializes a TextStyle into a text_style resource.
 * @param style - The TextStyle to serialize
 * @param ctx - The serialization context
 * @returns Index into ctx.gl2d.resources
 * @category gl2d
 * @internal
 */
export function serializeTextStyle(
    style: TextStyle,
    ctx: Gl2dSerializeContext,
): Gl2dRef
{
    const existing = ctx.resourceMap.get(style);

    if (existing !== undefined) return existing;

    const fillValue = serializeConvertedFill(style._fill, ctx);

    const resource = gl2dUtils.compact<Gl2dPixiTextStyleResource>({
        type: 'text_style',
        uid: `text_style_${String(style.uid)}`,
        name: `textStyle_${String(style.uid)}`,
        fontFamily: gl2dUtils.cleanFontFamily(style.fontFamily),
        fontSize: gl2dUtils.checkValue(style.fontSize, TEXT_STYLE_DEFAULTS.fontSize),
        fontStyle: gl2dUtils.checkValue(style.fontStyle, TEXT_STYLE_DEFAULTS.fontStyle),
        fontVariant: gl2dUtils.checkValue(style.fontVariant, TEXT_STYLE_DEFAULTS.fontVariant),
        fontWeight: gl2dUtils.checkValue(style.fontWeight, TEXT_STYLE_DEFAULTS.fontWeight),
        fill: fillValue === TEXT_STYLE_DEFAULTS.fill ? null : fillValue,
        align: gl2dUtils.checkValue(style.align, TEXT_STYLE_DEFAULTS.align),
        letterSpacing: gl2dUtils.checkValue(style.letterSpacing, TEXT_STYLE_DEFAULTS.letterSpacing),
        padding: gl2dUtils.checkValue(style.padding, TEXT_STYLE_DEFAULTS.padding),
        textBaseline: gl2dUtils.checkValue(style.textBaseline, TEXT_STYLE_DEFAULTS.textBaseline),
        stroke: serializeStroke(style._stroke, ctx),
        shadow: serializeShadow(style.dropShadow),
        wordWrap: serializeWordWrap(style.wordWrap, style.wordWrapWidth),
        breakWords: gl2dUtils.checkValue(style.breakWords, TEXT_STYLE_DEFAULTS.breakWords),
        whiteSpace: gl2dUtils.checkValue(style.whiteSpace, TEXT_STYLE_DEFAULTS.whiteSpace),
    });

    // eslint-disable-next-line dot-notation
    const tagStyles = style['_tagStyles'];

    const extInput: Gl2dSerializerInput<Gl2dPixiTextStyleResourceExtension> = {
        trim: gl2dUtils.checkValue(style.trim, PIXI_TEXT_STYLE_DEFAULTS.trim),
        leading: gl2dUtils.checkValue(style.leading, PIXI_TEXT_STYLE_DEFAULTS.leading),
        lineHeight: gl2dUtils.checkValue(style.lineHeight, PIXI_TEXT_STYLE_DEFAULTS.lineHeight),
        tagStyles: serializeTagStyles(tagStyles, ctx),
    };

    const ext = gl2dUtils.compact(extInput);

    if (Object.keys(ext).length > 0)
    {
        resource.extensions = { pixi_text_style_resource: ext };
        ctx.gl2d.extensionsUsed.add('pixi_text_style_resource');
    }

    const index = ctx.gl2d.resources.length;

    ctx.gl2d.resources.push(resource);
    ctx.resourceMap.set(style, index);

    return index;
}
