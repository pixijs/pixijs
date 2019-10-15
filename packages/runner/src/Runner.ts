/**
 * A Runner is a highly performant and simple alternative to signals. Best used in situations
 * where events are dispatched to many objects at high frequency (say every frame!)
 *
 *
 * like a signal..
 * ```
 * import { Runner } from '@pixi/runner';
 *
 * const myObject = {
 *     loaded: new Runner('loaded')
 * }
 *
 * const listener = {
 *     loaded: function(){
 *         // thin
 *     }
 * }
 *
 * myObject.update.add(listener);
 *
 * myObject.loaded.emit();
 * ```
 *
 * Or for handling calling the same function on many items
 * ```
 * import { Runner } from '@pixi/runner';
 *
 * const myGame = {
 *     update: new Runner('update')
 * }
 *
 * const gameObject = {
 *     update: function(time){
 *         // update my gamey state
 *     }
 * }
 *
 * myGame.update.add(gameObject1);
 *
 * myGame.update.emit(time);
 * ```
 * @class
 * @memberof PIXI
 */
export class Runner
{
    public items: any[];
    private _name: string;
    private _aliasCount: number;

    /**
     *  @param {string} name the function name that will be executed on the listeners added to this Runner.
     */
    constructor(name: string)
    {
        this.items = [];
        this._name = name;
        this._aliasCount = 0;
    }

    /**
     * Dispatch/Broadcast Runner to all listeners added to the queue.
     * @param {...any} params - optional parameters to pass to each listener
     * @return {PIXI.Runner}
     */
    public emit(a0?: any, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any, a7?: any): this
    {
        if (arguments.length > 8)
        {
            throw new Error('max arguments reached');
        }

        const { name, items } = this;

        this._aliasCount++;

        for (let i = 0, len = items.length; i < len; i++)
        {
            items[i][name](a0, a1, a2, a3, a4, a5, a6, a7);
        }

        if (items === this.items)
        {
            this._aliasCount--;
        }

        return this;
    }

    private ensureNonAliasedItems(): void
    {
        if (this._aliasCount > 0 && this.items.length > 1)
        {
            this._aliasCount = 0;
            this.items = this.items.slice(0);
        }
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
     * import { Runner } from '@pixi/runner';
     *
     * const complete = new Runner('complete');
     * ```
     *
     * The scope used will be the object itself.
     *
     * @param {any} item - The object that will be listening.
     * @return {PIXI.Runner}
     */
    public add(item: any): this
    {
        if (item[this._name])
        {
            this.ensureNonAliasedItems();
            this.remove(item);
            this.items.push(item);
        }

        return this;
    }

    /**
     * Remove a single listener from the dispatch queue.
     * @param {any} item - The listenr that you would like to remove.
     * @return {PIXI.Runner}
     */
    public remove(item: any): this
    {
        const index = this.items.indexOf(item);

        if (index !== -1)
        {
            this.ensureNonAliasedItems();
            this.items.splice(index, 1);
        }

        return this;
    }

    /**
     * Check to see if the listener is already in the Runner
     * @param {any} item - The listener that you would like to check.
     */
    public contains(item: any): boolean
    {
        return this.items.indexOf(item) !== -1;
    }

    /**
     * Remove all listeners from the Runner
     * @return {PIXI.Runner}
     */
    public removeAll(): this
    {
        this.ensureNonAliasedItems();
        this.items.length = 0;

        return this;
    }

    /**
     * Remove all references, don't use after this.
     */
    public destroy(): void
    {
        this.removeAll();
        this.items = null;
        this._name = null;
    }

    /**
     * `true` if there are no this Runner contains no listeners
     *
     * @member {boolean}
     * @readonly
     */
    public get empty(): boolean
    {
        return this.items.length === 0;
    }

    /**
     * The name of the runner.
     *
     * @member {string}
     * @readonly
     */
    public get name(): string
    {
        return this._name;
    }
}

Object.defineProperties(Runner.prototype, {
    /**
     * Alias for `emit`
     * @memberof PIXI.Runner#
     * @method dispatch
     * @see PIXI.Runner#emit
     */
    dispatch: { value: Runner.prototype.emit },
    /**
     * Alias for `emit`
     * @memberof PIXI.Runner#
     * @method run
     * @see PIXI.Runner#emit
     */
    run: { value: Runner.prototype.emit },
});
