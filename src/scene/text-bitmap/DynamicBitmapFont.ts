import { Color } from '../../color/Color';
import { Rectangle } from '../../maths/shapes/Rectangle';
import { CanvasPool } from '../../rendering/renderers/shared/texture/CanvasPool';
import { ImageSource } from '../../rendering/renderers/shared/texture/sources/ImageSource';
import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { CanvasTextMetrics } from '../text/canvas/CanvasTextMetrics';
import { fontStringFromTextStyle } from '../text/canvas/utils/fontStringFromTextStyle';
import { getCanvasFillStyle } from '../text/canvas/utils/getCanvasFillStyle';
import { TextStyle } from '../text/TextStyle';
import { AbstractBitmapFont } from './AbstractBitmapFont';
import { resolveCharacters } from './utils/resolveCharacters';

import type { ICanvasRenderingContext2D } from '../../environment/canvas/ICanvasRenderingContext2D';
import type { CanvasAndContext } from '../../rendering/renderers/shared/texture/CanvasPool';
import type { FontMetrics } from '../text/canvas/CanvasTextMetrics';

export interface DynamicBitmapFontOptions
{
    style: TextStyle
    skipKerning?: boolean
    resolution?: number
    padding?: number
    overrideFill?: boolean
    overrideSize?: boolean
    textureSize?: number
    mipmap?: boolean
}

/**
 * A BitmapFont that generates its glyphs dynamically.
 * @memberof text
 * @ignore
 */
export class DynamicBitmapFont extends AbstractBitmapFont<DynamicBitmapFont>
{
    public static defaultOptions: DynamicBitmapFontOptions = {
        textureSize: 512,
        style: new TextStyle(),
        mipmap: true,
    };
    /**
     * this is a resolution modifier for the font size..
     * texture resolution will also be used to scale texture according to its font size also
     */
    public resolution = 1;
    /** The pages of the font. */
    public override readonly pages: {canvasAndContext?: CanvasAndContext, texture: Texture}[] = [];

    private readonly _padding: number = 0;
    private readonly _measureCache: Record<string, number> = Object.create(null);
    private _currentChars: string[] = [];
    private _currentX = 0;
    private _currentY = 0;
    private _currentPageIndex = -1;
    private readonly _style: TextStyle;
    private readonly _skipKerning: boolean = false;
    private readonly _textureSize: number;
    private readonly _mipmap: boolean;

    /**
     * @param options - The options for the dynamic bitmap font.
     */
    constructor(options: DynamicBitmapFontOptions)
    {
        super();

        const dynamicOptions = { ...DynamicBitmapFont.defaultOptions, ...options };

        this._textureSize = dynamicOptions.textureSize;
        this._mipmap = dynamicOptions.mipmap;

        const style = dynamicOptions.style.clone();

        if (dynamicOptions.overrideFill)
        {
            // assuming no shape fill..
            style._fill.color = 0xffffff;
            style._fill.alpha = 1;
            style._fill.texture = Texture.WHITE;
            style._fill.fill = null;
        }

        this.applyFillAsTint = dynamicOptions.overrideFill;

        const requestedFontSize = style.fontSize;

        // adjust font size to match the base measurement size
        style.fontSize = this.baseMeasurementFontSize;

        const font = fontStringFromTextStyle(style);

        if (dynamicOptions.overrideSize)
        {
            if (style._stroke)
            {
                // we want the stroke to fit the size of the requested text, so we need to scale it
                // accordingly (eg font size 20, with stroke 10 - stroke is 50% of size,
                // as dynamic font is size 100, the stroke should be adjusted to 50 to make it look right)
                style._stroke.width *= this.baseRenderedFontSize / requestedFontSize;
            }
        }
        else
        {
            style.fontSize = this.baseRenderedFontSize = requestedFontSize;
        }

        this._style = style;
        this._skipKerning = dynamicOptions.skipKerning ?? false;
        this.resolution = dynamicOptions.resolution ?? 1;
        this._padding = dynamicOptions.padding ?? 4;

        (this.fontMetrics as FontMetrics) = CanvasTextMetrics.measureFont(font);
        (this.lineHeight as number) = style.lineHeight || this.fontMetrics.fontSize || style.fontSize;
    }

