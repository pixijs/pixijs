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
    init(options: IApplicationOptions): void;
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
     * @param {PIXI.IApplicationOptions} [options] - The optional application and renderer parameters.
     * @param {boolean} [options.antialias=false] -
     *  **WebGL Only.** Whether to enable anti-aliasing. This may affect performance.
     * @param {boolean} [options.autoDensity=false] -
     *  Whether the CSS dimensions of the renderer's view should be resized automatically.
     * @param {boolean} [options.autoStart=true] - Automatically starts the rendering after the construction.
     *  **Note**: Setting this parameter to `false` does NOT stop the shared ticker even if you set
     *  `options.sharedTicker` to `true` in case that it is already started. Stop it by your own.
     * @param {number|string} [options.background] - Alias for `options.backgroundColor`.
     * @param {number} [options.backgroundAlpha=1] -
     *  Transparency of the background color, value from `0` (fully transparent) to `1` (fully opaque).
     * @param {number|string} [options.backgroundColor=0x000000] -
     *  The background color used to clear the canvas. It accepts hex numbers (e.g. `0xff0000`),
     *  hex strings (e.g. `'#f00'` or `'#ff0000'`) or color names (e.g. `'red'`).
     * @param {boolean} [options.clearBeforeRender=true] - Whether to clear the canvas before new render passes.
     * @param {PIXI.IRenderingContext} [options.context] - **WebGL Only.** User-provided WebGL rendering context object.
     * @param {boolean} [options.forceCanvas=false] -
     *  Force using {@link PIXI.CanvasRenderer}, even if WebGL is available. This option only is available when
     *  using **pixi.js-legacy** or **@pixi/canvas-renderer** packages, otherwise it will throw an error.
     * @param {number} [options.height=600] - The height of the renderer's view.
     * @param {boolean} [options.hello=false] - Whether to log the version and type information of renderer to console.
     * @param {string} [options.powerPreference] -
     *  **WebGL Only.** A hint indicating what configuration of GPU is suitable for the WebGL context,
     *  can be `'default'`, `'high-performance'` or `'low-power'`.
     *  Setting to `'high-performance'` will prioritize rendering performance over power consumption,
     *  while setting to `'low-power'` will prioritize power saving over rendering performance.
     * @param {boolean} [options.premultipliedAlpha=true] -
     *  **WebGL Only.** Whether the compositor will assume the drawing buffer contains colors with premultiplied alpha.
     * @param {boolean} [options.preserveDrawingBuffer=false] -
     *  **WebGL Only.** Whether to enable drawing buffer preservation. If enabled, the drawing buffer will preserve
     *  its value until cleared or overwritten. Enable this if you need to call `toDataUrl` on the WebGL context.
     * @param {Window|HTMLElement} [options.resizeTo] - Element to automatically resize stage to.
     * @param {number} [options.resolution=PIXI.settings.RESOLUTION] -
     *  The resolution / device pixel ratio of the renderer.
     * @param {boolean} [options.sharedTicker=false] - `true` to use `Ticker.shared`, `false` to create new ticker.
     *  If set to `false`, you cannot register a handler to occur before anything that runs on the shared ticker.
     *  The system ticker will always run before both the shared ticker and the app ticker.
     * @param {boolean|'notMultiplied'} [options.useContextAlpha=true] -
     *  **Deprecated since 7.0.0, use `premultipliedAlpha` and `backgroundAlpha` instead.** \
     *  Pass-through value for canvas' context attribute `alpha`. This option is for cases where the
     *  canvas needs to be opaque, possibly for performance reasons on some older devices.
     *  If you want to set transparency, please use `backgroundAlpha`. \
     *  **WebGL Only:** When set to `'notMultiplied'`, the canvas' context attribute `alpha` will be
     *  set to `true` and `premultipliedAlpha` will be to `false`.
     * @param {PIXI.ICanvas} [options.view=null] -
     *  The canvas to use as the view. If omitted, a new canvas will be created.
     * @param {number} [options.width=800] - The width of the renderer's view.
     */
    constructor(options?: IApplicationOptions)
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
