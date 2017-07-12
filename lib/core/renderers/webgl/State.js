"use strict";

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-disable max-len */

var BLEND = 0;
var OFFSET = 1;
var CULLING = 2;
var DEPTH_TEST = 3;
var WINDING = 4;

/**
 * This is a webGL state. It is passed The WebGL StateManager.
 * Each mesh renderered may require webGL to be in a different state.
 * For example you may want different blend mode or to enable polygon offsets
 *
 * @class
 */

var State = function () {
    /**
     *
     */
    function State() {
        _classCallCheck(this, State);

        this.data = 0;

        this.blendMode = 0;
        this.polygonOffset = 0;

        this.blend = true;
        //  this.depthTest = true;
    }

    /**
     * Activates blending of the computed fragment color values
     *
     * @member {boolean}
     */


    _createClass(State, [{
        key: "blend",
        get: function get() {
            return !!(this.data & 1 << BLEND);
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            if (!!(this.data & 1 << BLEND) !== value) {
                this.data ^= 1 << BLEND;
            }
        }

        /**
         * Activates adding an offset to depth values of polygon's fragments
         *
         * @member {boolean}
         * @default false
         */

    }, {
        key: "offsets",
        get: function get() {
            return !!(this.data & 1 << OFFSET);
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            if (!!(this.data & 1 << OFFSET) !== value) {
                this.data ^= 1 << OFFSET;
            }
        }

        /**
         * Activates culling of polygons.
         *
         * @member {boolean}
         * @default false
         */

    }, {
        key: "culling",
        get: function get() {
            return !!(this.data & 1 << CULLING);
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            if (!!(this.data & 1 << CULLING) !== value) {
                this.data ^= 1 << CULLING;
            }
        }

        /**
         * Activates depth comparisons and updates to the depth buffer.
         *
         * @member {boolean}
         * @default false
         */

    }, {
        key: "depthTest",
        get: function get() {
            return !!(this.data & 1 << DEPTH_TEST);
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            if (!!(this.data & 1 << DEPTH_TEST) !== value) {
                this.data ^= 1 << DEPTH_TEST;
            }
        }

        /**
         * Specifies whether or not front or back-facing polygons can be culled.
         * @member {boolean}
         * @default false
         */

    }, {
        key: "clockwiseFrontFace",
        get: function get() {
            return !!(this.data & 1 << WINDING);
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            if (!!(this.data & 1 << WINDING) !== value) {
                this.data ^= 1 << WINDING;
            }
        }

        /**
         * The blend mode to be applied when this state is set. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
         * Setting this mode to anything other than NO_BLEND will automatically switch blending on.
         *
         * @member {boolean} value
         * @default PIXI.BLEND_MODES.NORMAL
         * @see PIXI.BLEND_MODES
         */

    }, {
        key: "blendMode",
        get: function get() {
            return this._blendMode;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            // 17 is NO BLEND
            this.blend = value !== 17;
            this._blendMode = value;
        }

        /**
         * The polygon offset. Setting this property to anything other than 0 will automatically enable poygon offset fill.
         *
         * @member {number}
         * @default 0
         */

    }, {
        key: "polygonOffset",
        get: function get() {
            return this._polygonOffset;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this.offsets = !!value;
            this._polygonOffset = value;
        }
    }]);

    return State;
}();

exports.default = State;
//# sourceMappingURL=State.js.map