import { getResolutionOfUrl } from '@pixi/utils';
import { Rectangle } from '@pixi/math';
import { Texture, BaseTexture } from '@pixi/core';
import { TextStyle, TextMetrics } from '@pixi/text';
import { autoDetectFormat } from './formats';
import { BitmapFontData } from './BitmapFontData';
import { resolveCharacters, drawGlyph, extractCharCode } from './utils';

import type { Dict } from '@pixi/utils';
import type { ITextStyle } from '@pixi/text';

export interface IBitmapFontCharacter
{
    xOffset: number;
    yOffset: number;
    xAdvance: number;
    texture: Texture;
    page: number;
    kerning: Dict<number>;
}

export interface IBitmapFontOptions
{
    chars?: string | (string | string[])[];
    resolution?: number;
    padding?: number;
    textureWidth?: number;
    textureHeight?: number;
}

/**
 * BitmapFont represents a typeface available for use with the BitmapText class. Use the `install`
 * method for adding a font to be used.
 *
 * @class
 * @memberof PIXI
 */
export class BitmapFont
{
    /**
     * This character set includes all the letters in the alphabet (both lower- and upper- case).
     * @readonly
     * @static
     * @member {string[][]}
     * @example
     * BitmapFont.from("ExampleFont", style, { chars: BitmapFont.ALPHA })
     */
    public static readonly ALPHA = [['a', 'z'], ['A', 'Z'], ' '];

    /**
     * This character set includes all decimal digits (from 0 to 9).
     * @readonly
     * @static
     * @member {string[][]}
     * @example
     * BitmapFont.from("ExampleFont", style, { chars: BitmapFont.NUMERIC })
     */
    public static readonly NUMERIC = [['0', '9']];

    /**
     * This character set is the union of `BitmapFont.ALPHA` and `BitmapFont.NUMERIC`.
     * @readonly
     * @static
     * @member {string[][]}
     */
    public static readonly ALPHANUMERIC = [['a', 'z'], ['A', 'Z'], ['0', '9'], ' '];

    /**
     * This character set consists of all the ASCII table.
     * @readonly
     * @static
     * @member {string[][]}
     * @see http://www.asciitable.com/
     */
    public static readonly ASCII = [[' ', '~']];

    /**
     * Collection of default options when using `BitmapFont.from`.
     *
     * @readonly
     * @static
     * @member {PIXI.IBitmapFontOptions}
     * @property {number} resolution=1
     * @property {number} textureWidth=512
     * @property {number} textureHeight=512
     * @property {number} padding=4
     * @property {string|string[]|string[][]} chars = PIXI.BitmapFont.ALPHANUMERIC
     */
    public static readonly defaultOptions: IBitmapFontOptions = {
        resolution: 1,
        textureWidth: 512,
        textureHeight: 512,
        padding: 4,
        chars: BitmapFont.ALPHANUMERIC,
    };

    /**
     * Collection of available/installed fonts.
     *
     * @readonly
     * @static
     * @member {Object.<string, PIXI.BitmapFont>}
     */
    public static readonly available: Dict<BitmapFont> = {};
    public readonly font: string;
    public readonly size: number;
    public readonly lineHeight: number;
    public readonly chars: Dict<IBitmapFontCharacter>;
    public readonly pageTextures: Dict<Texture>;
    private _ownsTextures: boolean;

    /**
     * @param {PIXI.BitmapFontData} data
     * @param {PIXI.Texture[]|Object.<string, PIXI.Texture>} textures
     * @param {boolean} ownsTextures - Setting to `true` will destroy page textures
     *        when the font is uninstalled.
     */
    constructor(data: BitmapFontData, textures: Texture[]|Dict<Texture>, ownsTextures?: boolean)
    {
        const [info] = data.info;
        const [common] = data.common;
        const [page] = data.page;
        const res = getResolutionOfUrl(page.file);
        const pageTextures: Dict<Texture> = {};

        this._ownsTextures = ownsTextures;

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

        /**
         * The map of base page textures (i.e., sheets of glyphs).
         *
         * @member {object}
         * @readonly
         * @private
         */
        this.pageTextures = pageTextures;

        // Convert the input Texture, Textures or object
        // into a page Texture lookup by "id"
        for (let i = 0; i < data.page.length; i++)
        {
            const { id, file } = data.page[i];

            pageTextures[id] = textures instanceof Array
                ? textures[i] : textures[file];
        }

        // parse letters
        for (let i = 0; i < data.char.length; i++)
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
                x + (pageTextures[page].frame.x / res),
                y + (pageTextures[page].frame.y / res),
                width,
                height
            );

