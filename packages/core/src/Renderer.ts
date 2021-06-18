import { EventEmitter, sayHello, isWebGLSupported, hex2string, hex2rgb } from '@pixi/utils';
import { MaskSystem } from './mask/MaskSystem';
import { StencilSystem } from './mask/StencilSystem';
import { ScissorSystem } from './mask/ScissorSystem';
import { FilterSystem } from './filters/FilterSystem';
import { FramebufferSystem } from './framebuffer/FramebufferSystem';
import { RenderTextureSystem } from './renderTexture/RenderTextureSystem';
import { TextureSystem } from './textures/TextureSystem';
import { ProjectionSystem } from './projection/ProjectionSystem';
import { StateSystem } from './state/StateSystem';
import { GeometrySystem } from './geometry/GeometrySystem';
import { ShaderSystem } from './shader/ShaderSystem';
import { ContextSystem } from './context/ContextSystem';
import { BatchSystem } from './batch/BatchSystem';
import { TextureGCSystem } from './textures/TextureGCSystem';
import { UniformGroup } from './shader/UniformGroup';
import { Matrix, Rectangle } from '@pixi/math';
import { Runner } from '@pixi/runner';
import { BufferSystem } from './geometry/BufferSystem';
import { RenderTexture } from './renderTexture/RenderTexture';
import { settings } from '@pixi/settings';
import { AbstractBatchRenderer } from './batch/AbstractBatchRenderer';
import { BatchRenderer } from './batch/BatchPluginFactory';

import type { IRenderableContainer, IRenderableObject } from './IRenderableObject';
import type { ISystemConstructor } from './ISystem';
import type { IRenderingContext } from './IRenderingContext';
import type { MSAA_QUALITY, SCALE_MODES } from '@pixi/constants';

export interface IRendererPluginConstructor {
    new (renderer: Renderer, options?: any): IRendererPlugin;
}

export interface IRendererPlugin {
    destroy(): void;
}

const tempMatrix = new Matrix();

export interface IRendererOptions extends GlobalMixins.IRendererOptions
{
    width?: number;
    height?: number;
    view?: HTMLCanvasElement;
    useContextAlpha?: boolean | 'notMultiplied';
    autoDensity?: boolean;
    antialias?: boolean;
    resolution?: number;
    preserveDrawingBuffer?: boolean;
    clearBeforeRender?: boolean;
    backgroundColor?: number;
    backgroundAlpha?: number;
    powerPreference?: WebGLPowerPreference;
    context?: IRenderingContext;
}

export interface Renderer extends GlobalMixins.IRendererSystems {
    mask: MaskSystem;
    context: ContextSystem;
    state: StateSystem;
    shader: ShaderSystem;
    texture: TextureSystem;
    buffer: BufferSystem;
    geometry: GeometrySystem;
    framebuffer: FramebufferSystem;
    scissor: ScissorSystem;
    stencil: StencilSystem;
    projection: ProjectionSystem;
    textureGC: TextureGCSystem;
    filter: FilterSystem;
    renderTexture: RenderTextureSystem;
    batch: BatchSystem;
}

/**
 * Plugins used in renderer.plugins
 */
export interface IRendererPlugins extends GlobalMixins.IRendererPlugins
{
    batch: AbstractBatchRenderer;
}

export interface IRendererRenderOptions {
    renderTexture?: RenderTexture;
    clear?: boolean;
    transform?: Matrix;
    skipUpdateTransform?: boolean;
}

