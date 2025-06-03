import EventEmitter from 'eventemitter3';
import { Color, type ColorSource } from '../../color/Color';
import { type Filter } from '../../filters/Filter';
import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { FillGradient } from '../graphics/shared/fill/FillGradient';
import { FillPattern } from '../graphics/shared/fill/FillPattern';
import { GraphicsContext } from '../graphics/shared/GraphicsContext';
import {
    toFillStyle,
    toStrokeStyle
} from '../graphics/shared/utils/convertFillInputToFillStyle';
import { generateTextStyleKey } from './utils/generateTextStyleKey';

import type { TextureDestroyOptions, TypeOrBool } from '../container/destroyTypes';
import type {
    ConvertedFillStyle,
    ConvertedStrokeStyle,
    FillInput,
    FillStyle,
    StrokeInput,
    StrokeStyle
} from '../graphics/shared/FillTypes';

/**
 * The alignment of the text.
 *
 * - 'left': Aligns text to the left edge.
 * - 'center': Centers text horizontally.
 * - 'right': Aligns text to the right edge.
 * - 'justify': Justifies text, aligning both left and right edges.
 * @example
 * ```ts
 * import { TextStyle } from 'pixi.js';
 * const style = new TextStyle({
 *   align: 'center', // or 'left', 'right', 'justify'
 * });
 * ```
 * @category text
 * @standard
 */
export type TextStyleAlign = 'left' | 'center' | 'right' | 'justify';
/**
 * The fill style input for text styles.
 *
 * This can be:
 * - A color string like 'red', '#00FF00', or 'rgba(255,0,0,0.5)'
 * - A hex number like 0xff0000 for red
 * - A FillStyle object with properties like { color: 0xff0000, alpha: 0.5 }
 * - A FillGradient for gradient fills
 * - A FillPattern for pattern/texture fills
 * @example
 * ```ts
 * // Simple Fills
 * new TextStyle({ fill: 'red' }); // Color string
 * new TextStyle({ fill: 0x00ff00 }); // Hex color
 * new TextStyle({ fill: 'rgb(255,0,0)' }); // RGB string
 * // Gradients
 * new TextStyle({
 *     fill: new FillGradient({
 *         end: { x: 1, y: 1 },
 *         stops: [
 *             { color: 0xff0000, offset: 0 }, // Red at start
 *             { color: 0x0000ff, offset: 1 }, // Blue at end
 *         ]
 *     }),
 * });
 * // Patterns
 * new TextStyle({
 *    fill: new FillPattern(Assets.get('pattern.png'))
 * });
 * ```
 * @category text
 * @standard
 */
export type TextStyleFill = string | string[] | number | number[] | CanvasGradient | CanvasPattern;
/**
 * The font style input for text styles. Controls the slant or italicization of the text.
 * @example
 * ```ts
 * // Create text with normal font style
 * const normalText = new Text({
 *     text: 'Normal Style Text',
 *     style: {
 *         fontStyle: 'normal',
 *         fontSize: 24
 *     }
 * });
 *
 * // Create italic text
 * const italicText = new Text({
 *     text: 'Italic Style Text',
 *     style: {
 *         fontStyle: 'italic',
 *         fontSize: 24,
 *         fontFamily: 'Arial'
 *     }
 * });
 *
 * // Create oblique text
 * const obliqueText = new Text({
 *     text: 'Oblique Style Text',
 *     style: {
 *         fontStyle: 'oblique',
 *         fontSize: 24,
 *         fontFamily: 'Times New Roman'
 *     }
 * });
 *
 * // Dynamic style changes
 * let isItalic = false;
 * text.style = {
 *     ...text.style,
 *     fontStyle: isItalic ? 'italic' : 'normal'
 * };
 * ```
 *
 * Supported values:
 * - 'normal': Regular upright text with no slant
 * - 'italic': True italics using specifically designed italic glyphs
 * - 'oblique': Slanted version of the regular glyphs
 * @remarks
 * - 'italic' uses specially designed glyphs with cursive characteristics
 * - 'oblique' is a mechanical slant of the normal glyphs
 * - Not all fonts include true italic designs; some may fall back to oblique
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/font-style | MDN font-style}
 * @category text
 * @standard
 */
