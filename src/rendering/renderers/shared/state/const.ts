/**
 * Various blend modes supported by Pixi
 * @memberof filters
 */
export type BLEND_MODES = 'inherit'
| 'normal'
| 'add'
| 'multiply'
| 'screen'
| 'darken'
| 'lighten'
| 'erase'
| 'color-dodge'
| 'color-burn'
| 'linear-burn'
| 'linear-dodge'
| 'linear-light'
| 'hard-light'
| 'soft-light'
| 'pin-light'
| 'difference'
| 'exclusion'
| 'overlay'
// | 'hue'
| 'saturation'
| 'color'
| 'luminosity'
| 'normal-npm'
| 'add-npm'
| 'screen-npm'
| 'none'
| 'subtract'
| 'divide'
| 'vivid-light'
| 'hard-mix'
| 'negation'
| 'min'
| 'max';

/**
 * The map of blend modes supported by Pixi
 * @memberof rendering
 */
export const BLEND_TO_NPM = {
    normal: 'normal-npm',
    add: 'add-npm',
    screen: 'screen-npm',
};

/**
 * The stencil operation to perform when using the stencil buffer
 * @memberof rendering
 */
export enum STENCIL_MODES
{
    DISABLED = 0,
    RENDERING_MASK_ADD = 1,
    MASK_ACTIVE = 2,
    INVERSE_MASK_ACTIVE = 3,
    RENDERING_MASK_REMOVE = 4,
    NONE = 5,
}

/**
 * The culling mode to use. It can be either `none`, `front` or `back`.
 * @memberof rendering
 */
export type CULL_MODES = 'none' | 'back' | 'front';

