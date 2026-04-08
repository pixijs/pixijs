import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { RenderPipes } from '../../../rendering/renderers/types';
import type { RenderGroup } from '../RenderGroup';

/**
 * @param renderGroup
 * @param renderPipes
 * @internal
 */
export function validateRenderables(renderGroup: RenderGroup, renderPipes: RenderPipes): boolean
{
    const { list } = renderGroup.childrenRenderablesToUpdate;

    let rebuildRequired = false;

    for (let i = 0; i < renderGroup.childrenRenderablesToUpdate.index; i++)
    {
        const container = list[i];

        if (!container) continue;

        const renderable = container;
        const pipe = renderPipes[renderable.renderPipeId as keyof RenderPipes] as RenderPipe<any>;

        if (!pipe)
        {
            // Missing pipe — force a full instruction rebuild to re-sync the
            // render group instead of crashing.
            rebuildRequired = true;
            break;
        }

        rebuildRequired = pipe.validateRenderable(container);

        if (rebuildRequired)
        {
            break;
        }
    }

    renderGroup.structureDidChange = rebuildRequired;

    return rebuildRequired;
}
