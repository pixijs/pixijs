import { ALPHA_MODES, BaseTexture, MIPMAP_MODES, Rectangle, settings, Texture, utils } from '@pixi/core';
import { TextMetrics, TextStyle } from '@pixi/text';
import { BitmapFontData } from './BitmapFontData';
import { autoDetectFormat } from './formats';
import { drawGlyph, extractCharCode, resolveCharacters } from './utils';

import type { IBaseTextureOptions, ICanvas, ICanvasRenderingContext2D, SCALE_MODES } from '@pixi/core';
import type { ITextStyle } from '@pixi/text';

export interface IBitmapFontCharacter
{
    xOffset: number;
    yOffset: number;
    xAdvance: number;
    texture: Texture;
    page: number;
    kerning: utils.Dict<number>;
}

type BaseOptions = Pick<IBaseTextureOptions, 'scaleMode' | 'mipmap' | 'anisotropicLevel' | 'alphaMode'>;

/** @memberof PIXI */
export interface IBitmapFontOptions extends BaseOptions
{
    /**
     * Characters included in the font set. You can also use ranges.
     * For example, `[['a', 'z'], ['A', 'Z'], "!@#$%^&*()~{}[] "]`.
     * Don't forget to include spaces ' ' in your character set!
     * @default PIXI.BitmapFont.ALPHANUMERIC
     */
    chars?: string | (string | string[])[];

    /**
     * Render resolution for glyphs.
     * @default 1
     */
    resolution?: number;

    /**
     * Padding between glyphs on texture atlas. Lower values could mean more visual artifacts
     * and bleeding from other glyphs, larger values increase the space required on the texture.
     * @default 4
     */
    padding?: number;

    /**
     * Optional width of atlas, smaller values to reduce memory.
     * @default 512
     */
    textureWidth?: number;

    /**
     * Optional height of atlas, smaller values to reduce memory.
     * @default 512
     */
    textureHeight?: number;

    /**
     * If mipmapping is enabled for texture. For instance, by default PixiJS only enables mipmapping
     * on Power-of-Two textures. If your textureWidth or textureHeight are not power-of-two, you
     * may consider enabling mipmapping to get better quality with lower font sizes. Note:
     * for MSDF/SDF fonts, mipmapping is not supported.
     * @default PIXI.BaseTexture.defaultOptions.mipmap
     */
    mipmap?: MIPMAP_MODES;

    /**
     * Anisotropic filtering level of texture.
     * @default PIXI.BaseTexture.defaultOptions.anisotropicLevel
     */
    anisotropicLevel?: number;

    /**
     * Default scale mode, linear, nearest. Nearest can be helpful for bitmap-style fonts.
     * @default PIXI.BaseTexture.defaultOptions.scaleMode
     */
    scaleMode?: SCALE_MODES;

    /**
     * Pre multiply the image alpha.  Note: for MSDF/SDF fonts, alphaMode is not supported.
     * @default PIXI.BaseTexture.defaultOptions.alphaMode
     */
    alphaMode?: ALPHA_MODES;

    /**
     * Skip generation of kerning information for the BitmapFont.
     * If true, this could potentially increase the performance, but may impact the rendered text appearance.
     * @default false
     */
    skipKerning?: boolean;
}

/**
 * BitmapFont represents a typeface available for use with the BitmapText class. Use the `install`
 * method for adding a font to be used.
 * @memberof PIXI
 */
export class BitmapFont
{
    /**
     * This character set includes all the letters in the alphabet (both lower- and upper- case).
     * @type {string[][]}
     * @example
     * BitmapFont.from('ExampleFont', style, { chars: BitmapFont.ALPHA })
     */
    public static readonly ALPHA = [['a', 'z'], ['A', 'Z'], ' '];

    /**
     * This character set includes all decimal digits (from 0 to 9).
     * @type {string[][]}
     * @example
     * BitmapFont.from('ExampleFont', style, { chars: BitmapFont.NUMERIC })
     */
    public static readonly NUMERIC = [['0', '9']];

    /**
     * This character set is the union of `BitmapFont.ALPHA` and `BitmapFont.NUMERIC`.
     * @type {string[][]}
     */
    public static readonly ALPHANUMERIC = [['a', 'z'], ['A', 'Z'], ['0', '9'], ' '];

    /**
     * This character set consists of all the ASCII table.
     * @member {string[][]}
     * @see http://www.asciitable.com/
     */
    public static readonly ASCII = [[' ', '~']];

    /**
     * Collection of default options when using `BitmapFont.from`.
     * @property {number} [resolution=1] -
     * @property {number} [textureWidth=512] -
     * @property {number} [textureHeight=512] -
     * @property {number} [padding=4] -
     * @property {string|string[]|string[][]} chars = PIXI.BitmapFont.ALPHANUMERIC
     */
    public static readonly defaultOptions: IBitmapFontOptions = {
        resolution: 1,
        textureWidth: 512,
        textureHeight: 512,
        padding: 4,
        chars: BitmapFont.ALPHANUMERIC,
    };

    /** Collection of available/installed fonts. */
    public static readonly available: utils.Dict<BitmapFont> = {};

    /** The name of the font face. */
    public readonly font: string;