/**
 * The Renderer draws the scene and all its content onto a WebGL enabled canvas.
 *
 * This renderer should be used for browsers that support WebGL.
 *
 * This renderer works by automatically managing WebGLBatchesm, so no need for Sprite Batches or Sprite Clouds.
 * Don't forget to add the view to your DOM or you will not see anything!
 *
 * Renderer is composed of systems that manage specific tasks. The following systems are added by default
 * whenever you create a renderer:
 *
 * | System                               | Description                                                                   |
 * | ------------------------------------ | ----------------------------------------------------------------------------- |
 * | {@link PIXI.BatchSystem}             | This manages object renderers that defer rendering until a flush.             |
 * | {@link PIXI.ContextSystem}           | This manages the WebGL context and extensions.                                |
 * | {@link PIXI.EventSystem}             | This manages UI events.                                                       |
 * | {@link PIXI.FilterSystem}            | This manages the filtering pipeline for post-processing effects.              |
 * | {@link PIXI.FramebufferSystem}       | This manages framebuffers, which are used for offscreen rendering.            |
 * | {@link PIXI.GeometrySystem}          | This manages geometries & buffers, which are used to draw object meshes.      |
 * | {@link PIXI.MaskSystem}              | This manages masking operations.                                              |
 * | {@link PIXI.ProjectionSystem}        | This manages the `projectionMatrix`, used by shaders to get NDC coordinates.  |
 * | {@link PIXI.RenderTextureSystem}     | This manages render-textures, which are an abstraction over framebuffers.     |
 * | {@link PIXI.ScissorSystem}           | This handles scissor masking, and is used internally by {@link MaskSystem}    |
 * | {@link PIXI.ShaderSystem}            | This manages shaders, programs that run on the GPU to calculate 'em pixels.   |
 * | {@link PIXI.StateSystem}             | This manages the WebGL state variables like blend mode, depth testing, etc.   |
 * | {@link PIXI.StencilSystem}           | This handles stencil masking, and is used internally by {@link MaskSystem}    |
 * | {@link PIXI.TextureSystem}           | This manages textures and their resources on the GPU.                         |
 * | {@link PIXI.TextureGCSystem}         | This will automatically remove textures from the GPU if they are not used.    |
 *
 * The breadth of the API surface provided by the renderer is contained within these systems.
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.utils.EventEmitter
 */
export class Renderer extends EventEmitter
{
    public resolution: number;
    public clearBeforeRender?: boolean;
    public readonly options: IRendererOptions;
    public readonly screen: Rectangle;
    public readonly view: HTMLCanvasElement;
    public readonly plugins: IRendererPlugins;
    public readonly useContextAlpha: boolean | 'notMultiplied';
    public readonly autoDensity: boolean;
    public readonly preserveDrawingBuffer: boolean;
    public gl: IRenderingContext;
    public globalUniforms: UniformGroup;
    public CONTEXT_UID: number;
    public renderingToScreen: boolean;

    runners: {[key: string]: Runner};

    protected _backgroundColor: number;
    protected _backgroundColorString: string;
    _backgroundColorRgba: number[];
    _lastObjectRendered: IRenderableObject;

    /**
     * Create renderer if WebGL is available.
     * Throws error if WebGL is not available.
     * @static
     * @private
     */
    static create(options?: IRendererOptions): Renderer
    {
        if (isWebGLSupported())
        {
            return new Renderer(options);
        }

        throw new Error('WebGL unsupported in this browser.');
    }

