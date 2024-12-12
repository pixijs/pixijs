import { Matrix } from '../../../maths/matrix/Matrix';
import { multiplyHexColors } from '../../container/utils/multiplyHexColors';

import type { Batch, Batcher } from '../../../rendering/batcher/shared/Batcher';
import type { DefaultBatchableMeshElement } from '../../../rendering/batcher/shared/DefaultBatcher';
import type { Topology } from '../../../rendering/renderers/shared/geometry/const';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { Graphics } from './Graphics';

const identityMatrix = new Matrix();
/**
 * A batchable graphics object.
 * @ignore
 */

export class BatchableGraphics implements DefaultBatchableMeshElement
{
    public readonly packAsQuad = false;
    public batcherName = 'default';

    public texture: Texture;

    public topology: Topology = 'triangle-list';
    public renderable: Graphics;
    public indexOffset: number;
    public indexSize: number;
    public attributeOffset: number;
    public attributeSize: number;
    public baseColor: number;
    public alpha: number;
    public applyTransform = true;
    public roundPixels: 0 | 1 = 0;

    public _indexStart: number;
    public _textureId: number;
    public _attributeStart: number;
    public _batcher: Batcher = null;
    public _batch: Batch = null;

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

    get blendMode()
    {
        if (this.applyTransform)
        {
            return this.renderable.groupBlendMode;
        }

        return 'normal';
    }
    get color()
    {
        const rgb = this.baseColor;
        const bgr = (rgb >> 16) | (rgb & 0xff00) | ((rgb & 0xff) << 16);
        const renderable = this.renderable;

        if (renderable)
        {
            return multiplyHexColors(bgr, renderable.groupColor)
            + ((this.alpha * renderable.groupAlpha * 255) << 24);
        }

        return bgr + ((this.alpha * 255) << 24);
    }

    get transform()
    {
        return this.renderable?.groupTransform || identityMatrix;
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

    public reset()
    {
        this.applyTransform = true;
        this.renderable = null;
        this.topology = 'triangle-list';
    }
}
