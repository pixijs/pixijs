export class GLBuffer
{
    constructor(buffer)
    {
        this.buffer = buffer;
        this.updateID = -1;
        this.byteLength = -1;
        this.refCount = 0;
    }
}
