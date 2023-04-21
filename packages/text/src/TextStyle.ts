// disabling eslint for now, going to rewrite this in v5
/* eslint-disable */

import { TEXT_GRADIENT } from './const';
import { Color } from '@pixi/core';

export type TextStyleAlign = 'left'|'center'|'right'|'justify';
export type TextStyleFill = string|string[]|number|number[]|CanvasGradient|CanvasPattern;
export type TextStyleFontStyle = 'normal'|'italic'|'oblique';
export type TextStyleFontVariant = 'normal'|'small-caps';
export type TextStyleFontWeight = 'normal'|'bold'|'bolder'|'lighter'|'100'|'200'|'300'|'400'|'500'|'600'|'700'|'800'|'900';
export type TextStyleLineJoin = 'miter'|'round'|'bevel';
export type TextStyleTextBaseline = 'alphabetic'|'top'|'hanging'|'middle'|'ideographic'|'bottom';
export type TextStyleWhiteSpace = 'normal'|'pre'|'pre-line';

/**
 * Generic interface for TextStyle options.
 * @memberof PIXI
 */
export interface ITextStyle {
    /**
     * Alignment for multiline text, does not affect single line text
     * @type {'left'|'center'|'right'|'justify'}
     */
    align: TextStyleAlign;
    /** Indicates if lines can be wrapped within words, it needs wordWrap to be set to true */
    breakWords: boolean;
    /** Set a drop shadow for the text */
    dropShadow: boolean;
    /** Set alpha for the drop shadow */
    dropShadowAlpha: number;
    /** Set a angle of the drop shadow */
    dropShadowAngle: number;
    /** Set a shadow blur radius */
    dropShadowBlur: number;
    /** A fill style to be used on the dropshadow e.g., 'red', '#00FF00' */
    dropShadowColor: string|number;
    /** Set a distance of the drop shadow */
    dropShadowDistance: number;
    /**
     * A canvas fillstyle that will be used on the text e.g., 'red', '#00FF00'.
     * Can be an array to create a gradient, e.g., `['#000000','#FFFFFF']`
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle|MDN}
     * @type {string|string[]|number|number[]|CanvasGradient|CanvasPattern}
     */
    fill: TextStyleFill;
    /**
     * If fill is an array of colours to create a gradient, this can change the
     * type/direction of the gradient. See {@link PIXI.TEXT_GRADIENT}
     * @type {PIXI.TEXT_GRADIENT}
     */
    fillGradientType: TEXT_GRADIENT;
    /**
     * If fill is an array of colours to create a gradient, this array can set
     * the stop points (numbers between 0 and 1) for the color, overriding the
     * default behaviour of evenly spacing them.
     */
    fillGradientStops: number[];
    /**
     * The font family, can be a single font name, or a list of names where the first
     * is the preferred font.
     */
    fontFamily: string | string[];
    /**
     * The font size (as a number it converts to px, but as a string,
     * equivalents are '26px','20pt','160%' or '1.6em')
     */
    fontSize: number | string;
    /**
     * The font style.
     * @type {'normal'|'italic'|'oblique'}
     */
    fontStyle: TextStyleFontStyle;
    /**
     * The font variant.
     * @type {'normal'|'small-caps'}
     */
    fontVariant: TextStyleFontVariant;
    /**
     * The font weight.
     * @type {'normal'|'bold'|'bolder'|'lighter'|'100'|'200'|'300'|'400'|'500'|'600'|'700'|'800'|'900'}
     */
    fontWeight: TextStyleFontWeight;
    /** The height of the line, a number that represents the vertical space that a letter uses. */
    leading: number;
    /** The amount of spacing between letters, default is 0 */
    letterSpacing: number;
    /** The line height, a number that represents the vertical space that a letter uses */
    lineHeight: number;
    /**
     * The lineJoin property sets the type of corner created, it can resolve
     * spiked text issues. Possible values "miter" (creates a sharp corner),
     * "round" (creates a round corner) or "bevel" (creates a squared corner).
     * @type {'miter'|'round'|'bevel'}
     */
    lineJoin: TextStyleLineJoin;
    /**
     * The miter limit to use when using the 'miter' lineJoin mode. This can reduce
     * or increase the spikiness of rendered text.
     */
    miterLimit: number;
    /**
     * Occasionally some fonts are cropped. Adding some padding will prevent this from
     * happening by adding padding to all sides of the text.
     */
    padding: number;
    /** A canvas fillstyle that will be used on the text stroke, e.g., 'blue', '#FCFF00' */
    stroke: string|number;
    /** A number that represents the thickness of the stroke. A value of 0 will disable stroke. */
    strokeThickness: number;
    /**
     * The baseline of the text that is rendered.
     * @type {'alphabetic'|'top'|'hanging'|'middle'|'ideographic'|'bottom'}
     */
    textBaseline: TextStyleTextBaseline;
    /** Trim transparent borders */
    trim: boolean;
    /**
     * Determines whether newlines & spaces are collapsed or preserved "normal"
     * (collapse, collapse), "pre" (preserve, preserve) | "pre-line" (preserve,
     * collapse). It needs wordWrap to be set to true.
     * @type {'normal'|'pre'|'pre-line'}
     */
    whiteSpace: TextStyleWhiteSpace;
    /** Indicates if word wrap should be used */
    wordWrap: boolean;
    /** The width at which text will wrap, it needs wordWrap to be set to true */
    wordWrapWidth: number;
}

