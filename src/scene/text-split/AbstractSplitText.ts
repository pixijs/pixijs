import { type PointData } from '../../maths/point/PointData';
import { Container, type ContainerOptions } from '../container/Container';
import { type DestroyOptions } from '../container/destroyTypes';
import { TextStyle, type TextStyleOptions } from '../text/TextStyle';
import { type SplitableTextObject, type TextSplitOutput } from './types';

/**
 * Configuration options for text splitting.
 * @category text
 * @standard
 */
export interface AbstractSplitOptions
{
    /** Text content to be split */
    text: string;

    /** Text styling - accepts TextStyle instance or style object */
    style: TextStyle | Partial<TextStyleOptions>;

    /**
     * Enables automatic splitting on text/style changes
     * @default true
     */
    autoSplit?: boolean;

    /**
     * Transform origin for line segments. Range: [0-1]
     * @example
     * ```ts
     * lineAnchor: 0.5        // Center horizontally and vertically
     * lineAnchor: { x: 0, y: 0.5 }  // Left-center alignment
     *
     * ```
     * @default 0
     */
    lineAnchor?: number | PointData;

    /**
     * Transform origin for word segments. Range: [0-1]
     * @example
     * ```ts
     * wordAnchor: { x: 1, y: 0 }  // Top-right alignment
     * wordAnchor: 0.5  // Center alignment
     * ```
     * @default 0
     */
    wordAnchor?: number | PointData;

    /**
     * Transform origin for character segments. Range: [0-1]
     * @example
     * ```ts
     * charAnchor: { x: 0.5, y: 1 }  // Bottom-center alignment
     * charAnchor: 0.5  // Center alignment
     * ```
     * @default 0
     */
    charAnchor?: number | PointData;
}

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
 * - Text split options from {@link AbstractSplitOptions}
 * @see {@link AbstractSplitText} For the main implementation
 * @see {@link ContainerOptions} For base container properties
 * @see {@link AbstractSplitOptions} For text splitting options
 * @category text
 * @standard
 */
export interface AbstractSplitTextOptions extends ContainerOptions, AbstractSplitOptions {}

