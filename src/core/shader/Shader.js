import extractUniformsFromSrc from './extractUniformsFromSrc';
import extractAttributesFromSrc from './extractAttributesFromSrc';
import generateUniformsSync from './generateUniformsSync';
import Program from './Program';
import { ProgramCache } from '../utils';

let UID = 0;

// let math = require('../../../math');
/**
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 */
class Shader
{
    /**
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
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
            else
            {
                if(uniform instanceof Array)
                {
                    this.uniforms[i] = new Float32Array(uniform)
                }
            }
        }
    }

    static from(vertexSrc, fragmentSrc, uniforms)
    {
        const key = vertexSrc + fragmentSrc;

        let program = ProgramCache[key];

        if(!program)
        {
            ProgramCache[key] = program = new Program(vertexSrc,fragmentSrc);
        }

        return new Shader(program, uniforms);
    }

}

export default Shader;