const genericFontFamilies = [
    'serif',
    'sans-serif',
    'monospace',
    'cursive',
    'fantasy',
    'system-ui',
];

/**
 * A TextStyle Object contains information to decorate a Text objects.
 *
 * An instance can be shared between multiple Text objects; then changing the style will update all text objects using it.
 *
 * A tool can be used to generate a text style [here](https://pixijs.io/pixi-text-style).
 *
 * @memberof PIXI
 * @example
 * import { TextStyle } from 'pixi.js';
 * const style = new TextStyle({
 *   fontFamily: ['Helvetica', 'Arial', 'sans-serif'],
 *   fontSize: 36,
 * });
 */
export class TextStyle implements ITextStyle
{
    /**
     * Default style options used for all TextStyle instances.
     * @type {PIXI.ITextStyle}
     */
    public static defaultStyle: ITextStyle = {
        /**
         * See {@link PIXI.TextStyle.align}
         * @type {'left'|'center'|'right'|'justify'}
         */
        align: 'left',
        /** See {@link PIXI.TextStyle.breakWords} */
        breakWords: false,
        /** See {@link PIXI.TextStyle.dropShadow} */
        dropShadow: false,
        /** See {@link PIXI.TextStyle.dropShadowAlpha} */
        dropShadowAlpha: 1,
        /**
         * See {@link PIXI.TextStyle.dropShadowAngle}
         * @type {number}
         * @default Math.PI / 6
         */
        dropShadowAngle: Math.PI / 6,
        /** See {@link PIXI.TextStyle.dropShadowBlur} */
        dropShadowBlur: 0,
        /**
         * See {@link PIXI.TextStyle.dropShadowColor}
         * @type {string|number}
         */
        dropShadowColor: 'black',
        /** See {@link PIXI.TextStyle.dropShadowDistance} */
        dropShadowDistance: 5,
        /**
         * See {@link PIXI.TextStyle.fill}
         * @type {string|string[]|number|number[]|CanvasGradient|CanvasPattern}
         */
        fill: 'black',
        /**
         * See {@link PIXI.TextStyle.fillGradientType}
         * @type {PIXI.TEXT_GRADIENT}
         * @default PIXI.TEXT_GRADIENT.LINEAR_VERTICAL
         */
        fillGradientType: TEXT_GRADIENT.LINEAR_VERTICAL,
        /**
         * See {@link PIXI.TextStyle.fillGradientStops}
         * @type {number[]}
         * @default []
         */
        fillGradientStops: [],
        /**
         * See {@link PIXI.TextStyle.fontFamily}
         * @type {string|string[]}
         */
        fontFamily: 'Arial',
        /**
         * See {@link PIXI.TextStyle.fontSize}
         * @type {number|string} 
         */
        fontSize: 26,
        /**
         * See {@link PIXI.TextStyle.fontStyle}
         * @type {'normal'|'italic'|'oblique'}
         */
        fontStyle: 'normal',
        /**
         * See {@link PIXI.TextStyle.fontVariant}
         * @type {'normal'|'small-caps'}
         */
        fontVariant: 'normal',
        /**
         * See {@link PIXI.TextStyle.fontWeight}
         * @type {'normal'|'bold'|'bolder'|'lighter'|'100'|'200'|'300'|'400'|'500'|'600'|'700'|'800'|'900'}
         */
        fontWeight: 'normal',
        /** See {@link PIXI.TextStyle.leading} */
        leading: 0,
        /** See {@link PIXI.TextStyle.letterSpacing} */
        letterSpacing: 0,
        /** See {@link PIXI.TextStyle.lineHeight} */
        lineHeight: 0,
        /**
         * See {@link PIXI.TextStyle.lineJoin}
         * @type {'miter'|'round'|'bevel'}
         */
        lineJoin: 'miter',
        /** See {@link PIXI.TextStyle.miterLimit} */
        miterLimit: 10,
        /** See {@link PIXI.TextStyle.padding} */
        padding: 0,
        /**
         * See {@link PIXI.TextStyle.stroke}
         * @type {string|number}
         */
        stroke: 'black',
        /** See {@link PIXI.TextStyle.strokeThickness} */
        strokeThickness: 0,
        /**
         * See {@link PIXI.TextStyle.textBaseline} 
         * @type {'alphabetic'|'top'|'hanging'|'middle'|'ideographic'|'bottom'}
         */
        textBaseline: 'alphabetic',
        /** See {@link PIXI.TextStyle.trim} */
        trim: false,
        /**
         * See {@link PIXI.TextStyle.whiteSpace}
         * @type {'normal'|'pre'|'pre-line'}
         */
        whiteSpace: 'pre',
        /** See {@link PIXI.TextStyle.wordWrap} */
        wordWrap: false,
        /** See {@link PIXI.TextStyle.wordWrapWidth} */
        wordWrapWidth: 100,
    };

