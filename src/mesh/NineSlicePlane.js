import Plane from './Plane';
import CanvasTinter from '../core/sprites/canvas/CanvasTinter';

const DEFAULT_BORDER_SIZE = 10;

/**
 * The NineSlicePlane allows you to stretch a texture using 9-slice scaling. The corners will remain unscaled (useful
 * for buttons with rounded corners for example) and the other areas will be scaled horizontally and or vertically
 *
 *```js
 * let Plane9 = new PIXI.NineSlicePlane(PIXI.Texture.fromImage('BoxWithRoundedCorners.png'), 15, 15, 15, 15);
 *  ```
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
 *
 * @class
 * @extends PIXI.mesh.Plane
 * @memberof PIXI.mesh
 *
 */
export default class NineSlicePlane extends Plane
{
    /**
     * @param {PIXI.Texture} texture - The texture to use on the NineSlicePlane.
     * @param {int} [leftWidth=10] size of the left vertical bar (A)
     * @param {int} [topHeight=10] size of the top horizontal bar (C)
     * @param {int} [rightWidth=10] size of the right vertical bar (B)
     * @param {int} [bottomHeight=10] size of the bottom horizontal bar (D)
     */
    constructor(texture, leftWidth, topHeight, rightWidth, bottomHeight)
    {
        super(texture, 4, 4);

        this._origWidth = texture.orig.width;
        this._origHeight = texture.orig.height;

        /**
         * The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
         *
         * @member {number}
         * @memberof PIXI.NineSlicePlane#
         * @override
         */
        this._width = this._origWidth;

        /**
         * The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
         *
         * @member {number}
         * @memberof PIXI.NineSlicePlane#
         * @override
         */
        this._height = this._origHeight;

        /**
         * The width of the left column (a)
         *
         * @member {number}
         * @memberof PIXI.NineSlicePlane#
         * @override
         */
        this._leftWidth = typeof leftWidth !== 'undefined' ? leftWidth : DEFAULT_BORDER_SIZE;

        /**
         * The width of the right column (b)
         *
         * @member {number}
         * @memberof PIXI.NineSlicePlane#
         * @override
         */
        this._rightWidth = typeof rightWidth !== 'undefined' ? rightWidth : DEFAULT_BORDER_SIZE;

        /**
         * The height of the top row (c)
         *
         * @member {number}
         * @memberof PIXI.NineSlicePlane#
         * @override
         */
        this._topHeight = typeof topHeight !== 'undefined' ? topHeight : DEFAULT_BORDER_SIZE;

        /**
         * The height of the bottom row (d)
         *
         * @member {number}
         * @memberof PIXI.NineSlicePlane#
         * @override
         */
        this._bottomHeight = typeof bottomHeight !== 'undefined' ? bottomHeight : DEFAULT_BORDER_SIZE;

        /**
         * Cached tint value so we can tell when the tint is changed.
         *
         * @member {number}
         * @protected
         */
        this._cachedTint = 0xFFFFFF;

        /**
         * Cached tinted texture.
         *
         * @member {HTMLCanvasElement}
         * @protected
         */
        this._tintedTexture = null;

        /**
         * Temporary storage for canvas source coords
         *
         * @member {number[]}
         * @private
         */
        this._canvasUvs = null;

        this.refresh(true);
    }

    /**
     * Updates the horizontal vertices.
     *
     */
    updateHorizontalVertices()
    {
        const vertices = this.vertices;

        const h = this._topHeight + this._bottomHeight;
        const scale = this._height > h ? 1.0 : this._height / h;

        vertices[9] = vertices[11] = vertices[13] = vertices[15] = this._topHeight * scale;
        vertices[17] = vertices[19] = vertices[21] = vertices[23] = this._height - (this._bottomHeight * scale);
        vertices[25] = vertices[27] = vertices[29] = vertices[31] = this._height;
    }

    /**
     * Updates the vertical vertices.
     *
     */
    updateVerticalVertices()
    {
        const vertices = this.vertices;

        const w = this._leftWidth + this._rightWidth;
        const scale = this._width > w ? 1.0 : this._width / w;

        vertices[2] = vertices[10] = vertices[18] = vertices[26] = this._leftWidth * scale;
        vertices[4] = vertices[12] = vertices[20] = vertices[28] = this._width - (this._rightWidth * scale);
        vertices[6] = vertices[14] = vertices[22] = vertices[30] = this._width;
    }

