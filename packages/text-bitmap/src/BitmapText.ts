import { ObservablePoint, Point } from '@pixi/math';
import { settings } from '@pixi/settings';
import { Mesh, MeshGeometry, MeshMaterial } from '@pixi/mesh';
import { removeItems, deprecation } from '@pixi/utils';
import { BitmapFont } from './BitmapFont';

import type { Dict } from '@pixi/utils';
import type { Rectangle } from '@pixi/math';
import { Texture } from '@pixi/core';
import type { IBitmapTextStyle } from './BitmapTextStyle';
import type { TextStyleAlign as BitmapTextAlign } from '@pixi/text';
import type { BitmapFontData } from './BitmapFontData';
import { Container } from '@pixi/display';

interface PageMeshData {
    index: number;
    indexCount: number;
    vertexCount: number;
    uvsCount: number;
    total: number;
    mesh: Mesh;
    vertices?: Float32Array;
    uvs?: Float32Array;
    indices?: Uint16Array;
}
interface CharRenderData {
    texture: Texture;
    line: number;
    charCode: number;
    position: Point;
}

const pageMeshDataPool: PageMeshData[] = [];
const charRenderDataPool: CharRenderData[] = [];

/**
 * A BitmapText object will create a line or multiple lines of text using bitmap font.
 *
 * The primary advantage of this class over Text is that all of your textures are pre-generated and loading,
 * meaning that rendering is fast, and changing text has no performance implications.
 *
 * Supporting character sets other than latin, such as CJK languages, may be impractical due to the number of characters.
 *
 * To split a line you can use '\n', '\r' or '\r\n' in your string.
 *
 * PixiJS can auto-generate fonts on-the-fly using BitmapFont or use fnt files provided by:
 * http://www.angelcode.com/products/bmfont/ for Windows or
 * http://www.bmglyph.com/ for Mac.
 *
 * A BitmapText can only be created when the font is loaded.
 *
 * ```js
 * // in this case the font is in a file called 'desyrel.fnt'
 * let bitmapText = new PIXI.BitmapText("text using a fancy font!", {font: "35px Desyrel", align: "right"});
 * ```
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
export class BitmapText extends Container
{
    public roundPixels: boolean;
    public dirty: boolean;
    protected _textWidth: number;
    protected _textHeight: number;
    protected _text: string;
    protected _maxWidth: number;
    protected _maxLineHeight: number;
    protected _letterSpacing: number;
    protected _anchor: ObservablePoint;
    protected _fontName: string;
    protected _fontSize: number;
    protected _align: BitmapTextAlign;
    protected _activePagesMeshData: PageMeshData[];
    protected _tint = 0xFFFFFF;

    /**
     * @param {string} text - A string that you would like the text to display.
     * @param {object} style - The style parameters.
     * @param {string|object} [style.font] - (DEPRECATED) The font descriptor for the object, can be passed as a
     *      string of form "24px FontName" or "FontName" or as an object with explicit name/size properties.
     * @param {string} [style.fontName] - The bitmap font id.
     * @param {number} [style.fontSize] - The size of the font in pixels, e.g. 24
     * @param {string} [style.align='left'] - Alignment for multiline text ('left', 'center' or 'right'), does not affect
     *      single line text.
     * @param {number} [style.tint=0xFFFFFF] - The tint color.
     * @param {number} [style.letterSpacing=0] - The letter spacing
     * @param {number} [style.maxWidth=0] - The max width of the text before line wrapping
     * @param {PIXI.Point} [style.anchor] - The text anchor
     * @param {boolean} [style.roundPixels=PIXI.settings.ROUND_PIXELS] - Whether to round pixels to prevent aliasing
     */
    constructor(text: string, style: Partial<IBitmapTextStyle> = {})
    {
        super();

        this._activePagesMeshData = [];

        /**
         * Private tracker for the width of the overall text
         *
         * @member {number}
         * @private
         */
        this._textWidth = 0;

        /**
         * Private tracker for the height of the overall text
         *
         * @member {number}
         * @private
         */
        this._textHeight = 0;

        /**
         * Private tracker for the current text align.
         *
         * @member {object}
         * @private
         */
        this._align = style.align || 'left';

        /**
         * Private tracker for font name.
         *
         * @member {string}
         * @private
         */
        this._fontName = null;

        /**
         * Private tracker for font size
         *
         * @member {number}
         * @private
         */
        this._fontSize = 0;

        /**
         * Private tracker for the current tint.
         *
         * @member {number}
         * @private
         */
        this._tint = style.tint !== undefined ? style.tint : 0xFFFFFF;

        // Backward compatiblity
        if (style.font)
        {
            if (typeof style.font === 'string')
            {
                const valueSplit = style.font.split(' ');

                this._fontName = valueSplit.length === 1
                    ? valueSplit[0]
                    : valueSplit.slice(1).join(' ');

                this._fontSize = valueSplit.length >= 2
                    ? parseInt(valueSplit[0], 10)
                    : BitmapFont.available[this._fontName].size;
            }
            else
            {
                this._fontName = style.font.name;
                this._fontSize = typeof style.font.size === 'number' ? style.font.size : parseInt(style.font.size, 10);
            }
        }
        else
        {
            /**
             * Private tracker for the current font name.
             *
             * @member {object}
             * @private
             */
            this._fontName = style.fontName;

            /**
             * Private tracker for the current font size.
             *
             * @member {object}
             * @private
             */
            this._fontSize = style.fontSize;
        }

        /**
         * Private tracker for the current text.
         *
         * @member {string}
         * @private
         */
        this._text = text;

        /**
         * The max width of this bitmap text in pixels. If the text provided is longer than the
         * value provided, line breaks will be automatically inserted in the last whitespace.
         * Disable by setting value to 0
         *
         * @member {number}
         * @private
         */
        this._maxWidth = style.maxWidth || 0;

        /**
         * The max line height. This is useful when trying to use the total height of the Text,
         * ie: when trying to vertically align. (Internally used)
         *
         * @member {number}
         * @private
         */
        this._maxLineHeight = 0;

        /**
         * Letter spacing. This is useful for setting the space between characters.
         * @member {number}
         * @private
         */
        this._letterSpacing = style.letterSpacing || 0;

        /**
         * Text anchor. read-only
         *
         * @member {PIXI.ObservablePoint}
         * @private
         */
        this._anchor = new ObservablePoint((): void => { this.dirty = true; }, this, 0, 0);

        if (style.anchor)
        {
            this._anchor.copyFrom(style.anchor);
        }

        /**
         * The dirty state of this object.
         *
         * @member {boolean}
         */
        this.dirty = true;

        /**
         * If true PixiJS will Math.floor() x/y values when rendering, stopping pixel interpolation.
         * Advantages can include sharper image quality (like text) and faster rendering on canvas.
         * The main disadvantage is movement of objects may appear less smooth.
         * To set the global default, change {@link PIXI.settings.ROUND_PIXELS}
         *
         * @member {boolean}
         * @default false
         */
        this.roundPixels = style.roundPixels !== undefined ? style.roundPixels : settings.ROUND_PIXELS;
    }

    /**
     * Renders text and updates it when needed
     *
     * @private
     */
    private updateText(): void
    {
        const data = BitmapFont.available[this._fontName];
        const scale = this._fontSize / data.size;
        const pos = new Point();
        const chars: CharRenderData[] = [];
        const lineWidths = [];
        const text = this._text.replace(/(?:\r\n|\r)/g, '\n') || ' ';
        const textLength = text.length;
        const maxWidth = this._maxWidth * data.size / this._fontSize;

        let prevCharCode = null;
        let lastLineWidth = 0;
        let maxLineWidth = 0;
        let line = 0;
        let lastBreakPos = -1;
        let lastBreakWidth = 0;
        let spacesRemoved = 0;
        let maxLineHeight = 0;

        for (let i = 0; i < textLength; i++)
        {
            const charCode = text.charCodeAt(i);
            const char = text.charAt(i);

            if ((/(?:\s)/).test(char))
            {
                lastBreakPos = i;
                lastBreakWidth = lastLineWidth;
            }

            if (char === '\r' || char === '\n')
            {
                lineWidths.push(lastLineWidth);
                maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
                ++line;
                ++spacesRemoved;

                pos.x = 0;
                pos.y += data.lineHeight;
                prevCharCode = null;
                continue;
            }

            const charData = data.chars[charCode];

            if (!charData)
            {
                continue;
            }

            if (prevCharCode && charData.kerning[prevCharCode])
            {
                pos.x += charData.kerning[prevCharCode];
            }

            const charRenderData = charRenderDataPool.pop() || {
                texture: Texture.EMPTY,
                line: 0,
                charCode: 0,
                position: new Point(),
            };

            charRenderData.texture = charData.texture;
            charRenderData.line = line;
            charRenderData.charCode = charCode;
            charRenderData.position.x = pos.x + charData.xOffset + (this._letterSpacing / 2);
            charRenderData.position.y = pos.y + charData.yOffset;

            chars.push(charRenderData);

            pos.x += charData.xAdvance + this._letterSpacing;
            lastLineWidth = pos.x;
            maxLineHeight = Math.max(maxLineHeight, (charData.yOffset + charData.texture.height));
            prevCharCode = charCode;

            if (lastBreakPos !== -1 && maxWidth > 0 && pos.x > maxWidth)
            {
                ++spacesRemoved;
                removeItems(chars, 1 + lastBreakPos - spacesRemoved, 1 + i - lastBreakPos);
                i = lastBreakPos;
                lastBreakPos = -1;

                lineWidths.push(lastBreakWidth);
                maxLineWidth = Math.max(maxLineWidth, lastBreakWidth);
                line++;

                pos.x = 0;
                pos.y += data.lineHeight;
                prevCharCode = null;
            }
        }

        const lastChar = text.charAt(text.length - 1);

        if (lastChar !== '\r' && lastChar !== '\n')
        {
            if ((/(?:\s)/).test(lastChar))
            {
                lastLineWidth = lastBreakWidth;
            }

            lineWidths.push(lastLineWidth);
            maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
        }

        const lineAlignOffsets = [];

        for (let i = 0; i <= line; i++)
        {
            let alignOffset = 0;

            if (this._align === 'right')
            {
                alignOffset = maxLineWidth - lineWidths[i];
            }
            else if (this._align === 'center')
            {
                alignOffset = (maxLineWidth - lineWidths[i]) / 2;
            }

            lineAlignOffsets.push(alignOffset);
        }

        const lenChars = chars.length;

        const pagesMeshData: Record<number, PageMeshData> = {};

        const newPagesMeshData: PageMeshData[] = [];

        const activePagesMeshData = this._activePagesMeshData;

        for (let i = 0; i < activePagesMeshData.length; i++)
        {
            pageMeshDataPool.push(activePagesMeshData[i]);
        }

        for (let i = 0; i < lenChars; i++)
        {
            const texture = chars[i].texture;
            const baseTextureUid = texture.baseTexture.uid;

            if (!pagesMeshData[baseTextureUid])
            {
                let pageMeshData = pageMeshDataPool.pop();

                if (!pageMeshData)
                {
                    const geometry = new MeshGeometry();
                    const material = new MeshMaterial(Texture.EMPTY);

                    const mesh = new Mesh(geometry, material);

                    pageMeshData = {
                        index: 0,
                        indexCount: 0,
                        vertexCount: 0,
                        uvsCount: 0,
                        total: 0,
                        mesh,
                        vertices: null,
                        uvs: null,
                        indices: null,
                    };
                }

                // reset data..
                pageMeshData.index = 0;
                pageMeshData.indexCount = 0;
                pageMeshData.vertexCount = 0;
                pageMeshData.uvsCount = 0;
                pageMeshData.total = 0;
                // TODO need to get page texture here somehow..
                pageMeshData.mesh.texture = new Texture(texture.baseTexture);
                pageMeshData.mesh.tint = this._tint;

                newPagesMeshData.push(pageMeshData);

                pagesMeshData[baseTextureUid] = pageMeshData;
            }

            pagesMeshData[baseTextureUid].total++;
        }

        // lets find any previously active pageMeshDatas that are no longer required for
        // the updated text (if any), removed and return them to the pool.
        for (let i = 0; i < activePagesMeshData.length; i++)
        {
            if (newPagesMeshData.indexOf(activePagesMeshData[i]) === -1)
            {
                this.removeChild(activePagesMeshData[i].mesh);
            }
        }

        // next lets add any new meshes, that have not yet been added to this BitmapText
        // we only add if its not already a child of this BitmapObject
        for (let i = 0; i < newPagesMeshData.length; i++)
        {
            if (newPagesMeshData[i].mesh.parent !== this)
            {
                this.addChild(newPagesMeshData[i].mesh);
            }
        }

        // active page mesh datas are set to be the new pages added.
        this._activePagesMeshData = newPagesMeshData;

        for (const i in pagesMeshData)
        {
            const pageMeshData = pagesMeshData[i];
            const total = pageMeshData.total;

            // lets only allocate new buffers if we can fit the new text in the current ones..
            // unless that is, we will be batching. Currently batching dose not respect the size property of mesh
            if (!(pageMeshData.indices?.length > 6 * total) || pageMeshData.vertices.length < Mesh.BATCHABLE_SIZE * 2)
            {
                pageMeshData.vertices = new Float32Array(4 * 2 * total);
                pageMeshData.uvs = new Float32Array(4 * 2 * total);
                pageMeshData.indices = new Uint16Array(6 * total);
            }

            // as a buffer maybe bigger than the current word, we set the size of the meshMaterial
            // to match the number of letters needed
            pageMeshData.mesh.size = 6 * total;
        }

        for (let i = 0; i < lenChars; i++)
        {
            const char = chars[i];
            const xPos = (char.position.x + lineAlignOffsets[char.line]) * scale;
            const yPos = char.position.y * scale;
            const texture = char.texture;

            const pageMesh = pagesMeshData[texture.baseTexture.uid];

            const textureFrame = texture.frame;
            const textureUvs = texture._uvs;

            const index = pageMesh.index++;

            pageMesh.indices[(index * 6) + 0] = 0 + (index * 4);
            pageMesh.indices[(index * 6) + 1] = 1 + (index * 4);
            pageMesh.indices[(index * 6) + 2] = 2 + (index * 4);
            pageMesh.indices[(index * 6) + 3] = 0 + (index * 4);
            pageMesh.indices[(index * 6) + 4] = 2 + (index * 4);
            pageMesh.indices[(index * 6) + 5] = 3 + (index * 4);

            pageMesh.vertices[(index * 8) + 0] = xPos;
            pageMesh.vertices[(index * 8) + 1] = yPos;

            pageMesh.vertices[(index * 8) + 2] = xPos + (textureFrame.width * scale);
            pageMesh.vertices[(index * 8) + 3] = yPos;

            pageMesh.vertices[(index * 8) + 4] = xPos + (textureFrame.width * scale);
            pageMesh.vertices[(index * 8) + 5] = yPos + (textureFrame.height * scale);

            pageMesh.vertices[(index * 8) + 6] = xPos;
            pageMesh.vertices[(index * 8) + 7] = yPos + (textureFrame.height * scale);

            pageMesh.uvs[(index * 8) + 0] = textureUvs.x0;
            pageMesh.uvs[(index * 8) + 1] = textureUvs.y0;

            pageMesh.uvs[(index * 8) + 2] = textureUvs.x1;
            pageMesh.uvs[(index * 8) + 3] = textureUvs.y1;

            pageMesh.uvs[(index * 8) + 4] = textureUvs.x2;
            pageMesh.uvs[(index * 8) + 5] = textureUvs.y2;

            pageMesh.uvs[(index * 8) + 6] = textureUvs.x3;
            pageMesh.uvs[(index * 8) + 7] = textureUvs.y3;
        }

        this._textWidth = maxLineWidth * scale;
        this._textHeight = (pos.y + data.lineHeight) * scale;

        for (const i in pagesMeshData)
        {
            const pageMeshData = pagesMeshData[i];

            // apply anchor
            if (this.anchor.x !== 0 || this.anchor.y !== 0)
            {
                let vertexCount = 0;

                const anchorOffsetX = this._textWidth * this.anchor.x;
                const anchorOffsetY = this._textHeight * this.anchor.y;

                for (let i = 0; i < pageMeshData.total; i++)
                {
                    pageMeshData.vertices[vertexCount++] -= anchorOffsetX;
                    pageMeshData.vertices[vertexCount++] -= anchorOffsetY;

                    pageMeshData.vertices[vertexCount++] -= anchorOffsetX;
                    pageMeshData.vertices[vertexCount++] -= anchorOffsetY;

                    pageMeshData.vertices[vertexCount++] -= anchorOffsetX;
                    pageMeshData.vertices[vertexCount++] -= anchorOffsetY;

                    pageMeshData.vertices[vertexCount++] -= anchorOffsetX;
                    pageMeshData.vertices[vertexCount++] -= anchorOffsetY;
                }
            }

            this._maxLineHeight = maxLineHeight * scale;

            const vertexBuffer = pageMeshData.mesh.geometry.getBuffer('aVertexPosition');
            const textureBuffer = pageMeshData.mesh.geometry.getBuffer('aTextureCoord');
            const indexBuffer = pageMeshData.mesh.geometry.getIndex();

            vertexBuffer.data = pageMeshData.vertices;
            textureBuffer.data = pageMeshData.uvs;
            indexBuffer.data = pageMeshData.indices;

            vertexBuffer.update();
            textureBuffer.update();
            indexBuffer.update();
        }

        for (let i = 0; i < chars.length; i++)
        {
            charRenderDataPool.push(chars[i]);
        }
    }

    /**
     * Updates the transform of this object
     *
     * @private
     */
    updateTransform(): void
    {
        this.validate();
        this.containerUpdateTransform();
    }

    /**
     * Validates text before calling parent's getLocalBounds
     *
     * @return {PIXI.Rectangle} The rectangular bounding area
     */
    public getLocalBounds(): Rectangle
    {
        this.validate();

        return super.getLocalBounds();
    }

    /**
     * Updates text when needed
     *
     * @private
     */
    protected validate(): void
    {
        if (this.dirty)
        {
            this.updateText();
            this.dirty = false;
        }
    }

    /**
     * The tint of the BitmapText object.
     *
     * @member {number}
     */
    public get tint(): number
    {
        return this._tint;
    }

    public set tint(value) // eslint-disable-line require-jsdoc
    {
        if (this._tint === value) return;

        this._tint = value;

        for (let i = 0; i < this._activePagesMeshData.length; i++)
        {
            this._activePagesMeshData[i].mesh.tint = value;
        }
    }

    /**
     * The alignment of the BitmapText object.
     *
     * @member {string}
     * @default 'left'
     */
    public get align(): BitmapTextAlign
    {
        return this._align;
    }

    public set align(value) // eslint-disable-line require-jsdoc
    {
        this._align = value || 'left';

        this.dirty = true;
    }

    public get fontName(): string
    {
        return this._fontName;
    }

    /**
     * The anchor sets the origin point of the text.
     *
     * The default is `(0,0)`, this means the text's origin is the top left.
     *
     * Setting the anchor to `(0.5,0.5)` means the text's origin is centered.
     *
     * Setting the anchor to `(1,1)` would mean the text's origin point will be the bottom right corner.
     *
     * @member {PIXI.Point | number}
     */
    public get anchor(): ObservablePoint
    {
        return this._anchor;
    }

    public set anchor(value: ObservablePoint) // eslint-disable-line require-jsdoc
    {
        if (typeof value === 'number')
        {
            this._anchor.set(value);
        }
        else
        {
            this._anchor.copyFrom(value);
        }
    }

    /**
     * The text of the BitmapText object.
     *
     * @member {string}
     */
    public get text(): string
    {
        return this._text;
    }

    public set text(text) // eslint-disable-line require-jsdoc
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
     * The max width of this bitmap text in pixels. If the text provided is longer than the
     * value provided, line breaks will be automatically inserted in the last whitespace.
     * Disable by setting the value to 0.
     *
     * @member {number}
     */
    public get maxWidth(): number
    {
        return this._maxWidth;
    }

    public set maxWidth(value) // eslint-disable-line require-jsdoc
    {
        if (this._maxWidth === value)
        {
            return;
        }
        this._maxWidth = value;
        this.dirty = true;
    }

    /**
     * The max line height. This is useful when trying to use the total height of the Text,
     * i.e. when trying to vertically align.
     *
     * @member {number}
     * @readonly
     */
    public get maxLineHeight(): number
    {
        this.validate();

        return this._maxLineHeight;
    }

    /**
     * The width of the overall text, different from fontSize,
     * which is defined in the style object.
     *
     * @member {number}
     * @readonly
     */
    public get textWidth(): number
    {
        this.validate();

        return this._textWidth;
    }

    /**
     * Additional space between characters.
     *
     * @member {number}
     */
    public get letterSpacing(): number
    {
        return this._letterSpacing;
    }

    public set letterSpacing(value) // eslint-disable-line require-jsdoc
    {
        if (this._letterSpacing !== value)
        {
            this._letterSpacing = value;
            this.dirty = true;
        }
    }

    /**
     * The height of the overall text, different from fontSize,
     * which is defined in the style object.
     *
     * @member {number}
     * @readonly
     */
    public get textHeight(): number
    {
        this.validate();

        return this._textHeight;
    }

    /**
     * Register a bitmap font with data and a texture.
     *
     * @deprecated since 5.3.0
     * @see PIXI.BitmapFont.install
     * @static
     */
    static registerFont(data: string|XMLDocument|BitmapFontData, textures: Texture|Texture[]|Dict<Texture>): BitmapFont
    {
        deprecation('5.3.0', 'PIXI.BitmapText.registerFont is deprecated, use PIXI.BitmapFont.install');

        return BitmapFont.install(data, textures);
    }

    /**
     * Get the list of installed fonts.
     *
     * @see PIXI.BitmapFont.available
     * @deprecated since 5.3.0
     * @static
     * @readonly
     * @member {Object.<string, PIXI.BitmapFont>}
     */
    static get fonts(): Dict<BitmapFont>
    {
        deprecation('5.3.0', 'PIXI.BitmapText.fonts is deprecated, use PIXI.BitmapFont.available');

        return BitmapFont.available;
    }
}
