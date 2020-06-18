import type { Renderer } from './Renderer';

/**
 * System is a base class used for extending systems used by the {@link PIXI.Renderer}
 *
 * @see PIXI.Renderer#addSystem
 * @class
 * @memberof PIXI
 */
export class System
{
    // public because of Filter usage,
    // protected because usually renderer it already known by those who use the system
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
    destroy(): void
    {
        (this as any).renderer = null;
    }
}
