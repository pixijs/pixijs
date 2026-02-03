import type { Renderer } from '../../types';
import type { RendererDestroyOptions } from './AbstractRenderer';

/**
 * A system is a generic interface for a renderer system.
 * It is used to define the methods that a system should implement.
 * @category rendering
 * @advanced
 */
export interface System<INIT_OPTIONS = null, DESTROY_OPTIONS = RendererDestroyOptions>
{
    init?: (options: INIT_OPTIONS) => void;
    /** Generic destroy methods to be overridden by the subclass */
    destroy?: (options?: DESTROY_OPTIONS) => void;
}

/**
 * The constructor for a System.
 * It is used to create instances of systems that can be added to a renderer.
 * @category rendering
 * @advanced
 */
export interface SystemConstructor
{
    new (renderer: Renderer): System;
}
