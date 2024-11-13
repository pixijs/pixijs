export class UboBatch
{
    public data: Float32Array;
    private readonly _minUniformOffsetAlignment: number = 256;

    public byteIndex = 0;

    constructor({ minUniformOffsetAlignment }: {minUniformOffsetAlignment: number})
    {
        this._minUniformOffsetAlignment = minUniformOffsetAlignment;
        this.data = new Float32Array(65535);
    }

    public clear(): void
    {
        this.byteIndex = 0;
    }

    public addEmptyGroup(size: number): number
    {
        // update the buffer.. only float32 for now!
        if (size > this._minUniformOffsetAlignment / 4)
        {
            throw new Error(`UniformBufferBatch: array is too large: ${size * 4}`);
        }

        const start = this.byteIndex;

        let newSize = start + (size * 4);

        newSize = Math.ceil(newSize / this._minUniformOffsetAlignment) * this._minUniformOffsetAlignment;

        if (newSize > this.data.length * 4)
        {
            // TODO push a new buffer
            throw new Error('UniformBufferBatch: ubo batch got too big');
        }

        this.byteIndex = newSize;

        return start;
    }

    public addGroup(array: Float32Array): number
    {
        const offset = this.addEmptyGroup(array.length);

        for (let i = 0; i < array.length; i++)
        {
            this.data[(offset / 4) + i] = array[i];
        }

        return offset;
    }

    public destroy()
    {
        this.data = null;
    }
}
