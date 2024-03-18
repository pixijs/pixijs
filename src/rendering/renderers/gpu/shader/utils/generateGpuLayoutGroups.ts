import { ShaderStage } from '../../../shared/shader/const';

import type { ProgramPipelineLayoutDescription } from '../GpuProgram';
import type { StructsAndGroups } from './extractStructAndGroups';

export function generateGpuLayoutGroups({ groups }: StructsAndGroups): ProgramPipelineLayoutDescription
{
    const layout: ProgramPipelineLayoutDescription = [];

    for (let i = 0; i < groups.length; i++)
    {
        const group = groups[i];

        if (!layout[group.group])
        {
            layout[group.group] = [];
        }

        if (group.isUniform)
        {
            layout[group.group].push({
                binding: group.binding,
                visibility: ShaderStage.VERTEX | ShaderStage.FRAGMENT,
                buffer: {
                    type: 'uniform'
                }
            });
        }
        else if (group.type === 'sampler')
        {
            layout[group.group].push({
                binding: group.binding,
                visibility: ShaderStage.FRAGMENT,
                sampler: {
                    type: 'filtering'
                }
            });
        }
        else if (group.type === 'texture_2d')
        {
            layout[group.group].push({
                binding: group.binding,
                visibility: ShaderStage.FRAGMENT,
                texture: {
                    sampleType: 'float',
                    viewDimension: '2d',
                    multisampled: false,
                }
            });
        }
    }

    return layout;
}
