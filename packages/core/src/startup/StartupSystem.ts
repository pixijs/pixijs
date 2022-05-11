import { sayHello } from '@pixi/utils';
import type { BackgroundOptions } from '../background/BackgroundSystem';
import type { ViewOptions } from '../view/ViewSystem';
import type { IRendererPlugins } from '../plugin/PluginSystem';
import { IRenderer } from '../IRenderer';
import { ISystem } from '../system/ISystem';

// TODO this can be infered by good use of generics in the future..
export interface StartupOptions extends Record<string, unknown> {
    _plugin: IRendererPlugins,
    background: BackgroundOptions,
    _view: ViewOptions,
}

/**
 * A simple system responsible for initiating the renderer.
 *
 * @memberof PIXI
 */export class StartupSystem implements ISystem
{
    readonly renderer: IRenderer;

    constructor(renderer: IRenderer)
    {
        this.renderer = renderer;
    }

    /**
     * It all starts here! This initiates every system, passing in the options for any system by name.
     *
     * @param options - the config for the renderer and all its systems
     */
    run(options: StartupOptions): void
    {
        const renderer = this.renderer;

        renderer.emitWithCustomOptions(renderer.runners.init, options);

        sayHello(renderer.rendererLogId);

        renderer.resize(this.renderer.screen.width, this.renderer.screen.height);
    }

    destroy(): void
    {
        // ka pow!
    }
}
