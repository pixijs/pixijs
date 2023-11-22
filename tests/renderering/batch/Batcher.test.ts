import { Batcher } from '../../../src/rendering/batcher/shared/Batcher';
import '../../../src/rendering/renderers/shared/texture/sources/ImageSource';

describe('Batcher', () =>
{
    it('should ensure attribute size and resize correctly', () =>
    {
        const batcher = new Batcher({
            vertexSize: 2,
            indexSize: 1,
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
        const batcher = new Batcher({
            vertexSize: 2,
            indexSize: 2,
        });

        expect(batcher.indexBuffer).toHaveLength(2);

        batcher.ensureIndexBuffer(30);

        expect(batcher.indexBuffer).toHaveLength(30);

        batcher.ensureIndexBuffer(34);

        const ref = batcher.indexBuffer;

        expect(batcher.indexBuffer).toHaveLength(60);

        batcher.ensureIndexBuffer(36);

        expect(batcher.indexBuffer).toHaveLength(60);

        expect(batcher.indexBuffer).toBe(ref);
    });
});
