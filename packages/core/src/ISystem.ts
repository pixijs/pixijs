import type { Renderer } from './Renderer';

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
