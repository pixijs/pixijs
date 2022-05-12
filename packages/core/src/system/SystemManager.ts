import { Runner } from '@pixi/runner';
import { EventEmitter } from '@pixi/utils';
import { IRenderer } from '../IRenderer';
import { ISystem, ISystemConstructor } from './ISystem';
interface ISystemConfig<R> {
    runners: string[],
    systems: Record<string, ISystemConstructor<R>>
}

/**
 * The SystemManager is a class that provides functions for managing a set of systems
 * This is a base class, that is generic (no render code or knowledge at all)
 *
 * @memberof PIXI
 */
export class SystemManager<R=IRenderer> extends EventEmitter
{
    /** a collection of runners defined by the user */
    readonly runners: {[key: string]: Runner} = {};

    private _systemsHash: Record<string, ISystem> = {};

    /**
     * Set up a system with a collection of SystemClasses and runners.
     * Systems are attached dynamically to this class when added.
     *
     * @param config - the config for the system manager
     */
    setup(config: ISystemConfig<R>): void
    {
        this.addRunners(...config.runners);

        let i: keyof typeof config.systems;

        for (i in config.systems)
        {
            // @zyie not sure about the TS here..
            this.addSystem(config.systems[i], i);
        }
    }

    /**
     * Create a bunch of runners based of a collection of ids
     * @param runnerIds - the runner ids to add
     */
    addRunners(...runnerIds: string[]): void
    {
        runnerIds.forEach((runnerId) =>
        {
            this.runners[runnerId] = new Runner(runnerId);
        });
    }

    /**
     * Add a new system to the renderer.
     *
     * @param ClassRef - Class reference
     * @param name - Property name for system, if not specified
     *        will use a static `name` property on the class itself. This
     *        name will be assigned as s property on the Renderer so make
     *        sure it doesn't collide with properties on Renderer.
     * @return Return instance of renderer
     */
    addSystem(ClassRef: ISystemConstructor<R>, name: string): this
    {
        const system = new ClassRef(this as any as R);

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
     * A function that will run a runner and call the runners function but pass in different options
     * to each system based on there name.
     *
     * eg if you have two systems added called `systemA` and `systemB` you could call do the following:
     *
     * ```
     * system.emitWithCustomOptions(init, {
     *   systemA: {...optionsForA},
     *   systemB: {...optionsForB}
     * })
     *
     * init would be called on system A passing options.A and init would be called on system B passing options.B
     * ```
     *
     * @param runner - the runner to target
     * @param options - key value options for each system
     */
    emitWithCustomOptions(runner: Runner, options: Record<string, unknown>): void
    {
        const systemHashKeys = Object.keys(this._systemsHash);

        runner.items.forEach((system) =>
        {
            // I know this does not need to be a performant function so it.. isn't!
            // its only used for init and destroy.. we can refactor if required..
            const systemName = systemHashKeys.find((systemId) => this._systemsHash[systemId] === system);

            system[runner.name](options[systemName]);
        });
    }

    /** destroy the all runners and systems. Its apps job to */
    destroy(): void
    {
        Object.values(this.runners).forEach((runner) =>
        {
            runner.destroy();
        });

        this._systemsHash = {};
    }

    // TODO implement!
    // removeSystem(ClassRef: ISystemConstructor, name: string): void
    // {

    // }
}
