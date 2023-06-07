/* eslint-disable @typescript-eslint/indent */
/**
 * Various blend modes supported by PIXI.
 *
 * IMPORTANT - The WebGL renderer only supports the NORMAL, ADD, MULTIPLY and SCREEN blend modes.
 * Anything else will silently act like NORMAL.
 */
export enum BLEND_MODES
{
    // first four bits are the gl blend mode
    // last 4 the advanced ones
    INHERIT = 0,
    NORMAL = 1,
    ADD = 2,
    MULTIPLY = 3,
    SCREEN = 4,

    DARKEN = (1 << 4) + 1,
    LIGHTEN = (2 << 4) + 1,
    COLOR_DODGE = (3 << 4) + 1,
    COLOR_BURN = (4 << 4) + 1,
    LINEAR_BURN = (5 << 4) + 1,
    LINEAR_DODGE = (6 << 4) + 1,
    LINEAR_LIGHT = (7 << 4) + 1,
    HARD_LIGHT = (8 << 4) + 1,
    SOFT_LIGHT = (9 << 4) + 1,
    PIN_LIGHT = (10 << 4) + 1,
    DIFFERENCE = (11 << 4) + 1,
    EXCLUSION = (12 << 4) + 1,
    OVERLAY = (13 << 4) + 1,
    HARD_MIX = (18 << 4) + 1,
    NEGATION = (19 << 4) + 1,
    VIVID_LIGHT = (20 << 4) + 1,

    HUE = (28 << 4) + 1,
    SATURATION = (29 << 4) + 1,
    COLOR = (30 << 4) + 1,
    LUMINOSITY = (31 << 4) + 1,

    NORMAL_NPM = 18 << 1,
    ADD_NPM = 19 << 1,
    SCREEN_NPM = 20 << 1,
    NONE = 21 << 1,

    // SRC_OVER = 0,
    // SRC_IN = 21,
    // SRC_OUT = 22,
    // SRC_ATOP = 23,
    // DST_OVER = 24,
    // DST_IN = 25,
    // DST_OUT = 26,
    // DST_ATOP = 27,
    // ERASE = 26,
    SUBTRACT = 28,
    DIVIDE = 29,
    // XOR = 30,
}

export enum STENCIL_MODES
{
    DISABLED = 0,
    RENDERING_MASK_ADD = 1,
    MASK_ACTIVE = 2,
    RENDERING_MASK_REMOVE = 3,
    NONE = 4,
}

export type CULL_MODES = 'none' | 'back' | 'front';

