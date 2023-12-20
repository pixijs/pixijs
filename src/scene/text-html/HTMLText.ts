import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { definedProps } from '../container/utils/definedProps';
import { AbstractText } from '../text/Text';
import { HTMLTextView } from './HTMLTextView';

import type { TextOptions } from '../text/Text';
import type { TextString } from '../text/TextView';
import type { HTMLTextStyle } from './HtmlTextStyle';

/**
 * A Text object which uses an svg foreignObject to render HTML text.
 *
 * The primary advantages of this render mode are:
 *
 *  -- Supports [HTML tags](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/HTML_text_fundamentals)
 * for styling such as `<strong>`, or `<em>`, as well as `<span style="">`
 *
 *   -- Better support for emojis and other HTML layout features, better compatibility with CSS
 *     line-height and letter-spacing.
 *
 * The primary disadvantages are:
 *   -- Unlike `Text`, `HTMLText` rendering will vary slightly between platforms and browsers.
 * `HTMLText` uses SVG/DOM to render text and not Context2D's fillText like `Text`.
 *
 *   -- Performance and memory usage is on-par with `Text` (that is to say, slow and heavy)
 *
 *   -- Only works with browsers that support <foreignObject>.
 *
 * A Text Object will create a line or multiple lines of text.
 *
 * To split a line you can use '\n' in your text string, or, on the `style` object,
 * change its `wordWrap` property to true and and give the `wordWrapWidth` property a value.
 * @example
 * import { HTMLText } from 'pixi.js';
 *
 * const text = new HTMLText({
 *     text: 'Hello <b>Pixi!</b> <span style="color:red">This is red</span>',
 *     style: {
 *         fontFamily: 'Arial',
 *         fontSize: 24,
 *         fill: 0xff1010,
 *         align: 'center',
 *     }
 * });
 */
export class HTMLText extends AbstractText
{
    constructor(options: TextOptions);
    /** @deprecated since 8.0.0 */
    constructor(text: TextString, options?: Partial<HTMLTextStyle>);
    constructor(...args: [TextOptions] | [TextString, Partial<HTMLTextStyle>])
    {
        let options: TextOptions = args[0] as TextOptions;

        // @deprecated
        if (typeof options === 'string' || args[1])
        {
            deprecation(v8_0_0, 'use new HTMLText({ text: "hi!", style }) instead');
            options = {
                text: options,
                style: args[1],
            } as TextOptions;
        }

        const { style, text, resolution } = options as TextOptions;

        super(new HTMLTextView(definedProps({ style, text, resolution })), options);
    }
}
