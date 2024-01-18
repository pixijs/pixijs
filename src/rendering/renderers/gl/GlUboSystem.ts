import { ExtensionType } from '../../../extensions/Extensions';
import { UboSystem } from '../shared/shader/UboSystem';
import { createUboElementsSTD40 } from './shader/utils/createUboElementsSTD40';
import { createUboSyncFunctionSTD40 } from './shader/utils/createUboSyncSTD40';

/**
 * System plugin to the renderer to manage uniform buffers. But with an WGSL adaptor.
 * @memberof rendering
 */
export class GlUboSystem extends UboSystem
{
    /** @ignore */
    public static extension = {
        type: [ExtensionType.WebGLSystem],
        name: 'ubo',
    } as const;

    constructor()
    {
        super({
            createUboElements: createUboElementsSTD40,
            generateUboSync: createUboSyncFunctionSTD40,
        });
    }
}
