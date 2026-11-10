import '~/rendering/renderers/shared/texture/sources/ImageSource';
import { TestBatcher } from './TestBatcher';
import { InstructionSet } from '~/rendering/renderers/shared/instructions/InstructionSet';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';

import type { BatchableElement } from '../shared/Batcher';

function createQuadElement(): BatchableElement
{
    return {
        packAsQuad: true,
        indexSize: 6,
        attributeSize: 4,
        blendMode: 'normal',
        topology: 'triangle-list',
        texture: Texture.WHITE,
    } as unknown as BatchableElement;
}

function createBatcher(): TestBatcher
{
    const batcher = new TestBatcher({ maxTextures: 16, attributesInitialSize: 4, indicesInitialSize: 6 });

    batcher.vertexSize = 6;

    return batcher;
}

describe('Batcher', () =>
{
    it('should update an element of the current build', () =>
    {
        const batcher = createBatcher();
        const first = createQuadElement();
        const second = createQuadElement();

        const instructionSet = new InstructionSet();

        batcher.begin();
        batcher.add(first);
        batcher.add(second);
        batcher.break(instructionSet);

        const packQuadAttributes = jest.spyOn(batcher, 'packQuadAttributes');

        batcher.updateElement(second);

        expect(packQuadAttributes).toHaveBeenCalledTimes(1);
        expect(packQuadAttributes.mock.calls[0][0]).toBe(second);
        expect(packQuadAttributes.mock.calls[0][3]).toBe(4 * 6);
    });

    it('should not update an element that was left out of the last build', () =>
    {
        const batcher = createBatcher();
        const leftOut = createQuadElement();
        const kept = createQuadElement();

        const instructionSet = new InstructionSet();

        batcher.begin();
        batcher.add(leftOut);
        batcher.add(kept);
        batcher.break(instructionSet);

        // the next build no longer contains leftOut, kept now uses its place in the buffers
        batcher.begin();
        batcher.add(kept);
        batcher.break(instructionSet);

        const packQuadAttributes = jest.spyOn(batcher, 'packQuadAttributes');

        batcher.updateElement(leftOut);

        expect(packQuadAttributes).not.toHaveBeenCalled();

        batcher.updateElement(kept);

        expect(packQuadAttributes).toHaveBeenCalledTimes(1);
        expect(packQuadAttributes.mock.calls[0][0]).toBe(kept);
        expect(packQuadAttributes.mock.calls[0][3]).toBe(0);
    });

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
});
