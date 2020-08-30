import { Container } from '@pixi/display';
import type { Dict } from '@pixi/utils';
import type { ILoaderResource } from '@pixi/loaders';
import type { ITextStyle } from '@pixi/text';
import type { Loader } from '@pixi/loaders';
import { Mesh } from '@pixi/mesh';
import { ObservablePoint } from '@pixi/math';
import type { Rectangle } from '@pixi/math';
import { TextStyle } from '@pixi/text';
import type { TextStyleAlign } from '@pixi/text';
import { Texture } from '@pixi/core';

/**
 * BitmapFont represents a typeface available for use with the BitmapText class. Use the `install`
 * method for adding a font to be used.
 *
 * @class
 * @memberof PIXI
 */
export declare class BitmapFont {
    /**
     * This character set includes all the letters in the alphabet (both lower- and upper- case).
     * @readonly
     * @static
     * @member {string[][]}
     * @example
     * BitmapFont.from("ExampleFont", style, { chars: BitmapFont.ALPHA })
     */
    static readonly ALPHA: (string | string[])[];
    /**
     * This character set includes all decimal digits (from 0 to 9).
     * @readonly
     * @static
     * @member {string[][]}
     * @example
     * BitmapFont.from("ExampleFont", style, { chars: BitmapFont.NUMERIC })
     */
    static readonly NUMERIC: string[][];
    /**
     * This character set is the union of `BitmapFont.ALPHA` and `BitmapFont.NUMERIC`.
     * @readonly
     * @static
     * @member {string[][]}
     */
    static readonly ALPHANUMERIC: (string | string[])[];
    /**
     * This character set consists of all the ASCII table.
     * @readonly
     * @static
     * @member {string[][]}
     * @see http://www.asciitable.com/
     */
    static readonly ASCII: string[][];
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
    static readonly defaultOptions: IBitmapFontOptions;
    /**
     * Collection of available/installed fonts.
     *
     * @readonly
     * @static
     * @member {Object.<string, PIXI.BitmapFont>}
     */
    static readonly available: Dict<BitmapFont>;
    readonly font: string;
    readonly size: number;
    readonly lineHeight: number;
    readonly chars: Dict<IBitmapFontCharacter>;
    readonly pageTextures: Dict<Texture>;
    /**
     * @param {PIXI.BitmapFontData} data
     * @param {PIXI.Texture[]|Object.<string, PIXI.Texture>} textures
     */
    constructor(data: BitmapFontData, textures: Texture[] | Dict<Texture>);
    /**
     * Remove references to created glyph textures.
     */
    destroy(): void;
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
    static install(data: string | XMLDocument | BitmapFontData, textures: Texture | Texture[] | Dict<Texture>): BitmapFont;
    /**
     * Remove bitmap font by name.
     *
     * @static
     * @param {string} name
     */
    static uninstall(name: string): void;
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
    static from(name: string, textStyle?: TextStyle | Partial<ITextStyle>, options?: IBitmapFontOptions): BitmapFont;
}

/**
 * Normalized parsed data from .fnt files.
 *
 * @class
 * @memberof PIXI
 */
export declare class BitmapFontData {
    info: IBitmapFontDataInfo[];
    common: IBitmapFontDataCommon[];
    page: IBitmapFontDataPage[];
    char: IBitmapFontDataChar[];
    kerning: IBitmapFontDataKerning[];
    constructor();
}

/**
 * {@link PIXI.Loader Loader} middleware for loading
 * bitmap-based fonts suitable for using with {@link PIXI.BitmapText}.
 * @class
 * @memberof PIXI
 * @implements PIXI.ILoaderPlugin
 */
export declare class BitmapFontLoader {
    /**
     * Called when the plugin is installed.
     *
     * @see PIXI.Loader.registerPlugin
     */
    static add(): void;
    /**
     * Called after a resource is loaded.
     * @see PIXI.Loader.loaderMiddleware
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    static use(this: Loader, resource: ILoaderResource, next: (...args: any[]) => void): void;
    /**
     * Get folder path from a resource
     * @private
     * @param {PIXI.Loader} loader
     * @param {PIXI.LoaderResource} resource
     * @return {string}
     */
    private static getBaseUrl;
    /**
     * Replacement for NodeJS's path.dirname
     * @private
     * @param {string} url - Path to get directory for
     */
    private static dirname;
}

