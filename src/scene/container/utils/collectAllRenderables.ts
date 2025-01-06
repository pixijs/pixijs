import { type Container } from '../Container';
import { type InstructionSet } from '~/rendering/renderers/shared/instructions/InstructionSet';
import { type Renderer } from '~/rendering/renderers/types';
import { deprecation } from '~/utils/logging/deprecation';

/**
 * @param container - The container to collect renderables from.
 * @param instructionSet - The instruction set to add the renderables to.
 * @param renderer - The renderer to collect the renderables from.
 * @deprecated since version 8.6.6
 * Please use container.collectRenderables instead.
 */
export function collectAllRenderables(
    container: Container, instructionSet: InstructionSet, renderer: Renderer
): void
{
    deprecation('collectAllRenderables', 'Please use container.collectRenderables instead.');

    return container.collectRenderables(instructionSet, renderer, null);
}
