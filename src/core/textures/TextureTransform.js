import { default as Matrix } from '../math/Matrix';

const tempMat = new Matrix();

/**
 * class controls uv transform and frame clamp for texture
 */
export default class TextureTransform {
    /**
     *
     * @param {PIXI.Texture} texture observed texture
     * @constructor
     */
    constructor(texture)
    {
        this._texture = texture;

        this.mapCoord = new Matrix();

        this.clampFrame = new Float32Array(4);

        this.clampOffset = new Float32Array(2);

        this._lastTextureID = -1;

        this.update();
    }

    /**
     * texture property
     * @member {PIXI.Texture}
     * @memberof PIXI.TextureTransform
     */
    get texture()
    {
        return this._texture;
    }

    /**
     * sets texture value
     * @param {PIXI.Texture} value texture to be set
     */
    set texture(value)
    {
        this._texture = value;
        this._lastTextureID = -1;
    }

    /**
     * updates matrices if texture was changed
     * @param {boolean} forceUpdate if true, matrices will be updated any case
     */
    update(forceUpdate)
    {
        const tex = this.texture;

        if (!tex || !tex.valid)
        {
            return;
        }

        if (!forceUpdate
            && this._lastTextureID === this.texture._updateID)
        {
            return;
        }

        this._lastTextureID = this.texture._updateID;

        const uvs = this.texture._uvs;

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
        const frame = this.clampFrame;
        const margin = tex.clampMargin / texBase.resolution;
        const offset = tex.clampOffset;

        frame[0] = (tex._frame.x + margin + offset) / texBase.width;
        frame[1] = (tex._frame.y + margin + offset) / texBase.height;
        frame[2] = (tex._frame.x + tex._frame.width - margin + offset) / texBase.width;
        frame[3] = (tex._frame.y + tex._frame.height - margin + offset) / texBase.height;
        this.clampOffset[0] = offset / texBase.realWidth;
        this.clampOffset[1] = offset / texBase.realHeight;
    }
}
