/**
 * An object indicating an error caused by a target not supported by a plugin.
 * The error would let the plugin initializer ignore the plugin for the target.
 */
export class UnsupportedTargetError extends Error
{
    /**
     * The constructor of UnsupportedTargetError. Its behavior corresponds to
     * one of the Error constructor.
     * @param {string} message - The semantics is same with Error constructor.
     */
    constructor(message)
    {
        super(message);

        // Extending builtins like Error and Array doesn't work in 6.x · Issue
        // #3083 · babel/babel
        // https://github.com/babel/babel/issues/3083
        // A workaround for Babel ES2015 classes transform.
        Object.setPrototypeOf(this, UnsupportedTargetError.prototype);
    }
}

UnsupportedTargetError.prototype.name = 'UnsupportedPIXIPluginTargetError';

/**
 * Mixins functionality to make an object have "plugins".
 *
 * @example
 *      function MyObject() {}
 *
 *      pluginTarget.mixin(MyObject);
 *
 * @mixin
 * @memberof PIXI.utils
 * @param {object} obj - The object to mix into.
 */
function pluginTargetMixin(obj)
{
    obj.__plugins = {};

    /**
     * Adds a plugin to an object
     *
     * @param {string} pluginName - The events that should be listed.
     * @param {Function} ctor - The constructor function for the plugin.
     */
    obj.registerPlugin = function registerPlugin(pluginName, ctor)
    {
        obj.__plugins[pluginName] = ctor;
    };

    /**
     * Instantiates all the plugins of this object
     *
     */
    obj.prototype.initPlugins = function initPlugins()
    {
        this.plugins = this.plugins || {};

        for (const o in obj.__plugins)
        {
            try
            {
                this.plugins[o] = new (obj.__plugins[o])(this);
            }
            catch (error)
            {
                if (!(error instanceof UnsupportedTargetError))
                {
                    throw error;
                }
            }
        }
    };

    /**
     * Removes all the plugins of this object
     *
     */
    obj.prototype.destroyPlugins = function destroyPlugins()
    {
        for (const o in this.plugins)
        {
            this.plugins[o].destroy();
            this.plugins[o] = null;
        }

        this.plugins = null;
    };
}

export const pluginTarget = {
    /**
     * Mixes in the properties of the pluginTarget into another object
     *
     * @param {object} obj - The obj to mix into
     */
    mixin: function mixin(obj)
    {
        pluginTargetMixin(obj);
    },
};
