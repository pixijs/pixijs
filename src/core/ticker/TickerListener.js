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
     * @param {Function} [context=null] - The listener context
     * @param {number} [priority=0] - The priority for emitting
     * @param {boolean} [once=false] - If the handler should fire once
     */
    constructor(fn, context = null, priority = 0, once = false)
    {
        /**
         * The handler function to execute.
         * @member {Function}
         */
        this.fn = fn;

        /**
         * The calling to execute.
         * @member {Function}
         */
        this.context = context;

        /**
         * The current priority.
         * @member {number}
         */
        this.priority = priority;

        /**
         * If this should only execute once.
         * @member {boolean}
         */
        this.once = once;

        /**
         * The next item in chain.
         * @member {TickerListener}
         */
        this.next = null;

        /**
         * The previous item in chain.
         * @member {TickerListener}
         */
        this.previous = null;

        /**
         * Marked for cleanup.
         * @member {boolean}
         */
        this.destroyed = false;
    }

    /**
     * Simple compare function to figure out if a function and context match.
     *
     * @param {Function} fn - The listener function to be added for one update
     * @param {Function} context - The listener context
     * @return {boolean} `true` if the listener match the arguments
     */
    match(fn, context)
    {
        context = context || null;

        return this.fn === fn && this.context === context;
    }

    /**
     * Emit by calling the current function.
     * @param {number} deltaTime - time since the last emit.
     */
    emit(deltaTime)
    {
        if (this.destroyed)
        {
            return;
        }

        if (this.context)
        {
            this.fn.call(this.context, deltaTime);
        }
        else
        {
            this.fn(deltaTime);
        }

        if (this.once)
        {
            this.destroy();
        }
    }

    /**
     * Connect to the list.
     * @param {TickerListener} previous - Input node, previous listener
     */
    connect(previous)
    {
        this.previous = previous;
        if (previous.next)
        {
            previous.next.previous = this;
        }
        this.next = previous.next;
        previous.next = this;
    }

    /**
     * Remove itself the chain of listeners.
     */
    disconnect()
    {
        this.previous.next = this.next;

        if (this.next)
        {
            this.next.previous = this.previous;
        }
    }

    /**
     * Destroy and don't use after this.
     */
    destroy()
    {
        if (this.destroyed)
        {
            return;
        }
        this.destroyed = true;
        this.disconnect();
        this.fn = null;
        this.context = null;
        this.previous = null;
        this.next = null;
    }
}
