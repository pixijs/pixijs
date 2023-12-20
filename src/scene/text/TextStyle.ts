import EventEmitter from 'eventemitter3';
import { Color, type ColorSource } from '../../color/Color';
import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { FillGradient } from '../graphics/shared/fill/FillGradient';
import { GraphicsContext } from '../graphics/shared/GraphicsContext';
import { convertFillInputToFillStyle } from '../graphics/shared/utils/convertFillInputToFillStyle';
import { generateTextStyleKey } from './utils/generateTextStyleKey';

import type { TextureDestroyOptions, TypeOrBool } from '../container/destroyTypes';
import type {
    ConvertedFillStyle,
    ConvertedStrokeStyle,
    FillStyle,
    FillStyleInputs
} from '../graphics/shared/GraphicsContext';

export type TextStyleAlign = 'left' | 'center' | 'right' | 'justify';
export type TextStyleFill = string | string[] | number | number[] | CanvasGradient | CanvasPattern;
export type TextStyleFontStyle = 'normal' | 'italic' | 'oblique';
export type TextStyleFontVariant = 'normal' | 'small-caps';
// eslint-disable-next-line max-len
export type TextStyleFontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
export type TextStyleLineJoin = 'miter' | 'round' | 'bevel';
export type TextStyleTextBaseline = 'alphabetic' | 'top' | 'hanging' | 'middle' | 'ideographic' | 'bottom';
export type TextStyleWhiteSpace = 'normal' | 'pre' | 'pre-line';

/**
 * A collection of text related classes.
 *
 * To create a new Text object, use either:
 * - {@link scene.Text} - A Text object which is created using the
 * [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).
 * - {@link scene.BitmapText} - A Text object which uses a bitmap font to render text.
 * - {@link scene.HTMLText} - A Text object which uses an svg foreignObject to render HTML text.
 * @namespace text
 * @example
 * import { Text } from 'pixi.js';
 *
 * const text = new Text({
 *     text: 'Hello Pixi!',
 *     style: {
 *         fontFamily: 'cool-font',
 *         fontSize: 24,
 *         fill: 0xff1010,
 *         align: 'center',
 *     }
 * });
 */

/**
 * Constructor options used for `TextStyle` instances.
 * ```js
 * const textStyle = new TextStyle({
 *    fontSize: 12,
 *    fill: 'black',
 * });
 * ```
 * @see {@link scene.TextStyle}
 * @memberof scene
 */
export interface TextStyleOptions
{
    /**
     * Alignment for multiline text, does not affect single line text
     * @type {'left'|'center'|'right'|'justify'}
     */
    align?: TextStyleAlign;
    /** Indicates if lines can be wrapped within words, it needs `wordWrap` to be set to `true` */
    breakWords?: boolean;
    /** Enabled a drop shadow for the text */
    dropShadow?: boolean;
    /** Set the alpha of the text drop shadow */
    dropShadowAlpha?: number;
    /** Set a angle of the text drop shadow */
    dropShadowAngle?: number;
    /** Set a shadow blur radius */
    dropShadowBlur?: number;
    /** A fill style to be used on the text drop shadow e.g., 'red', '#00FF00' */
    dropShadowColor?: ColorSource;
    /** Set a distance of the text drop shadow */
    dropShadowDistance?: number;
    /**
     * A canvas fillstyle that will be used on the text e.g., 'red', '#00FF00'.
     * Can be an array to create a gradient, e.g., `['#000000','#FFFFFF']`
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle|MDN}
     * @type {string|string[]|number|number[]|CanvasGradient|CanvasPattern}
     */
    fill?: FillStyleInputs;
    /** The font family, can be a single font name, or a list of names where the first is the preferred font. */
    fontFamily?: string | string[];
    /** The font size (as a number it converts to px, but as a string, equivalents are '26px','20pt','160%' or '1.6em') */
    fontSize?: number | string;
    /**
     * The font style.
     * @type {'normal'|'italic'|'oblique'}
     */
    fontStyle?: TextStyleFontStyle;
    /**
     * The font variant.
     * @type {'normal'|'small-caps'}
     */
    fontVariant?: TextStyleFontVariant;
    /**
     * The font weight.
     * @type {'normal'|'bold'|'bolder'|'lighter'|'100'|'200'|'300'|'400'|'500'|'600'|'700'|'800'|'900'}
     */
    fontWeight?: TextStyleFontWeight;
    /** The height of the line, a number that represents the vertical space that a letter uses. */
    leading?: number;
    /** The amount of spacing between letters, default is 0 */
    letterSpacing?: number;
    /** The line height, a number that represents the vertical space that a letter uses */
    lineHeight?: number;
    /**
     * Occasionally some fonts are cropped. Adding some padding will prevent this from
     * happening by adding padding to all sides of the text.
     */
    padding?: number;
    /** A canvas fillstyle that will be used on the text stroke, e.g., 'blue', '#FCFF00' */
    stroke?: FillStyleInputs;
    /**
     * The baseline of the text that is rendered.
     * @type {'alphabetic'|'top'|'hanging'|'middle'|'ideographic'|'bottom'}
     */
    textBaseline?: TextStyleTextBaseline;
    trim?: false,
    /**
     * Determines whether newlines & spaces are collapsed or preserved "normal"
     * (collapse, collapse), "pre" (preserve, preserve) | "pre-line" (preserve,
     * collapse). It needs wordWrap to be set to true.
     * @type {'normal'|'pre'|'pre-line'}
     */
    whiteSpace?: TextStyleWhiteSpace;
    /** Indicates if word wrap should be used */
    wordWrap?: boolean;
    /** The width at which text will wrap, it needs wordWrap to be set to true */
    wordWrapWidth?: number;
}

