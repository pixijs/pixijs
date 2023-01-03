/**
 * Generalized convenience utilities for Graphics.
 * @namespace graphicsUtils
 * @memberof PIXI
 */

// for type only
import { SHAPES } from '@pixi/core';
import { buildCircle } from './buildCircle';
import { buildPoly } from './buildPoly';
import { buildRectangle } from './buildRectangle';
import { buildRoundedRectangle } from './buildRoundedRectangle';

import type { BatchDrawCall } from '@pixi/core';
import type { BatchPart } from './BatchPart';
import type { IShapeBuildCommand } from './IShapeBuildCommand';

export * from './ArcUtils';
export * from './BatchPart';
export * from './BezierUtils';
export * from './buildCircle';
export * from './buildLine';
export * from './buildPoly';
export * from './buildRectangle';
export * from './buildRoundedRectangle';
export * from './QuadraticUtils';

/**
 * Map of fill commands for each shape type.
 * @memberof PIXI.graphicsUtils
 * @member {object} FILL_COMMANDS
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
 * @memberof PIXI.graphicsUtils
 * @member {Array<PIXI.graphicsUtils.BatchPart>} BATCH_POOL
 */
export const BATCH_POOL: Array<BatchPart> = [];

/**
 * Draw call pool, stores unused draw calls for preventing allocations.
 * @memberof PIXI.graphicsUtils
 * @member {Array<PIXI.BatchDrawCall>} DRAW_CALL_POOL
 */
export const DRAW_CALL_POOL: Array<BatchDrawCall> = [];
