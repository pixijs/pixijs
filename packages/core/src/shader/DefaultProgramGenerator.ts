import defaultVertex from './defaultProgram.vert';
import defaultFragment from './defaultProgram.frag';
import { ProgramCache } from '@pixi/utils';
import {
    compileProgram,
    defaultValue,
    getMaxFragmentPrecision,
    getTestContext,
    mapSize,
    mapType,
    setPrecision,
} from './utils';
import { settings } from '@pixi/settings';
import { PRECISION } from '@pixi/constants';

import { Program, IAttributeData, IUniformData, IProgramParameters, IProgramGenerator } from './Program';

const nameCache: { [key: string]: number } = {};

/**
 * Helper class to create pixi shader programs
 *
 * @class
 * @memberof PIXI
 * @implements IProgramGenerator
 */
export class DefaultProgramGenerator implements IProgramGenerator
{
    /**
     * A short hand function to create a program based of a vertex and fragment shader
     * this method will also check to see if there is a cached program.
     *
     * @param {object} params - parameters for Program creation
     * @param {string} [params.vertexSrc] - The source of the vertex shader.
     * @param {string} [params.fragmentSrc] - The source of the fragment shader.
     * @param {string} [params.name='pixi-shader'] - Name for shader
     *
     * @returns {PIXI.Program} an shiny new Pixi shader!
     */
    from(params: IProgramParameters): Program
    {
        const { vertexSrc, fragmentSrc } = params;

        const key = vertexSrc + fragmentSrc;

        let program = ProgramCache[key];

        if (!program)
        {
            ProgramCache[key] = program = new Program(this, params);
        }

        return program;
    }

    constructProgram(program: Program): void
    {
        const { params } = program;

        params.vertexSrc = params.vertexSrc || defaultVertex;
        params.fragmentSrc = params.fragmentSrc || defaultFragment;
        params.name = params.name || 'pixi-shader';

        this.initProgram(program);
    }

    /**
     * Uses test context to initialize Program instance: parse attributes and uniforms
     *
     * @param {PIXI.Program} program
     */
    initProgram(program: Program): void
    {
        const { params } = program;
        let { vertexSrc, fragmentSrc, name } = params;

        if (program.valid)
        {
            return;
        }

        vertexSrc = vertexSrc.trim();
        fragmentSrc = fragmentSrc.trim();

        if (vertexSrc.substring(0, 8) !== '#version')
        {
            name = name.replace(/\s+/g, '-');

            if (nameCache[name])
            {
                nameCache[name]++;
                name += `-${nameCache[name]}`;
            }
            else
            {
                nameCache[name] = 1;
            }

            vertexSrc = `#define SHADER_NAME ${name}\n${vertexSrc}`;
            fragmentSrc = `#define SHADER_NAME ${name}\n${fragmentSrc}`;

            vertexSrc = setPrecision(vertexSrc, settings.PRECISION_VERTEX, PRECISION.HIGH);
            fragmentSrc = setPrecision(fragmentSrc, settings.PRECISION_FRAGMENT, getMaxFragmentPrecision());
        }

        // currently this does not extract structs only default types
        program.vertexSrc = vertexSrc;
        program.fragmentSrc = fragmentSrc;
        this.extractData(program);
        program.valid = true;
    }

    /**
     * Extracts the data for a buy creating a small test program
     * or reading the src directly.
     * @protected
     *
     * @param {PIXI.Program} [program] - The program to analyze
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     */
    protected extractData(program: Program): void
    {
        const gl = getTestContext();

        if (gl)
        {
            const { vertexSrc, fragmentSrc } = program;
            const glProgram = compileProgram(gl, vertexSrc, fragmentSrc);

            program.attributeData = this.getAttributeData(glProgram, gl);
            program.uniformData = this.getUniformData(glProgram, gl);

            gl.deleteProgram(glProgram);
        }
    }

    /**
     * returns the attribute data from the program
     * @private
     *
     * @param {WebGLProgram} [program] - the WebGL program
     * @param {WebGLRenderingContext} [gl] - the WebGL context
     *
     * @returns {object} the attribute data for this program
     */
    protected getAttributeData(program: WebGLProgram, gl: WebGLRenderingContextBase): {[key: string]: IAttributeData}
    {
        const attributes: {[key: string]: IAttributeData} = {};
        const attributesArray: Array<IAttributeData> = [];

        const totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

        for (let i = 0; i < totalAttributes; i++)
        {
            const attribData = gl.getActiveAttrib(program, i);
            const type = mapType(gl, attribData.type);

            /*eslint-disable */
            const data = {
                type: type,
                name: attribData.name,
                size: mapSize(type),
                location: 0,
            };
            /* eslint-enable */

            attributes[attribData.name] = data;
            attributesArray.push(data);
        }

        attributesArray.sort((a, b) => (a.name > b.name) ? 1 : -1); // eslint-disable-line no-confusing-arrow

        for (let i = 0; i < attributesArray.length; i++)
        {
            attributesArray[i].location = i;
        }

        return attributes;
    }

    /**
     * returns the uniform data from the program
     * @private
     *
     * @param {WebGLProgram} [program] - the webgl program
     * @param {context} [gl] - the WebGL context
     *
     * @returns {object} the uniform data for this program
     */
    private getUniformData(program: WebGLProgram, gl: WebGLRenderingContextBase): {[key: string]: IUniformData}
    {
        const uniforms: {[key: string]: IUniformData} = {};

        const totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        // TODO expose this as a prop?
        // const maskRegex = new RegExp('^(projectionMatrix|uSampler|translationMatrix)$');
        // const maskRegex = new RegExp('^(projectionMatrix|uSampler|translationMatrix)$');

        for (let i = 0; i < totalUniforms; i++)
        {
            const uniformData = gl.getActiveUniform(program, i);
            const name = uniformData.name.replace(/\[.*?\]/, '');

            const isArray = uniformData.name.match(/\[.*?\]/);
            const type = mapType(gl, uniformData.type);

            /*eslint-disable */
            uniforms[name] = {
                type: type,
                size: uniformData.size,
                isArray:isArray,
                value: defaultValue(type, uniformData.size),
            };
            /* eslint-enable */
        }

        return uniforms;
    }
}

export const defaultProgramGenerator = Program.defaultGenerator = new DefaultProgramGenerator();
