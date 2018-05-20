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
export default function buildRectangle(graphicsData, graphicsGeometry)
{
    // --- //
    // need to convert points to a nice regular data
    //
    const rectData = graphicsData.shape;
    const x = rectData.x;
    const y = rectData.y;
    const width = rectData.width;
    const height = rectData.height;

    const color = hex2rgb(graphicsData.fillColor);
    const alpha = graphicsData.fillAlpha;

    const r = color[0] * alpha;
    const g = color[1] * alpha;
    const b = color[2] * alpha;

    const verts = graphicsGeometry.points;
    const indices = graphicsGeometry.indices;

    const vertPos = verts.length / 8;

    // start
    verts.push(x, y);
    verts.push(r, g, b, alpha);
    verts.push(0, 0);

    verts.push(x + width, y);
    verts.push(r, g, b, alpha);
    verts.push(0, 1);

    verts.push(x, y + height);
    verts.push(r, g, b, alpha);
    verts.push(1, 0);

    verts.push(x + width, y + height);
    verts.push(r, g, b, alpha);
    verts.push(1, 1);

    // insert 2 dead triangles..
    indices.push(vertPos, vertPos, vertPos + 1, vertPos + 2, vertPos + 3, vertPos + 3);
}
