import { type Batch, type BatchableObject, Batcher } from '../../../src/rendering/batcher/shared/Batcher';
import { InstructionSet } from '../../../src/rendering/renderers/shared/instructions/InstructionSet';
import { Texture } from '../../../src/rendering/renderers/shared/texture/Texture';
import '../../../src/rendering/renderers/shared/texture/sources/ImageSource';

import type { BLEND_MODES } from '../../../src/rendering/renderers/shared/state/const';

class DummyBatchableObject implements BatchableObject
{
    indexStart: number;
    packAttributes = (_float32View: Float32Array, _uint32View: Uint32Array, _index: number, _textureId: number) =>
    {
        //
    };
    packIndex = (_indexBuffer: Uint32Array, _index: number, _indicesOffset: number) =>
    {
        //
    };
    texture: Texture;
    blendMode: BLEND_MODES = 'normal';
    vertexSize = 8;
    indexSize = 4;
    textureId: number;
    location: number;
    batcher: Batcher = null;
    batch: Batch = null;
    roundPixels: 0 | 1 = 0;
}

describe('checkCanUseTexture', () =>
{
    it('should return false if a texture source is not already in a batch', () =>
    {
        const batcher = new Batcher();

        const batchableObject = new DummyBatchableObject();

        batchableObject.texture = Texture.WHITE;

        batcher.begin();
        batcher.add(batchableObject);
        batcher.finish(new InstructionSet());

        expect(batcher.checkAndUpdateTexture(batchableObject, Texture.WHITE)).toBeTrue();
    });

    it('should return true if a texture source is not already in a batch', () =>
    {
        const batcher = new Batcher();

        const batchableObject = new DummyBatchableObject();

        batchableObject.texture = Texture.WHITE;

        batcher.begin();
        batcher.add(batchableObject);
        batcher.break(new InstructionSet());

        batchableObject.texture = Texture.EMPTY;

        expect(batcher.checkAndUpdateTexture(batchableObject, Texture.EMPTY)).toBeFalse();
    });
});
