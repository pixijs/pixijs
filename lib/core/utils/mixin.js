"use strict";

exports.__esModule = true;
exports.mixin = mixin;
exports.delayMixin = delayMixin;
exports.performMixins = performMixins;
/**
 * Mixes all enumerable properties and methods from a source object to a target object.
 *
 * @memberof PIXI.utils.mixins
 * @function mixin
 * @param {object} target The prototype or instance that properties and methods should be added to.
 * @param {object} source The source of properties and methods to mix in.
 */
function mixin(target, source) {
    if (!target || !source) return;
    // in ES8/ES2017, this would be really easy:
    // Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));

    // get all the enumerable property keys
    var keys = Object.keys(source);

    // loop through properties
    for (var i = 0; i < keys.length; ++i) {
        var propertyName = keys[i];

        // Set the property using the property descriptor - this works for accessors and normal value properties
        Object.defineProperty(target, propertyName, Object.getOwnPropertyDescriptor(source, propertyName));
    }
}

var mixins = [];

/**
 * Queues a mixin to be handled towards the end of the initialization of PIXI, so that deprecation
 * can take effect.
 *
 * @memberof PIXI.utils.mixins
 * @function delayMixin
 * @private
 * @param {object} target The prototype or instance that properties and methods should be added to.
 * @param {object} source The source of properties and methods to mix in.
 */
function delayMixin(target, source) {
    mixins.push(target, source);
}

/**
 * Handles all mixins queued via delayMixin().
 *
 * @memberof PIXI.utils.mixins
 * @function performMixins
 * @private
 */
function performMixins() {
    for (var i = 0; i < mixins.length; i += 2) {
        mixin(mixins[i], mixins[i + 1]);
    }
    mixins.length = 0;
}
//# sourceMappingURL=mixin.js.map