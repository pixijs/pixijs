import type { Batch, BatchableObject, Batcher } from '../../../rendering/batcher/shared/Batcher';
import type { IndexBufferArray } from '../../../rendering/renderers/shared/geometry/Geometry';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { Container } from '../../container/Container';
import type { MeshGeometry } from './MeshGeometry';

/**
 * A batchable mesh object.
 * @ignore
 */
export class BatchableMesh implements BatchableObject
{
    public indexStart: number;
    public textureId: number;
    public texture: Texture;
    public location: number;
    public batcher: Batcher = null;
    public batch: Batch = null;
    public mesh: Container;
    public geometry: MeshGeometry;

    public roundPixels: 0 | 1 = 0;

    private _transformedUvs: Float32Array;
    private _uvUpdateId: number = -1;
    private _textureMatrixUpdateId: number = -1;

    get blendMode() { return this.mesh.groupBlendMode; }

    public reset()
    {
        this.mesh = null;
        this.texture = null;
        this.batcher = null;
        this.batch = null;
    }

    public packIndex(indexBuffer: IndexBufferArray, index: number, indicesOffset: number)
    {
        const indices = this.geometry.indices;

        for (let i = 0; i < indices.length; i++)
        {
            indexBuffer[index++] = indices[i] + indicesOffset;
        }
    }

    public packAttributes(
        float32View: Float32Array,
        uint32View: Uint32Array,
        index: number,
        textureId: number
    )
    {
        const mesh = this.mesh;

        const geometry = this.geometry;
        const wt = mesh.groupTransform;

        const textureIdAndRound = (textureId << 16) | (this.roundPixels & 0xFFFF);

        const a = wt.a;
        const b = wt.b;
        const c = wt.c;
        const d = wt.d;
        const tx = wt.tx;
        const ty = wt.ty;

        // const trim = texture.trim;
        const positions = geometry.positions;
        const uvBuffer = geometry.getBuffer('aUV');

        const uvs = uvBuffer.data;

        let transformedUvs = uvs;
        const textureMatrix = this.texture.textureMatrix;

        if (!textureMatrix.isSimple)
        {
            transformedUvs = this._transformedUvs;

            if (this._textureMatrixUpdateId !== textureMatrix._updateID || this._uvUpdateId !== uvBuffer._updateID)
            {
                if (!transformedUvs || transformedUvs.length < uvs.length)
                {
                    transformedUvs = this._transformedUvs = new Float32Array(uvs.length);
                }

                this._textureMatrixUpdateId = textureMatrix._updateID;
                this._uvUpdateId = uvBuffer._updateID;

                textureMatrix.multiplyUvs(uvs as Float32Array, transformedUvs);
            }
        }

        const abgr = mesh.groupColorAlpha;

        for (let i = 0; i < positions.length; i += 2)
        {
            const x = positions[i];
            const y = positions[i + 1];

            float32View[index] = (a * x) + (c * y) + tx;
            float32View[index + 1] = (b * x) + (d * y) + ty;

            // TODO implement texture matrix?
            float32View[index + 2] = transformedUvs[i];
            float32View[index + 3] = transformedUvs[i + 1];

            uint32View[index + 4] = abgr;
            uint32View[index + 5] = textureIdAndRound;

            index += 6;
        }
    }

    get vertexSize()
    {
        return this.geometry.positions.length / 2;
    }

    get indexSize()
    {
        return this.geometry.indices.length;
    }
}
