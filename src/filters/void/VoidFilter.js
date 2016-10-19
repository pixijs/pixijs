import * as core from '../../core';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify'); // eslint-disable-line no-undef

/**
 * Does nothing. Very handy.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
export default class VoidFilter extends core.Filter
{
    /**
     *
     */
    constructor()
    {
        super(
            // vertex shader
            glslify('../fragments/default.vert'),
            // fragment shader
            glslify('./void.frag')
        );

        this.glShaderKey = 'void';
    }
}
