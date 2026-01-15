import { ExtensionType } from '../../../extensions/Extensions';
import { GpuParticleContainerAdaptor } from '../gpu/GpuParticleContainerAdaptor';
import { ParticleContainerPipe } from '../shared/ParticleContainerPipe';

import type { WebGPURenderer } from '../../../rendering/renderers/gpu/WebGPURenderer';

/**
 * WebGPU renderer for Particles that is designed for speed over feature set.
 * @category scene
 * @internal
 */
export class GpuParticleContainerPipe extends ParticleContainerPipe
{
    /** @ignore */
    public static extension: { type: ExtensionType[]; name: 'particle' } = {
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
