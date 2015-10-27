var utils = require('../../../utils');

/**
 * Generic Mask Stack data structure
 * @class
 * @memberof PIXI
 */
function StencilMaskStack()
{
	/**
     * The actual stack
     *
     * @member {any[]}
     */
    this.stencilStack = [];

    /**
     * TODO @alvin
     *
     * @member {boolean}
     */
    this.reverse = true;

    /**
     * Internal count
     *
     * @member {number}
     */
    this.count = 0;
}

module.exports = utils.extend(StencilMaskStack);
