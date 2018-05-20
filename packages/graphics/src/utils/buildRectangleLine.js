import buildLine from './buildLine';
import { hex2rgb } from '@pixi/utils';

/**
 * Builds a rectangle to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {PIXI.WebGLGraphicsData} graphicsData - The graphics object containing all the necessary properties
 * @param {object} webGLData - an object containing all the webGL-specific information to create this shape
 * @param {object} webGLDataNativeLines - an object containing all the webGL-specific information to create nativeLines
 */
export default function buildRectangleLine(graphicsData, graphicsGeometry)
{
    // --- //
    // need to convert points to a nice regular data
    //
    const rectData = graphicsData.shape;
    const x = rectData.x;
    const y = rectData.y;
    const width = rectData.width;
    const height = rectData.height;

    const tempPoints = graphicsData.points;

    graphicsData.points = [x, y,
        x + width, y,
        x + width, y + height,
        x, y + height,
        x, y];

    buildLine(graphicsData, graphicsGeometry);

    graphicsData.points = tempPoints;
}
