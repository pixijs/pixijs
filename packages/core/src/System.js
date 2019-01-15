/**
 * System is a base class used for extending systems used by the {@link PIXI.Renderer}
 *
 * @see PIXI.Renderer#addSystem
 * @class
 * @memberof PIXI
 */
export default class System
{
    /**
     * @param {PIXI.Renderer} renderer - The renderer this manager works for.
     */
    constructor(renderer)
    {
        /**
         * The renderer this manager works for.
         *
         * @member {PIXI.Renderer}
         */
        this.renderer = renderer;

        this.renderer.runners.contextChange.add(this);
    }

    /**
     * Generic method called when there is a WebGL context change.
     *
     * @param {WebGLRenderingContext} gl new webgl context
     */
    contextChange(gl) // eslint-disable-line no-unused-vars
    {
        // do some codes init!
    }

    /**
     * Generic destroy methods to be overridden by the subclass
     */
    destroy()
    {
        this.renderer.runners.contextChange.remove(this);
        this.renderer = null;
    }
}
