import { ExtensionType } from '../../../../extensions/Extensions';

import type { ShaderSystem } from '../../shared/shader/ShaderSystem';
import type { GPU } from '../GpuDeviceSystem';
import type { GpuProgram } from './GpuProgram';

export interface GPUProgramData
{
    bindGroups: GPUBindGroupLayout[]
    pipeline: GPUPipelineLayout
}

/**
 * A system that manages the rendering of GpuPrograms.
 * @memberof rendering
 */
export class GpuShaderSystem implements ShaderSystem
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUSystem,
        ],
        name: 'shader',
    } as const;

    public maxTextures: number;

    private _gpu: GPU;

    private readonly _gpuProgramData: Record<number, GPUProgramData> = Object.create(null);

    protected contextChange(gpu: GPU): void
    {
        this._gpu = gpu;

        this.maxTextures = gpu.device.limits.maxSampledTexturesPerShaderStage;
    }

    public getProgramData(program: GpuProgram)
    {
        return this._gpuProgramData[program._layoutKey] || this._createGPUProgramData(program);
    }

    private _createGPUProgramData(program: GpuProgram)
    {
        const device = this._gpu.device;

        const bindGroups = program.gpuLayout.map((group) => device.createBindGroupLayout({ entries: group }));

        const pipelineLayoutDesc = { bindGroupLayouts: bindGroups };

        this._gpuProgramData[program._layoutKey] = {
            bindGroups,
            pipeline: device.createPipelineLayout(pipelineLayoutDesc),
        };

        // generally we avoid having to make this automatically
        // keeping this for a reminder, if any issues popup
        // program._gpuLayout = {
        //     bindGroups: null,
        //     pipeline: 'auto',
        // };

        return this._gpuProgramData[program._layoutKey];
    }

    public destroy(): void
    {
        // TODO destroy the _gpuProgramData
        this._gpu = null;
        (this._gpuProgramData as null) = null;
    }
}
