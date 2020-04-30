import { Renderer, Texture } from '@pixi/core';
import { Rectangle } from '@pixi/math';
import { GlyphTiles } from './glyph-tiles';
import { TextStyle, ITextStyle } from './TextStyle';
import { TextMetrics } from './TextMetrics';
import { generateFillStyle } from './utils/generateFillStyle';

// Min. size that a glyph must occupy.
const TILE_SIZE = 16;

// Min. padding around a glyph
const GLYPH_PADDING = 2;

/**
 * Represents a cached glyph
 *
 * @ignore
 * @class
 */
export class GlyphLoc
{
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public texture: Texture;
    public resolution: number;
    public metrics: TextMetrics;
    public baseline: number;

    public references: number;

    constructor(
        canvas: HTMLCanvasElement,
        context: CanvasRenderingContext2D,
        texture: Texture,
        resolution: number)
    {
        /**
         * The canvas on which the glyph was drawn
         * @member {HTMLCanvasElement}
         */
        this.canvas = canvas;

        /**
         * The canvas-2d context used to render the glyph
         * @member {CanvasRenderingContext2D}
         */
        this.context = context;

        /**
         * A texture whose frame contains the glyph
         * @member {PIXI.Texture}
         */
        this.texture = texture;

        /**
         * Resolution at which the glyph was cached
         * @member {number}
         */
        this.resolution = resolution;

        /**
         * The baseline is the horizontal axis in the texture frame where the letter sits on the
         * on-screen line.
         * @member {number}
         */
        this.baseline = 0;

        /**
         * The no. of text objects using this glyph. If this drops to zero, then the
         * glyph can be removed safely.
         * @member {number}
         * @default 0
         */
        this.references = 0;
    }
}

/**
 * This is the record for where and on which texture each glyph is cached.
 *
 * @ignore
 * @class
 */
export class GlyphManager
{
    private _atlasDimen: number;
    private _tileRows: number;
    private _tileColumns: number;

    private _canvasList: Array<HTMLCanvasElement>;
    private _contextList: Array<CanvasRenderingContext2D>;
    private _atlasTiles: Array<GlyphTiles>;

    private _glyphMap: Map<string, GlyphLoc>;

    /**
     * @param {PIXI.Renderer} renderer
     */
    constructor(renderer: Renderer)
    {
        this._atlasDimen = Math.min(1024, renderer.gl.getParameter(renderer.gl.MAX_TEXTURE_SIZE));
        this._tileRows = Math.floor(this._atlasDimen / TILE_SIZE);
        this._tileColumns = Math.floor(this._atlasDimen / TILE_SIZE);

        this._canvasList = [];
        this._contextList = [];
        this._atlasTiles = [];

        this._glyphMap = new Map<string, GlyphLoc>();
    }

    id(char: string, style: Partial<ITextStyle>, resolution: number): string
    {
        return `[${char}]<${this.styleToString(style)}>@${resolution}`;
    }

    storeGlyph(char: string, style: TextStyle, resolution: number): GlyphLoc
    {
        if (style.fontSize > 512)
        {
            throw new Error('Can\'t store >512px glyph');
        }

        let { width, height } = GlyphManager.measureGlyph(char, style);

        width *= resolution;
        height *= resolution;

        const charWidth = width + (2 * GLYPH_PADDING);
        const charHeight = height + (2 * GLYPH_PADDING);

        const tilesHorz = Math.ceil(charWidth / TILE_SIZE);
        const tilesVert = Math.ceil(charHeight / TILE_SIZE);

        for (let i = 0; i < this._atlasTiles.length; i++)
        {
            const tileManager = this._atlasTiles[i];
            const tileRects = tileManager.getBlankTileRects();

            for (let j = 0; j < tileRects.length; j++)
            {
                const rect = tileRects[j];

                if (rect.width >= tilesHorz && rect.height >= tilesVert)
                {
                    // TextureCache returns same texture for canvas.
                    const texture = Texture.from(this._canvasList[i]).clone();

                    texture.frame = new Rectangle(
                        (rect.x * TILE_SIZE) + GLYPH_PADDING,
                        (rect.y * TILE_SIZE) + GLYPH_PADDING,
                        width,
                        height);
                    texture.updateUvs();

                    const loc = new GlyphLoc(
                        this._canvasList[i],
                        this._contextList[i],
                        texture,
                        resolution);

                    tileManager.reserveTileRect(new Rectangle(rect.x, rect.y, tilesHorz, tilesVert));
                    this._renderGlyph(char, style, loc);

                    this._glyphMap.set(this.id(char, style, resolution), loc);

                    texture.update();

                    return loc;
                }
            }
        }

        const canvas = document.createElement('canvas');

        canvas.width = canvas.height = 1024;

        const texture = Texture.from(canvas);

        texture.frame = new Rectangle(GLYPH_PADDING, GLYPH_PADDING, width, height);
        texture.updateUvs();
        const tileManager = new GlyphTiles(this._tileRows, this._tileColumns);
        const context = canvas.getContext('2d');

        this._canvasList.push(canvas);
        this._contextList.push(context);
        this._atlasTiles.push(tileManager);

        const loc = new GlyphLoc(canvas, context, texture, resolution);

        this._renderGlyph(char, style, loc);
        tileManager.reserveTileRect(new Rectangle(0, 0,
            Math.ceil(charWidth / TILE_SIZE),
            Math.ceil(charHeight / TILE_SIZE)));

        this._glyphMap.set(this.id(char, style, resolution), loc);

        return loc;
    }

