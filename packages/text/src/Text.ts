/* eslint max-depth: [2, 8] */
import { Sprite } from '@pixi/sprite';
import { Texture, settings, Rectangle, utils } from '@pixi/core';
import { TEXT_GRADIENT } from './const';
import { TextStyle } from './TextStyle';
import { TextMetrics } from './TextMetrics';

import type { Renderer } from '@pixi/core';
import type { IDestroyOptions } from '@pixi/display';
import type { ICanvas, ICanvasRenderingContext2D } from '@pixi/settings';
import type { ITextStyle } from './TextStyle';

// The type for Intl.Segmenter is only available since TypeScript 4.7.2, so let's make a polyfill for it.
interface ISegmentData
{
    segment: string;
}
interface ISegments
{
    [Symbol.iterator](): IterableIterator<ISegmentData>;
}
interface ISegmenter
{
    segment(input: string): ISegments;
}
interface IIntl
{
    Segmenter?: {
        prototype: ISegmenter;
        new(): ISegmenter;
    };
}

const defaultDestroyOptions: IDestroyOptions = {
    texture: true,
    children: false,
    baseTexture: true,
};

interface ModernContext2D extends ICanvasRenderingContext2D
{
    // for chrome less 94
    textLetterSpacing?: number;
    // for chrome greater 94
    letterSpacing?: number;
}

/**
 * A Text Object will create a line or multiple lines of text.
 *
 * The text is created using the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).
 *
 * The primary advantage of this class over BitmapText is that you have great control over the style of the text,
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
 * @example
 * import { Text } from 'pixi.js';
 *
 * const text = new Text('This is a PixiJS text', {
 *     fontFamily: 'Arial',
 *     fontSize: 24,
 *     fill: 0xff1010,
 *     align: 'center',
 * });
 * @memberof PIXI
 */
export class Text extends Sprite
{
    /**
     * New rendering behavior for letter-spacing which uses Chrome's new native API. This will
     * lead to more accurate letter-spacing results because it does not try to manually draw
     * each character. However, this Chrome API is experimental and may not serve all cases yet.
     */
    public static experimentalLetterSpacing = false;

    /**
     * A Unicode "character", or "grapheme cluster", can be composed of multiple Unicode code points,
     * such as letters with diacritical marks (e.g. `'\u0065\u0301'`, letter e with acute)
     * or emojis with modifiers (e.g. `'\uD83E\uDDD1\u200D\uD83D\uDCBB'`, technologist).
     * The new `Intl.Segmenter` API in ES2022 can split the string into grapheme clusters correctly. If it is not available,
     * PixiJS will fallback to use the iterator of String, which can only spilt the string into code points.
     * If you want to get full functionality in environments that don't support `Intl.Segmenter` (such as Firefox),
     * you can use other libraries such as [grapheme-splitter]{@link https://www.npmjs.com/package/grapheme-splitter}
     * or [graphemer]{@link https://www.npmjs.com/package/graphemer} to create a polyfill. Since these libraries can be
     * relatively large in size to handle various Unicode grapheme clusters properly, PixiJS won't use them directly.
     */
    public static graphemeSegmenter: (s: string) => string[] = (() =>
    {
        if (typeof (Intl as IIntl)?.Segmenter === 'function')
        {
            const segmenter = new (Intl as IIntl).Segmenter();

            return (s: string) => [...segmenter.segment(s)].map((x) => x.segment);
        }

        return (s: string) => [...s];
    })();

    /** The canvas element that everything is drawn to. */
    public canvas: ICanvas;
    /** The canvas 2d context that everything is drawn with. */
    public context: ModernContext2D;
    public localStyleID: number;
    public dirty: boolean;

    /**
     * The resolution / device pixel ratio of the canvas.
     *
     * This is set to automatically match the renderer resolution by default, but can be overridden by setting manually.
     * @default PIXI.settings.RESOLUTION
     */
    _resolution: number;
    _autoResolution: boolean;

    /**
     * Private tracker for the current text.
     * @private
     */
    protected _text: string;

    /**
     * Private tracker for the current font.
     * @private
     */
    protected _font: string;

    /**
     * Private tracker for the current style.
     * @private
     */
    protected _style: TextStyle;

