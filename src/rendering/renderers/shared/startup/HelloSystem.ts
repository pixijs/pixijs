import { ExtensionType } from '../../../../extensions/Extensions';
import { sayHello } from '../../../../utils/sayHello';

import type { Renderer } from '../../types';
import type { System } from '../system/System';

/**
 * Options for the startup system.
 * @ignore
 */
export interface HelloSystemOptions
{
    /**
     * Whether to log the version and type information of renderer to console.
     * @memberof PIXI.RendererOptions
     */
    hello: boolean;
}
/**
 * A simple system responsible for initiating the renderer.
 * @memberof PIXI
 */
export class HelloSystem implements System<HelloSystemOptions>
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'hello',
        priority: 0,
    } as const;

    /** @ignore */
    static defaultOptions: HelloSystemOptions = {
        /**
         * {@link PIXI.WebGLOptions.hello}
         * @default false
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
    init(options: HelloSystemOptions): void
    {
        if (options.hello)
        {
            // eslint-disable-next-line no-console
            sayHello(this.renderer.name);
        }
    }
}
