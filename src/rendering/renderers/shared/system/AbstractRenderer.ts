import { Color, type ColorSource } from '../../../../color/Color';
import { Container } from '../../../../scene/container/Container';
import { deprecation, v8_0_0 } from '../../../../utils/logging/deprecation';
import { SystemRunner } from './SystemRunner';

import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { Matrix } from '../../../../maths/matrix/Matrix';
import type { Rectangle } from '../../../../maths/shapes/Rectangle';
import type { DestroyOptions } from '../../../../scene/container/destroyTypes';
import type { Renderer } from '../../types';
import type { GenerateTextureOptions, GenerateTextureSystem } from '../extract/GenerateTextureSystem';
import type { PipeConstructor } from '../instructions/RenderPipe';
import type { RenderSurface } from '../renderTarget/RenderTargetSystem';
import type { Texture } from '../texture/Texture';
import type { ViewSystem } from '../view/ViewSystem';
import type { System, SystemConstructor } from './System';

interface RendererConfig
{
    type: number;
    name: string;
    runners?: string[];
    systems: {name: string, value: SystemConstructor}[];
    renderPipes: {name: string, value: PipeConstructor}[];
    renderPipeAdaptors: {name: string, value: any}[];
}

export interface RenderOptions
{
    container: Container;
    transform?: Matrix;
    target?: RenderSurface;
    clearColor?: ColorSource;
    clear?: boolean;
}

const defaultRunners = [
    'init',
    'destroy',
    'contextChange',
    'resolutionChange',
    'reset',
    'renderEnd',
    'renderStart',
    'render',
    'update',
    'postrender',
    'prerender'
] as const;

type DefaultRunners = typeof defaultRunners[number];
type Runners = {[key in DefaultRunners]: SystemRunner} & {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [K: ({} & string) | ({} & symbol)]: SystemRunner;
};

/**
 * The SystemManager is a class that provides functions for managing a set of systems
 * This is a base class, that is generic (no render code or knowledge at all)
 */
export class AbstractRenderer<PIPES, OPTIONS extends PixiMixins.RendererOptions, CANVAS extends ICanvas = HTMLCanvasElement>
{
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
    public readonly name: string;

    /** @internal */
    public _roundPixels: 0 | 1;

    public readonly runners: Runners = Object.create(null) as Runners;
    public readonly renderPipes = Object.create(null) as PIPES;
    public view: ViewSystem;
    public textureGenerator: GenerateTextureSystem;

    protected _initOptions: OPTIONS = {} as OPTIONS;

    private _systemsHash: Record<string, System> = Object.create(null);
    private _lastObjectRendered: Container;

    /**
     * Set up a system with a collection of SystemClasses and runners.
     * Systems are attached dynamically to this class when added.
     * @param config - the config for the system manager
     */
    constructor(config: RendererConfig)
    {
        this.type = config.type;
        this.name = config.name;

        const combinedRunners = [...defaultRunners, ...(config.runners ?? [])];

        this._addRunners(...combinedRunners);
        this._addSystems(config.systems);
        this._addPipes(config.renderPipes, config.renderPipeAdaptors);
    }

    /**
     * Initialize the renderer.
     * @param options - The options to use to create the renderer.
     */
    public async init(options: Partial<OPTIONS> = {})
    {
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

    /** @deprecated since 8.0.0 */
    public render(container: Container, options: {renderTexture: any}): void;
    /**
     * Renders the object to its view.
     * @param options - The options to render with.
     * @param options.container - The container to render.
     * @param [options.target] - The target to render to.
     */
    public render(options: RenderOptions | Container): void;
    public render(args: RenderOptions | Container, deprecated?: {renderTexture: any}): void
    {
        let options = args;

        if (options instanceof Container)
        {
            options = { container: options };

            if (deprecated)
            {
                // eslint-disable-next-line max-len
                deprecation(v8_0_0, 'passing a second argument is deprecated, please use render options instead');

                options.target = deprecated.renderTexture;
            }
        }

        options.target ||= this.view.texture;

        // TODO: we should eventually fix events so that it can handle multiple canvas elements
        if (options.target === this.view.texture)
        {
            // TODO get rid of this
            this._lastObjectRendered = options.container;
        }

        if (options.clearColor)
        {
            const isRGBAArray = Array.isArray(options.clearColor) && options.clearColor.length === 4;

            options.clearColor = isRGBAArray ? options.clearColor : Color.shared.setValue(options.clearColor).toArray();
        }

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
        this.view.resize(desiredScreenWidth, desiredScreenHeight, resolution);
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
    /** The canvas element that everything is drawn to.*/
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
     * @member {Rectangle}
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

    public destroy(options: DestroyOptions = false): void
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
     * @deprecated since 8.0.0
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
}
