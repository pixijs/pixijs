import type { ObservablePoint } from '../../maths/point/ObservablePoint';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { BoundsData } from '../../scene/container/bounds/Bounds';

export function updateQuadBounds(
    bounds: BoundsData,
    anchor: ObservablePoint,
    texture: Texture,
    padding: number
)
{
    const { width, height } = texture.orig;
    const trim = texture.trim;

    if (trim)
    {
        const sourceWidth = trim.width;
        const sourceHeight = trim.height;

        bounds.minX = (trim.x) - (anchor._x * width) - padding;
        bounds.maxX = bounds.minX + sourceWidth;

        bounds.minY = (trim.y) - (anchor._y * height) - padding;
        bounds.maxY = bounds.minY + sourceHeight;
    }

    else
    {
        bounds.minX = (-anchor._x * width) - padding;
        bounds.maxX = bounds.minX + width;

        bounds.minY = (-anchor._y * height) - padding;
        bounds.maxY = bounds.minY + height;
    }

    return;
}
