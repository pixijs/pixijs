/**
 * A Runner is a highly performant and simple alternative to signals. Best used in situations
 * where events are dispatched to many objects at high frequency (say every frame!)
 *
 * Like a signal:
 *
 * ```js
 * import { Runner } from '@pixi/runner';
 *
 * const myObject = {
 *     loaded: new Runner('loaded'),
 * };
 *
 * const listener = {
 *     loaded: function() {
 *         // Do something when loaded
 *     }
 * };
 *
 * myObject.loaded.add(listener);
 *
 * myObject.loaded.emit();
 * ```
 *
 * Or for handling calling the same function on many items:
 *
 * ```js
 * import { Runner } from '@pixi/runner';
 *
 * const myGame = {
 *     update: new Runner('update'),
 * };
 *
 * const gameObject = {
 *     update: function(time) {
 *         // Update my gamey state
 *     },
 * };
 *
 * myGame.update.add(gameObject);
 *
 * myGame.update.emit(time);
 * ```
 * @memberof PIXI
 */
export class Runner
{
    public items: any[];
    private _name: string;
    private _aliasCount: number;

    /**
     * @param name - The function name that will be executed on the listeners added to this Runner.
     */
    constructor(name: string)
    {
        this.items = [];
        this._name = name;
        this._aliasCount = 0;
    }

    /* eslint-disable jsdoc/require-param, jsdoc/check-param-names */
    /**
     * Dispatch/Broadcast Runner to all listeners added to the queue.
     * @param {...any} params - (optional) parameters to pass to each listener
     */
    /*  eslint-enable jsdoc/require-param, jsdoc/check-param-names */
    public emit(a0?: unknown, a1?: unknown, a2?: unknown, a3?: unknown,
        a4?: unknown, a5?: unknown, a6?: unknown, a7?: unknown): this
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
     * E.g. A listener passed to this Runner will require a 'complete' function.
     *
     * ```js
     * import { Runner } from '@pixi/runner';
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
            this.ensureNonAliasedItems();
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
            this.ensureNonAliasedItems();
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
        return this.items.includes(item);
    }

    /** Remove all listeners from the Runner */
    public removeAll(): this
    {
        this.ensureNonAliasedItems();
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
