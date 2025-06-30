import { Color } from '../../../color/Color';
import { Rectangle } from '../../../maths/shapes/Rectangle';
import { type CanvasAndContext, CanvasPool } from '../../../rendering/renderers/shared/texture/CanvasPool';
import { getCanvasBoundingBox } from '../../../utils/canvas/getCanvasBoundingBox';
import { type TextStyle } from '../TextStyle';
import { CanvasTextMetrics } from './CanvasTextMetrics';
import { fontStringFromTextStyle } from './utils/fontStringFromTextStyle';
import { getCanvasFillStyle } from './utils/getCanvasFillStyle';

/**
 * Temporary rectangle for getting the bounding box of the text.
 * @internal
 */
const tempRect = new Rectangle();

/**
 * Utility for generating and managing canvas-based text rendering.
 *
 * This class is responsible for rendering text to canvas elements based on provided styles,
 * measuring the resulting text dimensions, and managing the lifecycle of canvas resources.
 *
 * CanvasTextGenerator supports:
 * - Text rendering with various styles (fill, stroke, gradient, etc.)
 * - Drop shadows and letter spacing
 * - Automatic trimming of transparent pixels
 * - Canvas resource pooling
 *
 * As a singleton, it's accessed via the exported `CanvasTextGenerator` constant.
 * @example
 * ```typescript
 * // Basic usage - render text to a canvas
 * import { CanvasTextGenerator } from 'pixi.js';
 * import { TextStyle } from 'pixi.js';
 *
 * // Create a text style
 * const style = new TextStyle({
 *   fontFamily: 'Arial',
 *   fontSize: 24,
 *   fill: 0xff1010,
 *   align: 'center',
 * });
 *
 * // Get a canvas with the text rendered to it
 * const { canvasAndContext, frame } = CanvasTextGenerator.getCanvasAndContext({
 *   text: 'Hello Pixi!',
 *   style,
 *   resolution: 1
 * });
 *
 * @internal
 */
class CanvasTextGeneratorClass
{
    /**
     * Creates a canvas with the specified text rendered to it.
     *
     * Generates a canvas of appropriate size, renders the text with the provided style,
     * and returns both the canvas/context and a Rectangle representing the text bounds.
     *
     * When trim is enabled in the style, the frame will represent the bounds of the
     * non-transparent pixels, which can be smaller than the full canvas.
     * @param options - The options for generating the text canvas
     * @param options.text - The text to render
     * @param options.style - The style to apply to the text
     * @param options.resolution - The resolution of the canvas (defaults to 1)
     * @param options.padding
     * @returns An object containing the canvas/context and the frame (bounds) of the text
     */
    public getCanvasAndContext(options: {text: string, style: TextStyle, resolution?: number, padding?: number})
    {
        const { text, style, resolution = 1 } = options;

        const padding = (style as TextStyle)._getFinalPadding();

        // create a canvas with the word hello on it
        const measured = CanvasTextMetrics.measureText(text || ' ', style);

        const width = Math.ceil(Math.ceil((Math.max(1, measured.width) + (padding * 2))) * resolution);
        const height = Math.ceil(Math.ceil((Math.max(1, measured.height) + (padding * 2))) * resolution);

        const canvasAndContext = CanvasPool.getOptimalCanvasAndContext(width, height);

        this._renderTextToCanvas(text, style, padding, resolution, canvasAndContext);

        const frame = style.trim
            ? getCanvasBoundingBox({ canvas: canvasAndContext.canvas, width, height, resolution: 1, output: tempRect })
            : tempRect.set(0, 0, width, height);

        return {
            canvasAndContext,
            frame
        };
    }

    /**
     * Returns a canvas and context to the pool.
     *
     * This should be called when you're done with the canvas to allow reuse
     * and prevent memory leaks.
     * @param canvasAndContext - The canvas and context to return to the pool
     */
    public returnCanvasAndContext(canvasAndContext: CanvasAndContext): void
    {
        CanvasPool.returnCanvasAndContext(canvasAndContext);
    }

