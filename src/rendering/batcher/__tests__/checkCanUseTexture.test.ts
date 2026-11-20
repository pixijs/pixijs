import '~/rendering/renderers/shared/texture/sources/ImageSource';
import { DummyBatchableObject } from './DummyBatchableObject';
import { TestBatcher } from './TestBatcher';
import { InstructionSet, Texture, TextureSource } from '~/rendering';

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
