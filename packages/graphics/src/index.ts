export * from './const';
export * from './styles/FillStyle';
export * from './Graphics';
export * from './GraphicsData';
export * from './GraphicsGeometry';
export * from './styles/LineStyle';

import {
    buildPoly,
    buildCircle,
    buildRectangle,
    buildRoundedRectangle,
    buildLine,
    ArcUtils,
    BezierUtils,
    QuadraticUtils,
    BatchPart,
    FILL_COMMANDS,
    BATCH_POOL,
    DRAW_CALL_POOL
} from './utils';
import type { BatchDrawCall } from '@pixi/core/';
import type { IShapeBuildCommand } from './utils/IShapeBuildCommand';
import type { SHAPES } from '@pixi/math';

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
