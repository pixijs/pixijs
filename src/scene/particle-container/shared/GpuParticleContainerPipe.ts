import { ExtensionType } from '../../../extensions/Extensions';
import { GpuParticleContainerAdaptor } from '../gpu/GpuParticleContainerAdaptor';
import { ParticleContainerPipe } from './ParticleContainerPipe';

import type { WebGPURenderer } from '../../../rendering/renderers/gpu/WebGPURenderer';

const typeSymbol = Symbol.for('pixijs.GpuParticleContainerPipe');

/**
 * WebGPU renderer for Particles that is designed for speed over feature set.
 * @category scene
 * @internal
 */
export class GpuParticleContainerPipe extends ParticleContainerPipe
{
    /**
     * Type symbol used to identify instances of GpuParticleContainerPipe.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a GpuParticleContainerPipe.
     * @param obj - The object to check.
     * @returns True if the object is a GpuParticleContainerPipe, false otherwise.
     */
    public static isGpuParticleContainerPipe(obj: any): obj is GpuParticleContainerPipe
    {
        return !!obj && !!obj[typeSymbol];
    }

    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUPipes,
        ],
        name: 'particle',
    } as const;

    constructor(renderer: WebGPURenderer)
    {
        super(renderer, new GpuParticleContainerAdaptor());
    }
}
