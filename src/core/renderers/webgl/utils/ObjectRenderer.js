var WebGLManager = require('../managers/WebGLManager');

/**
 * Base for a common object renderer that can be used as a system renderer plugin.
 *
 * @class
 * @memberof PIXI
 * @param renderer {WebGLRenderer} The renderer this object renderer works for.
 */
function ObjectRenderer(renderer)
{
    WebGLManager.call(this, renderer);
}


ObjectRenderer.prototype = Object.create(WebGLManager.prototype);
ObjectRenderer.prototype.constructor = ObjectRenderer;
module.exports = ObjectRenderer;

ObjectRenderer.prototype.start = function ()
{
    // set the shader..
};

ObjectRenderer.prototype.stop = function ()
{
    this.flush();
};

ObjectRenderer.prototype.flush = function ()
{
    // flush!
};

ObjectRenderer.prototype.render = function (/* object */)
{
    // render the object
};
