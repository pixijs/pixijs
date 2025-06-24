import { warn } from '../../utils/logging/warn';
import { AbstractText, ensureTextOptions } from '../text/AbstractText';
import { TextStyle } from '../text/TextStyle';
import {
    type InstancedTextSplitConfig,
    type RawTextSplitConfig,
    type TextSplitConfig,
    type TextSplitResult
} from '../text/utils/text-split/sharedTextSplit';
import { BitmapFontManager } from './BitmapFontManager';
import { type BitmapTextGraphics } from './BitmapTextPipe';

import type { View } from '../../rendering/renderers/shared/view/View';
import type { TextOptions, TextString } from '../text/AbstractText';
import type { TextStyleOptions } from '../text/TextStyle';

// eslint-disable-next-line requireExport/require-export-jsdoc, requireMemberAPI/require-member-api-doc
export interface BitmapText extends PixiMixins.BitmapText, AbstractText<
    TextStyle,
    TextStyleOptions,
    TextOptions,
    BitmapTextGraphics
> {}

/**
 * A BitmapText object creates text using pre-rendered bitmap fonts.
 * It supports both loaded bitmap fonts (XML/FNT) and dynamically generated ones.
 *
 * To split a line you can use '\n' in your text string, or use the `wordWrap` and
 * `wordWrapWidth` style properties.
 *
 * Key Features:
 * - High-performance text rendering using pre-generated textures
 * - Support for both pre-loaded and dynamic bitmap fonts
 * - Compatible with MSDF/SDF fonts for crisp scaling
 * - Automatic font reuse and optimization
 *
 * Performance Benefits:
 * - Faster rendering compared to Canvas/HTML text
 * - Lower memory usage for repeated characters
 * - More efficient text changes
 * - Better batching capabilities
 *
 * Limitations:
 * - Full character set support is impractical due to the number of chars (mainly affects CJK languages)
 * - Initial font generation/loading overhead
 * - Less flexible styling compared to Canvas/HTML text
 * @example
 * ```ts
 * import { BitmapText, BitmapFont } from 'pixi.js';
 *
 * // Dynamic font generation
 * const dynamicText = new BitmapText({
 *     text: 'Hello Pixi!',
 *     style: {
 *         fontFamily: 'Arial',
 *         fontSize: 24,
 *         fill: 0xff1010,
 *         align: 'center',
 *     }
 * });
 *
 * // Pre-installed font usage
 * BitmapFont.install({
 *    name: 'myFont',
 *    style: {
 *        fontFamily: 'Arial',
 *    }
 * });
 *
 * const preinstalledText = new BitmapText({
 *     text: 'Hello Pixi!',
 *     style: {
 *        fontFamily: 'myFont',
 *        fontSize: 24,
 *        fill: 0xff1010,
 *        align: 'center',
 *     }
 * });
 *
 * // Load and use external bitmap font, if the font supports MSDF/SDF then it will be used
 * const font = await Assets.load('fonts/myFont.fnt');
 *
 * const loadedFontText = new BitmapText({
 *     text: 'Hello Pixi!',
 *     style: {
 *        fontFamily: 'myLoadedFont', // Name from .fnt file
 *        fontSize: 24,
 *        fill: 0xff1010,
 *        align: 'center',
 *     }
 * });
 *
 * // Multiline text with word wrap
 * const wrappedText = new BitmapText({
 *     text: 'This is a long text that will wrap automatically',
 *     style: {
 *         fontFamily: 'Arial',
 *         fontSize: 24,
 *         wordWrap: true,
 *         wordWrapWidth: 200,
 *     }
 * });
 * ```
 *
 * Font Types:
 * 1. Pre-loaded Bitmap Fonts:
 *    - Load via Asset Manager (XML/FNT formats)
 *    - Support for MSDF/SDF fonts
 *    - Create using tools like https://msdf-bmfont.donmccurdy.com/
 *
 * 2. Dynamic Bitmap Fonts:
 *    - Generated at runtime from system fonts
 *    - Automatic font reuse and optimization
 *    - Smart scaling for similar font sizes
 *
 * Font Management:
 * - Automatic font generation when needed
 * - Manual pre-installation via `BitmapFont.install`
 * - Smart font reuse to optimize memory
 * - Scale existing fonts instead of generating new ones when possible
 * @category text
 * @standard
 * @see {@link BitmapFont} For font installation and management
 * @see {@link Text} For canvas-based text rendering
 * @see {@link HTMLText} For HTML/CSS-based text rendering
 */
export class BitmapText extends AbstractText<
    TextStyle,
    TextStyleOptions,
    TextOptions,
    BitmapTextGraphics