    public styleID: number;

    protected _align: TextStyleAlign;
    protected _breakWords: boolean;
    protected _dropShadow: boolean;
    protected _dropShadowAlpha: number;
    protected _dropShadowAngle: number;
    protected _dropShadowBlur: number;
    protected _dropShadowColor: string|number;
    protected _dropShadowDistance: number;
    protected _fill: TextStyleFill;
    protected _fillGradientType: TEXT_GRADIENT;
    protected _fillGradientStops: number[];
    protected _fontFamily: string|string[];
    protected _fontSize: number|string;
    protected _fontStyle: TextStyleFontStyle;
    protected _fontVariant: TextStyleFontVariant;
    protected _fontWeight: TextStyleFontWeight;
    protected _letterSpacing: number;
    protected _lineHeight: number;
    protected _lineJoin: TextStyleLineJoin;
    protected _miterLimit: number;
    protected _padding: number;
    protected _stroke: string|number;
    protected _strokeThickness: number;
    protected _textBaseline: TextStyleTextBaseline;
    protected _trim: boolean;
    protected _whiteSpace: TextStyleWhiteSpace;
    protected _wordWrap: boolean;
    protected _wordWrapWidth: number;
    protected _leading: number;

    /**
     * @param style - TextStyle properties to be set on the text. See {@link PIXI.TextStyle.defaultStyle}
     *       for the default values.
     */
    constructor(style?: Partial<ITextStyle>)
    {
        this.styleID = 0;

        this.reset();

        deepCopyProperties(this, style, style);
    }

