import type { ISystem } from '../system/ISystem';
import type { Renderer } from '../Renderer';

/**
 * Base for a common object renderer that can be used as a
 * system renderer plugin.
 * @memberof PIXI
 */
export class ObjectRenderer implements ISystem
{
    /** The renderer this manager works for. */
    protected renderer: Renderer;

    /**
     * @param renderer - The renderer this manager works for.
     */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    /** Stub method that should be used to empty the current batch by rendering objects now. */
    flush(): void
    {
        // flush!
    }

    /** Generic destruction method that frees all resources. This should be called by subclasses. */
    destroy(): void
    {
        this.renderer = null;
    }

    /**
     * Stub method that initializes any state required before
     * rendering starts. It is different from the `prerender`
     * signal, which occurs every frame, in that it is called
     * whenever an object requests _this_ renderer specifically.
     */
    start(): void
    {
        // set the shader..
    }

    /** Stops the renderer. It should free up any state and become dormant. */
    stop(): void
    {
        this.flush();
    }

    /**
     * Keeps the object to render. It doesn't have to be
     * rendered immediately.
     * @param {PIXI.DisplayObject} _object - The object to render.
     */
    render(_object: any): void // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    {
        // render the object
    }
}
