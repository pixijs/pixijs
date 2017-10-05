import * as core from '../../core';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Simplest filter - applies alpha
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
export default class AlphaFilter extends core.Filter
{
    /**
     *
     */
    constructor()
    {
        super(
            // vertex shader
            readFileSync(join(__dirname, '../fragments/default.vert'), 'utf8'),
            // fragment shader
            readFileSync(join(__dirname, './alpha.frag'), 'utf8')
        );

        this.alpha = 1.0;
        this.glShaderKey = 'alpha';
    }

    /**
     * Coefficient for alpha multiplication
     *
     * @member {number}
     * @default 1
     */
    get alpha()
    {
        return this.uniforms.uAlpha;
    }

    set alpha(value) // eslint-disable-line require-jsdoc
    {
        this.uniforms.uAlpha = value;
    }
}
