import { Matrix } from '../../../../maths/matrix/Matrix';

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
 * @see Texture
 * @see Mesh
 * @see TilingSprite
 * @memberof rendering
 */
export class TextureMatrix
{
    /**
     * Matrix operation that converts texture region coords to texture coords
     * @readonly
     */
    public mapCoord: Matrix;

    /**
     * Changes frame clamping
     * Works with TilingSprite and Mesh
     * Change to 1.5 if you texture has repeated right and bottom lines, that leads to smoother borders
     * @default 0
     */
    public clampOffset: number;

    /**
     * Changes frame clamping
     * Works with TilingSprite and Mesh
     * Change to -0.5 to add a pixel to the edge, recommended for transparent trimmed textures in atlas
     * @default 0.5
     */
    public clampMargin: number;

    /**
     * Clamp region for normalized coords, left-top pixel center in xy , bottom-right in zw.
     * Calculated based on clampOffset.
     */
    public readonly uClampFrame: Float32Array;

    /** Normalized clamp offset. Calculated based on clampOffset. */
    public readonly uClampOffset: Float32Array;

    /**
     * Tracks Texture frame changes.
     * @ignore
     */
    public _updateID: number;

    /**
     * Tracks Texture frame changes.
     * @protected
     */
    protected _textureID: number;

    protected _texture: Texture;

    /**
     * If texture size is the same as baseTexture.
     * @default false
     * @readonly
     */
    public isSimple: boolean;

    /**
     * @param texture - observed texture
     * @param clampMargin - Changes frame clamping, 0.5 by default. Use -0.5 for extra border.
     */
    constructor(texture: Texture, clampMargin?: number)
    {
        this.mapCoord = new Matrix();
        this.uClampFrame = new Float32Array(4);
        this.uClampOffset = new Float32Array(2);
        this._textureID = -1;
        this._updateID = 0;

        this.clampOffset = 0;

        if ((typeof clampMargin === 'undefined'))
        {
            this.clampMargin = (texture.width < 10) ? 0 : 0.5;
        }
        else
        {
            this.clampMargin = clampMargin;
        }

        this.isSimple = false;

        this.texture = texture;
    }

    /** Texture property. */
    get texture(): Texture
    {
        return this._texture;
    }

    set texture(value: Texture)
    {
        if (this.texture === value) return;

        this._texture?.removeListener('update', this.update, this);
        this._texture = value;
        this._texture.addListener('update', this.update, this);

        this.update();
    }

    /**
     * Multiplies uvs array to transform
     * @param uvs - mesh uvs
     * @param [out=uvs] - output
     * @returns - output
     */
    public multiplyUvs(uvs: Float32Array, out?: Float32Array): Float32Array
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
     * Updates matrices if texture was changed
     * @returns - whether or not it was updated
     */
    public update(): boolean
    {
        const tex = this._texture;

        this._updateID++;

        const uvs = tex.uvs;

        this.mapCoord.set(uvs.x1 - uvs.x0, uvs.y1 - uvs.y0, uvs.x3 - uvs.x0, uvs.y3 - uvs.y0, uvs.x0, uvs.y0);

        const orig = tex.orig;
        const trim = tex.trim;

        if (trim)
        {
            tempMat.set(
                orig.width / trim.width,
                0, 0, orig.height / trim.height,
                -trim.x / trim.width,
                -trim.y / trim.height
            );

            this.mapCoord.append(tempMat);
        }

        const texBase = tex.source;
        const frame = this.uClampFrame;
        const margin = this.clampMargin / texBase._resolution;
        const offset = this.clampOffset / texBase._resolution;

        frame[0] = (tex.frame.x + margin + offset) / texBase.width;
        frame[1] = (tex.frame.y + margin + offset) / texBase.height;
        frame[2] = (tex.frame.x + tex.frame.width - margin + offset) / texBase.width;
        frame[3] = (tex.frame.y + tex.frame.height - margin + offset) / texBase.height;

        this.uClampOffset[0] = this.clampOffset / texBase.pixelWidth;
        this.uClampOffset[1] = this.clampOffset / texBase.pixelHeight;

        this.isSimple = tex.frame.width === texBase.width
            && tex.frame.height === texBase.height
            && tex.rotate === 0;

        return true;
    }
}
