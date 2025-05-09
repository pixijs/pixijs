import { Color } from '../../../color/Color';
import { ExtensionType } from '../../../extensions/Extensions';
import { type Filter } from '../../../filters/Filter';
import { CanvasPool } from '../../../rendering/renderers/shared/texture/CanvasPool';
import { TexturePool } from '../../../rendering/renderers/shared/texture/TexturePool';
import { TextureStyle } from '../../../rendering/renderers/shared/texture/TextureStyle';
import { getCanvasBoundingBox } from '../../../utils/canvas/getCanvasBoundingBox';
import { deprecation } from '../../../utils/logging/deprecation';
import { type CanvasTextOptions } from '../Text';
import { TextStyle } from '../TextStyle';
import { getPo2TextureFromSource } from '../utils/getPo2TextureFromSource';
import { CanvasTextMetrics } from './CanvasTextMetrics';
import { fontStringFromTextStyle } from './utils/fontStringFromTextStyle';
import { getCanvasFillStyle } from './utils/getCanvasFillStyle';

import type { ICanvas } from '../../../environment/canvas/ICanvas';
import type { ICanvasRenderingContext2D } from '../../../environment/canvas/ICanvasRenderingContext2D';
import type { System } from '../../../rendering/renderers/shared/system/System';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { Renderer } from '../../../rendering/renderers/types';

interface CanvasAndContext
{
    canvas: ICanvas;
    context: ICanvasRenderingContext2D;
}

/**
 * System plugin to the renderer to manage canvas text.
 * @memberof rendering
 */
export class CanvasTextSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'canvasText',
    } as const;

    private readonly _renderer: Renderer;

    constructor(_renderer: Renderer)
    {
        this._renderer = _renderer;
    }

    /**
     * This is a function that will create a texture from a text string, style and resolution.
     * Useful if you want to make a texture of your text and use if for various other pixi things!
     * @param options - The options of the text that will be used to generate the texture.
     * @param options.text - the text to render
     * @param options.style - the style of the text
     * @param options.resolution - the resolution of the texture
     * @returns the newly created texture
     */
    /** @deprecated since 8.0.0 */
    public getTexture(text: string, resolution: number, style: TextStyle, textKey: string): Texture;
    public getTexture(options: CanvasTextOptions): Texture;
    public getTexture(
        options: CanvasTextOptions | string,
        resolution?: number,
        style?: TextStyle,
        _textKey?: string
    ): Texture
    {
        if (typeof options === 'string')
        {
            // #if _DEBUG
            deprecation('8.0.0', 'CanvasTextSystem.getTexture: Use object TextOptions instead of separate arguments');
            // #endif

            options = {
                text: options,
                style,
                resolution,
            };
        }

        if (!(options.style instanceof TextStyle))
        {
            options.style = new TextStyle(options.style);
        }

        if (!(options.textureStyle instanceof TextureStyle))
        {
            options.textureStyle = new TextureStyle(options.textureStyle);
        }

        if (typeof options.text !== 'string')
        {
            options.text = options.text.toString();
        }

        const { texture, canvasAndContext } = this.createTextureAndCanvas(
            options as { text: string, style: TextStyle, resolution?: number, textureStyle?: TextureStyle }
        );

        CanvasPool.returnCanvasAndContext(canvasAndContext);

        return texture;
    }

    public createTextureAndCanvas(options: {
        text: string,
        style: TextStyle,
        resolution?: number,
        textureStyle?: TextureStyle
    })
    {
        const { text, style, textureStyle } = options;

        const padding = style._getFinalPadding();

        const resolution = options.resolution ?? this._renderer.resolution;

        // create a canvas with the word hello on it
        const measured = CanvasTextMetrics.measureText(text || ' ', style);

        const width = Math.ceil(Math.ceil((Math.max(1, measured.width) + (padding * 2))) * resolution);
        const height = Math.ceil(Math.ceil((Math.max(1, measured.height) + (padding * 2))) * resolution);

        const canvasAndContext = CanvasPool.getOptimalCanvasAndContext(width, height);

        // create a texture from the canvas
        const { canvas } = canvasAndContext;

        this._renderTextToCanvas(text, style, padding, resolution, canvasAndContext);

        const texture = getPo2TextureFromSource(canvas, width, height, resolution);

        if (textureStyle) texture.source.style = textureStyle;

        if (style.trim)
        {
            const trimmed = getCanvasBoundingBox(canvas, resolution);

            texture.frame.copyFrom(trimmed);

            texture.updateUvs();
        }

        if (style.filters)
        {
            // apply the filters to the texture if required..
            // this returns a new texture with the filters applied
            const filteredTexture = this._applyFilters(texture, style.filters);

            // return the original texture to the pool so we can reuse the next frame
            this.returnTexture(texture);

            // return the new texture with the filters applied
            return { texture: filteredTexture, canvasAndContext };
        }

        this._renderer.texture.initSource(texture._source);

        return { texture, canvasAndContext };
    }

    /**
     * Returns a texture that was created wit the above `getTexture` function.
     * Handy if you are done with a texture and want to return it to the pool.
     * @param texture - The texture to be returned.
     */
    public returnTexture(texture: Texture)
    {
        const source = texture.source;

        source.resource = null;
        source.uploadMethodId = 'unknown';
        source.alphaMode = 'no-premultiply-alpha';

        TexturePool.returnTexture(texture, true);
    }

    /**
     * Renders text to its canvas, and updates its texture.
     * @param text
     * @param style
     * @param resolution
     * @param canvasAndContext
     * @param padding
     * @deprecated since 8.8.0
     */
    public renderTextToCanvas(
        text: string,
        style: TextStyle,
        resolution: number,
        canvasAndContext: CanvasAndContext,
        padding: number,
    ): void
    {
        deprecation('8.8.0', 'CanvasTextSystem.renderTextToCanvas: is now private');

        this._renderTextToCanvas(text, style, padding, resolution, canvasAndContext);
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
     * @param text - The text to draw
     * @param style
     * @param canvasAndContext
     * @param x - Horizontal position to draw the text
     * @param y - Vertical position to draw the text
     * @param isStroke - Is this drawing for the outside stroke of the
     *  text? If not, it's for the inside fill
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

    /**
     * Applies the specified filters to the given texture.
     *
     * This method takes a texture and a list of filters, applies the filters to the texture,
     * and returns the resulting texture. It also ensures that the alpha mode of the resulting
     * texture is set to 'premultiplied-alpha'.
     * @param {Texture} texture - The texture to which the filters will be applied.
     * @param {Filter[]} filters - The filters to apply to the texture.
     * @returns {Texture} The resulting texture after all filters have been applied.
     */
    private _applyFilters(texture: Texture, filters: Filter[]): Texture
    {
        // Save the current render target so it can be restored later
        const currentRenderTarget = this._renderer.renderTarget.renderTarget;

        // Apply the filters to the texture and get the resulting texture
        const resultTexture = this._renderer.filter.generateFilteredTexture({
            texture,
            filters,
        });

        // Set the alpha mode of the resulting texture to 'premultiplied-alpha'

        // Restore the previous render target
        this._renderer.renderTarget.bind(currentRenderTarget, false);

        // Return the resulting texture with the filters applied
        return resultTexture;
    }

    public destroy(): void
    {
        (this._renderer as null) = null;
    }
}
