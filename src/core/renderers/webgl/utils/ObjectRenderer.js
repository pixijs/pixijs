import WebGLSystem from '../systems/WebGLSystem';

/**
 * Base for a common object renderer that can be used as a system renderer plugin.
 *
 * @class
 * @extends PIXI.WebGLSystem
 * @memberof PIXI
 */
export default class ObjectRenderer extends WebGLSystem
{
    /**
     * Starts the renderer and sets the shader
     *
     */
    start()
    {
        // set the shader..
    }

    /**
     * Stops the renderer
     *
     */
    stop()
    {
        this.flush();
    }

    /**
     * Stub method for rendering content and emptying the current batch.
     *
     */
    flush()
    {
        // flush!
    }

    /**
     * Renders an object
     *
     * @param {PIXI.DisplayObject} object - The object to render.
     */
    render(object) // eslint-disable-line no-unused-vars
    {
        // render the object
    }
}
