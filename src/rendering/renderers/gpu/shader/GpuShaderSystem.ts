import { ExtensionType } from '../../../../extensions/Extensions';

import type { System } from '../../shared/system/System';
import type { GPU } from '../GpuDeviceSystem';
import type { GpuProgram } from './GpuProgram';

export class GpuShaderSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUSystem,
        ],
        name: 'shader',
    } as const;

    private _gpu: GPU;

    protected contextChange(gpu: GPU): void
    {
        this._gpu = gpu;
    }

    public createProgramLayout(program: GpuProgram)
    {
        const device = this._gpu.device;

        // TODO rename this... confusing with the below.. gpuLayout is defined by the user
        if (!program._gpuLayout)
        {
            if (program.gpuLayout)
            {
                const bindGroups = program.gpuLayout.map((group) => device.createBindGroupLayout({ entries: group }));

                const pipelineLayoutDesc = { bindGroupLayouts: bindGroups };

                program._gpuLayout = {
                    bindGroups,
                    pipeline: device.createPipelineLayout(pipelineLayoutDesc),
                };
            }
            else
            {
                program._gpuLayout = {
                    bindGroups: null,
                    pipeline: 'auto',
                };
            }
        }
    }

    public destroy(): void
    {
        throw new Error('Method not implemented.');
    }
}