export type TextStyleFontStyle = 'normal' | 'italic' | 'oblique';
/**
 * The font variant input for text styles. Controls the capitalization and presentation of letters.
 * Used to enable special rendering like small caps.
 * @example
 * ```ts
 * // Create text with normal font variant
 * const normalText = new Text({
 *     text: 'Normal Text',
 *     style: {
 *         fontVariant: 'normal',
 *         fontSize: 24
 *     }
 * });
 *
 * // Create text with small-caps variant
 * const smallCapsText = new Text({
 *     text: 'Small Caps Text',
 *     style: {
 *         fontVariant: 'small-caps',
 *         fontSize: 24,
 *         fontFamily: 'Arial'
 *     }
 * });
 *
 * // Use in a TextStyle instance
 * const style = new TextStyle({
 *     fontVariant: 'small-caps',
 *     fontSize: 32,
 *     fill: 0x4a4a4a
 * });
 *
 * // Update variant dynamically
 * text.style = {
 *     ...text.style,
 *     fontVariant: text.style.fontVariant === 'normal' ? 'small-caps' : 'normal'
 * };
 * ```
 *
 * Supported values:
 * - 'normal': Regular text rendering with standard capitalization
 * - 'small-caps': Renders lowercase letters as smaller versions of capital letters
 * @remarks
 * Small caps are only available if the font supports them.
 * Not all fonts include true small caps glyphs.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant | MDN font-variant}
 * @category text
 * @standard
 */
export type TextStyleFontVariant = 'normal' | 'small-caps';
/**
 * The font weight input for text styles. Controls the thickness or boldness of the text.
 * @example
 * ```ts
 * // Create text with different font weights
 * const normalText = new Text({
 *     text: 'Normal Weight',
 *     style: { fontWeight: 'normal' }
 * });
 *
 * const boldText = new Text({
 *     text: 'Bold Weight',
 *     style: { fontWeight: 'bold' }
 * });
 *
 * // Using numeric weights
 * const lightText = new Text({
 *     text: 'Light Weight',
 *     style: { fontWeight: '300' }
 * });
 *
 * const mediumText = new Text({
 *     text: 'Medium Weight',
 *     style: { fontWeight: '500' }
 * });
 *
 * const heavyText = new Text({
 *     text: 'Heavy Weight',
 *     style: { fontWeight: '900' }
 * });
 *
 * // Responsive weight changes
 * const adaptiveText = new Text({
 *     text: 'Adaptive Weight',
 *     style: { fontWeight: window.innerWidth > 600 ? 'bold' : 'normal' }
 * });
 * ```
 *
 * Supported values:
 * - 'normal': Standard weight (equivalent to 400)
 * - 'bold': Bold weight (equivalent to 700)
 * - 'bolder': One weight darker than the parent element
 * - 'lighter': One weight lighter than the parent element
 * - '100': Thin (Hairline)
 * - '200': Extra Light (Ultra Light)
 * - '300': Light
 * - '400': Normal
 * - '500': Medium
 * - '600': Semi Bold (Demi Bold)
 * - '700': Bold
 * - '800': Extra Bold (Ultra Bold)
 * - '900': Heavy (Black)
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight | MDN font-weight}
 * @category text
 * @standard
 */
export type TextStyleFontWeight =
    | 'normal' // Standard weight (400)
    | 'bold' // Bold weight (700)
    | 'bolder' // Relative weight increase
    | 'lighter' // Relative weight decrease
    | '100' // Thin
    | '200' // Extra Light
    | '300' // Light
    | '400' // Normal
    | '500' // Medium
    | '600' // Semi Bold
    | '700' // Bold
    | '800' // Extra Bold
    | '900'; // Heavy
/**
 * The line join style for text strokes. Determines how lines connect at corners.
 * @example
 * ```ts
 * // Create text with miter joins (sharp corners)
 * const sharpText = new Text({
 *     text: 'Sharp Corners',
 *     style: {
 *         fontSize: 36,
 *         stroke: {
 *             color: '#4a1850',
 *             width: 4,
 *             lineJoin: 'miter'  // Sharp corners
 *         }
 *     }
 * });
 *
 * // Create text with round joins
 * const roundText = new Text({
 *     text: 'Rounded Corners',
 *     style: {
 *         fontSize: 36,
 *         stroke: {
 *             color: '#4a1850',
 *             width: 4,
 *             lineJoin: 'round'  // Smooth rounded corners
 *         }
 *     }
 * });
 *
 * // Create text with beveled joins
 * const bevelText = new Text({
 *     text: 'Beveled Corners',
 *     style: {
 *         fontSize: 36,
 *         stroke: {
 *             color: '#4a1850',
 *             width: 4,
 *             lineJoin: 'bevel'  // Flattened corners
 *         }
 *     }
 * });
 * ```
 * Available values:
 * - 'miter': Creates sharp corners by extending the outer edges until they meet
 * - 'round': Creates smooth, rounded corners using a circular arc
 * - 'bevel': Creates flattened corners by filling an additional triangle between the outer edges
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin | MDN lineJoin}
 * @category text
 * @standard
 */
