import { deprecation, v8_0_0 } from '../../../../utils/logging/deprecation';
import { Container } from '../../../scene/Container';
import { SystemRunner } from './SystemRunner';

import type { Rectangle } from '../../../../maths/shapes/Rectangle';
import type { ICanvas } from '../../../../settings/adapter/ICanvas';
import type { Writeable } from '../../../../utils/types';
import type { RenderSurface } from '../../gpu/renderTarget/GpuRenderTargetSystem';
import type { Renderer } from '../../types';
import type { PipeConstructor } from '../instructions/RenderPipe';
import type { ViewSystem } from '../ViewSystem';
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
    target?: RenderSurface;
}

const defaultRunners = [
    'init',
    'destroy',
    'contextChange',
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
export class AbstractRenderer<PIPES, OPTIONS>
{
    public readonly type: number;
    public readonly name: string;

    public readonly runners: Runners = {} as Runners;
    public readonly renderPipes = {} as PIPES;
    public view: ViewSystem;

    private _systemsHash: Record<string, System> = {};
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

        // await emits..
        for (let i = 0; i < this.runners.init.items.length; i++)
        {
            await this.runners.init.items[i].init(options);
        }
    }

    /**
     * Renders the object to its view.
     * @param options - The options to render with.
     * @param options.container - The container to render.
     * @param [options.target] - The target to render to.
     */
    public render(options: RenderOptions | Container): void
    {
        if (options instanceof Container)
        {
            options = { container: options };

            // eslint-disable-next-line prefer-rest-params
            if (arguments[1])
            {
                // eslint-disable-next-line max-len
                deprecation(v8_0_0, 'passing target as a second argument is deprecated, please use render options instead');

                // eslint-disable-next-line prefer-rest-params
                options.target = arguments[1];
            }
        }

        options.target ||= this.view.texture;

        // TODO get rid of this
        this._lastObjectRendered = options.container;

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
    }

    /**
     * Same as view.width, actual number of pixels in the canvas by horizontal.
     * @member {number}
     * @readonly
     * @default 800
     */
    get width(): number
    {
        return this.view.texture.frameWidth;
    }

    /**
     * Same as view.height, actual number of pixels in the canvas by vertical.
     * @default 600
     */
    get height(): number
    {
        return this.view.texture.frameHeight;
    }

    // NOTE: this was `view` in v7
    /** The canvas element that everything is drawn to.*/
    get element(): ICanvas
    {
        return this.view.element;
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
     * @member {PIXI.Rectangle}
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

    /** destroy the all runners and systems. Its apps job to */
    public destroy(): void
    {
        Object.values(this.runners).forEach((runner) =>
        {
            runner.destroy();
        });

        this._systemsHash = null;

        const writeable = this as Writeable<typeof this, 'renderPipes' | 'runners'>;

        writeable.renderPipes = null;
        writeable.runners = null;
    }
}
