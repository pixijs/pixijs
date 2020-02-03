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
export * from './Star';
export * from './ArcUtils';
export * from './BezierUtils';
export * from './QuadraticUtils';
export * from './BatchPart';

// for type only
import { BatchPart } from './BatchPart';
import { SHAPES } from '@pixi/math';
import { BatchDrawCall } from '@pixi/core';
import { IShapeBuildCommand } from './IShapeBuildCommand';

/**
 * Map of fill commands for each shape type.
 *
 * @memberof PIXI.graphicsUtils
 * @member {Object}
 */
export const FILL_COMMANDS: Record<SHAPES, IShapeBuildCommand> = {
    [SHAPES.POLY]: buildPoly,
    [SHAPES.CIRC]: buildCircle,
    [SHAPES.ELIP]: buildCircle,
    [SHAPES.RECT]: buildRectangle,
    [SHAPES.RREC]: buildRoundedRectangle,
};

/**
 * Batch pool, stores unused batches for preventing allocations.
 *
 * @memberof PIXI.graphicsUtils
 * @type {Array<PIXI.graphicsUtils.BatchPart>}
 */
export const BATCH_POOL: Array<BatchPart> = [];

/**
 * Draw call pool, stores unused draw calls for preventing allocations.
 *
 * @memberof PIXI.graphicsUtils
 * @type {Array<PIXI.BatchDrawCall>}
 */
export const DRAW_CALL_POOL: Array<BatchDrawCall> = [];
