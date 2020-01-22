export class GLBuffer
{
    buffer: any;
    updateID: number;
    byteLength: number;
    refCount: number;

    constructor(buffer?: any)
    {
        this.buffer = buffer || null;
        this.updateID = -1;
        this.byteLength = -1;
        this.refCount = 0;
    }
}
