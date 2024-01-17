import { ExtensionType } from '../../../extensions/Extensions';
import { UniformBufferSystem } from '../shared/shader/UniformBufferSystem';
import { createUBOElementsSTD40 } from './shader/utils/createUBOElementsSTD40';
import { generateUniformBufferSyncSTD40 } from './shader/utils/createUniformBufferSyncSTD40';

/**
 * System plugin to the renderer to manage uniform buffers. But with an WGSL adaptor.
 * @memberof rendering
 */
export class GlUniformBufferSystem extends UniformBufferSystem
{
    /** @ignore */
    public static extension = {
        type: [ExtensionType.WebGLSystem],
        name: 'uniformBuffer',
    } as const;

    constructor()
    {
        super({
            createUBOElements: createUBOElementsSTD40,
            generateUniformBufferSync: generateUniformBufferSyncSTD40,
        });
    }
}
