import { extensions, ExtensionType } from '../extensions/Extensions';
import { autoDetectRenderer } from '../rendering/renderers/autoDetectRenderer';
import { Container } from '../scene/container/Container';
import { ApplicationInitHook } from '../utils/global/globalHooks';
import { deprecation, v8_0_0 } from '../utils/logging/deprecation';
import { warn } from '../utils/logging/warn';
import { RenderView } from './RenderView';
import '../app/init';

import type { Rectangle } from '../maths/shapes/Rectangle';
import type { AutoDetectOptions } from '../rendering/renderers/autoDetectRenderer';
import type { RendererDestroyOptions } from '../rendering/renderers/shared/system/AbstractRenderer';
import type { Renderer } from '../rendering/renderers/types';
import type { DestroyOptions } from '../scene/container/destroyTypes';
import type { RenderViewOptions } from './RenderView';

/**
 * Interface for creating Application plugins. Any plugin that's usable for Application must implement these methods.
 *
 * To create a plugin:
 * 1. Create a class that implements this interface
 * 2. Add the required static extension property
 * 3. Register the plugin using extensions.add()
 * @example
 * ```ts
 * import { ApplicationPlugin, ExtensionType, extensions } from 'pixi.js';
 *
 * class MyPlugin {
 *    // Required: Declare the extension type
 *    public static extension = ExtensionType.Application;
 *
 *    // Required: Implement init method
 *    public static init(options: Partial<ApplicationOptions>): void {
 *        // Add properties/methods to the Application instance (this)
 *        Object.defineProperty(this, 'myFeature', {
 *            value: () => console.log('My feature!'),
 *        });
 *
 *        // Use options if needed
 *        console.log('Plugin initialized with:', options);
 *    }
 *
 *    // Required: Implement destroy method
 *    public static destroy(): void {
 *        // Clean up any resources
 *        console.log('Plugin destroyed');
 *    }
 * }
 *
 * // Register the plugin
 * extensions.add(MyPlugin);
 *
 * // Usage in application
 * const app = new Application();
 * await app.init();
 * app.myFeature(); // Output: "My feature!"
 * ```
 * > [!IMPORTANT]
 * > - Plugins are initialized in the order they are added
 * > - Plugins are destroyed in reverse order
 * > - The `this` context in both methods refers to the Application instance
 * @see {@link ExtensionType} For different types of extensions
 * @see {@link extensions} For the extension registration system
 * @see {@link ApplicationOptions} For available application options
 * @category app
 * @advanced
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
 * These options configure how your PixiJS application behaves.
 * @category app
 * @standard
 * @example
 * ```js
 * import { Application } from 'pixi.js';
 *
 * const app = new Application();
 *
 * // Initialize with common options
 * await app.init({
 *    // Rendering options
 *    width: 800,                    // Canvas width
 *    height: 600,                   // Canvas height
 *    backgroundColor: 0x1099bb,     // Background color
 *    antialias: true,              // Enable antialiasing
 *    resolution: window.devicePixelRatio, // Screen resolution
 *
 *    // Performance options
 *    autoStart: true,              // Auto-starts the render loop
 *    sharedTicker: true,           // Use shared ticker for better performance
 *
 *    // Automatic resize options
 *    resizeTo: window,             // Auto-resize to window
 *    autoDensity: true,           // Adjust for device pixel ratio
 *
 *    // Advanced options
 *    preference: 'webgl',         // Renderer preference ('webgl', 'webgpu', 'canvas', or an array)
 *    powerPreference: 'high-performance' // GPU power preference
 * });
 * ```
 * @see {@link WebGLOptions} For resize-related options
 * @see {@link WebGPUOptions} For resize-related options
 * @see {@link TickerPlugin} For ticker-related options
 * @see {@link ResizePlugin} For resize-related options
 */
export interface ApplicationOptions extends AutoDetectOptions, PixiMixins.ApplicationOptions { }

// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, requireExport/require-export-jsdoc, requireMemberAPI/require-member-api-doc
export interface Application extends PixiMixins.Application { }

