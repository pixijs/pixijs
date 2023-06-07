import type { LayerGroup } from '../LayerGroup';

export function collectLayerGroups(renderGroup: LayerGroup, out: LayerGroup[] = [])
{
    out.push(renderGroup);

    for (let i = 0; i < renderGroup.layerGroupChildren.length; i++)
    {
        collectLayerGroups(renderGroup.layerGroupChildren[i], out);
    }

    return out;
}
