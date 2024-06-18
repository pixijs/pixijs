import { extensions, ExtensionType } from '../extensions/Extensions';
import { autoDetectRenderer } from '../rendering/renderers/autoDetectRenderer';
import { Container } from '../scene/container/Container';
import { ApplicationInitHook } from '../utils/global/globalHooks';
import { deprecation, v8_0_0 } from '../utils/logging/deprecation';

import type { Rectangle } from '../maths/shapes/Rectangle';
import type { AutoDetectOptions } from '../rendering/renderers/autoDetectRenderer';
import type { RendererDestroyOptions } from '../rendering/renderers/shared/system/AbstractRenderer';
import type { Renderer } from '../rendering/renderers/types';
import type { DestroyOptions } from '../scene/container/destroyTypes';

/**
 * The app module provides a set of classes to use as a starting point when building applications.
 *
 * <aside>This module has a mixin for <code>TickerPlugin</code> and <code>ResizePlugin</code>.
 * These will need to be imported if you are managing your own renderer.</aside>
 *
 * ```js
 * import { Application } from 'pixi.js';
 *
 * const app = new Application();
 *
 * await app.init();
 *
 * // don't forget to add the canvas to the DOM
 * document.body.appendChild(app.canvas);
 * ```
 * @namespace app
 */

/**
 * Any plugin that's usable for Application should contain these methods.
 * @example
 * import { ApplicationPlugin } from 'pixi.js';
 *
 * const plugin: ApplicationPlugin = {
 *    init: (options: Partial<ApplicationOptions>) =>
 *    {
 *       // handle init here, use app options if needed
 *    },
 *    destroy: () =>
 *    {
 *       // handle destruction code here
 *    }
 * }
 * @memberof app
 * @see {@link app.ApplicationOptions}
 * @ignore
 */
export interface ApplicationPlugin
{
    /**
     * Called when Application is constructed, scoped to Application instance.
     * Passes in `options` as the only argument, which are Application `init()` options.
     * @param {object} options - Application options.
     */
    init(options: Partial<ApplicationOptions>): void;
    /** Called when destroying Application, scoped to Application instance. */
    destroy(): void;
}

/**
 * Application options supplied to the {@link app.Application#init} method.
 * @memberof app
 * @example
 * import { Application } from 'pixi.js';
 *
 * const app = new Application();
 *
 * await app.init({
 *    autoStart: false,
 *    resizeTo: window,
 *    sharedTicker: true,
 * });
 */
export interface ApplicationOptions extends AutoDetectOptions, PixiMixins.ApplicationOptions { }

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Application extends PixiMixins.Application { }

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
 * await app.init({ width: 800, height: 600 });
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

    /** The root display container that's rendered. */
    public stage: Container = new Container();

    /**
     * WebGL renderer if available, otherwise CanvasRenderer.
     * @member {Renderer}
     */
    public renderer: R;

    /** Create new Application instance */
    constructor();

    /** @deprecated since 8.0.0 */
    constructor(options?: Partial<ApplicationOptions>);

    /** @ignore */
    constructor(...args: [Partial<ApplicationOptions>] | [])
    {
        // #if _DEBUG
        if (args[0] !== undefined)
        {
            deprecation(v8_0_0, 'Application constructor options are deprecated, please use Application.init() instead.');
        }
        // #endif
    }

    /**
     * @param options - The optional application and renderer parameters.
     */
    public async init(options?: Partial<ApplicationOptions>)
    {
        // The default options
        options = { ...options };

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
     * @member {HTMLCanvasElement}
     */
    get canvas(): R['canvas']
    {
        return this.renderer.canvas as R['canvas'];
    }

    /**
     * Reference to the renderer's canvas element.
     * @member {HTMLCanvasElement}
     * @deprecated since 8.0.0
     */
    get view(): R['canvas']
    {
        // #if _DEBUG
        deprecation(v8_0_0, 'Application.view is deprecated, please use Application.canvas instead.');
        // #endif

        return this.renderer.canvas as R['canvas'];
    }

    /**
     * Reference to the renderer's screen rectangle. Its safe to use as `filterArea` or `hitArea` for the whole screen.
     * @readonly
     */
    get screen(): Rectangle
    {
        return this.renderer.screen;
    }

    /**
     * Destroys the application and all of its resources.
     * @param {object|boolean}[rendererDestroyOptions=false] - The options for destroying the renderer.
     * @param {boolean}[rendererDestroyOptions.removeView=false] - Removes the Canvas element from the DOM.
     * @param {object|boolean} [options=false] - The options for destroying the stage.
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
    public destroy(rendererDestroyOptions: RendererDestroyOptions = false, options: DestroyOptions = false): void
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

        this.renderer.destroy(rendererDestroyOptions);
        this.renderer = null;
    }
}

extensions.handleByList(ExtensionType.Application, Application._plugins);
extensions.add(ApplicationInitHook);
