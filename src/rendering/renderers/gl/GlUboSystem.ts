import { ExtensionType } from '../../../extensions/Extensions';
import { UboSystem } from '../shared/shader/UboSystem';
import { createUboElementsSTD40 } from './shader/utils/createUboElementsSTD40';
import { createUboSyncFunctionSTD40 } from './shader/utils/createUboSyncSTD40';

const typeSymbol = Symbol.for('pixijs.GlUboSystem');

/**
 * System plugin to the renderer to manage uniform buffers. But with an WGSL adaptor.
 * @category rendering
 * @advanced
 */
export class GlUboSystem extends UboSystem
{
    /**
     * Type symbol used to identify instances of GlUboSystem.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a GlUboSystem.
     * @param obj - The object to check.
     * @returns True if the object is a GlUboSystem, false otherwise.
     */
    public static isGlUboSystem(obj: any): obj is GlUboSystem
    {
        return !!obj && !!obj[typeSymbol];
    }

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
