import { Rectangle } from '../../../../maths/shapes/Rectangle';

import type { TextureSource } from '../texture/sources/TextureSource';

const fullFrame = new Rectangle(0, 0, 1, 1);

/**
 * Takes a Texture source and a normalised frame
 * and returns a viewport for that frame.
 * @param viewport - The viewport rectangle to set.
 * @param source - The source to get the pixel width and height from.
 * @param frame - The frame to get the viewport from.
 * @returns the passed in viewport.
 */
export function viewportFromFrame(
    viewport: Rectangle,
    source: TextureSource,
    frame?: Rectangle
)
{
    frame ||= fullFrame;

    const pixelWidth = source.pixelWidth;
    const pixelHeight = source.pixelHeight;

    viewport.x = (frame.x * pixelWidth) | 0;
    viewport.y = (frame.y * pixelHeight) | 0;
    viewport.width = (frame.width * pixelWidth) | 0;
    viewport.height = (frame.height * pixelHeight) | 0;

    return viewport;
}
