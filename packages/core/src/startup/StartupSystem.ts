import { extensions, ExtensionType } from '@pixi/extensions';

import type { ExtensionMetadata } from '@pixi/extensions';
import type { IRenderer } from '../IRenderer';
import type { ISystem } from '../system/ISystem';

/**
 * Options for the startup system.
 * @memberof PIXI
 */
export interface StartupSystemOptions
{
    /**
     * Whether to log the version and type information of renderer to console.
     * @memberof PIXI.IRendererOptions
     */
    hello: boolean;
}

/**
 * A simple system responsible for initiating the renderer.
 * @memberof PIXI
 */
export class StartupSystem implements ISystem<StartupSystemOptions>
{
    /** @ignore */
    static defaultOptions: StartupSystemOptions = {
        /**
         * {@link PIXI.IRendererOptions.hello}
         * @default false
         * @memberof PIXI.settings.RENDER_OPTIONS
         */
        hello: false,
    };

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
    run(options: StartupSystemOptions): void
    {
        const { renderer } = this;

        renderer.runners.init.emit(renderer.options);

        if (options.hello)
        {
            // eslint-disable-next-line no-console
            console.log(`PixiJS ${process.env.VERSION} - ${renderer.rendererLogId} - https://pixijs.com`);
        }

        renderer.resize(renderer.screen.width, renderer.screen.height);
    }

    destroy(): void
    {
        // ka pow!
    }
}

extensions.add(StartupSystem);
