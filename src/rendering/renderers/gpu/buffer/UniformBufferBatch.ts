import type { Buffer } from '../../shared/buffer/Buffer';

export class UniformBufferBatch
{
    buffer: Buffer;
    data: Float32Array;
    minUniformOffsetAlignment = 256;

    byteIndex = 0;

    constructor({ minUniformOffsetAlignment }: {minUniformOffsetAlignment: number})
    {
        this.minUniformOffsetAlignment = minUniformOffsetAlignment;
        this.data = new Float32Array(65535);
    }

    clear(): void
    {
        this.byteIndex = 0;
    }

    addEmptyGroup(size: number): number
    {
        // update the buffer.. only float32 for now!
        if (size > this.minUniformOffsetAlignment / 4)
        {
            throw new Error(`UniformBufferBatch: array is too large: ${size * 4}`);
        }

        const start = this.byteIndex;

        let newSize = start + (size * 4);

        newSize = Math.ceil(newSize / this.minUniformOffsetAlignment) * this.minUniformOffsetAlignment;

        if (newSize > this.data.length * 4)
        {
            // TODO push a new buffer
            // then resize at the end?
            // this._resizeBuffer(newSize);
            throw new Error('UniformBufferBatch: ubo batch got too big');
        }

        this.byteIndex = newSize;

        return start;
    }

    addGroup(array: Float32Array): number
    {
        const offset = this.addEmptyGroup(array.length);

        for (let i = 0; i < array.length; i++)
        {
            this.data[(offset / 4) + i] = array[i];
        }

        return offset;
    }

    upload()
    {
        // TODO
    }

    destroy()
    {
        this.buffer.destroy();
        this.buffer = null;

        this.data = null;
    }
}
