type ListenerFunction = (...args: any[]) => void;

/**
 * Past this many listeners on one event, a list starts indexing its listeners by function and by
 * context, so removing one is O(1) instead of a walk.
 */
const INDEX_THRESHOLD = 16;

/**
 * One registered listener. An event with a single listener stores it directly; from the second
 * one on, listeners are nodes in a {@link ListenerList}.
 * @internal
 */
class Listener
{
    public prev: Listener | null = null;
    /** Kept when the listener is removed, so an emit standing on it can still move on */
    public next: Listener | null = null;
    public removed = false;
    /** Its place in the order listeners were added to the list; an emit stops at newer ones */
    public order = 0;

    constructor(
        public readonly fn: ListenerFunction,
        public readonly context: any,
        public readonly once: boolean,
    ) {}
}

/**
 * Lookups from function and from context to listeners, built once a list is long enough that
 * walking it to remove one would cost more.
 * @internal
 */
class ListenerIndex
{
    public readonly byFn = new Map<ListenerFunction, IndexEntry>();
    public readonly byContext = new Map<any, IndexEntry>();
}

/**
 * The listeners under one index key: the listener itself while it is the only one (contexts are
 * nearly always unique), a set from the second on.
 */
type IndexEntry = Listener | Set<Listener>;

/**
 * The listeners of an event that has had more than one, in the order they were added.
 * @internal
 */
class ListenerList
{
    /** Registered listeners */
    public count = 2;
    /** Listeners ever added, which numbers their {@link Listener#order} */
    public added = 2;
    public index: ListenerIndex | null = null;

    /**
     * A list starts when an event gets its second listener.
     * @param head - The first listener.
     * @param tail - The second listener.
     */
    constructor(public head: Listener | null, public tail: Listener | null) {}
}

// An object whose prototype chain holds no properties, so any event name is safe as a key
// (`__proto__`, `constructor`...). Faster to create than `Object.create(null)`.
function Events(): void { /* empty */ }
Events.prototype = Object.create(null);

type EventStore = Record<string | symbol, Listener | ListenerList | undefined>;

function matches(listener: Listener, fn: ListenerFunction, context: any, once: boolean): boolean
{
    return listener.fn === fn && (!once || listener.once) && (!context || listener.context === context);
}

/**
 * Marks an event's listeners removed, so an emit walking them stops calling them.
 * @param entry - The event's listener or list.
 */
function markRemoved(entry: Listener | ListenerList): void
{
    if (entry instanceof Listener)
    {
        entry.removed = true;

        return;
    }

    for (let listener = entry.head; listener; listener = listener.next) listener.removed = true;
}

function addToIndex<K>(index: Map<K, IndexEntry>, key: K, listener: Listener): void
{
    const entry = index.get(key);

    if (entry === undefined) index.set(key, listener);
    else if (entry instanceof Listener) index.set(key, new Set([entry, listener]));
    else entry.add(listener);
}

function removeFromIndex<K>(index: Map<K, IndexEntry>, key: K, listener: Listener): void
{
    const entry = index.get(key);

    if (entry === listener)
    {
        index.delete(key);
    }
    else if (entry instanceof Set)
    {
        entry.delete(listener);
        if (entry.size === 1) index.set(key, entry.values().next().value);
    }
}

function indexSize(entry: IndexEntry): number
{
    return entry instanceof Listener ? 1 : entry.size;
}

function unlink(list: ListenerList, listener: Listener): void
{
    if (listener.prev) listener.prev.next = listener.next;
    else list.head = listener.next;
    if (listener.next) listener.next.prev = listener.prev;
    else list.tail = listener.prev;
}

function call(listener: Listener, length: number, a1: any, a2: any, a3: any, a4: any, a5: any, args: any[]): void
{
    const { fn, context } = listener;

    switch (length)
    {
        case 1: fn.call(context); break;
        case 2: fn.call(context, a1); break;
        case 3: fn.call(context, a1, a2); break;
        case 4: fn.call(context, a1, a2, a3); break;
        case 5: fn.call(context, a1, a2, a3, a4); break;
        case 6: fn.call(context, a1, a2, a3, a4, a5); break;
        default: fn.apply(context, args);
    }
}

/**
 * A high performance event emitter, with the API of
 * [EventEmitter3]{@link https://github.com/primus/eventemitter3}, which PixiJS used before.
 *
 * Removing a listener is O(1) at any listener count, where EventEmitter3 rebuilt the whole list on
 * every removal, so thousands of listeners on one emitter (a shared texture, geometry or style) no
 * longer make teardown quadratic.
 *
 * Emitting calls the listeners in the order they were added. As with DOM `EventTarget`, a listener
 * added during an emit is not called by it, and one removed during an emit is not called by it
 * either. (EventEmitter3 still called listeners removed partway through an emit.)
 * @example
 * ```ts
 * import { EventEmitter } from 'pixi.js';
 *
 * const emitter = new EventEmitter<{ change: [value: number] }>();
 *
 * emitter.on('change', (value) => console.log(value));
 * emitter.emit('change', 42);
 * ```
 * @category utils
 * @standard
 */
