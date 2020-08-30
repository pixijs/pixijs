import type { IDestroyOptions } from '@pixi/display';
import { Rectangle } from '@pixi/math';
import type { Renderer } from '@pixi/core';
import { Sprite } from '@pixi/sprite';

declare interface IFontMetrics {
    ascent: number;
    descent: number;
    fontSize: number;
}

export declare interface ITextStyle {
    align: TextStyleAlign;
    breakWords: boolean;
    dropShadow: boolean;
    dropShadowAlpha: number;
    dropShadowAngle: number;
    dropShadowBlur: number;
    dropShadowColor: string | number;
    dropShadowDistance: number;
    fill: TextStyleFill;
    fillGradientType: TEXT_GRADIENT;
    fillGradientStops: number[];
    fontFamily: string | string[];
    fontSize: number | string;
    fontStyle: TextStyleFontStyle;
    fontVariant: TextStyleFontVariant;
    fontWeight: TextStyleFontWeight;
    letterSpacing: number;
    lineHeight: number;
    lineJoin: TextStyleLineJoin;
    miterLimit: number;
    padding: number;
    stroke: string | number;
    strokeThickness: number;
    textBaseline: TextStyleTextBaseline;
    trim: boolean;
    whiteSpace: TextStyleWhiteSpace;
    wordWrap: boolean;
    wordWrapWidth: number;
    leading: number;
}

/**
 * A Text Object will create a line or multiple lines of text.
 *
 * The text is created using the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).
 *
 * The primary advantage of this class over BitmapText is that you have great control over the style of the next,
 * which you can change at runtime.
 *
 * The primary disadvantages is that each piece of text has it's own texture, which can use more memory.
 * When text changes, this texture has to be re-generated and re-uploaded to the GPU, taking up time.
 *
 * To split a line you can use '\n' in your text string, or, on the `style` object,
 * change its `wordWrap` property to true and and give the `wordWrapWidth` property a value.
 *
 * A Text can be created directly from a string and a style object,
 * which can be generated [here](https://pixijs.io/pixi-text-style).
 *
 * ```js
 * let text = new PIXI.Text('This is a PixiJS text',{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
 * ```
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI
 */
declare class Text_2 extends Sprite
{
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    localStyleID: number;
    dirty: boolean;
    _resolution: number;
    _autoResolution: boolean;
    protected _text: string;
    protected _font: string;
    protected _style: TextStyle;
    protected _styleListener: () => void;
    private _ownCanvas;
    /**
     * @param {string} text - The string that you would like the text to display
     * @param {object|PIXI.TextStyle} [style] - The style parameters
     * @param {HTMLCanvasElement} [canvas] - The canvas element for drawing text
     */
    constructor(text: string, style: Partial<ITextStyle> | TextStyle, canvas: HTMLCanvasElement);
    /**
     * Renders text to its canvas, and updates its texture.
     * By default this is used internally to ensure the texture is correct before rendering,
     * but it can be used called externally, for example from this class to 'pre-generate' the texture from a piece of text,
     * and then shared across multiple Sprites.
     *
     * @param {boolean} respectDirty - Whether to abort updating the text if the Text isn't dirty and the function is called.
     */
    updateText(respectDirty: boolean): void;
    /**
     * Render the text with letter-spacing.
     * @param {string} text - The text to draw
     * @param {number} x - Horizontal position to draw the text
     * @param {number} y - Vertical position to draw the text
     * @param {boolean} [isStroke=false] - Is this drawing for the outside stroke of the
     *  text? If not, it's for the inside fill
     * @private
     */
    private drawLetterSpacing;
    /**
     * Updates texture size based on canvas size
     *
     * @private
     */
    private updateTexture;
    /**
     * Renders the object using the WebGL renderer
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    protected _render(renderer: Renderer): void;
    /**
     * Gets the local bounds of the text object.
     *
     * @param {PIXI.Rectangle} rect - The output rectangle.
     * @return {PIXI.Rectangle} The bounds.
     */
    getLocalBounds(rect: Rectangle): Rectangle;
    /**
     * calculates the bounds of the Text as a rectangle. The bounds calculation takes the worldTransform into account.
     * @protected
     */
    protected _calculateBounds(): void;
    /**
     * Generates the fill style. Can automatically generate a gradient based on the fill style being an array
     *
     * @private
     * @param {object} style - The style.
     * @param {string[]} lines - The lines of text.
     * @return {string|number|CanvasGradient} The fill style
     */
    private _generateFillStyle;
    /**
     * Destroys this text object.
     * Note* Unlike a Sprite, a Text object will automatically destroy its baseTexture and texture as
     * the majority of the time the texture will not be shared with any other Sprites.
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their
     *  destroy method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=true] - Should it destroy the current texture of the sprite as well
     * @param {boolean} [options.baseTexture=true] - Should it destroy the base texture of the sprite as well
     */
    destroy(options: IDestroyOptions | boolean): void;
    /**
     * The width of the Text, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get width(): number;
    set width(value: number);
    /**
     * The height of the Text, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get height(): number;
    set height(value: number);
    /**
     * Set the style of the text. Set up an event listener to listen for changes on the style
     * object and mark the text as dirty.
     *
     * @member {object|PIXI.TextStyle}
     */
    get style(): TextStyle | Partial<ITextStyle>;
    set style(style: TextStyle | Partial<ITextStyle>);
    /**
     * Set the copy for the text object. To split a line you can use '\n'.
     *
     * @member {string}
     */
    get text(): string;
    set text(text: string);
    /**
     * The resolution / device pixel ratio of the canvas.
     * This is set to automatically match the renderer resolution by default, but can be overridden by setting manually.
     * @member {number}
     * @default 1
     */
    get resolution(): number;
    set resolution(value: number);
}
export { Text_2 as Text };