    /**
     * Creates a new TextStyle object with the same values as this one.
     * Note that the only the properties of the object are cloned.
     *
     * @return New cloned TextStyle object
     */
    public clone(): TextStyle
    {
        const clonedProperties: Partial<ITextStyle> = {};

        deepCopyProperties(clonedProperties, this, TextStyle.defaultStyle);

        return new TextStyle(clonedProperties);
    }

    /** Resets all properties to the defaults specified in TextStyle.prototype._default */
    public reset(): void
    {
        deepCopyProperties(this, TextStyle.defaultStyle, TextStyle.defaultStyle);
    }

    /**
     * Alignment for multiline text, does not affect single line text.
     *
     * @member {'left'|'center'|'right'|'justify'}
     */
    get align(): TextStyleAlign
    {
        return this._align;
    }
    set align(align: TextStyleAlign)
    {
        if (this._align !== align)
        {
            this._align = align;
            this.styleID++;
        }
    }

    /** Indicates if lines can be wrapped within words, it needs wordWrap to be set to true. */
    get breakWords(): boolean
    {
        return this._breakWords;
    }
    set breakWords(breakWords: boolean)
    {
        if (this._breakWords !== breakWords)
        {
            this._breakWords = breakWords;
            this.styleID++;
        }
    }

    /** Set a drop shadow for the text. */
    get dropShadow(): boolean
    {
        return this._dropShadow;
    }
    set dropShadow(dropShadow: boolean)
    {
        if (this._dropShadow !== dropShadow)
        {
            this._dropShadow = dropShadow;
            this.styleID++;
        }
    }

    /** Set alpha for the drop shadow. */
    get dropShadowAlpha(): number
    {
        return this._dropShadowAlpha;
    }
    set dropShadowAlpha(dropShadowAlpha: number)
    {
        if (this._dropShadowAlpha !== dropShadowAlpha)
        {
            this._dropShadowAlpha = dropShadowAlpha;
            this.styleID++;
        }
    }

    /** Set a angle of the drop shadow. */
    get dropShadowAngle(): number
    {
        return this._dropShadowAngle;
    }
    set dropShadowAngle(dropShadowAngle: number)
    {
        if (this._dropShadowAngle !== dropShadowAngle)
        {
            this._dropShadowAngle = dropShadowAngle;
            this.styleID++;
        }
    }

    /** Set a shadow blur radius. */
    get dropShadowBlur(): number
    {
        return this._dropShadowBlur;
    }
    set dropShadowBlur(dropShadowBlur: number)
    {
        if (this._dropShadowBlur !== dropShadowBlur)
        {
            this._dropShadowBlur = dropShadowBlur;
            this.styleID++;
        }
    }

    /** A fill style to be used on the dropshadow e.g., 'red', '#00FF00'. */
    get dropShadowColor(): number | string
    {
        return this._dropShadowColor;
    }
    set dropShadowColor(dropShadowColor: number | string)
    {
        const outputColor = getColor(dropShadowColor);
        if (this._dropShadowColor !== outputColor)
        {
            this._dropShadowColor = outputColor;
            this.styleID++;
        }
    }

    /** Set a distance of the drop shadow. */
    get dropShadowDistance(): number
    {
        return this._dropShadowDistance;
    }
    set dropShadowDistance(dropShadowDistance: number)
    {
        if (this._dropShadowDistance !== dropShadowDistance)
        {
            this._dropShadowDistance = dropShadowDistance;
            this.styleID++;
        }
    }

    /**
     * A canvas fillstyle that will be used on the text e.g., 'red', '#00FF00'.
     *
     * Can be an array to create a gradient e.g., `['#000000','#FFFFFF']`
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle|MDN}
     *
     * @member {string|string[]|number|number[]|CanvasGradient|CanvasPattern}
     */
    get fill(): TextStyleFill
    {
        return this._fill;
    }
    set fill(fill: TextStyleFill)
    {
        // TODO: Can't have different types for getter and setter. The getter shouldn't have the number type as
        //       the setter converts to string. See this thread for more details:
        //       https://github.com/microsoft/TypeScript/issues/2521
        // TODO: Not sure if getColor works properly with CanvasGradient and/or CanvasPattern, can't pass in
        //       without casting here.
        const outputColor = getColor(fill as any);
        if (this._fill !== outputColor)
        {
            this._fill = outputColor;
            this.styleID++;
        }
    }

