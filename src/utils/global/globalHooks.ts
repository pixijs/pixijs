import type { Application } from '../../app/Application';
import type { Renderer } from '../../rendering/renderers/types';

declare global
{
    var __PIXI_APP_INIT__:undefined | ((arg: Application | Renderer) => void);
    var __PIXI_RENDERER_INIT__: undefined | ((arg: Application | Renderer) => void);
}

export function pixiRendererCreated(renderer: Renderer)
{
    globalThis.__PIXI_RENDERER_INIT__?.(renderer);
}

export function pixiAppCreated(app: Application)
{
    globalThis.__PIXI_APP_INIT__?.(app);
}
