import type { ObservablePoint } from '../maths/ObservablePoint';
import type { Texture } from '../rendering/renderers/shared/texture/Texture';

export function updateQuadBounds(bounds: [number, number, number, number], anchor: ObservablePoint, texture: Texture)
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

        bounds[1] = (trim.x * textureSourceWidth) - (anchor._x * width);
        bounds[0] = bounds[1] + sourceWidth;

        bounds[3] = (trim.y * textureSourceHeight) - (anchor._y * height);
        bounds[2] = bounds[3] + sourceHeight;
    }

    else
    {
        bounds[1] = -anchor._x * width;
        bounds[0] = bounds[1] + width;

        bounds[3] = -anchor._y * height;
        bounds[2] = bounds[3] + height;
    }

    return;
}
