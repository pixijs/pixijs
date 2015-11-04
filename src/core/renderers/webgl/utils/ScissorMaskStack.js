/**
 * Generic Mask Stack data structure
 * @class
 * @memberof PIXI
 */
function ScissorMaskStack()
{
  /**
     * The actual stack
     *
     * @member {any[]}
     */
    this.scissorStack = [];
}

ScissorMaskStack.prototype.constructor = ScissorMaskStack;
module.exports = ScissorMaskStack;
