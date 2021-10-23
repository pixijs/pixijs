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
 * @memberof PIXI
 */
export class Program
{
    public id: number;

    /** Source code for the vertex shader. */
    public vertexSrc: string;

    /** Source code for the fragment shader. */
    public fragmentSrc: string;

    nameCache: any;
    glPrograms: { [ key: number ]: GLProgram};
    syncUniforms: any;

    /** Assigned when a program is first bound to the shader system. */
    attributeData: { [key: string]: IAttributeData};

    /** Assigned when a program is first bound to the shader system. */
    uniformData: {[key: string]: IUniformData};

    /**
     * @param vertexSrc - The source of the vertex shader.
     * @param fragmentSrc - The source of the fragment shader.
     * @param name - Name for shader
     */
    constructor(vertexSrc?: string, fragmentSrc?: string, name = 'pixi-shader')
    {
        this.id = UID++;
        this.vertexSrc = vertexSrc || Program.defaultVertexSrc;
        this.fragmentSrc = fragmentSrc || Program.defaultFragmentSrc;

        this.vertexSrc = this.vertexSrc.trim();
        this.fragmentSrc = this.fragmentSrc.trim();

        if (this.vertexSrc.substring(0, 8) !== '#version')
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

            this.vertexSrc = `#define SHADER_NAME ${name}\n${this.vertexSrc}`;
            this.fragmentSrc = `#define SHADER_NAME ${name}\n${this.fragmentSrc}`;

            this.vertexSrc = setPrecision(this.vertexSrc, settings.PRECISION_VERTEX, PRECISION.HIGH);
            this.fragmentSrc = setPrecision(this.fragmentSrc, settings.PRECISION_FRAGMENT, getMaxFragmentPrecision());
        }

        // currently this does not extract structs only default types
        // this is where we store shader references..
        this.glPrograms = {};

        this.syncUniforms = null;
    }

    /**
     * The default vertex shader source.
     *
     * @constant
     */
    static get defaultVertexSrc(): string
    {
        return defaultVertex;
    }

    /**
     * The default fragment shader source.
     *
     * @constant
     */
    static get defaultFragmentSrc(): string
    {
        return defaultFragment;
    }

    /**
     * A short hand function to create a program based of a vertex and fragment shader.
     *
     * This method will also check to see if there is a cached program.
     *
     * @param vertexSrc - The source of the vertex shader.
     * @param fragmentSrc - The source of the fragment shader.
     * @param name - Name for shader
     * @returns A shiny new PixiJS shader program!
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
