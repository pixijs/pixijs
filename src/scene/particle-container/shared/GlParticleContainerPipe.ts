import { ExtensionType } from '../../../extensions/Extensions';
import { GlParticleContainerAdaptor } from '../gl/GlParticleContainerAdaptor';
import { ParticleContainerPipe } from './ParticleContainerPipe';

import type { WebGLRenderer } from '../../../rendering/renderers/gl/WebGLRenderer';

const typeSymbol = Symbol.for('pixijs.GlParticleContainerPipe');

/**
 * WebGL renderer for Particles that is designed for speed over feature set.
 * @category scene
 * @internal
 */
export class GlParticleContainerPipe extends ParticleContainerPipe
{
    /**
     * Type symbol used to identify instances of GlParticleContainerPipe.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a GlParticleContainerPipe.
     * @param obj - The object to check.
     * @returns True if the object is a GlParticleContainerPipe, false otherwise.
     */
    public static isGlParticleContainerPipe(obj: any): obj is GlParticleContainerPipe
    {
        return !!obj && !!obj[typeSymbol];
    }

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
