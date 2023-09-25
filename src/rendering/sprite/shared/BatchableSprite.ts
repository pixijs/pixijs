import type { Batch, BatchableObject, Batcher } from '../../batcher/shared/Batcher';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { Texture } from '../../renderers/shared/texture/Texture';
import type { View } from '../../renderers/shared/View';

export class BatchableSprite implements BatchableObject
{
    public indexStart: number;
    public sprite: Renderable<View>;

    // batch specific..
    public vertexSize = 4;
    public indexSize = 6;

    public texture: Texture;

    public textureId: number;
    public location = 0; // location in the buffer
    public batcher: Batcher = null;
    public batch: Batch = null;
    public bounds: [number, number, number, number];

    get blendMode() { return this.sprite.layerBlendMode; }

    public packAttributes(
        float32View: Float32Array,
        uint32View: Uint32Array,
        index: number,
        textureId: number,
    )
    {
        const sprite = this.sprite;
        const texture = this.texture;

        const wt = sprite.layerTransform;

        const a = wt.a;
        const b = wt.b;
        const c = wt.c;
        const d = wt.d;
        const tx = wt.tx;
        const ty = wt.ty;

        const bounds = this.bounds;

        const w0 = bounds[1];
        const w1 = bounds[0];
        const h0 = bounds[3];
        const h1 = bounds[2];

        const uvs = texture._layout.uvs;

        // _ _ _ _
        // a b g r
        const argb = sprite.layerColor;

        // xy
        float32View[index + 0] = (a * w1) + (c * h1) + tx;
        float32View[index + 1] = (d * h1) + (b * w1) + ty;

        float32View[index + 2] = uvs.x0;
        float32View[index + 3] = uvs.y0;

        uint32View[index + 4] = argb;
        float32View[index + 5] = textureId;

        // xy
        float32View[index + 6] = (a * w0) + (c * h1) + tx;
        float32View[index + 7] = (d * h1) + (b * w0) + ty;

        float32View[index + 8] = uvs.x1;
        float32View[index + 9] = uvs.y1;

        uint32View[index + 10] = argb;
        float32View[index + 11] = textureId;

        // xy
        float32View[index + 12] = (a * w0) + (c * h0) + tx;
        float32View[index + 13] = (d * h0) + (b * w0) + ty;

        float32View[index + 14] = uvs.x2;
        float32View[index + 15] = uvs.y2;

        uint32View[index + 16] = argb;
        float32View[index + 17] = textureId;

        // xy
        float32View[index + 18] = (a * w1) + (c * h0) + tx;
        float32View[index + 19] = (d * h0) + (b * w1) + ty;

        float32View[index + 20] = uvs.x3;
        float32View[index + 21] = uvs.y3;

        uint32View[index + 22] = argb;
        float32View[index + 23] = textureId;
    }

    public packIndex(indexBuffer: Uint32Array, index: number, indicesOffset: number)
    {
        indexBuffer[index] = indicesOffset + 0;
        indexBuffer[index + 1] = indicesOffset + 1;
        indexBuffer[index + 2] = indicesOffset + 2;

        indexBuffer[index + 3] = indicesOffset + 0;
        indexBuffer[index + 4] = indicesOffset + 2;
        indexBuffer[index + 5] = indicesOffset + 3;
    }

    public reset()
    {
        this.sprite = null;
        this.texture = null;
        this.batcher = null;
        this.batch = null;
        this.bounds = null;
    }
}
