'use strict';

exports.__esModule = true;
exports.default = buildComplexPoly;

var _utils = require('../../../utils');

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
function buildComplexPoly(graphicsData, webGLData) {
    // TODO - no need to copy this as it gets turned into a Float32Array anyways..
    var points = graphicsData.points.slice();

    if (points.length < 6) {
        return;
    }

    // get first and last point.. figure out the middle!
    var indices = webGLData.indices;

    webGLData.points = points;
    webGLData.alpha = graphicsData.fillAlpha;
    webGLData.color = (0, _utils.hex2rgb)(graphicsData.fillColor);

    // calculate the bounds..
    var minX = Infinity;
    var maxX = -Infinity;

    var minY = Infinity;
    var maxY = -Infinity;

    var x = 0;
    var y = 0;

    // get size..
    for (var i = 0; i < points.length; i += 2) {
        x = points[i];
        y = points[i + 1];

        minX = x < minX ? x : minX;
        maxX = x > maxX ? x : maxX;

        minY = y < minY ? y : minY;
        maxY = y > maxY ? y : maxY;
    }

    // add a quad to the end cos there is no point making another buffer!
    points.push(minX, minY, maxX, minY, maxX, maxY, minX, maxY);

    // push a quad onto the end..

    // TODO - this aint needed!
    var length = points.length / 2;

    for (var _i = 0; _i < length; _i++) {
        indices.push(_i);
    }
}
//# sourceMappingURL=buildComplexPoly.js.map