/**
 * Convenience class to create a new PixiJS application.
 *
 * The Application class is the main entry point for creating a PixiJS application. It handles the setup of all core
 * components needed to start rendering and managing your game or interactive experience.
 *
 * Key features:
 * - Automatically creates and manages the renderer
 * - Provides a stage (root container) for your display objects
 * - Handles canvas creation and management
 * - Supports plugins for extending functionality
 *   - {@link ResizePlugin} for automatic resizing
 *   - {@link TickerPlugin} for managing frame updates
 *   - {@link CullerPlugin} for culling off-screen objects
 * @example
 * ```js
 * import { Assets, Application, Sprite } from 'pixi.js';
 *
 * // Create a new application
 * const app = new Application();
 *
 * // Initialize with options
 * await app.init({
 *     width: 800,           // Canvas width
 *     height: 600,          // Canvas height
 *     backgroundColor: 0x1099bb, // Background color
 *     antialias: true,     // Enable antialiasing
 *     resolution: 1,       // Resolution / device pixel ratio
 *     preference: 'webgl', // or 'webgpu' // Renderer preference
 * });
 *
 * // Add the canvas to your webpage
 * document.body.appendChild(app.canvas);
 *
 * // Start adding content to your application
 * const texture = await Assets.load('your-image.png');
 * const sprite = new Sprite(texture);
 * app.stage.addChild(sprite);
 * ```
 * > [!IMPORTANT] From PixiJS v8.0.0, the application must be initialized using the async `init()` method
 * > rather than passing options to the constructor.
 * @category app
 * @standard
 * @see {@link ApplicationOptions} For all available initialization options
 * @see {@link Container} For information about the stage container
 * @see {@link Renderer} For details about the rendering system
 */
export class Application<R extends Renderer = Renderer>
{
    /**
     * Collection of installed plugins.
     * @internal
     */
    public static _plugins: ApplicationPlugin[] = [];

    /** Backing stage used before {@link Application#init}, after which the primary view owns it. */
    private _stage: Container = new Container();

    /** The render views driven each frame. `views[0]` is always the {@link Application#primaryView}. */
    private _views: RenderView<R>[] = [];

    /**
     * The application's primary view: the {@link RenderView} wrapping the renderer's own canvas and
     * the main {@link Application#stage stage}. Available after {@link Application#init}.
     */
    public primaryView: RenderView<R> = null;

    /**
     * The root display container for your application.
     * All visual elements should be added to this container or its children.
     *
     * This is the same container as `app.primaryView.stage`.
     * @example
     * ```js
     * // Create a sprite and add it to the stage
     * const sprite = Sprite.from('image.png');
     * app.stage.addChild(sprite);
     *
     * // Create a container for grouping objects
     * const container = new Container();
     * app.stage.addChild(container);
     * ```
     */
    get stage(): Container
    {
        return this.primaryView ? this.primaryView.stage : this._stage;
    }

    set stage(value: Container)
    {
        if (this.primaryView)
        {
            this.primaryView.stage = value;
        }
        else
        {
            this._stage = value;
        }
    }

    /**
     * All render views driven by {@link Application#render}, the {@link Application#primaryView}
     * first followed by any added with {@link Application#addView}.
     * @readonly
     */
    get views(): ReadonlyArray<RenderView<R>>
    {
        return this._views;
    }

    /**
     * The renderer instance that handles all drawing operations.
     *
     * Unless specified, it will automatically create a WebGL renderer if available.
     * If WebGPU is available and the `preference` is set to `webgpu`, it will create a WebGPU renderer.
     * @example
     * ```js
     * // Create a new application
     * const app = new Application();
     * await app.init({
     *     width: 800,
     *     height: 600,
     *     preference: 'webgl', // or 'webgpu'
     * });
     *
     * // Access renderer properties
     * console.log(app.renderer.width, app.renderer.height);
     * ```
     */
    public renderer: R;

    /** Create new Application instance */
    constructor();

