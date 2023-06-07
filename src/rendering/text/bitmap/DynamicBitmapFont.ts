import { Rectangle } from '../../../maths/shapes/Rectangle';
import { convertColorToNumber } from '../../../utils/color/convertColorToNumber';
import { hex2rgb } from '../../../utils/color/hex';
import { Runner } from '../../renderers/shared/runner/Runner';
import { CanvasPool } from '../../renderers/shared/texture/CanvasPool';
import { ALPHA_MODES } from '../../renderers/shared/texture/const';
import { ImageSource } from '../../renderers/shared/texture/sources/ImageSource';
import { Texture } from '../../renderers/shared/texture/Texture';
import { CanvasTextMetrics } from '../canvas/CanvasTextMetrics';
import { fontStringFromTextStyle } from '../canvas/utils/fontStringFromTextStyle';
import { getCanvasFillStyle } from '../canvas/utils/getCanvasFillStyle';
import { TextStyle } from '../TextStyle';
import { resolveCharacters } from './utils/resolveCharacters';

import type { ICanvasRenderingContext2D } from '../../../settings/adapter/ICanvasRenderingContext2D';
import type { CanvasAndContext } from '../../renderers/shared/texture/CanvasPool';
import type { FontMetrics } from '../canvas/CanvasTextMetrics';
import type { CharData } from './BitmapFont';

export interface DynamicBitmapFontOptions
{
    style: TextStyle
    overrideFill?: boolean
}

export interface IBitmapFont
{
    baseRenderedFontSize: number
    baseMeasurementFontSize: number
    pages: {texture: Texture}[]
    chars: Record<string, CharData>

    lineHeight: number
    baseLineOffset: number
    fontName: string
    fontMetrics: FontMetrics

    distanceField: {
        fieldType: string
        distanceRange: number
    }

    destroy(): void
}

export class DynamicBitmapFont implements IBitmapFont
{
    onFontDestroy = new Runner('onSourceDestroy');

    baseRenderedFontSize = 100;
    baseMeasurementFontSize = 100;
    padding = 4;

    baseLineOffset = 0;

    pages: {canvasAndContext?: CanvasAndContext, texture: Texture}[] = [];
    chars: Record<string, CharData> = {};
    lineHeight = 0;

    measureCache: Record<string, number> = {};

    currentChars: string[] = [];

    dynamic = true;

    currentX = 0;
    currentY = 0;
    currentPageIndex = -1;
    style: TextStyle;
    fontMetrics: FontMetrics;
    sdf: boolean;
    fontName: string;

    // this is a resolution modifier for the font size..
    // texture resolution will also be used to scale texture according to its font size also
    resolution = 1;

    distanceField = {
        fieldType: 'none',
        distanceRange: 0
    };

    constructor(options: DynamicBitmapFontOptions)
    {
        this.pages = [];

        const dynamicOptions = options;

        this.dynamic = true;

        let style;

        if (dynamicOptions.style instanceof TextStyle)
        {
            style = dynamicOptions.style.clone();
        }
        else
        {
            style = new TextStyle(dynamicOptions.style);
        }

        style.fontSize = this.baseMeasurementFontSize;

        if (dynamicOptions.overrideFill)
        {
            // assuming no shape fill..
            style._fill.color = 0xffffff;
            style._fill.alpha = 1;
            style._fill.texture = Texture.WHITE;
            style._fill.fill = null;
        }

        this.style = style;

        const font = fontStringFromTextStyle(style);

        this.fontMetrics = CanvasTextMetrics.measureFont(font);
        this.lineHeight = style.lineHeight || this.fontMetrics.fontSize || style.fontSize;
    }

