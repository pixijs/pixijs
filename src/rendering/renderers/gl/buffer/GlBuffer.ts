import type { BUFFER_TYPE } from './const';

export class GlBuffer
{
    public buffer: WebGLBuffer;
    public updateID: number;
    public byteLength: number;
    public type: number;

    constructor(buffer: WebGLBuffer, type: BUFFER_TYPE)
    {
        this.buffer = buffer || null;
        this.updateID = -1;
        this.byteLength = -1;
        this.type = type;
    }
}
