import type { Ticker, TickerCallback } from './Ticker';

/**
 * Internal class for handling the priority sorting of ticker handlers.
 * @private
 * @class
 */
export class TickerListener<T = any>
{
    /** The current priority. */
    public priority: number;
    /** The next item in chain. */
    public next: TickerListener = null;
    /** The previous item in chain. */
    public previous: TickerListener = null;

    /** The handler function to execute. */
    private _fn: TickerCallback<T>;
    /** The calling to execute. */
    private _context: T;
    /** If this should only execute once. */
    private readonly _once: boolean;
    /** `true` if this listener has been destroyed already. */
    private _destroyed = false;

    /**
     * Constructor
     * @private
     * @param fn - The listener function to be added for one update
     * @param context - The listener context
     * @param priority - The priority for emitting
     * @param once - If the handler should fire once
     */
    constructor(fn: TickerCallback<T>, context: T = null, priority = 0, once = false)
    {
        this._fn = fn;
        this._context = context;
        this.priority = priority;
        this._once = once;
    }

    /**
     * Simple compare function to figure out if a function and context match.
     * @param fn - The listener function to be added for one update
     * @param context - The listener context
     * @returns `true` if the listener match the arguments
     */
    public match(fn: TickerCallback<T>, context: any = null): boolean
    {
        return this._fn === fn && this._context === context;
    }

    /**
     * Emit by calling the current function.
     * @param ticker - The ticker emitting.
     * @returns Next ticker
     */
    public emit(ticker: Ticker): TickerListener
    {
        if (this._fn)
        {
            if (this._context)
            {
                this._fn.call(this._context, ticker);
            }
            else
            {
                (this as TickerListener<any>)._fn(ticker);
            }
        }

        const redirect = this.next;

        if (this._once)
        {
            this.destroy(true);
        }

        // Soft-destroying should remove
        // the next reference
        if (this._destroyed)
        {
            this.next = null;
        }

        return redirect;
    }

    /**
     * Connect to the list.
     * @param previous - Input node, previous listener
     */
    public connect(previous: TickerListener): void
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
     * Destroy and don't use after this.
     * @param hard - `true` to remove the `next` reference, this
     *        is considered a hard destroy. Soft destroy maintains the next reference.
     * @returns The listener to redirect while emitting or removing.
     */
    public destroy(hard = false): TickerListener
    {
        this._destroyed = true;
        this._fn = null;
        this._context = null;

        // Disconnect, hook up next and previous
        if (this.previous)
        {
            this.previous.next = this.next;
        }

        if (this.next)
        {
            this.next.previous = this.previous;
        }

        // Redirect to the next item
        const redirect = this.next;

        // Remove references
        this.next = hard ? null : redirect;
        this.previous = null;

        return redirect;
    }
}