    /**
     * @param [options] - The optional renderer parameters.
     * @param {number} [options.width=800] - The width of the screen.
     * @param {number} [options.height=600] - The height of the screen.
     * @param {HTMLCanvasElement} [options.view] - The canvas to use as a view, optional.
     * @param {boolean} [options.useContextAlpha=true] - Pass-through value for canvas' context `alpha` property.
     *   If you want to set transparency, please use `backgroundAlpha`. This option is for cases where the
     *   canvas needs to be opaque, possibly for performance reasons on some older devices.
     * @param {boolean} [options.autoDensity=false] - Resizes renderer view in CSS pixels to allow for
     *   resolutions other than 1.
     * @param {boolean} [options.antialias=false] - Sets antialias. If not available natively then FXAA
     *  antialiasing is used.
     * @param {number} [options.resolution=PIXI.settings.RESOLUTION] - The resolution / device pixel ratio of the renderer.
     * @param {boolean} [options.clearBeforeRender=true] - This sets if the renderer will clear
     *  the canvas or not before the new render pass. If you wish to set this to false, you *must* set
     *  preserveDrawingBuffer to `true`.
     * @param {boolean} [options.preserveDrawingBuffer=false] - Enables drawing buffer preservation,
     *  enable this if you need to call toDataUrl on the WebGL context.
     * @param {number} [options.backgroundColor=0x000000] - The background color of the rendered area
     *  (shown if not transparent).
     * @param {number} [options.backgroundAlpha=1] - Value from 0 (fully transparent) to 1 (fully opaque).
     * @param {string} [options.powerPreference] - Parameter passed to WebGL context, set to "high-performance"
     *  for devices with dual graphics card.
     * @param {object} [options.context] - If WebGL context already exists, all parameters must be taken from it.
     * @public
     */
    constructor(options? : IRendererOptions)
    {
        super();

        // Add the default render options
        options = Object.assign({}, settings.RENDER_OPTIONS, options);

        /**
         * The supplied constructor options.
         *
         * @member {Object}
         * @readOnly
         */
        this.options = options;

        /**
         * The canvas element that everything is drawn to.
         *
         * @member {HTMLCanvasElement}
         */
        this.view = options.view || document.createElement('canvas');

        /**
         * The resolution / device pixel ratio of the renderer.
         *
         * @member {number}
         * @default PIXI.settings.RESOLUTION
         */
        this.resolution = options.resolution || settings.RESOLUTION;

        /**
         * Pass-thru setting for the the canvas' context `alpha` property. This is typically
         * not something you need to fiddle with. If you want transparency, use `backgroundAlpha`.
         *
         * @member {boolean}
         */
        this.useContextAlpha = options.useContextAlpha;

        /**
         * Whether CSS dimensions of canvas view should be resized to screen dimensions automatically.
         *
         * @member {boolean}
         */
        this.autoDensity = !!options.autoDensity;

        /**
         * The value of the preserveDrawingBuffer flag affects whether or not the contents of
         * the stencil buffer is retained after rendering.
         *
         * @member {boolean}
         */
        this.preserveDrawingBuffer = options.preserveDrawingBuffer;

        /**
         * This sets if the Renderer will clear the canvas or not before the new render pass.
         * If the scene is NOT transparent PixiJS will use a canvas sized fillRect operation every
         * frame to set the canvas background color. If the scene is transparent PixiJS will use clearRect
         * to clear the canvas every frame. Disable this by setting this to false. For example, if
         * your game has a canvas filling background image you often don't need this set.
         *
         * @member {boolean}
         * @default
         */
        this.clearBeforeRender = options.clearBeforeRender;

        /**
         * The background color as a number.
         *
         * @member {number}
         * @protected
         */
        this._backgroundColor = 0x000000;

        /**
         * The background color as an [R, G, B, A] array.
         *
         * @member {number[]}
         * @protected
         */
        this._backgroundColorRgba = [0, 0, 0, 1];

        /**
         * The background color as a string.
         *
         * @member {string}
         * @protected
         */
        this._backgroundColorString = '#000000';

        this.backgroundColor = options.backgroundColor || this._backgroundColor; // run bg color setter
        this.backgroundAlpha = options.backgroundAlpha;

        /**
         * The last root object that the renderer tried to render.
         *
         * @member {PIXI.DisplayObject}
         * @protected
         */
        this._lastObjectRendered = null;

        /**
         * Collection of plugins.
         * @readonly
         * @member {object}
         */
        this.plugins = Object.create(null);

        /**
         * Measurements of the screen. (0, 0, screenWidth, screenHeight).
         *
         * Its safe to use as filterArea or hitArea for the whole stage.
         *
         * @member {PIXI.Rectangle}
         */
        this.screen = new Rectangle(0, 0, options.width, options.height);

        /**
         * WebGL context, set by the contextSystem (this.context)
         *
         * @readonly
         * @member {WebGLRenderingContext}
         */
        this.gl = null;

        this.CONTEXT_UID = 0;

        /**
         * Internal signal instances of **runner**, these
         * are assigned to each system created.
         * @see PIXI.Runner
         * @name runners
         * @private
         * @type {object}
         * @readonly
         * @property {PIXI.Runner} destroy - Destroy runner
         * @property {PIXI.Runner} contextChange - Context change runner
         * @property {PIXI.Runner} reset - Reset runner
         * @property {PIXI.Runner} update - Update runner
         * @property {PIXI.Runner} postrender - Post-render runner
         * @property {PIXI.Runner} prerender - Pre-render runner
         * @property {PIXI.Runner} resize - Resize runner
         */
        this.runners = {
            destroy: new Runner('destroy'),
            contextChange: new Runner('contextChange'),
            reset: new Runner('reset'),
            update: new Runner('update'),
            postrender: new Runner('postrender'),
            prerender: new Runner('prerender'),
            resize: new Runner('resize'),
        };

        /**
         * Global uniforms
         * @member {PIXI.UniformGroup}
         */
        this.globalUniforms = new UniformGroup({
            projectionMatrix: new Matrix(),
        }, true);

        Renderer.__systems.forEach(([name, ctor]) => this.addSystem(ctor, name));
        Renderer.__plugins.forEach(([name, ctor]) => this.addPlugin(ctor, name));

        /*
         * The options passed in to create a new WebGL context.
         */
        if (options.context)
        {
            this.context.initFromContext(options.context);
        }
        else
        {
            this.context.initFromOptions({
                alpha: !!this.useContextAlpha,
                antialias: options.antialias,
                premultipliedAlpha: this.useContextAlpha && this.useContextAlpha !== 'notMultiplied',
                stencil: true,
                preserveDrawingBuffer: options.preserveDrawingBuffer,
                powerPreference: this.options.powerPreference,
            });
        }

        /**
         * Flag if we are rendering to the screen vs renderTexture
         * @member {boolean}
         * @readonly
         * @default true
         */
        this.renderingToScreen = true;

        sayHello(this.context.webGLVersion === 2 ? 'WebGL 2' : 'WebGL 1');

        this.resize(this.options.width, this.options.height);
    }

