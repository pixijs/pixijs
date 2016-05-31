var core = require('../../core');

/**
 * Prepare uploads elements to the GPU. The CanvasRenderer version of prepare
 * provides the same APIs as the WebGL version, but doesn't do anything.
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.CanvasRenderer} A reference to the current renderer
 */
function Prepare()
{
}

Prepare.prototype.constructor = Prepare;
module.exports = Prepare;

/**
 * Stub method for upload.
 * @method upload
 */
Prepare.prototype.upload = function(displayObject, done)
{
    if (typeof displayObject === 'function')
    {
        done = displayObject;
        displayObject = null;
    }
    done();
};

/**
 * Stub method for registering hooks.
 * @method upload
 */
Prepare.prototype.register = function()
{
    return this;
};

/**
 * Stub method for adding items.
 * @method upload
 */
Prepare.prototype.add = function()
{
    return this;
};

/**
 * Stub method for destroying plugin.
 * @method destroy
 */
Prepare.prototype.destroy = function()
{

};

core.CanvasRenderer.registerPlugin('prepare', Prepare);