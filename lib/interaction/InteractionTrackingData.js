"use strict";

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * DisplayObjects with the {@link PIXI.interaction.interactiveTarget} mixin use this class to track interactions
 *
 * @class
 * @private
 * @memberof PIXI.interaction
 */
var InteractionTrackingData = function () {
    /**
     * @param {number} pointerId - Unique pointer id of the event
     */
    function InteractionTrackingData(pointerId) {
        _classCallCheck(this, InteractionTrackingData);

        this._pointerId = pointerId;
        this._flags = InteractionTrackingData.FLAGS.NONE;
    }

    /**
     *
     * @private
     * @param {number} flag - The interaction flag to set
     * @param {boolean} yn - Should the flag be set or unset
     */


    InteractionTrackingData.prototype._doSet = function _doSet(flag, yn) {
        if (yn) {
            this._flags = this._flags | flag;
        } else {
            this._flags = this._flags & ~flag;
        }
    };

    /**
     * Unique pointer id of the event
     *
     * @readonly
     * @member {number}
     */


    _createClass(InteractionTrackingData, [{
        key: "pointerId",
        get: function get() {
            return this._pointerId;
        }

        /**
         * State of the tracking data, expressed as bit flags
         *
         * @member {number}
         * @memberof PIXI.interaction.InteractionTrackingData#
         */

    }, {
        key: "flags",
        get: function get() {
            return this._flags;
        }

        /**
         * Set the flags for the tracking data
         *
         * @param {number} flags - Flags to set
         */
        ,
        set: function set(flags) {
            this._flags = flags;
        }

        /**
         * Is the tracked event inactive (not over or down)?
         *
         * @member {number}
         * @memberof PIXI.interaction.InteractionTrackingData#
         */

    }, {
        key: "none",
        get: function get() {
            return this._flags === this.constructor.FLAGS.NONE;
        }

        /**
         * Is the tracked event over the DisplayObject?
         *
         * @member {boolean}
         * @memberof PIXI.interaction.InteractionTrackingData#
         */

    }, {
        key: "over",
        get: function get() {
            return (this._flags & this.constructor.FLAGS.OVER) !== 0;
        }

        /**
         * Set the over flag
         *
         * @param {boolean} yn - Is the event over?
         */
        ,
        set: function set(yn) {
            this._doSet(this.constructor.FLAGS.OVER, yn);
        }

        /**
         * Did the right mouse button come down in the DisplayObject?
         *
         * @member {boolean}
         * @memberof PIXI.interaction.InteractionTrackingData#
         */

    }, {
        key: "rightDown",
        get: function get() {
            return (this._flags & this.constructor.FLAGS.RIGHT_DOWN) !== 0;
        }

        /**
         * Set the right down flag
         *
         * @param {boolean} yn - Is the right mouse button down?
         */
        ,
        set: function set(yn) {
            this._doSet(this.constructor.FLAGS.RIGHT_DOWN, yn);
        }

        /**
         * Did the left mouse button come down in the DisplayObject?
         *
         * @member {boolean}
         * @memberof PIXI.interaction.InteractionTrackingData#
         */

    }, {
        key: "leftDown",
        get: function get() {
            return (this._flags & this.constructor.FLAGS.LEFT_DOWN) !== 0;
        }

        /**
         * Set the left down flag
         *
         * @param {boolean} yn - Is the left mouse button down?
         */
        ,
        set: function set(yn) {
            this._doSet(this.constructor.FLAGS.LEFT_DOWN, yn);
        }
    }]);

    return InteractionTrackingData;
}();

exports.default = InteractionTrackingData;


InteractionTrackingData.FLAGS = Object.freeze({
    NONE: 0,
    OVER: 1 << 0,
    LEFT_DOWN: 1 << 1,
    RIGHT_DOWN: 1 << 2
});
//# sourceMappingURL=InteractionTrackingData.js.map