import type { Application } from '../../app/Application';
import type { Renderer } from '../../rendering/renderers/types';

interface Globals
{
    __PIXI_APP_INIT__?: (arg: Application | Renderer) => void;
    __PIXI_RENDERER_INIT__?: (arg: Application | Renderer) => void;
}

export function pixiRendererCreated(renderer: Renderer)
{
    const gThis = globalThis as unknown as Globals;

    gThis.__PIXI_RENDERER_INIT__?.(renderer);
}

export function pixiAppCreated(app: Application)
{
    const gThis = globalThis as unknown as Globals;

    gThis.__PIXI_APP_INIT__?.(app);
}
