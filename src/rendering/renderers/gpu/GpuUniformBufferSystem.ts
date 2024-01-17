import { ExtensionType } from '../../../extensions/Extensions';
import { UniformBufferSystem } from '../shared/shader/UniformBufferSystem';
import { createUBOElementsWGSL } from './shader/utils/createUBOElementsWGSL';
import { generateUniformBufferSyncWGSL } from './shader/utils/createUniformBufferSyncWGSL';

/**
 * System plugin to the renderer to manage uniform buffers. With a WGSL twist!
 * @memberof rendering
 */
export class GpuUniformBufferSystem extends UniformBufferSystem
{
    /** @ignore */
    public static extension = {
        type: [ExtensionType.WebGPUSystem],
        name: 'uniformBuffer',
    } as const;

    constructor()
    {
        super({
            createUBOElements: createUBOElementsWGSL,
            generateUniformBufferSync: generateUniformBufferSyncWGSL,
        });
    }
}
