import { extractStructAndGroups } from './extractStructAndGroups';
import { generateGpuLayoutGroups } from './generateGpuLayoutGroups';
import { generateLayoutHash } from './generateLayoutHash';
import { removeStructAndGroupDuplicates } from './removeStructAndGroupDuplicates';

import type { StructsAndGroups } from './extractStructAndGroups';

/**
 * a WebGPU descriptions of how the program is layed out
 * @see https://gpuweb.github.io/gpuweb/#gpupipelinelayout
 */
export type ProgramPipelineLayoutDescription = GPUBindGroupLayoutEntry[][];
/** a map the maps names of uniforms to group indexes  */
export type ProgramLayout = Record<string, number>[];

/** the program source */
export interface ProgramSource
{
    /** The wgsl source code of the shader. */
    source: string;
    /** The main function to run in this shader */
    entryPoint?: string;
}

/** The options for the gpu program */
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

// TODO incorporate later?
export interface SimpleShaderOptions
{
    fragment?: string;
    vertex?: string;
}

const programCache: Record<string, GpuProgram> = Object.create(null);

/**
 * A wrapper for a WebGPU Program. You can create one and then pass it to a shader.
 * this shader code will be used as part of a WebGPU pipeline
 *
 * To get the most out of this class, you should be familiar with wgsl shaders and how they work.
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
 * Fragment and vertex sources can all be contained in a single wgsl source file which is quite handy!
 *
 * For optimal usage and best performance, its best to reuse programs as much as possible.
 * You should use the {@link GpuProgram.from} helper function to create programs.
 *
 * Unlike webGL programs which extract the program information from the webGL via the compiled program,
 * WebGPU does not have this ability. So we need to provide extract the
 * program layout information directly from the source ourselves.
 * @class
 */
export class GpuProgram
{
    public readonly fragment?: ProgramSource;
    public readonly vertex?: ProgramSource;

    public readonly layout: ProgramLayout;

    public readonly gpuLayout: ProgramPipelineLayoutDescription;

    /** @internal */
    public _layoutKey = 0;
    /** @internal */
    public _gpuLayout: {
        bindGroups: GPUBindGroupLayout[];
        pipeline: GPUPipelineLayout | 'auto';
    };

    /** the structs and groups extracted from the shader sources */
    public readonly structsAndGroups: StructsAndGroups;
    public readonly name: string;

    /**
     *
     * @param options - The options for the gpu program
     * @param options.fragment
     * @param options.vertex
     * @param options.layout
     * @param options.gpuLayout
     * @param options.name
     */
    constructor({ fragment, vertex, layout, gpuLayout, name }: GpuProgramOptions)
    {
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
    }

    /** destroys the program */
    public destroy(): void
    {
        this._gpuLayout = null;
        (this.gpuLayout as any) = null;
        (this.layout as any) = null;
        (this.structsAndGroups as any) = null;
        (this.fragment as any) = null;
        (this.vertex as any) = null;
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

