import type { DestroyOptions } from '../../../../scene/container/destroyTypes';
import type { Renderer } from '../../types';

export interface System<INIT_OPTIONS = null, DESTROY_OPTIONS = DestroyOptions>
{
    init?: (options?: INIT_OPTIONS) => void;
    /** Generic destroy methods to be overridden by the subclass */
    destroy?: (options?: DESTROY_OPTIONS) => void;
}

export interface SystemConstructor
{
    new (renderer: Renderer): System;
}

