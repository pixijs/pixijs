import { ensurePrecision } from './program/ensurePrecision';
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
}

const processes: Record<string, ((source: string, options: any, isFragment?: boolean) => string)> = {
    ensurePrecision,
    setProgramName,
    setProgramVersion
};

export class GlProgram
{
    fragment?: string;
    vertex?: string;

    attributeData: Record<string, IAttributeData>;
    uniformData: Record<string, IUniformData>;
    uniformBlockData: Record<string, IUniformBlockData>;

    transformFeedbackVaryings?: {names: string[], bufferMode: 'separate' | 'interleaved'};

    readonly key: string;

    constructor({ fragment, vertex, name }: GlProgramOptions)
    {
        const options = {
            ensurePrecision: {
                requestedPrecision: 'highp',
                maxSupportedPrecision: 'highp',
            },
            setProgramName: {
                name,
            },
            setProgramVersion: {
                version: '300 es',
            }
        };

        Object.keys(processes).forEach((processKey) =>
        {
            const processOptions = options[processKey as keyof typeof options] ?? {};

            fragment = processes[processKey](fragment, processOptions, true);
            vertex = processes[processKey](vertex, processOptions, false);
        });

        this.fragment = fragment;
        this.vertex = vertex;

        this.key = `${this.vertex}:${this.fragment}`;
    }

    static programCached: Record<string, GlProgram> = {};
    static from(options: GlProgramOptions): GlProgram
    {
        const key = `${options.vertex}:${options.fragment}:${options.name}`;

        if (!GlProgram.programCached[key])
        {
            GlProgram.programCached[key] = new GlProgram(options);
        }

        return GlProgram.programCached[key];
    }
}
