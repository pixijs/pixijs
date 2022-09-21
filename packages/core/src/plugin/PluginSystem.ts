import { deprecation } from '@pixi/utils';
import type { ExtensionMetadata } from '@pixi/extensions';
import { extensions, ExtensionType } from '@pixi/extensions';
import type { IRenderer } from '../IRenderer';
import type { ISystem } from '../system/ISystem';

export interface IRendererPlugins extends GlobalMixins.IRendererPlugins
{
    [key: string]: any;
}

/**
 * Manages the functionality that allows users to extend pixi functionality via additional plugins.
 * @memberof PIXI
 */
export class PluginSystem implements ISystem<IRendererPlugins>
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.RendererSystem,
            ExtensionType.CanvasRendererSystem
        ],
        name: '_plugin',
    };

    /**
     * Collection of plugins.
     * @readonly
     * @member {object}
     */
    public readonly plugins: IRendererPlugins;
    private renderer: IRenderer;

    constructor(renderer: IRenderer)
    {
        this.renderer = renderer;

        /**
         * Collection of plugins.
         * @readonly
         * @member {object}
         */
        this.plugins = {};

        // #if _DEBUG
        Object.defineProperties(this.plugins, {
            extract: {
                enumerable: false,
                get()
                {
                    deprecation('7.0.0', 'renderer.plugins.extract has moved to renderer.extract');

                    return (renderer as any).extract;
                },
            },
            prepare: {
                enumerable: false,
                get()
                {
                    deprecation('7.0.0', 'renderer.plugins.prepare has moved to renderer.prepare');

                    return (renderer as any).prepare;
                },
            },
            interaction: {
                enumerable: false,
                get()
                {
                    deprecation('7.0.0', 'renderer.plugins.interaction has been deprecated, use renderer.events');

                    return (renderer as any).events;
                },
            },
        });
        // #endif
    }

    /**
     * Initialize the plugins.
     * @protected
     * @param {object} staticMap - The dictionary of statically saved plugins.
     */
    init(staticMap: IRendererPlugins): void
    {
        for (const o in staticMap)
        {
            this.plugins[o] = new (staticMap[o])(this.renderer);
        }
    }

    destroy(): void
    {
        for (const o in this.plugins)
        {
            this.plugins[o].destroy();
            this.plugins[o] = null;
        }
    }
}

extensions.add(PluginSystem);
