import { type PointData } from '../../../../maths/point/PointData';
import { Container } from '../../../../scene/container/Container';
import { type BitmapText } from '../../../text-bitmap/BitmapText';
import { type Text } from '../../Text';
import { type TextStyle, type TextStyleOptions } from '../../TextStyle';

/**
 * Types of text objects that can be split into characters, words, and lines.
 * Currently supports Text and BitmapText instances.
 * @internal
 */
type SplitableTextObject = Text | BitmapText;

/**
 * Constructor types for splitable text objects.
 * @internal
 */
type SplitableTextClass = typeof Text | typeof BitmapText;

/**
 * Contains the output elements from a text split operation.
 * Provides access to the hierarchical structure of split text elements.
 * @example
 * ```ts
 * const splitResult = Text.split(myText);
 *
 * // Access individual characters
 * splitResult.chars.forEach(char => {
 *     char.alpha = 0;
 *     gsap.to(char, { alpha: 1, duration: 0.5 });
 * });
 *
 * // Access words (groups of characters)
 * splitResult.words.forEach(word => {
 *     word.scale.set(0);
 *     gsap.to(word.scale, { x: 1, y: 1, duration: 0.5 });
 * });
 *
 * // Access lines (groups of words)
 * splitResult.lines.forEach(line => {
 *     line.x = -200;
 *     gsap.to(line, { x: 0, duration: 0.5 });
 * });
 * ```
 * @category text
 * @standard
 */
export interface TextSplitOutput<T extends SplitableTextObject>
{
    /** Array of individual character Text objects */
    chars: T[];
    /** Array of word containers, each containing character objects */
    words: Container[];
    /** Array of line containers, each containing word containers */
    lines: Container[];
}

/**
 * Base configuration options for text splitting operations.
 * These options apply to both instanced and raw text splitting.
 * @example
 * ```ts
 * // Using number anchor
 * const result = Text.split({
 *     text: myText,
 *     anchor: 0.5 // Center anchor point
 * });
 *
 * // Using point anchor
 * const result = Text.split({
 *     text: myText,
 *     anchor: { x: 0.5, y: 0 } // Top-center anchor
 * });
 * ```
 * @category text
 * @standard
 */
export interface TextSplitConfigBase
{
    /**
     * The anchor point to apply to each split text element.
     * Can be a single number (applied to both x and y) or a PointData object.
     * @default 0
     */
    anchor?: number | PointData;
}

/**
 * Configuration for splitting an existing Text instance.
 * Allows control over text replacement and anchoring.
 * @example
 * ```ts
 * // Split text and replace in scene graph
 * const result = Text.split({
 *     text: myTextInstance,
 *     replace: true,
 *     anchor: 0.5
 * });
 *
 * // Split without replacing original
 * const result = Text.split({
 *     text: myTextInstance,
 *     replace: false
 * });
 * ```
 * @category text
 * @standard
 */
export interface InstancedTextSplitConfig<T extends SplitableTextObject> extends TextSplitConfigBase
{
    /** The Text instance to split */
    text: T;
    /**
     * Whether to replace the original Text instance with the split result.
     * When true, the original text is removed and the split container takes its place.
     * @default true
     */
    replace?: boolean;
}

/**
 * Configuration for splitting raw text with style.
 * Useful when you want to split text without an existing instance.
 * @example
 * ```ts
 * // Split raw text with style
 * const result = Text.split({
 *     string: "Hello\nWorld",
 *     style: {
 *         fontSize: 24,
 *         fill: 0xff0000
 *     },
 *     anchor: 0.5
 * });
 * ```
 * @category text
 * @standard
 */
export interface RawTextSplitConfig extends TextSplitConfigBase
{
    /** The text string to split */
    string: string;
    /** The style to apply to the text */
    style: TextStyle | Partial<TextStyleOptions>;
}

/**
 * Combined type for all text split configurations.
 * Allows either instance-based or raw text splitting.
 * @category text
 * @standard
 */
export type TextSplitConfig<T extends SplitableTextObject> =
    | InstancedTextSplitConfig<T>
    | RawTextSplitConfig;

