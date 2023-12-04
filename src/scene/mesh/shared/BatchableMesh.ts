import type { Batch, BatchableObject, Batcher } from '../../../rendering/batcher/shared/Batcher';
import type { Renderable } from '../../../rendering/renderers/shared/Renderable';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
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
    public roundPixels: 0 | 1 = 0;

    get blendMode() { return this.renderable.rgBlendMode; }

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

        const view = this.renderable.view;

        const geometry = view.geometry;
        const wt = renderable.rgTransform;

        const textureIdAndRound = (textureId << 16) | (this.roundPixels & 0xFFFF);

        const a = wt.a;
        const b = wt.b;
        const c = wt.c;
        const d = wt.d;
        const tx = wt.tx;
        const ty = wt.ty;

        // const trim = texture.trim;
        const positions = geometry.positions;
        const uvs = geometry.uvs;

        const abgr = renderable.rgColorAlpha;

        for (let i = 0; i < positions.length; i += 2)
        {
            const x = positions[i];
            const y = positions[i + 1];

            float32View[index] = (a * x) + (c * y) + tx;
            float32View[index + 1] = (b * x) + (d * y) + ty;

            // TODO implement texture matrix?
            float32View[index + 2] = uvs[i];
            float32View[index + 3] = uvs[i + 1];

            uint32View[index + 4] = abgr;
            uint32View[index + 5] = textureIdAndRound;

            index += 6;
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
