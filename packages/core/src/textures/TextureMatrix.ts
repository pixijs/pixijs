import { Matrix } from '@pixi/math';

import type { Texture } from './Texture';

const tempMat = new Matrix();

/**
 * Class controls uv mapping from Texture normal space to BaseTexture normal space.
 *
 * Takes `trim` and `rotate` into account. May contain clamp settings for Meshes and TilingSprite.
 *
 * Can be used in Texture `uvMatrix` field, or separately, you can use different clamp settings on the same texture.
 * If you want to add support for texture region of certain feature or filter, that's what you're looking for.
 *
 * Takes track of Texture changes through `_lastTextureID` private field.
 * Use `update()` method call to track it from outside.
 *
 * @see PIXI.Texture
 * @see PIXI.Mesh
 * @see PIXI.TilingSprite
 * @class
 * @memberof PIXI
 */
export class TextureMatrix
{
    public mapCoord: Matrix;
    public clampOffset: number;
    public clampMargin: number;
    readonly uClampFrame: Float32Array;
    readonly uClampOffset: Float32Array;
    _updateID: number;
    _texture: Texture;
    isSimple: boolean;
    /**
     *
     * @param {PIXI.Texture} texture observed texture
     * @param {number} [clampMargin] Changes frame clamping, 0.5 by default. Use -0.5 for extra border.
     * @constructor
     */
    constructor(texture: Texture, clampMargin?: number)
    {
        this._texture = texture;

        /**
         * Matrix operation that converts texture region coords to texture coords
         * @member {PIXI.Matrix}
         * @readonly
         */
        this.mapCoord = new Matrix();

        /**
         * Clamp region for normalized coords, left-top pixel center in xy , bottom-right in zw.
         * Calculated based on clampOffset.
         * @member {Float32Array}
         * @readonly
         */
        this.uClampFrame = new Float32Array(4);

        /**
         * Normalized clamp offset.
         * Calculated based on clampOffset.
         * @member {Float32Array}
         * @readonly
         */
        this.uClampOffset = new Float32Array(2);

        /**
         * Tracks Texture frame changes
         * @member {number}
         * @protected
         */
        this._updateID = -1;

        /**
         * Changes frame clamping
         * Works with TilingSprite and Mesh
         * Change to 1.5 if you texture has repeated right and bottom lines, that leads to smoother borders
         *
         * @default 0
         * @member {number}
         */
        this.clampOffset = 0;

        /**
         * Changes frame clamping
         * Works with TilingSprite and Mesh
         * Change to -0.5 to add a pixel to the edge, recommended for transparent trimmed textures in atlas
         *
         * @default 0.5
         * @member {number}
         */
        this.clampMargin = (typeof clampMargin === 'undefined') ? 0.5 : clampMargin;

        /**
         * If texture size is the same as baseTexture
         * @member {boolean}
         * @default false
         * @readonly
         */
        this.isSimple = false;
    }

    /**
     * texture property
     * @member {PIXI.Texture}
     */
    get texture(): Texture
    {
        return this._texture;
    }

    set texture(value: Texture) // eslint-disable-line require-jsdoc
    {
        this._texture = value;
        this._updateID = -1;
    }

    /**
     * Multiplies uvs array to transform
     * @param {Float32Array} uvs mesh uvs
     * @param {Float32Array} [out=uvs] output
     * @returns {Float32Array} output
     */
    multiplyUvs(uvs: Float32Array, out?: Float32Array): Float32Array
    {
        if (out === undefined)
        {
            out = uvs;
        }

        const mat = this.mapCoord;

        for (let i = 0; i < uvs.length; i += 2)
        {
            const x = uvs[i];
            const y = uvs[i + 1];

            out[i] = (x * mat.a) + (y * mat.c) + mat.tx;
            out[i + 1] = (x * mat.b) + (y * mat.d) + mat.ty;
        }

        return out;
    }

    /**
     * updates matrices if texture was changed
     * @param {boolean} [forceUpdate=false] if true, matrices will be updated any case
     * @returns {boolean} whether or not it was updated
     */
    update(forceUpdate?: boolean): boolean
    {
        const tex = this._texture;

        if (!tex || !tex.valid)
        {
            return false;
        }

        if (!forceUpdate
            && this._updateID === tex._updateID)
        {
            return false;
        }

        this._updateID = tex._updateID;

        const uvs = tex._uvs;

        this.mapCoord.set(uvs.x1 - uvs.x0, uvs.y1 - uvs.y0, uvs.x3 - uvs.x0, uvs.y3 - uvs.y0, uvs.x0, uvs.y0);

        const orig = tex.orig;
        const trim = tex.trim;

        if (trim)
        {
            tempMat.set(orig.width / trim.width, 0, 0, orig.height / trim.height,
                -trim.x / trim.width, -trim.y / trim.height);
            this.mapCoord.append(tempMat);
        }

        const texBase = tex.baseTexture;
        const frame = this.uClampFrame;
        const margin = this.clampMargin / texBase.resolution;
        const offset = this.clampOffset;

        frame[0] = (tex._frame.x + margin + offset) / texBase.width;
        frame[1] = (tex._frame.y + margin + offset) / texBase.height;
        frame[2] = (tex._frame.x + tex._frame.width - margin + offset) / texBase.width;
        frame[3] = (tex._frame.y + tex._frame.height - margin + offset) / texBase.height;
        this.uClampOffset[0] = offset / texBase.realWidth;
        this.uClampOffset[1] = offset / texBase.realHeight;

        this.isSimple = tex._frame.width === texBase.width
            && tex._frame.height === texBase.height
            && tex.rotate === 0;

        return true;
    }
}
