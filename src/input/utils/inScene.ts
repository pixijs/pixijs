import type { Container } from '../../scene/container/Container';

/**
 * Checks if the container is in the scene graph.
 * @param container - The container to check.
 * @param lastObjectRendered - The last object rendered.
 * @returns `true` if the container is in the scene graph, `false` otherwise.
 */
export function inSceneGraph(container: Container, lastObjectRendered: Container): boolean
{
    let current = container;

    while (current)
    {
        if (!current.parentRenderGroup)
        {
            return current.renderGroup === lastObjectRendered.renderGroup;
        }

        if (current.parentRenderGroup === lastObjectRendered.renderGroup)
        {
            return true;
        }
        current = current.parentRenderGroup.root;
    }

    return false;
}
