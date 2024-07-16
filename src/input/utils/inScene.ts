import type { Container } from '../../scene/container/Container';

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
