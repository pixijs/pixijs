/**
 * The `SimpleListen` class provides a mechanism to manage and emit events
 * to a set of listener functions associated with specific numeric IDs. Each
 * listener function can optionally receive a target of type `TARGET` when the
 * event is emitted.
 *
 * This exists as in instances where we could be removing / adding event listeners many times a frame
 * can slow things down. This is a simple way to manage listeners without the overhead of an event emitter.
 * generally this is faster for adding removing slightly slower for iterating.
 *
 * It also expects functions to just be called, so if you pass one in
 * - its upto you to bind the function to the correct scope.
 */
export class SimpleListen<TARGET>
{
    /**
     * An object map where keys are numeric IDs and values are listener functions.
     * The listener functions can optionally accept a parameter of type `TARGET`.
     */
    private _map: Record<number, (target?: TARGET) => void> = {};

    /** The target object of type `TARGET` that can be passed to listener functions when events are emitted. */
    private readonly _target: TARGET;

    /**
     * Constructs a new instance of `SimpleListen`.
     * @param target - The target object of type `TARGET` that listener functions can optionally receive.
     */
    constructor(target: TARGET)
    {
        this._target = target;
    }

    /**
     * Adds a listener function associated with a specific ID. If there's already a listener
     * with the same ID, it will be replaced.
     * @param id - The numeric ID associated with the listener function.
     * @param f - The listener function that can optionally receive a target of type `TARGET`.
     */
    public add(id: number, f: (target?: TARGET) => void)
    {
        this._map[id] = f;
    }

    /**
     * Removes the listener function associated with the specified ID.
     * @param id - The numeric ID of the listener function to remove.
     */
    public remove(id: number)
    {
        this._map[id] = null;
    }

    /** Emits an event to all registered listener functions, passing the `TARGET` object to them if they accept it. */
    public emit()
    {
        for (const id in this._map)
        {
            this._map[id]?.(this._target);
        }
    }

    /** Destroys the `SimpleListen` instance, removing all listener functions and clearing the target object. */
    public destroy()
    {
        this._map = null;
        (this._target as null) = null;
    }
}
