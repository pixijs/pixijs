var Container = require('./Container'),
    Transform2d = require('../c2d/Transform2d');

/**
 * Camera object, stores everything in `projection` instead of `transform`
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
function Camera2d()
{
    Container.call(this);
}

// constructor
Camera2d.prototype = Object.create(Container.prototype);
Camera2d.prototype.constructor = Camera2d;
module.exports = Camera2d;

Camera2d.prototype.initTransform = function() {
    this.projection = new Transform2d(true);
    this.displayObjectInitTransform(true);
};

Object.defineProperties(Camera2d.prototype, {
    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    x: {
        get: function ()
        {
            return this.projection.position.x;
        },
        set: function (value)
        {
            this.projection.position.x = value;
        }
    },

    /**
     * The position of the displayObject on the y axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    y: {
        get: function ()
        {
            return this.projection.position.y;
        },
        set: function (value)
        {
            this.projection.position.y = value;
        }
    },

    /**
     * The coordinate of the object relative to the local coordinates of the parent.
     *
     * @member {PIXI.Point}
     */
    position: {
        get: function()
        {
            return this.projection.position;
        },
        set: function(value) {
            this.projection.position.copy(value);
        }
    },

    /**
     * The scale factor of the object.
     *
     * @member {PIXI.Point}
     */
    scale: {
        get: function() {
            return this.projection.scale;
        },
        set: function(value) {
            this.projection.scale.copy(value);
        }
    },

    /**
     * The pivot point of the displayObject that it rotates around
     *
     * @member {PIXI.Point}
     */
    pivot: {
        get: function() {
            return this.projection.pivot;
        },
        set: function(value) {
            this.projection.pivot.copy(value);
        }
    },

    /**
     * The skew factor for the object in radians.
     *
     * @member {PIXI.Point}
     */
    skew: {
        get: function() {
            return this.projection.skew;
        },
        set: function(value) {
            this.projection.skew.copy(value);
        }
    },

    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     */
    rotation: {
        get: function ()
        {
            return this.projection.rotation;
        },
        set: function (value)
        {
            this.projection.rotation = value;
        }
    }
});
