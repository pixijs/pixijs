/**
 * The line cap styles for strokes.
 *
 * It can be:
 * - `butt`: The ends of the stroke are squared off at the endpoints.
 * - `round`: The ends of the stroke are rounded.
 * @category scene
 * @standard
 */
export type LineCap = 'butt' | 'round' | 'square';
/**
 * The line join styles for strokes.
 *
 * It can be:
 * - `round`: The corners of the stroke are rounded.
 * - `bevel`: The corners of the stroke are squared off.
 * - `miter`: The corners of the stroke are extended to meet at a point.
 * @category scene
 * @standard
 */
export type LineJoin = 'round' | 'bevel' | 'miter';

/** @internal */
export const closePointEps = 1e-4;
/** @internal */
export const curveEps = 0.0001;
