import { AbstractBatchableGraphics } from '../../graphics/shared/AbstractBatchableGraphics';

import type { Matrix } from '../../../maths/matrix/Matrix';
import type { BatchableMeshElement } from '../../../rendering/batcher/shared/Batcher';

/**
 * Geometry of a smooth graphics element: 10 floats per vertex (see {@link SmoothSegmentPacker}) and indices.
 * @internal
 */
export interface SmoothGeometryData
{
    vertices: Float32Array;
    indices: Uint16Array | Uint32Array;
}

/**
 * A batchable element of {@link SmoothGraphics}. Goes to the 'smooth' batcher,
 * or to the 'smoothTextured' batcher when it has a texture.
 * @category scene
 * @internal
 */
export class BatchableSmoothGraphics extends AbstractBatchableGraphics implements BatchableMeshElement
{
    public batcherName: 'smooth' | 'smoothTextured' = 'smooth';

    /** Line width in local space, 0 for fills */
    public lineWidth = 0;
    /** Stroke alignment: 1 = inner, 0.5 = centered, 0 = outer */
    public alignment = 0.5;
    /** Whether the line width is in screen pixels instead of scaling with the transform */
    public pixelLine = false;

    public geometryData: SmoothGeometryData;

    /** Maps local coordinates to texture coordinates, only used by the 'smoothTextured' batcher */
    public uvMatrix: Matrix = null;

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
        target.uvMatrix = this.uvMatrix;
        target.batcherName = this.batcherName;
    }

    public override destroy(): void
    {
        super.destroy();
        this.geometryData = null;
        this.uvMatrix = null;
    }
}