/**
 * A TextStyle Object contains information to decorate a Text objects.
 *
 * An instance can be shared between multiple Text objects; then changing the style will update all text objects using it.
 * @memberof text
 * @example
 * import { TextStyle } from 'pixi.js';
 * const style = new TextStyle({
 *   fontFamily: ['Helvetica', 'Arial', 'sans-serif'],
 *   fontSize: 36,
 * });
 */
export class TextStyle extends EventEmitter<{
    update: void
}>
{
    public static defaultTextStyle: TextStyleOptions = {
        /**
         * See {@link TextStyle.align}
         * @type {'left'|'center'|'right'|'justify'}
         */
        align: 'left',
        /** See {@link TextStyle.breakWords} */
        breakWords: false,
        dropShadow: false,
        dropShadowAlpha: 1,
        dropShadowAngle: Math.PI / 6,
        dropShadowBlur: 0,
        dropShadowColor: 'black',
        dropShadowDistance: 5,
        /**
         * See {@link TextStyle.fill}
         * @type {string|string[]|number|number[]|CanvasGradient|CanvasPattern}
         */
        fill: 'black',
        /**
         * See {@link TextStyle.fontFamily}
         * @type {string|string[]}
         */
        fontFamily: 'Arial',
        /**
         * See {@link TextStyle.fontSize}
         * @type {number|string}
         */
        fontSize: 26,
        /**
         * See {@link TextStyle.fontStyle}
         * @type {'normal'|'italic'|'oblique'}
         */
        fontStyle: 'normal',
        /**
         * See {@link TextStyle.fontVariant}
         * @type {'normal'|'small-caps'}
         */
        fontVariant: 'normal',
        /**
         * See {@link TextStyle.fontWeight}
         * @type {'normal'|'bold'|'bolder'|'lighter'|'100'|'200'|'300'|'400'|'500'|'600'|'700'|'800'|'900'}
         */
        fontWeight: 'normal',
        /** See {@link TextStyle.leading} */
        leading: 0,
        /** See {@link TextStyle.letterSpacing} */
        letterSpacing: 0,
        /** See {@link TextStyle.lineHeight} */
        lineHeight: 0,
        /** See {@link TextStyle.padding} */
        padding: 0,
        /**
         * See {@link TextStyle.stroke}
         * @type {string|number}
         */
        stroke: null,
        /**
         * See {@link TextStyle.textBaseline}
         * @type {'alphabetic'|'top'|'hanging'|'middle'|'ideographic'|'bottom'}
         */
        textBaseline: 'alphabetic',
        /** See {@link TextStyle.trim} */
        trim: false,
        /**
         * See {@link TextStyle.whiteSpace}
         * @type {'normal'|'pre'|'pre-line'}
         */
        whiteSpace: 'pre',
        /** See {@link TextStyle.wordWrap} */
        wordWrap: false,
        /** See {@link TextStyle.wordWrapWidth} */
        wordWrapWidth: 100,
    };

    // colors!!
    /** @internal */
    public _fill: ConvertedFillStyle;
    private _originalFill: FillStyleInputs;

    /** @internal */
    public _stroke: ConvertedStrokeStyle;
    private _originalStroke: FillStyleInputs;

    private _dropShadow: boolean;
    private _dropShadowAlpha: number;
    private _dropShadowAngle: number;
    private _dropShadowBlur: number;
    private _dropShadowColor: ColorSource;
    private _dropShadowDistance: number;

    private _fontFamily: string | string[];
    private _fontSize: number;
    private _fontStyle: TextStyleFontStyle;
    private _fontVariant: TextStyleFontVariant;
    private _fontWeight: TextStyleFontWeight;

    private _breakWords: boolean;
    private _align: TextStyleAlign;
    private _leading: number;
    private _letterSpacing: number;
    private _lineHeight: number;

    private _textBaseline: TextStyleTextBaseline;
    private _whiteSpace: TextStyleWhiteSpace;
    private _wordWrap: boolean;
    private _wordWrapWidth: number;

    private _padding: number;

    protected _styleKey: string;
    private _trim: boolean;

    constructor(style: Partial<TextStyleOptions> = {})
    {
        super();

        const defaultStyle = TextStyle.defaultTextStyle;

        convertV7Tov8Style(style);

        const fullStyle = { ...defaultStyle, ...style };

        for (const key in defaultStyle)
        {
            const thisKey = key as keyof typeof this;

            this[thisKey] = fullStyle[key as keyof TextStyleOptions] as any;
        }

        if (typeof fullStyle.fill === 'string')
        {
            // eg '34px' to number
            this.fontSize = parseInt(fullStyle.fontSize as string, 10);
        }
        else
        {
            this.fontSize = fullStyle.fontSize as number;
        }

        this._dropShadow = fullStyle.dropShadow;
        this._dropShadowAlpha = fullStyle.dropShadowAlpha;
        this._dropShadowAngle = fullStyle.dropShadowAngle;
        this._dropShadowBlur = fullStyle.dropShadowBlur;
        this._dropShadowColor = fullStyle.dropShadowColor;
        this._dropShadowDistance = fullStyle.dropShadowDistance;

        this.update();
    }

    /**
     * Alignment for multiline text, does not affect single line text.
     * @member {'left'|'center'|'right'|'justify'}
     */
    get align(): TextStyleAlign { return this._align; }
    set align(value: TextStyleAlign) { this._align = value; this.update(); }
    /** Indicates if lines can be wrapped within words, it needs wordWrap to be set to true. */
    get breakWords(): boolean { return this._breakWords; }
    set breakWords(value: boolean) { this._breakWords = value; this.update(); }
    /** Enable a drop shadow for the text. */
    get dropShadow(): boolean { return this._dropShadow; }
    set dropShadow(value: boolean) { this._dropShadow = value; this.update(); }
    /** Set the alpha of the text drop shadow. */
    get dropShadowAlpha(): number { return this._dropShadowAlpha; }
    set dropShadowAlpha(value: number) { this._dropShadowAlpha = value; this.update(); }
    /** Set a angle of the text drop shadow. */
    get dropShadowAngle(): number { return this._dropShadowAngle; }
    set dropShadowAngle(value: number) { this._dropShadowAngle = value; this.update(); }
    /** Set a shadow blur radius. */
    get dropShadowBlur(): number { return this._dropShadowBlur; }
    set dropShadowBlur(value: number) { this._dropShadowBlur = value; this.update(); }
    /** A fill style to be used on the text drop shadow. */
    get dropShadowColor(): ColorSource { return this._dropShadowColor; }
    set dropShadowColor(value: ColorSource) { this._dropShadowColor = value; this.update(); }
    /** Set a distance of the text drop shadow. */
    get dropShadowDistance(): number { return this._dropShadowDistance; }
    set dropShadowDistance(value: number) { this._dropShadowDistance = value; this.update(); }
    /** The font family, can be a single font name, or a list of names where the first is the preferred font. */
    get fontFamily(): string | string[] { return this._fontFamily; }
    set fontFamily(value: string | string[]) { this._fontFamily = value; this.update(); }
    /** The font size (as a number it converts to px, but as a string, equivalents are '26px','20pt','160%' or '1.6em') */
    get fontSize(): number { return this._fontSize; }
    set fontSize(value: number) { this._fontSize = value; this.update(); }
    /**
     * The font style.
     * @member {'normal'|'italic'|'oblique'}
     */
    get fontStyle(): TextStyleFontStyle { return this._fontStyle; }
    set fontStyle(value: TextStyleFontStyle) { this._fontStyle = value; this.update(); }
    /**
     * The font variant.
     * @member {'normal'|'small-caps'}
     */
    get fontVariant(): TextStyleFontVariant { return this._fontVariant; }
    set fontVariant(value: TextStyleFontVariant) { this._fontVariant = value; this.update(); }
    /**
     * The font weight.
     * @member {'normal'|'bold'|'bolder'|'lighter'|'100'|'200'|'300'|'400'|'500'|'600'|'700'|'800'|'900'}
     */
    get fontWeight(): TextStyleFontWeight { return this._fontWeight; }
    set fontWeight(value: TextStyleFontWeight) { this._fontWeight = value; this.update(); }
    /** The space between lines. */
    get leading(): number { return this._leading; }
    set leading(value: number) { this._leading = value; this.update(); }
    /** The amount of spacing between letters, default is 0. */
    get letterSpacing(): number { return this._letterSpacing; }
    set letterSpacing(value: number) { this._letterSpacing = value; this.update(); }
    /** The line height, a number that represents the vertical space that a letter uses. */
    get lineHeight(): number { return this._lineHeight; }
    set lineHeight(value: number) { this._lineHeight = value; this.update(); }
    /**
     * Occasionally some fonts are cropped. Adding some padding will prevent this from happening
     * by adding padding to all sides of the text.
     */
    get padding(): number { return this._padding; }
    set padding(value: number) { this._padding = value; this.update(); }

    /** Trim transparent borders. This is an expensive operation so only use this if you have to! */
    get trim(): boolean { return this._trim; }
    set trim(value: boolean) { this._trim = value; this.update(); }
    /**
     * The baseline of the text that is rendered.
     * @member {'alphabetic'|'top'|'hanging'|'middle'|'ideographic'|'bottom'}
     */
    get textBaseline(): TextStyleTextBaseline { return this._textBaseline; }
    set textBaseline(value: TextStyleTextBaseline) { this._textBaseline = value; this.update(); }
    /**
     * How newlines and spaces should be handled.
     * Default is 'pre' (preserve, preserve).
     *
     *  value       | New lines     |   Spaces
     *  ---         | ---           |   ---
     * 'normal'     | Collapse      |   Collapse
     * 'pre'        | Preserve      |   Preserve
     * 'pre-line'   | Preserve      |   Collapse
     * @member {'normal'|'pre'|'pre-line'}
     */
    get whiteSpace(): TextStyleWhiteSpace { return this._whiteSpace; }
    set whiteSpace(value: TextStyleWhiteSpace) { this._whiteSpace = value; this.update(); }
    /** Indicates if word wrap should be used. */
    get wordWrap(): boolean { return this._wordWrap; }
    set wordWrap(value: boolean) { this._wordWrap = value; this.update(); }
    /** The width at which text will wrap, it needs wordWrap to be set to true. */
    get wordWrapWidth(): number { return this._wordWrapWidth; }
    set wordWrapWidth(value: number) { this._wordWrapWidth = value; this.update(); }

    /** A fillstyle that will be used on the text e.g., 'red', '#00FF00'. */
    get fill(): FillStyleInputs
    {
        return this._originalFill;
    }

    set fill(value: FillStyleInputs)
    {
        if (value === this._originalFill) return;

        this._originalFill = value;
        this._fill = convertFillInputToFillStyle(value, GraphicsContext.defaultFillStyle);
        this.update();
    }

    /** A fillstyle that will be used on the text stroke, e.g., 'blue', '#FCFF00'. */
    get stroke(): FillStyleInputs
    {
        return this._originalStroke;
    }

    set stroke(value: FillStyleInputs)
    {
        if (value === this._originalFill) return;

        this._originalFill = value;
        this._stroke = convertFillInputToFillStyle(value, GraphicsContext.defaultStrokeStyle) as ConvertedStrokeStyle;
        this.update();
    }

    protected _generateKey(): string
    {
        this._styleKey = generateTextStyleKey(this);

        return this._styleKey;
    }

    public update()
    {
        this._styleKey = null;
        this.emit('update', this);
    }

    public reset()
    {
        const defaultStyle = TextStyle.defaultTextStyle;

        for (const key in defaultStyle)
        {
            this[key as keyof typeof this] = defaultStyle[key as keyof TextStyleOptions] as any;
        }
    }

    get styleKey()
    {
        return this._styleKey || this._generateKey();
    }

    /**
     * Creates a new TextStyle object with the same values as this one.
     * @returns New cloned TextStyle object
     */
    public clone(): TextStyle
    {
        return new TextStyle({
            align: this.align,
            breakWords: this.breakWords,
            dropShadow: this.dropShadow,
            dropShadowAlpha: this.dropShadowAlpha,
            dropShadowAngle: this.dropShadowAngle,
            dropShadowBlur: this.dropShadowBlur,
            dropShadowColor: this.dropShadowColor,
            dropShadowDistance: this.dropShadowDistance,
            fill: this._fill,
            fontFamily: this.fontFamily,
            fontSize: this.fontSize,
            fontStyle: this.fontStyle,
            fontVariant: this.fontVariant,
            fontWeight: this.fontWeight,
            leading: this.leading,
            letterSpacing: this.letterSpacing,
            lineHeight: this.lineHeight,
            padding: this.padding,
            stroke: this._stroke,
            textBaseline: this.textBaseline,
            whiteSpace: this.whiteSpace,
            wordWrap: this.wordWrap,
            wordWrapWidth: this.wordWrapWidth,
        });
    }

    /**
     * Destroys this text style.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.texture=false] - Should it destroy the texture of the this style
     * @param {boolean} [options.textureSource=false] - Should it destroy the textureSource of the this style
     */
    public destroy(options: TypeOrBool<TextureDestroyOptions> = false)
    {
        this.removeAllListeners();

        const destroyTexture = typeof options === 'boolean' ? options : options?.texture;

        if (destroyTexture)
        {
            const destroyTextureSource = typeof options === 'boolean' ? options : options?.textureSource;

            if (this._fill?.texture)
            {
                this._fill.texture.destroy(destroyTextureSource);
            }

            if ((this._originalFill as FillStyle)?.texture)
            {
                (this._originalFill as FillStyle).texture.destroy(destroyTextureSource);
            }

            if (this._stroke?.texture)
            {
                this._stroke.texture.destroy(destroyTextureSource);
            }

            if ((this._originalStroke as FillStyle)?.texture)
            {
                (this._originalStroke as FillStyle).texture.destroy(destroyTextureSource);
            }
        }

        this._fill = null;
        this._stroke = null;
        this._originalStroke = null;
        this._originalFill = null;
    }
}

function convertV7Tov8Style(style: TextStyleOptions)
{
    const oldStyle = style as any;

    if (oldStyle.strokeThickness)
    {
        deprecation(v8_0_0, 'strokeThickness is now a part of stroke');

        const color = oldStyle.stroke;

        style.stroke = {
            color,
            width: oldStyle.strokeThickness
        };
    }

    if (Array.isArray(oldStyle.fill))
    {
        deprecation(v8_0_0, 'gradient fill is now a fill pattern: `new FillGradient(...)`');

        const gradientFill = new FillGradient(0, 0, 0, (style.fontSize as number) * 1.7);

        const fills: number[] = oldStyle.fill.map((color: ColorSource) => Color.shared.setValue(color).toNumber());

        fills.forEach((number, index) =>
        {
            const ratio = oldStyle.fillGradientStops[index] ?? index / fills.length;

            gradientFill.addColorStop(ratio, number);
        });

        style.fill = {
            fill: gradientFill
        };
    }
}