/**
 * Constants that define the type of gradient on text.
 *
 * @static
 * @constant
 * @name TEXT_GRADIENT
 * @memberof PIXI
 * @type {object}
 * @property {number} LINEAR_VERTICAL Vertical gradient
 * @property {number} LINEAR_HORIZONTAL Linear gradient
 */
export declare enum TEXT_GRADIENT {
    LINEAR_VERTICAL = 0,
    LINEAR_HORIZONTAL = 1
}

/**
 * The TextMetrics object represents the measurement of a block of text with a specified style.
 *
 * ```js
 * let style = new PIXI.TextStyle({fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'})
 * let textMetrics = PIXI.TextMetrics.measureText('Your text', style)
 * ```
 *
 * @class
 * @memberof PIXI
 */
declare class TextMetrics_2
{
    text: string;
    style: TextStyle;
    width: number;
    height: number;
    lines: string[];
    lineWidths: number[];
    lineHeight: number;
    maxLineWidth: number;
    fontProperties: IFontMetrics;
    static METRICS_STRING: string;
    static BASELINE_SYMBOL: string;
    static BASELINE_MULTIPLIER: number;
    static _canvas: HTMLCanvasElement | OffscreenCanvas;
    static _context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    static _fonts: {
        [font: string]: IFontMetrics;
    };
    static _newlines: number[];
    static _breakingSpaces: number[];
    /**
     * @param {string} text - the text that was measured
     * @param {PIXI.TextStyle} style - the style that was measured
     * @param {number} width - the measured width of the text
     * @param {number} height - the measured height of the text
     * @param {string[]} lines - an array of the lines of text broken by new lines and wrapping if specified in style
     * @param {number[]} lineWidths - an array of the line widths for each line matched to `lines`
     * @param {number} lineHeight - the measured line height for this style
     * @param {number} maxLineWidth - the maximum line width for all measured lines
     * @param {Object} fontProperties - the font properties object from TextMetrics.measureFont
     */
    constructor(text: string, style: TextStyle, width: number, height: number, lines: string[], lineWidths: number[], lineHeight: number, maxLineWidth: number, fontProperties: IFontMetrics);
    /**
     * Measures the supplied string of text and returns a Rectangle.
     *
     * @param {string} text - the text to measure.
     * @param {PIXI.TextStyle} style - the text style to use for measuring
     * @param {boolean} [wordWrap] - optional override for if word-wrap should be applied to the text.
     * @param {HTMLCanvasElement} [canvas] - optional specification of the canvas to use for measuring.
     * @return {PIXI.TextMetrics} measured width and height of the text.
     */
    static measureText(text: string, style: TextStyle, wordWrap: boolean, canvas?: HTMLCanvasElement | OffscreenCanvas): TextMetrics_2;
    /**
     * Applies newlines to a string to have it optimally fit into the horizontal
     * bounds set by the Text object's wordWrapWidth property.
     *
     * @private
     * @param {string} text - String to apply word wrapping to
     * @param {PIXI.TextStyle} style - the style to use when wrapping
     * @param {HTMLCanvasElement} [canvas] - optional specification of the canvas to use for measuring.
     * @return {string} New string with new lines applied where required
     */
    private static wordWrap;
    /**
     * Convienience function for logging each line added during the wordWrap
     * method
     *
     * @private
     * @param  {string}   line        - The line of text to add
     * @param  {boolean}  newLine     - Add new line character to end
     * @return {string}  A formatted line
     */
    private static addLine;
    /**
     * Gets & sets the widths of calculated characters in a cache object
     *
     * @private
     * @param  {string}                    key            - The key
     * @param  {number}                    letterSpacing  - The letter spacing
     * @param  {object}                    cache          - The cache
     * @param  {CanvasRenderingContext2D}  context        - The canvas context
     * @return {number}                    The from cache.
     */
    private static getFromCache;
    /**
     * Determines whether we should collapse breaking spaces
     *
     * @private
     * @param  {string}   whiteSpace - The TextStyle property whiteSpace
     * @return {boolean}  should collapse
     */
    private static collapseSpaces;
    /**
     * Determines whether we should collapse newLine chars
     *
     * @private
     * @param  {string}   whiteSpace - The white space
     * @return {boolean}  should collapse
     */
    private static collapseNewlines;
    /**
     * trims breaking whitespaces from string
     *
     * @private
     * @param  {string}  text - The text
     * @return {string}  trimmed string
     */
    private static trimRight;
    /**
     * Determines if char is a newline.
     *
     * @private
     * @param  {string}  char - The character
     * @return {boolean}  True if newline, False otherwise.
     */
    private static isNewline;
    /**
     * Determines if char is a breaking whitespace.
     *
     * @private
     * @param  {string}  char - The character
     * @return {boolean}  True if whitespace, False otherwise.
     */
    private static isBreakingSpace;
    /**
     * Splits a string into words, breaking-spaces and newLine characters
     *
     * @private
     * @param  {string}  text - The text
     * @return {string[]}  A tokenized array
     */
    private static tokenize;
    /**
     * Overridable helper method used internally by TextMetrics, exposed to allow customizing the class's behavior.
     *
     * It allows one to customise which words should break
     * Examples are if the token is CJK or numbers.
     * It must return a boolean.
     *
     * @param  {string}  token       - The token
     * @param  {boolean}  breakWords - The style attr break words
     * @return {boolean} whether to break word or not
     */
    static canBreakWords(_token: string, breakWords: boolean): boolean;
    /**
     * Overridable helper method used internally by TextMetrics, exposed to allow customizing the class's behavior.
     *
     * It allows one to determine whether a pair of characters
     * should be broken by newlines
     * For example certain characters in CJK langs or numbers.
     * It must return a boolean.
     *
     * @param  {string}  char        - The character
     * @param  {string}  nextChar    - The next character
     * @param  {string}  token       - The token/word the characters are from
     * @param  {number}  index       - The index in the token of the char
     * @param  {boolean}  breakWords - The style attr break words
     * @return {boolean} whether to break word or not
     */
    static canBreakChars(_char: string, _nextChar: string, _token: string, _index: number, _breakWords: boolean): boolean;
    /**
     * Overridable helper method used internally by TextMetrics, exposed to allow customizing the class's behavior.
     *
     * It is called when a token (usually a word) has to be split into separate pieces
     * in order to determine the point to break a word.
     * It must return an array of characters.
     *
     * @example
     * // Correctly splits emojis, eg "🤪🤪" will result in two element array, each with one emoji.
     * TextMetrics.wordWrapSplit = (token) => [...token];
     *
     * @param  {string}  token - The token to split
     * @return {string[]} The characters of the token
     */
    static wordWrapSplit(token: string): string[];
    /**
     * Calculates the ascent, descent and fontSize of a given font-style
     *
     * @static
     * @param {string} font - String representing the style of the font
     * @return {PIXI.IFontMetrics} Font properties object
     */
    static measureFont(font: string): IFontMetrics;
    /**
     * Clear font metrics in metrics cache.
     *
     * @static
     * @param {string} [font] - font name. If font name not set then clear cache for all fonts.
     */
    static clearMetrics(font?: string): void;
}
export { TextMetrics_2 as TextMetrics };

