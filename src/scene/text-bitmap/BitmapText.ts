import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { definedProps } from '../container/utils/definedProps';
import { AbstractText } from '../text/Text';
import { BitmapTextView } from './BitmapTextView';

import type { TextOptions } from '../text/Text';
import type { TextStyle } from '../text/TextStyle';
import type { TextString } from '../text/TextView';

/**
 * A Text object which uses a bitmap font to render text.
 *
 * The primary advantage of this render mode over `Text` is that all of your textures are pre-generated and loading,
 * meaning that rendering is fast, and changing text has no performance implications.
 *
 * The primary disadvantage is that supporting character sets other than latin, such as CJK languages,
 * may be impractical due to the number of characters.
 *
 * A Text Object will create a line or multiple lines of text.
 *
 * To split a line you can use '\n' in your text string, or, on the `style` object,
 * change its `wordWrap` property to true and and give the `wordWrapWidth` property a value.
 * @example
 * import { BitmapText, Assets } from 'pixi.js';
 *
 * await Assets.load('fonts/cool-font.fnt');
 *
 * const text = new BitmapText({
 *     text: 'Hello Pixi!',
 *     style: {
 *         fontFamily: 'cool-font',
 *         fontSize: 24,
 *         fill: 0xff1010,
 *         align: 'center',
 *     }
 * });
 * @memberof scene
 */
export class BitmapText extends AbstractText
{
    constructor(options: TextOptions);
    /** @deprecated since 8.0.0 */
    constructor(text: TextString, options?: Partial<TextStyle>);
    constructor(...args: [TextOptions] | [TextString, Partial<TextStyle>])
    {
        let options: TextOptions = args[0] as TextOptions;

        // @deprecated
        if (typeof options === 'string' || args[1])
        {
            deprecation(v8_0_0, 'use new BitmapText({ text: "hi!", style }) instead');
            options = {
                text: options,
                style: args[1],
            } as TextOptions;
        }

        const { style, text, resolution } = options as TextOptions;

        super(new BitmapTextView(definedProps({ style, text, resolution })), options);
    }
}
