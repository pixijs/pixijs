import { ExtensionType } from '../../../extensions/Extensions';
import { ParticleContainerPipe } from '../shared/ParticleContainerPipe';
import { CanvasParticleContainerAdaptor } from './CanvasParticleContainerAdaptor';

import type { CanvasRenderer } from '../../../rendering/renderers/canvas/CanvasRenderer';

/**
 * A render pipe for the ParticleContainer that uses the Canvas renderer.
 * @internal
 */
export class CanvasParticleContainerPipe extends ParticleContainerPipe
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.CanvasPipes,
        ],
        name: 'particle',
    } as const;

    constructor(renderer: CanvasRenderer)
    {
        super(renderer, new CanvasParticleContainerAdaptor());
    }
}
