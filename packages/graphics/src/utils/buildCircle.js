import { SHAPES } from '@pixi/math';
import { hex2rgb } from '@pixi/utils';

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
export default function buildCircle(graphicsData, graphicsGeometry)
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

    const color = hex2rgb(graphicsData.fillColor);
    const alpha = graphicsData.fillAlpha;

    const r = color[0] * alpha;
    const g = color[1] * alpha;
    const b = color[2] * alpha;

    const verts = graphicsGeometry.points;
    const indices = graphicsGeometry.indices;

    let vecPos = verts.length / 8;
    const center = vecPos;

    verts.push(x, y, r, g, b, alpha, 0.5, 0.5);

    for (let i = 0; i < totalSegs + 2; i++)
    {
        const s = Math.sin(seg * i);
        const c = Math.cos(seg * i);

        verts.push(
            x + (Math.sin(seg * i) * width),
            y + (Math.cos(seg * i) * height),
            r, g, b, alpha,
            0.5 + (s * 0.5),
            0.5 + (c * 0.5)
        );

        // add some uvs
        indices.push(center, vecPos++);
    }
}
