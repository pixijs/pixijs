import { ExtensionType } from '../../../extensions/Extensions';
import { type CanvasRenderer } from '../../../rendering/renderers/canvas/CanvasRenderer';
import { ParticleContainerPipe } from '../shared/ParticleContainerPipe';
import { CanvasParticleContainerAdaptor } from './CanvasParticleContainerAdaptor';

/**
 * Canvas renderer for Particles that is designed for speed over feature set.
 * @category scene
 * @internal
 */
export class CanvasParticleContainerPipe extends ParticleContainerPipe
{
    /** @ignore */
    public static extension: { type: ExtensionType[]; name: 'particle' } = {
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
