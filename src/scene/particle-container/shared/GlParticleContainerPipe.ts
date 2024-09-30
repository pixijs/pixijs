import { ExtensionType } from '../../../extensions';
import { GlParticleContainerAdaptor } from '../gl/GlParticleContainerAdaptor';
import { ParticleContainerPipe } from './ParticleContainerPipe';

import type { WebGPURenderer } from '../../../rendering/renderers/gpu/WebGPURenderer';

export class GlParticleContainerPipe extends ParticleContainerPipe
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
        ],
        name: 'particle',
    } as const;

    constructor(renderer: WebGPURenderer)
    {
        super(renderer, new GlParticleContainerAdaptor());
    }
}
