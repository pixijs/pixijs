import type { RenderGroup } from '../RenderGroup';

export function collectLayerGroups(renderGroup: RenderGroup, out: RenderGroup[] = [])
{
    out.push(renderGroup);

    for (let i = 0; i < renderGroup.renderGroupChildren.length; i++)
    {
        collectLayerGroups(renderGroup.renderGroupChildren[i], out);
    }

    return out;
}
