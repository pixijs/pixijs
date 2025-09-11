import { Color } from '../../../color/Color';
import { type TextStyle } from '../../../scene/text/TextStyle';
import { type ToGL2DOptions } from '../../GL2D';
import { type PixiGL2DTextStyle } from '../../spec/extensions/resources';

async function parseFill(
    options: ToGL2DOptions,
    instance: TextStyle,
    type: 'fill' | 'stroke',
): Promise<number | string>
{
    const { gl2D } = options;
    let fill: number | string;
    const currentFill = type === 'fill' ? instance._fill : instance._stroke;

    if (currentFill.fill)
    {
        // find the fill
        const fillIndex = gl2D.resources.findIndex(
            (texture) => texture.uid === `gradient_fill_${currentFill.fill.uid}`,
        );

        if (fillIndex !== -1)
        {
            fill = fillIndex;
        }
        else
        {
            // needs serialization
            await currentFill.fill.serialize(options);
            fill = gl2D.resources.length - 1;
        }
    }
    else
    {
        fill = Color.shared
            .setValue(currentFill.color)
            .setAlpha(currentFill.alpha ?? 1)
            .toRgbaString();
    }

    return fill;
}

/**
 * Serializes the text style to a gl2D-compatible format.
 * @param instance - The text style instance to serialize.
 * @param options - The serialization options.
 * @internal
 */
export async function serializeTextStyle(instance: TextStyle, options: ToGL2DOptions): Promise<ToGL2DOptions>
{
    const { gl2D } = options;

    // check if the source is already serialized
    const sourceIndex = gl2D.resources.findIndex((style) => style.uid === `text_style_${instance.uid}`);

    if (sourceIndex !== -1)
    {
        return options;
    }

    const fill = await parseFill(options, instance, 'fill');
    const stroke: PixiGL2DTextStyle['stroke'] = instance._stroke
        ? {
            fill: await parseFill(options, instance, 'stroke'),
            width: instance._stroke.width,
            alignment: instance._stroke.alignment,
            join: instance._stroke.join,
            cap: instance._stroke.cap,
            miterLimit: instance._stroke.miterLimit,
        }
        : null;

    // If not serialized, add it to the GL2D instance
    const data: PixiGL2DTextStyle = {
        uid: `text_style_${instance.uid}`,
        type: 'text_style',
        stroke,
        fill,
        shadow: instance.dropShadow
            ? {
                alpha: instance.dropShadow.alpha,
                blur: instance.dropShadow.blur,
                color: Color.shared.setValue(instance.dropShadow.color).toRgbaString(),
                offsetX: Math.cos(instance.dropShadow.angle) * instance.dropShadow.distance,
                offsetY: Math.sin(instance.dropShadow.angle) * instance.dropShadow.distance,
            }
            : null,
        padding: instance.padding ? [instance.padding, instance.padding, instance.padding, instance.padding] : null,
        letterSpacing: instance.letterSpacing,
        fontFamily: instance.fontFamily,
        fontSize: instance.fontSize,
        fontStyle: instance.fontStyle,
        fontWeight: instance.fontWeight,
        fontVariant: instance.fontVariant,
        align: instance.align,
        textBaseline: instance.textBaseline,
        wordWrap: {
            enabled: instance.wordWrap,
            width: instance.wordWrapWidth,
            extensions: {
                pixi_wrap_mode: {
                    breakWords: instance.breakWords,
                    whiteSpace: instance.whiteSpace,
                },
            },
        },
        extensions: {
            pixi_text_style_resource: {
                trim: instance.trim,
                lineHeight: instance.lineHeight,
                leading: instance.leading,
                filters: null,
            },
        },
    };

    gl2D.resources.push(data);
    gl2D.extensionsUsed.push('pixi_texture_source_resource');
    gl2D.extensionsUsed.push('pixi_wrap_mode');

    return options;
}

/**
 * Mixin for serializing a text style to a gl2D-compatible format.
 * @category gl2d
 * @standard
 */
export interface SerializeTextStyleMixin
{
    /**
     * Serializes the text style to a gl2D-compatible format.
     * @param {ToGL2DOptions} gl2DOptions - The gl2D serialization context and options.
     */
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>;
}

/** @internal */
export const serializeTextStyleMixin: Partial<TextStyle> = {
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>
    {
        return serializeTextStyle(this, gl2DOptions);
    },
} as TextStyle;
