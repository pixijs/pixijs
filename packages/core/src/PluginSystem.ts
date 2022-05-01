import { IRendererPlugins } from './AbstractRenderer';
import { ISystem } from './ISystem';
import { Renderer } from './Renderer';

export class PluginSystem implements ISystem
{
    public readonly plugins: IRendererPlugins;
    private renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this.renderer = renderer;

        /**
         * Collection of plugins.
         * @readonly
         * @member {object}
         */
        this.plugins = {};
    }

    /**
     * Initialize the plugins.
     *
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
