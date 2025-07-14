import { TextureStyle, type TextureStyleOptions } from '../../rendering/renderers/shared/texture/TextureStyle';
import { AbstractText, ensureTextOptions } from './AbstractText';
import { type BatchableText } from './canvas/BatchableText';
import { CanvasTextGenerator } from './canvas/CanvasTextGenerator';
import { CanvasTextMetrics } from './canvas/CanvasTextMetrics';
import { TextStyle } from './TextStyle';

import type { View } from '../../rendering/renderers/shared/view/View';
import type { TextOptions, TextString } from './AbstractText';
import type { TextStyleOptions } from './TextStyle';

// eslint-disable-next-line requireExport/require-export-jsdoc, requireMemberAPI/require-member-api-doc
export interface Text extends PixiMixins.Text, AbstractText<
    TextStyle,
    TextStyleOptions,
    CanvasTextOptions,
    BatchableText
> {}

/**
 * Constructor options used for `Text` instances. These options extend TextOptions with
 * canvas-specific features like texture styling.
 * @example
 * ```ts
 * // Create basic canvas text
 * const text = new Text({
 *     text: 'Hello Pixi!',
 *     style: {
 *         fontSize: 24,
 *         fill: 0xff1010,
 *     }
 * });
 *
 * // Create text with custom texture style
 * const customText = new Text({
 *     text: 'Custom Text',
 *     style: {
 *         fontSize: 32,
 *         fill: 0x4a4a4a
 *     },
 *     textureStyle: {
 *         scaleMode: 'nearest',
 *     }
 * });
 * ```
 * @extends TextOptions
 * @category text
 * @standard
 */
export interface CanvasTextOptions extends TextOptions
{
    /**
     * Optional texture style to use for the text texture. This allows fine control over
     * how the text is rendered to a texture before being displayed.
     *
     * The texture style can affect:
     * - Scale mode (nearest/linear)
     * - Resolution
     * - Format (rgb/rgba)
     * - Alpha handling
     * @example
     * ```ts
     * const text = new Text({
     *     text: 'Crisp Text',
     *     textureStyle: {
     *         scaleMode: 'nearest', // Pixel-perfect scaling
     *     }
     * });
     * ```
     * @advanced
     */
    textureStyle?: TextureStyle | TextureStyleOptions;
}

/**
 * A powerful text rendering class that creates one or multiple lines of text using the Canvas API.
 * Provides rich text styling capabilities with runtime modifications.
 *
 * Key features:
 * - Dynamic text content and styling
 * - Multi-line text support
 * - Word wrapping
 * - Custom texture styling
 * - High-quality text rendering
 * @example
 * ```ts
 * import { Text } from 'pixi.js';
 *
 * // Basic text creation
 * const basicText = new Text({
 *     text: 'Hello Pixi!',
 *     style: {
 *         fontFamily: 'Arial',
 *         fontSize: 24,
 *         fill: 0xff1010,
 *         align: 'center',
 *     }
 * });
 *
 * // Rich text with multiple styles
 * const richText = new Text({
 *     text: 'Styled\nMultiline\nText',
 *     style: {
 *         fontFamily: 'Arial',
 *         fontSize: 36,
 *         fill: 'red',
 *         stroke: { color: '#4a1850', width: 5 },
 *         align: 'center',
 *         lineHeight: 45,
 *         dropShadow: {
 *             color: '#000000',
 *             blur: 4,
 *             distance: 6,
 *         }
 *     },
 *     anchor: 0.5,
 * });
 *
 * // Text with custom texture settings
 * const crispText = new Text({
 *     text: 'High Quality Text',
 *     style: {
 *         fontSize: 24,
 *         fill: 0x4a4a4a,
 *     },
 *     textureStyle: {
 *         scaleMode: 'nearest',
 *     }
 * });
 *
 * // Word-wrapped text
 * const wrappedText = new Text({
 *     text: 'This is a long piece of text that will automatically wrap to multiple lines',
 *     style: {
 *         fontSize: 20,
 *         wordWrap: true,
 *         wordWrapWidth: 200,
 *         lineHeight: 30,
 *     }
 * });
 * ```
 *
 * Performance Considerations:
 * - Each text instance creates its own texture
 * - Texture is regenerated when text or style changes
 * - Use BitmapText for better performance with static text
 * - Consider texture style options for quality vs performance tradeoffs
 * @category text
 * @standard
 * @see {@link TextStyle} For detailed style options
 * @see {@link BitmapText} For better performance with static text
 * @see {@link HTMLText} For HTML/CSS-based text rendering
 */
export class Text
    extends AbstractText<TextStyle, TextStyleOptions, CanvasTextOptions, BatchableText>
    implements View
{
    /** @internal */
    public override readonly renderPipeId: string = 'text';

    /**
     * Optional texture style to use for the text.
     * > [!NOTE] Text is not updated when this property is updated,
     * > you must update the text manually by calling `text.onViewUpdate()`
     * @advanced
     */
    public textureStyle?: TextureStyle;

    /**
     * @param {CanvasTextOptions} options - The options of the text.
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
