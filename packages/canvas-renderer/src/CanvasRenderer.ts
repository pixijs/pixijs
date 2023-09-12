import {
    extensions,
    ExtensionType,
    RENDERER_TYPE,
    settings,
    SystemManager,
    utils
} from '@pixi/core';

import type {
    BackgroundSystem,
    BLEND_MODES,
    ColorSource,
    ExtensionMetadata,
    GenerateTextureSystem,
    ICanvas,
    ICanvasRenderingContext2D,
    IGenerateTextureOptions,
    IRenderableObject,
    IRenderer,
    IRendererOptions,
    IRendererPlugins,
    IRendererRenderOptions,
    Matrix,
    PluginSystem,
    Rectangle,
    RenderTexture,
    StartupSystem,
    ViewSystem,
} from '@pixi/core';
import type { DisplayObject } from '@pixi/display';
import type { CanvasContextSystem, SmoothingEnabledProperties } from './CanvasContextSystem';
import type { CanvasMaskSystem } from './CanvasMaskSystem';
import type { CanvasObjectRendererSystem } from './CanvasObjectRendererSystem';

const { deprecation } = utils;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CanvasRenderer extends GlobalMixins.CanvasRenderer {}

/**
 * The CanvasRenderer draws the scene and all its content onto a 2d canvas.
 *
 * This renderer should be used for browsers that support WebGL.
 *
 * This renderer should be used for browsers that do not support WebGL.
 * Don't forget to add the view to your DOM or you will not see anything!
 *
 * Renderer is composed of systems that manage specific tasks. The following systems are added by default
 * whenever you create a renderer:
 *
 * | System                               | Description                                                                   |
 * | ------------------------------------ | ----------------------------------------------------------------------------- |
 *
 * | Generic Systems                      | Systems that manage functionality that all renderer types share               |
 * | ------------------------------------ | ----------------------------------------------------------------------------- |
 * | {@link PIXI.ViewSystem}              | This manages the main view of the renderer usually a Canvas                   |
 * | {@link PIXI.PluginSystem}            | This manages plugins for the renderer                                         |
 * | {@link PIXI.BackgroundSystem}        | This manages the main views background color and alpha                        |
 * | {@link PIXI.StartupSystem}           | Boots up a renderer and initiatives all the systems                           |
 * | {@link PIXI.EventSystem}             | This manages UI events.                                                       |
 * | {@link PIXI.GenerateTextureSystem}   | This adds the ability to generate textures from any PIXI.DisplayObject        |
 *
 * | PixiJS High-Level Systems            | Set of specific systems designed to work with PixiJS objects                  |
 * | ------------------------------------ | ----------------------------------------------------------------------------- |
 * | {@link PIXI.CanvasContextSystem}     | This manages the canvas `2d` contexts and their state                         |
 * | {@link PIXI.CanvasMaskSystem}        | This manages masking operations.                                              |
 * | {@link PIXI.CanvasExtract}           | This extracts image data from a PIXI.DisplayObject                            |
 * | {@link PIXI.CanvasPrepare}           | This prepares a PIXI.DisplayObject async for rendering                        |
 *
 * The breadth of the API surface provided by the renderer is contained within these systems.
 * @class
 * @memberof PIXI
 */
