import { BitmapFont } from './BitmapFont';
import { TextMetrics, TextStyle } from '@pixi/text';
import type { ITextStyle } from '@pixi/text';
import { generateFillStyle } from './utils/generateFillStyle';
import { Texture, BaseTexture } from '@pixi/core';
import { BitmapFontData } from './BitmapFontData';
import { Rectangle } from '@pixi/math';

const BMT_SIZE = 1024;
const BMT_PADDING = 4;

/**
 * Factory for generating bitmap fonts at runtime.
 *
 * @memberof PIXI
 * @class
 */
export class BitmapFontFactory
{
    /**
     * Generates a bitmap-font for the given style and character set. This does not support
     * kernings yet.
     *
     * @param {PIXI.IBitmapFontFactoryOptions} options
     */
    public static create(options: Partial<IBitmapFontFactoryOptions> = {}): BitmapFont
    {
        let chars = options.chars;

        if (typeof chars === 'string')
        {
            chars = chars.split('');
        }

        const resolution = options.resolution || 1;
        const style = new TextStyle(options);

        const lineWidth = BMT_SIZE;

        const fontData = new BitmapFontData();

        fontData.info[0] = {
            face: style.fontFamily,
            size: style.fontSize,
        };
        fontData.common[0] = {
            lineHeight: style.fontSize,
        };
        fontData.page[0] = {
            id: 0,
            file: '',
        };

        const textures: Texture[] = [];

        let positionX = 0;
        let positionY = 0;

        let canvas;
        let context;
        let baseTexture;
        let maxCharHeight = 0;

        for (let i = 0; i < chars.length; i++)
        {
            if (positionY >= BMT_SIZE - style.fontSize)
            {
                canvas = null;
                context = null;
                baseTexture = null;
                positionY = 0;
                positionX = 0;
            }
            if (!canvas)
            {
                canvas = document.createElement('canvas');
                canvas.width = BMT_SIZE;
                canvas.height = BMT_SIZE;

                context = canvas.getContext('2d');
                baseTexture = new BaseTexture(canvas, { resolution });
            }

            const metrics = TextMetrics.measureText(chars[i], style, false, canvas);
            const width = metrics.maxLineWidth;
            const height = metrics.lineHeight;

            maxCharHeight = Math.max(height, maxCharHeight);

            if ((width * resolution) + positionX >= lineWidth)
            {
                --i;
                positionY += maxCharHeight * resolution;
                positionX = 0;
                maxCharHeight = 0;
                continue;
            }

            BitmapFontFactory.render(
                canvas,
                context,
                metrics,
                positionX,
                positionY,
                resolution,
                style
            );

            const id = metrics.text.charCodeAt(0);

            textures[id] = new Texture(baseTexture, new Rectangle(positionX / resolution, positionY / resolution,
                width,
                height));

            fontData.char[id] = {
                id,
                page: id,
                x: 0,
                y: 0,
                width,
                height,
                xoffset: 0,
                yoffset: 0,
                xadvance: width,
            };
            fontData.page[id] = {
                id,
                file: '',
            };

            positionX += (width + (2 * BMT_PADDING)) * resolution;
        }

        return new BitmapFont(fontData, textures);
    }

    private static render(
        canvas: HTMLCanvasElement,
        context: CanvasRenderingContext2D,
        metrics: TextMetrics,
        x: number,
        y: number,
        resolution: number,
        style: TextStyle
    ): void
    {
        const char = metrics.text;
        const fontProperties = metrics.fontProperties;

        context.translate(x, y);
        context.scale(resolution, resolution);

        const tx = style.strokeThickness / 2;
        const ty = -(style.strokeThickness / 2);

        context.font = style.toFontString();
        context.lineWidth = style.strokeThickness;
        context.textBaseline = style.textBaseline;
        context.lineJoin = style.lineJoin;
        context.miterLimit = style.miterLimit;

        // set canvas text styles
        context.fillStyle = generateFillStyle(canvas, context, style, resolution, [char], metrics);
        context.strokeStyle = style.stroke as string;

        context.shadowColor = '0';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        context.font = style.toFontString();
        context.lineWidth = style.strokeThickness;
        context.textBaseline = style.textBaseline;
        context.lineJoin = style.lineJoin;
        context.miterLimit = style.miterLimit;

        // set canvas text styles
        context.fillStyle = generateFillStyle(canvas, context, style, resolution, [char], metrics);
        context.strokeStyle = style.stroke as string;

        context.shadowColor = '0';
        context.shadowBlur = style.dropShadowBlur;
        context.shadowOffsetX = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
        context.shadowOffsetY = (Math.sin(style.dropShadowAngle) * style.dropShadowDistance);

        if (style.stroke && style.strokeThickness)
        {
            context.strokeText(char, tx, ty + metrics.lineHeight - fontProperties.descent);
        }
        if (style.fill)
        {
            context.fillText(char, tx, ty + metrics.lineHeight - fontProperties.descent);
        }

        context.setTransform();

        context.fillStyle = 'rgba(0, 0, 0, 0)';
    }
}

export interface IBitmapFontFactoryOptions extends ITextStyle
{
    chars: string | string[];
    resolution: number;
}

/**
 * @memberof PIXI
 * @interface IBitmapFontFactoryOptions
 * @property {string | string[]} chars - the character set to generate
 * @property {number} resolution - the resolution for rendering
 */
