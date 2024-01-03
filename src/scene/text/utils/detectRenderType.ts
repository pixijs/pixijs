import { Cache } from '../../../assets/cache/Cache';
import { BitmapFont } from '../../text-bitmap/BitmapFont';
import { DynamicBitmapFont } from '../../text-bitmap/DynamicBitmapFont';
import { HTMLTextStyle } from '../../text-html/HtmlTextStyle';

import type { AnyTextStyle } from '../Text';
import type { TextStyleOptions } from '../TextStyle';

/**
 * Takes a text style and returns the recommended renderMode for that style.
 * This is used internally by the Text class to work out whether the text should
 * be rendered using a Canvas / Bitmap or HTML Text pipeline.
 * @param style - the style to check
 * @returns the renderMode to use
 */
export function detectRenderType(style: TextStyleOptions | AnyTextStyle): 'canvas' | 'html' | 'bitmap'
{
    if (style instanceof HTMLTextStyle)
    {
        return 'html';
    }

    const name = `${style?.fontFamily as string}-bitmap`;

    if (!Cache.has(name))
    {
        return 'canvas';
    }

    const fontData = Cache.get(name);

    if (fontData instanceof DynamicBitmapFont || fontData instanceof BitmapFont)
    {
        return 'bitmap';
    }

    return 'canvas';
}
