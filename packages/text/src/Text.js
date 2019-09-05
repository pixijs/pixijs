/* eslint max-depth: [2, 8] */
import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';
import { settings } from '@pixi/settings';
import { Rectangle } from '@pixi/math';
import { sign, trimCanvas, hex2rgb, string2hex } from '@pixi/utils';
import { TEXT_GRADIENT } from './const';
import { TextStyle } from './TextStyle';
import { TextMetrics } from './TextMetrics';

const defaultDestroyOptions = {
    texture: true,
    children: false,
    baseTexture: true,
};

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
export class Text extends Sprite
{
    /**
     * @param {string} text - The string that you would like the text to display
     * @param {object|PIXI.TextStyle} [style] - The style parameters
     * @param {HTMLCanvasElement} [canvas] - The canvas element for drawing text
     */
    constructor(text, style, canvas)
    {
        canvas = canvas || document.createElement('canvas');

        canvas.width = 3;
        canvas.height = 3;

        const texture = Texture.from(canvas);

        texture.orig = new Rectangle();
        texture.trim = new Rectangle();

        super(texture);

        /**
         * The canvas element that everything is drawn to
         *
         * @member {HTMLCanvasElement}
         */
        this.canvas = canvas;

        /**
         * The canvas 2d context that everything is drawn with
         * @member {CanvasRenderingContext2D}
         */
        this.context = this.canvas.getContext('2d');

        /**
         * The resolution / device pixel ratio of the canvas.
         * This is set to automatically match the renderer resolution by default, but can be overridden by setting manually.
         * @member {number}
         * @default 1
         */
        this._resolution = settings.RESOLUTION;
        this._autoResolution = true;

        /**
         * Private tracker for the current text.
         *
         * @member {string}
         * @private
         */
        this._text = null;

        /**
         * Private tracker for the current style.
         *
         * @member {object}
         * @private
         */
        this._style = null;
        /**
         * Private listener to track style changes.
         *
         * @member {Function}
         * @private
         */
        this._styleListener = null;

        /**
         * Private tracker for the current font.
         *
         * @member {string}
         * @private
         */
        this._font = '';

        this.text = text;
        this.style = style;

        this.localStyleID = -1;
    }

    /**
     * Renders text and updates it when needed.
     *
     * @private
     * @param {boolean} respectDirty - Whether to abort updating the text if the Text isn't dirty and the function is called.
     */
    updateText(respectDirty)
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

        this.canvas.width = Math.ceil((Math.max(1, width) + (style.padding * 2)) * this._resolution);
        this.canvas.height = Math.ceil((Math.max(1, height) + (style.padding * 2)) * this._resolution);

        context.scale(this._resolution, this._resolution);

        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        context.font = this._font;
        context.lineWidth = style.strokeThickness;
        context.textBaseline = style.textBaseline;
        context.lineJoin = style.lineJoin;
        context.miterLimit = style.miterLimit;

        let linePositionX;
        let linePositionY;

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
            const dsOffsetText = isShadowPass ? height * 2 : 0; // we only want the drop shadow, so put text way off-screen
            const dsOffsetShadow = dsOffsetText * this.resolution;

            if (isShadowPass)
            {
                // On Safari, text with gradient and drop shadows together do not position correctly
                // if the scale of the canvas is not 1: https://bugs.webkit.org/show_bug.cgi?id=197689
                // Therefore we'll set the styles to be a plain black whilst generating this drop shadow
                context.fillStyle = 'black';
                context.strokeStyle = 'black';

                const dropShadowColor = style.dropShadowColor;
                const rgb = hex2rgb(typeof dropShadowColor === 'number' ? dropShadowColor : string2hex(dropShadowColor));

                context.shadowColor = `rgba(${rgb[0] * 255},${rgb[1] * 255},${rgb[2] * 255},${style.dropShadowAlpha})`;
                context.shadowBlur = style.dropShadowBlur;
                context.shadowOffsetX = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
                context.shadowOffsetY = (Math.sin(style.dropShadowAngle) * style.dropShadowDistance) + dsOffsetShadow;
            }
            else
            {
                // set canvas text styles
                context.fillStyle = this._generateFillStyle(style, lines);
                context.strokeStyle = style.stroke;

                context.shadowColor = 0;
                context.shadowBlur = 0;
                context.shadowOffsetX = 0;
                context.shadowOffsetY = 0;
            }

