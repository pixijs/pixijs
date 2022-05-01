import { Runner } from '@pixi/runner';
import { EventEmitter } from '@pixi/utils';
import { ISystemConstructor } from './ISystem';

export abstract class BaseRenderer extends EventEmitter
{
    readonly runners: {[key: string]: Runner} = {};

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
    addSystem(ClassRef: ISystemConstructor, name: string): this
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

    // removeSystem(ClassRef: ISystemConstructor, name: string): void
    // {

    // }
}
