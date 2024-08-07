import { createIdFromString } from '../../shared/utils/createIdFromString';
import { getMaxFragmentPrecision } from './program/getMaxFragmentPrecision';
import { addProgramDefines } from './program/preprocessors/addProgramDefines';
import { ensurePrecision } from './program/preprocessors/ensurePrecision';
import { insertVersion } from './program/preprocessors/insertVersion';
import { setProgramName } from './program/preprocessors/setProgramName';
import { stripVersion } from './program/preprocessors/stripVersion';

import type { TypedArray } from '../../shared/buffer/Buffer';
import type { ExtractedAttributeData } from './program/extractAttributesFromGlProgram';

export interface GlAttributeData
{
    type: string;
    size: number;
    location: number;
    name: string;
}

export interface GlUniformData
{
    name: string;
    index: number;
    type: string;
    size: number;
    isArray: boolean;
    value: any;
}

export interface GlUniformBlockData
{
    index: number;
    name: string;
    size: number;
    value?: TypedArray;
}

/**
 * The options for the gl program
 * @memberof rendering
 */
export interface GlProgramOptions
{
    /** The fragment glsl shader source. */
    fragment: string;
    /** The vertex glsl shader source. */
    vertex: string;
    /** the name of the program, defaults to 'pixi-program' */
    name?: string;
    /** the preferred vertex precision for the shader, this may not be used if the device does not support it  */
    preferredVertexPrecision?: string;
    /** the preferred fragment precision for the shader, this may not be used if the device does not support it  */
    preferredFragmentPrecision?: string;

    transformFeedbackVaryings?: {names: string[], bufferMode: 'separate' | 'interleaved'};
}

const processes: Record<string, ((source: string, options: any, isFragment?: boolean) => string)> = {
    // strips any version headers..
    stripVersion,
    // adds precision string if not already present
    ensurePrecision,
    // add some defines if WebGL1 to make it more compatible with WebGL2 shaders
    addProgramDefines,
    // add the program name to the shader
    setProgramName,
    // add the version string to the shader header
    insertVersion,
};

const programCache: Record<string, GlProgram> = Object.create(null);

/**
 * A wrapper for a WebGL Program. You can create one and then pass it to a shader.
 * This will manage the WebGL program that is compiled and uploaded to the GPU.
 *
 * To get the most out of this class, you should be familiar with glsl shaders and how they work.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLProgram
 * @example
 *
 * // Create a new program
 * const program = new GlProgram({
 *   vertex: '...',
 *   fragment: '...',
 * });
 *
 *
 * There are a few key things that pixi shader will do for you automatically:
 * <br>
 * - If no precision is provided in the shader, it will be injected into the program source for you.
 * This precision will be taken form the options provided, if none is provided,
 * then the program will default to the defaultOptions.
 * <br>
 * - It will inject the program name into the shader source if none is provided.
 * <br>
 *  - It will set the program version to 300 es.
 *
 * For optimal usage and best performance, its best to reuse programs as much as possible.
 * You should use the {@link GlProgram.from} helper function to create programs.
 * @class
 * @memberof rendering
 */
export class GlProgram
{
    /** The default options used by the program. */
    public static defaultOptions: Partial<GlProgramOptions> = {
        preferredVertexPrecision: 'highp',
        preferredFragmentPrecision: 'mediump',
    };

    /** the fragment glsl shader source. */
    public readonly fragment?: string;
    /** the vertex glsl shader source */
    public readonly vertex?: string;
    /**
     * attribute data extracted from the program once created this happens when the program is used for the first time
     * @internal
     * @ignore
     */
    public _attributeData: Record<string, ExtractedAttributeData>;
    /**
     * uniform data extracted from the program once created this happens when the program is used for the first time
     * @internal
     * @ignore
     */
    public _uniformData: Record<string, GlUniformData>;
    /**
     * uniform data extracted from the program once created this happens when the program is used for the first time
     * @internal
     * @ignore
     */
    public _uniformBlockData: Record<string, GlUniformBlockData>;
    /** details on how to use this program with transform feedback */
    public transformFeedbackVaryings?: {names: string[], bufferMode: 'separate' | 'interleaved'};
    /**
     * the key that identifies the program via its source vertex + fragment
     * @internal
     * @ignore
     */
    public readonly _key: number;

    /**
     * Creates a shiny new GlProgram. Used by WebGL renderer.
     * @param options - The options for the program.
     */
    constructor(options: GlProgramOptions)
    {
        options = { ...GlProgram.defaultOptions, ...options };

        // only need to check one as they both need to be the same or
        // errors ensue!
        const isES300 = options.fragment.indexOf('#version 300 es') !== -1;

        const preprocessorOptions = {
            stripVersion: isES300,
            ensurePrecision: {
                requestedFragmentPrecision: options.preferredFragmentPrecision,
                requestedVertexPrecision: options.preferredVertexPrecision,
                maxSupportedVertexPrecision: 'highp',
                maxSupportedFragmentPrecision: getMaxFragmentPrecision(),
            },
            setProgramName: {
                name: options.name,
            },
            addProgramDefines: isES300,
            insertVersion: isES300
        };

        let fragment = options.fragment;
        let vertex = options.vertex;

        Object.keys(processes).forEach((processKey) =>
        {
            const processOptions = preprocessorOptions[processKey as keyof typeof preprocessorOptions];

            fragment = processes[processKey](fragment, processOptions, true);
            vertex = processes[processKey](vertex, processOptions, false);
        });

        this.fragment = fragment;
        this.vertex = vertex;

        this.transformFeedbackVaryings = options.transformFeedbackVaryings;

        this._key = createIdFromString(`${this.vertex}:${this.fragment}`, 'gl-program');
    }

    /** destroys the program */
    public destroy(): void
    {
        (this.fragment as null) = null;
        (this.vertex as null) = null;

        this._attributeData = null;
        this._uniformData = null;
        this._uniformBlockData = null;

        this.transformFeedbackVaryings = null;
    }

    /**
     * Helper function that creates a program for a given source.
     * It will check the program cache if the program has already been created.
     * If it has that one will be returned, if not a new one will be created and cached.
     * @param options - The options for the program.
     * @returns A program using the same source
     */
    public static from(options: GlProgramOptions): GlProgram
    {
        const key = `${options.vertex}:${options.fragment}`;

        if (!programCache[key])
        {
            programCache[key] = new GlProgram(options);
        }

        return programCache[key];
    }
}