    /**
     * Private listener to track style changes.
     * @private
     */
    protected _styleListener: () => void;

    /**
     * Keep track if this Text object created it's own canvas
     * element (`true`) or uses the constructor argument (`false`).
     * Used to workaround a GC issues with Safari < 13 when
     * destroying Text. See `destroy` for more info.
     */
    private _ownCanvas: boolean;

    /**
     * @param text - The string that you would like the text to display
     * @param {object|PIXI.TextStyle} [style] - The style parameters
     * @param canvas - The canvas element for drawing text
     */
    constructor(text?: string | number, style?: Partial<ITextStyle> | TextStyle, canvas?: ICanvas)
    {
        let ownCanvas = false;

        if (!canvas)
        {
            canvas = settings.ADAPTER.createCanvas();
            ownCanvas = true;
        }

        canvas.width = 3;
        canvas.height = 3;

        const texture = Texture.from(canvas);

        texture.orig = new Rectangle();
        texture.trim = new Rectangle();

        super(texture);

        this._ownCanvas = ownCanvas;
        this.canvas = canvas;
        this.context = canvas.getContext('2d', {
            // required for trimming to work without warnings
            willReadFrequently: true,
        });

        this._resolution = settings.RESOLUTION;
        this._autoResolution = true;
        this._text = null;
        this._style = null;
        this._styleListener = null;
        this._font = '';

        this.text = text;
        this.style = style;

        this.localStyleID = -1;
    }

