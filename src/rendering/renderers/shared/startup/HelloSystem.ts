import { ExtensionType } from '../../../../extensions/Extensions';
import { sayHello } from '../../../../utils/sayHello';
import { type Renderer, RendererType } from '../../types';

import type { WebGLRenderer } from '../../gl/WebGLRenderer';
import type { System } from '../system/System';

/**
 * Options for the startup system.
 * @property {boolean} [hello=false] - Whether to log the version and type information of renderer to console.
 * @memberof rendering
 */
export interface HelloSystemOptions
{
    /**
     * Whether to log the version and type information of renderer to console.
     * @memberof rendering.SharedRendererOptions
     * @default false
     */
    hello: boolean;
}

/**
 * A simple system responsible for initiating the renderer.
 * @memberof rendering
 */
export class HelloSystem implements System<HelloSystemOptions>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'hello',
        priority: -2,
    } as const;

    /** The default options for the system. */
    public static defaultOptions: HelloSystemOptions = {
        /** {@link WebGLOptions.hello} */
        hello: false,
    };

    private readonly _renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    /**
     * It all starts here! This initiates every system, passing in the options for any system by name.
     * @param options - the config for the renderer and all its systems
     */
    public init(options: HelloSystemOptions): void
    {
        if (options.hello)
        {
            let name = this._renderer.name;

            if (this._renderer.type === RendererType.WEBGL)
            {
                name += ` ${(this._renderer as WebGLRenderer).context.webGLVersion}`;
            }

            sayHello(name);
        }
    }
}
