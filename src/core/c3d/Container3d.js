var Container = require('../display/Container'),
    Transform3d = require('./Transform3d'),
    ComputedTransform3d = require('./ComputedTransform3d');

/**
 * Container with built-in 3d transform
 * @constructor
 * @extends PIXI.Container
 */
function Container3d() {
    Container.call(this);
}

Container3d.prototype = Object.create(Container.prototype);
Container3d.prototype.constructor = Container3d;
module.exports = Container3d;

Container3d.prototype.initTransform = function() {
    this.transform = new Transform3d(true);
    this.computedTransform = new ComputedTransform3d();
};

Object.defineProperties(Container3d.prototype, {
    /**
     * The position of the displayObject on the z axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    z: {
        get: function ()
        {
            return this.transform.position.z;
        },
        set: function (value)
        {
            this.transform.position.z = value;
        }
    },

    /**
     * The rotation of the object as euler angles
     *
     * @member {number}
     */
    euler: {
        get: function ()
        {
            return this.transform.euler;
        },
        set: function (value)
        {
            this.transform.euler.copy(value);
        }
    }
});
