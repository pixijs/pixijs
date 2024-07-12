import { clearList } from './clearList';

import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { RenderPipes } from '../../../rendering/renderers/types';
import type { RenderGroup } from '../RenderGroup';

export function validateRenderables(renderGroup: RenderGroup, renderPipes: RenderPipes): boolean
{
    const { list, index } = renderGroup.childrenRenderablesToUpdate;

    let rebuildRequired = false;

    let i = 0;

    for (i; i < index; i++)
    {
        const container = list[i];

        // empty the slot
        list[i] = null;

        // note to self: there is no need to check if container.parentRenderGroup || !container.renderGroup
        // exist here, as this function is only called if the structure did NOT change
        // which means they have to be valid if this function is called

        const renderable = container;
        const pipe = renderPipes[renderable.renderPipeId as keyof RenderPipes] as RenderPipe<any>;

        rebuildRequired = pipe.validateRenderable(container);

        if (rebuildRequired)
        {
            break;
        }
    }

    clearList(list, i);

    renderGroup.structureDidChange = rebuildRequired;

    return rebuildRequired;
}
