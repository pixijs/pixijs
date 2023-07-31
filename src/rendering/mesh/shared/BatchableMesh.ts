import type { Batch, BatchableObject, Batcher } from '../../batcher/shared/Batcher';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { Texture } from '../../renderers/shared/texture/Texture';
import type { MeshView } from './MeshView';

export class BatchableMesh implements BatchableObject
{
    public indexStart: number;
    public textureId: number;
    public texture: Texture;
    public location: number;
    public batcher: Batcher = null;
    public batch: Batch = null;
    public renderable: Renderable<MeshView>;

    get blendMode() { return this.renderable.layerBlendMode; }

    public reset()
    {
        this.renderable = null;
        this.texture = null;
        this.batcher = null;
        this.batch = null;
    }

    public packIndex(indexBuffer: Uint32Array, index: number, indicesOffset: number)
    {
        const indices = this.renderable.view.geometry.indices;

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
        const renderable = this.renderable;

        const geometry = this.renderable.view.geometry;

        const wt = renderable.layerTransform;

        // wt.toArray(true);
        const a = wt.a;
        const b = wt.b;
        const c = wt.c;
        const d = wt.d;
        const tx = wt.tx;
        const ty = wt.ty;

        // const trim = texture.trim;
        const positions = geometry.positions;
        const uvs = geometry.uvs;

        const abgr = renderable.layerColor;

        for (let i = 0; i < positions.length; i += 2)
        {
            const x = positions[i];
            const y = positions[i + 1];

            float32View[index++] = (a * x) + (c * y) + tx;
            float32View[index++] = (b * x) + (d * y) + ty;

            // TODO implement texture matrix?
            float32View[index++] = uvs[i];
            float32View[index++] = uvs[i + 1];

            uint32View[index++] = abgr;
            float32View[index++] = textureId;
        }
    }

    get vertexSize()
    {
        return this.renderable.view.geometry.positions.length / 2;
    }

    get indexSize()
    {
        return this.renderable.view.geometry.indices.length;
    }
}