/**
 * @experimental
 * A container that splits text into individually manipulatable segments (lines, words, and characters)
 * for advanced text effects and animations.
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
 * - Hierarchical text splitting (lines → words → characters)
 * - Independent transformation origins for each segment level
 * - Automatic or manual segment updates
 * - Support for both canvas text and bitmap text
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
export abstract class AbstractSplitText<T extends SplitableTextObject> extends Container
{
    /**
     * Individual character segments of the text.
     * @example
     * ```ts
     * // Fade in characters sequentially
     * text.chars.forEach((char, i) => {
     *   char.alpha = 0;
     *   gsap.to(char, {
     *     alpha: 1,
     *     delay: i * 0.1
     *   });
     * });
     * ```
     */
    public chars: T[];

    /**
     * Word segments of the text, each containing one or more characters.
     * @example
     * ```ts
     * // Scale words on hover
     * text.words.forEach(word => {
     *   word.interactive = true;
     *   word.on('pointerover', () => {
     *     gsap.to(word.scale, { x: 1.2, y: 1.2 });
     *   });
     *   word.on('pointerout', () => {
     *     gsap.to(word.scale, { x: 1, y: 1 });
     *   });
     * });
     * ```
     */
    public words: Container[];

    /**
     * Line segments of the text, each containing one or more words.
     * @example
     * ```ts
     * // Stagger line entrance animations
     * text.lines.forEach((line, i) => {
     *   line.x = -200;
     *   gsap.to(line, {
     *     x: 0,
     *     duration: 0.5,
     *     delay: i * 0.2,
     *     ease: 'back.out'
     *   });
     * });
     * ```
     */
    public lines: Container[];

    protected _originalText: string;
    protected _lineAnchor: number | PointData;
    protected _wordAnchor: number | PointData;
    protected _charAnchor: number | PointData;
    protected _autoSplit: boolean;
    protected _style: TextStyle;

    protected _dirty: boolean = false;
    protected _canReuseChars: boolean = false;

    constructor(config: AbstractSplitTextOptions)
    {
        const {
            text,
            style,
            autoSplit,
            lineAnchor,
            wordAnchor,
            charAnchor,
            ...options
        } = config;

        super(options);
        this.chars = [];
        this.words = [];
        this.lines = [];

        this._originalText = text;
        this._autoSplit = autoSplit;
        this._lineAnchor = lineAnchor;
        this._wordAnchor = wordAnchor;
        this._charAnchor = charAnchor;

        // setting the style will segment the text if autoSplit is true
        this.style = style;
    }

    protected abstract splitFn(): TextSplitOutput<T>;

    /**
     * Splits the text into lines, words, and characters.
     * Call this manually when autoSplit is false.
     * @example Manual Splitting
     * ```ts
     * const text = new SplitText({
     *   text: 'Manual Update',
     *   autoSplit: false
     * });
     *
     * text.text = 'New Content';
     * text.style = { fontSize: 32 };
     * text.split(); // Apply changes
     * ```
     */
    public split(): void
    {
        const res: TextSplitOutput<T> = this.splitFn();

        this.chars = res.chars;
        this.words = res.words;
        this.lines = res.lines;

        this.addChild(...this.lines);

        // force origin to be set
        this.charAnchor = this._charAnchor;
        this.wordAnchor = this._wordAnchor;
        this.lineAnchor = this._lineAnchor;

        this._dirty = false;
        this._canReuseChars = true;
    }

    get text(): string
    {
        return this._originalText;
    }
    /**
     * Gets or sets the text content.
     * Setting new text triggers splitting if autoSplit is true.
     * > [!NOTE] Setting this frequently can have a performance impact, especially with large texts and canvas text.
     * @example Dynamic Text Updates
     * ```ts
     * const text = new SplitText({
     *   text: 'Original',
     *   autoSplit: true
     * });
     *
     * // Auto-splits on change
     * text.text = 'Updated Content';
     *
     * // Manual update
     * text.autoSplit = false;
     * text.text = 'Manual Update';
     * text.split();
     * ```
     */
    set text(value: string)
    {
        this._originalText = value;
        this.lines.forEach((line) => line.destroy({ children: true }));
        this.lines.length = 0;
        this.words.length = 0;
        this.chars.length = 0;
        this._canReuseChars = false;
        // You can't reuse chars if the text changes
        this.onTextUpdate();
    }

    private _setOrigin(
        value: number | PointData,
        elements: Array<Container | T>,
        property: '_lineAnchor' | '_wordAnchor' | '_charAnchor',
    ): void
    {
        let originPoint: PointData;

        if (typeof value === 'number')
        {
            originPoint = { x: value, y: value };
        }
        else
        {
            originPoint = { x: value.x, y: value.y };
        }

        elements.forEach((element) =>
        {
            const localBounds = element.getLocalBounds();

            // Calculate origin position relative to the bounds
            const originX = localBounds.minX + (localBounds.width * originPoint.x);
            const originY = localBounds.minY + (localBounds.height * originPoint.y);

            element.origin.set(originX, originY);
        });

        this[property] = value;
    }

    /**
     * Gets or sets the transform anchor for line segments.
     * The anchor point determines the center of rotation and scaling for each line.
     * @example Setting Line Anchors
     * ```ts
     * // Center rotation/scaling
     * text.lineAnchor = 0.5;
     *
     * // Rotate/scale from top-right corner
     * text.lineAnchor = { x: 1, y: 0 };
     *
     * // Custom anchor point
     * text.lineAnchor = {
     *   x: 0.2, // 20% from left
     *   y: 0.8  // 80% from top
     * };
     * ```
     */
    get lineAnchor(): number | PointData
    {
        return this._lineAnchor;
    }
    set lineAnchor(value: number | PointData)
    {
        this._setOrigin(value, this.lines, '_lineAnchor');
    }

    /**
     * Gets or sets the transform anchor for word segments.
     * The anchor point determines the center of rotation and scaling for each word.
     * @example
     * ```ts
     * // Center each word
     * text.wordAnchor = 0.5;
     *
     * // Scale from bottom-left
     * text.wordAnchor = { x: 0, y: 1 };
     *
     * // Rotate around custom point
     * text.wordAnchor = {
     *   x: 0.75,  // 75% from left
     *   y: 0.5    // Middle vertically
     * };
     * ```
     */
    get wordAnchor(): number | PointData
    {
        return this._wordAnchor;
    }
    set wordAnchor(value: number | PointData)
    {
        this._setOrigin(value, this.words, '_wordAnchor');
    }

    /**
     * Gets or sets the transform anchor for character segments.
     * The anchor point determines the center of rotation and scaling for each character.
     * @example Setting Character Anchors
     * ```ts
     * // Center each character
     * text.charAnchor = 0.5;
     *
     * // Rotate from top-center
     * text.charAnchor = { x: 0.5, y: 0 };
     *
     * // Scale from bottom-right
     * text.charAnchor = { x: 1, y: 1 };
     * ```
     * @example Animation with Anchors
     * ```ts
     * // Rotate characters around their centers
     * text.charAnchor = 0.5;
     * text.chars.forEach((char, i) => {
     *   gsap.to(char, {
     *     rotation: Math.PI * 2,
     *     duration: 1,
     *     delay: i * 0.1,
     *     repeat: -1
     *   });
     * });
     * ```
     */
    get charAnchor(): number | PointData
    {
        return this._charAnchor;
    }
    set charAnchor(value: number | PointData)
    {
        this._setOrigin(value, this.chars, '_charAnchor');
    }

    get style(): TextStyle
    {
        return this._style;
    }

    /**
     * The style configuration for the text.
     * Can be a TextStyle instance or a configuration object.
     * @example
     * ```ts
     * const text = new Text({
     *     text: 'Styled Text',
     *     style: {
     *         fontSize: 24,
     *         fill: 0xff1010, // Red color
     *         fontFamily: 'Arial',
     *         align: 'center', // Center alignment
     *         stroke: { color: '#4a1850', width: 5 }, // Purple stroke
     *         dropShadow: {
     *             color: '#000000', // Black shadow
     *             blur: 4, // Shadow blur
     *             distance: 6 // Shadow distance
     *         }
     *     }
     * });
     * // Update style dynamically
     * text.style = {
     *     fontSize: 30, // Change font size
     *     fill: 0x00ff00, // Change color to green
     *     align: 'right', // Change alignment to right
     *     stroke: { color: '#000000', width: 2 }, // Add black stroke
     * }
     */
    set style(style: TextStyle | Partial<TextStyle> | TextStyleOptions)
    {
        style ||= {};

        this._style = new TextStyle(style);

        // tidy up word/line containers, characters can be reused
        this.words.forEach((word) => word.destroy());
        this.words.length = 0;

        this.lines.forEach((line) => line.destroy());
        this.lines.length = 0;

        this._canReuseChars = true;

        this.onTextUpdate();
    }

    protected onTextUpdate(): void
    {
        this._dirty = true;

        if (this._autoSplit)
        {
            this.split();
        }
    }

    /**
     * Destroys the SplitText instance and all its resources.
     * Cleans up all segment arrays, event listeners, and optionally the text style.
     * @param options - Destroy configuration options
     * @example
     * ```ts
     * // Clean up everything
     * text.destroy({ children: true, texture: true, style: true });
     *
     * // Remove from parent but keep style
     * text.destroy({ children: true, style: false });
     * ```
     */
    public destroy(options?: DestroyOptions): void
    {
        super.destroy(options);
        this.chars = [];
        this.words = [];
        this.lines = [];
        if (typeof options === 'boolean' ? options : options?.style)
        {
            this._style.destroy(options);
        }

        this._style = null;
        this._originalText = '';
    }
}
