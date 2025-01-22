import { Color } from '../../../../color/Color';
import { loadEnvironmentExtensions } from '../../../../environment/autoDetectEnvironment';
import { Container } from '../../../../scene/container/Container';
import { unsafeEvalSupported } from '../../../../utils/browser/unsafeEvalSupported';
import { deprecation, v8_0_0 } from '../../../../utils/logging/deprecation';
import { EventEmitter } from '../../../../utils/utils';
import { CLEAR } from '../../gl/const';
import { SystemRunner } from './SystemRunner';

import type { ColorSource, RgbaArray } from '../../../../color/Color';
import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { Matrix } from '../../../../maths/matrix/Matrix';
import type { Rectangle } from '../../../../maths/shapes/Rectangle';
import type { TypeOrBool } from '../../../../scene/container/destroyTypes';
import type { CLEAR_OR_BOOL } from '../../gl/const';
import type { Renderer } from '../../types';
import type { BackgroundSystem } from '../background/BackgroundSystem';
import type { GenerateTextureOptions, GenerateTextureSystem } from '../extract/GenerateTextureSystem';
import type { PipeConstructor } from '../instructions/RenderPipe';
import type { RenderSurface } from '../renderTarget/RenderTargetSystem';
import type { Texture } from '../texture/Texture';
import type { ViewSystem, ViewSystemDestroyOptions } from '../view/ViewSystem';
import type { SharedRendererOptions } from './SharedSystems';
import type { System, SystemConstructor } from './System';

export interface RendererConfig
{
    type: number;
    name: string;
    runners?: string[];
    systems: {name: string, value: SystemConstructor}[];
    renderPipes: {name: string, value: PipeConstructor}[];
    renderPipeAdaptors: {name: string, value: any}[];
}

/**
 * The options for rendering a view.
 * @memberof rendering
 */
export interface RenderOptions extends ClearOptions
{
    /** The container to render. */
    container: Container;
    /** the transform to apply to the container. */
    transform?: Matrix;
}

/**
 * The options for clearing the render target.
 * @memberof rendering
 */
export interface ClearOptions
{
    /**
     * The render target to render. if this target is a canvas and  you are using the WebGL renderer,
     * please ensure you have set `multiView` to `true` on renderer.
     */
    target?: RenderSurface;
    /** The color to clear with. */
    clearColor?: ColorSource;
    /** The clear mode to use. */
    clear?: CLEAR_OR_BOOL
}

export type RendererDestroyOptions = TypeOrBool<ViewSystemDestroyOptions>;

const defaultRunners = [
    'init',
    'destroy',
    'contextChange',
    'resolutionChange',
    'resetState',
    'renderEnd',
    'renderStart',
    'render',
    'update',
    'postrender',
    'prerender'
] as const;

type DefaultRunners = typeof defaultRunners[number];
type Runners = {[key in DefaultRunners]: SystemRunner} & {
    [K: ({} & string) | ({} & symbol)]: SystemRunner;
};

/* eslint-disable max-len */
/**
 * The base class for a PixiJS Renderer. It contains the shared logic for all renderers.
 *
 * You should not use this class directly, but instead use {@linkrendering.WebGLRenderer}
 * or {@link rendering.WebGPURenderer}.
 * Alternatively, you can also use {@link rendering.autoDetectRenderer} if you want us to
 * determine the best renderer for you.
 *
 * The renderer is composed of systems that manage specific tasks. The following systems are added by default
 * whenever you create a renderer:
 *
 *
 * | Generic Systems                      | Systems that manage functionality that all renderer types share               |
 * | ------------------------------------ | ----------------------------------------------------------------------------- |
 * | {@link rendering.ViewSystem}              | This manages the main view of the renderer usually a Canvas              |
 * | {@link rendering.BackgroundSystem}        | This manages the main views background color and alpha                   |
 * | {@link events.EventSystem}           | This manages UI events.                                                       |
 * | {@link accessibility.AccessibilitySystem} | This manages accessibility features. Requires `import 'pixi.js/accessibility'`|
 *
 * | Core Systems                   | Provide an optimised, easy to use API to work with WebGL/WebGPU               |
 * | ------------------------------------ | ----------------------------------------------------------------------------- |
 * | {@link rendering.RenderGroupSystem} | This manages the what what we are rendering to (eg - canvas or texture)   |
 * | {@link rendering.GlobalUniformSystem} | This manages shaders, programs that run on the GPU to calculate 'em pixels.   |
 * | {@link rendering.TextureGCSystem}     | This will automatically remove textures from the GPU if they are not used.    |
 *
 * | PixiJS High-Level Systems            | Set of specific systems designed to work with PixiJS objects                  |
 * | ------------------------------------ | ----------------------------------------------------------------------------- |
 * | {@link rendering.HelloSystem}               | Says hello, buy printing out the pixi version into the console log (along with the renderer type)       |
 * | {@link rendering.GenerateTextureSystem} | This adds the ability to generate textures from any Container       |
 * | {@link rendering.FilterSystem}          | This manages the filtering pipeline for post-processing effects.             |
 * | {@link rendering.PrepareSystem}               | This manages uploading assets to the GPU. Requires `import 'pixi.js/prepare'`|
 * | {@link rendering.ExtractSystem}               | This extracts image data from display objects.                               |
 *
 * The breadth of the API surface provided by the renderer is contained within these systems.
 * @abstract
 * @memberof rendering
 * @property {rendering.HelloSystem} hello - HelloSystem instance.
 * @property {rendering.RenderGroupSystem} renderGroup - RenderGroupSystem instance.
 * @property {rendering.TextureGCSystem} textureGC - TextureGCSystem instance.
 * @property {rendering.FilterSystem} filter - FilterSystem instance.
 * @property {rendering.GlobalUniformSystem} globalUniforms - GlobalUniformSystem instance.
 * @property {rendering.TextureSystem} texture - TextureSystem instance.
 * @property {rendering.EventSystem} events - EventSystem instance.
 * @property {rendering.ExtractSystem} extract - ExtractSystem instance. Requires `import 'pixi.js/extract'`.
 * @property {rendering.PrepareSystem} prepare - PrepareSystem instance. Requires `import 'pixi.js/prepare'`.
 * @property {rendering.AccessibilitySystem} accessibility - AccessibilitySystem instance. Requires `import 'pixi.js/accessibility'`.
 */
