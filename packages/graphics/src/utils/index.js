/**
 * Generalized convenience utilities for Graphics.
 *
 * @namespace PIXI.graphicsUtils
 */

import { buildPoly } from './buildPoly';
export { buildPoly };

import { buildCircle } from './buildCircle';
export { buildCircle };

import { buildRectangle } from './buildRectangle';
export { buildRectangle };

import { buildRoundedRectangle } from './buildRoundedRectangle';
export { buildRoundedRectangle };

export * from './buildLine';
export * from './buildComplexPoly';
export * from './bezierCurveTo';
export * from './Star';
export * from './ArcUtils';
export * from './BezierUtils';
export * from './QuadraticUtils';
export * from './BatchPart';

import { SHAPES } from '@pixi/math';

/**
 * Map of fill commands for each shape type.
 *
 * @member {Object}
 */
export const FILL_COMMANDS = {
    [SHAPES.POLY]: buildPoly,
    [SHAPES.CIRC]: buildCircle,
    [SHAPES.ELIP]: buildCircle,
    [SHAPES.RECT]: buildRectangle,
    [SHAPES.RREC]: buildRoundedRectangle,
};

/**
 * Batch pool, stores unused batches for preventing allocations.
 *
 * @type {Array<BatchPart>}
 */
export const BATCH_POOL = [];

/**
 * Draw call pool, stores unused draw calls for preventing allocations.
 *
 * @type {Array<PIXI.BatchDrawCall>}
 */
export const DRAW_CALL_POOL = [];