    /**
     * Same as view.width, actual number of pixels in the canvas by horizontal.
     *
     * @member {number}
     * @readonly
     * @default 800
     */
    get width(): number
    {
        return this.view.width;
    }

    /**
     * Same as view.height, actual number of pixels in the canvas by vertical.
     *
     * @member {number}
     * @readonly
     * @default 600
     */
    get height(): number
    {
        return this.view.height;
    }

    /**
     * The background color to fill if not transparent
     *
     * @member {number}
     */
    get backgroundColor(): number
    {
        return this._backgroundColor;
    }

    set backgroundColor(value: number)
    {
        this._backgroundColor = value;
        this._backgroundColorString = hex2string(value);
        hex2rgb(value, this._backgroundColorRgba);
    }

    /**
     * The background color alpha. Setting this to 0 will make the canvas transparent.
     *
     * @member {number}
     */
    get backgroundAlpha(): number
    {
        return this._backgroundColorRgba[3];
    }
    set backgroundAlpha(value: number)
    {
        this._backgroundColorRgba[3] = value;
    }

    /**
     * Useful function that returns a texture of the display object that can then be used to create sprites
     * This can be quite useful if your displayObject is complicated and needs to be reused multiple times.
     *
     * @param displayObject - The displayObject the object will be generated from.
     * @param scaleMode - The scale mode of the texture.
     * @param resolution - The resolution / device pixel ratio of the texture being generated.
     * @param [region] - The region of the displayObject, that shall be rendered,
     *        if no region is specified, defaults to the local bounds of the displayObject.
     * @param multisample - The number of samples of the frame buffer.
     * @return A texture of the graphics object.
     */
    generateTexture(displayObject: IRenderableObject,
        scaleMode?: SCALE_MODES, resolution?: number, region?: Rectangle, multisample?: MSAA_QUALITY): RenderTexture
    {
        region = region || (displayObject as IRenderableContainer).getLocalBounds(null, true);

        // minimum texture size is 1x1, 0x0 will throw an error
        if (region.width === 0) region.width = 1;
        if (region.height === 0) region.height = 1;

        const renderTexture = RenderTexture.create(
            {
                width: region.width | 0,
                height: region.height | 0,
                scaleMode,
                resolution,
                multisample,
            });

        tempMatrix.tx = -region.x;
        tempMatrix.ty = -region.y;

        this.render(displayObject, {
            renderTexture,
            clear: false,
            transform: tempMatrix,
            skipUpdateTransform: !!displayObject.parent
        });

        return renderTexture;
    }

    /**
     * Add a new plugin to the renderer.
     * @param ClassRef - Class reference
     * @param name - Property name for the plugin.
     * @returns
     */
    addPlugin(ClassRef: IRendererPluginConstructor, name: string): this
    {
        const plugin = new ClassRef(this);

        if ((this.plugins as any)[name])
        {
            throw new Error(`Whoops! The plugin name "${name}" is already in use`);
        }

        (this.plugins as any)[name] = plugin;

        return this;
    }