    /** @deprecated since 8.0.0 */
    constructor(options?: Partial<ApplicationOptions>);

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
     * Initializes the PixiJS application with the specified options.
     *
     * This method must be called after creating a new Application instance.
     * @param options - Configuration options for the application and renderer
     * @returns A promise that resolves when initialization is complete
     * @example
     * ```js
     * const app = new Application();
     *
     * // Initialize with custom options
     * await app.init({
     *     width: 800,
     *     height: 600,
     *     backgroundColor: 0x1099bb,
     *     preference: 'webgl', // or 'webgpu'
     * });
     * ```
     */
    public async init(options?: Partial<ApplicationOptions>)
    {
        // The default options
        options = { ...options };

        this.stage ||= new Container();
        this.renderer = await autoDetectRenderer(options as ApplicationOptions) as R;

        // the primary view wraps the renderer's own canvas and the main stage, so a single-view
        // application renders byte-for-byte identically to a classic single-canvas Application
        this.primaryView = new RenderView(this.renderer, { canvas: this.renderer.canvas, stage: this.stage }, true);
        this._views = [this.primaryView];

        // install plugins here
        Application._plugins.forEach((plugin) =>
        {
            plugin.init.call(this, options);
        });
    }

    /**
     * Renders the current stage to the screen.
     *
     * When using the default setup with {@link TickerPlugin} (enabled by default), you typically don't need to call
     * this method directly as rendering is handled automatically.
     *
     * Only use this method if you've disabled the {@link TickerPlugin} or need custom
     * render timing control.
     * @example
     * ```js
     * // Example 1: Default setup (TickerPlugin handles rendering)
     * const app = new Application();
     * await app.init();
     * // No need to call render() - TickerPlugin handles it
     *
     * // Example 2: Custom rendering loop (if TickerPlugin is disabled)
     * const app = new Application();
     * await app.init({ autoStart: false }); // Disable automatic rendering
     *
     * function animate() {
     *     app.render();
     *     requestAnimationFrame(animate);
     * }
     * animate();
     * ```
     */
    public render(): void
    {
        const views = this._views;

        // render added views first and the primary view last, so the renderer's lastObjectRendered
        // (used by the main view's events) ends up being the primary stage
        for (let i = 1; i < views.length; i++)
        {
            if (views[i].enabled) views[i].render();
        }

        if (views[0]?.enabled) views[0].render();
    }

    /**
     * Adds an additional canvas for this application's renderer to draw to, driven each frame by
     * {@link Application#render}. This powers the multiView feature: one renderer driving many canvases,
     * each with its own stage, clear color and optional auto-resize.
     *
     * > [!IMPORTANT] On the WebGL renderer, additional canvases only render if the application was
     * > initialized with `multiView: true`. WebGPU needs no such option.
     * @param options - configuration for the new view
     * @returns the created {@link RenderView}
     * @example
     * ```ts
     * const app = new Application();
     * await app.init({ multiView: true });
     *
     * const view = app.addView({ canvas: secondCanvas, clearColor: 0x222222 });
     * view.stage.addChild(sprite);
     * ```
     */
    public addView(options: RenderViewOptions<R> = {}): RenderView<R>
    {
        // #if _DEBUG
        const context = (this.renderer as Renderer & { context?: { multiView?: boolean } }).context;

        if (context && 'multiView' in context && !context.multiView)
        {
            warn('Application#addView: the WebGL renderer was not created with multiView:true, so additional '
                + 'canvases will not render. Pass multiView:true to app.init() (this cannot be enabled later).');
        }
        // #endif

        // one canvas can back only one view; sharing it (including passing renderer.canvas) would make the
        // per-canvas event/DOM/accessibility overlays flip between stages and corrupt the renderer's
        // canvas->view map, so reject a duplicate and hand back the view that already owns that canvas.
        if (options.canvas)
        {
            const existing = this._views.find((existingView) => existingView.canvas === options.canvas);

            if (existing)
            {
                // #if _DEBUG
                warn('Application#addView: that canvas already backs another view. Each view needs its own canvas.');
                // #endif

                return existing;
            }
        }

        const view = new RenderView(this.renderer, options, false);

        // #if _DEBUG
        const canvas = view.canvas as { isConnected?: boolean };

        if (canvas && canvas.isConnected === false)
        {
            warn('Application#addView: the view canvas is not attached to the DOM. Append view.canvas to the '
                + 'document for its events and DOM/accessibility overlays to work.');
        }
        // #endif

        this._views.push(view);

        return view;
    }

    /**
     * Removes a view previously added with {@link Application#addView}, stopping it from rendering.
     * Its stage is left intact (destroy it yourself if needed). The {@link Application#primaryView}
     * cannot be removed.
     * @param view - the view to remove
     * @returns whether the view was removed
     */
    public removeView(view: RenderView<R>): boolean
    {
        if (view === this.primaryView)
        {
            // #if _DEBUG
            warn('Application#removeView: the primary view cannot be removed.');
            // #endif

            return false;
        }

        const index = this._views.indexOf(view);

        if (index === -1) return false;

        this._views.splice(index, 1);
        view.destroy();

        return true;
    }

