import { AbstractText, ensureTextOptions } from './AbstractText';
import { type BatchableText } from './canvas/BatchableText';
import { CanvasTextGenerator } from './canvas/CanvasTextGenerator';
import { CanvasTextMetrics } from './canvas/CanvasTextMetrics';
import { TextStyle } from './TextStyle';

import type { View } from '../../rendering/renderers/shared/view/View';
import type { TextOptions, TextString } from './AbstractText';
import type { TextStyleOptions } from './TextStyle';

export interface Text extends PixiMixins.Text, AbstractText<TextStyle, TextStyleOptions, BatchableText> {}

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
 * @memberof scene
 */
export class Text
    extends AbstractText<TextStyle, TextStyleOptions, BatchableText>
    implements View
{
    public override readonly renderPipeId: string = 'text';

    /**
     * @param {text.TextOptions} options - The options of the text.
     */
    constructor(options?: TextOptions);
    /** @deprecated since 8.0.0 */
    constructor(text?: TextString, options?: Partial<TextStyle>);
    constructor(...args: [TextOptions?] | [TextString, Partial<TextStyle>])
    {
        const options = ensureTextOptions(args, 'Text');

        super(options, TextStyle);
    }

    /** @private */
    protected updateBounds()
    {
        const bounds = this._bounds;
        const anchor = this._anchor;

        let width = 0;
        let height = 0;

        if (this._style.trim)
        {
            const { frame, canvasAndContext } = CanvasTextGenerator.getCanvasAndContext({
                text: this.text,
                style: this._style,
                resolution: 1,
            });

            CanvasTextGenerator.returnCanvasAndContext(canvasAndContext);

            width = frame.width;
            height = frame.height;
        }
        else
        {
            const canvasMeasurement = CanvasTextMetrics.measureText(
                this._text,
                this._style
            );

            width = canvasMeasurement.width;
            height = canvasMeasurement.height;
        }

        bounds.minX = (-anchor._x * width);
        bounds.maxX = bounds.minX + width;
        bounds.minY = (-anchor._y * height);
        bounds.maxY = bounds.minY + height;
    }
}
