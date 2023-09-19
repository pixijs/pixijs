import type { ObservablePoint } from '../maths/ObservablePoint';
import type { Texture } from '../rendering/renderers/shared/texture/Texture';

export function updateQuadBounds(
    bounds: [number, number, number, number],
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

        bounds[0] = (trim.x * textureSourceWidth) - (anchor._x * width) - padding;
        bounds[1] = bounds[0] + sourceWidth;

        bounds[2] = (trim.y * textureSourceHeight) - (anchor._y * height) - padding;
        bounds[3] = bounds[2] + sourceHeight;
    }

    else
    {
        bounds[0] = (-anchor._x * width) - padding;
        bounds[1] = bounds[0] + width;

        bounds[2] = (-anchor._y * height) - padding;
        bounds[3] = bounds[2] + height;
    }

    return;
}
