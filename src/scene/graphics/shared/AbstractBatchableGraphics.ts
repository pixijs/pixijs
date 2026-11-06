import { Matrix } from '../../../maths/matrix/Matrix';
import { multiplyHexColors } from '../../container/utils/multiplyHexColors';

import type { Batch, Batcher } from '../../../rendering/batcher/shared/Batcher';
import type { Topology } from '../../../rendering/renderers/shared/geometry/const';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { Graphics } from './Graphics';

const identityMatrix = new Matrix();

/**
 * State and logic shared by the batchable elements of {@link Graphics} and {@link SmoothGraphics}.
 * Subclasses provide the geometry accessors and `copyTo`.
 * @ignore
 */
export abstract class AbstractBatchableGraphics
{
    public readonly packAsQuad = false;
    public abstract batcherName: string;

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

    abstract get uvs(): number[] | Float32Array;
    abstract get positions(): number[] | Float32Array;
    abstract get indices(): number[] | Uint16Array | Uint32Array;

    get blendMode()
    {
        if (this.renderable && this.applyTransform)
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

    public reset()
    {
        this.applyTransform = true;
        this.renderable = null;
        this.topology = 'triangle-list';
    }

    public destroy()
    {
        this.renderable = null;
        this.texture = null;
        this._batcher = null;
        this._batch = null;
    }
}
