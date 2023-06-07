import { BLEND_MODES } from '../../renderers/shared/state/const';
import { mixColors } from '../../scene/utils/mixColors';

import type { Batch, BatchableObject, Batcher } from '../../batcher/shared/Batcher';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { Texture } from '../../renderers/shared/texture/Texture';
import type { GraphicsView } from './GraphicsView';

export class BatchableGraphics implements BatchableObject
{
    indexStart: number;
    textureId: number;
    texture: Texture;
    location: number;
    batcher: Batcher = null;
    batch: Batch = null;
    renderable: Renderable<GraphicsView>;
    indexOffset: number;
    indexSize: number;
    vertexOffset: number;
    vertexSize: number;
    color: number;
    alpha: number;
    colorAlpha: number;
    applyTransform = true;

    geometryData: { vertices: number[]; uvs: number[]; indices: number[]; };

    get blendMode()
    {
        if (this.applyTransform)
        {
            return this.renderable.layerBlendMode;
        }

        return BLEND_MODES.NORMAL;
    }

    packIndex(indexBuffer: Uint32Array, index: number, indicesOffset: number)
    {
        const indices = this.geometryData.indices;

        for (let i = 0; i < this.indexSize; i++)
        {
            indexBuffer[index++] = indices[i + this.indexOffset] + indicesOffset - this.vertexOffset;
        }
    }

    packAttributes(
        float32View: Float32Array,
        uint32View: Uint32Array,
        index: number,
        textureId: number
    )
    {
        const geometry = this.geometryData;

        const positions = geometry.vertices;
        const uvs = geometry.uvs;

        const offset = this.vertexOffset * 2;
        const vertSize = (this.vertexOffset + this.vertexSize) * 2;

        const rgb = this.color;
        const bgr = (rgb >> 16) | (rgb & 0xff00) | ((rgb & 0xff) << 16);

        if (this.applyTransform)
        {
            const renderable = this.renderable;

            const argb = mixColors(bgr + ((this.alpha * 255) << 24), renderable.layerColor);

            const wt = renderable.layerTransform;

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

                float32View[index++] = (a * x) + (c * y) + tx;
                float32View[index++] = (b * x) + (d * y) + ty;

                float32View[index++] = uvs[i];
                float32View[index++] = uvs[i + 1];

                uint32View[index++] = argb;
                float32View[index++] = textureId;
            }
        }
        else
        {
            const argb = bgr + ((this.alpha * 255) << 24);

            for (let i = offset; i < vertSize; i += 2)
            {
                float32View[index++] = positions[i];
                float32View[index++] = positions[i + 1];

                float32View[index++] = uvs[i];
                float32View[index++] = uvs[i + 1];

                uint32View[index++] = argb;
                float32View[index++] = textureId;
            }
        }
    }

    // TODO rename to vertexSize
    get vertSize()
    {
        return this.vertexSize;
    }

    copyTo(gpuBuffer: BatchableGraphics)
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
}
