import { createIdFromString } from '../../shared/utils/createIdFromString';
import { extractAttributesFromGpuProgram } from './utils/extractAttributesFromGpuProgram';
import { extractStructAndGroups } from './utils/extractStructAndGroups';
import { generateGpuLayoutGroups } from './utils/generateGpuLayoutGroups';
import { generateLayoutHash } from './utils/generateLayoutHash';
import { removeStructAndGroupDuplicates } from './utils/removeStructAndGroupDuplicates';

import type { ExtractedAttributeData } from '../../gl/shader/program/extractAttributesFromGlProgram';
import type { StructsAndGroups } from './utils/extractStructAndGroups';

/**
 * a WebGPU descriptions of how the program is laid out
 * @see https://gpuweb.github.io/gpuweb/#gpupipelinelayout
 * @memberof rendering
 */
export type ProgramPipelineLayoutDescription = GPUBindGroupLayoutEntry[][];
/**
 * a map the maps names of uniforms to group indexes
 * @memberof rendering
 */
export type ProgramLayout = Record<string, number>[];

/**
 * the program source
 * @memberof rendering
 */
export interface ProgramSource
{
    /** The wgsl source code of the shader. */
    source: string;
    /** The main function to run in this shader */
    entryPoint?: string;
}

/**
 * The options for the gpu program
 * @memberof rendering
 */
export interface GpuProgramOptions
{
    /**
     * the name of the program, this is added to the label of the GPU Program created
     * under the hood. Makes it much easier to debug!
     */
    name?: string;
    /** The fragment glsl shader source. */
    fragment?: ProgramSource;
    /** The vertex glsl shader source. */
    vertex?: ProgramSource;
    /** The layout of the program. If not provided, it will be generated from the shader sources. */
    layout?: ProgramLayout;
    /** The gpu layout of the program. If not provided, it will be generated from the shader sources. */
    gpuLayout?: ProgramPipelineLayoutDescription;
}

const programCache: Record<string, GpuProgram> = Object.create(null);

/**
 * A wrapper for a WebGPU Program, specifically designed for the WebGPU renderer.
 * This class facilitates the creation and management of shader code that integrates with the WebGPU pipeline.
 *
 * To leverage the full capabilities of this class, familiarity with WGSL shaders is recommended.
 * @see https://gpuweb.github.io/gpuweb/#index
 * @example
 *
 * // Create a new program
 * const program = new GpuProgram({
 *   vertex: {
 *    source: '...',
 *    entryPoint: 'main',
 *   },
 *   fragment:{
 *    source: '...',
 *    entryPoint: 'main',
 *   },
 * });
 *
 *
 * Note: Both fragment and vertex shader sources can coexist within a single WGSL source file
 * this can make things a bit simpler.
 *
 * For optimal usage and best performance, it help to reuse programs whenever possible.
 * The {@link GpuProgram.from} helper function is designed for this purpose, utilizing an
 * internal cache to efficiently manage and retrieve program instances.
 * By leveraging this function, you can significantly reduce overhead and enhance the performance of your rendering pipeline.
 *
 * An important distinction between WebGL and WebGPU regarding program data retrieval:
 * While WebGL allows extraction of program information directly from its compiled state,
 * WebGPU does not offer such a capability. Therefore, in the context of WebGPU, we're required
 * to manually extract the program layout information from the source code itself.
 * @memberof rendering
 */
export class GpuProgram
{
    /** The fragment glsl shader source. */
    public readonly fragment?: ProgramSource;
    /** The vertex glsl shader source */
    public readonly vertex?: ProgramSource;

    /**
     * Mapping of uniform names to group indexes for organizing shader program uniforms.
     * Automatically generated from shader sources if not provided.
     * @example
     * // Assuming a shader with two uniforms, `u_time` and `u_resolution`, grouped respectively:
     * [
     *   { "u_time": 0 },
     *   { "u_resolution": 1 }
     * ]
     */
    public readonly layout: ProgramLayout;