    /**
     * Locates the glyph based off its unique id given by {@code PIXI.GlyphManager#id}
     * @param {string} glyphId
     */
    locate(glyphId: string): GlyphLoc
    {
        return this._glyphMap.get(glyphId);
    }

    prune(): void
    {
        this._glyphMap.forEach((glyph: GlyphLoc, id: string) =>
        {
            if (glyph.references <= 0)
            {
                const index = this._canvasList.indexOf(glyph.canvas);

                if (index >= 0)
                {
                    const frame = glyph.texture.frame;

                    this._atlasTiles[index].clearTileRect(new Rectangle(
                        Math.floor(0.00001 + (frame.x / TILE_SIZE)),
                        Math.floor(0.00001 + (frame.y / TILE_SIZE)),
                        Math.ceil(-0.00001 + (frame.width / TILE_SIZE)),
                        Math.ceil(-0.00001 + (frame.height / TILE_SIZE))
                    ));
                }

                this._glyphMap.delete(id);
            }
        });
    }

    /**
     * Generates a string uniquely identifying the style.
     * @return {string}
     */
    styleToString(style: any): string
    {
        return `
            ${style.dropShadow}
            ${style.dropShadowAlpha}
            ${style.dropShadowBlur}
            ${style.dropShadowColor}
            ${style.dropShadowAngle}
            ${style.dropShadowDistance}
            ${style.fill}
            ${style.fillGradientStops}
            ${style.fillGradientType}
            ${style.fontFamily}
            ${style.fontSize}
            ${style.fontStyle}
            ${style.fontVariant}
            ${style.fontWeight}
            ${style.lineHeight}
            ${style.leading}
            ${style.lineJoin}
            ${style.miterLimit}
            ${style.padding}
            ${style.stroke}
            ${style.strokeThickness}
        `;
    }

    private _renderGlyph(char: string, style: TextStyle, glyph: GlyphLoc): void
    {
        const {
            canvas,
            context,
        } = glyph;

        const { x, y } = glyph.texture.frame;

        const measured = GlyphManager.measureGlyph(char, style, canvas);
        const fontProperties = measured.fontProperties;

        glyph.metrics = measured;
        glyph.baseline = measured.lineHeight - measured.fontProperties.descent;

        context.translate(x, y);
        context.scale(glyph.resolution, glyph.resolution);

        context.clearRect(
            -GLYPH_PADDING,
            -GLYPH_PADDING,
            measured.width + (2 * GLYPH_PADDING),
            measured.height + (2 * GLYPH_PADDING)
        );

        const tx = style.strokeThickness / 2;
        const ty = -(style.strokeThickness / 2);

        context.font = style.toFontString();
        context.lineWidth = style.strokeThickness;
        context.textBaseline = style.textBaseline;
        context.lineJoin = style.lineJoin;
        context.miterLimit = style.miterLimit;

        // set canvas text styles
        context.fillStyle = generateFillStyle(canvas, context, style, glyph.resolution, [char], measured);
        context.strokeStyle = style.stroke as string;

        context.shadowColor = '0';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        if (style.stroke && style.strokeThickness)
        {
            glyph.context.strokeText(char, tx, ty + measured.lineHeight - fontProperties.descent);
        }
        if (style.fill)
        {
            glyph.context.fillText(char, tx, ty + measured.lineHeight - fontProperties.descent);
        }

        context.setTransform();

        context.fillStyle = 'rgba(0, 0, 0, 0)';
    }

    /**
     * Measures the supplied character.
     *
     * @param {string} char - the text to measure.
     * @param {PIXI.TextStyle} style - the text style to use for measuring
     * @param {HTMLCanvasElement} [canvas] - optional specification of the canvas to use for measuring.
     * @return {PIXI.TextMetrics} measured width and height of the text.
     */
    public static measureGlyph(char: string, style: TextStyle, canvas = TextMetrics._canvas): TextMetrics
    {
        const font = style.toFontString();
        const fontProperties = TextMetrics.measureFont(font);

        // fallback in case UA disallow canvas data extraction
        // (toDataURI, getImageData functions)
        if (fontProperties.fontSize === 0)
        {
            fontProperties.fontSize = style.fontSize;
            fontProperties.ascent = style.fontSize;
        }

        const context = canvas.getContext('2d');

        context.font = font;

        const width = context.measureText(char).width + style.strokeThickness;
        const lineHeight = style.lineHeight || fontProperties.fontSize + (2 * style.strokeThickness);
        const height = Math.max(lineHeight, fontProperties.fontSize + (2 * style.strokeThickness));

        return new TextMetrics(
            char,
            style,
            width,
            height,
            [char],
            [width],
            lineHeight + style.leading,
            width,
            fontProperties
        );
    }
}