/* eslint-enable max-len */
export class AbstractRenderer<
    PIPES, OPTIONS extends SharedRendererOptions, CANVAS extends ICanvas = HTMLCanvasElement
> extends EventEmitter<{resize: [screenWidth: number, screenHeight: number, resolution: number]}>
{
    /** The default options for the renderer. */
    public static defaultOptions = {
        /**
         * Default resolution / device pixel ratio of the renderer.
         * @default 1
         */
        resolution: 1,
        /**
         * Should the `failIfMajorPerformanceCaveat` flag be enabled as a context option used in the `isWebGLSupported`
         * function. If set to true, a WebGL renderer can fail to be created if the browser thinks there could be
         * performance issues when using WebGL.
         *
         * In PixiJS v6 this has changed from true to false by default, to allow WebGL to work in as many
         * scenarios as possible. However, some users may have a poor experience, for example, if a user has a gpu or
         * driver version blacklisted by the
         * browser.
         *
         * If your application requires high performance rendering, you may wish to set this to false.
         * We recommend one of two options if you decide to set this flag to false:
         *
         * 1: Use the Canvas renderer as a fallback in case high performance WebGL is
         *    not supported.
         *
         * 2: Call `isWebGLSupported` (which if found in the utils package) in your code before attempting to create a
         *    PixiJS renderer, and show an error message to the user if the function returns false, explaining that their
         *    device & browser combination does not support high performance WebGL.
         *    This is a much better strategy than trying to create a PixiJS renderer and finding it then fails.
         * @default false
         */
        failIfMajorPerformanceCaveat: false,
        /**
         * Should round pixels be forced when rendering?
         * @default false
         */
        roundPixels: false
    };

    public readonly type: number;
    /** The name of the renderer. */
    public readonly name: string;

    public _roundPixels: 0 | 1;

    public readonly runners: Runners = Object.create(null) as Runners;
    public readonly renderPipes = Object.create(null) as PIPES;
    /** The view system manages the main canvas that is attached to the DOM */
    public view!: ViewSystem;
    /** The background system manages the background color and alpha of the main view. */
    public background: BackgroundSystem;
    /** System that manages the generation of textures from the renderer */
    public textureGenerator: GenerateTextureSystem;

    protected _initOptions: OPTIONS = {} as OPTIONS;
    protected config: RendererConfig;

    private _systemsHash: Record<string, System> = Object.create(null);
    private _lastObjectRendered: Container;

    /**
     * Set up a system with a collection of SystemClasses and runners.
     * Systems are attached dynamically to this class when added.
     * @param config - the config for the system manager
     */
    constructor(config: RendererConfig)
    {
        super();
        this.type = config.type;
        this.name = config.name;
        this.config = config;

        const combinedRunners = [...defaultRunners, ...(this.config.runners ?? [])];

        this._addRunners(...combinedRunners);
        // Validation check that this environment support `new Function`
        this._unsafeEvalCheck();
    }

    /**
     * Initialize the renderer.
     * @param options - The options to use to create the renderer.
     */
    public async init(options: Partial<OPTIONS> = {})
    {
        const skip = options.skipExtensionImports === true ? true : options.manageImports === false;

        await loadEnvironmentExtensions(skip);

        this._addSystems(this.config.systems);
        this._addPipes(this.config.renderPipes, this.config.renderPipeAdaptors);

        // loop through all systems...
        for (const systemName in this._systemsHash)
        {
            const system = this._systemsHash[systemName];

            const defaultSystemOptions = (system.constructor as any).defaultOptions;

            options = { ...defaultSystemOptions, ...options };
        }

        options = { ...AbstractRenderer.defaultOptions, ...options };
        this._roundPixels = options.roundPixels ? 1 : 0;

        // await emits..
        for (let i = 0; i < this.runners.init.items.length; i++)
        {
            await this.runners.init.items[i].init(options);
        }

        // store options
        this._initOptions = options as OPTIONS;
    }

    /**
     * Renders the object to its view.
     * @param options - The options to render with.
     * @param options.container - The container to render.
     * @param [options.target] - The target to render to.
     */
    public render(options: RenderOptions | Container): void;
    /** @deprecated since 8.0.0 */
    public render(container: Container, options: {renderTexture: any}): void;
    public render(args: RenderOptions | Container, deprecated?: {renderTexture: any}): void
    {
        let options = args;

        if (options instanceof Container)
        {
            options = { container: options };

            if (deprecated)
            {
                // #if _DEBUG
                deprecation(v8_0_0, 'passing a second argument is deprecated, please use render options instead');
                // #endif

                options.target = deprecated.renderTexture;
            }
        }

        options.target ||= this.view.renderTarget;

        // TODO: we should eventually fix events so that it can handle multiple canvas elements
        if (options.target === this.view.renderTarget)
        {
            // TODO get rid of this
            this._lastObjectRendered = options.container;

            options.clearColor ??= this.background.colorRgba;
            options.clear ??= this.background.clearBeforeRender;
        }

        if (options.clearColor)
        {
            const isRGBAArray = Array.isArray(options.clearColor) && options.clearColor.length === 4;

            options.clearColor = isRGBAArray ? options.clearColor : Color.shared.setValue(options.clearColor).toArray();
        }

        if (!options.transform)
        {
            options.container.updateLocalTransform();
            options.transform = options.container.localTransform;
        }

        // lets ensure this object is a render group so we can render it!
        // the renderer only likes to render - render groups.
        options.container.enableRenderGroup();

        this.runners.prerender.emit(options);
        this.runners.renderStart.emit(options);
        this.runners.render.emit(options);
        this.runners.renderEnd.emit(options);
        this.runners.postrender.emit(options);
    }

    /**
     * Resizes the WebGL view to the specified width and height.
     * @param desiredScreenWidth - The desired width of the screen.
     * @param desiredScreenHeight - The desired height of the screen.
     * @param resolution - The resolution / device pixel ratio of the renderer.
     */
    public resize(desiredScreenWidth: number, desiredScreenHeight: number, resolution?: number): void
    {
        const previousResolution = this.view.resolution;

        this.view.resize(desiredScreenWidth, desiredScreenHeight, resolution);
        this.emit('resize', this.view.screen.width, this.view.screen.height, this.view.resolution);
        if (resolution !== undefined && resolution !== previousResolution)
        {
            this.runners.resolutionChange.emit(resolution);
        }
    }

    public clear(options: ClearOptions = {}): void
    {
        // override!
        const renderer = this as unknown as Renderer;

        options.target ||= renderer.renderTarget.renderTarget;
        options.clearColor ||= this.background.colorRgba;
        options.clear ??= CLEAR.ALL;

        const { clear, clearColor, target } = options;

        Color.shared.setValue(clearColor ?? this.background.colorRgba);

        renderer.renderTarget.clear(target, clear, Color.shared.toArray() as RgbaArray);
    }

    /** The resolution / device pixel ratio of the renderer. */
    get resolution(): number
    {
        return this.view.resolution;
    }

    set resolution(value: number)
    {
        this.view.resolution = value;
        this.runners.resolutionChange.emit(value);
    }

    /**
     * Same as view.width, actual number of pixels in the canvas by horizontal.
     * @member {number}
     * @readonly
     * @default 800
     */
    get width(): number
    {
        return this.view.texture.frame.width;
    }

    /**
     * Same as view.height, actual number of pixels in the canvas by vertical.
     * @default 600
     */
    get height(): number
    {
        return this.view.texture.frame.height;
    }

    // NOTE: this was `view` in v7
    /**
     * The canvas element that everything is drawn to.
     * @type {environment.ICanvas}
     */
    get canvas(): CANVAS
    {
        return this.view.canvas as CANVAS;
    }

    /**
     * the last object rendered by the renderer. Useful for other plugins like interaction managers
     * @readonly
     */
    get lastObjectRendered(): Container
    {
        return this._lastObjectRendered;
    }

    /**
     * Flag if we are rendering to the screen vs renderTexture
     * @readonly
     * @default true
     */
    get renderingToScreen(): boolean
    {
        const renderer = this as unknown as Renderer;

        return renderer.renderTarget.renderingToScreen;
    }

    /**
     * Measurements of the screen. (0, 0, screenWidth, screenHeight).
     *
     * Its safe to use as filterArea or hitArea for the whole stage.
     */
    get screen(): Rectangle
    {
        return this.view.screen;
    }

    /**
     * Create a bunch of runners based of a collection of ids
     * @param runnerIds - the runner ids to add
     */
    private _addRunners(...runnerIds: string[]): void
    {
        runnerIds.forEach((runnerId) =>
        {
            this.runners[runnerId] = new SystemRunner(runnerId);
        });
    }

    private _addSystems(systems: RendererConfig['systems']): void
    {
        let i: keyof typeof systems;

        for (i in systems)
        {
            const val = systems[i];

            this._addSystem(val.value, val.name);
        }
    }

    /**
     * Add a new system to the renderer.
     * @param ClassRef - Class reference
     * @param name - Property name for system, if not specified
     *        will use a static `name` property on the class itself. This
     *        name will be assigned as s property on the Renderer so make
     *        sure it doesn't collide with properties on Renderer.
     * @returns Return instance of renderer
     */
    private _addSystem(ClassRef: SystemConstructor, name: string): this
    {
        const system = new ClassRef(this as unknown as Renderer);

        if ((this as any)[name])
        {
            throw new Error(`Whoops! The name "${name}" is already in use`);
        }

        (this as any)[name] = system;

        this._systemsHash[name] = system;

        for (const i in this.runners)
        {
            this.runners[i].add(system);
        }

        return this;
    }

    private _addPipes(pipes: RendererConfig['renderPipes'], pipeAdaptors: RendererConfig['renderPipeAdaptors']): void
    {
        const adaptors = pipeAdaptors.reduce((acc, adaptor) =>
        {
            acc[adaptor.name] = adaptor.value;

            return acc;
        }, {} as Record<string, any>);

        pipes.forEach((pipe) =>
        {
            const PipeClass = pipe.value;
            const name = pipe.name;

            const Adaptor = adaptors[name];

            // sorry typescript..
            (this.renderPipes as any)[name] = new PipeClass(
                this as unknown as Renderer,
                Adaptor ? new Adaptor() : null
            );
        });
    }

    public destroy(options: RendererDestroyOptions = false): void
    {
        this.runners.destroy.items.reverse();
        this.runners.destroy.emit(options);

        // destroy all runners
        Object.values(this.runners).forEach((runner) =>
        {
            runner.destroy();
        });

        this._systemsHash = null;

        // destroy all pipes
        (this.renderPipes as null) = null;
    }

    /**
     * Generate a texture from a container.
     * @param options - options or container target to use when generating the texture
     * @returns a texture
     */
    public generateTexture(options: GenerateTextureOptions | Container): Texture
    {
        return this.textureGenerator.generateTexture(options);
    }

    /**
     * Whether the renderer will round coordinates to whole pixels when rendering.
     * Can be overridden on a per scene item basis.
     */
    get roundPixels(): boolean
    {
        return !!this._roundPixels;
    }

    /**
     * Overridable function by `pixi.js/unsafe-eval` to silence
     * throwing an error if platform doesn't support unsafe-evals.
     * @private
     * @ignore
     */
    public _unsafeEvalCheck(): void
    {
        if (!unsafeEvalSupported())
        {
            throw new Error('Current environment does not allow unsafe-eval, '
               + 'please use pixi.js/unsafe-eval module to enable support.');
        }
    }
    /**
     * Resets the rendering state of the renderer.
     * This is useful when you want to use the WebGL context directly and need to ensure PixiJS's internal state
     * stays synchronized. When modifying the WebGL context state externally, calling this method before the next Pixi
     * render will reset all internal caches and ensure it executes correctly.
     *
     * This is particularly useful when combining PixiJS with other rendering engines like Three.js:
     * ```js
     * // Reset Three.js state
     * threeRenderer.resetState();
     *
     * // Render a Three.js scene
     * threeRenderer.render(threeScene, threeCamera);
     *
     * // Reset PixiJS state since Three.js modified the WebGL context
     * pixiRenderer.resetState();
     *
     * // Now render Pixi content
     * pixiRenderer.render(pixiScene);
     * ```
     */
    public resetState(): void
    {
        this.runners.resetState.emit();
    }
}
