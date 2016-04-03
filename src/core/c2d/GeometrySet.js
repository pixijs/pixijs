var Geometry2d = require('./Geometry2d');

/**
 * Storage for geometries
 *
 * @class
 * @memberof PIXI
 */
function GeometrySet(local) {
    this.local = local || new Geometry2d();
    this.computed = null;
    this.projected = null;
    this.valid = true;
    //TODO: add "valid" field
}

GeometrySet.prototype.getBounds = function (computed, projected) {
    this.computed = computed.updateChildGeometry(this.computed, this.local);
    if (projected) {
        this.projected = projected.updateChildGeometry(this.projected, this.computed);
        return this.projected.getBounds();
    }
    return this.computed.getBounds();
};

module.exports = GeometrySet;