    /**
     * If fill is an array of colours to create a gradient, this can change the type/direction of the gradient.
     *
     * @type {PIXI.TEXT_GRADIENT}
     */
    get fillGradientType(): TEXT_GRADIENT
    {
        return this._fillGradientType;
    }
    set fillGradientType(fillGradientType: TEXT_GRADIENT)
    {
        if (this._fillGradientType !== fillGradientType)
        {
            this._fillGradientType = fillGradientType;
            this.styleID++;
        }
    }

    /**
     * If fill is an array of colours to create a gradient, this array can set the stop points
     * (numbers between 0 and 1) for the color, overriding the default behaviour of evenly spacing them.
     */
    get fillGradientStops(): number[]
    {
        return this._fillGradientStops;
    }
    set fillGradientStops(fillGradientStops: number[])
    {
        if (!areArraysEqual(this._fillGradientStops,fillGradientStops))
        {
            this._fillGradientStops = fillGradientStops;
            this.styleID++;
        }
    }

    /**
     * The font family, can be a single font name, or a list of names where the first
     * is the preferred font.
     */
    get fontFamily(): string | string[]
    {
        return this._fontFamily;
    }
    set fontFamily(fontFamily: string | string[])
    {
        if (this.fontFamily !== fontFamily)
        {
            this._fontFamily = fontFamily;
            this.styleID++;
        }
    }

    /**
     * The font size
     * (as a number it converts to px, but as a string, equivalents are '26px','20pt','160%' or '1.6em')
     */
    get fontSize(): number | string
    {
        return this._fontSize;
    }
    set fontSize(fontSize: number | string)
    {
        if (this._fontSize !== fontSize)
        {
            this._fontSize = fontSize;
            this.styleID++;
        }
    }

    /**
     * The font style.
     *
     * @member {'normal'|'italic'|'oblique'}
     */
    get fontStyle(): TextStyleFontStyle
    {
        return this._fontStyle;
    }
    set fontStyle(fontStyle: TextStyleFontStyle)
    {
        if (this._fontStyle !== fontStyle)
        {
            this._fontStyle = fontStyle;
            this.styleID++;
        }
    }

    /**
     * The font variant.
     *
     * @member {'normal'|'small-caps'}
     */
    get fontVariant(): TextStyleFontVariant
    {
        return this._fontVariant;
    }
    set fontVariant(fontVariant: TextStyleFontVariant)
    {
        if (this._fontVariant !== fontVariant)
        {
            this._fontVariant = fontVariant;
            this.styleID++;
        }
    }

    /**
     * The font weight.
     *
     * @member {'normal'|'bold'|'bolder'|'lighter'|'100'|'200'|'300'|'400'|'500'|'600'|'700'|'800'|'900'}
     */
    get fontWeight(): TextStyleFontWeight
    {
        return this._fontWeight;
    }
    set fontWeight(fontWeight: TextStyleFontWeight)
    {
        if (this._fontWeight !== fontWeight)
        {
            this._fontWeight = fontWeight;
            this.styleID++;
        }
    }

    /** The amount of spacing between letters, default is 0. */
    get letterSpacing(): number
    {
        return this._letterSpacing;
    }
    set letterSpacing(letterSpacing: number)
    {
        if (this._letterSpacing !== letterSpacing)
        {
            this._letterSpacing = letterSpacing;
            this.styleID++;
        }
    }