    /**
     * Renders text to its canvas, and updates its texture.
     *
     * By default this is used internally to ensure the texture is correct before rendering,
     * but it can be used called externally, for example from this class to 'pre-generate' the texture from a piece of text,
     * and then shared across multiple Sprites.
     * @param respectDirty - Whether to abort updating the text if the Text isn't dirty and the function is called.
     */
    public updateText(respectDirty: boolean): void
    {
        const style = this._style;

        // check if style has changed..
        if (this.localStyleID !== style.styleID)
        {
            this.dirty = true;
            this.localStyleID = style.styleID;
        }

        if (!this.dirty && respectDirty)
        {
            return;
        }

        this._font = this._style.toFontString();

        const context = this.context;
        const measured = TextMetrics.measureText(this._text || ' ', this._style, this._style.wordWrap, this.canvas);
        const width = measured.width;
        const height = measured.height;
        const lines = measured.lines;
        const lineHeight = measured.lineHeight;
        const lineWidths = measured.lineWidths;
        const maxLineWidth = measured.maxLineWidth;
        const fontProperties = measured.fontProperties;

        this.canvas.width = Math.ceil(Math.ceil((Math.max(1, width) + (style.padding * 2))) * this._resolution);
        this.canvas.height = Math.ceil(Math.ceil((Math.max(1, height) + (style.padding * 2))) * this._resolution);

        context.scale(this._resolution, this._resolution);

        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        context.font = this._font;
        context.lineWidth = style.strokeThickness;
        context.textBaseline = style.textBaseline;
        context.lineJoin = style.lineJoin;
        context.miterLimit = style.miterLimit;

        let linePositionX: number;
        let linePositionY: number;

        // require 2 passes if a shadow; the first to draw the drop shadow, the second to draw the text
        const passesCount = style.dropShadow ? 2 : 1;

        // For v4, we drew text at the colours of the drop shadow underneath the normal text. This gave the correct zIndex,
        // but features such as alpha and shadowblur did not look right at all, since we were using actual text as a shadow.
        //
        // For v5.0.0, we moved over to just use the canvas API for drop shadows, which made them look much nicer and more
        // visually please, but now because the stroke is drawn and then the fill, drop shadows would appear on both the fill
        // and the stroke; and fill drop shadows would appear over the top of the stroke.
        //
        // For v5.1.1, the new route is to revert to v4 style of drawing text first to get the drop shadows underneath normal
        // text, but instead drawing text in the correct location, we'll draw it off screen (-paddingY), and then adjust the
        // drop shadow so only that appears on screen (+paddingY). Now we'll have the correct draw order of the shadow
        // beneath the text, whilst also having the proper text shadow styling.
        for (let i = 0; i < passesCount; ++i)
        {
            const isShadowPass = style.dropShadow && i === 0;
            // we only want the drop shadow, so put text way off-screen
            const dsOffsetText = isShadowPass ? Math.ceil(Math.max(1, height) + (style.padding * 2)) : 0;
            const dsOffsetShadow = dsOffsetText * this._resolution;

            if (isShadowPass)
            {
                // On Safari, text with gradient and drop shadows together do not position correctly
                // if the scale of the canvas is not 1: https://bugs.webkit.org/show_bug.cgi?id=197689
                // Therefore we'll set the styles to be a plain black whilst generating this drop shadow
                context.fillStyle = 'black';
                context.strokeStyle = 'black';

                const dropShadowColor = style.dropShadowColor;
                const rgb = utils.hex2rgb(typeof dropShadowColor === 'number'
                    ? dropShadowColor
                    : utils.string2hex(dropShadowColor));
                const dropShadowBlur = style.dropShadowBlur * this._resolution;
                const dropShadowDistance = style.dropShadowDistance * this._resolution;

                context.shadowColor = `rgba(${rgb[0] * 255},${rgb[1] * 255},${rgb[2] * 255},${style.dropShadowAlpha})`;
                context.shadowBlur = dropShadowBlur;
                context.shadowOffsetX = Math.cos(style.dropShadowAngle) * dropShadowDistance;
                context.shadowOffsetY = (Math.sin(style.dropShadowAngle) * dropShadowDistance) + dsOffsetShadow;
            }
            else
            {
                // set canvas text styles
                context.fillStyle = this._generateFillStyle(style, lines, measured);
                // TODO: Can't have different types for getter and setter. The getter shouldn't have the number type as
                //       the setter converts to string. See this thread for more details:
                //       https://github.com/microsoft/TypeScript/issues/2521
                context.strokeStyle = style.stroke as string;

                context.shadowColor = 'black';
                context.shadowBlur = 0;
                context.shadowOffsetX = 0;
                context.shadowOffsetY = 0;
            }

            let linePositionYShift = (lineHeight - fontProperties.fontSize) / 2;

            if (lineHeight - fontProperties.fontSize < 0)
            {
                linePositionYShift = 0;
            }

            // draw lines line by line
            for (let i = 0; i < lines.length; i++)
            {
                linePositionX = style.strokeThickness / 2;
                linePositionY = ((style.strokeThickness / 2) + (i * lineHeight)) + fontProperties.ascent
                    + linePositionYShift;

                if (style.align === 'right')
                {
                    linePositionX += maxLineWidth - lineWidths[i];
                }
                else if (style.align === 'center')
                {
                    linePositionX += (maxLineWidth - lineWidths[i]) / 2;
                }

                if (style.stroke && style.strokeThickness)
                {
                    this.drawLetterSpacing(
                        lines[i],
                        linePositionX + style.padding,
                        linePositionY + style.padding - dsOffsetText,
                        true
                    );
                }

                if (style.fill)
                {
                    this.drawLetterSpacing(
                        lines[i],
                        linePositionX + style.padding,
                        linePositionY + style.padding - dsOffsetText
                    );
                }
            }
        }

        this.updateTexture();
    }

