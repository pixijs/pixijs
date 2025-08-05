/** Interface for objects that can be cleaned up by the PoolCollector. */
interface Cleanable
{
    clear(): void;
}

/**
 * A singleton collector that manages and provides cleanup for registered pools and caches.
 * Useful for cleaning up all pools/caches at once during application shutdown or reset.
 * @category utils
 * @internal
 */
export const PoolCollector = {
    /**
     * Set of registered pools and cleanable objects.
     * @private
     */
    _registeredPools: new Set<Cleanable>(),

    /**
     * Registers a pool or cleanable object for cleanup.
     * @param {Cleanable} pool - The pool or object to register.
     */
    register(pool: Cleanable): void
    {
        this._registeredPools.add(pool);
    },

    /**
     * Unregisters a pool or cleanable object from cleanup.
     * @param {Cleanable} pool - The pool or object to unregister.
     */
    unregister(pool: Cleanable): void
    {
        this._registeredPools.delete(pool);
    },

    /** Clears all registered pools and cleanable objects. This will call clear() on each registered item. */
    clearAll(): void
    {
        this._registeredPools.forEach((pool) => pool.clear());
    },

    /**
     * Gets the number of registered pools and cleanable objects.
     * @returns {number} The count of registered items.
     */
    get registeredCount(): number
    {
        return this._registeredPools.size;
    },

    /**
     * Checks if a specific pool or cleanable object is registered.
     * @param {Cleanable} pool - The pool or object to check.
     * @returns {boolean} True if the item is registered, false otherwise.
     */
    isRegistered(pool: Cleanable): boolean
    {
        return this._registeredPools.has(pool);
    },

    /**
     * Removes all registrations without clearing the pools.
     * Useful if you want to reset the collector without affecting the pools.
     */
    reset(): void
    {
        this._registeredPools.clear();
    }
};
