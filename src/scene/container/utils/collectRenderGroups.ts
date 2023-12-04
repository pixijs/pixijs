import type { RenderGroup } from '../RenderGroup';

export function collectRenderGroups(renderGroup: RenderGroup, out: RenderGroup[] = [])
{
    out.push(renderGroup);

    for (let i = 0; i < renderGroup.renderGroupChildren.length; i++)
    {
        collectRenderGroups(renderGroup.renderGroupChildren[i], out);
    }

    return out;
}