    /**
     * Render the text with letter-spacing.
     * @param text - The text to draw
     * @param x - Horizontal position to draw the text
     * @param y - Vertical position to draw the text
     * @param isStroke - Is this drawing for the outside stroke of the
     *  text? If not, it's for the inside fill
     */
    private drawLetterSpacing(text: string, x: number, y: number, isStroke = false): void
    {
        const style = this._style;

        // letterSpacing of 0 means normal
        const letterSpacing = style.letterSpacing;

        // Checking that we can use moddern canvas2D api
        // https://developer.chrome.com/origintrials/#/view_trial/3585991203293757441
        // note: this is unstable API, Chrome less 94 use a `textLetterSpacing`, newest use a letterSpacing
        // eslint-disable-next-line max-len
        const supportLetterSpacing = Text.experimentalLetterSpacing
            && ('letterSpacing' in CanvasRenderingContext2D.prototype
                || 'textLetterSpacing' in CanvasRenderingContext2D.prototype);

        if (letterSpacing === 0 || supportLetterSpacing)
        {
            if (supportLetterSpacing)
            {
                this.context.letterSpacing = letterSpacing;
                this.context.textLetterSpacing = letterSpacing;
            }

            if (isStroke)
            {
                this.context.strokeText(text, x, y);
            }
            else
            {
                this.context.fillText(text, x, y);
            }

            return;
        }

        let currentPosition = x;

        const stringArray = Text.graphemeSegmenter(text);
        let previousWidth = this.context.measureText(text).width;
        let currentWidth = 0;

        for (let i = 0; i < stringArray.length; ++i)
        {
            const currentChar = stringArray[i];

            if (isStroke)
            {
                this.context.strokeText(currentChar, currentPosition, y);
            }
            else
            {
                this.context.fillText(currentChar, currentPosition, y);
            }
            let textStr = '';

            for (let j = i + 1; j < stringArray.length; ++j)
            {
                textStr += stringArray[j];
            }
            currentWidth = this.context.measureText(textStr).width;
            currentPosition += previousWidth - currentWidth + letterSpacing;
            previousWidth = currentWidth;
        }
    }

    /** Updates texture size based on canvas size. */
    private updateTexture(): void
    {
        const canvas = this.canvas;

        if (this._style.trim)
        {
            const trimmed = utils.trimCanvas(canvas);

            if (trimmed.data)
            {
                canvas.width = trimmed.width;
                canvas.height = trimmed.height;
                this.context.putImageData(trimmed.data, 0, 0);
            }
        }

        const texture = this._texture;
        const style = this._style;
        const padding = style.trim ? 0 : style.padding;
        const baseTexture = texture.baseTexture;

        texture.trim.width = texture._frame.width = canvas.width / this._resolution;
        texture.trim.height = texture._frame.height = canvas.height / this._resolution;
        texture.trim.x = -padding;
        texture.trim.y = -padding;

        texture.orig.width = texture._frame.width - (padding * 2);
        texture.orig.height = texture._frame.height - (padding * 2);

        // call sprite onTextureUpdate to update scale if _width or _height were set
        this._onTextureUpdate();

        baseTexture.setRealSize(canvas.width, canvas.height, this._resolution);

        texture.updateUvs();

        this.dirty = false;
    }

    /**
     * Renders the object using the WebGL renderer
     * @param renderer - The renderer
     */
    protected _render(renderer: Renderer): void
    {
        if (this._autoResolution && this._resolution !== renderer.resolution)
        {
            this._resolution = renderer.resolution;
            this.dirty = true;
        }

        this.updateText(true);

        super._render(renderer);
    }

    /** Updates the transform on all children of this container for rendering. */
    public updateTransform(): void
    {
        this.updateText(true);

        super.updateTransform();
    }

    public getBounds(skipUpdate?: boolean, rect?: Rectangle): Rectangle
    {
        this.updateText(true);

        if (this._textureID === -1)
        {
            // texture was updated: recalculate transforms
            skipUpdate = false;
        }

        return super.getBounds(skipUpdate, rect);
    }

    /**
     * Gets the local bounds of the text object.
     * @param rect - The output rectangle.
     * @returns The bounds.
     */
    public getLocalBounds(rect?: Rectangle): Rectangle
    {
        this.updateText(true);

        return super.getLocalBounds.call(this, rect);
    }

    /** Calculates the bounds of the Text as a rectangle. The bounds calculation takes the worldTransform into account. */
    protected _calculateBounds(): void
    {
        this.calculateVertices();
        // if we have already done this on THIS frame.
        this._bounds.addQuad(this.vertexData);
    }

