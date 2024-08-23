import type { Batch, BatchableMeshElement, Batcher } from '../../../rendering/batcher/shared/Batcher';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { ViewContainer } from '../../view/View';
import type { MeshGeometry } from './MeshGeometry';

/**
 * A batchable mesh object.
 * @ignore
 */
export class BatchableMesh implements BatchableMeshElement
{
    public batcherName = 'default';
    public packAsQuad = false;
    public location: number;

    public indexOffset = 0;

    public attributeOffset = 0;

    public indexStart: number;
    public textureId: number;
    public texture: Texture;
    public attributeStart: number;
    public batcher: Batcher = null;
    public batch: Batch = null;
    public renderable: ViewContainer;
    public geometry: MeshGeometry;

    public roundPixels: 0 | 1 = 0;

    private _transformedUvs: Float32Array;
    private _uvUpdateId: number = -1;
    private _textureMatrixUpdateId: number = -1;

    get blendMode() { return this.renderable.groupBlendMode; }

    public reset()
    {
        this.renderable = null;
        this.texture = null;
        this.batcher = null;
        this.batch = null;
        this.geometry = null;
        this._uvUpdateId = -1;
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
