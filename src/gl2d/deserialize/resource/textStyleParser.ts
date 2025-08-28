import { ExtensionType } from '../../../extensions/Extensions';
import { type FillGradient } from '../../../scene/graphics/shared/fill/FillGradient';
import { type FillPattern } from '../../../scene/graphics/shared/fill/FillPattern';
import { TextStyle, type TextStyleOptions } from '../../../scene/text/TextStyle';
import { GL2D } from '../../GL2D';
import { type PixiGL2DTextStyle } from '../../spec/extensions/resources';
import { type GL2DResource } from '../../spec/resources';
import { deepRemoveUndefinedOrNull } from '../../utils/deepRemoveUndefinedOrNull';
import { type GL2DResourceParser } from '../parsers';

/**
 * Calculates the angle and distance from shadow offset values.
 * @param shadowOffsetX - Horizontal shadow offset in pixels
 * @param shadowOffsetY - Vertical shadow offset in pixels
 * @returns Object containing the angle (in radians) and distance
 */
function calculateShadowAngleAndDistance(
    shadowOffsetX: number,
    shadowOffsetY: number,
): {
        angle: number;
        distance: number;
    }
{
    // Calculate distance using Pythagorean theorem
    const distance = Math.sqrt((shadowOffsetX * shadowOffsetX) + (shadowOffsetY * shadowOffsetY));

    // Calculate angle using atan2 (handles all quadrants correctly)
    const angle = Math.atan2(shadowOffsetY, shadowOffsetX);

    return { angle, distance };
}

async function convertFill(
    fill: number | string,
    resources: GL2DResource[],
    serializedAssets: any[],
): Promise<string | FillGradient | FillPattern>
{
    if (typeof fill === 'string')
    {
        return fill;
    }

    let existingSource = serializedAssets[fill] as FillGradient | FillPattern;

    if (!existingSource)
    {
        // load the resource we need as it is not already loaded due to being later on in the array
        await GL2D.parseResource(resources[fill], resources, serializedAssets);
    }

    existingSource = serializedAssets[fill];

    return existingSource;
}

/**
 * Parser for GL2D text style resources.
 * @internal
 */
export const gl2DTextStyleParser: GL2DResourceParser<PixiGL2DTextStyle> = {
    extension: ExtensionType.GL2DResourceParser,

    async test(data: PixiGL2DTextStyle): Promise<boolean>
    {
        return data.type === 'text_style';
    },

    async parse(data: PixiGL2DTextStyle, resources, serializedAssets): Promise<TextStyle>
    {
        const { angle, distance } = calculateShadowAngleAndDistance(
            data.shadow?.offsetX ?? 0,
            data.shadow?.offsetY ?? 0,
        );

        let stroke: TextStyleOptions['stroke'];

        if (data.stroke)
        {
            const strokeFill = await convertFill(data.stroke.fill, resources, serializedAssets);
            const fill = typeof strokeFill === 'string' ? undefined : strokeFill;
            const color = typeof strokeFill === 'string' ? strokeFill : undefined;

            stroke = {
                fill,
                color,
                width: data.stroke?.width,
                alignment: data.stroke?.alignment,
                cap: data.stroke?.cap,
                join: data.stroke?.join,
                miterLimit: data.stroke?.miterLimit,
                textureSpace: null,
            };
        }

        const formattedData: Required<TextStyleOptions> = {
            stroke,
            fill: await convertFill(data.fill, resources, serializedAssets),
            ...deepRemoveUndefinedOrNull({
                fontFamily: data.fontFamily,
                fontSize: data.fontSize,
                fontWeight: data.fontWeight,
                fontVariant: data.fontVariant,
                fontStyle: data.fontStyle,
                letterSpacing: data.letterSpacing,
                textBaseline: data.textBaseline,
                padding: data.padding ? data.padding[0] : undefined,
                dropShadow: data.shadow
                    ? {
                        alpha: data.shadow.alpha,
                        color: data.shadow.color,
                        distance,
                        angle,
                        blur: data.shadow.blur,
                    }
                    : undefined,
                align: data.align,
                wordWrap: data.wordWrap.enabled,
                wordWrapWidth: data.wordWrap.width,
                whiteSpace: data.wordWrap.extensions?.pixi_wrap_mode?.whiteSpace,
                breakWords: data.wordWrap.extensions?.pixi_wrap_mode?.breakWords,
                lineHeight: data.extensions?.pixi_text_style_resource?.lineHeight,
                leading: data.extensions?.pixi_text_style_resource?.leading,
                trim: data.extensions?.pixi_text_style_resource?.trim,
                filters: null,
            })
        };

        const style = new TextStyle(formattedData);

        return style;
    },
};
