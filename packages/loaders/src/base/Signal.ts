/* jshint -W097 */

/**
 * @memberof PIXI
 */
export class SignalBinding<CbType>
{
    _fn: any;
    _once: boolean;
    _next: SignalBinding<CbType>;
    _prev: SignalBinding<CbType>;
    _owner: Signal<CbType>;
    _thisArg: any;

    /**
     * SignalBinding constructor.
     * @constructs SignalBinding
     * @param {Function} fn - Event handler to be called.
     * @param {Boolean} [once=false] - Should this listener be removed after dispatch
     * @param {object} [thisArg] - The context of the callback function.
     * @api private
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    constructor(fn: CbType, once = false, thisArg: any)
    {
        this._fn = fn;
        this._once = once;
        this._thisArg = thisArg;
        this._next = this._prev = this._owner = null;
    }

    detach(): boolean
    {
        if (this._owner === null) return false;
        this._owner.detach(this);

        return true;
    }
}

/**
 * @private
 */
function _addSignalBinding<CbType>(self: Signal<CbType>, node: SignalBinding<CbType>)
{
    if (!self._head)
    {
        self._head = node;
        self._tail = node;
    }
    else
    {
        self._tail._next = node;
        node._prev = self._tail;
        self._tail = node;
    }

    node._owner = self;

    return node;
}

/**
 * @memberof PIXI
 */
export class Signal<CbType = (...args: any) => void>
{
    _head: SignalBinding<CbType>;
    _tail: SignalBinding<CbType>;

    /**
     * MiniSignal constructor.
     * @example
     * let mySignal = new Signal();
     * let binding = mySignal.add(onSignal);
     * mySignal.dispatch('foo', 'bar');
     * mySignal.detach(binding);
     */
    constructor()
    {
        this._head = this._tail = undefined;
    }

    /**
     * Return an array of attached SignalBinding.
     *
     * @param {Boolean} [exists=false] - We only need to know if there are handlers.
     * @returns {PIXI.SignalBinding[]|Boolean} Array of attached SignalBinding or Boolean if called with exists = true
     * @api public
     */
    handlers(exists = false): Array<SignalBinding<CbType>> | boolean
    {
        let node = this._head;

        if (exists) return !!node;

        const ee = [];

        while (node)
        {
            ee.push(node);
            node = node._next;
        }

        return ee;
    }

    /**
     * Return true if node is a SignalBinding attached to this MiniSignal
     *
     * @param {PIXI.SignalBinding} node - Node to check.
     * @returns {Boolean} True if node is attache to mini-signal
     */
    has(node: SignalBinding<CbType>): boolean
    {
        if (!(node instanceof SignalBinding))
        {
            throw new Error('MiniSignal#has(): First arg must be a SignalBinding object.');
        }

        return node._owner === this;
    }

    /**
     * Dispaches a signal to all registered listeners.
     *
     * @returns {Boolean} Indication if we've emitted an event.
     */
    dispatch(...args: any[]): boolean
    {
        let node = this._head;

        if (!node) return false;

        while (node)
        {
            if (node._once) this.detach(node);
            node._fn.apply(node._thisArg, args);
            node = node._next;
        }

        return true;
    }

    /**
     * Register a new listener.
     *
     * @param {Function} fn - Callback function.
     * @param {object} [thisArg] - The context of the callback function.
     * @returns {PIXI.SignalBinding} The SignalBinding node that was added.
     */
    add(fn: CbType, thisArg: any = null): SignalBinding<CbType>
    {
        if (typeof fn !== 'function')
        {
            throw new Error('MiniSignal#add(): First arg must be a Function.');
        }

        return _addSignalBinding<CbType>(this, new SignalBinding<CbType>(fn, false, thisArg));
    }

    /**
     * Register a new listener that will be executed only once.
     *
     * @param {Function} fn - Callback function.
     * @param {object} [thisArg] - The context of the callback function.
     * @returns {PIXI.SignalBinding} The SignalBinding node that was added.
     */
    once(fn: CbType, thisArg: any = null): SignalBinding<CbType>
    {
        if (typeof fn !== 'function')
        {
            throw new Error('MiniSignal#once(): First arg must be a Function.');
        }

        return _addSignalBinding<CbType>(this, new SignalBinding<CbType>(fn, true, thisArg));
    }

    /**
     * Remove binding object.
     *
     * @param {PIXI.SignalBinding} node - The binding node that will be removed.
     * @returns {Signal} The instance on which this method was called.
     * @api public */
    detach(node: SignalBinding<CbType>): this
    {
        if (!(node instanceof SignalBinding))
        {
            throw new Error('MiniSignal#detach(): First arg must be a SignalBinding object.');
        }
        if (node._owner !== this) return this; // todo: or error?

        if (node._prev) node._prev._next = node._next;
        if (node._next) node._next._prev = node._prev;

        if (node === this._head)
        { // first node
            this._head = node._next;
            if (node._next === null)
            {
                this._tail = null;
            }
        }
        else if (node === this._tail)
        { // last node
            this._tail = node._prev;
            this._tail._next = null;
        }

        node._owner = null;

        return this;
    }

    /**
     * Detach all listeners.
     *
     * @returns {Signal} The instance on which this method was called.
     */
    detachAll(): this
    {
        let node = this._head;

        if (!node) return this;

        this._head = this._tail = null;

        while (node)
        {
            node._owner = null;
            node = node._next;
        }

        return this;
    }
}
