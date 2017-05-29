import Program from './Program';
import UniformGroup from './UniformGroup';

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

        // lets see whats been passed in
        // uniforms should be converted to a uniform group
        if (uniforms)
        {
            if (uniforms instanceof UniformGroup)
            {
                this.uniformGroup = uniforms;
            }
            else
            {
                this.uniformGroup = new UniformGroup(uniforms);
            }
        }
        else
        {
            this.uniformGroup = new UniformGroup({});
        }

        // time to build some getters and setters!
        // I guess down the line this could sort of generate an instruction list rather than use dirty ids?
        // does the trick for now though!
        for (const i in program.uniformData)
        {
            if (this.uniformGroup.uniforms[i] instanceof Array)
            {
                this.uniformGroup.uniforms[i] = new Float32Array(this.uniformGroup.uniforms[i]);
            }
        }
    }

    // TODO move to shader system..
    checkUniformExists(name, group)
    {
        if (group.uniforms[name])
        {
            return true;
        }

        for (const i in group.uniforms)
        {
            const uniform = group.uniforms[i];

            if (uniform.group)
            {
                if (this.checkUniformExists(name, uniform))
                {
                    return true;
                }
            }
        }

        return false;
    }

    destroy()
    {
        // usage count on programs?
        // remove if not used!
        this.uniformGroup = null;
    }

    get uniforms()
    {
        return this.uniformGroup.uniforms;
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
        const program = Program.from(vertexSrc, fragmentSrc);

        return new Shader(program, uniforms);
    }
}

export default Shader;
