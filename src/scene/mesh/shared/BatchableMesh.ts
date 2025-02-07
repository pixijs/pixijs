import type { Matrix } from '../../../maths/matrix/Matrix';
import type { Batch, Batcher } from '../../../rendering/batcher/shared/Batcher';
import type { DefaultBatchableMeshElement } from '../../../rendering/batcher/shared/DefaultBatcher';
import type { Topology } from '../../../rendering/renderers/shared/geometry/const';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { ViewContainer } from '../../view/ViewContainer';
import type { MeshGeometry } from './MeshGeometry';

/**
 * A batchable mesh object.
 * @ignore
 */
export class BatchableMesh implements DefaultBatchableMeshElement
{
    public batcherName = 'default';

    public _topology: Topology;

    public readonly packAsQuad = false;
    public location: number;

    public renderable: ViewContainer;

    public indexOffset = 0;
    public attributeOffset = 0;

    public texture: Texture;
    public geometry: MeshGeometry;
    public transform: Matrix;
    public roundPixels: 0 | 1 = 0;

    public _attributeStart: number;
    public _batcher: Batcher = null;
    public _batch: Batch = null;
    public _indexStart: number;
    public _textureId: number;
    public _textureMatrixUpdateId: number = -1;

    private _transformedUvs: Float32Array;
    private _uvUpdateId: number = -1;

    get blendMode() { return this.renderable.groupBlendMode; }

    get topology() { return this._topology || this.geometry.topology; }
    set topology(value: Topology) { this._topology = value; }

    public reset()
    {
        this.renderable = null;
        this.texture = null;
        this._batcher = null;
        this._batch = null;
        this.geometry = null;
        this._uvUpdateId = -1;
        this._textureMatrixUpdateId = -1;
    }

    /**
     * Sets the texture for the batchable mesh.
     * As it does so, it resets the texture matrix update ID.
     * this is to ensure that the texture matrix is recalculated when the uvs are referenced
     * @param value - The texture to set.
     */
    public setTexture(value: Texture)
    {
        if (this.texture === value) return;

        this.texture = value;
        this._textureMatrixUpdateId = -1;
    }

    get uvs()
    {
        const geometry = this.geometry;

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

        return transformedUvs as Float32Array;
    }

    get positions()
    {
        return this.geometry.positions;
    }

    get indices()
    {
        return this.geometry.indices;
    }

    get color()
    {
        return this.renderable.groupColorAlpha;
    }

    get groupTransform()
    {
        return this.renderable.groupTransform;
    }

    get attributeSize()
    {
        return this.geometry.positions.length / 2;
    }

    get indexSize()
    {
        return this.geometry.indices.length;
    }
}
