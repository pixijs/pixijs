import type { Renderable } from '../../../rendering/renderers/shared/Renderable';
import type { Bounds } from './Bounds';

export function getGlobalRenderableBounds(renderables: Renderable[], bounds: Bounds): Bounds
{
    bounds.clear();

    // instead of copying the matrix each time we are assigning it in bounds
    // this is a performance hack :D
    // so we need to restore the matrix after we are done

    const tempMatrix = bounds.matrix;

    for (let i = 0; i < renderables.length; i++)
    {
        const renderable = renderables[i];

        if (renderable.globalDisplayStatus < 0b111)
        {
            continue;
        }

        bounds.matrix = renderable.worldTransform;
        bounds.addBounds(renderable.bounds);
    }

    bounds.matrix = tempMatrix;

    return bounds;
}
