import type { ObservablePoint } from '../../maths/point/ObservablePoint';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { SimpleBounds } from '../../scene/container/bounds/Bounds';

export function updateQuadBounds(
    bounds: SimpleBounds,
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

        bounds.left = (trim.x) - (anchor._x * width) - padding;
        bounds.right = bounds.left + sourceWidth;

        bounds.top = (trim.y) - (anchor._y * height) - padding;
        bounds.bottom = bounds.top + sourceHeight;
    }

    else
    {
        bounds.left = (-anchor._x * width) - padding;
        bounds.right = bounds.left + width;

        bounds.top = (-anchor._y * height) - padding;
        bounds.bottom = bounds.top + height;
    }

    return;
}
