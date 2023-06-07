import { ExtensionType } from '../../../../extensions/Extensions';

import type { ExtensionMetadata } from '../../../../extensions/Extensions';
import type { Renderer } from '../../types';
import type { ISystem } from '../system/ISystem';

/**
 * Options for the startup system.
 * @ignore
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
 */export class StartupSystem implements ISystem<StartupSystemOptions>
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGLRendererSystem,
            ExtensionType.WebGPURendererSystem,
            ExtensionType.CanvasRendererSystem,
        ],
        name: 'startup',
        priority: 0,
    };

    /** @ignore */
    static defaultOptions: StartupSystemOptions = {
        /**
         * {@link PIXI.WebGLRendererOptions.hello}
         * @default false
         * @memberof PIXI.settings.GL_RENDER_OPTIONS
         */
        hello: false,
    };

    readonly renderer: Renderer;

    constructor(renderer: Renderer)
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
            console.log(`PixiJS ${'$_VERSION'} - ${renderer.rendererLogId} - https://pixijs.com`);
        }

        // TODO: screen doesn't exist on renderer yet
        // renderer.resize(renderer.screen.width, renderer.screen.height);
    }

    destroy(): void
    {
        // ka pow!
    }
}
