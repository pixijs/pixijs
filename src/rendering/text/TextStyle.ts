import EventEmitter from 'eventemitter3';
import { GraphicsContext } from '../graphics/shared/GraphicsContext';
import { convertFillInputToFillStyle } from '../graphics/shared/utils/convertFillInputToFillStyle';

import type { FillGradient } from '../graphics/shared/fill/FillGradient';
import type { DefaultFillStyle, FillStyle, FillStyleInputs, StrokeStyle } from '../graphics/shared/GraphicsContext';
import type { TextureDestroyOptions, TypeOrBool } from '../scene/destroyTypes';

export type TextStyleAlign = 'left' | 'center' | 'right' | 'justify';
export type TextStyleFill = string | string[] | number | number[] | CanvasGradient | CanvasPattern;
export type TextStyleFontStyle = 'normal' | 'italic' | 'oblique';
export type TextStyleFontVariant = 'normal' | 'small-caps';
// eslint-disable-next-line max-len
export type TextStyleFontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
export type TextStyleLineJoin = 'miter' | 'round' | 'bevel';
export type TextStyleTextBaseline = 'alphabetic' | 'top' | 'hanging' | 'middle' | 'ideographic' | 'bottom';
export type TextStyleWhiteSpace = 'normal' | 'pre' | 'pre-line';

export type TextDropShadow = {
    /** Set alpha for the drop shadow */
    alpha: number;
    /** Set a angle of the drop shadow */
    angle: number;
    /** Set a shadow blur radius */
    blur: number;
    /** A fill style to be used on the  e.g., 'red', '#00FF00' */
    color: string | number;
    /** Set a distance of the drop shadow */
    distance: number;
};

/**
 * Generic interface for TextStyle options.
 * @memberof PIXI
 */
