import { extensions, ExtensionType } from '../extensions/Extensions';
import { autoDetectRenderer } from '../rendering/renderers/autoDetectRenderer';
import { Container } from '../scene/container/Container';

import type { Rectangle } from '../maths/shapes/Rectangle';
import type { AutoDetectOptions } from '../rendering/renderers/autoDetectRenderer';
import type { Renderer } from '../rendering/renderers/types';
import type { DestroyOptions } from '../scene/container/destroyTypes';

/**
 * The app module provides a set of classes to use as a starting point when building applications.
 *
 * This module has a mixin for a TickerPlugin and a ResizePlugin. These will need to be imported
 * if you are managing your own renderer.
 * Usage:
 * ```js
 * import 'pixi.js/app';
 * import { Application } from 'pixi.js';
 *
 * const app = new Application();
 * await app.init();
 * // Add the canvas to the DOM
 * document.body.appendChild(app.canvas);
 * ```
 * @namespace app
 */

/**
 * Any plugin that's usable for Application should contain these methods.
 * @example
 * import { ApplicationPlugin } from 'pixi.js';
 * class MyPlugin implements ApplicationPlugin
 * {
 *    static init(options)
 *    {
 *      // do something with options
 *    }
 *    static destroy()
 *    {
 *     // destruction code here
 *    }
 * }
 * @memberof app
 */
export interface ApplicationPlugin
{
    /**
     * Called when Application is constructed, scoped to Application instance.
     * Passes in `options` as the only argument, which are Application init options.
     * @param {object} options - Application options.
     */
    init(options: Partial<ApplicationOptions>): void;
    /** Called when destroying Application, scoped to Application instance. */
    destroy(): void;
}

/**
 * Application options supplied to the applications init method.
 * @memberof app
 */
export interface ApplicationOptions extends AutoDetectOptions, PixiMixins.ApplicationOptions {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Application extends PixiMixins.Application {}

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
 * await app.init();
 *
 * // Add the view to the DOM
 * document.body.appendChild(app.canvas);
 *
 * // ex, add display objects
 * app.stage.addChild(Sprite.from('something.png'));
 * @memberof app
 */
export class Application<R extends Renderer = Renderer>
{
    /**
     * Collection of installed plugins.
     * @alias _plugins
     */
    public static _plugins: ApplicationPlugin[] = [];

    /**
     * The root display container that's rendered.
     * @member {Container}
     */
    public stage: Container = new Container();

    /**
     * WebGL renderer if available, otherwise CanvasRenderer.
     * @member {Renderer}
     */
    public renderer: R;

    /**
     * @param options - The optional application and renderer parameters.
     */
    public async init(options?: Partial<ApplicationOptions>)
    {
        // The default options
        options = {
            ...{
                // forceCanvas: false,
            },
            ...options,
        };

        this.renderer = await autoDetectRenderer(options as ApplicationOptions) as R;

        // install plugins here
        Application._plugins.forEach((plugin) =>
        {
            plugin.init.call(this, options);
        });
    }

    /** Render the current stage. */
    public render(): void
    {
        this.renderer.render({ container: this.stage });
    }

    /**
     * Reference to the renderer's canvas element.
     * @readonly
     */
    get canvas(): R['canvas']
    {
        return this.renderer.canvas as R['canvas'];
    }

    /**
     * Reference to the renderer's screen rectangle. Its safe to use as `filterArea` or `hitArea` for the whole screen.
     * @member {Rectangle}
     * @readonly
     */
    get screen(): Rectangle
    {
        return this.renderer.screen;
    }

    /**
     * Destroys the application and all of its resources.
     * @param {object|boolean} [options=false] - The options for destroying the application.
     * @param {boolean} [options.removeView=false] - Whether to remove the application's canvas element from the DOM.
     * @param {boolean} [options.children=false] - If set to true, all the children will have their destroy method
     * called as well. `options` will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Only used for children with textures e.g. Sprites.
     * If options.children is set to true,
     * it should destroy the texture of the child sprite.
     * @param {boolean} [options.textureSource=false] - Only used for children with textures e.g. Sprites.
     *  If options.children is set to true,
     * it should destroy the texture source of the child sprite.
     * @param {boolean} [options.context=false] - Only used for children with graphicsContexts e.g. Graphics.
     * If options.children is set to true,
     * it should destroy the context of the child graphics.
     */
    public destroy(options: DestroyOptions = false): void
    {
        // Destroy plugins in the opposite order
        // which they were constructed
        const plugins = Application._plugins.slice(0);

        plugins.reverse();
        plugins.forEach((plugin) =>
        {
            plugin.destroy.call(this);
        });

        this.stage.destroy(options);
        this.stage = null;

        this.renderer.destroy(options);
        this.renderer = null;
    }
}

extensions.handleByList(ExtensionType.Application, Application._plugins);