export type TextStyleLineJoin = 'miter' | 'round' | 'bevel';
/**
 * The text baseline for text styles.
 *
 * This can be:
 * - 'alphabetic': The alphabetic baseline
 * - 'top': The top of the text
 * - 'hanging': The hanging baseline
 * - 'middle': The middle of the text
 * - 'ideographic': The ideographic baseline
 * - 'bottom': The bottom of the text
 * @category text
 * @standard
 */
export type TextStyleTextBaseline = 'alphabetic' | 'top' | 'hanging' | 'middle' | 'ideographic' | 'bottom';
/**
 * Controls how whitespace (spaces, tabs, and line breaks) is handled within the text.
 * This affects text wrapping and spacing behavior.
 * @example
 * ```ts
 * // Normal mode (collapse spaces and newlines)
 * const normalText = new Text({
 *     text: 'Hello    World\n\nNew Line',
 *     style: {
 *         whiteSpace: 'normal',
 *         fontSize: 24
 *     }
 * }); // Renders as: "Hello World New Line"
 *
 * // Pre mode (preserve all whitespace)
 * const preText = new Text({
 *     text: 'Hello    World\n\nNew Line',
 *     style: {
 *         whiteSpace: 'pre',
 *         fontSize: 24
 *     }
 * }); // Preserves spaces and line breaks exactly
 *
 * // Pre-line mode (preserve newlines, collapse spaces)
 * const preLineText = new Text({
 *     text: 'Hello    World\n\nNew Line',
 *     style: {
 *         whiteSpace: 'pre-line',
 *         fontSize: 24
 *     }
 * }); // Preserves line breaks, collapses multiple spaces
 *
 * // With word wrap enabled
 * const wrappedText = new Text({
 *     text: 'A long text with    multiple spaces\nand line breaks',
 *     style: {
 *         whiteSpace: 'pre-line',
 *         wordWrap: true,
 *         wordWrapWidth: 200,
 *         fontSize: 24
 *     }
 * });
 * ```
 *
 * Supported values:
 * - 'normal': Collapses all whitespace (spaces, tabs, line breaks) into a single space
 * - 'pre': Preserves all whitespace characters exactly as written
 * - 'pre-line': Preserves line breaks but collapses multiple spaces into a single space
 * @remarks
 * - 'normal' is best for single-line text or when you want to ignore formatting
 * - 'pre' is useful for code blocks or when exact spacing is important
 * - 'pre-line' is good for formatted text where you want to keep line breaks but clean up spaces
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/white-space | MDN white-space}
 * @see {@link TextStyle#wordWrap} For controlling text wrapping
 * @category text
 * @standard
 */
export type TextStyleWhiteSpace = 'normal' | 'pre' | 'pre-line';

/**
 * Defines a drop shadow effect for text rendering.
 * Drop shadows add depth and emphasis to text by creating a shadow offset from the text.
 * @example
 * ```ts
 * // Create text with basic drop shadow
 * const text = new Text({
 *     text: 'Shadow Text',
 *     style: {
 *         fontSize: 48,
 *         dropShadow: {
 *             alpha: 0.5,         // 50% opacity shadow
 *             angle: Math.PI / 6, // 30 degrees
 *             blur: 4,            // Soft shadow edge
 *             color: '#000000',   // Black shadow
 *             distance: 6         // Shadow offset
 *         }
 *     }
 * });
 *
 * // Dynamic shadow updates
 * text.style.dropShadow = {
 *     alpha: Math.sin(Date.now() / 1000) * 0.5 + 0.5, // Pulsing opacity
 *     angle: Date.now() / 1000,                        // Rotating angle
 *     blur: 4,
 *     color: '#000000',
 *     distance: 6
 * };
 * ```
 * @category text
 * @standard
 */
