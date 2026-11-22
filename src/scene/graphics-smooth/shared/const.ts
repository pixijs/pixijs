/**
 * Joint types used by the smooth graphics HHAA renderer.
 * These encode how vertices should be processed in the shader.
 * @category scene
 * @internal
 */
export enum JOINT_TYPE
{
    NONE = 0,
    FILL = 1,
    JOINT_BEVEL = 4,
    JOINT_MITER = 8,
    JOINT_ROUND = 12,
    JOINT_CAP_BUTT = 16,
    JOINT_CAP_SQUARE = 18,
    JOINT_CAP_ROUND = 20,
    FILL_EXPAND = 24,
    CAP_BUTT = 1 << 5,
    CAP_SQUARE = 2 << 5,
    CAP_ROUND = 3 << 5,
    CAP_BUTT2 = 4 << 5,
}

/**
 * Flags that can be OR'd with a FILL_EXPAND joint to choose which point of the triangle each of
 * its 3 vertices is based on (0 = prev, 1 = point1, 2 = point2), instead of one vertex per point.
 * They are only used to build the geometry, and are not passed to the shader.
 * @category scene
 * @internal
 */
export const FILL_EXPAND_BASES = {
    /** Default: vertices are based on prev, point1, point2 */
    TRIANGLE: 0,
    /** Vertices are based on point1, point2, point2 (first half of an edge strip) */
    FRINGE_1: 1 << 8,
    /** Vertices are based on point1, point2, point1 (second half of an edge strip) */
    FRINGE_2: 2 << 8,
} as const;
