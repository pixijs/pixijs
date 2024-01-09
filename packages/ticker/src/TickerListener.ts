type AnyInstance = Record<string, any>;

export type TickerListenerContext = AnyInstance | null;

export type TickerCallback<T> = T extends null ? (dt: number) => any : (this: T, dt: number) => any;

function isAnyInstance(obj: TickerListenerContext): obj is AnyInstance
{
    return typeof obj === 'object' && obj !== null;
}

/**
 * Internal class for handling the priority sorting of ticker handlers.
 * @private
 * @class
 * @memberof PIXI
 */
export class TickerListener<T extends TickerListenerContext = TickerListenerContext>
{
    /** The next item in chain. */
    public next: TickerListener | null = null;
    /** The previous item in chain. */
    public previous: TickerListener | null = null;

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
    constructor(
        /** The handler function to execute. */
        private fn: TickerCallback<T> | null,
        /** The calling to execute. */
        private context: T | null = null,
        /** The current priority. */
        public priority = 0,
        /** If this should only execute once. */
        private once = false)
    {
    }

    /**
     * Simple compare function to figure out if a function and context match.
     * @private
     * @param fn - The listener function to be added for one update
     * @param context - The listener context
     * @returns `true` if the listener match the arguments
     */
    match(fn: TickerCallback<T>, context: any = null): boolean
    {
        return this.fn === fn && this.context === context;
    }

    /**
     * Emit by calling the current function.
     * @private
     * @param deltaTime - time since the last emit.
     * @returns Next ticker
     */
    emit(deltaTime: number): TickerListener | null
    {
        if (this.fn)
        {
            if (isAnyInstance(this.context))
            {
                this.fn.call(this.context, deltaTime);
            }
            else
            {
                this.fn(deltaTime);
            }
        }

        const redirect = this.next;

        if (this.once)
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
     * @private
     * @param previous - Input node, previous listener
     */
    connect(previous: TickerListener): void
    {
        this.previous = previous;
        if (previous.next)
        {
            previous.next.previous = this as TickerListener;
        }
        this.next = previous.next;
        previous.next = this as TickerListener;
    }

    /**
     * Destroy and don't use after this.
     * @private
     * @param hard - `true` to remove the `next` reference, this
     *        is considered a hard destroy. Soft destroy maintains the next reference.
     * @returns The listener to redirect while emitting or removing.
     */
    destroy(hard = false): TickerListener | null
    {
        this._destroyed = true;
        this.fn = null;
        this.context = null;

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