    ensureCharacters(chars: string): void
    {
        const charList = resolveCharacters(chars)
            .filter((char) => !this.currentChars.includes(char))
            .filter((char, index, self) => self.indexOf(char) === index);
        // filter returns..

        if (!charList.length) return;

        this.currentChars = [...this.currentChars, ...charList];

        let pageData;

        if (this.currentPageIndex === -1)
        {
            pageData = this.nextPage();
        }
        else
        {
            pageData = this.pages[this.currentPageIndex];
        }

        let { canvas, context } = pageData.canvasAndContext;
        let textureSource = pageData.texture.source;

        const style = this.style;

        let currentX = this.currentX;
        let currentY = this.currentY;

        const fontScale = this.baseRenderedFontSize / this.baseMeasurementFontSize;
        const padding = this.padding * fontScale;

        const widthScale = style.fontStyle === 'italic' ? 2 : 1;
        let maxCharHeight = 0;
        let skipTexture = false;

        for (let i = 0; i < charList.length; i++)
        {
            const char = charList[i];

            const metrics = CanvasTextMetrics.measureText(char, style, canvas, false);

            const width = (widthScale * metrics.width) * fontScale;
            const height = (metrics.height) * fontScale;

            const paddedWidth = width + (padding * 2);
            const paddedHeight = height + (padding * 2);

            skipTexture = false;
            // don't let empty characters count towards the maxCharHeight
            if (char !== '\n' && char !== '\r' && char !== '\t' && char !== ' ')
            {
                skipTexture = true;
                maxCharHeight = Math.ceil(Math.max(paddedHeight, maxCharHeight));// / 1.5;
            }

            if (currentX + paddedWidth > 512)
            {
                currentY += maxCharHeight;

                // reset the line x and height..
                maxCharHeight = paddedHeight;
                currentX = 0;

                if (currentY + maxCharHeight > 512)
                {
                    textureSource.update();

                    const pageData = this.nextPage();

                    canvas = pageData.canvasAndContext.canvas;
                    context = pageData.canvasAndContext.context;
                    textureSource = pageData.texture.source;

                    currentY = 0;
                }
            }

            const xAdvance = (width / fontScale)
                - (style.dropShadow?.distance ?? 0)
                - (style._stroke?.width ?? 0);

            // This is in coord space of the measurements.. not the texture
            this.chars[char] = {
                id: char.codePointAt(0),
                xOffset: -this.padding,
                yOffset: -this.padding,
                xAdvance,
                kerning: {},
            };

            if (skipTexture)
            {
                this.drawGlyph(
                    context,
                    metrics,
                    currentX + padding,
                    currentY + padding,
                    fontScale,
                    style,
                );

                const px = textureSource.width * fontScale;
                const py = textureSource.height * fontScale;

                const frame = new Rectangle(
                    (currentX) / px,
                    (currentY) / py,
                    (paddedWidth) / px,
                    (paddedHeight) / py,
                );

                this.chars[char].texture = new Texture({
                    source: textureSource,
                    layout: {
                        frame
                    }
                });

                currentX += Math.ceil(paddedWidth);
            }

            // now add it to the font data..
        }

        textureSource.update();

        this.currentX = currentX;
        this.currentY = currentY;

        // now apply kerning..
        this.applyKerning(charList, context);
    }

    applyKerning(newChars: string[], context: ICanvasRenderingContext2D): void
    {
        const measureCache = this.measureCache;

        for (let i = 0; i < newChars.length; i++)
        {
            const first = newChars[i];

            for (let j = 0; j < this.currentChars.length; j++)
            {
                // first go through new char being first
                const second = this.currentChars[j];

                let c1 = measureCache[first];

                if (!c1) c1 = measureCache[first] = context.measureText(first).width;

                let c2 = measureCache[second];

                if (!c2) c2 = measureCache[second] = context.measureText(second).width;

                let total = context.measureText(first + second).width;
                let amount = total - (c1 + c2);

                if (amount)
                {
                    this.chars[first].kerning[second] = amount;
                }

                // then go through new char being second
                total = context.measureText(first + second).width;
                amount = total - (c1 + c2);

                if (amount)
                {
                    this.chars[second].kerning[first] = amount;
                }
            }
        }
    }