    /**
     * Generates the fill style. Can automatically generate a gradient based on the fill style being an array
     * @param style - The style.
     * @param lines - The lines of text.
     * @param metrics
     * @returns The fill style
     */
    private _generateFillStyle(
        style: TextStyle, lines: string[], metrics: TextMetrics
    ): string | CanvasGradient | CanvasPattern
    {
        // TODO: Can't have different types for getter and setter. The getter shouldn't have the number type as
        //       the setter converts to string. See this thread for more details:
        //       https://github.com/microsoft/TypeScript/issues/2521
        const fillStyle: string | string[] | CanvasGradient | CanvasPattern = style.fill as any;

        if (!Array.isArray(fillStyle))
        {
            return fillStyle;
        }
        else if (fillStyle.length === 1)
        {
            return fillStyle[0];
        }

        // the gradient will be evenly spaced out according to how large the array is.
        // ['#FF0000', '#00FF00', '#0000FF'] would created stops at 0.25, 0.5 and 0.75
        let gradient: string[] | CanvasGradient;

        // a dropshadow will enlarge the canvas and result in the gradient being
        // generated with the incorrect dimensions
        const dropShadowCorrection = (style.dropShadow) ? style.dropShadowDistance : 0;

        // should also take padding into account, padding can offset the gradient
        const padding = style.padding || 0;

        const width = (this.canvas.width / this._resolution) - dropShadowCorrection - (padding * 2);
        const height = (this.canvas.height / this._resolution) - dropShadowCorrection - (padding * 2);

        // make a copy of the style settings, so we can manipulate them later
        const fill = fillStyle.slice();
        const fillGradientStops = style.fillGradientStops.slice();

        // wanting to evenly distribute the fills. So an array of 4 colours should give fills of 0.25, 0.5 and 0.75
        if (!fillGradientStops.length)
        {
            const lengthPlus1 = fill.length + 1;

            for (let i = 1; i < lengthPlus1; ++i)
            {
                fillGradientStops.push(i / lengthPlus1);
            }
        }

        // stop the bleeding of the last gradient on the line above to the top gradient of the this line
        // by hard defining the first gradient colour at point 0, and last gradient colour at point 1
        fill.unshift(fillStyle[0]);
        fillGradientStops.unshift(0);

        fill.push(fillStyle[fillStyle.length - 1]);
        fillGradientStops.push(1);

        if (style.fillGradientType === TEXT_GRADIENT.LINEAR_VERTICAL)
        {
            // start the gradient at the top center of the canvas, and end at the bottom middle of the canvas
            gradient = this.context.createLinearGradient(width / 2, padding, width / 2, height + padding);

            // we need to repeat the gradient so that each individual line of text has the same vertical gradient effect
            // ['#FF0000', '#00FF00', '#0000FF'] over 2 lines would create stops at 0.125, 0.25, 0.375, 0.625, 0.75, 0.875

            // Actual height of the text itself, not counting spacing for lineHeight/leading/dropShadow etc
            const textHeight = metrics.fontProperties.fontSize + style.strokeThickness;

            for (let i = 0; i < lines.length; i++)
            {
                const lastLineBottom = (metrics.lineHeight * (i - 1)) + textHeight;
                const thisLineTop = metrics.lineHeight * i;
                let thisLineGradientStart = thisLineTop;

                // Handle case where last & this line overlap
                if (i > 0 && lastLineBottom > thisLineTop)
                {
                    thisLineGradientStart = (thisLineTop + lastLineBottom) / 2;
                }

                const thisLineBottom = thisLineTop + textHeight;
                const nextLineTop = metrics.lineHeight * (i + 1);
                let thisLineGradientEnd = thisLineBottom;

                // Handle case where this & next line overlap
                if (i + 1 < lines.length && nextLineTop < thisLineBottom)
                {
                    thisLineGradientEnd = (thisLineBottom + nextLineTop) / 2;
                }

                // textHeight, but as a 0-1 size in global gradient stop space
                const gradStopLineHeight = (thisLineGradientEnd - thisLineGradientStart) / height;

                for (let j = 0; j < fill.length; j++)
                {
                    // 0-1 stop point for the current line, multiplied to global space afterwards
                    let lineStop = 0;

                    if (typeof fillGradientStops[j] === 'number')
                    {
                        lineStop = fillGradientStops[j];
                    }
                    else
                    {
                        lineStop = j / fill.length;
                    }

                    let globalStop = Math.min(1, Math.max(0,
                        (thisLineGradientStart / height) + (lineStop * gradStopLineHeight)));

                    // There's potential for floating point precision issues at the seams between gradient repeats.
                    globalStop = Number(globalStop.toFixed(5));
                    gradient.addColorStop(globalStop, fill[j]);
                }
            }
        }
        else
        {
            // start the gradient at the center left of the canvas, and end at the center right of the canvas
            gradient = this.context.createLinearGradient(padding, height / 2, width + padding, height / 2);

            // can just evenly space out the gradients in this case, as multiple lines makes no difference
            // to an even left to right gradient
            const totalIterations = fill.length + 1;
            let currentIteration = 1;

            for (let i = 0; i < fill.length; i++)
            {
                let stop: number;

                if (typeof fillGradientStops[i] === 'number')
                {
                    stop = fillGradientStops[i];
                }
                else
                {
                    stop = currentIteration / totalIterations;
                }
                gradient.addColorStop(stop, fill[i]);
                currentIteration++;
            }
        }

        return gradient;
    }

