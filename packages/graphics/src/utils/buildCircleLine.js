import { SHAPES } from '@pixi/math';

import buildLine from './buildLine';

/**
 * Builds a circle to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {PIXI.WebGLGraphicsData} graphicsData - The graphics object to draw
 * @param {object} webGLData - an object containing all the webGL-specific information to create this shape
 * @param {object} webGLDataNativeLines - an object containing all the webGL-specific information to create nativeLines
 */
export default function buildCircleLine(graphicsData, graphicsGeometry)
{
    // need to convert points to a nice regular data
    const circleData = graphicsData.shape;
    const x = circleData.x;
    const y = circleData.y;
    let width;
    let height;

    // TODO - bit hacky??
    if (graphicsData.type === SHAPES.CIRC)
    {
        width = circleData.radius;
        height = circleData.radius;
    }
    else
    {
        width = circleData.width;
        height = circleData.height;
    }

    if (width === 0 || height === 0)
    {
        return;
    }

    const totalSegs = Math.floor(30 * Math.sqrt(circleData.radius))
        || Math.floor(15 * Math.sqrt(circleData.width + circleData.height));

    const seg = (Math.PI * 2) / totalSegs;

    const tempPoints = graphicsData.points;

    graphicsData.points = [];

    for (let i = 0; i < totalSegs + 1; i++)
    {
        graphicsData.points.push(
            x + (Math.sin(seg * -i) * width),
            y + (Math.cos(seg * -i) * height)
        );
    }

    buildLine(graphicsData, graphicsGeometry);

    graphicsData.points = tempPoints;
}