    /**
     * Reference to the renderer's canvas element. This is the HTML element
     * that displays your application's graphics.
     * @readonly
     * @type {HTMLCanvasElement}
     * @example
     * ```js
     * // Create a new application
     * const app = new Application();
     * // Initialize the application
     * await app.init({...});
     * // Add canvas to the page
     * document.body.appendChild(app.canvas);
     *
     * // Access the canvas directly
     * console.log(app.canvas); // HTMLCanvasElement
     * ```
     */
    get canvas(): R['canvas']
    {
        return this.renderer.canvas as R['canvas'];
    }

    /**
     * Reference to the renderer's canvas element.
     * @type {HTMLCanvasElement}
     * @deprecated since 8.0.0
     * @see {@link Application#canvas}
     */
    get view(): R['canvas']
    {
        // #if _DEBUG
        deprecation(v8_0_0, 'Application.view is deprecated, please use Application.canvas instead.');
        // #endif

        return this.renderer.canvas as R['canvas'];
    }

    /**
     * Reference to the renderer's screen rectangle. This represents the visible area of your application.
     *
     * It's commonly used for:
     * - Setting filter areas for full-screen effects
     * - Defining hit areas for screen-wide interaction
     * - Determining the visible bounds of your application
     * @readonly
     * @example
     * ```js
     * // Use as filter area for a full-screen effect
     * const blurFilter = new BlurFilter();
     * sprite.filterArea = app.screen;
     *
     * // Use as hit area for screen-wide interaction
     * const screenSprite = new Sprite();
     * screenSprite.hitArea = app.screen;
     *
     * // Get screen dimensions
     * console.log(app.screen.width, app.screen.height);
     * ```
     * @see {@link Rectangle} For all available properties and methods
     */
    get screen(): Rectangle
    {
        return this.renderer.screen;
    }

    /**
     * Get the html div element that holds all DOM Container elements.
     * @readonly
     * @type {HTMLDivElement}
     */
    get domContainerRoot()
    {
        return this.renderer.renderPipes.dom?._domElement;
    }

    /**
     * Destroys the application and all of its resources.
     *
     * This method should be called when you want to completely
     * clean up the application and free all associated memory.
     * @param rendererDestroyOptions - Options for destroying the renderer:
     *  - `false` or `undefined`: Preserves the canvas element (default)
     *  - `true`: Removes the canvas element
     *  - `{ removeView: boolean }`: Object with removeView property to control canvas removal
     * @param options - Options for destroying the application:
     *  - `false` or `undefined`: Basic cleanup (default)
     *  - `true`: Complete cleanup including children
     *  - Detailed options object:
     *    - `children`: Remove children
     *    - `texture`: Destroy textures
     *    - `textureSource`: Destroy texture sources
     *    - `context`: Destroy WebGL context
     * @example
     * ```js
     * // Basic cleanup
     * app.destroy();
     *
     * // Remove canvas and do complete cleanup
     * app.destroy(true, true);
     *
     * // Remove canvas with explicit options
     * app.destroy({ removeView: true }, true);
     *
     * // Detailed cleanup with specific options
     * app.destroy(
     *     { removeView: true },
     *     {
     *         children: true,
     *         texture: true,
     *         textureSource: true,
     *         context: true
     *     }
     * );
     * ```
     * > [!WARNING] After calling destroy, the application instance should no longer be used.
     * > All properties will be null and further operations will throw errors.
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

        // tear down added views (their stages + any auto-created canvas); the primary view's stage
        // and canvas are the application's own and are cleaned up just below / by the renderer
        for (let i = this._views.length - 1; i >= 1; i--)
        {
            this._views[i].destroy(options);
        }

        const stage = this.stage;

        this.primaryView?.destroy();
        this.primaryView = null;
        this._views = [];

        stage.destroy(options);
        this._stage = null;

        this.renderer.destroy(rendererDestroyOptions);
        this.renderer = null;
    }
}

extensions.handleByList(ExtensionType.Application, Application._plugins);
extensions.add(ApplicationInitHook);
