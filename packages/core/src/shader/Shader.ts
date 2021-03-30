import { Program } from './Program';
import { UniformGroup } from './UniformGroup';

import type { Dict } from '@pixi/utils';

/**
 * A helper class for shaders
 *
 * @class
 * @memberof PIXI
 */
export class Shader
{
    public program: Program;
    public uniformGroup: UniformGroup;

    /**
     * used internally to bind uniform buffer objects
     * @ignore
     */
    uniformBindCount = 0;

    /**
     * @param {PIXI.Program} [program] - The program the shader will use.
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     */
    constructor(program: Program, uniforms?: Dict<any>)
    {
        /**
         * Program that the shader uses
         *
         * @member {PIXI.Program}
         */
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
    }

    // TODO move to shader system..
    checkUniformExists(name: string, group: UniformGroup): boolean
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

    destroy(): void
    {
        // usage count on programs?
        // remove if not used!
        this.uniformGroup = null;
    }

    /**
     * Shader uniform values, shortcut for `uniformGroup.uniforms`
     * @readonly
     * @member {object}
     */
    get uniforms(): Dict<any>
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
     * @returns {PIXI.Shader} an shiny new Pixi shader!
     */
    static from(vertexSrc?: string, fragmentSrc?: string, uniforms?: Dict<any>): Shader
    {
        const program = Program.from(vertexSrc, fragmentSrc);

        return new Shader(program, uniforms);
    }
}
