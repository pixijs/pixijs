let buildLine = require('./buildLine'),
    utils = require('../../../utils'),
    earcut = require('earcut');

/**
 * Builds a polygon to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param graphicsData {PIXI.WebGLGraphicsData} The graphics object containing all the necessary properties
 * @param webGLData {object} an object containing all the webGL-specific information to create this shape
 */
let buildPoly = function (graphicsData, webGLData)
{
    graphicsData.points = graphicsData.shape.points.slice();

    let points = graphicsData.points;

    if(graphicsData.fill && points.length >= 6)
    {
        let holeArray = [];
             // Process holes..
        let holes = graphicsData.holes;

        for (let i = 0; i < holes.length; i++) {
            let hole = holes[i];

            holeArray.push(points.length/2);

            points = points.concat(hole.points);
        }

        // get first and last point.. figure out the middle!
        let verts = webGLData.points;
        let indices = webGLData.indices;

        let length = points.length / 2;

        // sort color
        let color = utils.hex2rgb(graphicsData.fillColor);
        let alpha = graphicsData.fillAlpha;
        let r = color[0] * alpha;
        let g = color[1] * alpha;
        let b = color[2] * alpha;

        let triangles = earcut(points, holeArray, 2);

        if (!triangles) {
            return;
        }

        let vertPos = verts.length / 6;

        for (let i = 0; i < triangles.length; i+=3)
        {
            indices.push(triangles[i] + vertPos);
            indices.push(triangles[i] + vertPos);
            indices.push(triangles[i+1] + vertPos);
            indices.push(triangles[i+2] +vertPos);
            indices.push(triangles[i+2] + vertPos);
        }

        for (let i = 0; i < length; i++)
        {
            verts.push(points[i * 2], points[i * 2 + 1],
                       r, g, b, alpha);
        }
    }

    if (graphicsData.lineWidth > 0)
    {
        buildLine(graphicsData, webGLData);
    }
};


module.exports = buildPoly;
