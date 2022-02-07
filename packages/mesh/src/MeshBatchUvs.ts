import type { TextureMatrix, Buffer } from '@pixi/core';

/**
 * Class controls cache for UV mapping from Texture normal space to BaseTexture normal space.
 *
 * @memberof PIXI
 */
export class MeshBatchUvs
{
    /** UV Buffer data. */
    public readonly data: Float32Array;

    /** Buffer with normalized UV's. */
    public uvBuffer: Buffer;

    /** Material UV matrix. */
    public uvMatrix: TextureMatrix;

    private _bufferUpdateId: number;
    private _textureUpdateId: number;

    // Internal-only properties
    _updateID: number;

    /**
     * @param uvBuffer - Buffer with normalized uv's
     * @param uvMatrix - Material UV matrix
     */
    constructor(uvBuffer: Buffer, uvMatrix: TextureMatrix)
    {
        this.uvBuffer = uvBuffer;
        this.uvMatrix = uvMatrix;
        this.data = null;

        this._bufferUpdateId = -1;
        this._textureUpdateId = -1;
        this._updateID = 0;
    }

    /**
     * Updates
     *
     * @param forceUpdate - force the update
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