/**
 * A BitmapText object will create a line or multiple lines of text using bitmap font.
 *
 * The primary advantage of this class over Text is that all of your textures are pre-generated and loading,
 * meaning that rendering is fast, and changing text has no performance implications.
 *
 * Supporting character sets other than latin, such as CJK languages, may be impractical due to the number of characters.
 *
 * To split a line you can use '\n', '\r' or '\r\n' in your string.
 *
 * PixiJS can auto-generate fonts on-the-fly using BitmapFont or use fnt files provided by:
 * http://www.angelcode.com/products/bmfont/ for Windows or
 * http://www.bmglyph.com/ for Mac.
 *
 * A BitmapText can only be created when the font is loaded.
 *
 * ```js
 * // in this case the font is in a file called 'desyrel.fnt'
 * let bitmapText = new PIXI.BitmapText("text using a fancy font!", {font: "35px Desyrel", align: "right"});
 * ```
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
export declare class BitmapText extends Container {
    static styleDefaults: Partial<IBitmapTextStyle>;
    roundPixels: boolean;
    dirty: boolean;
    protected _textWidth: number;
    protected _textHeight: number;
    protected _text: string;
    protected _maxWidth: number;
    protected _maxLineHeight: number;
    protected _letterSpacing: number;
    protected _anchor: ObservablePoint;
    protected _fontName: string;
    protected _fontSize: number;
    protected _align: TextStyleAlign;
    protected _activePagesMeshData: PageMeshData[];
    protected _tint: number;
    /**
     * @param {string} text - A string that you would like the text to display.
     * @param {object} style - The style parameters.
     * @param {string} style.fontName - The installed BitmapFont name.
     * @param {number} [style.fontSize] - The size of the font in pixels, e.g. 24. If undefined,
     *.     this will default to the BitmapFont size.
     * @param {string} [style.align='left'] - Alignment for multiline text ('left', 'center' or 'right'),
     *      does not affect single line text.
     * @param {number} [style.tint=0xFFFFFF] - The tint color.
     * @param {number} [style.letterSpacing=0] - The amount of spacing between letters.
     * @param {number} [style.maxWidth=0] - The max width of the text before line wrapping.
     */
    constructor(text: string, style?: Partial<IBitmapTextStyle>);
    /**
     * Renders text and updates it when needed. This should only be called
     * if the BitmapFont is regenerated.
     */
    updateText(): void;
    /**
     * Updates the transform of this object
     *
     * @private
     */
    updateTransform(): void;
    /**
     * Validates text before calling parent's getLocalBounds
     *
     * @return {PIXI.Rectangle} The rectangular bounding area
     */
    getLocalBounds(): Rectangle;
    /**
     * Updates text when needed
     *
     * @private
     */
    protected validate(): void;
    /**
     * The tint of the BitmapText object.
     *
     * @member {number}
     * @default 0xffffff
     */
    get tint(): number;
    set tint(value: number);
    /**
     * The alignment of the BitmapText object.
     *
     * @member {string}
     * @default 'left'
     */
    get align(): TextStyleAlign;
    set align(value: TextStyleAlign);
    /**
     * The name of the BitmapFont.
     *
     * @member {string}
     */
    get fontName(): string;
    set fontName(value: string);
    /**
     * The size of the font to display.
     *
     * @member {number}
     */
    get fontSize(): number;
    set fontSize(value: number);
    /**
     * The anchor sets the origin point of the text.
     *
     * The default is `(0,0)`, this means the text's origin is the top left.
     *
     * Setting the anchor to `(0.5,0.5)` means the text's origin is centered.
     *
     * Setting the anchor to `(1,1)` would mean the text's origin point will be the bottom right corner.
     *
     * @member {PIXI.Point | number}
     */
    get anchor(): ObservablePoint;
    set anchor(value: ObservablePoint);
    /**
     * The text of the BitmapText object.
     *
     * @member {string}
     */
    get text(): string;
    set text(text: string);
    /**
     * The max width of this bitmap text in pixels. If the text provided is longer than the
     * value provided, line breaks will be automatically inserted in the last whitespace.
     * Disable by setting the value to 0.
     *
     * @member {number}
     */
    get maxWidth(): number;
    set maxWidth(value: number);
    /**
     * The max line height. This is useful when trying to use the total height of the Text,
     * i.e. when trying to vertically align.
     *
     * @member {number}
     * @readonly
     */
    get maxLineHeight(): number;
    /**
     * The width of the overall text, different from fontSize,
     * which is defined in the style object.
     *
     * @member {number}
     * @readonly
     */
    get textWidth(): number;
    /**
     * Additional space between characters.
     *
     * @member {number}
     */
    get letterSpacing(): number;
    set letterSpacing(value: number);
    /**
     * The height of the overall text, different from fontSize,
     * which is defined in the style object.
     *
     * @member {number}
     * @readonly
     */
    get textHeight(): number;
    /**
     * For backward compatibility, convert old style.font constructor param to fontName & fontSize properties.
     *
     * @private
     * @deprecated since 5.3.0
     */
    _upgradeStyle(style: Partial<IBitmapTextStyle>): void;
    /**
     * Register a bitmap font with data and a texture.
     *
     * @deprecated since 5.3.0
     * @see PIXI.BitmapFont.install
     * @static
     */
    static registerFont(data: string | XMLDocument | BitmapFontData, textures: Texture | Texture[] | Dict<Texture>): BitmapFont;
    /**
     * Get the list of installed fonts.
     *
     * @see PIXI.BitmapFont.available
     * @deprecated since 5.3.0
     * @static
     * @readonly
     * @member {Object.<string, PIXI.BitmapFont>}
     */
    static get fonts(): Dict<BitmapFont>;
}

export declare interface IBitmapFontCharacter {
    xOffset: number;
    yOffset: number;
    xAdvance: number;
    texture: Texture;
    page: number;
    kerning: Dict<number>;
}

export declare interface IBitmapFontDataChar {
    id: number;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    xoffset: number;
    yoffset: number;
    xadvance: number;
}

export declare interface IBitmapFontDataCommon {
    lineHeight: number;
}

export declare interface IBitmapFontDataInfo {
    face: string;
    size: number;
}

export declare interface IBitmapFontDataKerning {
    first: number;
    second: number;
    amount: number;
}

export declare interface IBitmapFontDataPage {
    id: number;
    file: string;
}

export declare interface IBitmapFontOptions {
    chars?: string | (string | string[])[];
    resolution?: number;
    padding?: number;
    textureWidth?: number;
    textureHeight?: number;
}

export declare interface IBitmapTextFontDescriptor {
    name: string;
    size: number;
}

export declare interface IBitmapTextStyle {
    font: string | IBitmapTextFontDescriptor;
    fontName: string;
    fontSize: number;
    tint: number;
    align: TextStyleAlign;
    letterSpacing: number;
    maxWidth: number;
}

declare interface PageMeshData {
    index: number;
    indexCount: number;
    vertexCount: number;
    uvsCount: number;
    total: number;
    mesh: Mesh;
    vertices?: Float32Array;
    uvs?: Float32Array;
    indices?: Uint16Array;
}

export { }