export class CanvasRenderer extends SystemManager<CanvasRenderer> implements IRenderer
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: ExtensionType.Renderer,
        priority: 0,
    };

    /**
     * Options passed to the constructor.
     * @member {PIXI.IRendererOptions}
     */
    public readonly options: IRendererOptions;

    /**
     * Used with autoDetectRenderer, this is always supported for any environment, so return true.
     * @ignore
     */
    static test(): boolean
    {
        return true;
    }

    /**
     * Fired after rendering finishes.
     * @event PIXI.CanvasRenderer#postrender
     */
    /**
     * Fired before rendering starts.
     * @event PIXI.CanvasRenderer#prerender
     */

    /**
     * The type of the renderer. will be PIXI.RENDERER_TYPE.CANVAS
     * @member {number}
     * @see PIXI.RENDERER_TYPE
     */
    public readonly type = RENDERER_TYPE.CANVAS;

    /** When logging Pixi to the console, this is the name we will show */
    public readonly rendererLogId = 'Canvas';

    // systems..
    /**
     * textureGenerator system instance
     * @readonly
     */
    public textureGenerator: GenerateTextureSystem;

    /**
     * background system instance
     * @readonly
     */
    public background: BackgroundSystem;

    /**
     * canvas mask system instance
     * @readonly
     */
    public mask: CanvasMaskSystem;

    /**
     * plugin system instance
     * @readonly
     */
    public _plugin: PluginSystem;

    /**
     * Canvas context system instance
     * @readonly
     */
    public canvasContext: CanvasContextSystem;

    /**
     * Startup system instance
     * @readonly
     */
    public startup: StartupSystem;

    /**
     * View system instance
     * @readonly
     */
    public _view: ViewSystem;

    /**
     * renderer system instance
     * @readonly
     */
    public objectRenderer: CanvasObjectRendererSystem;

    /**
     * @param {PIXI.IRendererOptions} [options] - See {@link PIXI.settings.RENDER_OPTIONS} for defaults.
     */
    constructor(options?: Partial<IRendererOptions>)
    {
        super();

        // Add the default render options
        options = Object.assign({}, settings.RENDER_OPTIONS, options);

        const systemConfig = {
            runners: [
                'init',
                'destroy',
                'contextChange',
                'resolutionChange',
                'reset',
                'update',
                'postrender',
                'prerender',
                'resize'
            ],
            systems: CanvasRenderer.__systems,
            priority: [
                'textureGenerator',
                'background',
                '_view',
                '_plugin',
                'startup',
                'mask',
                'canvasContext',
                'objectRenderer'
            ],
        };

        this.setup(systemConfig);

        if ('useContextAlpha' in options)
        {
            if (process.env.DEBUG)
            {
                deprecation('7.0.0', 'options.useContextAlpha is deprecated, use options.backgroundAlpha instead');
            }
            options.backgroundAlpha = options.useContextAlpha === false ? 1 : options.backgroundAlpha;
        }

        // convert our big blob of options into system specific ones..
        this._plugin.rendererPlugins = CanvasRenderer.__plugins;
        this.options = options as IRendererOptions;
        this.startup.run(this.options);
    }

    /**
     * Useful function that returns a texture of the display object that can then be used to create sprites
     * This can be quite useful if your displayObject is complicated and needs to be reused multiple times.
     * @param displayObject - The displayObject the object will be generated from.
     * @param {IGenerateTextureOptions} options - Generate texture options.
     * @param {PIXI.Rectangle} options.region - The region of the displayObject, that shall be rendered,
     *        if no region is specified, defaults to the local bounds of the displayObject.
     * @param {number} [options.resolution] - If not given, the renderer's resolution is used.
     * @param {PIXI.MSAA_QUALITY} [options.multisample] - If not given, the renderer's multisample is used.
     * @returns A texture of the graphics object.
     */
    generateTexture(displayObject: IRenderableObject, options?: IGenerateTextureOptions): RenderTexture
    {
        return this.textureGenerator.generateTexture(displayObject, options);
    }

    reset(): void
    {
        // nothing to be done :D
    }

    /**
     * Renders the object to its WebGL view.
     * @param displayObject - The object to be rendered.
     * @param options - Object to use for render options.
     * @param {PIXI.RenderTexture} [options.renderTexture] - The render texture to render to.
     * @param {boolean} [options.clear=true] - Should the canvas be cleared before the new render.
     * @param {PIXI.Matrix} [options.transform] - A transform to apply to the render texture before rendering.
     * @param {boolean} [options.skipUpdateTransform=false] - Should we skip the update transform pass?
     */
    render(displayObject: DisplayObject, options?: IRendererRenderOptions): void
    {
        this.objectRenderer.render(displayObject, options);
    }

    /** Clear the canvas of renderer. */
    public clear(): void
    {
        this.canvasContext.clear();
    }

    /**
     * Removes everything from the renderer and optionally removes the Canvas DOM element.
     * @param {boolean} [removeView=false] - Removes the Canvas element from the DOM.
     */
    public destroy(removeView?: boolean): void
    {
        this.runners.destroy.items.reverse();

        this.emitWithCustomOptions(this.runners.destroy, {
            _view: removeView,
        });

        super.destroy();
    }

    /** Collection of plugins */
    get plugins(): IRendererPlugins
    {
        return this._plugin.plugins;
    }

    /**
     * Resizes the canvas view to the specified width and height.
     * @param desiredScreenWidth - the desired width of the screen
     * @param desiredScreenHeight - the desired height of the screen
     */
    public resize(desiredScreenWidth: number, desiredScreenHeight: number): void
    {
        this._view.resizeView(desiredScreenWidth, desiredScreenHeight);
    }

    /**
     * Same as view.width, actual number of pixels in the canvas by horizontal.
     * @member {number}
     * @readonly
     * @default 800
     */
    get width(): number
    {
        return this._view.element.width;
    }

    /**
     * Same as view.height, actual number of pixels in the canvas by vertical.
     * @member {number}
     * @readonly
     * @default 600
     */
    get height(): number
    {
        return this._view.element.height;
    }

    /** The resolution / device pixel ratio of the renderer. */
    get resolution(): number
    {
        return this._view.resolution;
    }
    set resolution(value: number)
    {
        this._view.resolution = value;
        this.runners.resolutionChange.emit(value);
    }

    /** Whether CSS dimensions of canvas view should be resized to screen dimensions automatically. */
    get autoDensity(): boolean
    {
        return this._view.autoDensity;
    }

    /** The canvas element that everything is drawn to.*/
    get view(): ICanvas
    {
        return this._view.element;
    }

    /**
     * Measurements of the screen. (0, 0, screenWidth, screenHeight).
     * Its safe to use as filterArea or hitArea for the whole stage.
     */
    get screen(): Rectangle
    {
        return this._view.screen;
    }

    /** the last object rendered by the renderer. Useful for other plugins like interaction managers */
    get lastObjectRendered(): IRenderableObject
    {
        return this.objectRenderer.lastObjectRendered;
    }

    /** Flag if we are rendering to the screen vs renderTexture */
    get renderingToScreen(): boolean
    {
        return this.objectRenderer.renderingToScreen;
    }

    /**
     * This sets if the CanvasRenderer will clear the canvas or not before the new render pass.
     * If the scene is NOT transparent PixiJS will use a canvas sized fillRect operation every
     * frame to set the canvas background color. If the scene is transparent PixiJS will use clearRect
     * to clear the canvas every frame. Disable this by setting this to false. For example, if
     * your game has a canvas filling background image you often don't need this set.
     */
    get clearBeforeRender(): boolean
    {
        return this.background.clearBeforeRender;
    }

    // deprecated zone..

    /**
     * Tracks the blend modes useful for this renderer.
     * @deprecated since 7.0.0 use `renderer.canvasContext.blendModes` instead
     */
    get blendModes(): string[]
    {
        if (process.env.DEBUG)
        {
            // eslint-disable-next-line max-len
            deprecation('7.0.0', 'renderer.blendModes has been deprecated, please use renderer.canvasContext.blendModes instead');
        }

        return this.canvasContext.blendModes;
    }

    /**
     * system that manages canvas masks
     * @deprecated since 7.0.0 use `renderer.canvasContext.mask`
     */
    get maskManager(): CanvasMaskSystem
    {
        deprecation('7.0.0', 'renderer.maskManager has been deprecated, please use renderer.mask instead');

        return this.mask;
    }

    /**
     * Boolean flag controlling canvas refresh.
     * @deprecated since 7.0.0
     */
    get refresh(): boolean
    {
        if (process.env.DEBUG)
        {
            deprecation('7.0.0', 'renderer.refresh has been deprecated');
        }

        return true;
    }

    /**
     * The root canvas 2d context that everything is drawn with.
     * @deprecated since 7.0.0 Use `renderer.canvasContext.rootContext instead
     */
    get rootContext(): ICanvasRenderingContext2D
    {
        if (process.env.DEBUG)
        {
            // eslint-disable-next-line max-len
            deprecation('7.0.0', 'renderer.rootContext has been deprecated, please use renderer.canvasContext.rootContext instead');
        }

        return this.canvasContext.rootContext;
    }

    /**
     * The currently active canvas 2d context (could change with renderTextures)
     * @deprecated since 7.0.0 Use `renderer.canvasContext.activeContext instead
     */
    get context(): ICanvasRenderingContext2D
    {
        if (process.env.DEBUG)
        {
            // eslint-disable-next-line max-len
            deprecation('7.0.0', 'renderer.context has been deprecated, please use renderer.canvasContext.activeContext instead');
        }

        return this.canvasContext.activeContext;
    }

    /**
     * The canvas property used to set the canvas smoothing property.
     * @deprecated since 7.0.0 Use `renderer.canvasContext.smoothProperty` instead.
     */
    get smoothProperty(): SmoothingEnabledProperties
    {
        if (process.env.DEBUG)
        {
            // eslint-disable-next-line max-len
            deprecation('7.0.0', 'renderer.smoothProperty has been deprecated, please use renderer.canvasContext.smoothProperty instead');
        }

        return this.canvasContext.smoothProperty;
    }

    /**
     * Sets the blend mode of the renderer.
     * @param {number} blendMode - See {@link PIXI.BLEND_MODES} for valid values.
     * @param {boolean} [readyForOuterBlend=false] - Some blendModes are dangerous, they affect outer space of sprite.
     * Pass `true` only if you are ready to use them.
     * @deprecated since 7.0.0 Use `renderer.canvasContext.setBlendMode` instead.
     */
    setBlendMode(blendMode: BLEND_MODES, readyForOuterBlend?: boolean): void
    {
        if (process.env.DEBUG)
        {
            // eslint-disable-next-line max-len
            deprecation('7.0.0', 'renderer.setBlendMode has been deprecated, use renderer.canvasContext.setBlendMode instead');
        }

        this.canvasContext.setBlendMode(blendMode, readyForOuterBlend);
    }

    /**
     * Checks if blend mode has changed.
     * @deprecated since 7.0.0 Use `renderer.canvasContext.invalidateBlendMode` instead.
     */
    invalidateBlendMode(): void
    {
        if (process.env.DEBUG)
        {
            // eslint-disable-next-line max-len
            deprecation('7.0.0', 'renderer.invalidateBlendMode has been deprecated, use renderer.canvasContext.invalidateBlendMode instead');
        }

        this.canvasContext.invalidateBlendMode();
    }

    /**
     * Sets matrix of context.
     * called only from render() methods
     * takes care about resolution
     * @param transform - world matrix of current element
     * @param roundPixels - whether to round (tx,ty) coords
     * @param localResolution - If specified, used instead of `renderer.resolution` for local scaling
     * @deprecated since 7.0.0 - Use `renderer.canvasContext.setContextTransform` instead.
     */
    setContextTransform(transform: Matrix, roundPixels?: boolean, localResolution?: number): void
    {
        if (process.env.DEBUG)
        {
            // eslint-disable-next-line max-len
            deprecation('7.0.0', 'renderer.setContextTransform has been deprecated, use renderer.canvasContext.setContextTransform instead');
        }

        this.canvasContext.setContextTransform(transform, roundPixels, localResolution);
    }

    /**
     * The background color to fill if not transparent
     * @deprecated since 7.0.0
     */
    get backgroundColor(): ColorSource
    {
        if (process.env.DEBUG)
        {
            // eslint-disable-next-line max-len
            deprecation('7.0.0', 'renderer.backgroundColor has been deprecated, use renderer.background.color instead.');
        }

        return this.background.color;
    }

    /**
     * @deprecated since 7.0.0
     * @ignore
     */
    set backgroundColor(value: ColorSource)
    {
        if (process.env.DEBUG)
        {
            deprecation('7.0.0', 'renderer.backgroundColor has been deprecated, use renderer.background.color instead.');
        }

        this.background.color = value;
    }

    /**
     * The background color alpha. Setting this to 0 will make the canvas transparent.
     * @member {number}
     * @deprecated since 7.0.0
     */
    get backgroundAlpha(): number
    {
        if (process.env.DEBUG)
        {
            // eslint-disable-next-line max-len
            deprecation('7.0.0', 'renderer.backgroundAlpha has been deprecated, use renderer.background.alpha instead.');
        }

        return this.background.alpha;
    }

    /**
     * @deprecated since 7.0.0
     * @ignore
     */
    set backgroundAlpha(value: number)
    {
        if (process.env.DEBUG)
        {
            // eslint-disable-next-line max-len
            deprecation('7.0.0', 'renderer.backgroundAlpha has been deprecated, use renderer.background.alpha instead.');
        }

        this.background.alpha = value;
    }

    /**
     * old abstract function not used by canvas renderer
     * @deprecated since 7.0.0
     */
    get preserveDrawingBuffer(): boolean
    {
        if (process.env.DEBUG)
        {
            deprecation('7.0.0', 'renderer.preserveDrawingBuffer has been deprecated');
        }

        return false;
    }

    /**
     * old abstract function not used by canvas renderer
     * @deprecated since 7.0.0
     */
    get useContextAlpha(): boolean
    {
        if (process.env.DEBUG)
        {
            deprecation('7.0.0', 'renderer.useContextAlpha has been deprecated');
        }

        return false;
    }

    /** @private */
    static readonly __plugins: IRendererPlugins = {};

    /** @private */
    static readonly __systems: Record<string, any> = {};

    /**
     * Collection of installed plugins. These are included by default in PIXI, but can be excluded
     * by creating a custom build. Consult the README for more information about creating custom
     * builds and excluding plugins.
     * @member {object} plugins
     * @readonly
     * @property {PIXI.AccessibilityManager} accessibility Support tabbing interactive elements.
     */
}

extensions.handleByMap(ExtensionType.CanvasRendererPlugin, CanvasRenderer.__plugins);
extensions.handleByMap(ExtensionType.CanvasRendererSystem, CanvasRenderer.__systems);
extensions.add(CanvasRenderer);
