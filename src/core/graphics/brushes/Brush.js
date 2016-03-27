/**
 * The base class for brush subclasses, which define how a shape should be filled or stroked
 *
 * @class
 * @param color {Number} The color of the brush
 * @param alpha {Number} The alpha of the brush
 * @memberof PIXI
 */
function Brush(color, alpha)
{
    /**
     * @member {number}
     */
    this.color = color;

    /**
     * @member {number}
     * @default 1
     */
    this.alpha = (alpha === undefined) ? 1 : alpha;
}

module.exports = Brush;