/**
 * A pool for canvases.
 *
 * @class
 * @memberof PIXI
 */
export default class CanvasPool {
    /**
     * Constructor
     */
    constructor()
    {
        this._pool = {};
    }

    /**
     * Generate a key for the given element (canvas) based on its height and width
     * @param {Canvas} element object to generate the key for.
     * @returns {number} the generated key for the given canvas.
     */
    getKey(element)
    {
        return ((element.width & 0xFFFF) << 16) | (element.height & 0xFFFF);
    }

    /**
     * Whenever possible, pops a canvas from the pool and returns it. If none are free, it calls the given callback
     * to create a new one.
     * @param {key} key to identify the type of needed canvas.
     * @param {function} createCallback callback that retuns a new instance of a canvas.
     * @returns {Canvas} canvas instance, either recycled or new.
     */
    popElementOrCreate(key, createCallback)
    {
        if (!this._pool[key])
        {
            this._pool[key] = [];
        }

        return this._pool[key].pop() || createCallback();
    }

    /**
     * Frees the given canvas into the pool.
     * @param {Canvas} element the element to free into the pool
     */
    freeElement(element)
    {
        const key = this.getKey(element);

        if (!this._pool[key])
        {
            this._pool[key] = [];
        }

        this._pool[key].push(element);
    }

    /**
     * Empties the pool, letting the GC collect the stored instances.
     */
    emptyPool()
    {
        for (const i in this._pool)
        {
            this._pool[i].length = 0;
        }

        this._pool = {};
    }
}

