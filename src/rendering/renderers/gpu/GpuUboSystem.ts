import { ExtensionType } from '../../../extensions/Extensions';
import { UboSystem } from '../shared/shader/UboSystem';
import { createUboElementsWGSL } from './shader/utils/createUboElementsWGSL';
import { createUboSyncFunctionWGSL } from './shader/utils/createUboSyncFunctionWGSL';

const typeSymbol = Symbol.for('pixijs.GpuUboSystem');

/**
 * System plugin to the renderer to manage uniform buffers. With a WGSL twist!
 * @category rendering
 * @advanced
 */
export class GpuUboSystem extends UboSystem
{
    /**
     * Type symbol used to identify instances of GpuUboSystem.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a GpuUboSystem.
     * @param obj - The object to check.
     * @returns True if the object is a GpuUboSystem, false otherwise.
     */
    public static isGpuUboSystem(obj: any): obj is GpuUboSystem
    {
        return !!obj && !!obj[typeSymbol];
    }

    /** @ignore */
    public static extension = {
        type: [ExtensionType.WebGPUSystem],
        name: 'ubo',
    } as const;

    constructor()
    {
        super({
            createUboElements: createUboElementsWGSL,
            generateUboSync: createUboSyncFunctionWGSL,
        });
    }
}
