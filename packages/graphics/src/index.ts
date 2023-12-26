/// <reference path="../global.d.ts" />
import {
    ArcUtils,
    BATCH_POOL,
    BatchPart,
    BezierUtils,
    buildCircle,
    buildLine,
    buildPoly,
    buildRectangle,
    buildRoundedRectangle,
    DRAW_CALL_POOL,
    FILL_COMMANDS,
    QuadraticUtils,
} from './utils';

import type { BatchDrawCall, SHAPES } from '@pixi/core';
import type { IShapeBuildCommand } from './utils/IShapeBuildCommand';

export * from './const';
export * from './Graphics';
export * from './GraphicsData';
export * from './GraphicsGeometry';
export * from './styles/FillStyle';
export * from './styles/LineStyle';

export const graphicsUtils = {
    buildPoly: buildPoly as IShapeBuildCommand,
    buildCircle: buildCircle as IShapeBuildCommand,
    buildRectangle: buildRectangle as IShapeBuildCommand,
    buildRoundedRectangle: buildRoundedRectangle as IShapeBuildCommand,
    buildLine,
    ArcUtils,
    BezierUtils,
    QuadraticUtils,
    BatchPart,
    FILL_COMMANDS: FILL_COMMANDS as Record<SHAPES, IShapeBuildCommand>,
    BATCH_POOL: BATCH_POOL as Array<BatchPart>,
    DRAW_CALL_POOL: DRAW_CALL_POOL as Array<BatchDrawCall>
};
