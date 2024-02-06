import { AbstractText, ensureOptions } from '../text/AbstractText';
import { TextStyle } from '../text/TextStyle';
import { BitmapFontManager } from './BitmapFontManager';

import type { View } from '../../rendering/renderers/shared/view/View';
import type { TextOptions, TextString } from '../text/AbstractText';

/**
 * A Text Object will create a line or multiple lines of text.
 *
 * To split a line you can use '\n' in your text string, or, on the `style` object,
 * change its `wordWrap` property to true and and give the `wordWrapWidth` property a value.
 *
 * ### Render Mode
 * Text objects also have a `renderMode` property, which can be set to `text`, `bitmap` or `html`:
 *
 * .1 `text`: The text is created using the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).
 *
 * The primary advantage of this class over BitmapText is that you have great control over the style of the text,
 * which you can change at runtime.
 *
 *
 * The primary disadvantages is that each piece of text has it's own texture, which can use more memory.
 * When text changes, this texture has to be re-generated and re-uploaded to the GPU, taking up time.
 *
 * .2 `bitmap`: The text is created using a bitmap font.
 *
 * The primary advantage of this render mode over `text` is that all of your textures are pre-generated and loading,
 * meaning that rendering is fast, and changing text has no performance implications.
 *
 * The primary disadvantage is that supporting character sets other than latin, such as CJK languages,
 * may be impractical due to the number of characters.
 *
 * .3 `html` uses an svg foreignObject to render HTML text.
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
 *   -- Unlike `text`, `html` rendering will vary slightly between platforms and browsers.
 * `html` uses SVG/DOM to render text and not Context2D's fillText like `text`.
 *
 *   -- Performance and memory usage is on-par with `text` (that is to say, slow and heavy)
 *
 *   -- Only works with browsers that support <foreignObject>.
 * @example
 * import { Text } from 'pixi.js';
 *
 * const text = new Text({
 *     text: 'Hello Pixi!',
 *     renderMode: 'text',
 *     style: {
 *         fontFamily: 'Arial',
 *         fontSize: 24,
 *         fill: 0xff1010,
 *         align: 'center',
 *     }
 * });
 * @memberof scene
 */
export class BitmapText extends AbstractText implements View
{
    public readonly renderPipeId: string = 'bitmapText';

    constructor(options?: TextOptions);
    /** @deprecated since 8.0.0 */
    constructor(text?: TextString, options?: Partial<TextStyle>);
    constructor(...args: [TextOptions?] | [TextString, Partial<TextStyle>])
    {
        const options = ensureOptions(args, 'BitmapText');

        const style = options.style;

        style.fill ??= 0xffffff;

        super(options, TextStyle);
    }

    protected _updateBounds()
    {
        const bounds = this._bounds;
        const padding = this._style.padding;
        const anchor = this._anchor;

        const bitmapMeasurement = BitmapFontManager.measureText(this.text, this._style);
        const scale = bitmapMeasurement.scale;
        const offset = bitmapMeasurement.offsetY * scale;

        const width = bitmapMeasurement.width * scale;
        const height = bitmapMeasurement.height * scale;

        bounds.minX = (-anchor._x * width) - padding;
        bounds.maxX = bounds.minX + width;
        bounds.minY = (-anchor._y * (height + offset)) - padding;
        bounds.maxY = bounds.minY + height;
    }
}
