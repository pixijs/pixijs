export default class GLBuffer
{
    constructor(buffer)
    {
        this.buffer = buffer;
        this.updateID = -1;
        this.byteLength = -1;
    }
}
