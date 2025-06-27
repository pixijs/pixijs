import { type Container } from '../container/Container';
import { type Text } from '../text/Text';
import { type BitmapText } from '../text-bitmap/BitmapText';

/**
 * Types of text objects that can be split into characters, words, and lines.
 * Currently supports Text and BitmapText instances.
 * @internal
 */
export type SplitableTextObject = Text | BitmapText;

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

