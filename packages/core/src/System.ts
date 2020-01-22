import { Renderer } from './Renderer';
/**
 * System is a base class used for extending systems used by the {@link PIXI.Renderer}
 *
 * @see PIXI.Renderer#addSystem
 * @class
 * @memberof PIXI
 */
export class System
{
    renderer: Renderer;
    /**
     * @param {PIXI.Renderer} renderer - The renderer this manager works for.
     */
    constructor(renderer: Renderer)
    {
        /**
         * The renderer this manager works for.
         *
         * @member {PIXI.Renderer}
         */
        this.renderer = renderer;
    }

    /**
     * Generic destroy methods to be overridden by the subclass
     */
    destroy()
    {
        this.renderer = null;
    }
}
