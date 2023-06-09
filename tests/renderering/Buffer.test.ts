import { Buffer } from '../../src/rendering/renderers/shared/buffer/Buffer';
import { getRenderer } from '../utils/getRenderer';

import type { WebGLRenderer } from '../../src/rendering/renderers/gl/WebGLRenderer';

describe('Buffer', () =>
{
    it('should destroyed', () =>
    {
        const buffer = new Buffer({
            data: new Float32Array([1, 2, 3]),
            usage: 1,
        });

        buffer.destroy();

        expect(buffer.data).toBeNull();
    });

    it('should destroyed its gpu equivalent', async () =>
    {
        const buffer = new Buffer({
            data: new Float32Array([1, 2, 3]),
            usage: 1,
        });

        const renderer = (await getRenderer()) as WebGLRenderer;

        renderer.buffer.updateBuffer(buffer);

        buffer.destroy();

        expect((renderer).buffer['_gpuBuffers'][buffer.uid]).toBeNull();
    });

    it('should set a cast data correctly', () =>
    {
        const buffer = new Buffer({
            data: [1, 2, 3],
            usage: 1,
        });

        expect(buffer.data).toBeInstanceOf(Float32Array);
    });

    it('should dispose all on the BufferSystem', async () =>
    {
        const buffer = new Buffer({
            data: new Float32Array([1, 2, 3]),
            usage: 1,
        });

        const renderer = (await getRenderer()) as WebGLRenderer;

        renderer.buffer.updateBuffer(buffer);

        renderer.buffer.disposeAll();

        expect((renderer).buffer['_gpuBuffers'][buffer.uid]).toBeUndefined();
    });
});
