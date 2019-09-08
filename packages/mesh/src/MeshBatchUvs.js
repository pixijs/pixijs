/**
 * Class controls cache for UV mapping from Texture normal space to BaseTexture normal space.
 *
 * @class
 * @memberof PIXI
 */
export class MeshBatchUvs
{
    /**
     * @param {PIXI.Buffer} uvBuffer - Buffer with normalized uv's
     * @param {PIXI.TextureMatrix} uvMatrix - Material UV matrix
     */
    constructor(uvBuffer, uvMatrix)
    {
        /**
         * Buffer with normalized UV's
         * @member {PIXI.Buffer}
         */
        this.uvBuffer = uvBuffer;

        /**
         * Material UV matrix
         * @member {PIXI.TextureMatrix}
         */
        this.uvMatrix = uvMatrix;

        /**
         * UV Buffer data
         * @member {Float32Array}
         * @readonly
         */
        this.data = null;

        this._bufferUpdateId = -1;

        this._textureUpdateId = -1;

        this._updateID = 0;
    }

    /**
     * updates
     *
     * @param {boolean} forceUpdate - force the update
     */
    update(forceUpdate)
    {
        if (!forceUpdate
            && this._bufferUpdateId === this.uvBuffer._updateID
            && this._textureUpdateId === this.uvMatrix._updateID)
        {
            return;
        }

        this._bufferUpdateId = this.uvBuffer._updateID;
        this._textureUpdateId = this.uvMatrix._updateID;

        const data = this.uvBuffer.data;

        if (!this.data || this.data.length !== data.length)
        {
            this.data = new Float32Array(data.length);
        }

        this.uvMatrix.multiplyUvs(data, this.data);

        this._updateID++;
    }
}
