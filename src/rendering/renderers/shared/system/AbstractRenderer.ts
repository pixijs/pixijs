import { deprecation } from '../../../../utils/logging/deprecation';
import { Container } from '../../../scene/Container';
import { SystemRunner } from './SystemRunner';

import type { ICanvas } from '../../../../settings/adapter/ICanvas';
import type { RenderSurface } from '../../gpu/renderTarget/GpuRenderTargetSystem';
import type { Renderer } from '../../types';
import type { PipeConstructor } from '../instructions/RenderPipe';
import type { ViewSystem } from '../ViewSystem';
import type { ISystem, SystemConstructor } from './System';

interface RendererConfig
{
    type: string;
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
];

/**
 * The SystemManager is a class that provides functions for managing a set of systems
 * This is a base class, that is generic (no render code or knowledge at all)
 */
export class AbstractRenderer<RENDER_PIPES, RENDERER_OPTIONS>
{
    /** a collection of runners defined by the user */

    readonly type: string;

    runners: {[key: string]: SystemRunner} = {};
    renderPipes = {} as RENDER_PIPES;
    view: ViewSystem;

    private _systemsHash: Record<string, ISystem> = {};
    private _lastObjectRendered: Container;

    /**
     * Set up a system with a collection of SystemClasses and runners.
     * Systems are attached dynamically to this class when added.
     * @param config - the config for the system manager
     */
    constructor(config: RendererConfig)
    {
        this.type = config.type;

        const combinedRunners = [...defaultRunners, ...(config.runners ?? [])];

        this.addRunners(...combinedRunners);

        this.addSystems(config.systems);

        this.addPipes(config.renderPipes, config.renderPipeAdaptors);
    }

    async init(options: Partial<RENDERER_OPTIONS> = {})
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

    render(options: RenderOptions): void
    {
        if (options instanceof Container)
        {
            deprecation('8', 'passing Container as argument is deprecated, please use render options instead');

            // eslint-disable-next-line prefer-rest-params
            options = { container: options, target: arguments[1] };
        }

        options.target = options.target || this.view.texture;

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
     * @param resolution
     */
    resize(desiredScreenWidth: number, desiredScreenHeight: number, resolution?: number): void
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

    get width(): number
    {
        return this.view.texture.frameWidth;
    }

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
        return true; // TODO: this._renderingToScreen;
    }

    /**
     * Create a bunch of runners based of a collection of ids
     * @param runnerIds - the runner ids to add
     */
    addRunners(...runnerIds: string[]): void
    {
        runnerIds.forEach((runnerId) =>
        {
            this.runners[runnerId] = new SystemRunner(runnerId);
        });
    }

    addSystems(systems: RendererConfig['systems']): void
    {
        let i: keyof typeof systems;

        for (i in systems)
        {
            const val = systems[i];

            this.addSystem(val.value, val.name);
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
    addSystem(ClassRef: SystemConstructor, name: string): this
    {
        const system = new ClassRef(this as any as Renderer);

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

    addPipes(pipes: RendererConfig['renderPipes'], pipeAdaptors: RendererConfig['renderPipeAdaptors']): void
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
                this as any as Renderer,
                Adaptor ? new Adaptor() : null
            );
        });
    }

    /** destroy the all runners and systems. Its apps job to */
    destroy(): void
    {
        Object.values(this.runners).forEach((runner) =>
        {
            runner.destroy();
        });

        this._systemsHash = null;
        this.renderPipes = null;
        this.runners = null;
    }
}
