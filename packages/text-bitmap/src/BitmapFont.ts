import { getResolutionOfUrl } from '@pixi/utils';
import { Rectangle } from '@pixi/math';
import { Texture, BaseTexture } from '@pixi/core';
import { autoDetectFormat } from './formats';
import { BitmapFontData } from './BitmapFontData';

import type { Dict } from '@pixi/utils';
import { TextStyle, TextMetrics, ITextStyle } from '@pixi/text';
import { generateFillStyle } from './utils/generateFillStyle';
import { hex2rgb, string2hex } from '@pixi/utils';

interface IBitmapFontCharacter {
    xOffset: number;
    yOffset: number;
    xAdvance: number;
    texture: Texture;
    page: number;
    kerning: Dict<number>;
}

// Internal map of available fonts, by name
const available: Dict<BitmapFont> = {};

// Default dimensions of the bitmap font atlas texture
const BMT_DIMEN = 1024;

// Default padding b/w glyphs in the bitmap font atlas
const BMT_PADDING = 4;

/**
 * BitmapFont represents a typeface available for use with the BitmapText class. Use the `install`
 * method for adding a font to be used.
 *
 * @class
 * @memberof PIXI
 */
export class BitmapFont
{
    public readonly font: string;
    public readonly size: number;
    public readonly lineHeight: number;
    public readonly chars: Dict<IBitmapFontCharacter>;

    /**
     * @param {PIXI.BitmapFontData} data
     * @param {PIXI.Texture[]|Object.<string, PIXI.Texture>} textures
     */
    constructor(data: BitmapFontData, textures: Texture[]|Dict<Texture>)
    {
        const [info] = data.info;
        const [common] = data.common;
        const [page] = data.page;
        const res = getResolutionOfUrl(page.file);
        const pagesTextures: Dict<Texture> = {};

        /**
         * The name of the font face.
         *
         * @member {string}
         * @readonly
         */
        this.font = info.face;

        /**
         * The size of the font face in pixels.
         *
         * @member {number}
         * @readonly
         */
        this.size = info.size;

        /**
         * The line-height of the font face in pixels.
         *
         * @member {number}
         * @readonly
         */
        this.lineHeight = common.lineHeight / res;

        /**
         * The map of characters by character code.
         *
         * @member {object}
         * @readonly
         */
        this.chars = {};

        // Convert the input Texture, Textures or object
        // into a page Texture lookup by "id"
        for (const i in data.page)
        {
            const { id, file } = data.page[i];

            pagesTextures[id] = textures instanceof Array
                ? textures[i] : textures[file];
        }

        // parse letters
        for (const i in data.char)
        {
            const { id, page } = data.char[i];
            let { x, y, width, height, xoffset, yoffset, xadvance } = data.char[i];

            x /= res;
            y /= res;
            width /= res;
            height /= res;
            xoffset /= res;
            yoffset /= res;
            xadvance /= res;

            const rect = new Rectangle(
                x + (pagesTextures[page].frame.x / res),
                y + (pagesTextures[page].frame.y / res),
                width,
                height
            );

            this.chars[id] = {
                xOffset: xoffset,
                yOffset: yoffset,
                xAdvance: xadvance,
                kerning: {},
                texture: new Texture(
                    pagesTextures[page].baseTexture,
                    rect
                ),
                page,
            };
        }

        // parse kernings
        for (const i in data.kerning)
        {
            let { first, second, amount } = data.kerning[i];

            first /= res;
            second /= res;
            amount /= res;

            if (this.chars[second])
            {
                this.chars[second].kerning[first] = amount;
            }
        }
    }

    /**
     * Remove references to created glyph textures.
     */
    public destroy(): void
    {
        for (const id in this.chars)
        {
            this.chars[id].texture.destroy();
        }

        // Set readonly null.
        (this as any).chars = null;
    }

    /**
     * Register a new bitmap font.
     *
     * @static
     * @param {XMLDocument|string|PIXI.BitmapFontData} data - The
     *        characters map that could be provided as xml or raw string.
     * @param {Object.<string, PIXI.Texture>|PIXI.Texture|PIXI.Texture[]}
     *        textures - List of textures for each page.
     * @return {PIXI.BitmapFont} Result font object with font, size, lineHeight
     *         and char fields.
     */
    public static install(
        data: string|XMLDocument|BitmapFontData,
        textures: Texture|Texture[]|Dict<Texture>
    ): BitmapFont
    {
        let fontData;

        if (data instanceof BitmapFontData)
        {
            fontData = data;
        }
        else
        {
            const format = autoDetectFormat(data);

            if (!format)
            {
                throw new Error('Unrecognized data format for font.');
            }

            fontData = format.parse(data as any);
        }

        // Single texture, convert to list
        if (textures instanceof Texture)
        {
            textures = [textures];
        }

        const font = new BitmapFont(fontData, textures);

        available[font.font] = font;

        return font;
    }

    /**
     * Remove bitmap font by name.
     *
     * @static
     * @param {string} name
     */
    public static uninstall(name: string): void
    {
        const font = available[name];

        if (!font)
        {
            throw new Error(`No font found named '${name}'`);
        }

        font.destroy();
        delete available[name];
    }

    /**
     * Collection of available fonts.
     *
     * @readOnly
     * @static
     * @member {Object.<string, PIXI.BitmapFont>}
     */
    public static get available(): Dict<BitmapFont>
    {
        return available;
    }

