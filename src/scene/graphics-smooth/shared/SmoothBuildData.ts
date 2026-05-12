/**
 * Intermediate build data for smooth graphics geometry generation.
 * Accumulates vertex positions and joint type information during shape building.
 * @category scene
 * @advanced
 */
export class SmoothBuildData
{
    /** Flat array of vertex positions [x0, y0, x1, y1, ...] */
    public verts: number[] = [];
    /** Joint type for each vertex (JOINT_TYPE enum values, possibly OR'd with cap flags) */
    public joints: number[] = [];
    /** Total vertex count after segment packing */
    public vertexSize = 0;
    /** Total index count after segment packing */
    public indexSize = 0;

    public clear(): void
    {
        this.verts.length = 0;
        this.joints.length = 0;
        this.vertexSize = 0;
        this.indexSize = 0;
    }

    public destroy(): void
    {
        this.verts.length = 0;
        this.joints.length = 0;
    }
}
