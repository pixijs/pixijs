import { extractStructAndGroups } from './extractStructAndGroups';
import { generateGpuLayoutGroups } from './generateGpuLayoutGroups';
import { generateLayoutHash } from './generateLayoutHash';
import { removeStructAndGroupDuplicates } from './removeStructAndGroupDuplicates';

import type { ProgramLayout, ProgramPipelineLayoutDescription } from '../../gl/shader/GlProgram';
import type { StructsAndGroups } from './extractStructAndGroups';

export interface ProgramSource
{
    source: string;
    entryPoint?: string;
}

export interface GpuProgramOptions
{
    fragment?: ProgramSource;
    vertex?: ProgramSource;
    layout?: ProgramLayout;
    gpuLayout?: ProgramPipelineLayoutDescription;
}

// TODO incorporate later?
export interface SimpleShaderOptions
{
    fragment?: string;
    vertex?: string;
}

export class GpuProgram
{
    public fragment?: ProgramSource;
    public vertex?: ProgramSource;

    public layout: ProgramLayout;

    public gpuLayout: ProgramPipelineLayoutDescription;

    /** @internal */
    public _layoutKey = 0;
    /** @internal */
    public _gpuLayout: {
        bindGroups: GPUBindGroupLayout[];
        pipeline: GPUPipelineLayout | 'auto';
    };

    public structsAndGroups: StructsAndGroups;

    constructor({ fragment, vertex, layout, gpuLayout }: GpuProgramOptions)
    {
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

    public destroy(): void
    {
        this._gpuLayout = null;
        this.gpuLayout = null;
        this.layout = null;
        this.structsAndGroups = null;
        this.fragment = null;
        this.vertex = null;
    }

    public static programCached: Record<string, GpuProgram> = Object.create(null);
    public static from(options: GpuProgramOptions): GpuProgram
    {
        // eslint-disable-next-line max-len
        const key = `${options.vertex.source}:${options.fragment.source}:${options.fragment.entryPoint}:${options.vertex.entryPoint}`;

        if (!GpuProgram.programCached[key])
        {
            GpuProgram.programCached[key] = new GpuProgram(options);
        }

        return GpuProgram.programCached[key];
    }
}

