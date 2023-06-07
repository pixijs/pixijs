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
        this.data = new Float32Array(128 * 1024 * 2);
    }

    clear(): void
    {
        this.byteIndex = 0;
    }

    addGroup(array: Float32Array): number
    {
        // update the buffer.. only float32 for now!
        if (array.length > this.minUniformOffsetAlignment / 4)
        {
            throw new Error(`UniformBufferBatch: array is too large: ${array.byteLength}`);
        }

        const start = this.byteIndex;

        let newSize = start + (array.length * 4);

        newSize = Math.ceil(newSize / this.minUniformOffsetAlignment) * this.minUniformOffsetAlignment;

        if (newSize > this.data.length * 4)
        {
            // TODO push a new buffer
            // then resize at the end?
            // this._resizeBuffer(newSize);
            throw new Error('UniformBufferBatch: ubo batch got too big');
        }

        for (let i = 0; i < array.length; i++)
        {
            this.data[(start / 4) + i] = array[i];
        }

        this.byteIndex = newSize;

        return start;
    }

    upload()
    {
        // TODO
    }
}
