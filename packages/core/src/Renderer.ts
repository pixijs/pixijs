import { isWebGLSupported, deprecation } from '@pixi/utils';
import type { MaskSystem } from './mask/MaskSystem';
import type { StencilSystem } from './mask/StencilSystem';
import type { ScissorSystem } from './mask/ScissorSystem';
import type { FilterSystem } from './filters/FilterSystem';
import type { FramebufferSystem } from './framebuffer/FramebufferSystem';
import type { RenderTextureSystem } from './renderTexture/RenderTextureSystem';
import type { TextureSystem } from './textures/TextureSystem';
import type { ProjectionSystem } from './projection/ProjectionSystem';
import type { StateSystem } from './state/StateSystem';
import type { GeometrySystem } from './geometry/GeometrySystem';
import type { ShaderSystem } from './shader/ShaderSystem';
import type { ContextSystem } from './context/ContextSystem';
import type { BatchSystem } from './batch/BatchSystem';
import type { TextureGCSystem } from './textures/TextureGCSystem';
import type { MSAA_QUALITY, RENDERER_TYPE } from '@pixi/constants';
import { UniformGroup } from './shader/UniformGroup';
import type { Rectangle } from '@pixi/math';
import { Matrix } from '@pixi/math';
import type { BufferSystem } from './geometry/BufferSystem';
import type { RenderTexture } from './renderTexture/RenderTexture';
import type { ExtensionMetadata } from '@pixi/extensions';
import { extensions, ExtensionType } from '@pixi/extensions';
import type { PluginSystem, IRendererPlugins } from './plugin/PluginSystem';
import type { MultisampleSystem } from './framebuffer/MultisampleSystem';
import type { IGenerateTextureOptions, GenerateTextureSystem } from './renderTexture/GenerateTextureSystem';
import type { BackgroundSystem } from './background/BackgroundSystem';
import type { ViewSystem } from './view/ViewSystem';
import type { ObjectRendererSystem } from './render/ObjectRendererSystem';
import { settings } from '@pixi/settings';
import type { ICanvas } from '@pixi/settings';
import { SystemManager } from './system/SystemManager';
import type { IRenderableObject, IRenderer, IRendererOptions, IRendererRenderOptions, IRenderingContext } from './IRenderer';
import type { StartupSystem, StartupOptions } from './startup/StartupSystem';
import type { TransformFeedbackSystem } from './transformFeedback/TransformFeedbackSystem';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Renderer extends GlobalMixins.Renderer {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Renderer extends GlobalMixins.Renderer {}

/**
 * The Renderer draws the scene and all its content onto a WebGL enabled canvas.
 *
 * This renderer should be used for browsers that support WebGL.
 *
 * This renderer works by automatically managing WebGLBatches, so no need for Sprite Batches or Sprite Clouds.
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
 *
 * | WebGL Core Systems                   | Provide an optimised, easy to use API to work with WebGL                      |
 * | ------------------------------------ | ----------------------------------------------------------------------------- |
 * | {@link PIXI.ContextSystem}           | This manages the WebGL context and extensions.                                |
 * | {@link PIXI.FramebufferSystem}       | This manages framebuffers, which are used for offscreen rendering.            |
 * | {@link PIXI.GeometrySystem}          | This manages geometries & buffers, which are used to draw object meshes.      |
 * | {@link PIXI.ShaderSystem}            | This manages shaders, programs that run on the GPU to calculate 'em pixels.   |
 * | {@link PIXI.StateSystem}             | This manages the WebGL state variables like blend mode, depth testing, etc.   |
 * | {@link PIXI.TextureSystem}           | This manages textures and their resources on the GPU.                         |
 * | {@link PIXI.TextureGCSystem}         | This will automatically remove textures from the GPU if they are not used.    |
 * | {@link PIXI.MultisampleSystem}       | This manages the multisample const on the WEbGL Renderer                      |
 *
 * | PixiJS High-Level Systems            | Set of specific systems designed to work with PixiJS objects                  |
 * | ------------------------------------ | ----------------------------------------------------------------------------- |
 * | {@link PIXI.RenderSystem}            | This adds the ability to render a PIXI.DisplayObject                          |
 * | {@link PIXI.GenerateTextureSystem}   | This adds the ability to generate textures from any PIXI.DisplayObject        |
 * | {@link PIXI.ProjectionSystem}        | This manages the `projectionMatrix`, used by shaders to get NDC coordinates.  |
 * | {@link PIXI.RenderTextureSystem}     | This manages render-textures, which are an abstraction over framebuffers.     |
 * | {@link PIXI.MaskSystem}              | This manages masking operations.                                              |
 * | {@link PIXI.ScissorSystem}           | This handles scissor masking, and is used internally by {@link MaskSystem}    |
 * | {@link PIXI.StencilSystem}           | This handles stencil masking, and is used internally by {@link MaskSystem}    |
 * | {@link PIXI.FilterSystem}            | This manages the filtering pipeline for post-processing effects.              |
 * | {@link PIXI.BatchSystem}             | This manages object renderers that defer rendering until a flush.             |
 * | {@link PIXI.Prepare}                 | This manages uploading assets to the GPU.                                     |
 * | {@link PIXI.Extract}                 | This extracts image data from display objects.                                |
 *
 * The breadth of the API surface provided by the renderer is contained within these systems.
 * @memberof PIXI
 */
export class Renderer extends SystemManager<Renderer> implements IRenderer
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: ExtensionType.Renderer,
        priority: 1,
    };

    /**
     * The type of the renderer. will be PIXI.RENDERER_TYPE.CANVAS
     * @member {number}
     * @see PIXI.RENDERER_TYPE
     */
    public readonly type: RENDERER_TYPE.WEBGL;

    /**
     * WebGL context, set by {@link PIXI.ContextSystem this.context}.
     * @readonly
     * @member {WebGLRenderingContext}
     */
    public gl: IRenderingContext;

    /**
     * Global uniforms
     * Add any uniforms you want shared across your shaders.
     * the must be added before the scene is rendered for the first time
     * as we dynamically buildcode to handle all global var per shader
     *
     */
    public globalUniforms: UniformGroup;

    /** Unique UID assigned to the renderer's WebGL context. */
    public CONTEXT_UID: number;

    // systems

    /**
     * Mask system instance
     * @readonly
     */
    public readonly mask: MaskSystem;

    /**
     * Context system instance
     * @readonly
     */
    public readonly context: ContextSystem;

    /**
     * State system instance
     * @readonly
     */
    public readonly state: StateSystem;

    /**
     * Shader system instance
     * @readonly
     */
    public readonly shader: ShaderSystem;

    /**
     * Texture system instance
     * @readonly
     */
    public readonly texture: TextureSystem;

    /**
     * Buffer system instance
     * @readonly
     */
    public readonly buffer: BufferSystem;

    /**
     * TransformFeedback system instance
     * @readonly
     */
    public transformFeedback: TransformFeedbackSystem;

    /**
     * Geometry system instance
     * @readonly
     */
    public readonly geometry: GeometrySystem;

    /**
     * Framebuffer system instance
     * @readonly
     */
    public readonly framebuffer: FramebufferSystem;

    /**
     * Scissor system instance
     * @readonly
     */
    public readonly scissor: ScissorSystem;

    /**
     * Stencil system instance
     * @readonly
     */
    public readonly stencil: StencilSystem;

    /**
     * Projection system instance
     * @readonly
     */
    public readonly projection: ProjectionSystem;

    /**
     * Texture garbage collector system instance
     * @readonly
     */
    public readonly textureGC: TextureGCSystem;

    /**
     * Filter system instance
     * @readonly
     */
    public readonly filter: FilterSystem;

    /**
     * RenderTexture system instance
     * @readonly
     */
    public readonly renderTexture: RenderTextureSystem;

    /**
     * Batch system instance
     * @readonly
     */
    public readonly batch: BatchSystem;

    /**
     * plugin system instance
     * @readonly
     */
    public readonly _plugin: PluginSystem;

    /**
     * _multisample system instance
     * @readonly
     */
    public readonly _multisample: MultisampleSystem;

    /**
     * textureGenerator system instance
     * @readonly
     */
    public readonly textureGenerator: GenerateTextureSystem;

    /**
     * background system instance
     * @readonly
     */
    public readonly background: BackgroundSystem;

    /**
     * _view system instance
     * @readonly
     */
    public readonly _view: ViewSystem;

    /**
     * _render system instance
     * @readonly
     */
    public readonly objectRenderer: ObjectRendererSystem;

    /**
     * startup system instance
     * @readonly
     */
    public readonly startup: StartupSystem;

    /**
     * Create renderer if WebGL is available. Overrideable
     * by the **@pixi/canvas-renderer** package to allow fallback.
     * throws error if WebGL is not available.
     * @param options
     * @private
     */
    static test(options?: IRendererOptions): boolean
    {
        if (options?.forceCanvas)
        {
            return false;
        }

        return isWebGLSupported();
    }

    /**
     * @param [options] - The optional renderer parameters.
     * @param {number} [options.width=800] - The width of the screen.
     * @param {number} [options.height=600] - The height of the screen.
     * @param {PIXI.ICanvas} [options.view] - The canvas to use as a view, optional.
     * @param {boolean} [options.premultipliedAlpha=true] - Set to `false` to disable premultipliedAlpha.
     * @param {boolean} [options.autoDensity=false] - Resizes renderer view in CSS pixels to allow for
     *   resolutions other than 1.
     * @param {boolean} [options.antialias=false] - Sets antialias. If not available natively then FXAA
     *  antialiasing is used.
     * @param {number} [options.resolution=PIXI.settings.RESOLUTION] - The resolution / device pixel ratio of the renderer.
     * @param {boolean} [options.clearBeforeRender=true] - This sets if the renderer will clear
     *  the canvas or not before the new render pass. If you wish to set this to false, you *must* set
     *  preserveDrawingBuffer to `true`.
     * @param {boolean} [options.preserveDrawingBuffer=false] - Enables drawing buffer preservation,
     *  enable this if you need to call toDataURL on the WebGL context.
     * @param {number|string} [options.backgroundColor=0x000000] - The background color of the rendered area
     *  (shown if not transparent). Also, accepts hex strings or color names (e.g., 'white').
     * @param {number|string} [options.background] - Alias for `options.backgroundColor`.
     * @param {number} [options.backgroundAlpha=1] - Value from 0 (fully transparent) to 1 (fully opaque).
     * @param {string} [options.powerPreference] - Parameter passed to WebGL context, set to "high-performance"
     *  for devices with dual graphics card.
     * @param {object} [options.context] - If WebGL context already exists, all parameters must be taken from it.
     * @param {object} [options.blit] - if rendering to a renderTexture, set to true if you want to run blit after
     * the render. defaults to false.
     * @param {boolean} [options.hello=false] - Logs renderer type and version.
     */
    constructor(options?: IRendererOptions)
    {
        super();

        // Add the default render options
        options = Object.assign({}, settings.RENDER_OPTIONS, options);

        this.gl = null;

        this.CONTEXT_UID = 0;

        this.globalUniforms = new UniformGroup({
            projectionMatrix: new Matrix(),
        }, true);

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
            systems: Renderer.__systems,
            priority: [
                '_view',
                'textureGenerator',
                'background',
                '_plugin',
                'startup',
                // low level WebGL systems
                'context',
                'state',
                'texture',
                'buffer',
                'geometry',
                'framebuffer',
                'transformFeedback',
                // high level pixi specific rendering
                'mask',
                'scissor',
                'stencil',
                'projection',
                'textureGC',
                'filter',
                'renderTexture',
                'batch',
                'objectRenderer',
                '_multisample'
            ],
        };

        this.setup(systemConfig);

        if ('useContextAlpha' in options)
        {
            // #if _DEBUG
            // eslint-disable-next-line max-len
            deprecation('7.0.0', 'options.useContextAlpha is deprecated, use options.premultipliedAlpha and options.backgroundAlpha instead');
            // #endif
            options.premultipliedAlpha = options.useContextAlpha && options.useContextAlpha !== 'notMultiplied';
            options.backgroundAlpha = options.useContextAlpha === false ? 1 : options.backgroundAlpha;
        }

        // new options!
        const startupOptions: StartupOptions = {
            hello: options.hello,
            _plugin: Renderer.__plugins,
            background: {
                alpha: options.backgroundAlpha,
                color: options.background ?? options.backgroundColor,
                clearBeforeRender: options.clearBeforeRender,
            },
            _view: {
                height: options.height,
                width: options.width,
                autoDensity: options.autoDensity,
                resolution: options.resolution,
                view: options.view,
            },
            context: {
                antialias: options.antialias,
                context: options.context,
                powerPreference: options.powerPreference,
                premultipliedAlpha: options.premultipliedAlpha,
                preserveDrawingBuffer: options.preserveDrawingBuffer,
            },
        };

        this.startup.run(startupOptions);
    }

    /**
     * Renders the object to its WebGL view.
     * @param displayObject - The object to be rendered.
     * @param {object} [options] - Object to use for render options.
     * @param {PIXI.RenderTexture} [options.renderTexture] - The render texture to render to.
     * @param {boolean} [options.clear=true] - Should the canvas be cleared before the new render.
     * @param {PIXI.Matrix} [options.transform] - A transform to apply to the render texture before rendering.
     * @param {boolean} [options.skipUpdateTransform=false] - Should we skip the update transform pass?
     */
    render(displayObject: IRenderableObject, options?: IRendererRenderOptions): void
    {
        this.objectRenderer.render(displayObject, options);
    }

    /**
     * Resizes the WebGL view to the specified width and height.
     * @param desiredScreenWidth - The desired width of the screen.
     * @param desiredScreenHeight - The desired height of the screen.
     */
    resize(desiredScreenWidth: number, desiredScreenHeight: number): void
    {
        this._view.resizeView(desiredScreenWidth, desiredScreenHeight);
    }

    /**
     * Resets the WebGL state so you can render things however you fancy!
     * @returns Returns itself.
     */
    reset(): this
    {
        this.runners.reset.emit();

        return this;
    }

    /** Clear the frame buffer. */
    clear(): void
    {
        this.renderTexture.bind();
        this.renderTexture.clear();
    }

    /**
     * Removes everything from the renderer (event listeners, spritebatch, etc...)
     * @param [removeView=false] - Removes the Canvas element from the DOM.
     *  See: https://github.com/pixijs/pixijs/issues/2233
     */
    destroy(removeView = false): void
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

    /** The number of msaa samples of the canvas. */
    get multisample(): MSAA_QUALITY
    {
        return this._multisample.multisample;
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
     *
     * Its safe to use as filterArea or hitArea for the whole stage.
     * @member {PIXI.Rectangle}
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

    /** When logging Pixi to the console, this is the name we will show */
    get rendererLogId(): string
    {
        return `WebGL ${this.context.webGLVersion}`;
    }

    /**
     * This sets weather the screen is totally cleared between each frame withthe background color and alpha
     * @deprecated since 7.0.0
     */
    get clearBeforeRender(): boolean
    {
        // #if _DEBUG
        // eslint-disable-next-line max-len
        deprecation('7.0.0', 'renderer.clearBeforeRender has been deprecated, please use renderer.background.clearBeforeRender instead.');
        // #endif

        return this.background.clearBeforeRender;
    }

    /**
     * Pass-thru setting for the canvas' context `alpha` property. This is typically
     * not something you need to fiddle with. If you want transparency, use `backgroundAlpha`.
     * @deprecated since 7.0.0
     * @member {boolean}
     */
    get useContextAlpha(): boolean | 'notMultiplied'
    {
        // #if _DEBUG
        // eslint-disable-next-line max-len
        deprecation('7.0.0', 'renderer.useContextAlpha has been deprecated, please use renderer.context.premultipliedAlpha instead.');
        // #endif

        return this.context.useContextAlpha;
    }

    /**
     * readonly drawing buffer preservation
     * we can only know this if Pixi created the context
     * @deprecated since 7.0.0
     */
    get preserveDrawingBuffer(): boolean
    {
        // #if _DEBUG
        // eslint-disable-next-line max-len
        deprecation('7.0.0', 'renderer.preserveDrawingBuffer has been deprecated, we cannot truly know this unless pixi created the context');
        // #endif

        return this.context.preserveDrawingBuffer;
    }

    /**
     * The background color to fill if not transparent
     * @member {number}
     * @deprecated since 7.0.0
     */
    get backgroundColor(): number
    {
        // #if _DEBUG
        // eslint-disable-next-line max-len
        deprecation('7.0.0', 'renderer.backgroundColor has been deprecated, use renderer.background.color instead.');
        // #endif

        return this.background.color;
    }

    set backgroundColor(value: number)
    {
        // #if _DEBUG
        deprecation('7.0.0', 'renderer.backgroundColor has been deprecated, use renderer.background.color instead.');
        // #endif

        this.background.color = value;
    }

    /**
     * The background color alpha. Setting this to 0 will make the canvas transparent.
     * @member {number}
     * @deprecated since 7.0.0
     */
    get backgroundAlpha(): number
    {
        // #if _DEBUG
        // eslint-disable-next-line max-len
        deprecation('7.0.0', 'renderer.backgroundAlpha has been deprecated, use renderer.background.alpha instead.');
        // #endif

        return this.background.color;
    }

    /**
     * @deprecated since 7.0.0
     */
    set backgroundAlpha(value: number)
    {
        // #if _DEBUG
        // eslint-disable-next-line max-len
        deprecation('7.0.0', 'renderer.backgroundAlpha has been deprecated, use renderer.background.alpha instead.');
        // #endif

        this.background.alpha = value;
    }

    /**
     * @deprecated since 7.0.0
     */
    get powerPreference(): WebGLPowerPreference
    {
        // #if _DEBUG
        // eslint-disable-next-line max-len
        deprecation('7.0.0', 'renderer.powerPreference has been deprecated, we can only know this if pixi creates the context');
        // #endif

        return this.context.powerPreference;
    }

    /**
     * Useful function that returns a texture of the display object that can then be used to create sprites
     * This can be quite useful if your displayObject is complicated and needs to be reused multiple times.
     * @param displayObject - The displayObject the object will be generated from.
     * @param {object} options - Generate texture options.
     * @param {PIXI.SCALE_MODES} options.scaleMode - The scale mode of the texture.
     * @param {number} options.resolution - The resolution / device pixel ratio of the texture being generated.
     * @param {PIXI.Rectangle} options.region - The region of the displayObject, that shall be rendered,
     *        if no region is specified, defaults to the local bounds of the displayObject.
     * @param {PIXI.MSAA_QUALITY} options.multisample - The number of samples of the frame buffer.
     * @returns A texture of the graphics object.
     */
    generateTexture(displayObject: IRenderableObject, options?: IGenerateTextureOptions): RenderTexture
    {
        return this.textureGenerator.generateTexture(displayObject, options);
    }

    /**
     * Collection of installed plugins. These are included by default in PIXI, but can be excluded
     * by creating a custom build. Consult the README for more information about creating custom
     * builds and excluding plugins.
     * @private
     */
    static readonly __plugins: IRendererPlugins = {};

    /**
     * The collection of installed systems.
     * @private
     */
    static readonly __systems: Record<string, any> = {};
}

// Handle registration of extensions
extensions.handleByMap(ExtensionType.RendererPlugin, Renderer.__plugins);
extensions.handleByMap(ExtensionType.RendererSystem, Renderer.__systems);
extensions.add(Renderer);
