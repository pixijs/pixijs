import { Texture } from '@pixi/core';
import { SimplePlane } from './SimplePlane';

import type { ITypedArray } from '@pixi/core';

const DEFAULT_BORDER_SIZE = 10;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NineSlicePlane extends GlobalMixins.NineSlicePlane {}

/**
 * The NineSlicePlane allows you to stretch a texture using 9-slice scaling. The corners will remain unscaled (useful
 * for buttons with rounded corners for example) and the other areas will be scaled horizontally and or vertically
 *
 * <pre>
 *      A                          B
 *    +---+----------------------+---+
 *  C | 1 |          2           | 3 |
 *    +---+----------------------+---+
 *    |   |                      |   |
 *    | 4 |          5           | 6 |
 *    |   |                      |   |
 *    +---+----------------------+---+
 *  D | 7 |          8           | 9 |
 *    +---+----------------------+---+
 *  When changing this objects width and/or height:
 *     areas 1 3 7 and 9 will remain unscaled.
 *     areas 2 and 8 will be stretched horizontally
 *     areas 4 and 6 will be stretched vertically
 *     area 5 will be stretched both horizontally and vertically
 * </pre>
 * @example
 * import { NineSlicePlane, Texture } from 'pixi.js';
 *
 * const plane9 = new NineSlicePlane(Texture.from('BoxWithRoundedCorners.png'), 15, 15, 15, 15);
 * @memberof PIXI
 */
export class NineSlicePlane extends SimplePlane
{
    private _origWidth: number;
    private _origHeight: number;

    /**
     * The width of the left column (a).
     * @private
     */
    _leftWidth: number;

    /**
     * The width of the right column (b)
     * @private
     */
    _rightWidth: number;

    /**
     * The height of the top row (c)
     * @private
     */
    _topHeight: number;

    /**
     * The height of the bottom row (d)
     * @private
     */
    _bottomHeight: number;

    /**
     * @param texture - The texture to use on the NineSlicePlane.
     * @param {number} [leftWidth=10] - size of the left vertical bar (A)
     * @param {number} [topHeight=10] - size of the top horizontal bar (C)
     * @param {number} [rightWidth=10] - size of the right vertical bar (B)
     * @param {number} [bottomHeight=10] - size of the bottom horizontal bar (D)
     */
    constructor(
        texture: Texture,
        leftWidth = DEFAULT_BORDER_SIZE,
        topHeight = DEFAULT_BORDER_SIZE,
        rightWidth = DEFAULT_BORDER_SIZE,
        bottomHeight = DEFAULT_BORDER_SIZE
    )
    {
        super(Texture.WHITE, 4, 4);

        this._origWidth = texture.orig.width;
        this._origHeight = texture.orig.height;

        /** The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane. */
        this._width = this._origWidth;

        /** The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane. */
        this._height = this._origHeight;

        this._leftWidth = leftWidth;
        this._rightWidth = rightWidth;
        this._topHeight = topHeight;
        this._bottomHeight = bottomHeight;

        // lets call the setter to ensure all necessary updates are performed
        this.texture = texture;
    }

    public textureUpdated(): void
    {
        this._textureID = this.shader.texture._updateID;
        this._refresh();
    }

    get vertices(): ITypedArray
    {
        return this.geometry.getBuffer('aVertexPosition').data;
    }

    set vertices(value: ITypedArray)
    {
        this.geometry.getBuffer('aVertexPosition').data = value;
    }

    /** Updates the horizontal vertices. */
    public updateHorizontalVertices(): void
    {
        const vertices = this.vertices;

        const scale = this._getMinScale();

        vertices[9] = vertices[11] = vertices[13] = vertices[15] = this._topHeight * scale;
        vertices[17] = vertices[19] = vertices[21] = vertices[23] = this._height - (this._bottomHeight * scale);
        vertices[25] = vertices[27] = vertices[29] = vertices[31] = this._height;
    }

    /** Updates the vertical vertices. */
    public updateVerticalVertices(): void
    {
        const vertices = this.vertices;

        const scale = this._getMinScale();

        vertices[2] = vertices[10] = vertices[18] = vertices[26] = this._leftWidth * scale;
        vertices[4] = vertices[12] = vertices[20] = vertices[28] = this._width - (this._rightWidth * scale);
        vertices[6] = vertices[14] = vertices[22] = vertices[30] = this._width;
    }

    /**
     * Returns the smaller of a set of vertical and horizontal scale of nine slice corners.
     * @returns Smaller number of vertical and horizontal scale.
     */
    private _getMinScale(): number
    {
        const w = this._leftWidth + this._rightWidth;
        const scaleW = this._width > w ? 1.0 : this._width / w;

        const h = this._topHeight + this._bottomHeight;
        const scaleH = this._height > h ? 1.0 : this._height / h;

        const scale = Math.min(scaleW, scaleH);

        return scale;
    }

    /** The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane. */
    get width(): number
    {
        return this._width;
    }

    set width(value: number)
    {
        this._width = value;
        this._refresh();
    }

    /** The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane. */
    get height(): number
    {
        return this._height;
    }

    set height(value: number)
    {
        this._height = value;
        this._refresh();
    }

    /** The width of the left column. */
    get leftWidth(): number
    {
        return this._leftWidth;
    }

    set leftWidth(value: number)
    {
        this._leftWidth = value;
        this._refresh();
    }

    /** The width of the right column. */
    get rightWidth(): number
    {
        return this._rightWidth;
    }

    set rightWidth(value: number)
    {
        this._rightWidth = value;
        this._refresh();
    }

    /** The height of the top row. */
    get topHeight(): number
    {
        return this._topHeight;
    }

    set topHeight(value: number)
    {
        this._topHeight = value;
        this._refresh();
    }

    /** The height of the bottom row. */
    get bottomHeight(): number
    {
        return this._bottomHeight;
    }

    set bottomHeight(value: number)
    {
        this._bottomHeight = value;
        this._refresh();
    }

    /** Refreshes NineSlicePlane coords. All of them. */
    private _refresh(): void
    {
        const texture = this.texture;

        const uvs = this.geometry.buffers[1].data;

        this._origWidth = texture.orig.width;
        this._origHeight = texture.orig.height;

        const _uvw = 1.0 / this._origWidth;
        const _uvh = 1.0 / this._origHeight;

        uvs[0] = uvs[8] = uvs[16] = uvs[24] = 0;
        uvs[1] = uvs[3] = uvs[5] = uvs[7] = 0;
        uvs[6] = uvs[14] = uvs[22] = uvs[30] = 1;
        uvs[25] = uvs[27] = uvs[29] = uvs[31] = 1;

        uvs[2] = uvs[10] = uvs[18] = uvs[26] = _uvw * this._leftWidth;
        uvs[4] = uvs[12] = uvs[20] = uvs[28] = 1 - (_uvw * this._rightWidth);
        uvs[9] = uvs[11] = uvs[13] = uvs[15] = _uvh * this._topHeight;
        uvs[17] = uvs[19] = uvs[21] = uvs[23] = 1 - (_uvh * this._bottomHeight);

        this.updateHorizontalVertices();
        this.updateVerticalVertices();

        this.geometry.buffers[0].update();
        this.geometry.buffers[1].update();
    }
}
