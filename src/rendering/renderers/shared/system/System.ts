import type { Renderer } from '../../types';
import type { RendererDestroyOptions } from './AbstractRenderer';

export interface System<INIT_OPTIONS = null, DESTROY_OPTIONS = RendererDestroyOptions>
{
    init?: (options: INIT_OPTIONS) => void;
    /** Generic destroy methods to be overridden by the subclass */
    destroy?: (options?: DESTROY_OPTIONS) => void;
}

export interface SystemConstructor
{
    new (renderer: Renderer): System;
}
