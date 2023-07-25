import type { RenderPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { RenderPipes } from '../../renderers/types';
import type { LayerGroup } from '../LayerGroup';

export function validateRenderables(layerGroup: LayerGroup, renderPipes: RenderPipes): boolean
{
    const { list, index } = layerGroup.childrenRenderablesToUpdate;

    let rebuildRequired = false;

    for (let i = 0; i < index; i++)
    {
        const container = list[i];

        const renderable = container.view;
        const pipe = renderPipes[renderable.type as keyof RenderPipes] as RenderPipe<any>;

        rebuildRequired = pipe.validateRenderable(container);

        if (rebuildRequired)
        {
            break;
        }
    }

    layerGroup.structureDidChange = rebuildRequired;

    if (rebuildRequired)
    {
        layerGroup.childrenRenderablesToUpdate.index = 0;
    }

    return rebuildRequired;
}
