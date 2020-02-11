// import * as from '../systems/shader/shader';
import defaultFragment from './defaultProgram.frag';
import defaultVertex from './defaultProgram.vert';

import { GLProgram } from './GLProgram';
import { DefaultProgramGenerator } from './DefaultProgramGenerator';

let UID = 0;

export interface IAttributeData
{
    type: string;
    size: number;
    location: number;
    name: string;
}

export interface IUniformData
{
    type: string;
    size: number;
    isArray: RegExpMatchArray;
    value: any;
}

export interface IProgramParameters
{
    vertexSrc?: string;
    fragmentSrc?: string;
    name?: string;
}

export interface IProgramGenerator
{
    constructProgram(program: Program): void;
    initProgram(program: Program): void;
}

/**
 * Program template, creates program instances based on source code and parameters
 *
 * @memberof PIXI
 * @typedef {object} IProgramGenerator
 */

/**
 * Class represents shader program
 *
 * @class
 * @memberof PIXI
 */
export class Program
{
    public id: number;
    public vertexSrc: string;
    public fragmentSrc: string;
    params: IProgramParameters;
    glPrograms: { [ key: number ]: GLProgram};
    syncUniforms: any;
    attributeData: { [key: string]: IAttributeData};
    uniformData: {[key: string]: IUniformData};
    valid: boolean;
    template: IProgramGenerator;
    /**
     * Constructor is not supposed to be called directly, only through program templates (proprocessor)
     *
     * @param {PIXI.ProgramTemplate}
     * @param {object} [params] - Parameters for the program
     */
    constructor(template: IProgramGenerator, params: IProgramParameters)
    {
        this.id = UID++;

        if (typeof template === 'string' || template === undefined)
        {
            // eslint-disable-next-line
            const [vertexSrc, fragmentSrc, name] = arguments as any;

            params = { vertexSrc, fragmentSrc, name };
            template = undefined;
        }

        this.template = template || Program.defaultGenerator;

        this.params = params;

        /**
         * Wheter program is tested
         *
         * @member {boolean}
         */
        this.valid = false;

        /**
         * The vertex shader.
         *
         * @member {string}
         */
        this.vertexSrc = null;

        /**
         * The fragment shader.
         *
         * @member {string}
         */
        this.fragmentSrc = null;

        this.uniformData = null;
        this.attributeData = null;

        // this is where we store shader references..
        this.glPrograms = {};

        this.syncUniforms = null;

        this.template.constructProgram(this);
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
        return Program.defaultGenerator.from({ vertexSrc, fragmentSrc, name });
    }

    static defaultGenerator: DefaultProgramGenerator = null;
}
