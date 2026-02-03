import { ExtensionType } from '../../../extensions/Extensions';
import { GlParticleContainerAdaptor } from '../gl/GlParticleContainerAdaptor';
import { ParticleContainerPipe } from './ParticleContainerPipe';

import type { WebGLRenderer } from '../../../rendering/renderers/gl/WebGLRenderer';

/**
 * WebGL renderer for Particles that is designed for speed over feature set.
 * @category scene
 * @internal
 */
export class GlParticleContainerPipe extends ParticleContainerPipe
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
        ],
        name: 'particle',
    } as const;

    constructor(renderer: WebGLRenderer)
    {
        super(renderer, new GlParticleContainerAdaptor());
    }
}