export type TextDropShadow = {
    /**
     * The opacity of the drop shadow.
     * - Range: 0 to 1
     * - 0 = fully transparent
     * - 1 = fully opaque
     * @example
     * ```ts
     * // Set drop shadow opacity to 50%
     * dropShadow: {
     *    alpha: 0.5
     * }
     * ```
     * @default 1
     */
    alpha: number;

    /**
     * The angle of the drop shadow in radians.
     * - 0 = right
     * - Math.PI/2 = down
     * - Math.PI = left
     * - Math.PI*1.5 = up
     * @example
     * ```ts
     * // Set drop shadow angle to 30 degrees
     * dropShadow: {
     *    angle: Math.PI / 6 // 30 degrees
     * }
     * ```
     * @default Math.PI/6 (30 degrees)
     */
    angle: number;

    /**
     * The blur radius of the shadow.
     * - 0 = sharp shadow
     * - Higher values = softer shadow
     * @example
     * ```ts
     * // Set drop shadow blur radius to 10 pixels
     * dropShadow: {
     *   blur: 10
     * }
     * ```
     * @default 0
     */
    blur: number;

    /**
     * The color of the drop shadow.
     * Accepts any valid CSS color string, hex number, or RGB/RGBA values.
     * @example '#000000', 'rgba(0,0,0,0.5)', 0x000000
     * @default 'black'
     */
    color: ColorSource;

    /**
     * The distance of the drop shadow from the text.
     * Measured in pixels.
     * @example
     * ```ts
     * // Set drop shadow distance to 5 pixels
     * dropShadow: {
     *   distance: 5
     * }
     * ```
     * @default 5
     */
    distance: number;
};

/**
 * Constructor options used for `TextStyle` instances. Defines the visual appearance and layout of text.
 * @example
 * ```ts
 * // Basic text style
 * const basicStyle = new TextStyle({
 *     fontSize: 24,
 *     fill: 'black',
 *     fontFamily: 'Arial'
 * });
 *
 * // Rich text style with multiple features
 * const richStyle = new TextStyle({
 *     fontFamily: ['Arial', 'Helvetica', 'sans-serif'],
 *     fontSize: 36,
 *     fontWeight: 'bold',
 *     fill: 'red',
 *     stroke: { color: '#4a1850', width: 5 },
 *     align: 'center',
 *     dropShadow: {
 *         color: '#000000',
 *         blur: 4,
 *         distance: 6,
 *         angle: Math.PI / 6
 *     },
 *     wordWrap: true,
 *     wordWrapWidth: 440,
 *     lineHeight: 40,
 *     textBaseline: 'middle'
 * });
 * ```
 * @see {@link TextStyle} For the main style class
 * @category text
 * @standard
 */
export interface TextStyleOptions
{
    /**
     * Alignment for multiline text, does not affect single line text
     * @default 'left'
     */
    align?: TextStyleAlign;
    /**
     * Whether to allow line breaks within words.
     * Requires wordWrap to be true.
     * @example
     * ```ts
     * // Enable word breaking
     * const style = new TextStyle({
     *    breakWords: true,
     *    wordWrap: true,
     *    wordWrapWidth: 200
     * });
     * ```
     * @default false
     */
    breakWords?: boolean;
    /**
     * Drop shadow configuration for the text.
     * Can be boolean or a TextDropShadow object.
     * @default null
     */
    dropShadow?: boolean | Partial<TextDropShadow>;
    /**
     * Fill style for the text.
     * Can be a color, gradient, or pattern.
     * @default 'black'
     */
    fill?: FillInput;
    /**
     * Font family or families to use.
     * Can be single name or array of fallbacks.
     * @example
     * ```ts
     * // Single font family
     * fontFamily: 'Arial'
     * // Multiple font families
     * fontFamily: ['Helvetica', 'Arial', 'sans-serif']
     * ```
     * @default 'Arial'
     */
    fontFamily?: string | string[];
    /**
     * Font size in pixels or as string.
     *
     * Equivalents are '26px','20pt','160%' or '1.6em')
     * @example
     * ```ts
     * // Numeric size
     * fontSize: 26
     * // String size
     * fontSize: '26px'
     * // Percentage size
     * fontSize: '160%' // 1.6 times the parent element's font size
     * // Em size
     * fontSize: '1.6em' // 1.6 times the parent element's font size
     * @default 26
     */
    fontSize?: number | string;
    /**
     * Font style (normal, italic, oblique).
     * @default 'normal'
     */
    fontStyle?: TextStyleFontStyle;
    /**
     * Font variant (normal, small-caps).
     * @default 'normal'
     */
    fontVariant?: TextStyleFontVariant;
    /**
     * Font weight (normal, bold, bolder, lighter, 100-900).
     * @default 'normal'
     */
    fontWeight?: TextStyleFontWeight;
    /** The height of the line, a number that represents the vertical space that a letter uses. */
    leading?: number;
    /** The amount of spacing between letters, default is 0 */
    letterSpacing?: number;
    /** The line height, a number that represents the vertical space that a letter uses */
    lineHeight?: number;
    /**
     * Padding around the text.
     *
     * Occasionally some fonts are cropped. Adding some padding will prevent this from
     * happening by adding padding to all sides of the text.
     */
    padding?: number;
    /**
     * Stroke style for text outline.
     * @default null
     */
    stroke?: StrokeInput;
    /**
     * Vertical alignment baseline.
     * @default 'alphabetic'
     */
    textBaseline?: TextStyleTextBaseline;
    /**
     * Whether to trim transparent edges.
     * > [!NOTE] This is an expensive operation and should only be used when necessary.
     * @default false
     */
    trim?: boolean;
    /**
     * How to handle whitespace.
     *
     * It needs wordWrap to be set to true for this to have an effect.
     * @default 'pre'
     */
    whiteSpace?: TextStyleWhiteSpace;
    /** Indicates if word wrap should be used */
    wordWrap?: boolean;
    /** The width at which text will wrap, it needs wordWrap to be set to true */
    wordWrapWidth?: number;
    /**
     * Array of filters to apply to the text.
     *
     * These filters will be applied to the text as it is created, resulting in faster rendering for static text
     * compared to applying the filter directly to the text object (which would be applied at run time).
     * @default undefined
     */
    filters?: Filter[];
}