    /**
     * Add a new system to the renderer.
     * @param ClassRef - Class reference
     * @param name - Property name for system
     * @return {PIXI.Renderer} Return instance of renderer
     */
    addSystem(ClassRef: ISystemConstructor, name: keyof Renderer): this
    {
        const system = new ClassRef(this);

        if ((this as any)[name])
        {
            throw new Error(`Whoops! The name "${name}" is already in use`);
        }

        (this as any)[name] = system;

        for (const i in this.runners)
        {
            this.runners[i].add(system);
        }

        /**
         * Fired after rendering finishes.
         *
         * @event PIXI.Renderer#postrender
         */

        /**
         * Fired before rendering starts.
         *
         * @event PIXI.Renderer#prerender
         */

        /**
         * Fired when the WebGL context is set.
         *
         * @event PIXI.Renderer#context
         * @param {WebGLRenderingContext} gl - WebGL context.
         */

        return this;
    }

    /**
     * Renders the object to its WebGL view.
     *
     * @param displayObject - The object to be rendered.
     * @param {object} [options] - Object to use for render options.
     * @param {PIXI.RenderTexture} [options.renderTexture] - The render texture to render to.
     * @param {boolean} [options.clear=true] - Should the canvas be cleared before the new render.
     * @param {PIXI.Matrix} [options.transform] - A transform to apply to the render texture before rendering.
     * @param {boolean} [options.skipUpdateTransform=false] - Should we skip the update transform pass?
     */
    render(displayObject: IRenderableObject, options?: IRendererRenderOptions): void;

    /**
     * @ignore
     */
    render(displayObject: IRenderableObject, options?: IRendererRenderOptions): void
    {
        let renderTexture: RenderTexture;
        let clear: boolean;
        let transform: Matrix;
        let skipUpdateTransform: boolean;

        if (options)
        {
            renderTexture = options.renderTexture;
            clear = options.clear;
            transform = options.transform;
            skipUpdateTransform = options.skipUpdateTransform;
        }

        // can be handy to know!
        this.renderingToScreen = !renderTexture;

        this.runners.prerender.emit();
        this.emit('prerender');

        // apply a transform at a GPU level
        this.projection.transform = transform;

        // no point rendering if our context has been blown up!
        if (this.context.isLost)
        {
            return;
        }

        if (!renderTexture)
        {
            this._lastObjectRendered = displayObject;
        }

        if (!skipUpdateTransform)
        {
            // update the scene graph
            const cacheParent = displayObject.enableTempParent();

            displayObject.updateTransform();
            displayObject.disableTempParent(cacheParent);
            // displayObject.hitArea = //TODO add a temp hit area
        }

        this.renderTexture.bind(renderTexture);
        this.batch.currentRenderer.start();

        if (clear !== undefined ? clear : this.clearBeforeRender)
        {
            this.renderTexture.clear();
        }

        displayObject.render(this);

        // apply transform..
        this.batch.currentRenderer.flush();

        if (renderTexture)
        {
            renderTexture.baseTexture.update();
        }

        this.runners.postrender.emit();

        // reset transform after render
        this.projection.transform = null;

        this.emit('postrender');
    }

    /**
     * Resizes the WebGL view to the specified width and height.
     *
     * @param screenWidth - The new width of the screen.
     * @param screenHeight - The new height of the screen.
     */
    resize(screenWidth: number, screenHeight: number): void
    {
        this.screen.width = screenWidth;
        this.screen.height = screenHeight;

        this.view.width = screenWidth * this.resolution;
        this.view.height = screenHeight * this.resolution;

        if (this.autoDensity)
        {
            this.view.style.width = `${screenWidth}px`;
            this.view.style.height = `${screenHeight}px`;
        }

        /**
         * Fired after view has been resized.
         *
         * @event PIXI.Renderer#resize
         * @param {number} screenWidth - The new width of the screen.
         * @param {number} screenHeight - The new height of the screen.
         */
        this.emit('resize', screenWidth, screenHeight);

        this.runners.resize.emit(screenWidth, screenHeight);
    }

    /**
     * Resets the WebGL state so you can render things however you fancy!
     *
     * @return {PIXI.Renderer} Returns itself.
     */
    reset(): this
    {
        this.runners.reset.emit();

        return this;
    }

