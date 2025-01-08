import { type InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import { type Renderer, type RenderPipes } from '../../../rendering/renderers/types';
import { deprecation } from '../../../utils/logging/deprecation';
import { type Container } from '../Container';

/**
 * Deprecated, please use container.collectRenderables instead.
 * @param container - The container to collect renderables from.
 * @param instructionSet - The instruction set to add the renderables to.
 * @param rendererOrPipes - The renderer to collect the renderables from.
 * @deprecated since version 8.7.0
 * @see container.collectRenderables
 */
export function collectAllRenderables(
    container: Container, instructionSet: InstructionSet, rendererOrPipes: Renderer | RenderPipes
): void
{
    // #if _DEBUG
    deprecation('8.7.0', 'Please use container.collectRenderables instead.');
    // #endif

    // deprecate the use of renderPipes by finding the renderer attached to the batch pipe as this is always there
    const renderer = (rendererOrPipes as Renderer).renderPipes
        ? (rendererOrPipes as Renderer)
        : (rendererOrPipes as RenderPipes).batch.renderer;

    return container.collectRenderables(instructionSet, renderer, null);
}
