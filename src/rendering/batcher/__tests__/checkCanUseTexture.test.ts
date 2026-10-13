import '~/rendering/renderers/shared/texture/sources/ImageSource';
import { TestBatcher } from './TestBatcher';
import { Matrix } from '~/maths';
import { InstructionSet, Texture, TextureSource } from '~/rendering';

import type { Batch, BatchableMeshElement, Batcher } from '../shared/Batcher';
import type { BLEND_MODES, Topology } from '~/rendering';

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
        const batcher = new TestBatcher({ maxTextures: 16 });

        const batchableObject = new DummyBatchableObject();

        batchableObject.texture = Texture.WHITE;

        batcher.begin();
        batcher.add(batchableObject);
        batcher.finish(new InstructionSet());

        expect(batcher.checkAndUpdateTexture(batchableObject, Texture.WHITE)).toBeTrue();
    });

    it('should return true if a texture source is not already in a batch', () =>
    {
        const batcher = new TestBatcher({ maxTextures: 16 });

        const batchableObject = new DummyBatchableObject();

        batchableObject.texture = Texture.WHITE;

        batcher.begin();
        batcher.add(batchableObject);
        batcher.break(new InstructionSet());

        batchableObject.texture = Texture.EMPTY;

        expect(batcher.checkAndUpdateTexture(batchableObject, Texture.EMPTY)).toBeFalse();
    });

    it('rebuilds the batch when an element replaces its source with one already in the batch', () =>
    {
        const batcher = new TestBatcher({ maxTextures: 16 });
        const sharedTexture = new Texture({ source: new TextureSource() });
        const retiredTexture = new Texture({ source: new TextureSource() });
        const first = new DummyBatchableObject();
        const second = new DummyBatchableObject();

        first.texture = sharedTexture;
        second.texture = retiredTexture;
        batcher.begin();
        batcher.add(first);
        batcher.add(second);
        batcher.finish(new InstructionSet());

        expect(batcher.checkAndUpdateTexture(second, sharedTexture)).toBeFalse();

        second.texture = sharedTexture;
        batcher.begin();
        batcher.add(first);
        batcher.add(second);
        batcher.finish(new InstructionSet());

        expect(second._batch.textures.count).toBe(1);
        expect(second._batch.textures.textures[0]).toBe(sharedTexture.source);

        retiredTexture.destroy(true);
        const otherFrame = new Texture({ source: sharedTexture.source });

        expect(batcher.checkAndUpdateTexture(second, otherFrame)).toBeTrue();

        otherFrame.destroy();
        sharedTexture.destroy(true);
    });
});