    /**
     * Destroys this text object.
     *
     * Note* Unlike a Sprite, a Text object will automatically destroy its baseTexture and texture as
     * the majority of the time the texture will not be shared with any other Sprites.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their
     *  destroy method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=true] - Should it destroy the current texture of the sprite as well
     * @param {boolean} [options.baseTexture=true] - Should it destroy the base texture of the sprite as well
     */
    public destroy(options?: IDestroyOptions | boolean): void
    {
        if (typeof options === 'boolean')
        {
            options = { children: options };
        }

        options = Object.assign({}, defaultDestroyOptions, options);

        super.destroy(options);

        // set canvas width and height to 0 to workaround memory leak in Safari < 13
        // https://stackoverflow.com/questions/52532614/total-canvas-memory-use-exceeds-the-maximum-limit-safari-12
        if (this._ownCanvas)
        {
            this.canvas.height = this.canvas.width = 0;
        }

        // make sure to reset the context and canvas.. dont want this hanging around in memory!
        this.context = null;
        this.canvas = null;

        this._style = null;
    }

    /** The width of the Text, setting this will actually modify the scale to achieve the value set. */
    get width(): number
    {
        this.updateText(true);

        return Math.abs(this.scale.x) * this._texture.orig.width;
    }

    set width(value: number)
    {
        this.updateText(true);

        const s = utils.sign(this.scale.x) || 1;

        this.scale.x = s * value / this._texture.orig.width;
        this._width = value;
    }

    /** The height of the Text, setting this will actually modify the scale to achieve the value set. */
    get height(): number
    {
        this.updateText(true);

        return Math.abs(this.scale.y) * this._texture.orig.height;
    }

    set height(value: number)
    {
        this.updateText(true);

        const s = utils.sign(this.scale.y) || 1;

        this.scale.y = s * value / this._texture.orig.height;
        this._height = value;
    }

    /**
     * Set the style of the text.
     *
     * Set up an event listener to listen for changes on the style object and mark the text as dirty.
     */
    get style(): TextStyle | Partial<ITextStyle>
    {
        // TODO: Can't have different types for getter and setter. The getter shouldn't have the ITextStyle
        //       since the setter creates the TextStyle. See this thread for more details:
        //       https://github.com/microsoft/TypeScript/issues/2521
        return this._style;
    }

    set style(style: TextStyle | Partial<ITextStyle>)
    {
        style = style || {};

        if (style instanceof TextStyle)
        {
            this._style = style;
        }
        else
        {
            this._style = new TextStyle(style);
        }

        this.localStyleID = -1;
        this.dirty = true;
    }

    /** Set the copy for the text object. To split a line you can use '\n'. */
    get text(): string
    {
        return this._text;
    }

    set text(text: string | number)
    {
        text = String(text === null || text === undefined ? '' : text);

        if (this._text === text)
        {
            return;
        }
        this._text = text;
        this.dirty = true;
    }

    /**
     * The resolution / device pixel ratio of the canvas.
     *
     * This is set to automatically match the renderer resolution by default, but can be overridden by setting manually.
     * @default 1
     */
    get resolution(): number
    {
        return this._resolution;
    }

    set resolution(value: number)
    {
        this._autoResolution = false;

        if (this._resolution === value)
        {
            return;
        }

        this._resolution = value;
        this.dirty = true;
    }
}