            this.chars[id] = {
                xOffset: xoffset,
                yOffset: yoffset,
                xAdvance: xadvance,
                kerning: {},
                texture: new Texture(
                    pageTextures[page].baseTexture,
                    rect
                ),
                page,
            };
        }

        // parse kernings
        for (let i = 0; i < data.kerning.length; i++)
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
            this.chars[id].texture = null;
        }

        for (const id in this.pageTextures)
        {
            if (this._ownsTextures)
            {
                this.pageTextures[id].destroy(true);
            }

            this.pageTextures[id] = null;
        }

        // Set readonly null.
        (this as any).chars = null;
        (this as any).pageTextures = null;
    }

    /**
     * Register a new bitmap font.
     *
     * @static
     * @param {XMLDocument|string|PIXI.BitmapFontData} data - The
     *        characters map that could be provided as xml or raw string.
     * @param {Object.<string, PIXI.Texture>|PIXI.Texture|PIXI.Texture[]}
     *        textures - List of textures for each page.
     * @param managedTexture - Set to `true` to destroy page textures
     *        when the font is uninstalled. By default fonts created with
     *        `BitmapFont.from` or from the `BitmapFontLoader` are `true`.
     * @return {PIXI.BitmapFont} Result font object with font, size, lineHeight
     *         and char fields.
     */
    public static install(
        data: string|XMLDocument|BitmapFontData,
        textures: Texture|Texture[]|Dict<Texture>,
        ownsTextures?: boolean
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

        const font = new BitmapFont(fontData, textures, ownsTextures);

        BitmapFont.available[font.font] = font;

        return font;
    }

    /**
     * Remove bitmap font by name.
     *
     * @static
     * @param name - Name of the font to uninstall.
     */
    public static uninstall(name: string): void
    {
        const font = BitmapFont.available[name];

        if (!font)
        {
            throw new Error(`No font found named '${name}'`);
        }

        font.destroy();
        delete BitmapFont.available[name];
    }

    /**
     * Generates a bitmap-font for the given style and character set. This does not support
     * kernings yet. With `style` properties, only the following non-layout properties are used:
     *
     * - {@link PIXI.TextStyle#dropShadow|dropShadow}
     * - {@link PIXI.TextStyle#dropShadowDistance|dropShadowDistance}
     * - {@link PIXI.TextStyle#dropShadowColor|dropShadowColor}
     * - {@link PIXI.TextStyle#dropShadowBlur|dropShadowBlur}
     * - {@link PIXI.TextStyle#dropShadowAngle|dropShadowAngle}
     * - {@link PIXI.TextStyle#fill|fill}
     * - {@link PIXI.TextStyle#fillGradientStops|fillGradientStops}
     * - {@link PIXI.TextStyle#fillGradientType|fillGradientType}
     * - {@link PIXI.TextStyle#fontFamily|fontFamily}
     * - {@link PIXI.TextStyle#fontSize|fontSize}
     * - {@link PIXI.TextStyle#fontVariant|fontVariant}
     * - {@link PIXI.TextStyle#fontWeight|fontWeight}
     * - {@link PIXI.TextStyle#lineJoin|lineJoin}
     * - {@link PIXI.TextStyle#miterLimit|miterLimit}
     * - {@link PIXI.TextStyle#stroke|stroke}
     * - {@link PIXI.TextStyle#strokeThickness|strokeThickness}
     * - {@link PIXI.TextStyle#textBaseline|textBaseline}
     *
     * @param {string} name - The name of the custom font to use with BitmapText.
     * @param {object|PIXI.TextStyle} [style] - Style options to render with BitmapFont.
     * @param {PIXI.IBitmapFontOptions} [options] - Setup options for font or name of the font.
     * @param {string|string[]|string[][]} [options.chars=PIXI.BitmapFont.ALPHANUMERIC] - characters included
     *      in the font set. You can also use ranges. For example, `[['a', 'z'], ['A', 'Z'], "!@#$%^&*()~{}[] "]`.
     *      Don't forget to include spaces ' ' in your character set!
     * @param {number} [options.resolution=1] - Render resolution for glyphs.
     * @param {number} [options.textureWidth=512] - Optional width of atlas, smaller values to reduce memory.
     * @param {number} [options.textureHeight=512] - Optional height of atlas, smaller values to reduce memory.
     * @param {number} [options.padding=4] - Padding between glyphs on texture atlas.
     * @return {PIXI.BitmapFont} Font generated by style options.
     * @static
     * @example
     * PIXI.BitmapFont.from("TitleFont", {
     *     fontFamily: "Arial",
     *     fontSize: 12,
     *     strokeThickness: 2,
     *     fill: "purple"
     * });
     *
     * const title = new PIXI.BitmapText("This is the title", { fontName: "TitleFont" });
     */
    public static from(name: string, textStyle?: TextStyle | Partial<ITextStyle>, options?: IBitmapFontOptions): BitmapFont
    {
        if (!name)
        {
            throw new Error('[BitmapFont] Property `name` is required.');
        }

        const {
            chars,
            padding,
            resolution,
            textureWidth,
            textureHeight } = Object.assign(
            {}, BitmapFont.defaultOptions, options);

        const charsList = resolveCharacters(chars);
        const style = textStyle instanceof TextStyle ? textStyle : new TextStyle(textStyle);
        const lineWidth = textureWidth;
        const fontData = new BitmapFontData();

        fontData.info[0] = {
            face: style.fontFamily as string,
            size: style.fontSize as number,
        };
        fontData.common[0] = {
            lineHeight: style.fontSize as number,
        };

        let positionX = 0;
        let positionY = 0;

        let canvas: HTMLCanvasElement;
        let context: CanvasRenderingContext2D;
        let baseTexture: BaseTexture;
        let maxCharHeight = 0;
        const baseTextures: BaseTexture[] = [];
        const textures: Texture[] = [];

        for (let i = 0; i < charsList.length; i++)
        {
            if (!canvas)
            {
                canvas = document.createElement('canvas');
                canvas.width = textureWidth;
                canvas.height = textureHeight;

                context = canvas.getContext('2d');
                baseTexture = new BaseTexture(canvas, { resolution });

                baseTextures.push(baseTexture);
                textures.push(new Texture(baseTexture));

                fontData.page.push({
                    id: textures.length - 1,
                    file: '',
                });
            }

            // Measure glyph dimensions
            const metrics = TextMetrics.measureText(charsList[i], style, false, canvas);
            const width = metrics.width;
            const height = Math.ceil(metrics.height);

            // This is ugly - but italics are given more space so they don't overlap
            const textureGlyphWidth = Math.ceil((style.fontStyle === 'italic' ? 2 : 1) * width);

            // Can't fit char anymore: next canvas please!
            if (positionY >= textureHeight - (height * resolution))
            {
                if (positionY === 0)
                {
                    // We don't want user debugging an infinite loop (or do we? :)
                    throw new Error(`[BitmapFont] textureHeight ${textureHeight}px is `
                        + `too small for ${style.fontSize}px fonts`);
                }

                --i;

                // Create new atlas once current has filled up
                canvas = null;
                context = null;
                baseTexture = null;
                positionY = 0;
                positionX = 0;
                maxCharHeight = 0;

                continue;
            }

            maxCharHeight = Math.max(height + metrics.fontProperties.descent, maxCharHeight);

            // Wrap line once full row has been rendered
            if ((textureGlyphWidth * resolution) + positionX >= lineWidth)
            {
                --i;
                positionY += maxCharHeight * resolution;
                positionY = Math.ceil(positionY);
                positionX = 0;
                maxCharHeight = 0;

                continue;
            }

            drawGlyph(canvas, context, metrics, positionX, positionY, resolution, style);

            // Unique (numeric) ID mapping to this glyph
            const id = extractCharCode(metrics.text);

            // Create a texture holding just the glyph
            fontData.char.push({
                id,
                page: textures.length - 1,
                x: positionX / resolution,
                y: positionY / resolution,
                width: textureGlyphWidth,
                height,
                xoffset: 0,
                yoffset: 0,
                xadvance: Math.ceil(width
                        - (style.dropShadow ? style.dropShadowDistance : 0)
                        - (style.stroke ? style.strokeThickness : 0)),
            });

            positionX += (textureGlyphWidth + (2 * padding)) * resolution;
            positionX = Math.ceil(positionX);
        }

        // Brute-force kerning info, this can be expensive b/c it's an O(n²),
        // but we're using measureText which is native and fast.
        for (let i = 0, len = charsList.length; i < len; i++)
        {
            const first = charsList[i];

            for (let j = 0; j < len; j++)
            {
                const second = charsList[j];
                const c1 = context.measureText(first).width;
                const c2 = context.measureText(second).width;
                const total = context.measureText(first + second).width;
                const amount = total - (c1 + c2);

                if (amount)
                {
                    fontData.kerning.push({
                        first: extractCharCode(first),
                        second: extractCharCode(second),
                        amount,
                    });
                }
            }
        }

        const font = new BitmapFont(fontData, textures, true);

        // Make it easier to replace a font
        if (BitmapFont.available[name] !== undefined)
        {
            BitmapFont.uninstall(name);
        }

        BitmapFont.available[name] = font;

        return font;
    }
}

/**
 * @memberof PIXI
 * @interface IBitmapFontOptions
 * @property {string | string[] | string[][]} [chars=PIXI.BitmapFont.ALPHANUMERIC] - the character set to generate
 * @property {number} [resolution=1] - the resolution for rendering
 * @property {number} [padding=4] - the padding between glyphs in the atlas
 * @property {number} [textureWidth=512] - the width of the texture atlas
 * @property {number} [textureHeight=512] - the height of the texture atlas
 */
