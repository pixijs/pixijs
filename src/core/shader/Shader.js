import Program from './Program';
import { ProgramCache } from '../utils';

// let math = require('../../../math');
/**
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 */
class Shader
{
    /**
     * @param {PIXI.Program} [program] - The program the shader will use.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     */
    constructor(program, uniforms)
    {
        this.program = program;
        this.uniforms = uniforms || {};

        // time to build some getters and setters!
        // I guess down the line this could sort of generate an instruction list rather than use dirty ids?
        // does the trick for now though!
        for (const i in program.uniformData)
        {
            const uniform = this.uniforms[i];

            if (!uniform)
            {
                this.uniforms[i] = program.uniformData[i].value;
            }
            else if (uniform instanceof Array)
            {
                this.uniforms[i] = new Float32Array(uniform);
            }
        }
    }

    /**
     * A short hand function to create a shader based of a vertex and fragment shader
     *
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     *
     * @returns {PIXI.Shader} an shiney new pixi shader.
     */
    static from(vertexSrc, fragmentSrc, uniforms)
    {
        const key = vertexSrc + fragmentSrc;

        let program = ProgramCache[key];

        if (!program)
        {
            ProgramCache[key] = program = new Program(vertexSrc, fragmentSrc);
        }

        return new Shader(program, uniforms);
    }

}

export default Shader;
