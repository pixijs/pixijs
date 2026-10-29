import { type GPUData } from '../../../../scene/view/ViewContainer';

import type { BUFFER_TYPE } from './const';

/** @internal */
export class GlBuffer implements GPUData
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

    public destroy()
    {
        this.buffer = null;
        this.updateID = -1;
        this.byteLength = -1;
        this.type = -1;
    }
}