    nextPage(): {canvasAndContext: CanvasAndContext, texture: Texture}
    {
        this.currentPageIndex++;

        const textureResolution = this.resolution;

        const canvasAndContext = CanvasPool.getOptimalCanvasAndContext(512, 512, textureResolution);

        this.setupContext(canvasAndContext.context, this.style, textureResolution);

        //  canvasAndContext.context.fillStyle = this.currentPageIndex ? 'blue' : 'green';
        // canvasAndContext.context.fillRect(0, 0, 512, 512);

        const resolution = textureResolution * (this.baseRenderedFontSize / this.baseMeasurementFontSize);

        const texture = new Texture({
            source: new ImageSource({
                resource: canvasAndContext.canvas,
                resolution,
                alphaMode: ALPHA_MODES.PMA
            }),

        });

        const pageData = {
            canvasAndContext,
            texture,
        };

        this.pages[this.currentPageIndex] = pageData;

        // document.body.appendChild(canvasAndContext.canvas);
        // canvasAndContext.canvas.style.position = 'absolute';
        // canvasAndContext.canvas.style.top = '400px';
        // canvasAndContext.canvas.style.left = `${this.currentPageIndex * 512}px`;

        return pageData;
    }

    // canvas style!
    setupContext(context: ICanvasRenderingContext2D, style: TextStyle, resolution: number): void
    {
        style.fontSize = this.baseRenderedFontSize;

        context.scale(resolution, resolution);

        context.font = fontStringFromTextStyle(style);

        style.fontSize = this.baseMeasurementFontSize;

        context.textBaseline = style.textBaseline;

        const stroke = style._stroke;

        const strokeThickness = stroke?.width ?? 0;

        if (stroke)
        {
            context.lineWidth = strokeThickness;
            context.lineJoin = stroke.join;
            context.miterLimit = stroke.miterLimit;

            // TODO prolly cache this??
            context.strokeStyle = getCanvasFillStyle(stroke, context);
        }

        if (style._fill)
        {
            // set canvas text styles
            context.fillStyle = getCanvasFillStyle(style._fill, context);
        }

        if (style.dropShadow)
        {
            const shadowOptions = style.dropShadow;

            const dropShadowColor = convertColorToNumber(shadowOptions.color);

            const rgb = hex2rgb(dropShadowColor);

            const dropShadowBlur = shadowOptions.blur * resolution;
            const dropShadowDistance = shadowOptions.distance * resolution;

            context.shadowColor = `rgba(${rgb[0] * 255},${rgb[1] * 255},${rgb[2] * 255},${shadowOptions.alpha})`;
            context.shadowBlur = dropShadowBlur;
            context.shadowOffsetX = Math.cos(shadowOptions.angle) * dropShadowDistance;
            context.shadowOffsetY = Math.sin(shadowOptions.angle) * dropShadowDistance;
        }
        else
        {
            context.shadowColor = 'black';
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
        }
    }

    drawGlyph(
        context: ICanvasRenderingContext2D,
        metrics: CanvasTextMetrics,
        x: number,
        y: number,
        fontScale: number,
        style: TextStyle
    ): void
    {
        const char = metrics.text;
        const fontProperties = metrics.fontProperties;
        const stroke = style._stroke;

        const strokeThickness = (stroke?.width ?? 0) * fontScale;

        const tx = x + (strokeThickness / 2);
        const ty = y - (strokeThickness / 2);

        const descent = fontProperties.descent * fontScale;
        const lineHeight = metrics.lineHeight * fontScale;

        if (style.stroke && strokeThickness)
        {
            context.strokeText(char, tx, ty + lineHeight - descent);
        }

        if (style._fill)
        {
            context.fillText(char, tx, ty + lineHeight - descent);
        }
    }

    destroy(): void
    {
        this.onFontDestroy.emit(this);

        for (const i in this.chars)
        {
            this.chars[i].texture.destroy();
        }

        this.chars = null;

        for (let i = 0; i < this.pages.length; i++)
        {
            const { canvasAndContext, texture } = this.pages[i];

            CanvasPool.returnCanvasAndContext(canvasAndContext);
            texture.destroy(true);
        }

        this.pages = null;
    }
}
