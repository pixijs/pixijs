import type { Batch, BatchableQuadElement, Batcher } from '../../rendering/batcher/shared/Batcher';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { BoundsData } from '../container/bounds/Bounds';
import type { ViewContainer } from '../view/View';

/**
 * A batchable sprite object.
 * @ignore
 */
export class BatchableSprite implements BatchableQuadElement
{
    public packAsQuad = true;
    public batcherName = 'default';
    public location: number;
    public indexStart: number;
    public renderable: ViewContainer;

    public attributeOffset = 0;

    // batch specific..
    public attributeSize = 4;
    public indexSize = 6;
    public texture: Texture;

    public textureId: number;
    public attributeStart = 0; // location in the buffer
    public batcher: Batcher = null;
    public batch: Batch = null;
    public bounds: BoundsData;
    public roundPixels: 0 | 1 = 0;

    get blendMode() { return this.renderable.groupBlendMode; }
    get color() { return this.renderable.groupColorAlpha; }

    public reset()
    {
        this.renderable = null;
        this.texture = null;
        this.batcher = null;
        this.batch = null;
        this.bounds = null;
    }
}
