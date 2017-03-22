/**
 * Internal class for handling the priority sorting of ticker handlers.
 *
 * @private
 * @class
 * @memberof PIXI.ticker
 */
export default class TickerListener
{
    /**
     * Constructor
     *
     * @param {Function} fn - The listener function to be added for one update
     * @param {Function} context - The listener context
     * @param {number} priority - The priority for emitting
     * @param {boolean} once - If the handler should fire once
     */
    constructor(fn, context, priority, once)
    {
        this.fn = fn;
        this.context = context || null;
        this.priority = priority;
        this.once = once;
    }

    /**
     * Simple compare function to figure out if a function and context match.
     *
     * @param {Function} fn - The listener function to be added for one update
     * @param {Function} context - The listener context
     * @return {boolean} `true` if the listener match the arguments
     */
    compare(fn, context)
    {
        context = context || null;

        return this.fn === fn && this.context === context;
    }

    /**
     * Destroy and don't use after this.
     */
    destroy()
    {
        this.fn = null;
        this.context = null;
    }
}
