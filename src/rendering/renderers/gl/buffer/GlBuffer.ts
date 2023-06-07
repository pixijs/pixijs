import type { BUFFER_TYPE } from './const';

export class GlBuffer
{
    buffer: WebGLBuffer;
    updateID: number;
    byteLength: number;
    refCount: number;
    type: number;

    constructor(buffer: WebGLBuffer, type: BUFFER_TYPE)
    {
        this.buffer = buffer || null;
        this.updateID = -1;
        this.byteLength = -1;
        this.refCount = 0;
        this.type = type;
    }
}
