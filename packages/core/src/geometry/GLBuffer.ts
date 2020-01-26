export class GLBuffer
{
    buffer: WebGLBuffer;
    updateID: number;
    byteLength: number;
    refCount: number;

    constructor(buffer?: WebGLBuffer)
    {
        this.buffer = buffer || null;
        this.updateID = -1;
        this.byteLength = -1;
        this.refCount = 0;
    }
}
