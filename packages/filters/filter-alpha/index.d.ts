import { Filter } from '@pixi/core';

/**
 * Simplest filter - applies alpha.
 *
 * Use this instead of Container's alpha property to avoid visual layering of individual elements.
 * AlphaFilter applies alpha evenly across the entire display object and any opaque elements it contains.
 * If elements are not opaque, they will blend with each other anyway.
 *
 * Very handy if you want to use common features of all filters:
 *
 * 1. Assign a blendMode to this filter, blend all elements inside display object with background.
 *
 * 2. To use clipping in display coordinates, assign a filterArea to the same container that has this filter.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
export declare class AlphaFilter extends Filter {
    /**
     * @param {number} [alpha=1] - Amount of alpha from 0 to 1, where 0 is transparent
     */
    constructor(alpha?: number);
    /**
     * Coefficient for alpha multiplication
     *
     * @member {number}
     * @default 1
     */
    get alpha(): number;
    set alpha(value: number);
}

export { }
