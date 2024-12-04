import { HTMLTextStyle } from '../../text-html/HTMLTextStyle';
import { TextStyle } from '../TextStyle';

import type { HTMLTextStyleOptions } from '../../text-html/HTMLTextStyle';
import type { TextStyleOptions } from '../TextStyle';

/**
 * converts the style input into the correct type of TextStyle
 * either HTMLTextStyle or TextStyle based on the renderMode.
 * @param renderMode - The render mode to use
 * @param style - The style to use
 * @returns - The style class
 */
export function ensureTextStyle(
    renderMode: string,
    style: TextStyle | HTMLTextStyle | TextStyleOptions | HTMLTextStyleOptions
)
{
    if (style instanceof TextStyle || style instanceof HTMLTextStyle)
    {
        return style;
    }

    return renderMode === 'html'
        ? new HTMLTextStyle(style)
        : new TextStyle(style);
}
