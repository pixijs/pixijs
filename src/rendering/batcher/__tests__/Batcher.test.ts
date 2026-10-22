import '~/rendering/renderers/shared/texture/sources/ImageSource';
import { TestBatcher } from './TestBatcher';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';

import type { BatchableElement } from '../shared/Batcher';
import type { InstructionSet } from '~/rendering/renderers/shared/instructions/InstructionSet';

function quad(): BatchableElement
{
    return {
        batcherName: 'default',
        texture: Texture.WHITE,
        blendMode: 'normal',
        topology: 'triangle-list',
        indexSize: 6,
        attributeSize: 4,
        packAsQuad: true,
    } as unknown as BatchableElement;
}

/**
 * a mesh element: one triangle per entry of `triangles`, each over its own 3 vertices
 * @param triangles
 */
function mesh(triangles: number): BatchableElement
{
    const indices = new Uint32Array(triangles * 3);

    for (let i = 0; i < indices.length; i++) indices[i] = indices.length - 1 - i;

    return {
        batcherName: 'default',
        texture: Texture.WHITE,
        blendMode: 'normal',
        topology: 'triangle-list',
        indexSize: indices.length,
        attributeSize: indices.length,
        indices,
        indexOffset: 0,
        attributeOffset: 0,
        packAsQuad: false,
    } as unknown as BatchableElement;
}

/**
 * the indices a fresh batcher would write for these elements, laid out as Batcher.add lays them out
 * @param elements
 */
function expectedIndices(elements: BatchableElement[]): number[]
{
    const out: number[] = [];
    let vertex = 0;

    for (const element of elements)
    {
        if (element.packAsQuad)
        {
            out.push(vertex, vertex + 1, vertex + 2, vertex, vertex + 2, vertex + 3);
        }
        else
        {
            const { indices } = element as unknown as { indices: Uint32Array };

            for (let i = 0; i < indices.length; i++) out.push(vertex + indices[i]);
        }

        vertex += element.attributeSize;
    }

    return out;
}

function build(batcher: TestBatcher, elements: BatchableElement[]): number[]
{
    const instructionSet = { add: () => { /* no-op */ } } as unknown as InstructionSet;

    batcher.begin();
    elements.forEach((element) => batcher.add(element));
    batcher.break(instructionSet);

    return Array.from(batcher.indexBuffer.subarray(0, batcher.indexSize));
}

function getBatcher(indicesInitialSize = 6): TestBatcher
{
    const batcher = new TestBatcher({ maxTextures: 16, indicesInitialSize });

    batcher.vertexSize = 6;

    return batcher;
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

    it('should only keep batch elements when asked to', () =>
    {
        const batcher = getBatcher();

        build(batcher, [quad(), quad()]);

        expect(batcher.batches[0].elements).toBeNull();

        batcher._collectElements = true;

        const elements = [quad(), quad()];

        build(batcher, elements);

        expect(batcher.batches[0].elements).toEqual(elements);
    });

    it('should skip repacking quad indices the buffer already holds', () =>
    {
        const batcher = getBatcher();
        const elements = [quad(), quad(), quad()];

        expect(build(batcher, elements)).toEqual(expectedIndices(elements));

        const spy = jest.spyOn(batcher, 'packQuadIndex');

        expect(build(batcher, elements)).toEqual(expectedIndices(elements));
        expect(spy).not.toHaveBeenCalled();

        const more = [quad(), quad(), quad(), quad()];

        expect(build(batcher, more)).toEqual(expectedIndices(more));
        // only the new fourth quad is written
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should repack quad indices around mesh elements', () =>
    {
        const quads = [quad(), quad(), quad(), quad()];

        // a mesh between quads shifts the quads after it out of the fixed pattern
        const shifted = [quad(), mesh(1), quad(), quad()];

        let batcher = getBatcher();

        expect(build(batcher, quads)).toEqual(expectedIndices(quads));
        expect(build(batcher, shifted)).toEqual(expectedIndices(shifted));
        expect(build(batcher, quads)).toEqual(expectedIndices(quads));
        expect(build(batcher, shifted)).toEqual(expectedIndices(shifted));

        // a mesh the size of a quad leaves the quads after it in the pattern, but still overwrites its slot
        const aligned = [quad(), mesh(2), quad(), quad()];

        aligned[1].attributeSize = 4;

        batcher = getBatcher();

        expect(build(batcher, quads)).toEqual(expectedIndices(quads));
        expect(build(batcher, aligned)).toEqual(expectedIndices(aligned));
        expect(build(batcher, quads)).toEqual(expectedIndices(quads));

        // the same mesh as the last element
        const trailing = [quad(), quad(), quad(), mesh(2)];

        trailing[3].attributeSize = 4;

        batcher = getBatcher();

        expect(build(batcher, quads)).toEqual(expectedIndices(quads));
        expect(build(batcher, trailing)).toEqual(expectedIndices(trailing));
        expect(build(batcher, quads)).toEqual(expectedIndices(quads));
    });

    it('should keep skipped quad indices when the index buffer grows', () =>
    {
        const batcher = getBatcher(6);
        const few = [quad(), quad()];

        expect(build(batcher, few)).toEqual(expectedIndices(few));

        const many = Array.from({ length: 200 }, quad);

        expect(build(batcher, many)).toEqual(expectedIndices(many));
        expect(build(batcher, few)).toEqual(expectedIndices(few));

        // past 65535 entries the buffer switches to 32 bit indices and copies what it holds
        const lots = Array.from({ length: 11000 }, quad);

        expect(build(batcher, lots)).toEqual(expectedIndices(lots));
        expect(batcher.indexBuffer.BYTES_PER_ELEMENT).toBe(4);
        expect(build(batcher, many)).toEqual(expectedIndices(many));
    });
});