export class EventEmitter<
    EventTypes extends EventEmitter.ValidEventTypes = string | symbol,
    Context = any
>
{
    /** Kept for compatibility with EventEmitter3: event names are never prefixed. */
    public static prefixed: string | boolean = false;

    /**
     * Listeners by event: the listener itself while an event has one, then a list. Created on the
     * first listener.
     * @internal
     */
    public _events: EventStore = null;
    /**
     * The number of events with at least one listener.
     * @internal
     */
    public _eventsCount = 0;

    /** Returns the names of the events that have listeners. */
    public eventNames(): Array<EventEmitter.EventNames<EventTypes>>
    {
        const events = this._events;
        const names: Array<string | symbol> = [];

        if (!events) return names as Array<EventEmitter.EventNames<EventTypes>>;

        for (const name in events)
        {
            if (events[name]) names.push(name);
        }

        const symbols = Object.getOwnPropertySymbols(events);

        for (let i = 0; i < symbols.length; i++)
        {
            if (events[symbols[i]]) names.push(symbols[i]);
        }

        return names as Array<EventEmitter.EventNames<EventTypes>>;
    }

    /**
     * Returns the listeners registered for an event, in the order they were added.
     * @param event - The event name.
     */
    public listeners<T extends EventEmitter.EventNames<EventTypes>>(
        event: T
    ): Array<EventEmitter.EventListener<EventTypes, T>>
    {
        type Fn = EventEmitter.EventListener<EventTypes, T>;
        const entry = this._events?.[event as string | symbol];

        if (!entry) return [];
        if (entry instanceof Listener) return [entry.fn as Fn];

        const fns: Fn[] = [];

        // removed listeners are unlinked straight away, so the list holds only registered ones
        for (let listener = entry.head; listener; listener = listener.next)
        {
            fns.push(listener.fn as Fn);
        }

        return fns;
    }

    /**
     * Returns the number of listeners registered for an event.
     * @param event - The event name.
     */
    public listenerCount(event: EventEmitter.EventNames<EventTypes>): number
    {
        const entry = this._events?.[event as string | symbol];

        if (!entry) return 0;

        return entry instanceof Listener ? 1 : entry.count;
    }

    /**
     * Calls each listener registered for an event with the given arguments.
     * @param event - The event name.
     * @param args - The arguments to pass to the listeners.
     * @returns `true` if the event had listeners.
     */
    public emit<T extends EventEmitter.EventNames<EventTypes>>(
        event: T,
        ...args: EventEmitter.EventArgs<EventTypes, T>
    ): boolean;
    // the named arguments cover every emit in PixiJS; `_rest` is declared for the overload and
    // never read, so the engine skips building it, and longer emits are sliced from `arguments`
    public emit(
        event: any, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any,
        ..._rest: any[]
    ): boolean
    {
        const entry = this._events?.[event];

        if (!entry) return false;

        const length = arguments.length;
        const args = length > 6 ? Array.prototype.slice.call(arguments, 1) : undefined;

        if (entry instanceof Listener)
        {
            if (entry.once) this._detach(event);
            call(entry, length, a1, a2, a3, a4, a5, args);

            return true;
        }

        const end = entry.added;

        for (let listener = entry.head; listener !== null && listener.order <= end; listener = listener.next)
        {
            if (listener.removed) continue;
            if (listener.once) this._remove(event, entry, listener);
            call(listener, length, a1, a2, a3, a4, a5, args);
        }

        return true;
    }

    /**
     * Emits an event with one argument like {@link EventEmitter#emit}, but checks `stop(arg)`
     * before each listener and ends the emit once it returns `true`.
     * @param event - The event name.
     * @param arg - The argument to pass to the listeners.
     * @param stop - Checked before each listener.
     * @returns `true` if the event had listeners.
     * @internal
     */
    public _emitUntil<A>(event: string | symbol, arg: A, stop: (arg: A) => boolean): boolean
    {
        const entry = this._events?.[event];

        if (!entry) return false;

        if (entry instanceof Listener)
        {
            if (stop(arg)) return true;
            if (entry.once) this._detach(event);
            call(entry, 2, arg, undefined, undefined, undefined, undefined, undefined);

            return true;
        }

        const end = entry.added;

        for (let listener = entry.head; listener !== null && listener.order <= end; listener = listener.next)
        {
            if (listener.removed) continue;
            if (stop(arg)) break;
            if (listener.once) this._remove(event, entry, listener);
            call(listener, 2, arg, undefined, undefined, undefined, undefined, undefined);
        }

        return true;
    }

    /**
     * Adds a listener for an event.
     * @param event - The event name.
     * @param fn - The listener.
     * @param context - The `this` to call the listener with. Defaults to the emitter.
     */
    public on<T extends EventEmitter.EventNames<EventTypes>>(
        event: T,
        fn: EventEmitter.EventListener<EventTypes, T>,
        context?: Context
    ): this
    {
        return this._add(event, fn, context, false);
    }

    /**
     * Adds a listener for an event. Alias of {@link EventEmitter#on}.
     * @param event - The event name.
     * @param fn - The listener.
     * @param context - The `this` to call the listener with. Defaults to the emitter.
     */
    public addListener<T extends EventEmitter.EventNames<EventTypes>>(
        event: T,
        fn: EventEmitter.EventListener<EventTypes, T>,
        context?: Context
    ): this
    {
        return this._add(event, fn, context, false);
    }

    /**
     * Adds a listener that is removed the first time the event is emitted.
     * @param event - The event name.
     * @param fn - The listener.
     * @param context - The `this` to call the listener with. Defaults to the emitter.
     */
    public once<T extends EventEmitter.EventNames<EventTypes>>(
        event: T,
        fn: EventEmitter.EventListener<EventTypes, T>,
        context?: Context
    ): this
    {
        return this._add(event, fn, context, true);
    }

    /**
     * Removes the listeners of an event that match the given function, context and `once` flag.
     * @param event - The event name.
     * @param fn - Only remove listeners with this function. Without it, all of the event's
     * listeners are removed.
     * @param context - Only remove listeners with this context.
     * @param once - Only remove listeners added with {@link EventEmitter#once}.
     */
    public removeListener<T extends EventEmitter.EventNames<EventTypes>>(
        event: T,
        fn?: EventEmitter.EventListener<EventTypes, T>,
        context?: Context,
        once?: boolean
    ): this
    {
        const events = this._events;

        if (events === null) return this;

        const key = event as string | symbol;
        const entry = events[key];

        if (entry === undefined) return this;

        if (!fn)
        {
            this._detach(key);

            return this;
        }

        // a lone listener is the common case, so it stays inline here
        if (entry instanceof Listener)
        {
            if (entry.fn === fn && (!once || entry.once) && (!context || entry.context === context))
            {
                entry.removed = true;
                events[key] = undefined;

                if (--this._eventsCount === 0) this._events = null;
            }

            return this;
        }

        this._removeFromList(key, entry, fn, context, once);

        return this;
    }

    /**
     * Removes the matching listeners of an event that has a list.
     * @param event - The event name.
     * @param list - The event's listeners.
     * @param fn - The listener function to match.
     * @param context - The context to match, if given.
     * @param once - Whether to match only `once` listeners.
     */
    private _removeFromList(
        event: string | symbol, list: ListenerList, fn: ListenerFunction, context: any, once: boolean
    ): void
    {
        const index = list.index;

        if (index)
        {
            let candidates = index.byFn.get(fn);

            if (candidates && context)
            {
                const byContext = index.byContext.get(context);

                if (!byContext) return;
                if (indexSize(byContext) < indexSize(candidates)) candidates = byContext;
            }

            if (!candidates) return;

            if (candidates instanceof Listener)
            {
                if (matches(candidates, fn, context, once)) this._remove(event, list, candidates);

                return;
            }

            // deleting the current entry during iteration is safe for a Set
            for (const listener of candidates)
            {
                if (matches(listener, fn, context, once)) this._remove(event, list, listener);
            }

            return;
        }

        for (let listener = list.head; listener; listener = listener.next)
        {
            if (listener.fn === fn && (!once || listener.once) && (!context || listener.context === context))
            {
                this._remove(event, list, listener);
            }
        }
    }

    /**
     * Removes the listeners of an event that match the given function, context and `once` flag.
     * Alias of {@link EventEmitter#removeListener}.
     * @param event - The event name.
     * @param fn - Only remove listeners with this function. Without it, all of the event's
     * listeners are removed.
     * @param context - Only remove listeners with this context.
     * @param once - Only remove listeners added with {@link EventEmitter#once}.
     */
    public off<T extends EventEmitter.EventNames<EventTypes>>(
        event: T,
        fn?: EventEmitter.EventListener<EventTypes, T>,
        context?: Context,
        once?: boolean
    ): this
    {
        return this.removeListener(event, fn, context, once);
    }

    /**
     * Removes all listeners, or all listeners of one event.
     * @param event - The event name. Without it, every event's listeners are removed.
     */
    public removeAllListeners(event?: EventEmitter.EventNames<EventTypes>): this
    {
        if (event !== undefined)
        {
            if (this._events?.[event as string | symbol]) this._detach(event as string | symbol);
        }
        else if (this._events)
        {
            const events = this._events;

            for (const name in events) if (events[name]) markRemoved(events[name]);

            const symbols = Object.getOwnPropertySymbols(events);

            for (let i = 0; i < symbols.length; i++) if (events[symbols[i]]) markRemoved(events[symbols[i]]);

            this._events = null;
            this._eventsCount = 0;
        }

        return this;
    }

    private _add(event: string | symbol, fn: ListenerFunction, context: any, once: boolean): this
    {
        if (typeof fn !== 'function')
        {
            throw new TypeError('The listener must be a function');
        }

        const events = (this._events ??= new (Events as any)() as EventStore);
        const entry = events[event];
        const listener = new Listener(fn, context || this, once);

        if (entry === undefined)
        {
            events[event] = listener;
            this._eventsCount++;

            return this;
        }

        if (entry instanceof Listener)
        {
            // the second listener: both move into a list
            entry.next = listener;
            listener.prev = entry;
            entry.order = 1;
            listener.order = 2;
            events[event] = new ListenerList(entry, listener);

            return this;
        }

        this._append(entry, listener);

        return this;
    }

    /**
     * Adds a listener to the end of a list, indexing the list once it is long enough.
     * @param list - The event's listeners.
     * @param listener - The new listener.
     */
    private _append(list: ListenerList, listener: Listener): void
    {
        listener.prev = list.tail;
        list.tail.next = listener;
        list.tail = listener;
        list.count++;
        listener.order = ++list.added;

        if (list.index)
        {
            addToIndex(list.index.byFn, listener.fn, listener);
            addToIndex(list.index.byContext, listener.context, listener);
        }
        else if (list.count > INDEX_THRESHOLD)
        {
            const index = list.index = new ListenerIndex();

            for (let l = list.head; l; l = l.next)
            {
                addToIndex(index.byFn, l.fn, l);
                addToIndex(index.byContext, l.context, l);
            }
        }
    }

    private _remove(event: string | symbol, list: ListenerList, listener: Listener): void
    {
        listener.removed = true;

        if (list.index)
        {
            removeFromIndex(list.index.byFn, listener.fn, listener);
            removeFromIndex(list.index.byContext, listener.context, listener);
        }

        // the last listener: nothing else is linked, so there is nothing left to mark
        if (--list.count === 0) this._drop(event);
        else unlink(list, listener);
    }

    /**
     * Drops all of an event's listeners, marking them removed so an emit walking them stops
     * calling them.
     * @param event - The event name.
     */
    private _detach(event: string | symbol): void
    {
        markRemoved(this._events[event]);
        this._drop(event);
    }

    /**
     * Forgets an event whose listeners are all removed already.
     * @param event - The event name.
     */
    private _drop(event: string | symbol): void
    {
        this._events[event] = undefined;

        if (--this._eventsCount === 0) this._events = null;
    }
}

