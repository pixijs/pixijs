// for type only
import type { IShapeBuildCommand } from './IShapeBuildCommand';
import { buildCircle } from './buildCircle';

/**
 * Builds a rounded rectangle to draw
 *
 * Ignored from docs since it is not directly exposed.
 * @ignore
 * @private
 * @param {PIXI.WebGLGraphicsData} graphicsData - The graphics object containing all the necessary properties
 * @param {object} webGLData - an object containing all the WebGL-specific information to create this shape
 * @param {object} webGLDataNativeLines - an object containing all the WebGL-specific information to create nativeLines
 */
export const buildRoundedRectangle: IShapeBuildCommand = {

    build(graphicsData)
    {
        buildCircle.build(graphicsData);
    },

    triangulate(graphicsData, graphicsGeometry)
    {
        buildCircle.triangulate(graphicsData, graphicsGeometry);
    },
};