    public ensureCharacters(chars: string): void
    {
        const charList = resolveCharacters(chars)
            .filter((char) => !this._currentChars.includes(char))
            .filter((char, index, self) => self.indexOf(char) === index);
        // filter returns..

        if (!charList.length) return;

        this._currentChars = [...this._currentChars, ...charList];

        let pageData;

        if (this._currentPageIndex === -1)
        {
            pageData = this._nextPage();
        }
        else
        {
            pageData = this.pages[this._currentPageIndex];
        }

        let { canvas, context } = pageData.canvasAndContext;
        let textureSource = pageData.texture.source;

        const style = this._style;

        let currentX = this._currentX;
        let currentY = this._currentY;

        const fontScale = this.baseRenderedFontSize / this.baseMeasurementFontSize;
        const padding = this._padding * fontScale;

        const widthScale = style.fontStyle === 'italic' ? 2 : 1;
        let maxCharHeight = 0;
        let skipTexture = false;

        for (let i = 0; i < charList.length; i++)
        {
            const char = charList[i];

            const metrics = CanvasTextMetrics.measureText(char, style, canvas, false);

            // override the line height.. we want this to be the glyps heigh
            // not the user specified one.
            metrics.lineHeight = metrics.height;

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

            if (currentX + paddedWidth > this._textureSize)
            {
                currentY += maxCharHeight;

                // reset the line x and height..
                maxCharHeight = paddedHeight;
                currentX = 0;

                if (currentY + maxCharHeight > this._textureSize)
                {
                    textureSource.update();

                    const pageData = this._nextPage();

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
                xOffset: -this._padding,
                yOffset: -this._padding,
                xAdvance,
                kerning: {},
            };

            if (skipTexture)
            {
                this._drawGlyph(
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
                    ((currentX) / px) * textureSource.width,
                    ((currentY) / py) * textureSource.height,
                    ((paddedWidth) / px) * textureSource.width,
                    ((paddedHeight) / py) * textureSource.height,
                );

                this.chars[char].texture = new Texture({
                    source: textureSource,
                    frame,
                });

                currentX += Math.ceil(paddedWidth);
            }

            // now add it to the font data..
        }

        textureSource.update();

        this._currentX = currentX;
        this._currentY = currentY;

        // now apply kerning..
        this._skipKerning && this._applyKerning(charList, context);
    }

    /**
     * @deprecated since 8.0.0
     * The map of base page textures (i.e., sheets of glyphs).
     */
    public override get pageTextures(): DynamicBitmapFont['pages']
    {
        // #if _DEBUG
        deprecation(v8_0_0, 'BitmapFont.pageTextures is deprecated, please use BitmapFont.pages instead.');
        // #endif

        return this.pages;
    }

    private _applyKerning(newChars: string[], context: ICanvasRenderingContext2D): void
    {
        const measureCache = this._measureCache;

        for (let i = 0; i < newChars.length; i++)
        {
            const first = newChars[i];

            for (let j = 0; j < this._currentChars.length; j++)
            {
                // first go through new char being first
                const second = this._currentChars[j];

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

    private _nextPage(): {canvasAndContext: CanvasAndContext, texture: Texture}
    {
        this._currentPageIndex++;

        const textureResolution = this.resolution;
        const canvasAndContext = CanvasPool.getOptimalCanvasAndContext(
            this._textureSize,
            this._textureSize,
            textureResolution
        );

        this._setupContext(canvasAndContext.context, this._style, textureResolution);

        const resolution = textureResolution * (this.baseRenderedFontSize / this.baseMeasurementFontSize);
        const texture = new Texture({
            source: new ImageSource({
                resource: canvasAndContext.canvas,
                resolution,
                alphaMode: 'premultiply-alpha-on-upload',
                autoGenerateMipmaps: this._mipmap,
            }),

        });

        const pageData = {
            canvasAndContext,
            texture,
        };

        this.pages[this._currentPageIndex] = pageData;

        return pageData;
    }

    // canvas style!
    private _setupContext(context: ICanvasRenderingContext2D, style: TextStyle, resolution: number): void
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
            const rgb = Color.shared.setValue(shadowOptions.color).toArray();

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

    private _drawGlyph(
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

    public override destroy(): void
    {
        super.destroy();

        for (let i = 0; i < this.pages.length; i++)
        {
            const { canvasAndContext, texture } = this.pages[i];

            // clear context.. this is the fastest way apparently!
            // eslint-disable-next-line no-self-assign
            canvasAndContext.canvas.width = canvasAndContext.canvas.width;

            CanvasPool.returnCanvasAndContext(canvasAndContext);
            texture.destroy(true);
        }

        (this.pages as null) = null;
    }
}