    /** The line height, a number that represents the vertical space that a letter uses. */
    get lineHeight(): number
    {
        return this._lineHeight;
    }
    set lineHeight(lineHeight: number)
    {
        if (this._lineHeight !== lineHeight)
        {
            this._lineHeight = lineHeight;
            this.styleID++;
        }
    }

    /** The space between lines. */
    get leading(): number
    {
        return this._leading;
    }
    set leading(leading: number)
    {
        if (this._leading !== leading)
        {
            this._leading = leading;
            this.styleID++;
        }
    }

    /**
     * The lineJoin property sets the type of corner created, it can resolve spiked text issues.
     * Default is 'miter' (creates a sharp corner).
     *
     * @member {'miter'|'round'|'bevel'}
     */
    get lineJoin(): TextStyleLineJoin
    {
        return this._lineJoin;
    }
    set lineJoin(lineJoin: TextStyleLineJoin)
    {
        if (this._lineJoin !== lineJoin)
        {
            this._lineJoin = lineJoin;
            this.styleID++;
        }
    }

    /**
     * The miter limit to use when using the 'miter' lineJoin mode.
     *
     * This can reduce or increase the spikiness of rendered text.
     */
    get miterLimit(): number
    {
        return this._miterLimit;
    }
    set miterLimit(miterLimit: number)
    {
        if (this._miterLimit !== miterLimit)
        {
            this._miterLimit = miterLimit;
            this.styleID++;
        }
    }

    /**
     * Occasionally some fonts are cropped. Adding some padding will prevent this from happening
     * by adding padding to all sides of the text.
     */
    get padding(): number
    {
        return this._padding;
    }
    set padding(padding: number)
    {
        if (this._padding !== padding)
        {
            this._padding = padding;
            this.styleID++;
        }
    }

    /**
     * A canvas fillstyle that will be used on the text stroke, e.g., 'blue', '#FCFF00'
     */
    get stroke(): string | number
    {
        return this._stroke;
    }
    set stroke(stroke: string | number)
    {
        // TODO: Can't have different types for getter and setter. The getter shouldn't have the number type as
        //       the setter converts to string. See this thread for more details:
        //       https://github.com/microsoft/TypeScript/issues/2521
        const outputColor = getColor(stroke);
        if (this._stroke !== outputColor)
        {
            this._stroke = outputColor;
            this.styleID++;
        }
    }

    /**
     * A number that represents the thickness of the stroke.
     *
     * @default 0
     */
    get strokeThickness(): number
    {
        return this._strokeThickness;
    }
    set strokeThickness(strokeThickness: number)
    {
        if (this._strokeThickness !== strokeThickness)
        {
            this._strokeThickness = strokeThickness;
            this.styleID++;
        }
    }

    /**
     * The baseline of the text that is rendered.
     *
     * @member {'alphabetic'|'top'|'hanging'|'middle'|'ideographic'|'bottom'}
     */
    get textBaseline(): TextStyleTextBaseline
    {
        return this._textBaseline;
    }
    set textBaseline(textBaseline: TextStyleTextBaseline)
    {
        if (this._textBaseline !== textBaseline)
        {
            this._textBaseline = textBaseline;
            this.styleID++;
        }
    }

    /** Trim transparent borders. */
    get trim(): boolean
    {
        return this._trim;
    }
    set trim(trim: boolean)
    {
        if (this._trim !== trim)
        {
            this._trim = trim;
            this.styleID++;
        }
    }

    /**
     * How newlines and spaces should be handled.
     * Default is 'pre' (preserve, preserve).
     *
     *  value       | New lines     |   Spaces
     *  ---         | ---           |   ---
     * 'normal'     | Collapse      |   Collapse
     * 'pre'        | Preserve      |   Preserve
     * 'pre-line'   | Preserve      |   Collapse
     *
     * @member {'normal'|'pre'|'pre-line'}
     */
    get whiteSpace(): TextStyleWhiteSpace
    {
        return this._whiteSpace;
    }
    set whiteSpace(whiteSpace: TextStyleWhiteSpace)
    {
        if (this._whiteSpace !== whiteSpace)
        {
            this._whiteSpace = whiteSpace;
            this.styleID++;
        }
    }

