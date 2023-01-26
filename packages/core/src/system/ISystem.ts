import type { Renderer } from '../Renderer';
import type { StartupOptions } from '../systems';

/**
 * Interface for systems used by the {@link PIXI.Renderer}.
 * @memberof PIXI
 */
export interface ISystem<DESTROY_OPTIONS = null>
{
    init?(options?: StartupOptions): void;
    /** Generic destroy methods to be overridden by the subclass */
    destroy?(options?: DESTROY_OPTIONS): void;
}

/**
 * Types for system and pipe classes.
 * @ignore
 */
export interface ISystemConstructor<R = Renderer>
{
    new (renderer: R): ISystem;
}
