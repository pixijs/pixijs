import { TextureStyle, type TextureStyleOptions } from '../../rendering/renderers/shared/texture/TextureStyle';
import { AbstractText, ensureTextOptions } from './AbstractText';
import { type BatchableText } from './canvas/BatchableText';
import { CanvasTextGenerator } from './canvas/CanvasTextGenerator';
import { CanvasTextMetrics } from './canvas/CanvasTextMetrics';
import { TextStyle } from './TextStyle';
import {
    type InstancedTextSplitConfig,
    type RawTextSplitConfig,
    type TextSplitConfig,
    type TextSplitResult
} from './utils/text-split/sharedTextSplit';

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
 *         resolution: 2
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
     *         format: 'rgba',       // Include alpha channel
     *         resolution: 2,        // Higher resolution
     *         premultiplyAlpha: true
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
 *         resolution: 2,
 *         format: 'rgba',
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

    /**
     * @experimental
     * Creates a hierarchical text split with full layout and style preservation.
     * This factory function handles the complete text splitting process including
     * property inheritance, transform management, and scene graph integration.
     *
     * Features:
     * - Splits text into characters, words, and lines while maintaining original layout
     * - Preserves all text styling and transforms from the source
     * - Handles both instance-based and raw text splitting
     * - Supports automatic replacement in the display tree
     * - Maintains anchor points and pivot transformations
     * - Preserves visual properties (tint, alpha, blendMode, visibility)
     *
     * Split Hierarchy:
     * - Container (root)
     * - Line Containers
     * - Word Containers
     * - Character Objects (Text instances)
     * @param text - Can be one of:
     *   - Text instance to split
     *   - InstancedTextSplitConfig for configured splitting
     *   - RawTextSplitConfig for splitting plain text with style
     * @returns {TextSplitResult} Object containing:
     *   - container: Root Container holding all split elements
     *   - chars: Array of individual character objects
     *   - words: Array of word containers
     *   - lines: Array of line containers
     * @example Basic Usage
     * ```ts
     * // Split an existing text instance
     * const text = new Text({ text: "Hello World" });
     * const result = Text.split(text);
     * ```
     * @example Custom Configuration
     * ```ts
     * // Split with specific options
     * const result = Text.split({
     *   text: myText,
     *   replace: true,   // Replace original in scene graph
     *   anchor: { x: 0.5, y: 0.5 } // Center anchor point
     * });
     * ```
     * @example Raw Text Splitting
     * ```ts
     * // Split raw text with style
     * const result = Text.split({
     *   string: "Hello\nWorld",
     *   style: {
     *     fontSize: 24,
     *     fill: 0xff0000
     *   },
     * });
     * ```
     * @example Working with Results
     * ```ts
     * const result = Text.split(myText);
     *
     * // Animate characters
     * result.chars.forEach((char, i) => {
     *   char.alpha = 0;
     *   // Fade in each character sequentially
     *   gsap.to(char, {
     *     alpha: 1,
     *     delay: i * 0.1
     *   });
     * });
     *
     * // Manipulate words
     * result.words.forEach((word, i) => {
     *   // Scale words up and down
     *   gsap.to(word.scale, {
     *     x: 1.2, y: 1.2,
     *     yoyo: true,
     *     repeat: -1,
     *     delay: i * 0.2
     *   });
     * });
     *
     * // Animate lines
     * result.lines.forEach((line, i) => {
     *   line.x = -200;
     *   // Slide in each line
     *   gsap.to(line, {
     *     x: 0,
     *     delay: i * 0.3
     *   });
     * });
     * ```
     *
     * Default Behavior:
     * - Replaces original text in scene (replace: true)
     * - Uses 0,0 anchor point (anchor: 0)
     * @standard
     */
    public static split(text: Text): TextSplitResult<Text>;
    /**
     * @param config - Text instance or configuration options
     * @returns {TextSplitResult} Object containing split text elements and container
     */
    public static split(config: InstancedTextSplitConfig<Text>): TextSplitResult<Text>;
    /**
     * @param config - configuration options
     * @returns {TextSplitResult} Object containing split text elements and container
     */
    public static split(config: RawTextSplitConfig): TextSplitResult<Text>;
    public static split(_text: Text | TextSplitConfig<Text>): TextSplitResult<Text>
    {
        // Implementation will be assigned later to avoid circular dependencies
        // see `src/scene/text-bitmap/utils/bitmapTextSplit.ts`
        throw new Error('Not implemented');
    }
}
