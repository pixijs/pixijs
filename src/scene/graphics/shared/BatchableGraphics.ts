import { Matrix } from '../../../maths/matrix/Matrix';
import { multiplyHexColors } from '../../container/utils/multiplyHexColors';

import type { Batch, BatchableMeshElement, Batcher } from '../../../rendering/batcher/shared/Batcher';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { Graphics } from './Graphics';

const identityMatrix = new Matrix();
/**
 * A batchable graphics object.
 * @ignore
 */

export class BatchableGraphics implements BatchableMeshElement
{
    public packAsQuad = false;
    public location = 0;
    public batcherName = 'default';

    public indexStart: number;
    public textureId: number;
    public texture: Texture;
    public attributeStart: number;
    public batcher: Batcher = null;
    public batch: Batch = null;
    public renderable: Graphics;
    public indexOffset: number;
    public indexSize: number;
    public attributeOffset: number;
    public attributeSize: number;
    public baseColor: number;
    public alpha: number;
    public applyTransform = true;
    public roundPixels: 0 | 1 = 0;

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

    get groupTransform()
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
    }

    public reset()
    {
        this.applyTransform = true;
    }
}
