/**
 * Constants that define the location of the drop shadow that can be applied to text.
 *
 * @static
 * @constant
 * @name TEXT_DROPSHADOWLOCATION
 * @memberof PIXI
 * @type {object}
 * @property {number} FILL Only add a drop shadow to the 'fill'
 * @property {number} STROKE Only add a drop shadow to the 'stroke'
 * @property {number} BOTH Add a drop shadow to both the 'fill' and the 'stroke'
 */
export const TEXT_DROPSHADOWLOCATION = {
    FILL: 0,
    STROKE: 1,
    BOTH: 2,
};

/**
 * Constants that define the type of gradient that can be applied to text.
 *
 * @static
 * @constant
 * @name TEXT_GRADIENT
 * @memberof PIXI
 * @type {object}
 * @property {number} LINEAR_VERTICAL Vertical gradient
 * @property {number} LINEAR_HORIZONTAL Linear gradient
 */
export const TEXT_GRADIENT = {
    LINEAR_VERTICAL: 0,
    LINEAR_HORIZONTAL: 1,
};
