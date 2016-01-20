var buildLine = require('./buildLine'),
    utils = require('../../../utils'),
    earcut = require('earcut');

/**
 * Builds a polygon to draw
 *
 * @private
 * @param graphicsData {PIXI.WebGLGraphicsData} The graphics object containing all the necessary properties
 * @param webGLData {object} an object containing all the webGL-specific information to create this shape
 */
var buildPoly = function (graphicsData, webGLData)
{
    graphicsData.points = graphicsData.shape.points.slice();
    
    var points = graphicsData.points;

    // need to add the points the the graphics object..
    if (graphicsData.shape.closed)
    {
        // close the poly if the value is true!
        if (points[0] !== points[points.length-2] || points[1] !== points[points.length-1])
        {
            points.push(points[0], points[1]);
        }
    }

    if (points.length < 6)
    {
        return;
    }

    if(graphicsData.fill)
    {
        // get first and last point.. figure out the middle!
        var verts = webGLData.points;
        var indices = webGLData.indices;

        var length = points.length / 2;

        // sort color
        var color = utils.hex2rgb(graphicsData.fillColor);
        var alpha = graphicsData.fillAlpha;
        var r = color[0] * alpha;
        var g = color[1] * alpha;
        var b = color[2] * alpha;

        var triangles = earcut(points, null, 2);

        if (!triangles) {
            return false;
        }

        var vertPos = verts.length / 6;

        var i = 0;

        for (i = 0; i < triangles.length; i+=3)
        {
            indices.push(triangles[i] + vertPos);
            indices.push(triangles[i] + vertPos);
            indices.push(triangles[i+1] + vertPos);
            indices.push(triangles[i+2] +vertPos);
            indices.push(triangles[i+2] + vertPos);
        }

        for (i = 0; i < length; i++)
        {
            verts.push(points[i * 2], points[i * 2 + 1],
                       r, g, b, alpha);
        }
    }

    if (graphicsData.lineWidth > 0)
    {
        buildLine(graphicsData, webGLData);
    }

    return true;
};


module.exports = buildPoly;
