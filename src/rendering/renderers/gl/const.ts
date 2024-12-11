export enum CLEAR
{
    NONE = 0,
    COLOR = 16384,
    STENCIL = 1024,
    DEPTH = 256,

    COLOR_DEPTH = COLOR | DEPTH,
    COLOR_STENCIL = COLOR | STENCIL,
    DEPTH_STENCIL = DEPTH | STENCIL,
    ALL = COLOR | DEPTH | STENCIL,

}

/** Used for clearing render textures. true is the same as `ALL` false is the same as `NONE` */
export type CLEAR_OR_BOOL = CLEAR | boolean;
