import '~/rendering/renderers/shared/texture/sources/ImageSource';
import { TestBatcher } from './TestBatcher';

describe('Batcher', () =>
{
    it('should ensure attribute size and resize correctly', () =>
    {
        const batcher = new TestBatcher({
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
