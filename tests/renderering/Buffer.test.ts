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

        renderer.buffer.destroyAll();

        expect((renderer).buffer['_gpuBuffers'][buffer.uid]).toBeUndefined();
    });

    it('should set data correctly with setData', async () =>
    {
        const buffer = new Buffer({
            data: new Float32Array([1, 2, 3]),
            usage: 1,
        });

        const changeObserver = jest.fn();
        const updateObserver = jest.fn();

        buffer.on('change', changeObserver);
        buffer.on('update', updateObserver);

        buffer.setDataWithSize(new Float32Array([1, 2, 3, 4]), 4);

        expect(changeObserver).toHaveBeenCalled();
        expect(updateObserver).not.toHaveBeenCalled();

        expect(buffer.descriptor.size).toBe(4 * 4);

        ///

        changeObserver.mockClear();
        updateObserver.mockClear();

        buffer.setDataWithSize(new Float32Array([1, 2, 3]), 3);

        expect(changeObserver).toHaveBeenCalled();
        expect(updateObserver).not.toHaveBeenCalled();

        ///

        changeObserver.mockClear();
        updateObserver.mockClear();

        buffer.setDataWithSize(new Float32Array([4, 5, 6]), 3);

        expect(changeObserver).not.toHaveBeenCalled();
        expect(updateObserver).toHaveBeenCalled();

        ///

        changeObserver.mockClear();
        updateObserver.mockClear();

        buffer.setDataWithSize(new Float32Array([4, 5, 6]), 2);

        expect(changeObserver).not.toHaveBeenCalled();
        expect(updateObserver).toHaveBeenCalled();

        expect(buffer.descriptor.size).toBe(3 * 4);
        expect(buffer._updateSize).toBe(2 * 4);
    });

    it('should set data correctly with setData and shrinkToFit set to false', async () =>
    {
        const buffer = new Buffer({
            data: new Float32Array([1, 2, 3]),
            usage: 1,
            shrinkToFit: false,
        });

        const changeObserver = jest.fn();
        const updateObserver = jest.fn();

        buffer.on('change', changeObserver);
        buffer.on('update', updateObserver);

        // grow the buffer...

        buffer.setDataWithSize(new Float32Array([1, 2, 3, 4]), 4);

        expect(changeObserver).toHaveBeenCalled();
        expect(updateObserver).not.toHaveBeenCalled();

        expect(buffer.descriptor.size).toBe(4 * 4);

        /// shrink the buffer

        changeObserver.mockClear();
        updateObserver.mockClear();

        buffer.setDataWithSize(new Float32Array([1, 2, 3]), 3);

        expect(changeObserver).not.toHaveBeenCalled();
        expect(updateObserver).toHaveBeenCalled();

        expect(buffer.descriptor.size).toBe(4 * 4);
        expect(buffer._updateSize).toBe(3 * 4);
    });

    it('should set data correctly with setData if only the size if modified', async () =>
    {
        const data = new Float32Array([1, 2, 3]);

        const buffer = new Buffer({
            data,
            usage: 1,
            shrinkToFit: false,
        });

        buffer.setDataWithSize(data, 2);

        expect(buffer.descriptor.size).toBe(3 * 4);
        expect(buffer._updateSize).toBe(2 * 4);
    });
});