/**
 * A TextStyle Object contains information to decorate a Text objects.
 *
 * An instance can be shared between multiple Text objects; then changing the style will update all text objects using it.
 *
 * A tool can be used to generate a text style [here](https://pixijs.io/pixi-text-style).
 *
 * @class
 * @memberof PIXI
 */
export declare class TextStyle implements ITextStyle
{
    styleID: number;
    protected _align: TextStyleAlign;
    protected _breakWords: boolean;
    protected _dropShadow: boolean;
    protected _dropShadowAlpha: number;
    protected _dropShadowAngle: number;
    protected _dropShadowBlur: number;
    protected _dropShadowColor: string | number;
    protected _dropShadowDistance: number;
    protected _fill: TextStyleFill;
    protected _fillGradientType: TEXT_GRADIENT;
    protected _fillGradientStops: number[];
    protected _fontFamily: string | string[];
    protected _fontSize: number | string;
    protected _fontStyle: TextStyleFontStyle;
    protected _fontVariant: TextStyleFontVariant;
    protected _fontWeight: TextStyleFontWeight;
    protected _letterSpacing: number;
    protected _lineHeight: number;
    protected _lineJoin: TextStyleLineJoin;
    protected _miterLimit: number;
    protected _padding: number;
    protected _stroke: string | number;
    protected _strokeThickness: number;
    protected _textBaseline: TextStyleTextBaseline;
    protected _trim: boolean;
    protected _whiteSpace: TextStyleWhiteSpace;
    protected _wordWrap: boolean;
    protected _wordWrapWidth: number;
    protected _leading: number;
    /**
     * @param {object} [style] - The style parameters
     * @param {string} [style.align='left'] - Alignment for multiline text ('left', 'center' or 'right'),
     *  does not affect single line text
     * @param {boolean} [style.breakWords=false] - Indicates if lines can be wrapped within words, it
     *  needs wordWrap to be set to true
     * @param {boolean} [style.dropShadow=false] - Set a drop shadow for the text
     * @param {number} [style.dropShadowAlpha=1] - Set alpha for the drop shadow
     * @param {number} [style.dropShadowAngle=Math.PI/6] - Set a angle of the drop shadow
     * @param {number} [style.dropShadowBlur=0] - Set a shadow blur radius
     * @param {string|number} [style.dropShadowColor='black'] - A fill style to be used on the dropshadow e.g 'red', '#00FF00'
     * @param {number} [style.dropShadowDistance=5] - Set a distance of the drop shadow
     * @param {string|string[]|number|number[]|CanvasGradient|CanvasPattern} [style.fill='black'] - A canvas
     *  fillstyle that will be used on the text e.g 'red', '#00FF00'. Can be an array to create a gradient
     *  eg ['#000000','#FFFFFF']
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle|MDN}
     * @param {number} [style.fillGradientType=PIXI.TEXT_GRADIENT.LINEAR_VERTICAL] - If fill is an array of colours
     *  to create a gradient, this can change the type/direction of the gradient. See {@link PIXI.TEXT_GRADIENT}
     * @param {number[]} [style.fillGradientStops] - If fill is an array of colours to create a gradient, this array can set
     * the stop points (numbers between 0 and 1) for the color, overriding the default behaviour of evenly spacing them.
     * @param {string|string[]} [style.fontFamily='Arial'] - The font family
     * @param {number|string} [style.fontSize=26] - The font size (as a number it converts to px, but as a string,
     *  equivalents are '26px','20pt','160%' or '1.6em')
     * @param {string} [style.fontStyle='normal'] - The font style ('normal', 'italic' or 'oblique')
     * @param {string} [style.fontVariant='normal'] - The font variant ('normal' or 'small-caps')
     * @param {string} [style.fontWeight='normal'] - The font weight ('normal', 'bold', 'bolder', 'lighter' and '100',
     *  '200', '300', '400', '500', '600', '700', '800' or '900')
     * @param {number} [style.leading=0] - The space between lines
     * @param {number} [style.letterSpacing=0] - The amount of spacing between letters, default is 0
     * @param {number} [style.lineHeight] - The line height, a number that represents the vertical space that a letter uses
     * @param {string} [style.lineJoin='miter'] - The lineJoin property sets the type of corner created, it can resolve
     *      spiked text issues. Possible values "miter" (creates a sharp corner), "round" (creates a round corner) or "bevel"
     *      (creates a squared corner).
     * @param {number} [style.miterLimit=10] - The miter limit to use when using the 'miter' lineJoin mode. This can reduce
     *      or increase the spikiness of rendered text.
     * @param {number} [style.padding=0] - Occasionally some fonts are cropped. Adding some padding will prevent this from
     *     happening by adding padding to all sides of the text.
     * @param {string|number} [style.stroke='black'] - A canvas fillstyle that will be used on the text stroke
     *  e.g 'blue', '#FCFF00'
     * @param {number} [style.strokeThickness=0] - A number that represents the thickness of the stroke.
     *  Default is 0 (no stroke)
     * @param {boolean} [style.trim=false] - Trim transparent borders
     * @param {string} [style.textBaseline='alphabetic'] - The baseline of the text that is rendered.
     * @param {string} [style.whiteSpace='pre'] - Determines whether newlines & spaces are collapsed or preserved "normal"
     *      (collapse, collapse), "pre" (preserve, preserve) | "pre-line" (preserve, collapse). It needs wordWrap to be set to true
     * @param {boolean} [style.wordWrap=false] - Indicates if word wrap should be used
     * @param {number} [style.wordWrapWidth=100] - The width at which text will wrap, it needs wordWrap to be set to true
     */
    constructor(style: Partial<ITextStyle>);
    /**
     * Creates a new TextStyle object with the same values as this one.
     * Note that the only the properties of the object are cloned.
     *
     * @return {PIXI.TextStyle} New cloned TextStyle object
     */
    clone(): TextStyle;
    /**
     * Resets all properties to the defaults specified in TextStyle.prototype._default
     */
    reset(): void;
    /**
     * Alignment for multiline text ('left', 'center' or 'right'), does not affect single line text
     *
     * @member {string}
     */
    get align(): TextStyleAlign;
    set align(align: TextStyleAlign);
    /**
     * Indicates if lines can be wrapped within words, it needs wordWrap to be set to true
     *
     * @member {boolean}
     */
    get breakWords(): boolean;
    set breakWords(breakWords: boolean);
    /**
     * Set a drop shadow for the text
     *
     * @member {boolean}
     */
    get dropShadow(): boolean;
    set dropShadow(dropShadow: boolean);
    /**
     * Set alpha for the drop shadow
     *
     * @member {number}
     */
    get dropShadowAlpha(): number;
    set dropShadowAlpha(dropShadowAlpha: number);
    /**
     * Set a angle of the drop shadow
     *
     * @member {number}
     */
    get dropShadowAngle(): number;
    set dropShadowAngle(dropShadowAngle: number);
    /**
     * Set a shadow blur radius
     *
     * @member {number}
     */
    get dropShadowBlur(): number;
    set dropShadowBlur(dropShadowBlur: number);
    /**
     * A fill style to be used on the dropshadow e.g 'red', '#00FF00'
     *
     * @member {string|number}
     */
    get dropShadowColor(): number | string;
    set dropShadowColor(dropShadowColor: number | string);
    /**
     * Set a distance of the drop shadow
     *
     * @member {number}
     */
    get dropShadowDistance(): number;
    set dropShadowDistance(dropShadowDistance: number);
    /**
     * A canvas fillstyle that will be used on the text e.g 'red', '#00FF00'.
     * Can be an array to create a gradient eg ['#000000','#FFFFFF']
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle|MDN}
     *
     * @member {string|string[]|number|number[]|CanvasGradient|CanvasPattern}
     */
    get fill(): TextStyleFill;
    set fill(fill: TextStyleFill);
    /**
     * If fill is an array of colours to create a gradient, this can change the type/direction of the gradient.
     * See {@link PIXI.TEXT_GRADIENT}
     *
     * @member {number}
     */
    get fillGradientType(): TEXT_GRADIENT;
    set fillGradientType(fillGradientType: TEXT_GRADIENT);
    /**
     * If fill is an array of colours to create a gradient, this array can set the stop points
     * (numbers between 0 and 1) for the color, overriding the default behaviour of evenly spacing them.
     *
     * @member {number[]}
     */
    get fillGradientStops(): number[];
    set fillGradientStops(fillGradientStops: number[]);
    /**
     * The font family
     *
     * @member {string|string[]}
     */
    get fontFamily(): string | string[];
    set fontFamily(fontFamily: string | string[]);
    /**
     * The font size
     * (as a number it converts to px, but as a string, equivalents are '26px','20pt','160%' or '1.6em')
     *
     * @member {number|string}
     */
    get fontSize(): number | string;
    set fontSize(fontSize: number | string);
    /**
     * The font style
     * ('normal', 'italic' or 'oblique')
     *
     * @member {string}
     */
    get fontStyle(): TextStyleFontStyle;
    set fontStyle(fontStyle: TextStyleFontStyle);
    /**
     * The font variant
     * ('normal' or 'small-caps')
     *
     * @member {string}
     */
    get fontVariant(): TextStyleFontVariant;
    set fontVariant(fontVariant: TextStyleFontVariant);
    /**
     * The font weight
     * ('normal', 'bold', 'bolder', 'lighter' and '100', '200', '300', '400', '500', '600', '700', 800' or '900')
     *
     * @member {string}
     */
    get fontWeight(): TextStyleFontWeight;
    set fontWeight(fontWeight: TextStyleFontWeight);
    /**
     * The amount of spacing between letters, default is 0
     *
     * @member {number}
     */
    get letterSpacing(): number;
    set letterSpacing(letterSpacing: number);
    /**
     * The line height, a number that represents the vertical space that a letter uses
     *
     * @member {number}
     */
    get lineHeight(): number;
    set lineHeight(lineHeight: number);
    /**
     * The space between lines
     *
     * @member {number}
     */
    get leading(): number;
    set leading(leading: number);
    /**
     * The lineJoin property sets the type of corner created, it can resolve spiked text issues.
     * Default is 'miter' (creates a sharp corner).
     *
     * @member {string}
     */
    get lineJoin(): TextStyleLineJoin;
    set lineJoin(lineJoin: TextStyleLineJoin);
    /**
     * The miter limit to use when using the 'miter' lineJoin mode
     * This can reduce or increase the spikiness of rendered text.
     *
     * @member {number}
     */
    get miterLimit(): number;
    set miterLimit(miterLimit: number);
    /**
     * Occasionally some fonts are cropped. Adding some padding will prevent this from happening
     * by adding padding to all sides of the text.
     *
     * @member {number}
     */
    get padding(): number;
    set padding(padding: number);
    /**
     * A canvas fillstyle that will be used on the text stroke
     * e.g 'blue', '#FCFF00'
     *
     * @member {string|number}
     */
    get stroke(): string | number;
    set stroke(stroke: string | number);
    /**
     * A number that represents the thickness of the stroke.
     * Default is 0 (no stroke)
     *
     * @member {number}
     */
    get strokeThickness(): number;
    set strokeThickness(strokeThickness: number);
    /**
     * The baseline of the text that is rendered.
     *
     * @member {string}
     */
    get textBaseline(): TextStyleTextBaseline;
    set textBaseline(textBaseline: TextStyleTextBaseline);
    /**
     * Trim transparent borders
     *
     * @member {boolean}
     */
    get trim(): boolean;
    set trim(trim: boolean);
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
     * @member {string}
     */
    get whiteSpace(): TextStyleWhiteSpace;
    set whiteSpace(whiteSpace: TextStyleWhiteSpace);
    /**
     * Indicates if word wrap should be used
     *
     * @member {boolean}
     */
    get wordWrap(): boolean;
    set wordWrap(wordWrap: boolean);
    /**
     * The width at which text will wrap, it needs wordWrap to be set to true
     *
     * @member {number}
     */
    get wordWrapWidth(): number;
    set wordWrapWidth(wordWrapWidth: number);
    /**
     * Generates a font style string to use for `TextMetrics.measureFont()`.
     *
     * @return {string} Font style string, for passing to `TextMetrics.measureFont()`
     */
    toFontString(): string;
}

export declare type TextStyleAlign = 'left' | 'center' | 'right';

export declare type TextStyleFill = string | string[] | number | number[] | CanvasGradient | CanvasPattern;

export declare type TextStyleFontStyle = 'normal' | 'italic' | 'oblique';

export declare type TextStyleFontVariant = 'normal' | 'small-caps';

export declare type TextStyleFontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

export declare type TextStyleLineJoin = 'miter' | 'round' | 'bevel';

export declare type TextStyleTextBaseline = 'alphabetic' | 'top' | 'hanging' | 'middle' | 'ideographic' | 'bottom';

export declare type TextStyleWhiteSpace = 'normal' | 'pre' | 'pre-line';

export { };