            // draw lines line by line
            for (let i = 0; i < lines.length; i++)
            {
                linePositionX = style.strokeThickness / 2;
                linePositionY = ((style.strokeThickness / 2) + (i * lineHeight)) + fontProperties.ascent;

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
     * @param {string} text - The text to draw
     * @param {number} x - Horizontal position to draw the text
     * @param {number} y - Vertical position to draw the text
     * @param {boolean} [isStroke=false] - Is this drawing for the outside stroke of the
     *  text? If not, it's for the inside fill
     * @private
     */
    drawLetterSpacing(text, x, y, isStroke = false)
    {
        const style = this._style;

        // letterSpacing of 0 means normal
        const letterSpacing = style.letterSpacing;

        if (letterSpacing === 0)
        {
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

        // Using Array.from correctly splits characters whilst keeping emoji together.
        // This is not supported on IE as it requires ES6, so regular text splitting occurs.
        // This also doesn't account for emoji that are multiple emoji put together to make something else.
        // Handling all of this would require a big library itself.
        // https://medium.com/@giltayar/iterating-over-emoji-characters-the-es6-way-f06e4589516
        // https://github.com/orling/grapheme-splitter
        const stringArray = Array.from ? Array.from(text) : text.split('');

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
            currentPosition += this.context.measureText(currentChar).width + letterSpacing;
        }
    }

    /**
     * Updates texture size based on canvas size
     *
     * @private
     */
    updateTexture()
    {
        const canvas = this.canvas;

        if (this._style.trim)
        {
            const trimmed = trimCanvas(canvas);

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

        texture.trim.width = texture._frame.width = Math.ceil(canvas.width / this._resolution);
        texture.trim.height = texture._frame.height = Math.ceil(canvas.height / this._resolution);
        texture.trim.x = -padding;
        texture.trim.y = -padding;

        texture.orig.width = texture._frame.width - (padding * 2);
        texture.orig.height = texture._frame.height - (padding * 2);

        // call sprite onTextureUpdate to update scale if _width or _height were set
        this._onTextureUpdate();

        baseTexture.setRealSize(canvas.width, canvas.height, this._resolution);

        this.dirty = false;
    }

    /**
     * Renders the object using the WebGL renderer
     *
     * @private
     * @param {PIXI.Renderer} renderer - The renderer
     */
    _render(renderer)
    {
        if (this._autoResolution && this._resolution !== renderer.resolution)
        {
            this._resolution = renderer.resolution;
            this.dirty = true;
        }

        this.updateText(true);

        super._render(renderer);
    }

    /**
     * Gets the local bounds of the text object.
     *
     * @param {PIXI.Rectangle} rect - The output rectangle.
     * @return {PIXI.Rectangle} The bounds.
     */
    getLocalBounds(rect)
    {
        this.updateText(true);

        return super.getLocalBounds.call(this, rect);
    }

    /**
     * calculates the bounds of the Text as a rectangle. The bounds calculation takes the worldTransform into account.
     * @protected
     */
    _calculateBounds()
    {
        this.updateText(true);
        this.calculateVertices();
        // if we have already done this on THIS frame.
        this._bounds.addQuad(this.vertexData);
    }

    /**
     * Method to be called upon a TextStyle change.
     * @private
     */
    _onStyleChange()
    {
        this.dirty = true;
    }

    /**
     * Generates the fill style. Can automatically generate a gradient based on the fill style being an array
     *
     * @private
     * @param {object} style - The style.
     * @param {string[]} lines - The lines of text.
     * @return {string|number|CanvasGradient} The fill style
     */
    _generateFillStyle(style, lines)
    {
        if (!Array.isArray(style.fill))
        {
            return style.fill;
        }
        else if (style.fill.length === 1)
        {
            return style.fill[0];
        }

        // the gradient will be evenly spaced out according to how large the array is.
        // ['#FF0000', '#00FF00', '#0000FF'] would created stops at 0.25, 0.5 and 0.75
        let gradient;
        let totalIterations;
        let currentIteration;
        let stop;

        const width = Math.ceil(this.canvas.width / this._resolution);
        const height = Math.ceil(this.canvas.height / this._resolution);

        // make a copy of the style settings, so we can manipulate them later
        const fill = style.fill.slice();
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
        fill.unshift(style.fill[0]);
        fillGradientStops.unshift(0);

        fill.push(style.fill[style.fill.length - 1]);
        fillGradientStops.push(1);

        if (style.fillGradientType === TEXT_GRADIENT.LINEAR_VERTICAL)
        {
            // start the gradient at the top center of the canvas, and end at the bottom middle of the canvas
            gradient = this.context.createLinearGradient(width / 2, 0, width / 2, height);

            // we need to repeat the gradient so that each individual line of text has the same vertical gradient effect
            // ['#FF0000', '#00FF00', '#0000FF'] over 2 lines would create stops at 0.125, 0.25, 0.375, 0.625, 0.75, 0.875
            totalIterations = (fill.length + 1) * lines.length;
            currentIteration = 0;
            for (let i = 0; i < lines.length; i++)
            {
                currentIteration += 1;
                for (let j = 0; j < fill.length; j++)
                {
                    if (typeof fillGradientStops[j] === 'number')
                    {
                        stop = (fillGradientStops[j] / lines.length) + (i / lines.length);
                    }
                    else
                    {
                        stop = currentIteration / totalIterations;
                    }
                    gradient.addColorStop(stop, fill[j]);
                    currentIteration++;
                }
            }
        }
        else
        {
            // start the gradient at the center left of the canvas, and end at the center right of the canvas
            gradient = this.context.createLinearGradient(0, height / 2, width, height / 2);

            // can just evenly space out the gradients in this case, as multiple lines makes no difference
            // to an even left to right gradient
            totalIterations = fill.length + 1;
            currentIteration = 1;

            for (let i = 0; i < fill.length; i++)
            {
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
    destroy(options)
    {
        if (typeof options === 'boolean')
        {
            options = { children: options };
        }

        options = Object.assign({}, defaultDestroyOptions, options);

        super.destroy(options);

        // make sure to reset the the context and canvas.. dont want this hanging around in memory!
        this.context = null;
        this.canvas = null;

        this._style = null;
    }

    /**
     * The width of the Text, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get width()
    {
        this.updateText(true);

        return Math.abs(this.scale.x) * this._texture.orig.width;
    }

    set width(value) // eslint-disable-line require-jsdoc
    {
        this.updateText(true);

        const s = sign(this.scale.x) || 1;

        this.scale.x = s * value / this._texture.orig.width;
        this._width = value;
    }

    /**
     * The height of the Text, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get height()
    {
        this.updateText(true);

        return Math.abs(this.scale.y) * this._texture.orig.height;
    }

    set height(value) // eslint-disable-line require-jsdoc
    {
        this.updateText(true);

        const s = sign(this.scale.y) || 1;

        this.scale.y = s * value / this._texture.orig.height;
        this._height = value;
    }

    /**
     * Set the style of the text. Set up an event listener to listen for changes on the style
     * object and mark the text as dirty.
     *
     * @member {object|PIXI.TextStyle}
     */
    get style()
    {
        return this._style;
    }

    set style(style) // eslint-disable-line require-jsdoc
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

    /**
     * Set the copy for the text object. To split a line you can use '\n'.
     *
     * @member {string}
     */
    get text()
    {
        return this._text;
    }

    set text(text) // eslint-disable-line require-jsdoc
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
     * This is set to automatically match the renderer resolution by default, but can be overridden by setting manually.
     * @member {number}
     * @default 1
     */
    get resolution()
    {
        return this._resolution;
    }

    set resolution(value) // eslint-disable-line require-jsdoc
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
