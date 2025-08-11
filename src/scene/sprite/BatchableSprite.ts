import type { Matrix } from '../../maths/matrix/Matrix';
import type { Batch, Batcher } from '../../rendering/batcher/shared/Batcher';
import type { DefaultBatchableQuadElement } from '../../rendering/batcher/shared/DefaultBatcher';
import type { Topology } from '../../rendering/renderers/shared/geometry/const';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { BoundsData } from '../container/bounds/Bounds';
import type { Container } from '../container/Container';

const typeSymbol = Symbol.for('pixijs.BatchableSprite');

/**
 * A batchable sprite object.
 * @internal
 */
export class BatchableSprite implements DefaultBatchableQuadElement
{
    /**
     * Type symbol used to identify instances of BatchableSprite.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a BatchableSprite.
     * @param obj - The object to check.
     * @returns True if the object is a BatchableSprite, false otherwise.
     */
    public static isBatchableSprite(obj: any): obj is BatchableSprite
    {
        return !!obj && !!obj[typeSymbol];
    }

    public batcherName = 'default';
    public topology: Topology = 'triangle-list';

    // batch specific..
    public readonly attributeSize = 4;
    public readonly indexSize = 6;
    public readonly packAsQuad = true;

    public transform: Matrix;

    public renderable: Container;
    public texture: Texture;
    public bounds: BoundsData;

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
    }

    public destroy()
    {
        // BOOM!
    }
}