export interface TextStyleOptions
{
    /**
     * Alignment for multiline text, does not affect single line text
     * @type {'left'|'center'|'right'|'justify'}
     */
    align: TextStyleAlign;
    /** Indicates if lines can be wrapped within words, it needs wordWrap to be set to true */
    breakWords: boolean;
    /** Set a drop shadow for the text */
    dropShadow?: boolean | TextDropShadow;
    /**
     * A canvas fillstyle that will be used on the text e.g., 'red', '#00FF00'.
     * Can be an array to create a gradient, e.g., `['#000000','#FFFFFF']`
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle|MDN}
     * @type {string|string[]|number|number[]|CanvasGradient|CanvasPattern}
     */
    fill: FillStyleInputs;
    /** The font family, can be a single font name, or a list of names where the first is the preferred font. */
    fontFamily: string | string[];
    /** The font size (as a number it converts to px, but as a string, equivalents are '26px','20pt','160%' or '1.6em') */
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
     * Occasionally some fonts are cropped. Adding some padding will prevent this from
     * happening by adding padding to all sides of the text.
     */
    padding: number;
    /** A canvas fillstyle that will be used on the text stroke, e.g., 'blue', '#FCFF00' */
    stroke: StrokeStyle | FillStyleInputs;
    /**
     * The baseline of the text that is rendered.
     * @type {'alphabetic'|'top'|'hanging'|'middle'|'ideographic'|'bottom'}
     */
    textBaseline: TextStyleTextBaseline;
    /** See {@link PIXI.TextStyle.trim} */
    trim: false,
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

const valuesToIterateForKeys = [
    'fontFamily',
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'breakWords',
    'align',
    'leading',
    'letterSpacing',
    'lineHeight',
    'textBaseline',
    'whiteSpace',
    'wordWrap',
    'wordWrapWidth',
    'padding',
];

export class TextStyle extends EventEmitter<{
    update: TextDropShadow
}>
{
    static defaultTextStyle: TextStyleOptions = {
        /**
         * See {@link PIXI.TextStyle.align}
         * @type {'left'|'center'|'right'|'justify'}
         */
        align: 'left',
        /** See {@link PIXI.TextStyle.breakWords} */
        breakWords: false,
        /** See {@link PIXI.TextStyle.dropShadow} */
        dropShadow:  {
            alpha: 1,
            angle: Math.PI / 6,
            blur: 0,
            color: 'black',
            distance: 5,
        },
        /**
         * See {@link PIXI.TextStyle.fill}
         * @type {string|string[]|number|number[]|CanvasGradient|CanvasPattern}
         */
        fill: 'black',
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
        /** See {@link PIXI.TextStyle.padding} */
        padding: 0,
        /**
         * See {@link PIXI.TextStyle.stroke}
         * @type {string|number}
         */
        stroke: null,
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

    // colors!!
    _fill: FillStyle;
    _originalFill: FillStyleInputs;

    _stroke: StrokeStyle;
    _originalStroke: FillStyleInputs | StrokeStyle;

    dropShadow: TextDropShadow;

    fontFamily: string | string[];
    fontSize: number;
    fontStyle: TextStyleFontStyle;
    fontVariant: TextStyleFontVariant;
    fontWeight: TextStyleFontWeight;

    breakWords: boolean;
    align: TextStyleAlign;
    leading: number;
    letterSpacing: number;
    lineHeight: number;

    textBaseline: TextStyleTextBaseline;
    whiteSpace: TextStyleWhiteSpace;
    wordWrap: boolean;
    wordWrapWidth: number;

    padding: number;

    private _styleKey: string;

    constructor(style: Partial<TextStyleOptions> = {})
    {
        super();

        // TODO getter setters...

        const fullStyle = { ...TextStyle.defaultTextStyle, ...style };

        for (const key in TextStyle.defaultTextStyle)
        {
            const thisKey = key as keyof typeof this;

            this[thisKey] = fullStyle[key as keyof TextStyleOptions] as any;
        }

        this.dropShadow = null;

        if (typeof fullStyle.fill === 'string')
        {
            // eg '34px' to number
            this.fontSize = parseInt(fullStyle.fontSize as string, 10);
        }
        else
        {
            this.fontSize = fullStyle.fontSize as number;
        }

        if (style.dropShadow)
        {
            // is true / false
            if (style.dropShadow instanceof Boolean)
            {
                if (style.dropShadow === true)
                {
                    this.dropShadow = {
                        ...TextStyle.defaultTextStyle.dropShadow as TextDropShadow
                    };
                }
            }
            else
            {
                this.dropShadow = {
                    ...TextStyle.defaultTextStyle.dropShadow as TextDropShadow,
                    ...style.dropShadow as TextDropShadow
                };
            }
        }

        this.update();
    }

    generateKey(): string
    {
        const key = [];

        let index = 0;

        for (let i = 0; i < valuesToIterateForKeys.length; i++)
        {
            const prop = valuesToIterateForKeys[i];

            key[index++] = this[prop as keyof typeof this];
        }

        index = addFillStyleKey(this._fill, key as string[], index);
        index = addStokeStyleKey(this._stroke, key as string[], index);

        this._styleKey = key.join('-');

        return this._styleKey;
    }

    update()
    {
        this._styleKey = null;
        this.emit('update', this);
    }

    get fill(): FillStyleInputs
    {
        return this._originalFill;
    }

    set fill(value: FillStyleInputs)
    {
        if (value === this._fill) return;

        this._originalFill = value;

        this._fill = convertFillInputToFillStyle(value, GraphicsContext.defaultFillStyle);
    }

    get stroke(): FillStyleInputs | StrokeStyle
    {
        return this._originalStroke;
    }

    set stroke(value: FillStyleInputs | StrokeStyle)
    {
        if (value === this._fill) return;

        this._originalFill = value;

        this._stroke = convertFillInputToFillStyle(value, GraphicsContext.defaultStrokeStyle);
    }

    get styleKey()
    {
        return this._styleKey || this.generateKey();
    }

    clone(): TextStyle
    {
        return new TextStyle({
            align: this.align,
            breakWords: this.breakWords,
            dropShadow: this.dropShadow,
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

            if ((this._originalFill as DefaultFillStyle)?.texture)
            {
                (this._originalFill as DefaultFillStyle).texture.destroy(destroyTextureSource);
            }

            if (this._stroke?.texture)
            {
                this._stroke.texture.destroy(destroyTextureSource);
            }

            if ((this._originalStroke as DefaultFillStyle)?.texture)
            {
                (this._originalStroke as DefaultFillStyle).texture.destroy(destroyTextureSource);
            }
        }

        this._fill = null;
        this._stroke = null;
        this.dropShadow = null;
        this._originalStroke = null;
        this._originalFill = null;
    }
}

function addFillStyleKey(fillStyle: FillStyle, key: (number | string)[], index: number)
{
    if (!fillStyle) return index;

    key[index++] = fillStyle.color;
    key[index++] = fillStyle.alpha;
    key[index++] = (fillStyle.fill as FillGradient)?.uid;

    return index;
}

function addStokeStyleKey(strokeStyle: StrokeStyle, key: (number | string)[], index: number)
{
    if (!strokeStyle) return index;

    index = addFillStyleKey(strokeStyle, key, index);

    key[index++] = strokeStyle.width;
    key[index++] = strokeStyle.alignment;
    key[index++] = strokeStyle.cap;
    key[index++] = strokeStyle.join;
    key[index++] = strokeStyle.miterLimit;

    return index;
}

