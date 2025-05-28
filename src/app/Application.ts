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
 * @category app
 * @see {@link ApplicationOptions}
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
 * Application options supplied to the {@link Application#init} method.
 * @category app
 * @standard
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

// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, requireExport/require-export-jsdoc, requireMemberAPI/require-member-api-doc
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
 * @category app
 * @standard
 */
export class Application<R extends Renderer = Renderer>
{
    /**
     * Collection of installed plugins.
     * @internal
     */
    public static _plugins: ApplicationPlugin[] = [];

    /** The root display container that's rendered. */
    public stage: Container = new Container();

    /**
     * WebGL renderer if available, otherwise CanvasRenderer.
     * @type {Renderer}
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
     * @type {HTMLCanvasElement}
     */
    get canvas(): R['canvas']
    {
        return this.renderer.canvas as R['canvas'];
    }

    /**
     * Reference to the renderer's canvas element.
     * @type {HTMLCanvasElement}
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
     * @param rendererDestroyOptions - Options for destroying the renderer.
     * @param options - Options for destroying the application.
     * @example
     * app.destroy()
     * app.destroy(true, true);
     * app.destroy({ removeView: true }, true);
     * app.destroy({ removeView: true }, { children: true, texture: true, textureSource: true, context: true });
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
