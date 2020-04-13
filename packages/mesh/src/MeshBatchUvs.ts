import type { TextureMatrix, Buffer } from '@pixi/core';

/**
 * Class controls cache for UV mapping from Texture normal space to BaseTexture normal space.
 *
 * @class
 * @memberof PIXI
 */
export class MeshBatchUvs
{
    public readonly data: Float32Array;
    public uvBuffer: Buffer;
    public uvMatrix: TextureMatrix;

    private _bufferUpdateId: number;
    private _textureUpdateId: number;
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    private _updateID: number;

    /**
     * @param {PIXI.Buffer} uvBuffer - Buffer with normalized uv's
     * @param {PIXI.TextureMatrix} uvMatrix - Material UV matrix
     */
    constructor(uvBuffer: Buffer, uvMatrix: TextureMatrix)
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
     * @param {boolean} [forceUpdate] - force the update
     */
    public update(forceUpdate?: boolean): void
    {
        if (!forceUpdate
            && this._bufferUpdateId === this.uvBuffer._updateID
            && this._textureUpdateId === this.uvMatrix._updateID
        )
        {
            return;
        }

        this._bufferUpdateId = this.uvBuffer._updateID;
        this._textureUpdateId = this.uvMatrix._updateID;

        const data = this.uvBuffer.data as Float32Array;

        if (!this.data || this.data.length !== data.length)
        {
            (this.data as any) = new Float32Array(data.length);
        }

        this.uvMatrix.multiplyUvs(data, this.data);

        this._updateID++;
    }
}
