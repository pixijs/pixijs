import { type ExtensionMetadata, ExtensionType } from '../../extensions/Extensions';
import { VERSION } from '../const';

import type { Application } from '../../app/Application';
import type { System } from '../../rendering/renderers/shared/system/System';
import type { Renderer } from '../../rendering/renderers/types';

const typeSymbolApplicationInitHook = Symbol.for('pixijs.ApplicationInitHook');
const typeSymbolRendererInitHook = Symbol.for('pixijs.RendererInitHook');

declare global
{
    /* eslint-disable no-var */
    var __PIXI_APP_INIT__: undefined | ((arg: Application | Renderer, version: string) => void);
    var __PIXI_RENDERER_INIT__: undefined | ((arg: Application | Renderer, version: string) => void);
    /* eslint-enable no-var */
}

/**
 * Calls global __PIXI_APP_INIT__ hook with the application instance, after the application is initialized.
 * @category app
 * @internal
 */
export class ApplicationInitHook
{
    /**
     * Type symbol used to identify instances of ApplicationInitHook.
     * @internal
     */
    public readonly [typeSymbolApplicationInitHook] = true;

    /**
     * Checks if the given object is a ApplicationInitHook.
     * @param obj - The object to check.
     * @returns True if the object is a ApplicationInitHook, false otherwise.
     */
    public static isApplicationInitHook(obj: any): obj is ApplicationInitHook
    {
        return !!obj && !!obj[typeSymbolApplicationInitHook];
    }

    /** @ignore */
    public static extension: ExtensionMetadata = ExtensionType.Application;
    public static init(): void
    {
        globalThis.__PIXI_APP_INIT__?.(this as unknown as Application, VERSION);
    }
    public static destroy(): void
    {
        // nothing to do
    }
}

/**
 * Calls global __PIXI_RENDERER_INIT__ hook with the renderer instance, after the renderer is initialized.
 * @category rendering
 * @internal
 */
export class RendererInitHook implements System
{
    /**
     * Type symbol used to identify instances of RendererInitHook.
     * @internal
     */
    public readonly [typeSymbolRendererInitHook] = true;

    /**
     * Checks if the given object is a RendererInitHook.
     * @param obj - The object to check.
     * @returns True if the object is a RendererInitHook, false otherwise.
     */
    public static isRendererInitHook(obj: any): obj is RendererInitHook
    {
        return !!obj && !!obj[typeSymbolRendererInitHook];
    }

    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
        ],
        name: 'initHook',
        priority: -10,
    } as const;

    private _renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }
    public init(): void
    {
        globalThis.__PIXI_RENDERER_INIT__?.(this._renderer, VERSION);
    }
    public destroy(): void
    {
        this._renderer = null;
    }
}
