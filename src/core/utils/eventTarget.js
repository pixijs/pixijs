var EventData = require('./EventData');

var tempEventObject = new EventData(null, null, {});

/**
 * Mixins event emitter functionality to an object.
 *
 * @mixin
 * @memberof PIXI.utils
 * @example
 *      function MyEmitter() {}
 *
 *      eventTarget.mixin(MyEmitter.prototype);
 *
 *      var em = new MyEmitter();
 *      em.emit('eventName', 'some data', 'some more data', {}, null, ...);
 */
function eventTarget(obj)
{
    /**
     * Return a list of assigned event listeners.
     *
     * @memberof eventTarget
     * @param eventName {string} The events that should be listed.
     * @return {Array} An array of listener functions
     */
    obj.listeners = function listeners(eventName)
    {
        this._listeners = this._listeners || {};

        return this._listeners[eventName] ? this._listeners[eventName].slice() : [];
    };

    /**
     * Emit an event to all registered event listeners.
     *
     * @memberof eventTarget
     * @alias dispatchEvent
     * @param eventName {string} The name of the event.
     * @return {boolean} Indication if we've emitted an event.
     */
    obj.emit = obj.dispatchEvent = function emit(eventName, data)
    {
        this._listeners = this._listeners || {};

        // fast return when there are no listeners
        if (!this._listeners[eventName])
        {
            return;
        }

        //backwards compat with old method ".emit({ type: 'something' })"
        //lets not worry about old ways of using stuff for v3
        /*
        if (typeof eventName === 'object')
        {
            data = eventName;
            eventName = eventName.type;
        }
        */

        //ensure we are using a real pixi event
        //instead of creating a new object lets use an the temp one ( save new creation for each event )
        if ( !data || !data.__isEventObject )
        {
            tempEventObject.target=  this;
            tempEventObject.type = eventName;
            tempEventObject.data = data;

            data = tempEventObject;
        }

        //iterate the listeners
        var listeners = this._listeners[eventName].slice(0),
            length = listeners.length,
            fn = listeners[0],
            i;

        for (i = 0; i < length; fn = listeners[++i])
        {
            //call the event listener scope is currently determined by binding the listener
            //way faster than 'call'
            fn(data);

            //if "stopImmediatePropagation" is called, stop calling sibling events
            if (data.stoppedImmediate)
            {
                return this;
            }
        }

        //if "stopPropagation" is called then don't bubble the event
        if (data.stopped)
        {
            return this;
        }

        return this;
    };

    /**
     * Register a new EventListener for the given event.
     *
     * @memberof eventTarget
     * @alias addEventListener
     * @param eventName {string} Name of the event.
     * @param callback {Functon} fn Callback function.
     */
    obj.on = obj.addEventListener = function on(eventName, fn)
    {
        this._listeners = this._listeners || {};

        (this._listeners[eventName] = this._listeners[eventName] || [])
            .push(fn);

        return this;
    };

    /**
     * Add an EventListener that's only called once.
     *
     * @memberof eventTarget
     * @param eventName {string} Name of the event.
     * @param callback {Function} Callback function.
     */
    obj.once = function once(eventName, fn)
    {
        this._listeners = this._listeners || {};

        var self = this;
        function onceHandlerWrapper()
        {
            fn.apply(self.off(eventName, onceHandlerWrapper), arguments);
        }
        onceHandlerWrapper._originalHandler = fn;

        return this.on(eventName, onceHandlerWrapper);
    };

    /**
     * Remove event listeners.
     *
     * @memberof eventTarget
     * @alias removeEventListener
     * @param eventName {string} The event we want to remove.
     * @param callback {Function} The listener that we need to find.
     */
    obj.off = obj.removeEventListener = function off(eventName, fn)
    {
        this._listeners = this._listeners || {};

        if (!this._listeners[eventName])
        {
            return this;
        }

        var list = this._listeners[eventName],
            i = fn ? list.length : 0;

        while (i-- > 0)
        {
            if (list[i] === fn || list[i]._originalHandler === fn)
            {
                list.splice(i, 1);
            }
        }

        if (list.length === 0)
        {
            // delete causes deoptimization
            // lets set it to null
            this._listeners[eventName] = null;
        }

        return this;
    };

    /**
     * Remove all listeners or only the listeners for the specified event.
     *
     * @memberof eventTarget
     * @param eventName {string} The event you want to remove all listeners for.
     */
    obj.removeAllListeners = function removeAllListeners(eventName)
    {
        this._listeners = this._listeners || {};

        if (!this._listeners[eventName])
        {
            return this;
        }

        // delete causes deoptimization
        // lets set it to null
        this._listeners[eventName] = null;

        return this;
    };
}

module.exports = {
    /**
     * Mixes in the properties of the eventTarget into another object
     *
     * @param object {object} The obj to mix into
     */
    mixin: function mixin(obj)
    {
        eventTarget(obj);
    }
};
