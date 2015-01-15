/**
 * Mixins functionality to make an object have "plugins".
 *
 * @mixin
 * @namespace PIXI
 * @param obj {object} The object to mix into.
 * @example
 *      function MyObject() {}
 *
 *      pluginTarget.mixin(MyObject);
 */
function pluginTarget(obj) {
    obj.__plugins = {};

    obj.registerPlugin = function (pluginName, ctor) {
        obj.__plugins[pluginName] = ctor;
    };

    obj.prototype.initPlugins = function () {
        this.plugins = {};

        for (var o in obj.__plugins) {
            this.plugins[o] = new (obj.__plugins[o])(this);
        }
    };
}

module.exports = pluginTarget;
