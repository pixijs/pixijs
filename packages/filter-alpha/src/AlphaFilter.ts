import { Filter, defaultVertex } from '@pixi/core';
import fragment from './alpha.frag';

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
 * @memberof PIXI.filters
 */
export class AlphaFilter extends Filter
{
    /**
     * @param alpha - Amount of alpha from 0 to 1, where 0 is transparent
     */
    constructor(alpha = 1.0)
    {
        super(defaultVertex, fragment, { uAlpha: 1 });

        this.alpha = alpha;
    }

    /**
     * Coefficient for alpha multiplication
     * @default 1
     */
    get alpha(): number
    {
        return this.uniforms.uAlpha;
    }

    set alpha(value: number)
    {
        this.uniforms.uAlpha = value;
    }
}
