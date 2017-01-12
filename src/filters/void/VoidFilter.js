import * as core from '../../core';
import { readFileSync } from 'fs';
import { join } from 'path';

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
            readFileSync(join(__dirname, '../fragments/default.vert'), 'utf8'),
            // fragment shader
            readFileSync(join(__dirname, './void.frag'), 'utf8')
        );

        this.glShaderKey = 'void';
    }
}
