import { IRenderer, IRendererPlugins } from '../IRenderer';
import { ISystem } from '../system/ISystem';

export interface IRendererPlugin {
    destroy(): void;
}

export interface IRendererPlugins
{
    [key: string]: any;
}

export interface IRendererPluginConstructor {
    new (renderer: IRenderer, options?: any): IRendererPlugin;
}

/**
 * Manages the functionality that allows users to extend pixi functionality via additional plugins.
 *
 * @memberof PIXI
 */
export class PluginSystem implements ISystem
{
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