    /**
     * Renders text to its canvas, and updates its texture.
     * @param text - The text to render
     * @param style - The style of the text
     * @param padding - The padding of the text
     * @param resolution - The resolution of the text
     * @param canvasAndContext - The canvas and context to render the text to
     */
    private _renderTextToCanvas(
        text: string,
        style: TextStyle,
        padding: number,
        resolution: number,
        canvasAndContext: CanvasAndContext
    ): void
    {
        const { canvas, context } = canvasAndContext;

        const font = fontStringFromTextStyle(style);

        const measured = CanvasTextMetrics.measureText(text || ' ', style);// , canvas);
        const lines = measured.lines;
        const lineHeight = measured.lineHeight;
        const lineWidths = measured.lineWidths;
        const maxLineWidth = measured.maxLineWidth;
        const fontProperties = measured.fontProperties;

        const height = canvas.height;

        context.resetTransform();
        context.scale(resolution, resolution);
        context.textBaseline = style.textBaseline;

        // set stroke styles..

        if (style._stroke?.width)
        {
            const strokeStyle = style._stroke;

            context.lineWidth = strokeStyle.width;

            context.miterLimit = strokeStyle.miterLimit;
            context.lineJoin = strokeStyle.join;
            context.lineCap = strokeStyle.cap;
        }

        // return;
        context.font = font;

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
            const dsOffsetText = isShadowPass ? Math.ceil(Math.max(1, height) + (padding * 2)) : 0;
            const dsOffsetShadow = dsOffsetText * resolution;

            if (isShadowPass)
            {
                // On Safari, text with gradient and drop shadows together do not position correctly
                // if the scale of the canvas is not 1: https://bugs.webkit.org/show_bug.cgi?id=197689
                // Therefore we'll set the styles to be a plain black whilst generating this drop shadow
                context.fillStyle = 'black';
                context.strokeStyle = 'black';

                const shadowOptions = style.dropShadow;

                const dropShadowColor = shadowOptions.color;
                const dropShadowAlpha = shadowOptions.alpha;

                context.shadowColor = Color.shared
                    .setValue(dropShadowColor)
                    .setAlpha(dropShadowAlpha)
                    .toRgbaString();

                const dropShadowBlur = shadowOptions.blur * resolution;
                const dropShadowDistance = shadowOptions.distance * resolution;

                context.shadowBlur = dropShadowBlur;
                context.shadowOffsetX = Math.cos(shadowOptions.angle) * dropShadowDistance;
                context.shadowOffsetY = (Math.sin(shadowOptions.angle) * dropShadowDistance) + dsOffsetShadow;
            }
            else
            {
                context.fillStyle = style._fill ? getCanvasFillStyle(style._fill, context, measured) : null;

                if (style._stroke?.width)
                {
                    const padding = style._stroke.width * style._stroke.alignment;

                    context.strokeStyle = getCanvasFillStyle(style._stroke, context, measured, padding);
                }

                context.shadowColor = 'black';
            }

            let linePositionYShift = (lineHeight - fontProperties.fontSize) / 2;

            if (lineHeight - fontProperties.fontSize < 0)
            {
                linePositionYShift = 0;
            }

            const strokeWidth = style._stroke?.width ?? 0;

            // draw lines line by line
            for (let i = 0; i < lines.length; i++)
            {
                linePositionX = strokeWidth / 2;
                linePositionY = ((strokeWidth / 2) + (i * lineHeight)) + fontProperties.ascent + linePositionYShift;

                if (style.align === 'right')
                {
                    linePositionX += maxLineWidth - lineWidths[i];
                }
                else if (style.align === 'center')
                {
                    linePositionX += (maxLineWidth - lineWidths[i]) / 2;
                }

                if (style._stroke?.width)
                {
                    this._drawLetterSpacing(
                        lines[i],
                        style,
                        canvasAndContext,
                        linePositionX + padding,
                        linePositionY + padding - dsOffsetText,
                        true
                    );
                }

                if (style._fill !== undefined)
                {
                    this._drawLetterSpacing(
                        lines[i],
                        style,
                        canvasAndContext,
                        linePositionX + padding,
                        linePositionY + padding - dsOffsetText
                    );
                }
            }
        }
    }

    /**
     * Render the text with letter-spacing.
     *
     * This method handles rendering text with the correct letter spacing, using either:
     * 1. Native letter spacing if supported by the browser
     * 2. Manual letter spacing calculation if not natively supported
     *
     * For manual letter spacing, it calculates the position of each character
     * based on its width and the desired spacing.
     * @param text - The text to draw
     * @param style - The text style to apply
     * @param canvasAndContext - The canvas and context to draw to
     * @param x - Horizontal position to draw the text
     * @param y - Vertical position to draw the text
     * @param isStroke - Whether to render the stroke (true) or fill (false)
     * @private
     */
    private _drawLetterSpacing(
        text: string,
        style: TextStyle,
        canvasAndContext: CanvasAndContext,
        x: number, y: number,
        isStroke = false
    ): void
    {
        const { context } = canvasAndContext;

        // letterSpacing of 0 means normal
        const letterSpacing = style.letterSpacing;

        let useExperimentalLetterSpacing = false;

        if (CanvasTextMetrics.experimentalLetterSpacingSupported)
        {
            if (CanvasTextMetrics.experimentalLetterSpacing)
            {
                context.letterSpacing = `${letterSpacing}px`;
                context.textLetterSpacing = `${letterSpacing}px`;
                useExperimentalLetterSpacing = true;
            }
            else
            {
                context.letterSpacing = '0px';
                context.textLetterSpacing = '0px';
            }
        }

        if (letterSpacing === 0 || useExperimentalLetterSpacing)
        {
            if (isStroke)
            {
                context.strokeText(text, x, y);
            }
            else
            {
                context.fillText(text, x, y);
            }

            return;
        }

        let currentPosition = x;

        const stringArray = CanvasTextMetrics.graphemeSegmenter(text);
        let previousWidth = context.measureText(text).width;
        let currentWidth = 0;

        for (let i = 0; i < stringArray.length; ++i)
        {
            const currentChar = stringArray[i];

            if (isStroke)
            {
                context.strokeText(currentChar, currentPosition, y);
            }
            else
            {
                context.fillText(currentChar, currentPosition, y);
            }
            let textStr = '';

            for (let j = i + 1; j < stringArray.length; ++j)
            {
                textStr += stringArray[j];
            }
            currentWidth = context.measureText(textStr).width;
            currentPosition += previousWidth - currentWidth + letterSpacing;
            previousWidth = currentWidth;
        }
    }
}

/** @internal */
export const CanvasTextGenerator = new CanvasTextGeneratorClass();
