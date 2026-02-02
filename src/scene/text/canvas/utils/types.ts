import type { ICanvasRenderingContext2D } from '../../../../environment/canvas/ICanvasRenderingContext2D';

/**
 * A number, or a string containing a number.
 * @category text
 * @typedef {object} FontMetrics
 * @property {number} ascent - Font ascent
 * @property {number} descent - Font descent
 * @property {number} fontSize - Font size
 * @advanced
 */
export interface FontMetrics
{
    ascent: number;
    descent: number;
    fontSize: number;
}

/**
 * Function type for measuring text width.
 * @internal
 */
export type MeasureTextFn = (
    text: string,
    letterSpacing: number,
    context: ICanvasRenderingContext2D
) => number;

/**
 * Function type for checking if characters can be broken.
 * @internal
 */
export type CanBreakCharsFn = (
    char: string,
    nextChar: string,
    token: string,
    index: number,
    breakWords: boolean
) => boolean;

/**
 * Function type for splitting words into characters.
 * @internal
 */
export type WordWrapSplitFn = (token: string) => string[];
