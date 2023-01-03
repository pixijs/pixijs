import { PRECISION } from '@pixi/constants';
import { isMobile, ProgramCache } from '@pixi/utils';
import defaultFragment from './defaultProgram.frag';
import defaultVertex from './defaultProgram.vert';
import { getMaxFragmentPrecision, setPrecision } from './utils';

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

export interface IProgramExtraData
{
    transformFeedbackVaryings?: {
        names: string[],
        bufferMode: 'separate' | 'interleaved'
    }
}

/**
 * Helper class to create a shader program.
 * @memberof PIXI
 */
export class Program
{
    /**
     * Default specify float precision in vertex shader.
     * @static
     * @type {PIXI.PRECISION}
     * @default PIXI.PRECISION.HIGH
     */
    public static defaultVertexPrecision: PRECISION = PRECISION.HIGH;

    /**
     * Default specify float precision in fragment shader.
     * iOS is best set at highp due to https://github.com/pixijs/pixijs/issues/3742
     * @static
     * @type {PIXI.PRECISION}
     * @default PIXI.PRECISION.MEDIUM
     */
    public static defaultFragmentPrecision: PRECISION = isMobile.apple.device
        ? PRECISION.HIGH
        : PRECISION.MEDIUM;

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

    extra: IProgramExtraData = {};

    /**
     * @param vertexSrc - The source of the vertex shader.
     * @param fragmentSrc - The source of the fragment shader.
     * @param name - Name for shader
     * @param extra - Extra data for shader
     */
    constructor(vertexSrc?: string, fragmentSrc?: string, name = 'pixi-shader', extra: IProgramExtraData = {})
    {
        this.id = UID++;
        this.vertexSrc = vertexSrc || Program.defaultVertexSrc;
        this.fragmentSrc = fragmentSrc || Program.defaultFragmentSrc;

        this.vertexSrc = this.vertexSrc.trim();
        this.fragmentSrc = this.fragmentSrc.trim();

        this.extra = extra;

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

            this.vertexSrc = setPrecision(
                this.vertexSrc,
                Program.defaultVertexPrecision,
                PRECISION.HIGH
            );
            this.fragmentSrc = setPrecision(
                this.fragmentSrc,
                Program.defaultFragmentPrecision,
                getMaxFragmentPrecision()
            );
        }

        // currently this does not extract structs only default types
        // this is where we store shader references..
        this.glPrograms = {};

        this.syncUniforms = null;
    }

    /**
     * The default vertex shader source.
     * @readonly
     */
    static get defaultVertexSrc(): string
    {
        return defaultVertex;
    }

    /**
     * The default fragment shader source.
     * @readonly
     */
    static get defaultFragmentSrc(): string
    {
        return defaultFragment;
    }

    /**
     * A short hand function to create a program based of a vertex and fragment shader.
     *
     * This method will also check to see if there is a cached program.
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