> implements View
{
    /** @internal */
    public override readonly renderPipeId: string = 'bitmapText';

    /**
     * **Note:** Our docs parser struggles to properly understand the constructor signature.
     * This is the correct signature.
     * ```ts
     * new BitmapText(options?: TextOptions);
     * ```
     * @param { TextOptions } options - The options of the bitmap text.
     */
    constructor(options?: TextOptions);
    /** @deprecated since 8.0.0 */
    constructor(text?: TextString, options?: Partial<TextStyle>);
    constructor(...args: [TextOptions?] | [TextString, Partial<TextStyle>])
    {
        const options = ensureTextOptions(args, 'BitmapText');

        options.style ??= options.style || {};
        options.style.fill ??= 0xffffff;

        super(options, TextStyle);
    }

    /** @private */
    protected updateBounds()
    {
        const bounds = this._bounds;
        const anchor = this._anchor;

        const bitmapMeasurement = BitmapFontManager.measureText(this.text, this._style);
        const scale = bitmapMeasurement.scale;
        const offset = bitmapMeasurement.offsetY * scale;

        let width = bitmapMeasurement.width * scale;
        let height = bitmapMeasurement.height * scale;

        const stroke = this._style._stroke;

        if (stroke)
        {
            width += stroke.width;
            height += stroke.width;
        }

        bounds.minX = (-anchor._x * width);
        bounds.maxX = bounds.minX + width;
        bounds.minY = (-anchor._y * (height + offset));
        bounds.maxY = bounds.minY + height;
    }

    /**
     * The resolution / device pixel ratio for text rendering.
     * Unlike other text types, BitmapText resolution is managed by the BitmapFont.
     * Individual resolution changes are not supported.
     * @example
     * ```ts
     * // ❌ Incorrect: Setting resolution directly (will trigger warning)
     * const text = new BitmapText({
     *     text: 'Hello',
     *     resolution: 2 // This will be ignored
     * });
     *
     * // ✅ Correct: Set resolution when installing the font
     * BitmapFont.install({
     *     name: 'MyFont',
     *     style: {
     *         fontFamily: 'Arial',
     *     },
     *     resolution: 2 // Resolution is set here
     * });
     *
     * const text = new BitmapText({
     *     text: 'Hello',
     *     style: {
     *         fontFamily: 'MyFont' // Uses font's resolution
     *     }
     * });
     * ```
     * @default 1
     * @see {@link BitmapFont.install} For setting font resolution
     * @throws {Warning} When attempting to change resolution directly
     * @readonly
     */
    override set resolution(value: number)
    {
        // #if _DEBUG
        if (value !== null)
        {
            warn(
            // eslint-disable-next-line max-len
                '[BitmapText] dynamically updating the resolution is not supported. Resolution should be managed by the BitmapFont.'
            );
        }
        // #endif
    }

    override get resolution(): number
    {
        return this._resolution;
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
     * - Character Objects (BitmapText instances)
     * @param text - Can be one of:
     *   - BitmapText instance to split
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
     * const text = new BitmapText({ text: "Hello World" });
     * const result = BitmapText.split(text);
     * ```
     * @example Custom Configuration
     * ```ts
     * // Split with specific options
     * const result = BitmapText.split({
     *   text: myText,
     *   replace: true,   // Replace original in scene graph
     *   anchor: { x: 0.5, y: 0.5 } // Center anchor point
     * });
     * ```
     * @example Raw Text Splitting
     * ```ts
     * // Split raw text with style
     * const result = BitmapText.split({
     *   string: "Hello\nWorld",
     *   style: {
     *     fontSize: 24,
     *     fill: 0xff0000
     *   },
     * });
     * ```
     * @example Working with Results
     * ```ts
     * const result = BitmapText.split(myText);
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
    public static split(text: BitmapText): TextSplitResult<BitmapText>;
    /**
     * @param config - Text instance or configuration options
     * @returns {TextSplitResult} Object containing split text elements and container
     */
    public static split(config: InstancedTextSplitConfig<BitmapText>): TextSplitResult<BitmapText>;
    /**
     * @param config - configuration options
     * @returns {TextSplitResult} Object containing split text elements and container
     */
    public static split(config: RawTextSplitConfig): TextSplitResult<BitmapText>;
    public static split(_text: BitmapText | TextSplitConfig<BitmapText>): TextSplitResult<BitmapText>
    {
        // Implementation will be assigned later to avoid circular dependencies
        // see `src/scene/text-bitmap/utils/bitmapTextSplit.ts`
        throw new Error('Not implemented');
    }
}
