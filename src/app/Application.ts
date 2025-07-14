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
 *    preference: 'webgl',         // Renderer preference ('webgl' or 'webgpu')
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
 * const texture - await Assets.load('your-image.png');
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

    /**
     * The root display container for your application.
     * All visual elements should be added to this container or its children.
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
    public stage: Container = new Container();

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

        this.renderer = await autoDetectRenderer(options as ApplicationOptions) as R;

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
        this.renderer.render({ container: this.stage });
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

        this.stage.destroy(options);
        this.stage = null;

        this.renderer.destroy(rendererDestroyOptions);
        this.renderer = null;
    }
}

extensions.handleByList(ExtensionType.Application, Application._plugins);
extensions.add(ApplicationInitHook);
