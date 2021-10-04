import { setPrecision,
    getMaxFragmentPrecision } from './utils';
import { ProgramCache } from '@pixi/utils';
import defaultFragment from './defaultProgram.frag';
import defaultVertex from './defaultProgram.vert';
import { settings } from '@pixi/settings';
import { PRECISION } from '@pixi/constants';

import type { GLProgram } from './GLProgram';

let UID = 0;

const nameCache: { [key: string]: number } = {};

export interface IAttributeData
{
    type: string;
    size: number;
    location: number;
    name: string;
}

export interface IUniformData
{
    index: number;
    type: string;
    size: number;
    isArray: boolean;
    value: any;
    name: string;
}

/**
 * Helper class to create a shader program.
 *
 * @class
 * @memberof PIXI
 */
export class Program
{
    public id: number;
    public vertexSrc: string;
    public fragmentSrc: string;
    nameCache: any;
    glPrograms: { [ key: number ]: GLProgram};
    syncUniforms: any;
    /** Assigned when a program is first bound to the shader system. */
    attributeData: { [key: string]: IAttributeData};
    /** Assigned when a program is first bound to the shader system. */
    uniformData: {[key: string]: IUniformData};

    /**
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     * @param {string} [name] - Name for shader
     */
    constructor(vertexSrc?: string, fragmentSrc?: string, name = 'pixi-shader')
    {
        this.id = UID++;

        /**
         * The vertex shader.
         *
         * @member {string}
         */
        this.vertexSrc = vertexSrc || Program.defaultVertexSrc;

        /**
         * The fragment shader.
         *
         * @member {string}
         */
        this.fragmentSrc = fragmentSrc || Program.defaultFragmentSrc;

        this.vertexSrc = this.vertexSrc.trim();
        this.fragmentSrc = this.fragmentSrc.trim();

        const splitRegex = /^(?:.|\n|\r)*?[ \t]*#[ \t]*version[ \t].*(?:\r\n|\n|\r|$)/;
        let vertexSrcHead = this.vertexSrc.match(splitRegex)?.[0] ?? '';
        let vertexSrcBody = this.vertexSrc.substring(vertexSrcHead.length);
        let fragmentSrcHead = this.fragmentSrc.match(splitRegex)?.[0] ?? '';
        let fragmentSrcBody = this.fragmentSrc.substring(fragmentSrcHead.length);

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

        vertexSrcHead = `${vertexSrcHead}\n#define SHADER_NAME ${name}`;
        fragmentSrcHead = `${fragmentSrcHead}\n#define SHADER_NAME ${name}`;

        vertexSrcBody = setPrecision(vertexSrcBody, settings.PRECISION_VERTEX, PRECISION.HIGH);
        fragmentSrcBody = setPrecision(fragmentSrcBody, settings.PRECISION_FRAGMENT, getMaxFragmentPrecision());

        this.vertexSrc = `${vertexSrcHead}\n${vertexSrcBody}`;
        this.fragmentSrc = `${fragmentSrcHead}\n${fragmentSrcBody}`;

        // currently this does not extract structs only default types
        // this is where we store shader references..
        this.glPrograms = {};

        this.syncUniforms = null;
    }

    /**
     * The default vertex shader source
     *
     * @static
     * @constant
     * @member {string}
     */
    static get defaultVertexSrc(): string
    {
        return defaultVertex;
    }

    /**
     * The default fragment shader source
     *
     * @static
     * @constant
     * @member {string}
     */
    static get defaultFragmentSrc(): string
    {
        return defaultFragment;
    }

    /**
     * A short hand function to create a program based of a vertex and fragment shader
     * this method will also check to see if there is a cached program.
     *
     * @param {string} [vertexSrc] - The source of the vertex shader.
     * @param {string} [fragmentSrc] - The source of the fragment shader.
     * @param {string} [name=pixi-shader] - Name for shader
     *
     * @returns {PIXI.Program} an shiny new Pixi shader!
     */
    static from(vertexSrc?: string, fragmentSrc?: string, name?: string): Program
    {
        const key = vertexSrc + fragmentSrc;

        let program = ProgramCache[key];

        if (!program)
        {
            ProgramCache[key] = program = new Program(vertexSrc, fragmentSrc, name);
        }

        return program;
    }
}
