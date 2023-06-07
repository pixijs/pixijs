import type { Renderer } from '../../types';

export interface ISystem<INIT_OPTIONS = null, DESTROY_OPTIONS = null>
{
    init?: (options?: INIT_OPTIONS) => void;
    /** Generic destroy methods to be overridden by the subclass */
    destroy?: (options?: DESTROY_OPTIONS) => void;
}

export interface ISystemConstructor<R = Renderer>
{
    new (renderer: R): ISystem;
}
