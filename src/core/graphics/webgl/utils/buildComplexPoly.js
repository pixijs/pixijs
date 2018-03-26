import { hex2rgb } from '../../../utils';

/**
 * Builds a complex polygon to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {PIXI.Graphics} graphicsData - The graphics object containing all the necessary properties
 * @param {object} webGLData - an object containing all the webGL-specific information to create this shape
 */
export default function buildComplexPoly(graphicsData, webGLData)
{
    // TODO - no need to copy this as it gets turned into a Float32Array anyways..
    const points = graphicsData.points.slice();

    if (points.length < 6)
    {
        return;
    }

    // get first and last point.. figure out the middle!
    const indices = webGLData.indices;

    webGLData.points = points;
    webGLData.alpha = graphicsData.fillAlpha;
    webGLData.color = hex2rgb(graphicsData.fillColor);

    // calculate the bounds..
    let minX = Infinity;
    let maxX = -Infinity;

    let minY = Infinity;
    let maxY = -Infinity;

    let x = 0;
    let y = 0;

    // get size..
    for (let i = 0; i < points.length; i += 2)
    {
        x = points[i];
        y = points[i + 1];

        minX = x < minX ? x : minX;
        maxX = x > maxX ? x : maxX;

        minY = y < minY ? y : minY;
        maxY = y > maxY ? y : maxY;
    }

    // add a quad to the end cos there is no point making another buffer!
    points.push(minX, minY,
                maxX, minY,
                maxX, maxY,
                minX, maxY);

    // push a quad onto the end..

    // TODO - this aint needed!
    const length = points.length / 2;

    for (let i = 0; i < length; i++)
    {
        indices.push(i);
    }
}
