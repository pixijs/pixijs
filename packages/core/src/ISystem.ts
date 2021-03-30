import type { Renderer } from './Renderer';
import { deprecation } from '@pixi/utils';

/**
 * Interface for systems used by the {@link PIXI.Renderer}.
 * @memberof PIXI
 */
export interface ISystem
{
    /**
     * Generic destroy methods to be overridden by the subclass
     */
    destroy(): void;
}

/**
 * Types for system and pipe classes.
 *
 * @ignore
 */
export interface ISystemConstructor<R = Renderer>
{
    new (renderer: R): ISystem;
}

/**
 * Use the ISystem interface instead.
 * @deprecated since 6.1.0
 * @memberof PIXI
 */
export class System implements ISystem
{
    /** Reference to the main renderer */
    public renderer: Renderer;

    /**
     * @param renderer - Reference to Renderer
     */
    constructor(renderer: Renderer)
    {
        // #if _DEBUG
        deprecation('6.1.0', 'System class is deprecated, implemement ISystem interface instead.');
        // #endif

        this.renderer = renderer;
    }

    /** Destroy and don't use after this. */
    destroy(): void
    {
        this.renderer = null;
    }
}
