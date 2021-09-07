import { Point } from '@pixi/math';
import { Mesh, MeshGeometry, MeshMaterial } from '@pixi/mesh';
import { removeItems } from '@pixi/utils';
import { BitmapFont } from './BitmapFont';
import { BitmapText } from './BitmapText';
import { splitTextToCharacters, extractCharCode } from './utils';
import msdfFrag from './shader/msdf.frag';
import msdfVert from './shader/msdf.vert';
import { Program, Renderer, Texture } from '@pixi/core';

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
    prevSpaces: number;
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
 * let bitmapText = new PIXI.BitmapText("text using a fancy font!", {
 *   fontName: "Desyrel",
 *   fontSize: 35,
 *   align: "right"
 * });
 * ```
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
export class MSDFText extends BitmapText
{
    /**
     * Renders text and updates it when needed. This should only be called
     * if the BitmapFont is regenerated.
     * Lots of duplicate code here but I didn't want to bloat the BitmapText class
     */
    public updateText(): void
    {
        const data = BitmapFont.available[this._fontName];
        const scale = this._fontSize / data.size;
        const pos = new Point();
        const chars: CharRenderData[] = [];
        const lineWidths = [];
        const lineSpaces = [];
        const text = this._text.replace(/(?:\r\n|\r)/g, '\n') || ' ';
        const charsInput = splitTextToCharacters(text);
        const maxWidth = this._maxWidth * data.size / this._fontSize;
        const distanceFieldRange = data.distanceFieldRange;

        let prevCharCode = null;
        let lastLineWidth = 0;
        let maxLineWidth = 0;
        let line = 0;
        let lastBreakPos = -1;
        let lastBreakWidth = 0;
        let spacesRemoved = 0;
        let maxLineHeight = 0;
        let spaceCount = 0;

        for (let i = 0; i < charsInput.length; i++)
        {
            const char = charsInput[i];
            const charCode = extractCharCode(char);

            if ((/(?:\s)/).test(char))
            {
                lastBreakPos = i;
                lastBreakWidth = lastLineWidth;
                spaceCount++;
            }

            if (char === '\r' || char === '\n')
            {
                lineWidths.push(lastLineWidth);
                lineSpaces.push(-1);
                maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
                ++line;
                ++spacesRemoved;

                pos.x = 0;
                pos.y += data.lineHeight;
                prevCharCode = null;
                spaceCount = 0;
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

            const charRenderData: CharRenderData = charRenderDataPool.pop() || {
                texture: Texture.EMPTY,
                line: 0,
                charCode: 0,
                prevSpaces: 0,
                position: new Point(),
            };

            charRenderData.texture = charData.texture;
            charRenderData.line = line;
            charRenderData.charCode = charCode;
            charRenderData.position.x = pos.x + charData.xOffset + (this._letterSpacing / 2);
            charRenderData.position.y = pos.y + charData.yOffset;
            charRenderData.prevSpaces = spaceCount;

            chars.push(charRenderData);

            lastLineWidth = charRenderData.position.x + charData.texture.orig.width;// Use charRenderData position!
            pos.x += charData.xAdvance + this._letterSpacing;
            maxLineHeight = Math.max(maxLineHeight, (charData.yOffset + charData.texture.height));
            prevCharCode = charCode;

            if (lastBreakPos !== -1 && maxWidth > 0 && pos.x > maxWidth)
            {
                ++spacesRemoved;
                removeItems(chars, 1 + lastBreakPos - spacesRemoved, 1 + i - lastBreakPos);
                i = lastBreakPos;
                lastBreakPos = -1;

                lineWidths.push(lastBreakWidth);
                lineSpaces.push(chars.length > 0 ? chars[chars.length - 1].prevSpaces : 0);
                maxLineWidth = Math.max(maxLineWidth, lastBreakWidth);
                line++;

                pos.x = 0;
                pos.y += data.lineHeight;
                prevCharCode = null;
                spaceCount = 0;
            }
        }

        const lastChar = charsInput[charsInput.length - 1];

        if (lastChar !== '\r' && lastChar !== '\n')
        {
            if ((/(?:\s)/).test(lastChar))
            {
                lastLineWidth = lastBreakWidth;
            }

            lineWidths.push(lastLineWidth);
            maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
            lineSpaces.push(-1);
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
            else if (this._align === 'justify')
            {
                alignOffset = lineSpaces[i] < 0 ? 0 : (maxLineWidth - lineWidths[i]) / lineSpaces[i];
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
                    const material = new MeshMaterial(Texture.EMPTY,
                        { program: new Program(msdfVert, msdfFrag), uniforms: { uFWidth: distanceFieldRange } });

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
                const { _textureCache } = this;

                _textureCache[baseTextureUid] = _textureCache[baseTextureUid] || new Texture(texture.baseTexture);
                pageMeshData.mesh.texture = _textureCache[baseTextureUid];

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
            else
            {
                const total = pageMeshData.total;
                const vertices = pageMeshData.vertices;

                // Clear the garbage at the end of the vertices buffer. This will prevent the bounds miscalculation.
                for (let i = total * 4 * 2; i < vertices.length; i++)
                {
                    vertices[i] = 0;
                }
            }

            // as a buffer maybe bigger than the current word, we set the size of the meshMaterial
            // to match the number of letters needed
            pageMeshData.mesh.size = 6 * total;
        }

        for (let i = 0; i < lenChars; i++)
        {
            const char = chars[i];
            let offset = char.position.x + (lineAlignOffsets[char.line] * (this._align === 'justify' ? char.prevSpaces : 1));

            if (this._roundPixels)
            {
                offset = Math.round(offset);
            }

            const xPos = offset * scale;
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

    _render(renderer: Renderer): void
    {
        // Inject the shader code with the correct value
        const { a, b, c, d } = this.worldTransform;

        const dx = Math.sqrt((a * a) + (b * b));
        const dy = Math.sqrt((c * c) + (d * d));
        const worldScale = (Math.abs(dx) + Math.abs(dy)) / 2;

        const { distanceFieldRange, size } = BitmapFont.available[this._fontName];
        const fontScale = this._fontSize / size;

        for (const mesh of this._activePagesMeshData)
        {
            // ? Should we cache the scale and avoid writing the uniform every frame?
            mesh.mesh.shader.uniforms.uFWidth = worldScale * distanceFieldRange * fontScale;
        }

        super._render(renderer);
    }
}
