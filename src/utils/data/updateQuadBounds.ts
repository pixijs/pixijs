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
    const textureSource = texture._source;

    const layout = texture.layout;

    const orig = layout.orig;
    const trim = layout.trim;

    const textureSourceWidth = textureSource.width;
    const textureSourceHeight = textureSource.height;

    const width = textureSourceWidth * orig.width;
    const height = textureSourceHeight * orig.height;

    if (trim)
    {
        const sourceWidth = textureSourceWidth * trim.width;
        const sourceHeight = textureSourceHeight * trim.height;

        bounds.left = (trim.x * textureSourceWidth) - (anchor._x * width) - padding;
        bounds.right = bounds.left + sourceWidth;

        bounds.top = (trim.y * textureSourceHeight) - (anchor._y * height) - padding;
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
