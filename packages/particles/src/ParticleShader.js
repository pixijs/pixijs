import { GLShader } from 'pixi-gl-core';
import { PRECISION } from '@pixi/constants';
import vertex from './particles.vert';
import fragment from './particles.frag';

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI
 * @private
 */
export default class ParticleShader extends GLShader
{
    /**
     * @param {PIXI.Shader} gl - The webgl shader manager this shader works for.
     */
    constructor(gl)
    {
        super(gl, vertex, fragment, PRECISION.DEFAULT);
    }
}
