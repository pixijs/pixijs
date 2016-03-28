var GeometrySet = require('./GeometrySet');

/**
 * Storage for geometries
 *
 * @class
 * @memberof PIXI
 */
function GeometrySetProxy() {
    this.original = null;
    this.projected = null;
    this.value = false;
    //TODO: add "valid" field
}

GeometrySetProxy.prototype = Object.create(GeometrySet.prototype);
GeometrySetProxy.prototype.constructor = GeometrySetProxy;

Object.defineProperties(GeometrySetProxy.prototype, {
    local: function() {
        return this.original.local;
    },
    computed: function() {
        return this.original.computed;
    }
});

GeometrySetProxy.prototype.wrap = function(original) {
    this.original = original;
    this.valid = !!original;
    return this;
};

module.exports = GeometrySetProxy;
