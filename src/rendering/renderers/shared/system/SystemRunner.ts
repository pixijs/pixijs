/**
 * SystemRunner is used internally by the renderers as an efficient way for systems to
 * be notified about what the renderer is up to during the rendering phase.
 *
 * ```
 * import { SystemRunner } from 'pixi.js';
 *
 * const myObject = {
 *     loaded: new SystemRunner('loaded')
 * }
 *
 * const listener = {
 *     loaded: function(){
 *         // thin
 *     }
 * }
 *
 * myObject.loaded.add(listener);
 *
 * myObject.loaded.emit();
 * ```
 *
 * Or for handling calling the same function on many items
 * ```
 * import { SystemRunner } from 'pixi.js';
 *
 * const myGame = {
 *     update: new SystemRunner('update')
 * }
 *
 * const gameObject = {
 *     update: function(time){
 *         // update my gamey state
 *     }
 * }
 *
 * myGame.update.add(gameObject);
 *
 * myGame.update.emit(time);
 * ```
 * @memberof rendering
 */
export class SystemRunner
{
    public items: any[];
    private _name: string;

    /**
     * @param name - The function name that will be executed on the listeners added to this Runner.
     */
    constructor(name: string)
    {
        this.items = [];
        this._name = name;
    }

    /* jsdoc/check-param-names */
    /**
     * Dispatch/Broadcast Runner to all listeners added to the queue.
     * @param {...any} params - (optional) parameters to pass to each listener
     */
    /* jsdoc/check-param-names */
    public emit(a0?: unknown, a1?: unknown, a2?: unknown, a3?: unknown,
        a4?: unknown, a5?: unknown, a6?: unknown, a7?: unknown): this
    {
        const { name, items } = this;

        for (let i = 0, len = items.length; i < len; i++)
        {
            items[i][name](a0, a1, a2, a3, a4, a5, a6, a7);
        }

        return this;
    }

    /**
     * Add a listener to the Runner
     *
     * Runners do not need to have scope or functions passed to them.
     * All that is required is to pass the listening object and ensure that it has contains a function that has the same name
     * as the name provided to the Runner when it was created.
     *
     * Eg A listener passed to this Runner will require a 'complete' function.
     *
     * ```
     * import { Runner } from 'pixi.js';
     *
     * const complete = new Runner('complete');
     * ```
     *
     * The scope used will be the object itself.
     * @param {any} item - The object that will be listening.
     */
    public add(item: unknown): this
    {
        if ((item as any)[this._name])
        {
            this.remove(item);
            this.items.push(item);
        }

        return this;
    }

    /**
     * Remove a single listener from the dispatch queue.
     * @param {any} item - The listener that you would like to remove.
     */
    public remove(item: unknown): this
    {
        const index = this.items.indexOf(item);

        if (index !== -1)
        {
            this.items.splice(index, 1);
        }

        return this;
    }

    /**
     * Check to see if the listener is already in the Runner
     * @param {any} item - The listener that you would like to check.
     */
    public contains(item: unknown): boolean
    {
        return this.items.indexOf(item) !== -1;
    }

    /** Remove all listeners from the Runner */
    public removeAll(): this
    {
        this.items.length = 0;

        return this;
    }

    /** Remove all references, don't use after this. */
    public destroy(): void
    {
        this.removeAll();
        this.items = null;
        this._name = null;
    }

    /**
     * `true` if there are no this Runner contains no listeners
     * @readonly
     */
    public get empty(): boolean
    {
        return this.items.length === 0;
    }

    /**
     * The name of the runner.
     * @readonly
     */
    public get name(): string
    {
        return this._name;
    }
}
