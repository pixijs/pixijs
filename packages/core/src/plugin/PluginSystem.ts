import { ExtensionMetadata, ExtensionType } from '../extensions';
import { IRenderer } from '../IRenderer';
import { Renderer } from '../Renderer';
import { ISystem } from '../system/ISystem';

export interface IRendererPlugin
{
    destroy(): void;
}

export interface IRendererPlugins
{
    [key: string]: any;
}

export interface IRendererPluginConstructor<R extends IRenderer = Renderer>
{
    new (renderer: R, options?: any): IRendererPlugin;
}

/**
 * Manages the functionality that allows users to extend pixi functionality via additional plugins.
 * @memberof PIXI
 */
export class PluginSystem implements ISystem
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
