import { extensions, ExtensionType } from '@pixi/extensions';

import type { ExtensionMetadata } from '@pixi/extensions';
import type { IRenderer, IRendererOptions } from '../IRenderer';
import type { IRendererPlugins } from '../plugin/PluginSystem';
import type { ISystem } from '../system/ISystem';

export interface StartupOptions extends IRendererOptions
{
    plugins: IRendererPlugins,
}

/**
 * A simple system responsible for initiating the renderer.
 * @memberof PIXI
 */export class StartupSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.RendererSystem,
            ExtensionType.CanvasRendererSystem
        ],
        name: 'startup',
    };

    readonly renderer: IRenderer;

    constructor(renderer: IRenderer)
    {
        this.renderer = renderer;
    }

    /**
     * It all starts here! This initiates every system, passing in the options for any system by name.
     * @param options - the config for the renderer and all its systems
     */
    run(options: StartupOptions): void
    {
        const renderer = this.renderer;
        const opts = Object.freeze({ ...renderer.options, ...options });

        renderer.runners.init.emit(opts);

        if (options.hello)
        {
            // eslint-disable-next-line no-console
            console.log(`PixiJS ${'$_VERSION'} - ${renderer.rendererLogId} - https://pixijs.com`);
        }

        renderer.resize(this.renderer.screen.width, this.renderer.screen.height);
    }

    destroy(): void
    {
        // ka pow!
    }
}

extensions.add(StartupSystem);
