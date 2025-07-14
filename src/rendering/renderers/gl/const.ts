/**
 * Constants used by the renderer for clearing the screen or render textures.
 * @category rendering
 * @advanced
 */
export enum CLEAR
{
    /** No clear operation. */
    NONE = 0,
    /** Clear the color buffer. */
    COLOR = 16384,
    /** Clear the stencil buffer. */
    STENCIL = 1024,
    /** Clear the depth buffer. */
    DEPTH = 256,

    /** Clear the color and depth buffers. */
    COLOR_DEPTH = COLOR | DEPTH,
    /** Clear the color and stencil buffers. */
    COLOR_STENCIL = COLOR | STENCIL,
    /** Clear the depth and stencil buffers. */
    DEPTH_STENCIL = DEPTH | STENCIL,
    /** Clear the color, depth, and stencil buffers. */
    ALL = COLOR | DEPTH | STENCIL,

}

/**
 * Used for clearing render textures. true is the same as `ALL` false is the same as `NONE`
 * @category rendering
 * @advanced
 */
export type CLEAR_OR_BOOL = CLEAR | boolean;
