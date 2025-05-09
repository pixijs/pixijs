import { TextureStyle, type TextureStyleOptions } from '../../rendering/renderers/shared/texture/TextureStyle';
import { AbstractText, ensureTextOptions } from './AbstractText';
import { type BatchableText } from './canvas/BatchableText';
import { CanvasTextMetrics } from './canvas/CanvasTextMetrics';
import { TextStyle } from './TextStyle';

import type { View } from '../../rendering/renderers/shared/view/View';
import type { TextOptions, TextString } from './AbstractText';
import type { TextStyleOptions } from './TextStyle';

export interface Text extends PixiMixins.Text, AbstractText<
    TextStyle,
    TextStyleOptions,
    CanvasTextOptions,
    BatchableText
> {}

/**
 * Constructor options used for `Text` instances.
 * @memberof scene
 */
export interface CanvasTextOptions extends TextOptions
{
    /** optional texture style to use for the text. */
    textureStyle?: TextureStyle | TextureStyleOptions;
}

/**
 * A Text Object will create a line or multiple lines of text.
 *
 * To split a line you can use '\n' in your text string, or, on the `style` object,
 * change its `wordWrap` property to true and and givae the `wordWrapWidth` property a value.
 *
 * The primary advantage of this class over BitmapText is that you have great control over the style of the text,
 * which you can change at runtime.
 *
 * The primary disadvantages is that each piece of text has it's own texture, which can use more memory.
 * When text changes, this texture has to be re-generated and re-uploaded to the GPU, taking up time.
 * @example
 * import { Text } from 'pixi.js';
 *
 * const text = new Text({
 *     text: 'Hello Pixi!',
 *     style: {
 *         fontFamily: 'Arial',
 *         fontSize: 24,
 *         fill: 0xff1010,
 *         align: 'center',
 *     }
 * });
 *
 * If you would like to use a different texture style for the text, you can do so by passing a `textureStyle` object.
 * An example might be to use a different scale mode for the text.
 * @example
 * const text = new Text({
 *     text: 'Hello Pixi!',
 *     style: {
 *         fontFamily: 'Arial',
 *         fontSize: 24,
 *         fill: 0xff1010,
 *         align: 'center',
 *     },
 *     textureStyle: {
 *         scaleMode: 'nearest',
 *     }
 * });
 * @memberof scene
 */
export class Text
    extends AbstractText<TextStyle, TextStyleOptions, CanvasTextOptions, BatchableText>
    implements View
{
    public override readonly renderPipeId: string = 'text';

    /**
     * optional texture style to use for the text.
     * NOTE: Text is not updated when this property is updated,
     * you must update the text manually by calling `text.onViewUpdate()`
     */
    public textureStyle?: TextureStyle;

    /**
     * @param {text.CanvasTextOptions} options - The options of the text.
     */
    constructor(options?: CanvasTextOptions);
    /** @deprecated since 8.0.0 */
    constructor(text?: TextString, options?: Partial<TextStyle>);
    constructor(...args: [CanvasTextOptions?] | [TextString, Partial<TextStyle>])
    {
        const options = ensureTextOptions<CanvasTextOptions>(args, 'Text');

        super(options, TextStyle);

        if (options.textureStyle)
        {
            this.textureStyle = options.textureStyle instanceof TextureStyle
                ? options.textureStyle
                : new TextureStyle(options.textureStyle);
        }
    }

    /** @private */
    protected updateBounds()
    {
        const bounds = this._bounds;
        const anchor = this._anchor;

        const canvasMeasurement = CanvasTextMetrics.measureText(
            this._text,
            this._style
        );

        const { width, height } = canvasMeasurement;

        bounds.minX = (-anchor._x * width);
        bounds.maxX = bounds.minX + width;
        bounds.minY = (-anchor._y * height);
        bounds.maxY = bounds.minY + height;
    }
}
