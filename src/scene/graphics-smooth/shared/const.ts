/**
 * Joint types used by the smooth graphics HHAA renderer.
 * These encode how vertices should be processed in the shader.
 * @category scene
 * @advanced
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