    /** Indicates if word wrap should be used. */
    get wordWrap(): boolean
    {
        return this._wordWrap;
    }
    set wordWrap(wordWrap: boolean)
    {
        if (this._wordWrap !== wordWrap)
        {
            this._wordWrap = wordWrap;
            this.styleID++;
        }
    }

    /** The width at which text will wrap, it needs wordWrap to be set to true. */
    get wordWrapWidth(): number
    {
        return this._wordWrapWidth;
    }
    set wordWrapWidth(wordWrapWidth: number)
    {
        if (this._wordWrapWidth !== wordWrapWidth)
        {
            this._wordWrapWidth = wordWrapWidth;
            this.styleID++;
        }
    }

    /**
     * Generates a font style string to use for `TextMetrics.measureFont()`.
     *
     * @return Font style string, for passing to `TextMetrics.measureFont()`
     */
    public toFontString(): string
    {
        // build canvas api font setting from individual components. Convert a numeric this.fontSize to px
        const fontSizeString = (typeof this.fontSize === 'number') ? `${this.fontSize}px` : this.fontSize;

        // Clean-up fontFamily property by quoting each font name
        // this will support font names with spaces
        let fontFamilies: string|string[] = this.fontFamily;

        if (!Array.isArray(this.fontFamily))
        {
            fontFamilies = this.fontFamily.split(',');
        }

        for (let i = fontFamilies.length - 1; i >= 0; i--)
        {
            // Trim any extra white-space
            let fontFamily = fontFamilies[i].trim();

            // Check if font already contains strings
            if (!(/([\"\'])[^\'\"]+\1/).test(fontFamily) && !genericFontFamilies.includes(fontFamily))
            {
                fontFamily = `"${fontFamily}"`;
            }
            (fontFamilies as string[])[i] = fontFamily;
        }

        return `${this.fontStyle} ${this.fontVariant} ${this.fontWeight} ${fontSizeString} ${(fontFamilies as string[]).join(',')}`;
    }
}

/**
 * Utility function to convert hexadecimal colors to strings, and simply return the color if it's a string.
 * This version can also convert array of colors
 * @private
 * @param color
 * @return The color as a string.
 */
function getColor(color: (string|number)[]): string[];
function getColor(color: string|number): string;
function getColor(color: string|number|(string|number)[]): string|string[]
{
    const temp = Color.shared;

    const format = (color: string | number) => {
        const res = temp.setValue(color);
        return res.alpha === 1 ? res.toHex() : res.toRgbaString();
    }

    if (!Array.isArray(color))
    {
        return format(color);
    }
    else
    {
        return color.map(format);
    }
}

/**
 * Utility function to convert hexadecimal colors to strings, and simply return the color if it's a string.
 * This version can also convert array of colors
 * @private
 * @param array1 - First array to compare
 * @param array2 - Second array to compare
 * @return Do the arrays contain the same values in the same order
 */
function areArraysEqual<T>(array1: T[], array2: T[]): boolean
{
    if (!Array.isArray(array1) || !Array.isArray(array2))
    {
        return false;
    }

    if (array1.length !== array2.length)
    {
        return false;
    }

    for (let i = 0; i < array1.length; ++i)
    {
        if (array1[i] !== array2[i])
        {
            return false;
        }
    }

    return true;
}

/**
 * Utility function to ensure that object properties are copied by value, and not by reference
 * @private
 * @param target - Target object to copy properties into
 * @param source - Source object for the properties to copy
 * @param propertyObj - Object containing properties names we want to loop over
 */
function deepCopyProperties(target: Record<string, any>, source: Record<string, any>, propertyObj: Record<string, any>): void {
    for (const prop in propertyObj) {
        if (Array.isArray(source[prop])) {
            target[prop] = source[prop].slice();
        } else {
            target[prop] = source[prop];
        }
    }
}
