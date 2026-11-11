import '~/rendering/renderers/shared/texture/sources/ImageSource';
import { DummyBatchableObject } from './DummyBatchableObject';
import { TestBatcher } from './TestBatcher';
import { getTexture } from '@test-utils';
import { InstructionSet } from '~/rendering';

import type { BLEND_MODES, Texture } from '~/rendering';

function makeElement(texture: Texture, blendMode: BLEND_MODES = 'normal'): DummyBatchableObject
{
    const element = new DummyBatchableObject();

    element.texture = texture;
    element.blendMode = blendMode;

    return element;
}

function makeElements(textures: Texture[]): DummyBatchableObject[]
{
    return textures.map((texture) => makeElement(texture));
}

/**
 * Texture source uids of each batch, in order.
 * @param batcher - batcher after `finish`
 */
function batchTextureUids(batcher: TestBatcher): number[][]
{
    return batcher.batches.slice(0, batcher.batchIndex).map((batch) =>
        batch.textures.textures.slice(0, batch.textures.count).map((source) => source.uid));
}

function buildBatches(maxTextures: number, elements: DummyBatchableObject[]): number[][]
{
    const batcher = new TestBatcher({ maxTextures });

    batcher.begin();
    elements.forEach((element) => batcher.add(element));
    batcher.finish(new InstructionSet());

    return batchTextureUids(batcher);
}

describe('Batcher', () =>
{
    it('should ensure attribute size and resize correctly', () =>
    {
        const batcher = new TestBatcher({
            maxTextures: 16,
            attributesInitialSize: 2 * 6,
            indicesInitialSize: 1,
        });

        expect(batcher.attributeBuffer.float32View).toHaveLength(2 * 6);

        batcher.ensureAttributeBuffer(30);

        expect(batcher.attributeBuffer.float32View).toHaveLength(30);

        batcher.ensureAttributeBuffer(34);

        const ref = batcher.attributeBuffer;

        expect(batcher.attributeBuffer.float32View).toHaveLength(60);

        batcher.ensureAttributeBuffer(36);

        expect(batcher.attributeBuffer.float32View).toHaveLength(60);

        expect(batcher.attributeBuffer).toBe(ref);
    });

    it('should ensure index size and resize correctly', () =>
    {
        const batcher = new TestBatcher({
            maxTextures: 16,
            attributesInitialSize: 2 * 6,
            indicesInitialSize: 2,
        });

        expect(batcher.indexBuffer).toHaveLength(2);
        // disable until i get to the bottom of uint 16 vs uint 32
        expect(batcher.indexBuffer.BYTES_PER_ELEMENT).toBe(2);

        batcher.ensureIndexBuffer(30);

        expect(batcher.indexBuffer).toHaveLength(30);

        batcher.ensureIndexBuffer(34);

        const ref = batcher.indexBuffer;

        expect(batcher.indexBuffer).toHaveLength(46);

        batcher.ensureIndexBuffer(36);

        expect(batcher.indexBuffer).toHaveLength(46);
        // disable until i get to the bottom of uint 16 vs uint 32
        // expect(batcher.indexBuffer.BYTES_PER_ELEMENT).toBe(2);

        expect(batcher.indexBuffer).toBe(ref);

        batcher.ensureIndexBuffer(70000);

        expect(batcher.indexBuffer).toHaveLength(70000);
        // disable until i get to the bottom of uint 16 vs uint 32
        // expect(batcher.indexBuffer.BYTES_PER_ELEMENT).toBe(4);
    });

    it('should reuse the texture slot of a source that opened a batch after a texture count flush', () =>
    {
        const [a, b, c] = [getTexture(), getTexture(), getTexture()];
        const elements = makeElements([a, b, c, c, c]);

        const batches = buildBatches(2, elements);

        expect(batches).toEqual([[a.source.uid, b.source.uid], [c.source.uid]]);
        expect(elements.map((element) => element._textureId)).toEqual([0, 1, 0, 0, 0]);
    });

    it('should reuse the texture slot of a source that opened a batch after a blend mode flush', () =>
    {
        const a = getTexture();
        const elements = [makeElement(a, 'normal'), makeElement(a, 'add'), makeElement(a, 'add')];

        const batches = buildBatches(16, elements);

        expect(batches).toEqual([[a.source.uid], [a.source.uid]]);
    });

    it('should not break the batch for every element with a single texture slot', () =>
    {
        const [a, b] = [getTexture(), getTexture()];
        const elements = makeElements([a, b, b, b]);

        const batches = buildBatches(1, elements);

        expect(batches).toEqual([[a.source.uid], [b.source.uid]]);
    });
});
