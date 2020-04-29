import { Renderer, Texture } from '@pixi/core';
import { Rectangle } from '@pixi/math';
import { GlyphTiles } from './glyph-tiles';
import { TextStyle, ITextStyle } from './TextStyle';
import { TextMetrics } from './TextMetrics';
import { settings } from '@pixi/settings';
import { generateFillStyle } from './utils/generateFillStyle';

// Min. size that a glyph must occupy.
const TILE_SIZE = 24;

// Min. padding around a glyph
const GLYPH_PADDING = 2;

/**
 * @ignore
 */
export class GlyphLoc
{
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public texture: Texture;
    public resolution: number;

    public metrics: TextMetrics;

    constructor(
        canvas: HTMLCanvasElement,
        context: CanvasRenderingContext2D,
        texture: Texture,
        resolution: number)
    {
        this.canvas = canvas;
        this.context = context;
        this.texture = texture;
        this.resolution = resolution;
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

        let { width, height } = TextMetrics.measureText(char, style, false);

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

    /**
     * Generates a string uniquely identifying the style.
     * @return {string}
     */
    public styleToString(style: any): string
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

    private _renderGlyph(char: string, style: TextStyle, loc: GlyphLoc): void
    {
        const {
            canvas,
            context,
        } = loc;

        const { x, y } = loc.texture.frame;
        const measured = TextMetrics.measureText(char, style, style.wordWrap, canvas);

        loc.metrics = measured;

        // context.fillStyle = 'red';
        // context.fillRect(loc.position.x, loc.position.y, loc.size.x, loc.size.y);

        context.translate(x, y);
        context.scale(loc.resolution, loc.resolution);

        context.fillStyle = generateFillStyle(canvas, context, style, settings.RESOLUTION, [char], measured);

        context.strokeStyle = style.stroke as string;

        context.font = style.toFontString();
        context.lineWidth = style.strokeThickness;
        context.textBaseline = style.textBaseline;
        context.lineJoin = style.lineJoin;
        context.miterLimit = style.miterLimit;
        context.shadowColor = '0';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        if (style.stroke && style.strokeThickness)
        {
            loc.context.strokeText(char, 0, 0);
        }
        if (style.fill)
        {
            loc.context.fillText(char, 0, measured.lineHeight - measured.fontProperties.descent);
        }

        context.setTransform();
    }
}
