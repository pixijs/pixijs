import { Matrix } from '../../../maths/matrix/Matrix';
import { multiplyHexColors } from '../../container/utils/multiplyHexColors';

import type { Batch, Batcher } from '../../../rendering/batcher/shared/Batcher';
import type { Topology } from '../../../rendering/renderers/shared/geometry/const';
import type { BLEND_MODES } from '../../../rendering/renderers/shared/state/const';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';

const identityMatrix = new Matrix();

/**
 * Renderable constraint for batchable graphics elements.
 * Any renderable used with AbstractBatchableGraphics must provide these properties.
 * @ignore
 */
export interface BatchableGraphicsRenderable
{
    groupBlendMode: BLEND_MODES;
    groupColor: number;
    groupAlpha: number;
    groupTransform: Matrix;
}

/**
 * Shared base for batchable graphics elements. Owns all state and logic that is
 * identical between the default and smooth pipelines; subclasses provide the
 * geometry-specific accessors (`uvs`, `positions`, `indices`) and `copyTo`.
 * @ignore
 */
export abstract class AbstractBatchableGraphics<TRenderable extends BatchableGraphicsRenderable>
{
    public readonly packAsQuad = false;

    public topology: Topology = 'triangle-list';
    public texture: Texture;
    public renderable: TRenderable;

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

    abstract get uvs(): number[] | Float32Array;
    abstract get positions(): number[] | Float32Array;
    abstract get indices(): number[] | Uint16Array | Uint32Array;

    get blendMode(): BLEND_MODES
    {
        if (this.renderable && this.applyTransform)
        {
            return this.renderable.groupBlendMode;
        }

        return 'normal';
    }

    get color(): number
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

    get transform(): Matrix
    {
        return this.renderable?.groupTransform || identityMatrix;
    }

    public reset(): void
    {
        this.applyTransform = true;
        this.renderable = null;
        this.topology = 'triangle-list';
    }

    public destroy(): void
    {
        this.renderable = null;
        this.texture = null;
        this._batcher = null;
        this._batch = null;
    }
}
