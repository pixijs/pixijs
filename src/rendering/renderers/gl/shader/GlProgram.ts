import { ensurePrecision } from './program/ensurePrecision';
import { getMaxFragmentPrecision } from './program/getMaxFragmentPrecision';
import { setProgramName } from './program/setProgramName';
import { setProgramVersion } from './program/setProgramVersion';

import type { TypedArray } from '../../shared/buffer/Buffer';

export type ProgramPipelineLayoutDescription = GPUBindGroupLayoutEntry[][];
export type ProgramLayout = Record<string, number>[];

export interface IAttributeData
{
    type: string;
    size: number;
    location: number;
    name: string;
}

export interface IUniformData
{
    name: string;
    index: number;
    type: string;
    size: number;
    isArray: boolean;
    value: any;
}

export interface IUniformBlockData
{
    index: number;
    name: string;
    size: number;
    value?: TypedArray;
}

export interface GlProgramOptions
{
    fragment?: string;
    vertex?: string;
    name?: string;
    preferredVertexPrecision?: string;
    preferredFragmentPrecision?: string;
}

const processes: Record<string, ((source: string, options: any, isFragment?: boolean) => string)> = {
    ensurePrecision,
    setProgramName,
    setProgramVersion
};

export class GlProgram
{
    public static defaultOptions: GlProgramOptions = {
        preferredVertexPrecision: 'highp',
        preferredFragmentPrecision: 'mediump',
    };

    public fragment?: string;
    public vertex?: string;

    public attributeData: Record<string, IAttributeData>;
    public uniformData: Record<string, IUniformData>;
    public uniformBlockData: Record<string, IUniformBlockData>;

    public transformFeedbackVaryings?: {names: string[], bufferMode: 'separate' | 'interleaved'};

    public readonly key: string;

    constructor(options: GlProgramOptions)
    {
        options = { ...GlProgram.defaultOptions, ...options };

        const preprocessorOptions = {
            ensurePrecision: {
                requestedFragmentPrecision: options.preferredFragmentPrecision,
                requestedVertexPrecision: options.preferredVertexPrecision,
                maxSupportedVertexPrecision: 'highp',
                maxSupportedFragmentPrecision: getMaxFragmentPrecision(),
            },
            setProgramName: {
                name: options.name,
            },
            setProgramVersion: {
                version: '300 es',
            }
        };

        let fragment = options.fragment;
        let vertex = options.vertex;

        Object.keys(processes).forEach((processKey) =>
        {
            const processOptions = preprocessorOptions[processKey as keyof typeof preprocessorOptions] ?? {};

            fragment = processes[processKey](fragment, processOptions, true);
            vertex = processes[processKey](vertex, processOptions, false);
        });

        this.fragment = fragment;
        this.vertex = vertex;

        this.key = `${this.vertex}:${this.fragment}`;
    }

    public destroy(): void
    {
        this.fragment = null;
        this.vertex = null;

        this.attributeData = null;
        this.uniformData = null;
        this.uniformBlockData = null;

        this.transformFeedbackVaryings = null;
    }

    public static programCached: Record<string, GlProgram> = Object.create(null);
    public static from(options: GlProgramOptions): GlProgram
    {
        const key = `${options.vertex}:${options.fragment}`;

        if (!GlProgram.programCached[key])
        {
            GlProgram.programCached[key] = new GlProgram(options);
        }

        return GlProgram.programCached[key];
    }
}