    /**
     * Generates a bitmap-font for the given style and character set. This does not support
     * kernings yet.
     *
     * @param {PIXI.IBitmapFontFactoryOptions} options - includes all `ITextStyle` properties.
     * @param {string|string[]} options.chars - characters included in the font set. You can also
     *      use ranges. For example, `[['a', 'z'], ['A', 'Z'], "!@#$%^&*()~`{}[]"]. Don't forget to
     *      include spaces ' ' in your character set!
     * @param {number} [options.resolution=1] - optional resolution to render the glyphs at
     * @return {PIXI.BitmapFont} font generated by style options.
     * @static
     * @example
     * const font = PIXI.BitmapFont.from({
     *     chars: [['a', 'z'], ['A', 'Z'], "!#$%^&*()~`{}[]"]
     *     font: "Arial",
     *     fontSize: 12,
     *     strokeThickness: 2,
     *     fill: "purple"
     * });
     *
     * const text = new PIXI.BitmapText("This is an example using Pixi's BitmapText+Font", font);
     */
    public static from(options: IBitmapFontFactoryOptions): BitmapFont
    {
        const name = options.name || options.fontFamily;
        let chars = options.chars;

        // Split the chars string into individual characters
        if (typeof chars === 'string')
        {
            chars = chars.split('');
        }
        // Handle an array of characters+ranges
        else if (chars.find((elem) => Array.isArray(elem)))
        {
            const flatChars = [];

            for (let i = 0, j = chars.length; i < j; i++)
            {
                const elem = chars[i];

                // Handle range delimited by start/end chars
                if (Array.isArray(elem))
                {
                    if (elem.length !== 2)
                    {
                        let suffix;

                        switch (i)
                        {
                            case 1: suffix = 'st'; break;
                            case 2: suffix = 'nd'; break;
                            case 3: suffix = 'rd'; break;
                            default: suffix = 'th';
                        }

                        throw new Error('BitmapFont.from was provided a character range is more than two limits. '
                            + `This is the ${i}${suffix} input in the character set.`);
                    }

                    for (let i = elem[0].charCodeAt(0), j = elem[1].charCodeAt(0); i <= j; i++)
                    {
                        flatChars.push(String.fromCharCode(i));
                    }
                }
                // Handle a character set string
                else
                {
                    flatChars.push(...elem.split(''));
                }
            }

            chars = flatChars;
        }

        const resolution = options.resolution || 1;
        const style = new TextStyle(options);

        const lineWidth = BMT_DIMEN;

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
            if (positionY >= BMT_DIMEN - style.fontSize)
            {
                // Create new atlas once current has filled up
                canvas = null;
                context = null;
                baseTexture = null;
                positionY = 0;
                positionX = 0;
            }
            if (!canvas)
            {
                canvas = document.createElement('canvas');
                canvas.width = BMT_DIMEN;
                canvas.height = BMT_DIMEN;

                context = canvas.getContext('2d');
                baseTexture = new BaseTexture(canvas, { resolution });
            }

            // Measure glyph dimensions
            const metrics = TextMetrics.measureText(chars[i], style, false, canvas);
            const width = metrics.width;
            const height = metrics.height;

            maxCharHeight = Math.max(height + metrics.fontProperties.descent, maxCharHeight);

            // Wrap line once full row has been rendered
            if ((width * resolution) + positionX >= lineWidth)
            {
                --i;
                positionY += maxCharHeight * resolution;
                positionX = 0;
                maxCharHeight = 0;
                continue;
            }

            drawGlyph(// eslint-disable-line @typescript-eslint/no-use-before-define
                canvas,
                context,
                metrics,
                positionX,
                positionY,
                resolution,
                style
            );

            // Unique (numeric) ID mapping to this glyph
            const id = metrics.text.charCodeAt(0);

            // Create a texture holding just the glyph
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
                xadvance: width - (style.dropShadow ? style.dropShadowDistance : 0),
            };
            fontData.page[id] = {
                id,
                file: '',
            };

            positionX += (width + (2 * BMT_PADDING)) * resolution;
        }

        const font = new BitmapFont(fontData, textures);

        if (name)
        {
            BitmapFont.available[name] = font;
        }

        return font;
    }
}

/**
 * Draws the glyph `metrics.text` on the given canvas.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} context
 * @param {TextMetrics} metrics
 * @param {number} x
 * @param {number} y
 * @param {number} resolution
 * @param {TextStyle} style
 */
function drawGlyph(
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

    context.font = style.toFontString();
    context.lineWidth = style.strokeThickness;
    context.textBaseline = style.textBaseline;
    context.lineJoin = style.lineJoin;
    context.miterLimit = style.miterLimit;

    // set canvas text styles
    context.fillStyle = generateFillStyle(canvas, context, style, resolution, [char], metrics);
    context.strokeStyle = style.stroke as string;

    const dropShadowColor = style.dropShadowColor;
    const rgb = hex2rgb(typeof dropShadowColor === 'number' ? dropShadowColor : string2hex(dropShadowColor));

    if (style.dropShadow)
    {
        context.shadowColor = `rgba(${rgb[0] * 255},${rgb[1] * 255},${rgb[2] * 255},${style.dropShadowAlpha})`;
        context.shadowBlur = style.dropShadowBlur;
        context.shadowOffsetX = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
        context.shadowOffsetY = (Math.sin(style.dropShadowAngle) * style.dropShadowDistance);
    }
    else
    {
        context.shadowColor = '0';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
    }

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

export interface IBitmapFontFactoryOptions extends Partial<ITextStyle>
{
    chars: string | string[];
    name?: string;
    resolution?: number;
}

/**
 * @memberof PIXI
 * @interface IBitmapFontFactoryOptions
 * @extends Partial<ITextStyle>
 * @property {string | string[]} chars - the character set to generate
 * @property {number} resolution - the resolution for rendering
 */
