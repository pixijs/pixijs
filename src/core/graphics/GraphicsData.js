var SolidBrush = require('./brushes/SolidBrush');

/**
 * A GraphicsData object.
 *
 * @class
 * @memberof PIXI
 * @param lineWidth {number} the width of the line to draw
 * @param strokeStyle {Brush} the brush used for drawing the border of the shape
 * @param fillStyle {Brush} the brush used for filling the shape
 * @param fill      {boolean} whether or not the shape is filled with a colour
 * @param shape     {Circle|Rectangle|Ellipse|Line|Polygon} The shape object to draw.
 */
function GraphicsData(lineWidth, strokeStyle, fillStyle, fill, shape)
{
    /*
     * @member {number} the width of the line to draw
     */
    this.lineWidth = lineWidth;

    /*
     * @member {Brush} the style of the line to draw
     */
    this.strokeStyle = strokeStyle;

    /*
     * @member {Brush} the style of the fill
     */
    this.fillStyle = fillStyle;

    /*
     * @member {boolean} whether or not the shape is filled with a colour
     */
    this.fill = fill;

    /*
     * @member {Circle|Rectangle|Ellipse|Line|Polygon} The shape object to draw.
     */
    this.shape = shape;

    /*
     * @member {number} The type of the shape, see the Const.Shapes file for all the existing types,
     */
    this.type = shape.type;
}

GraphicsData.prototype.constructor = GraphicsData;
module.exports = GraphicsData;

/**
 * Creates a new GraphicsData object with the same values as this one.
 *
 * @return {GraphicsData}
 */
GraphicsData.prototype.clone = function ()
{
    return new GraphicsData(
        this.lineWidth,
        this.strokeStyle,
        this.fillStyle,
        this.fill,
        this.shape
    );
};
