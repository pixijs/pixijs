/**
 * More parameters will be added in DrawInstance PR, the object exists just because it has to be an object, not just boolean!
 * The file will also have MultiDrawBuffer object
 */
export class DrawInstanceParameters
{
    /** number of vertices per instance */
    public vertexCount: number;
    /** number of indices per instance */
    public indexCount: number;
    /*
     * Whether WebGL or WebGPU instancing is used for attributes in this geometry.
     * If it is false, instancing can be emulated through setting vertex, index and float counts!
     */
    public instanced: boolean;
    /** Number of floats per instance in first vertex buffer of geometry. Can be calculated by geometry params */
    public strideFloats: number;

    constructor(options?: Partial<DrawInstanceParameters>)
    {
        this.vertexCount = options?.vertexCount ?? 0;
        this.indexCount = options?.indexCount ?? 0;
        this.instanced = options?.instanced ?? (this.vertexCount > 0 || this.indexCount > 0);
        this.strideFloats = options?.strideFloats ?? 0;
    }
}
