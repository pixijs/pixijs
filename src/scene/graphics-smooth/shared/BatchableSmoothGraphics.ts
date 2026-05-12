import { AbstractBatchableGraphics } from '../../graphics/shared/AbstractBatchableGraphics';

import type { BatchableMeshElement } from '../../../rendering/batcher/shared/Batcher';
import type { Graphics } from '../../graphics/shared/Graphics';

/**
 * Geometry data for smooth graphics: 10-float-per-vertex interleaved buffer + indices.
 * @internal
 */
export interface SmoothGeometryData
{
    vertices: Float32Array;
    indices: Uint16Array | Uint32Array;
}

/**
 * A batchable element for smooth graphics rendering.
 * Routes to the 'smooth' batcher via batcherName.
 * @category scene
 * @advanced
 */
export class BatchableSmoothGraphics extends AbstractBatchableGraphics<Graphics> implements BatchableMeshElement
{
    public batcherName = 'smooth';

    /** Line width in local space (half-width is computed in packer) */
    public lineWidth = 0;
    /** Stroke alignment (0..1, 0.5 = centered) */
    public alignment = 0.5;
    /** When true, line width is fixed in screen pixels and does not scale with transform */
    public pixelLine = false;

    /** 10-float-per-vertex geometry data */
    public geometryData: SmoothGeometryData;

    get uvs(): Float32Array
    {
        return this.geometryData.vertices;
    }

    get positions(): Float32Array
    {
        return this.geometryData.vertices;
    }

    get indices(): Uint16Array | Uint32Array
    {
        return this.geometryData.indices;
    }

    public copyTo(target: BatchableSmoothGraphics): void
    {
        target.indexOffset = this.indexOffset;
        target.indexSize = this.indexSize;
        target.attributeOffset = this.attributeOffset;
        target.attributeSize = this.attributeSize;
        target.baseColor = this.baseColor;
        target.alpha = this.alpha;
        target.texture = this.texture;
        target.geometryData = this.geometryData;
        target.topology = this.topology;
        target.lineWidth = this.lineWidth;
        target.alignment = this.alignment;
        target.pixelLine = this.pixelLine;
    }

    public override destroy(): void
    {
        super.destroy();
        this.geometryData = null;
    }
}
