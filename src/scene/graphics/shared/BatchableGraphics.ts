import { AbstractBatchableGraphics } from './AbstractBatchableGraphics';

import type { DefaultBatchableMeshElement } from '../../../rendering/batcher/shared/DefaultBatcher';
import type { Graphics } from './Graphics';

/**
 * A batchable graphics object.
 * @ignore
 */
export class BatchableGraphics extends AbstractBatchableGraphics<Graphics> implements DefaultBatchableMeshElement
{
    public batcherName = 'default';

    public geometryData: { vertices: number[]; uvs: number[]; indices: number[]; };

    get uvs()
    {
        return this.geometryData.uvs;
    }

    get positions()
    {
        return this.geometryData.vertices;
    }

    get indices()
    {
        return this.geometryData.indices;
    }

    public copyTo(gpuBuffer: BatchableGraphics)
    {
        gpuBuffer.indexOffset = this.indexOffset;
        gpuBuffer.indexSize = this.indexSize;

        gpuBuffer.attributeOffset = this.attributeOffset;
        gpuBuffer.attributeSize = this.attributeSize;

        gpuBuffer.baseColor = this.baseColor;
        gpuBuffer.alpha = this.alpha;

        gpuBuffer.texture = this.texture;
        gpuBuffer.geometryData = this.geometryData;

        gpuBuffer.topology = this.topology;
    }

    public override destroy()
    {
        super.destroy();
        this.geometryData = null;
    }
}
