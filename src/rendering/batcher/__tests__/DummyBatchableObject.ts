import { Matrix } from '../../../maths/matrix/Matrix';

import type { Topology } from '../../renderers/shared/geometry/const';
import type { BLEND_MODES } from '../../renderers/shared/state/const';
import type { Texture } from '../../renderers/shared/texture/Texture';
import type { Batch, BatchableMeshElement, Batcher } from '../shared/Batcher';

/** @internal */
export class DummyBatchableObject implements BatchableMeshElement
{
    public groupTransform = new Matrix();
    public batcherName: string;
    public uvs = new Float32Array(8);
    public positions = new Float32Array(8);
    public indices = new Uint16Array(6);
    public indexOffset = 0;
    public color = 0xFFFFFFF;
    public attributeOffset = 0;
    public location = 0;
    public topology: Topology = 'triangle-list';
    public readonly packAsQuad = false;
    public _indexStart = 0;

    public texture: Texture;
    public blendMode: BLEND_MODES = 'normal';
    public attributeSize = 8;
    public indexSize = 4;
    public _textureId: number;
    public _attributeStart: number;
    public _batcher: Batcher = null;
    public _batch: Batch = null;
    public roundPixels: 0 | 1 = 0;
}