    /**
     * Configuration for the WebGPU bind group layouts, detailing resource organization for the shader.
     * Generated from shader sources if not explicitly provided.
     * @example
     * // Assuming a shader program that requires two bind groups:
     * [
     *   // First bind group layout entries
     *   [{ binding: 0, visibility: GPUShaderStage.VERTEX, type: "uniform-buffer" }],
     *   // Second bind group layout entries
     *   [{ binding: 1, visibility: GPUShaderStage.FRAGMENT, type: "sampler" },
     *    { binding: 2, visibility: GPUShaderStage.FRAGMENT, type: "sampled-texture" }]
     * ]
     */
    public readonly gpuLayout: ProgramPipelineLayoutDescription;

    /**
     * @internal
     * @ignore
     */
    public _layoutKey = 0;

    /**
     * @internal
     * @ignore
     */
    public _attributeLocationsKey = 0;

    /** the structs and groups extracted from the shader sources */
    public readonly structsAndGroups: StructsAndGroups;
    /**
     * the name of the program, this is added to the label of the GPU Program created under the hood.
     * Makes it much easier to debug!
     */
    public readonly name: string;
    private _attributeData: Record<string, ExtractedAttributeData>;

    /** if true, the program will automatically assign global uniforms to group[0] */
    public autoAssignGlobalUniforms: boolean;
    /** if true, the program will automatically assign local uniforms to group[1] */
    public autoAssignLocalUniforms: boolean;

    /**
     * Create a new GpuProgram
     * @param options - The options for the gpu program
     */
    constructor(options: GpuProgramOptions)
    {
        const { fragment, vertex, layout, gpuLayout, name } = options;

        this.name = name;

        this.fragment = fragment;
        this.vertex = vertex;

        // TODO this should be cached - or dealt with at a system level.
        if (fragment.source === vertex.source)
        {
            const structsAndGroups = extractStructAndGroups(fragment.source);

            this.structsAndGroups = structsAndGroups;
        }
        else
        {
            const vertexStructsAndGroups = extractStructAndGroups(vertex.source);
            const fragmentStructsAndGroups = extractStructAndGroups(fragment.source);

            this.structsAndGroups = removeStructAndGroupDuplicates(vertexStructsAndGroups, fragmentStructsAndGroups);
        }

        // todo layout
        this.layout = layout ?? generateLayoutHash(this.structsAndGroups);

        // struct properties!

        this.gpuLayout = gpuLayout ?? generateGpuLayoutGroups(this.structsAndGroups);

        this.autoAssignGlobalUniforms = !!(this.layout[0]?.globalUniforms !== undefined);
        this.autoAssignLocalUniforms = !!(this.layout[1]?.localUniforms !== undefined);

        this._generateProgramKey();
    }

    // TODO maker this pure
    private _generateProgramKey()
    {
        const { vertex, fragment } = this;

        const bigKey = vertex.source + fragment.source + vertex.entryPoint + fragment.entryPoint;

        this._layoutKey = createIdFromString(bigKey, 'program');
    }

    get attributeData()
    {
        this._attributeData ??= extractAttributesFromGpuProgram(this.vertex);

        return this._attributeData;
    }
    /** destroys the program */
    public destroy(): void
    {
        (this.gpuLayout as null) = null;
        (this.layout as null) = null;
        (this.structsAndGroups as null) = null;
        (this.fragment as null) = null;
        (this.vertex as null) = null;
    }

    /**
     * Helper function that creates a program for a given source.
     * It will check the program cache if the program has already been created.
     * If it has that one will be returned, if not a new one will be created and cached.
     * @param options - The options for the program.
     * @returns A program using the same source
     */
    public static from(options: GpuProgramOptions): GpuProgram
    {
        // eslint-disable-next-line max-len
        const key = `${options.vertex.source}:${options.fragment.source}:${options.fragment.entryPoint}:${options.vertex.entryPoint}`;

        if (!programCache[key])
        {
            programCache[key] = new GpuProgram(options);
        }

        return programCache[key];
    }
}

