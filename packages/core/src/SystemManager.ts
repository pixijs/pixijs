import { Runner } from '@pixi/runner';
import { EventEmitter } from '@pixi/utils';
import { IRenderer } from './IRenderer';
import { ISystem, ISystemConstructor } from './ISystem';
interface ISystemConfig {
    runners: string[],
    systems: Record<string, ISystemConstructor>
}

export class SystemManager<R=IRenderer> extends EventEmitter
{
    readonly runners: {[key: string]: Runner} = {};

    private _systemsHash: Record<string, ISystem> = {};

    setup(config: ISystemConfig): void
    {
        this.addRunners(...config.runners);

        let i: keyof typeof config.systems;

        for (i in config.systems)
        {
            // @zyie not sure about the TS here..
            this.addSystem(config.systems[i], i);
        }
    }

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