/**
 * Final result of a text split operation, including the container
 * and access to all split elements.
 * @example
 * ```ts
 * const result = Text.split(myText);
 *
 * // Add the split text to the scene
 * app.stage.addChild(result.container);
 *
 * // Animate individual elements
 * result.chars.forEach((char, i) => {
 *     gsap.from(char, {
 *         alpha: 0,
 *         y: -50,
 *         delay: i * 0.1
 *     });
 * });
 * ```
 * @category text
 * @standard
 */
export interface TextSplitResult<T extends SplitableTextObject> extends TextSplitOutput<T>
{
    /** Container holding all split text elements */
    container: Container;
}

function replaceTextInstance(text: SplitableTextObject, holder: Container)
{
    const textParent = text.parent;

    if (textParent)
    {
        const textIndex = textParent.getChildIndex(text);

        textParent.removeChild(text);
        textParent.addChildAt(holder, textIndex);
    }
}

function handleTextReplacement(text: SplitableTextObject | TextSplitConfig<SplitableTextObject>, holder: Container)
{
    if (text instanceof Container)
    {
        replaceTextInstance(text, holder);
    }
    else if ('text' in text && text.text instanceof Container)
    {
        replaceTextInstance(text.text, holder);
    }
}

function handleProperties(text: SplitableTextObject | TextSplitConfig<SplitableTextObject>, holder: Container)
{
    let textInstance: SplitableTextObject | null = null;

    if (text instanceof Container)
    {
        textInstance = text;
    }
    else if ('text' in text && text.text instanceof Container)
    {
        textInstance = text.text;
    }

    if (textInstance)
    {
        holder.tint = textInstance.tint;
        holder.alpha = textInstance.alpha;
        holder.blendMode = textInstance.blendMode;
        holder.visible = textInstance.visible;
    }
}

function updateTransform(text: SplitableTextObject | TextSplitConfig<SplitableTextObject>, holder: Container)
{
    let textInstance: SplitableTextObject | null = null;

    if (text instanceof Container)
    {
        textInstance = text;
    }
    else if ('text' in text && text.text instanceof Container)
    {
        textInstance = text.text;
    }

    if (textInstance)
    {
        textInstance.updateLocalTransform();
        holder.setFromMatrix(textInstance.localTransform);
        const anchor = textInstance.anchor;

        if (anchor)
        {
            holder.pivot.set(textInstance.width * anchor.x, textInstance.height * anchor.y);
        }
    }
}

/**
 * A factory function to create a text splitter.
 * @param text - The text to split, can be a Text instance, BitmapText instance, or a configuration object.
 * @param TextClass - The Text class to use for creating split text instances.
 * @param splitFn - The function to use for splitting the text.
 * @internal
 */
export function splitText<
    T extends SplitableTextObject,
    TC extends SplitableTextClass = SplitableTextClass
>(
    text: T | InstancedTextSplitConfig<T> | RawTextSplitConfig,
    TextClass: TC,
    splitFn: (options: RawTextSplitConfig, TextClass: TC) => TextSplitOutput<T>,
): TextSplitResult<T>
{
    const defaultOptions: Partial<RawTextSplitConfig & InstancedTextSplitConfig<T>> = {
        replace: true,
        anchor: 0,
    };
    let options: RawTextSplitConfig;
    let config: SplitableTextObject | TextSplitConfig<SplitableTextObject> = text;

    if (text instanceof Container)
    {
        options = { ...defaultOptions, string: text.text, style: text.style, anchor: text.anchor };
    }
    else if ('text' in text && text.text instanceof Container)
    {
        options = {
            ...defaultOptions,
            string: text.text.text,
            style: text.text.style,
            anchor: text.text.anchor,
            ...text,
        };
        config = text;
    }
    else
    {
        options = { ...defaultOptions, ...(text as RawTextSplitConfig) };
        config = text;
    }

    const splitResult = splitFn(options, TextClass);
    const holder = new Container();

    if (splitResult.lines.length > 0)
    {
        holder.addChild(...splitResult.lines);
    }

    if (('replace' in options && options.replace) ?? ('replace' in defaultOptions && defaultOptions.replace))
    {
        handleTextReplacement(config, holder);
    }

    handleProperties(config, holder);
    updateTransform(config, holder);

    return { ...splitResult, container: holder };
}

