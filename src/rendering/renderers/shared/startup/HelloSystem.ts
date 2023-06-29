import { ExtensionType } from '../../../../extensions/Extensions';
import { sayHello } from '../../../../utils/sayHello';

import type { Renderer } from '../../types';
import type { ISystem } from '../system/System';

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
 */export class HelloSystem implements ISystem<StartupSystemOptions>
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGLRendererSystem,
            ExtensionType.WebGPURendererSystem,
            ExtensionType.CanvasRendererSystem,
        ],
        name: 'hello',
        priority: 0,
    } as const;

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
    init(options: StartupSystemOptions): void
    {
        if (options.hello)
        {
            // eslint-disable-next-line no-console
            sayHello(this.renderer.type);
        }
    }
}
