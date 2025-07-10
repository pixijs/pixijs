import { type ContainerOptions } from '../container/Container';
import { type Text } from '../text/Text';
import { TextStyle } from '../text/TextStyle';
import { canvasTextSplit } from '../text/utils/canvasTextSplit';
import { type AbstractSplitOptions, AbstractSplitText } from './AbstractSplitText';
import { type TextSplitOutput } from './types';

/**
 * Configuration options for Text splitting.
 * @category text
 * @standard
 * @interface
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SplitOptions extends AbstractSplitOptions {}

/**
 * Configuration options for SplitText, combining container properties with text splitting settings.
 * @example Basic Usage
 * ```ts
 * const options: SplitTextOptions = {
 *   text: 'Hello World',
 *   style: { fontSize: 32, fill: 0xffffff },
 *   // Transform origins
 *   lineAnchor: 0.5,                // Center each line
 *   wordAnchor: { x: 0, y: 0.5 },  // Left-center each word
 *   charAnchor: { x: 0.5, y: 1 },  // Bottom-center each char
 * };
 * ```
 * @example Advanced Configuration
 * ```ts
 * const options: SplitTextOptions = {
 *   // Text content and style
 *   text: 'Multi\nLine Text',
 *   style: new TextStyle({
 *     fontSize: 24,
 *     fill: ['#FF0000', '#00FF00'], // Gradient
 *     strokeThickness: 2,
 *   }),
 *
 *   // Container properties
 *   x: 100,
 *   y: 100,
 *   alpha: 0.8,
 *
 *   // Splitting settings
 *   autoSplit: true,
 *
 *   // Transform origins (normalized 0-1)
 *   lineAnchor: { x: 1, y: 0 },    // Top-right
 *   wordAnchor: 0.5,               // Center
 *   charAnchor: { x: 0, y: 1 },    // Bottom-left
 * };
 * ```
 *
 * Properties:
 * - Container options from {@link ContainerOptions}
 * - Text splitting options from {@link SplitOptions}
 * - Additional PixiJS-specific options from PixiMixins.SplitText
 * @see {@link SplitText} For the main implementation
 * @see {@link ContainerOptions} For base container properties
 * @see {@link SplitOptions} For text splitting options
 * @category text
 * @standard
 */
export interface SplitTextOptions extends PixiMixins.SplitText, ContainerOptions, SplitOptions {}

/**
 * @experimental
 * A container that splits text into individually manipulatable segments (lines, words, and characters)
 * for advanced text effects and animations.
 * Converts each segment into a separate Text object.
 * @example Basic Usage
 * ```ts
 * const text = new SplitText({
 *   text: "Hello World",
 *   style: { fontSize: 24 },
 *   // Origin points for transformations (0-1 range)
 *   lineAnchor: 0.5,  // Center of each line
 *   wordAnchor: { x: 0, y: 0.5 },  // Left-center of each word
 *   charAnchor: { x: 0.5, y: 1 },  // Bottom-center of each character
 *   autoSplit: true  // Auto-update segments on text/style changes
 * });
 * ```
 *
 * Features:
 * - Hierarchical text segmentation (lines → words → characters)
 * - Independent transformation origins for each segment level
 * - Automatic or manual segment updates
 * @example Animation Example
 * ```ts
 * // Character fade-in sequence
 * text.chars.forEach((char, i) => {
 *   gsap.from(char, {
 *     alpha: 0,
 *     delay: i * 0.1
 *   });
 * });
 *
 * // Word scale animation
 * text.words.forEach((word, i) => {
 *   gsap.to(word.scale, {
 *     x: 1.2, y: 1.2,
 *     yoyo: true,
 *     repeat: -1,
 *     delay: i * 0.2
 *   });
 * });
 *
 * // Line slide-in effect
 * text.lines.forEach((line, i) => {
 *   gsap.from(line, {
 *     x: -200,
 *     delay: i * 0.3
 *   });
 * });
 * ```
 *
 * Configuration Options:
 * - `text`: The string to render and segment
 * - `style`: TextStyle instance or configuration object
 * - `autoSplit`: Automatically update segments on changes (default: true)
 * - `lineAnchor`: Transform origin for lines (default: 0)
 * - `wordAnchor`: Transform origin for words (default: 0)
 * - `charAnchor`: Transform origin for characters (default: 0)
 *
 * > [!NOTE] Anchor points are normalized (0-1):
 * > - 0,0: Top-left
 * > - 0.5,0.5: Center
 * > - 1,1: Bottom-right
 *
 * > [!WARNING] Limitations
 * > - Character spacing may differ slightly from standard text due to browser
 * >   kerning being lost when characters are separated
 * @category text
 * @standard
 */
export class SplitText extends AbstractSplitText<Text>
{
    /**
     * Default configuration options for SplitText instances.
     * @example
     * ```ts
     * // Override defaults globally
     * SplitText.defaultOptions = {
     *   autoSplit: false,
     *   lineAnchor: 0.5,  // Center alignment
     *   wordAnchor: { x: 0, y: 0.5 },  // Left-center
     *   charAnchor: { x: 0.5, y: 1 }   // Bottom-center
     * };
     * ```
     */
    public static defaultOptions: Partial<SplitTextOptions> = {
        autoSplit: true, // Auto-update on text/style changes
        lineAnchor: 0, // Top-left alignment
        wordAnchor: 0, // Top-left alignment
        charAnchor: 0, // Top-left alignment
    } as Partial<SplitTextOptions>;

    constructor(config: SplitTextOptions)
    {
        const completeOptions: SplitTextOptions = {
            ...SplitText.defaultOptions,
            ...config,
        };

        super(completeOptions);
    }

    /**
     * Creates a SplitText instance from an existing text object.
     * Useful for converting standard Text or Text objects into segmented versions.
     * @param text - The source text object to convert
     * @param options - Additional splitting options
     * @returns A new SplitText instance
     * @example
     * ```ts
     * const text = new Text({
     *   text: 'Bitmap Text',
     *   style: { fontFamily: 'Arial' }
     * });
     *
     * const segmented = SplitText.from(text);
     *
     * // with additional options
     * const segmentedWithOptions = SplitText.from(text, {
     *   autoSplit: false,
     *   lineAnchor: 0.5,
     *   wordAnchor: { x: 0, y: 0.5 },
     * })
     * ```
     */
    public static from(text: Text, options?: Omit<SplitTextOptions, 'text' | 'style'>): SplitText
    {
        const completeOptions: SplitTextOptions = {
            ...SplitText.defaultOptions,
            ...options,
            text: text.text,
            style: new TextStyle(text.style),
        };

        return new SplitText({
            ...completeOptions,
        });
    }

    protected splitFn(): TextSplitOutput<Text>
    {
        return canvasTextSplit({
            text: this._originalText,
            style: this._style,
            chars: this._canReuseChars ? this.chars : [],
        });
    }
}
