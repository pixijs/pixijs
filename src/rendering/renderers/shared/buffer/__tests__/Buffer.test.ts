import { Buffer } from '../Buffer';
import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';

import type { WebGLRenderer, WebGPURenderer } from '~/rendering';

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

        const renderer = (await getWebGLRenderer()) as WebGLRenderer;

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

        const renderer = (await getWebGLRenderer()) as WebGLRenderer;

        renderer.buffer.updateBuffer(buffer);

        renderer.buffer.destroyAll();

        expect((renderer).buffer['_gpuBuffers'][buffer.uid]).toBeUndefined();
    });

    it('should set static correctly', () =>
    {
        const buffer = new Buffer({
            data: new Float32Array([1, 2, 3]),
            usage: 1,
        });

        buffer.static = false;

        expect(buffer.static).toBe(false);
        expect(buffer.descriptor.usage).toBe(1);
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

        buffer.setDataWithSize(new Float32Array([1, 2, 3, 4]), 4, true);

        expect(changeObserver).toHaveBeenCalled();
        expect(updateObserver).not.toHaveBeenCalled();

        expect(buffer.descriptor.size).toBe(4 * 4);

        // /

        changeObserver.mockClear();
        updateObserver.mockClear();

        buffer.setDataWithSize(new Float32Array([1, 2, 3]), 3, true);

        expect(changeObserver).toHaveBeenCalled();
        expect(updateObserver).not.toHaveBeenCalled();

        // /

        changeObserver.mockClear();
        updateObserver.mockClear();

        buffer.setDataWithSize(new Float32Array([4, 5, 6]), 3, true);

        expect(changeObserver).not.toHaveBeenCalled();
        expect(updateObserver).toHaveBeenCalled();

        // /

        changeObserver.mockClear();
        updateObserver.mockClear();

        buffer.setDataWithSize(new Float32Array([4, 5, 6]), 2, true);

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

        buffer.setDataWithSize(new Float32Array([1, 2, 3, 4]), 4, true);

        expect(changeObserver).toHaveBeenCalled();
        expect(updateObserver).not.toHaveBeenCalled();

        expect(buffer.descriptor.size).toBe(4 * 4);

        // / shrink the buffer

        changeObserver.mockClear();
        updateObserver.mockClear();

        buffer.setDataWithSize(new Float32Array([1, 2, 3]), 3, true);

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

        buffer.setDataWithSize(data, 2, true);

        expect(buffer.descriptor.size).toBe(3 * 4);
        expect(buffer._updateSize).toBe(2 * 4);
    });

    it('should not update with setDataAndSize dontSyncGPU', async () =>
    {
        const data = new Float32Array([1, 2, 3]);

        const buffer = new Buffer({
            data,
            usage: 1,
            shrinkToFit: false,
        });

        const updateObserver = jest.fn();

        buffer.on('update', updateObserver);

        buffer.setDataWithSize(data, 3, false);

        expect(updateObserver).not.toHaveBeenCalled();
    });

    it('update should always use the last updateSize passed to it', async () =>
    {
        const data = new Float32Array([1, 2, 3]);

        const buffer = new Buffer({
            data,
            usage: 1,
            shrinkToFit: false,
        });

        buffer.setDataWithSize(data, 2, true);

        buffer.update();

        expect(buffer._updateSize).toBe(2 * 4);
    });

    itLocalOnly('should only add add listeners to buffer on first gpu init', async () =>
    {
        const renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const buffer = new Buffer({
            data: new Float32Array([1, 2, 3]),
            usage: 1,
        });

        renderer.buffer.updateBuffer(buffer);

        expect(buffer.listenerCount('update')).toBe(1);

        buffer.data = new Float32Array([1, 2, 3, 4]);

        expect(buffer.listenerCount('update')).toBe(1);
    });
});
