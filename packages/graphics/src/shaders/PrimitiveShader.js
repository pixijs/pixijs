import { Shader, Program } from '@pixi/core';
import fragment from './primitive.frag';
import vertex from './primitive.vert';

/**
 * This shader is used to draw simple primitive shapes for {@link PIXI.Graphics}.
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 */
export default class PrimitiveShader extends Shader
{
    /**
     * @param {WebGLRenderingContext} gl - The webgl shader manager this shader works for.
     */
    constructor()
    {
        const program = Program.from(vertex, fragment);

        super(program, {});
    }
}
