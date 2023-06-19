import { autoDetectRenderer, extensions, ExtensionType } from '@pixi/core';
import { Container } from '@pixi/display';

import type { ICanvas, IRenderer, IRendererOptionsAuto, Rectangle } from '@pixi/core';
import type { IDestroyOptions } from '@pixi/display';

/**
 * Any plugin that's usable for Application should contain these methods.
 * @memberof PIXI
 */
export interface IApplicationPlugin
{
    /**
     * Called when Application is constructed, scoped to Application instance.
     * Passes in `options` as the only argument, which are Application constructor options.
     * @param {object} options - Application options.
     */
    init(options: Partial<IApplicationOptions>): void;
    /** Called when destroying Application, scoped to Application instance. */
    destroy(): void;
}

/**
 * Application options supplied to constructor.
 * @memberof PIXI
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IApplicationOptions extends IRendererOptionsAuto, GlobalMixins.IApplicationOptions {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Application extends GlobalMixins.Application {}

/**
 * Convenience class to create a new PixiJS application.
 *
 * This class automatically creates the renderer, ticker and root container.
 * @example
 * import { Application, Sprite } from 'pixi.js';
 *
 * // Create the application
 * const app = new Application();
 *
 * // Add the view to the DOM
 * document.body.appendChild(app.view);
 *
 * // ex, add display objects
 * app.stage.addChild(Sprite.from('something.png'));
 * @class
 * @memberof PIXI
 */
export class Application<VIEW extends ICanvas = ICanvas>
{
    /** Collection of installed plugins. */
    static _plugins: IApplicationPlugin[] = [];

    /**
     * The root display container that's rendered.
     * @member {PIXI.Container}
     */
    public stage: Container = new Container();

    /**
     * WebGL renderer if available, otherwise CanvasRenderer.
     * @member {PIXI.Renderer|PIXI.CanvasRenderer}
     */
    public renderer: IRenderer<VIEW>;

    /**
     * @param options - The optional application and renderer parameters.
     */
    constructor(options?: Partial<IApplicationOptions>)
    {
        // The default options
        options = Object.assign({
            forceCanvas: false,
        }, options);

        this.renderer = autoDetectRenderer<VIEW>(options);

        // install plugins here
        Application._plugins.forEach((plugin) =>
        {
            plugin.init.call(this, options);
        });
    }

    /** Render the current stage. */
    public render(): void
    {
        this.renderer.render(this.stage);
    }

    /**
     * Reference to the renderer's canvas element.
     * @member {PIXI.ICanvas}
     * @readonly
     */
    get view(): VIEW
    {
        return this.renderer.view;
    }

    /**
     * Reference to the renderer's screen rectangle. Its safe to use as `filterArea` or `hitArea` for the whole screen.
     * @member {PIXI.Rectangle}
     * @readonly
     */
    get screen(): Rectangle
    {
        return this.renderer.screen;
    }

    /**
     * Destroy and don't use after this.
     * @param {boolean} [removeView=false] - Automatically remove canvas from DOM.
     * @param {object|boolean} [stageOptions] - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [stageOptions.children=false] - if set to true, all the children will have their destroy
     *  method called as well. 'stageOptions' will be passed on to those calls.
     * @param {boolean} [stageOptions.texture=false] - Only used for child Sprites if stageOptions.children is set
     *  to true. Should it destroy the texture of the child sprite
     * @param {boolean} [stageOptions.baseTexture=false] - Only used for child Sprites if stageOptions.children is set
     *  to true. Should it destroy the base texture of the child sprite
     */
    public destroy(removeView?: boolean, stageOptions?: IDestroyOptions | boolean): void
    {
        // Destroy plugins in the opposite order
        // which they were constructed
        const plugins = Application._plugins.slice(0);

        plugins.reverse();
        plugins.forEach((plugin) =>
        {
            plugin.destroy.call(this);
        });

        this.stage.destroy(stageOptions);
        this.stage = null;

        this.renderer.destroy(removeView);
        this.renderer = null;
    }
}

extensions.handleByList(ExtensionType.Application, Application._plugins);
