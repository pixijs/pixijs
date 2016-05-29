/**
 * Frustrum
 * @class
 * @namespace PIXI
 * @constructor
 */
function Frustrum() {
    this._focus = 0;

    this._near = 0;

    this._far = 0;

    /**
     * version of the Frustrum
     * @type {number}
     */
    this.version = 0;
}

Object.defineProperties(Frustrum.prototype, {
    /**
     * Focus
     * @member {number}
     * @memberof PIXI.Frustrum#
     */
    focus: {
        get: function () {
            return this._focus;
        }
    },
    /**
     * Near plane
     * @member {number}
     * @memberof PIXI.Frustrum#
     */
    near: {
        get: function () {
            return this._near;
        }
    },
    /**
     * Far plane
     * @member {number}
     * @memberof PIXI.Frustrum#
     */
    far: {
        get: function () {
            return this._far;
        }
    }
});

Frustrum.prototype.constructor = Frustrum;
module.exports = Frustrum;

/**
 * Sets params for frustrum
 */
Frustrum.prototype.set = function (focus, near, far) {
    if (this._focus !== focus || this._near !== near || this._far !== far) {
        this._focus = focus;
        this._near = near;
        this._far = far;
        this.version++;
    }
};

Frustrum.prototype.copy = function (frustrum) {
    var focus = frustrum._focus;
    var near = frustrum._near;
    var far = frustrum._far;
    if (this._focus !== focus || this._near !== near || this._far !== far) {
        this._focus = focus;
        this._near = near;
        this._far = far;
        this.version++;
    }
};
