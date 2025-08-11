import type { BUFFER_TYPE } from './const';

const typeSymbol = Symbol.for('pixijs.GlBuffer');

/** @internal */
export class GlBuffer
{
    /**
     * Type symbol used to identify instances of GlBuffer.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a GlBuffer.
     * @param obj - The object to check.
     * @returns True if the object is a GlBuffer, false otherwise.
     */
    public static isGlBuffer(obj: any): obj is GlBuffer
    {
        return !!obj && !!obj[typeSymbol];
    }

    public buffer: WebGLBuffer;
    public updateID: number;
    public byteLength: number;
    public type: number;

    public _lastBindBaseLocation: number = -1;
    public _lastBindCallId: number = -1;

    constructor(buffer: WebGLBuffer, type: BUFFER_TYPE)
    {
        this.buffer = buffer || null;
        this.updateID = -1;
        this.byteLength = -1;
        this.type = type;
    }
}