    /**
     * Renders the object using the Canvas renderer
     *
     * @private
     * @param {PIXI.CanvasRenderer} renderer - The canvas renderer to render with.
     */
    _renderCanvas(renderer)
    {
        const context = renderer.context;
        const transform = this.worldTransform;
        const res = renderer.resolution;
        const isTinted = this.tint !== 0xFFFFFF;
        const texture = this._texture;

        // Work out tinting
        if (isTinted)
        {
            if (this._cachedTint !== this.tint)
            {
                // Tint has changed, need to update the tinted texture and use that instead

                this._cachedTint = this.tint;

                this._tintedTexture = CanvasTinter.getTintedTexture(this, this.tint);
            }
        }

        const textureSource = !isTinted ? texture.baseTexture.source : this._tintedTexture;

        if (!this._canvasUvs)
        {
            this._canvasUvs = [0, 0, 0, 0, 0, 0, 0, 0];
        }

        const vertices = this.vertices;
        const uvs = this._canvasUvs;
        const u0 = isTinted ? 0 : texture.frame.x;
        const v0 = isTinted ? 0 : texture.frame.y;
        const u1 = u0 + texture.frame.width;
        const v1 = v0 + texture.frame.height;

        uvs[0] = u0;
        uvs[1] = u0 + this._leftWidth;
        uvs[2] = u1 - this._rightWidth;
        uvs[3] = u1;
        uvs[4] = v0;
        uvs[5] = v0 + this._topHeight;
        uvs[6] = v1 - this._bottomHeight;
        uvs[7] = v1;

        for (let i = 0; i < 8; i++)
        {
            uvs[i] *= texture.baseTexture.resolution;
        }

        context.globalAlpha = this.worldAlpha;
        renderer.setBlendMode(this.blendMode);

        if (renderer.roundPixels)
        {
            context.setTransform(
                transform.a * res,
                transform.b * res,
                transform.c * res,
                transform.d * res,
                (transform.tx * res) | 0,
                (transform.ty * res) | 0
            );
        }
        else
        {
            context.setTransform(
                transform.a * res,
                transform.b * res,
                transform.c * res,
                transform.d * res,
                transform.tx * res,
                transform.ty * res
            );
        }

        for (let row = 0; row < 3; row++)
        {
            for (let col = 0; col < 3; col++)
            {
                const ind = (col * 2) + (row * 8);
                const sw = Math.max(1, uvs[col + 1] - uvs[col]);
                const sh = Math.max(1, uvs[row + 5] - uvs[row + 4]);
                const dw = Math.max(1, vertices[ind + 10] - vertices[ind]);
                const dh = Math.max(1, vertices[ind + 11] - vertices[ind + 1]);

                context.drawImage(textureSource, uvs[col], uvs[row + 4], sw, sh,
                    vertices[ind], vertices[ind + 1], dw, dh);
            }
        }
    }

    /**
     * The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
     *
     * @member {number}
     */
    get width()
    {
        return this._width;
    }

    set width(value) // eslint-disable-line require-jsdoc
    {
        this._width = value;
        this._refresh();
    }

    /**
     * The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
     *
     * @member {number}
     */
    get height()
    {
        return this._height;
    }

    set height(value) // eslint-disable-line require-jsdoc
    {
        this._height = value;
        this._refresh();
    }

    /**
     * The width of the left column
     *
     * @member {number}
     */
    get leftWidth()
    {
        return this._leftWidth;
    }

    set leftWidth(value) // eslint-disable-line require-jsdoc
    {
        this._leftWidth = value;
        this._refresh();
    }

    /**
     * The width of the right column
     *
     * @member {number}
     */
    get rightWidth()
    {
        return this._rightWidth;
    }

    set rightWidth(value) // eslint-disable-line require-jsdoc
    {
        this._rightWidth = value;
        this._refresh();
    }

    /**
     * The height of the top row
     *
     * @member {number}
     */
    get topHeight()
    {
        return this._topHeight;
    }

    set topHeight(value) // eslint-disable-line require-jsdoc
    {
        this._topHeight = value;
        this._refresh();
    }

    /**
     * The height of the bottom row
     *
     * @member {number}
     */
    get bottomHeight()
    {
        return this._bottomHeight;
    }

    set bottomHeight(value) // eslint-disable-line require-jsdoc
    {
        this._bottomHeight = value;
        this._refresh();
    }

    /**
     * Refreshes NineSlicePlane coords. All of them.
     */
    _refresh()
    {
        super._refresh();

        const uvs = this.uvs;
        const texture = this._texture;

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

        this.dirty++;

        this.multiplyUvs();
    }
}
