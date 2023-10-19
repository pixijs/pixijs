/* eslint-disable @typescript-eslint/indent */
/** Various blend modes supported by Pixi */
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
| 'negation';

export const BLEND_TO_NPM = {
    normal: 'normal-npm',
    add: 'add-npm',
    screen: 'screen-npm',
};

export enum STENCIL_MODES
{
    DISABLED = 0,
    RENDERING_MASK_ADD = 1,
    MASK_ACTIVE = 2,
    RENDERING_MASK_REMOVE = 3,
    NONE = 4,
}

export type CULL_MODES = 'none' | 'back' | 'front';

