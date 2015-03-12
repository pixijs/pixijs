/**
 * @namespace PIXI.math
 */
module.exports = {
    /**
     * @property {number} PI_2 - Two Pi
     * @constant
     * @static
     */
    PI_2: Math.PI * 2,

    /**
     * @property {number} RAD_TO_DEG - Constant conversion factor for converting radians to degrees
     * @constant
     * @static
     */
    RAD_TO_DEG: 180 / Math.PI,

    /**
     * @property {Number} DEG_TO_RAD - Constant conversion factor for converting degrees to radians
     * @constant
     * @static
     */
    DEG_TO_RAD: Math.PI / 180,

    Point:      require('./Point'),
    Matrix:     require('./Matrix'),

    Circle:     require('./shapes/Circle'),
    Ellipse:    require('./shapes/Ellipse'),
    Polygon:    require('./shapes/Polygon'),
    Rectangle:  require('./shapes/Rectangle'),
    RoundedRectangle: require('./shapes/RoundedRectangle')
};
