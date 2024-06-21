import { type ExtensionMetadata, ExtensionType } from '../../extensions/Extensions';

import type { Application } from '../../app/Application';
import type { System } from '../../rendering/renderers/shared/system/System';
import type { Renderer } from '../../rendering/renderers/types';

declare global
{
    /* eslint-disable no-var */
    var __PIXI_APP_INIT__: undefined | ((arg: Application | Renderer) => void);
    var __PIXI_RENDERER_INIT__: undefined | ((arg: Application | Renderer) => void);
    /* eslint-enable no-var */
}

/**
 * Calls global __PIXI_APP_INIT__ hook with the application instance, after the application is initialized.
 * @memberof app
 */
export class ApplicationInitHook
{
    /** @ignore */
    public static extension: ExtensionMetadata = ExtensionType.Application;
    public static init(): void
    {
        globalThis.__PIXI_APP_INIT__?.(this as unknown as Application);
    }
    public static destroy(): void
    {
        // nothing to do
    }
}

/**
 * Calls global __PIXI_RENDERER_INIT__ hook with the renderer instance, after the renderer is initialized.
 * @memberof rendering
 */
export class RendererInitHook implements System
{
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
        globalThis.__PIXI_RENDERER_INIT__?.(this._renderer);
    }
    public destroy(): void
    {
        this._renderer = null;
    }
}
