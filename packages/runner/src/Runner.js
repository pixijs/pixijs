/**
 * A Runner is a highly performant and simple alternative to signals. Best used in situations
 * where events are dispatched to many objects at high frequency (say every frame!)
 *
 *
 * like a signal..
 * ```
 * const myObject = {
 *     loaded: new PIXI.Runner('loaded')
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
 * const myGame = {
 *     update: new PIXI.Runner('update')
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
    /**
     *  @param {string} name the function name that will be executed on the listeners added to this Runner.
     */
    constructor(name)
    {
        this.items = [];
        this._name = name;
    }

    /**
     * Dispatch/Broadcast Runner to all listeners added to the queue.
     * @param {...any} params - optional parameters to pass to each listener
     */
    emit(a0, a1, a2, a3, a4, a5, a6, a7)
    {
        if (arguments.length > 8)
        {
            throw new Error('max arguments reached');
        }

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
     * const complete = new PIXI.Runner('complete');
     * ```
     *
     * The scope used will be the object itself.
     *
     * @param {any} item - The object that will be listening.
     */
    add(item)
    {
        if (item[this._name])
        {
            this.remove(item);
            this.items.push(item);
        }

        return this;
    }

    /**
     * Remove a single listener from the dispatch queue.
     * @param {any} item - The listenr that you would like to remove.
     */
    remove(item)
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
    contains(item)
    {
        return this.items.indexOf(item) !== -1;
    }

    /**
     * Remove all listeners from the Runner
     */
    removeAll()
    {
        this.items.length = 0;

        return this;
    }

    /**
     * Remove all references, don't use after this.
     */
    destroy()
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
    get empty()
    {
        return this.items.length === 0;
    }

    /**
     * The name of the runner.
     *
     * @member {string}
     * @readonly
     */
    get name()
    {
        return this._name;
    }
}

/**
 * Alias for `emit`
 * @memberof PIXI.Runner#
 * @method dispatch
 * @see PIXI.Runner#emit
 */
Runner.prototype.dispatch = Runner.prototype.emit;

/**
 * Alias for `emit`
 * @memberof PIXI.Runner#
 * @method run
 * @see PIXI.Runner#emit
 */
Runner.prototype.run = Runner.prototype.emit;
