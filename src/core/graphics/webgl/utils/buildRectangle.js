let buildLine = require('./buildLine'),
    utils = require('../../../utils');

/**
 * Builds a rectangle to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param graphicsData {PIXI.WebGLGraphicsData} The graphics object containing all the necessary properties
 * @param webGLData {object} an object containing all the webGL-specific information to create this shape
 */
let buildRectangle = function (graphicsData, webGLData)
{
    // --- //
    // need to convert points to a nice regular data
    //
    let rectData = graphicsData.shape;
    let x = rectData.x;
    let y = rectData.y;
    let width = rectData.width;
    let height = rectData.height;

    if (graphicsData.fill)
    {
        let color = utils.hex2rgb(graphicsData.fillColor);
        let alpha = graphicsData.fillAlpha;

        let r = color[0] * alpha;
        let g = color[1] * alpha;
        let b = color[2] * alpha;

        let verts = webGLData.points;
        let indices = webGLData.indices;

        let vertPos = verts.length/6;

        // start
        verts.push(x, y);
        verts.push(r, g, b, alpha);

        verts.push(x + width, y);
        verts.push(r, g, b, alpha);

        verts.push(x , y + height);
        verts.push(r, g, b, alpha);

        verts.push(x + width, y + height);
        verts.push(r, g, b, alpha);

        // insert 2 dead triangles..
        indices.push(vertPos, vertPos, vertPos+1, vertPos+2, vertPos+3, vertPos+3);
    }

    if (graphicsData.lineWidth)
    {
        let tempPoints = graphicsData.points;

        graphicsData.points = [x, y,
                  x + width, y,
                  x + width, y + height,
                  x, y + height,
                  x, y];


        buildLine(graphicsData, webGLData);

        graphicsData.points = tempPoints;
    }
};

module.exports = buildRectangle;
