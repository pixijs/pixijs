import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { RenderPipes } from '../../../rendering/renderers/types';
import type { RenderGroup } from '../RenderGroup';

export function validateRenderables(layerGroup: RenderGroup, renderPipes: RenderPipes): boolean
{
    const { list, index } = layerGroup.childrenRenderablesToUpdate;

    let rebuildRequired = false;

    for (let i = 0; i < index; i++)
    {
        const container = list[i];

        const renderable = container.view;
        const pipe = renderPipes[renderable.renderPipeId as keyof RenderPipes] as RenderPipe<any>;

        rebuildRequired = pipe.validateRenderable(container);

        if (rebuildRequired)
        {
            break;
        }
    }

    layerGroup.structureDidChange = rebuildRequired;

    return rebuildRequired;
}
