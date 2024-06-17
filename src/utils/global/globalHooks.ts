import type { Application } from '../../app/Application';
import type { Renderer } from '../../rendering/renderers/types';

declare global
{
    /* eslint-disable no-var */
    var __PIXI_APP_INIT__: undefined | ((arg: Application | Renderer) => void);
    var __PIXI_RENDERER_INIT__: undefined | ((arg: Application | Renderer) => void);
    /* eslint-enable no-var */
}

export function rendererCreatedHook(renderer: Renderer)
{
    globalThis.__PIXI_RENDERER_INIT__?.(renderer);
}

export function appCreatedHook(app: Application)
{
    globalThis.__PIXI_APP_INIT__?.(app);
}
