import type { GraphicsData } from '../GraphicsData';
import type { GraphicsGeometry } from '../GraphicsGeometry';

export interface IShapeBuildCommand {
    build(graphicsData: GraphicsData): void;
    triangulate(graphicsData: GraphicsData, target: GraphicsGeometry): void;
}
