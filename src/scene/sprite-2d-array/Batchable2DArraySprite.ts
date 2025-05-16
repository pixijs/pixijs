import type { Matrix } from '../../maths/matrix/Matrix';
import type { Batch, Batcher } from '../../rendering/batcher/shared/Batcher';
import type { Default2DArrayBatchableQuadElement } from '../../rendering/batcher/shared/Default2DArrayBatcher';
import type { Topology } from '../../rendering/renderers/shared/geometry/const';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { BoundsData } from '../container/bounds/Bounds';
import type { Container } from '../container/Container';

/**
 * A batchable sprite object.
 * @ignore
 */
export class Batchable2DArraySprite implements Default2DArrayBatchableQuadElement
{
    public batcherName = 'default2darray';
    public topology: Topology = 'triangle-list';

    // batch specific..
    public readonly attributeSize = 4;
    public readonly indexSize = 6;
    public readonly packAsQuad = true;

    public transform: Matrix;

    public renderable: Container;
    public texture: Texture;
    public bounds: BoundsData;
    public layerId: number;

    public roundPixels: 0 | 1 = 0;

    public _indexStart: number;
    public _textureId: number;
    public _attributeStart = 0; // location in the buffer
    public _batcher: Batcher = null;
    public _batch: Batch = null;

    get blendMode() { return this.renderable.groupBlendMode; }
    get color() { return this.renderable.groupColorAlpha; }

    public reset()
    {
        this.renderable = null;
        this.texture = null;
        this._batcher = null;
        this._batch = null;
        this.bounds = null;
        this.layerId = 0;
    }
}