/**
 * A TextStyle Object contains information to decorate Text objects.
 * An instance can be shared between multiple Text objects; then changing the style will update all text objects using it.
 * @example
 * ```ts
 * // Create a basic text style
 * const style = new TextStyle({
 *     fontFamily: ['Helvetica', 'Arial', 'sans-serif'],
 *     fontSize: 36,
 *     fill: 0xff1010,
 *     align: 'center'
 * });
 *
 * // Create a rich text style with multiple features
 * const richStyle = new TextStyle({
 *     fontFamily: 'Arial',
 *     fontSize: 32,
 *     fill: ['#FF0000', '#00FF00'], // Gradient fill
 *     stroke: {
 *         color: '#4a1850',
 *         width: 5
 *     },
 *     dropShadow: {
 *         color: '#000000',
 *         blur: 4,
 *         distance: 6,
 *         angle: Math.PI / 6
 *     },
 *     wordWrap: true,
 *     wordWrapWidth: 440,
 *     lineHeight: 40,
 *     align: 'center'
 * });
 *
 * // Share style between multiple text objects
 * const text1 = new Text({
 *     text: 'Hello',
 *     style: richStyle
 * });
 *
 * const text2 = new Text({
 *     text: 'World',
 *     style: richStyle
 * });
 *
 * // Update style dynamically - affects all text objects
 * richStyle.fontSize = 48;
 * richStyle.fill = 0x00ff00;
 * ```
 *
 * Key Features:
 * - Shared styling between multiple text objects
 * - Rich text formatting options
 * - Gradient and pattern fills
 * - Drop shadows and strokes
 * - Word wrapping and alignment
 * - Dynamic updates
 * @category text
 * @standard
 */
