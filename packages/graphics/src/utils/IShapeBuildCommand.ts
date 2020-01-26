import { GraphicsData } from '../GraphicsData';
import { GraphicsGeometry } from '../GraphicsGeometry';

export interface IShapeBuildCommand {
    build(graphicsData: GraphicsData): void;
    triangulate(graphicsData: GraphicsData, target: GraphicsGeometry): void;
}