/**
 * Types for typing an {@link EventEmitter}'s events, kept from EventEmitter3.
 * @category utils
 * @advanced
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace EventEmitter
{
    /**
     * A listener function.
     * @category utils
     * @advanced
     */
    export interface ListenerFn<Args extends any[] = any[]>
    {
        (...args: Args): void;
    }

    /**
     * The events an emitter accepts: any string or symbol, or an object mapping each event name
     * to its arguments tuple or its listener signature.
     * @example
     * ```ts
     * interface EventTypes {
     *   'event-with-parameters': any[]
     *   'event-with-example-handler': (...args: any[]) => void
     * }
     * ```
     * @category utils
     * @advanced
     */
    export type ValidEventTypes = string | symbol | object;

    /**
     * The event names of an event map.
     * @category utils
     * @advanced
     */
    export type EventNames<T extends ValidEventTypes> = T extends string | symbol ? T : keyof T;

    /**
     * Maps each event to its arguments tuple.
     * @category utils
     * @advanced
     */
    export type ArgumentMap<T extends object> = {
        [K in keyof T]: T[K] extends (...args: any[]) => void
            ? Parameters<T[K]>
            : T[K] extends any[]
                ? T[K]
                : any[];
    };

    /**
     * The listener signature of one event.
     * @category utils
     * @advanced
     */
    export type EventListener<T extends ValidEventTypes, K extends EventNames<T>> = T extends string | symbol
        ? (...args: any[]) => void
        : (...args: ArgumentMap<Exclude<T, string | symbol>>[Extract<K, keyof T>]) => void;

    /**
     * The arguments of one event.
     * @category utils
     * @advanced
     */
    export type EventArgs<T extends ValidEventTypes, K extends EventNames<T>> = Parameters<EventListener<T, K>>;
}
