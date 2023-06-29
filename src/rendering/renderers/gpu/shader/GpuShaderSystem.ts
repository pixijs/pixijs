import { ExtensionType } from '../../../../extensions/Extensions';
import { UniformGroup } from '../../shared/shader/UniformGroup';

import type { Shader } from '../../shared/shader/Shader';
import type { ISystem } from '../../shared/system/System';
import type { GPU } from '../GpuDeviceSystem';
import type { WebGPURenderer } from '../WebGPURenderer';
import type { GpuProgram } from './GpuProgram';

export class GpuShaderSystem implements ISystem
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGPURendererSystem,
        ],
        name: 'shader',
    } as const;

    private readonly renderer: WebGPURenderer;

    private gpu: GPU;

    constructor(renderer: WebGPURenderer)
    {
        this.renderer = renderer;
    }

    protected contextChange(gpu: GPU): void
    {
        this.gpu = gpu;
    }

    createProgramLayout(program: GpuProgram)
    {
        const device = this.gpu.device;

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

    updateData(shader: Shader): void
    {
        for (let i = 0; i < shader.gpuProgram.layout.length; i++)
        {
            const group = shader.groups[i];
            const groupLayout = shader.gpuProgram.layout[i];

            for (const j in groupLayout)
            {
                const resource = group.resources[j] ?? group.resources[groupLayout[j]];

                // TODO make this dynamic..
                if (resource instanceof UniformGroup)
                {
                    const uniformGroup = resource;

                    this.renderer.uniformBuffer.updateUniformGroup(uniformGroup);
                }
            }
        }
    }

    destroy(): void
    {
        throw new Error('Method not implemented.');
    }
}
