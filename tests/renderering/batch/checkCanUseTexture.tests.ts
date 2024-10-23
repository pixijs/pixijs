import { Matrix } from '../../../src/maths/matrix/Matrix';
import { InstructionSet } from '../../../src/rendering/renderers/shared/instructions/InstructionSet';
import { Texture } from '../../../src/rendering/renderers/shared/texture/Texture';
import { TestBatcher } from './TestBatcher';
import '../../../src/rendering/renderers/shared/texture/sources/ImageSource';

import type { Batch, BatchableMeshElement, Batcher } from '../../../src/rendering/batcher/shared/Batcher';
import type { Topology } from '../../../src/rendering/renderers/shared/geometry/const';
import type { BLEND_MODES } from '../../../src/rendering/renderers/shared/state/const';

class DummyBatchableObject implements BatchableMeshElement
{
    groupTransform = new Matrix();
    batcherName: string;
    uvs = new Float32Array(8);
    positions = new Float32Array(8);
    indices = new Uint16Array(6);
    indexOffset = 0;
    color = 0xFFFFFFF;
    attributeOffset = 0;
    location = 0;
    topology: Topology = 'triangle-list';
    readonly packAsQuad = false;
    _indexStart = 0;

    texture: Texture;
    blendMode: BLEND_MODES = 'normal';
    attributeSize = 8;
    indexSize = 4;
    _textureId: number;
    _attributeStart: number;
    _batcher: Batcher = null;
    _batch: Batch = null;
    roundPixels: 0 | 1 = 0;
}

describe('checkCanUseTexture', () =>
{
    it('should return false if a texture source is not already in a batch', () =>
    {
        const batcher = new TestBatcher();

        const batchableObject = new DummyBatchableObject();

        batchableObject.texture = Texture.WHITE;

        batcher.begin();
        batcher.add(batchableObject);
        batcher.finish(new InstructionSet());

        expect(batcher.checkAndUpdateTexture(batchableObject, Texture.WHITE)).toBeTrue();
    });

    it('should return true if a texture source is not already in a batch', () =>
    {
        const batcher = new TestBatcher();

        const batchableObject = new DummyBatchableObject();

        batchableObject.texture = Texture.WHITE;

        batcher.begin();
        batcher.add(batchableObject);
        batcher.break(new InstructionSet());

        batchableObject.texture = Texture.EMPTY;

        expect(batcher.checkAndUpdateTexture(batchableObject, Texture.EMPTY)).toBeFalse();
    });
});
