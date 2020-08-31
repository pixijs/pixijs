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
    Star,
    ArcUtils,
    BezierUtils,
    QuadraticUtils,
    BatchPart
} from './utils';
import type { IShapeBuildCommand } from './utils/IShapeBuildCommand';

export const graphicsUtils = {
    buildPoly: buildPoly as IShapeBuildCommand,
    buildCircle: buildCircle as IShapeBuildCommand,
    buildRectangle: buildRectangle as IShapeBuildCommand,
    buildRoundedRectangle: buildRoundedRectangle as IShapeBuildCommand,
    buildLine,
    Star,
    ArcUtils,
    BezierUtils,
    QuadraticUtils,
    BatchPart
};
