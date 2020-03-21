import { Filter } from '@pixi/core';
import vertex from './fxaa.vert';
import fragment from './fxaa.frag';

/**
 * Basic FXAA (Fast Approximate Anti-Aliasing) implementation based on the code on geeks3d.com
 * with the modification that the texture2DLod stuff was removed since it is unsupported by WebGL.
 *
 * @see https://github.com/mitsuhiko/webgl-meincraft
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 *
 */
export class FXAAFilter extends Filter
{
    constructor()
    {
        // TODO - needs work
        super(vertex, fragment);
    }
}
