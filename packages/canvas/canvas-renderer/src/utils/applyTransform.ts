import { Matrix } from '@pixi/math';

/**
 * Applies given transformation Matrix upon the given context.
 *
 * @param {PIXI.Matrix} transform - The transformation Matrix to apply
 * @param {CanvasRenderingContext2D} [context] - The context to manipulate
 */
export function applyTransform(context: CanvasRenderingContext2D, transform: Matrix): void
{
    if (!context) return;

    const { a, b, c, d, tx, ty } = transform;

    context.setTransform(a, b, c, d, tx, ty);
}

