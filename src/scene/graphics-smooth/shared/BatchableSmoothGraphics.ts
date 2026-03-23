import { Matrix } from '../../../maths/matrix/Matrix';
import { multiplyHexColors } from '../../container/utils/multiplyHexColors';

import type { Batch, BatchableMeshElement, Batcher } from '../../../rendering/batcher/shared/Batcher';
import type { Topology } from '../../../rendering/renderers/shared/geometry/const';
import type { BLEND_MODES } from '../../../rendering/renderers/shared/state/const';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { SmoothGraphics } from './SmoothGraphics';

const identityMatrix = new Matrix();

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
export class BatchableSmoothGraphics implements BatchableMeshElement
{
    public readonly packAsQuad = false;
    public batcherName = 'smooth';
    public topology: Topology = 'triangle-list';

    public texture: Texture;
    public renderable: SmoothGraphics;

    public indexOffset: number;
    public indexSize: number;
    public attributeOffset: number;
    public attributeSize: number;

    public baseColor: number;
    public alpha: number;
    public applyTransform = true;
    public roundPixels: 0 | 1 = 0;

    /** Line width in local space (half-width is computed in packer) */
    public lineWidth = 0;
    /** Stroke alignment (0..1, 0.5 = centered) */
    public alignment = 0.5;
    /** When true, line width is fixed in screen pixels and does not scale with transform */
    public pixelLine = false;

    /** 10-float-per-vertex geometry data */
    public geometryData: SmoothGeometryData;

    public _indexStart: number;
    public _textureId: number;
    public _attributeStart: number;
    public _batcher: Batcher = null;
    public _batch: Batch = null;

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
        this.geometryData = null;
        this._batcher = null;
        this._batch = null;
    }
}
