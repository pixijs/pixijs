/**
 * A target and pass info object for filters.
 *
 * @class
 * @namespace PIXI
 */
function FilterBlock() {
    /**
     * The visible state of this FilterBlock.
     *
     * @member {boolean}
     */
    this.visible = true;

    /**
     * The renderable state of this FilterBlock.
     *
     * @member {boolean}
     */
    this.renderable = true;
}

FilterBlock.prototype.constructor = FilterBlock;
module.exports = FilterBlock;