export class TextStyle extends EventEmitter<{
    update: TextDropShadow
}>
{
    /**
     * Default drop shadow settings used when enabling drop shadows on text.
     * These values are used as the base configuration when drop shadows are enabled without specific settings.
     * @example
     * ```ts
     * // Customize default settings globally
     * TextStyle.defaultDropShadow.alpha = 0.5;    // 50% opacity for all shadows
     * TextStyle.defaultDropShadow.blur = 2;       // 2px blur for all shadows
     * TextStyle.defaultDropShadow.color = 'blue'; // Blue shadows by default
     * ```
     */
    public static defaultDropShadow: TextDropShadow = {
        alpha: 1,
        angle: Math.PI / 6,
        blur: 0,
        color: 'black',
        distance: 5,
    };

    /**
     * Default text style settings used when creating new text objects.
     * These values serve as the base configuration and can be customized globally.
     * @example
     * ```ts
     * // Customize default text style globally
     * TextStyle.defaultTextStyle.fontSize = 16;
     * TextStyle.defaultTextStyle.fill = 0x333333;
     * TextStyle.defaultTextStyle.fontFamily = ['Arial', 'Helvetica', 'sans-serif'];
     * ```
     */
    public static defaultTextStyle: TextStyleOptions = {
        align: 'left',
        breakWords: false,
        dropShadow:  null,
        fill: 'black',
        fontFamily: 'Arial',
        fontSize: 26,
        fontStyle: 'normal',
        fontVariant: 'normal',
        fontWeight: 'normal',
        leading: 0,
        letterSpacing: 0,
        lineHeight: 0,
        padding: 0,
        stroke: null,
        textBaseline: 'alphabetic',
        trim: false,
        whiteSpace: 'pre',
        wordWrap: false,
        wordWrapWidth: 100,
    };

    // colors!!
    /** @internal */
    public _fill: ConvertedFillStyle;
    private _originalFill: FillInput;

    /** @internal */
    public _stroke: ConvertedStrokeStyle;
    private _originalStroke: StrokeInput;

    private _dropShadow: TextDropShadow;

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
    private _filters: Filter[];

    private _padding: number;

    protected _styleKey: string;
    private _trim: boolean;

    constructor(style: Partial<TextStyleOptions> = {})
    {
        super();

        convertV7Tov8Style(style);

        const fullStyle = { ...TextStyle.defaultTextStyle, ...style };

        for (const key in fullStyle)
        {
            const thisKey = key as keyof typeof this;

            this[thisKey] = fullStyle[key as keyof TextStyleOptions] as any;
        }

        this.update();
    }

    /**
     * Alignment for multiline text, does not affect single line text.
     * @type {'left'|'center'|'right'|'justify'}
     */
    get align(): TextStyleAlign { return this._align; }
    set align(value: TextStyleAlign) { this._align = value; this.update(); }
    /** Indicates if lines can be wrapped within words, it needs wordWrap to be set to true. */
    get breakWords(): boolean { return this._breakWords; }
    set breakWords(value: boolean) { this._breakWords = value; this.update(); }
    /** Set a drop shadow for the text. */
    get dropShadow(): TextDropShadow { return this._dropShadow; }
    set dropShadow(value: boolean | TextDropShadow)
    {
        if (value !== null && typeof value === 'object')
        {
            this._dropShadow = this._createProxy({ ...TextStyle.defaultDropShadow, ...value });
        }
        else
        {
            this._dropShadow = value ? this._createProxy({ ...TextStyle.defaultDropShadow }) : null;
        }

        this.update();
    }
    /** The font family, can be a single font name, or a list of names where the first is the preferred font. */
    get fontFamily(): string | string[] { return this._fontFamily; }
    set fontFamily(value: string | string[]) { this._fontFamily = value; this.update(); }
    /** The font size (as a number it converts to px, but as a string, equivalents are '26px','20pt','160%' or '1.6em') */
    get fontSize(): number { return this._fontSize; }
    set fontSize(value: string | number)
    {
        if (typeof value === 'string')
        {
            // eg '34px' to number
            this._fontSize = parseInt(value as string, 10);
        }
        else
        {
            this._fontSize = value as number;
        }
        this.update();
    }
    /**
     * The font style.
     * @type {'normal'|'italic'|'oblique'}
     */
    get fontStyle(): TextStyleFontStyle { return this._fontStyle; }
    set fontStyle(value: TextStyleFontStyle)
    {
        this._fontStyle = value.toLowerCase() as TextStyleFontStyle;
        this.update();
    }
    /**
     * The font variant.
     * @type {'normal'|'small-caps'}
     */
    get fontVariant(): TextStyleFontVariant { return this._fontVariant; }
    set fontVariant(value: TextStyleFontVariant) { this._fontVariant = value; this.update(); }
    /**
     * The font weight.
     * @type {'normal'|'bold'|'bolder'|'lighter'|'100'|'200'|'300'|'400'|'500'|'600'|'700'|'800'|'900'}
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
     * > [!NOTE] This will NOT affect the positioning or bounds of the text.
     */
    get padding(): number { return this._padding; }
    set padding(value: number) { this._padding = value; this.update(); }
    /**
     * An optional filter or array of filters to apply to the text, allowing for advanced visual effects.
     * These filters will be applied to the text as it is created, resulting in faster rendering for static text
     * compared to applying the filter directly to the text object (which would be applied at run time).
     * @default null
     */
    get filters(): Filter[] { return this._filters; }
    set filters(value: Filter[]) { this._filters = value; this.update(); }

    /**
     * Trim transparent borders from the text texture.
     * > [!IMPORTANT] PERFORMANCE WARNING:
     * > This is a costly operation as it requires scanning pixel alpha values.
     * > Avoid using `trim: true` for dynamic text, as it could significantly impact performance.
     */
    get trim(): boolean { return this._trim; }
    set trim(value: boolean) { this._trim = value; this.update(); }
    /**
     * The baseline of the text that is rendered.
     * @type {'alphabetic'|'top'|'hanging'|'middle'|'ideographic'|'bottom'}
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
     * @type {'normal'|'pre'|'pre-line'}
     */
    get whiteSpace(): TextStyleWhiteSpace { return this._whiteSpace; }
    set whiteSpace(value: TextStyleWhiteSpace) { this._whiteSpace = value; this.update(); }
    /** Indicates if word wrap should be used. */
    get wordWrap(): boolean { return this._wordWrap; }
    set wordWrap(value: boolean) { this._wordWrap = value; this.update(); }
    /** The width at which text will wrap, it needs wordWrap to be set to true. */
    get wordWrapWidth(): number { return this._wordWrapWidth; }
    set wordWrapWidth(value: number) { this._wordWrapWidth = value; this.update(); }

    /**
     * The fill style that will be used to color the text.
     * This can be:
     * - A color string like 'red', '#00FF00', or 'rgba(255,0,0,0.5)'
     * - A hex number like 0xff0000 for red
     * - A FillStyle object with properties like { color: 0xff0000, alpha: 0.5 }
     * - A FillGradient for gradient fills
     * - A FillPattern for pattern/texture fills
     *
     * When using a FillGradient, vertical gradients (angle of 90 degrees) are applied per line of text,
     * while gradients at any other angle are spread across the entire text body as a whole.
     * @example
     * // Vertical gradient applied per line
     * const verticalGradient = new FillGradient(0, 0, 0, 1)
     *     .addColorStop(0, 0xff0000)
     *     .addColorStop(1, 0x0000ff);
     *
     * const text = new Text({
     *     text: 'Line 1\nLine 2',
     *     style: { fill: verticalGradient }
     * });
     *
     * To manage the gradient in a global scope, set the textureSpace property of the FillGradient to 'global'.
     * @type {string|number|FillStyle|FillGradient|FillPattern}
     */
    get fill(): FillInput
    {
        return this._originalFill;
    }

    set fill(value: FillInput)
    {
        if (value === this._originalFill) return;

        this._originalFill = value;

        if (this._isFillStyle(value))
        {
            this._originalFill = this._createProxy({ ...GraphicsContext.defaultFillStyle, ...value }, () =>
            {
                this._fill = toFillStyle(
                    { ...this._originalFill as FillStyle },
                    GraphicsContext.defaultFillStyle
                );
            });
        }

        this._fill = toFillStyle(
            value === 0x0 ? 'black' : value,
            GraphicsContext.defaultFillStyle
        );
        this.update();
    }

    /** A fillstyle that will be used on the text stroke, e.g., 'blue', '#FCFF00'. */
    get stroke(): StrokeInput
    {
        return this._originalStroke;
    }

    set stroke(value: StrokeInput)
    {
        if (value === this._originalStroke) return;

        this._originalStroke = value;

        if (this._isFillStyle(value))
        {
            this._originalStroke = this._createProxy({ ...GraphicsContext.defaultStrokeStyle, ...value }, () =>
            {
                this._stroke = toStrokeStyle(
                    { ...this._originalStroke as StrokeStyle },
                    GraphicsContext.defaultStrokeStyle
                );
            });
        }

        this._stroke = toStrokeStyle(value, GraphicsContext.defaultStrokeStyle);
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

    /** Resets all properties to the default values */
    public reset()
    {
        const defaultStyle = TextStyle.defaultTextStyle;

        for (const key in defaultStyle)
        {
            this[key as keyof typeof this] = defaultStyle[key as keyof TextStyleOptions] as any;
        }
    }

    /** @internal */
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
            dropShadow: this._dropShadow ? { ...this._dropShadow } : null,
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
            filters: this._filters ? [...this._filters] : undefined,
        });
    }

    /**
     * Returns the final padding for the text style, taking into account any filters applied.
     * Used internally for correct measurements
     * @internal
     * @returns {number} The final padding for the text style.
     */
    public _getFinalPadding(): number
    {
        let filterPadding = 0;

        if (this._filters)
        {
            for (let i = 0; i < this._filters.length; i++)
            {
                filterPadding += this._filters[i].padding;
            }
        }

        return Math.max(this._padding, filterPadding);
    }

    /**
     * Destroys this text style.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @example
     * // Destroy the text style and its textures
     * textStyle.destroy({ texture: true, textureSource: true });
     * textStyle.destroy(true);
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
        this.dropShadow = null;
        this._originalStroke = null;
        this._originalFill = null;
    }

    private _createProxy<T extends object>(value: T, cb?: (property: string, newValue: any) => void): T
    {
        return new Proxy<T>(value, {
            set: (target, property, newValue) =>
            {
                target[property as keyof T] = newValue;
                cb?.(property as string, newValue);
                this.update();

                return true;
            }
        });
    }

    private _isFillStyle(value: FillInput): value is FillStyle
    {
        return ((value ?? null) !== null
            && !(Color.isColorLike(value) || value instanceof FillGradient || value instanceof FillPattern));
    }
}

function convertV7Tov8Style(style: TextStyleOptions)
{
    const oldStyle = style as TextStyleOptions & {
        dropShadowAlpha?: number;
        dropShadowAngle?: number;
        dropShadowBlur?: number;
        dropShadowColor?: number;
        dropShadowDistance?: number;
        fillGradientStops?: number[];
        strokeThickness?: number;
    };

    if (typeof oldStyle.dropShadow === 'boolean' && oldStyle.dropShadow)
    {
        const defaults = TextStyle.defaultDropShadow;

        style.dropShadow = {
            alpha: oldStyle.dropShadowAlpha ?? defaults.alpha,
            angle: oldStyle.dropShadowAngle ?? defaults.angle,
            blur: oldStyle.dropShadowBlur ?? defaults.blur,
            color: oldStyle.dropShadowColor ?? defaults.color,
            distance:   oldStyle.dropShadowDistance ?? defaults.distance,
        };
    }

    if (oldStyle.strokeThickness !== undefined)
    {
        // #if _DEBUG
        deprecation(v8_0_0, 'strokeThickness is now a part of stroke');
        // #endif

        const color = oldStyle.stroke;
        let obj: FillStyle = {};

        // handles stroke: 0x0, stroke: { r: 0, g: 0, b: 0, a: 0 } stroke: new Color(0x0)
        if (Color.isColorLike(color as ColorSource))
        {
            obj.color = color as ColorSource;
        }
        // handles stroke: new FillGradient()
        else if (color instanceof FillGradient || color instanceof FillPattern)
        {
            obj.fill = color as FillGradient | FillPattern;
        }
        // handles stroke: { color: 0x0 } or stroke: { fill: new FillGradient() }
        else if (Object.hasOwnProperty.call(color, 'color') || Object.hasOwnProperty.call(color, 'fill'))
        {
            obj = color as FillStyle;
        }
        else
        {
            throw new Error('Invalid stroke value.');
        }

        style.stroke = {
            ...obj,
            width: oldStyle.strokeThickness
        };
    }

    if (Array.isArray(oldStyle.fillGradientStops))
    {
        // #if _DEBUG
        deprecation(v8_0_0, 'gradient fill is now a fill pattern: `new FillGradient(...)`');
        // #endif

        let fontSize: number;

        // eslint-disable-next-line no-eq-null, eqeqeq
        if (style.fontSize == null)
        {
            style.fontSize = TextStyle.defaultTextStyle.fontSize;
        }
        else if (typeof style.fontSize === 'string')
        {
            // eg '34px' to number
            fontSize = parseInt(style.fontSize as string, 10);
        }
        else
        {
            fontSize = style.fontSize as number;
        }

        const gradientFill = new FillGradient({
            start: { x: 0, y: 0 },
            end: { x: 0, y: (fontSize || 0) * 1.7 },
        });

        const fills: number[] = oldStyle.fillGradientStops
            .map((color: ColorSource) => Color.shared.setValue(color).toNumber());

        fills.forEach((number, index) =>
        {
            const ratio = index / (fills.length - 1);

            gradientFill.addColorStop(ratio, number);
        });

        style.fill = {
            fill: gradientFill
        };
    }
}