    /**
     * Clear the frame buffer
     */
    clear(): void
    {
        this.renderTexture.bind();
        this.renderTexture.clear();
    }

    /**
     * Removes everything from the renderer (event listeners, spritebatch, etc...)
     *
     * @param [removeView=false] - Removes the Canvas element from the DOM.
     *  See: https://github.com/pixijs/pixi.js/issues/2233
     */
    destroy(removeView?: boolean): void
    {
        this.runners.destroy.emit();

        for (const r in this.runners)
        {
            this.runners[r].destroy();
        }

        for (const o in this.plugins)
        {
            const name = o as keyof IRendererPlugins;

            this.plugins[name].destroy();
            delete this.plugins[name];
        }

        if (removeView && this.view.parentNode)
        {
            this.view.parentNode.removeChild(this.view);
        }

        const thisAny = this as any;

        // null-ing all objects, that's a tradition!

        thisAny.plugins = null;
        thisAny.view = null;
        thisAny.screen = null;
        thisAny._tempDisplayObjectParent = null;
        thisAny.options = null;
        this._backgroundColorRgba = null;
        this._backgroundColorString = null;
        this._lastObjectRendered = null;

        // TODO nullify all the managers..
        this.gl = null;
    }

    /**
     * Collection of installed plugins. These are included by default in PIXI, but can be excluded
     * by creating a custom build. Consult the README for more information about creating custom
     * builds and excluding plugins.
     * @name plugins
     * @type {object}
     * @readonly
     * @property {PIXI.AccessibilityManager} accessibility Support tabbing interactive elements.
     * @property {PIXI.Extract} extract Extract image data from renderer.
     * @property {PIXI.ParticleRenderer} particle Renderer for ParticleContainer objects.
     * @property {PIXI.Prepare} prepare Pre-render display objects.
     * @property {PIXI.BatchRenderer} batch Batching of Sprite, Graphics and Mesh objects.
     * @property {PIXI.TilingSpriteRenderer} tilingSprite Renderer for TilingSprite objects.
     */
    static __plugins: Array<[keyof IRendererPlugins, IRendererPluginConstructor]> = [
        ['batch', BatchRenderer]
    ];

    /**
     * Collection of installed systems. A system is a core, narrowly-scoped piece of Renderer functionality.
     * @private
     */
    static __systems: Array<[keyof Renderer, ISystemConstructor]> = [
        ['mask', MaskSystem],
        ['context', ContextSystem],
        ['state', StateSystem],
        ['shader', ShaderSystem],
        ['texture', TextureSystem],
        ['buffer', BufferSystem],
        ['geometry', GeometrySystem],
        ['framebuffer', FramebufferSystem],
        ['scissor', ScissorSystem],
        ['stencil', StencilSystem],
        ['projection', ProjectionSystem],
        ['textureGC', TextureGCSystem],
        ['filter', FilterSystem],
        ['renderTexture', RenderTextureSystem],
        ['batch', BatchSystem],
    ];

    /**
     * Adds a plugin to the renderer.
     *
     * @method
     * @param pluginName - The name of the plugin.
     * @param ctor - The constructor function or class for the plugin.
     */
    static registerPlugin(pluginName: keyof IRendererPlugins, ctor: IRendererPluginConstructor): void
    {
        const entry = [pluginName, ctor] as [keyof IRendererPlugins, IRendererPluginConstructor];
        const index = Renderer.__plugins.findIndex(([name]) => name === pluginName);

        // Allow users to replace default plugin, e.g., batch
        if (index > -1)
        {
            Renderer.__plugins[index] = entry;
        }
        else
        {
            Renderer.__plugins.push(entry);
        }
    }

    /**
     * Adds a system to the renderer.
     *
     * @method
     * @param systemName - The name of the system.
     * @param ctor - The constructor function or class for the system.
     */
    static registerSystem(systemName: keyof Renderer, ctor: ISystemConstructor): void
    {
        const entry = [systemName, ctor] as [keyof Renderer, ISystemConstructor];
        const index = Renderer.__systems.findIndex(([name]) => name === systemName);

        // Allow users to replace default systems
        if (index > -1)
        {
            Renderer.__systems[index] = entry;
        }
        else
        {
            Renderer.__systems.push(entry);
        }
    }
}