    /** The size of the font face in pixels. */
    public readonly size: number;

    /** The line-height of the font face in pixels. */
    public readonly lineHeight: number;

    /** The map of characters by character code. */
    public readonly chars: utils.Dict<IBitmapFontCharacter>;

    /** The map of base page textures (i.e., sheets of glyphs). */
    public readonly pageTextures: utils.Dict<Texture>;

    /** The range of the distance field in pixels. */
    public readonly distanceFieldRange: number;

    /** The kind of distance field for this font or "none". */
    public readonly distanceFieldType: string;

    private _ownsTextures: boolean;

    /**
     * @param data
     * @param textures
     * @param ownsTextures - Setting to `true` will destroy page textures
     *        when the font is uninstalled.
     */
    constructor(data: BitmapFontData, textures: Texture[] | utils.Dict<Texture>, ownsTextures?: boolean)
    {
        const [info] = data.info;
        const [common] = data.common;
        const [page] = data.page;
        const [distanceField] = data.distanceField;
        const res = utils.getResolutionOfUrl(page.file);
        const pageTextures: utils.Dict<Texture> = {};

        this._ownsTextures = ownsTextures;
        this.font = info.face;
        this.size = info.size;
        this.lineHeight = common.lineHeight / res;
        this.chars = {};
        this.pageTextures = pageTextures;

        // Convert the input Texture, Textures or object
        // into a page Texture lookup by "id"
        for (let i = 0; i < data.page.length; i++)
        {
            const { id, file } = data.page[i];

            pageTextures[id] = textures instanceof Array
                ? textures[i] : textures[file];

            // only MSDF and SDF fonts need no-premultiplied-alpha
            if (distanceField?.fieldType && distanceField.fieldType !== 'none')
            {
                pageTextures[id].baseTexture.alphaMode = ALPHA_MODES.NO_PREMULTIPLIED_ALPHA;
                pageTextures[id].baseTexture.mipmap = MIPMAP_MODES.OFF;
            }
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

        // Store distance field information
        this.distanceFieldRange = distanceField?.distanceRange;
        this.distanceFieldType = distanceField?.fieldType?.toLowerCase() ?? 'none';
    }

    /** Remove references to created glyph textures. */
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
     * @param data - The
     *        characters map that could be provided as xml or raw string.
     * @param textures - List of textures for each page.
     * @param ownsTextures - Set to `true` to destroy page textures
     *        when the font is uninstalled. By default fonts created with
     *        `BitmapFont.from` or from the `BitmapFontLoader` are `true`.
     * @returns {PIXI.BitmapFont} Result font object with font, size, lineHeight
     *         and char fields.
     */
    public static install(
        data: string | XMLDocument | BitmapFontData,
        textures: Texture | Texture[] | utils.Dict<Texture>,
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
     * @param name - The name of the custom font to use with BitmapText.
     * @param textStyle - Style options to render with BitmapFont.
     * @param options - Setup options for font or name of the font.
     * @returns Font generated by style options.
     * @example
     * import { BitmapFont, BitmapText } from 'pixi.js';
     *
     * BitmapFont.from('TitleFont', {
     *     fontFamily: 'Arial',
     *     fontSize: 12,
     *     strokeThickness: 2,
     *     fill: 'purple',
     * });
     *
     * const title = new BitmapText('This is the title', { fontName: 'TitleFont' });
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
            textureHeight,
            ...baseOptions
        } = Object.assign({}, BitmapFont.defaultOptions, options);

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

        let canvas: ICanvas;
        let context: ICanvasRenderingContext2D;
        let baseTexture: BaseTexture;
        let maxCharHeight = 0;
        const baseTextures: BaseTexture[] = [];
        const textures: Texture[] = [];

        for (let i = 0; i < charsList.length; i++)
        {
            if (!canvas)
            {
                canvas = settings.ADAPTER.createCanvas();
                canvas.width = textureWidth;
                canvas.height = textureHeight;

                context = canvas.getContext('2d');
                baseTexture = new BaseTexture(canvas, { resolution, ...baseOptions });

                baseTextures.push(baseTexture);
                textures.push(new Texture(baseTexture));

                fontData.page.push({
                    id: textures.length - 1,
                    file: '',
                });
            }

            // Measure glyph dimensions
            const character = charsList[i];
            const metrics = TextMetrics.measureText(character, style, false, canvas);
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
                    throw new Error(`[BitmapFont] textureHeight ${textureHeight}px is too small `
                        + `(fontFamily: '${style.fontFamily}', fontSize: ${style.fontSize}px, char: '${character}')`);
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
                if (positionX === 0)
                {
                    // Avoid infinite loop (There can be some very wide char like '\uFDFD'!)
                    throw new Error(`[BitmapFont] textureWidth ${textureWidth}px is too small `
                        + `(fontFamily: '${style.fontFamily}', fontSize: ${style.fontSize}px, char: '${character}')`);
                }

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
                xadvance: width
                        - (style.dropShadow ? style.dropShadowDistance : 0)
                        - (style.stroke ? style.strokeThickness : 0),
            });

            positionX += (textureGlyphWidth + (2 * padding)) * resolution;
            positionX = Math.ceil(positionX);
        }

        if (!options?.skipKerning)
        {
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
