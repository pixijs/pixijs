import { multiplyHexColors } from '../../container/utils/multiplyHexColors';

import type { Batch, BatchableObject, Batcher } from '../../../rendering/batcher/shared/Batcher';
import type { IndexBufferArray } from '../../../rendering/renderers/shared/geometry/Geometry';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { Graphics } from './Graphics';

/**
 * A batchable graphics object.
 * @ignore
 */
export class BatchableGraphics implements BatchableObject
{
    public indexStart: number;
    public textureId: number;
    public texture: Texture;
    public location: number;
    public batcher: Batcher = null;
    public batch: Batch = null;
    public renderable: Graphics;
    public indexOffset: number;
    public indexSize: number;
    public vertexOffset: number;
    public vertexSize: number;
    public color: number;
    public alpha: number;
    public applyTransform = true;
    public roundPixels: 0 | 1 = 0;

    public geometryData: { vertices: number[]; uvs: number[]; indices: number[]; };

    get blendMode()
    {
        if (this.applyTransform)
        {
            return this.renderable.groupBlendMode;
        }

        return 'normal';
    }

    public packIndex(indexBuffer: IndexBufferArray, index: number, indicesOffset: number)
    {
        const indices = this.geometryData.indices;

        for (let i = 0; i < this.indexSize; i++)
        {
            indexBuffer[index++] = indices[i + this.indexOffset] + indicesOffset - this.vertexOffset;
        }
    }

    public packAttributes(
        float32View: Float32Array,
        uint32View: Uint32Array,
        index: number,
        textureId: number
    )
    {
        const geometry = this.geometryData;
        const graphics = this.renderable;

        const positions = geometry.vertices;
        const uvs = geometry.uvs;

        const offset = this.vertexOffset * 2;
        const vertSize = (this.vertexOffset + this.vertexSize) * 2;

        const rgb = this.color;
        const bgr = (rgb >> 16) | (rgb & 0xff00) | ((rgb & 0xff) << 16);

        if (this.applyTransform)
        {
            const argb = multiplyHexColors(bgr, graphics.groupColor)
            + ((this.alpha * graphics.groupAlpha * 255) << 24);

            const wt = graphics.groupTransform;
            const textureIdAndRound = (textureId << 16) | (this.roundPixels & 0xFFFF);

            const a = wt.a;
            const b = wt.b;
            const c = wt.c;
            const d = wt.d;
            const tx = wt.tx;
            const ty = wt.ty;

            for (let i = offset; i < vertSize; i += 2)
            {
                const x = positions[i];
                const y = positions[i + 1];

                float32View[index] = (a * x) + (c * y) + tx;
                float32View[index + 1] = (b * x) + (d * y) + ty;

                float32View[index + 2] = uvs[i];
                float32View[index + 3] = uvs[i + 1];

                uint32View[index + 4] = argb;
                uint32View[index + 5] = textureIdAndRound;

                index += 6;
            }
        }
        else
        {
            const argb = bgr + ((this.alpha * 255) << 24);

            for (let i = offset; i < vertSize; i += 2)
            {
                float32View[index] = positions[i];
                float32View[index + 1] = positions[i + 1];

                float32View[index + 2] = uvs[i];
                float32View[index + 3] = uvs[i + 1];

                uint32View[index + 4] = argb;
                uint32View[index + 5] = textureId << 16;

                index += 6;
            }
        }
    }

    // TODO rename to vertexSize
    get vertSize()
    {
        return this.vertexSize;
    }

    public copyTo(gpuBuffer: BatchableGraphics)
    {
        gpuBuffer.indexOffset = this.indexOffset;
        gpuBuffer.indexSize = this.indexSize;

        gpuBuffer.vertexOffset = this.vertexOffset;
        gpuBuffer.vertexSize = this.vertexSize;

        gpuBuffer.color = this.color;
        gpuBuffer.alpha = this.alpha;

        gpuBuffer.texture = this.texture;
        gpuBuffer.geometryData = this.geometryData;
    }

    public reset()
    {
        this.applyTransform = true;
    }
}
