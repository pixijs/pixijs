import * as core from '../../core';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Simplest filter - applies alpha. Very handy.
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

        this.uniforms.uAlpha = 1.0;
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
