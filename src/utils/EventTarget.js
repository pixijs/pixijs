/**
 * Originally based on https://github.com/mrdoob/eventtarget.js/ from mr Doob.
 * Currently takes inspiration from the nodejs EventEmitter, EventEmitter3, and smokesignals
 */

/**
 * Mixins event emitter functionality to a class
 *
 * @mixin
 * @namespace PIXI
 * @example
 *      function MyEmitter() {}
 *
 *      EventTarget.mixin(MyEmitter.prototype);
 *
 *      var em = new MyEmitter();
 *      em.emit('eventName', 'some data', 'some more data', {}, null, ...);
 */
function EventTarget(obj) {
    /**
     * Return a list of assigned event listeners.
     *
     * @param eventName {string} The events that should be listed.
     * @return {Array} An array of listener functions
     */
    obj.listeners = function listeners(eventName) {
        this._listeners = this._listeners || {};

        return this._listeners[eventName] ? this._listeners[eventName].slice() : [];
    };

    /**
     * Emit an event to all registered event listeners.
     *
     * @alias dispatchEvent
     * @param eventName {string} The name of the event.
     * @return {boolean} Indication if we've emitted an event.
     */
    obj.emit = obj.dispatchEvent = function emit(eventName, data) {
        this._listeners = this._listeners || {};

        //backwards compat with old method ".emit({ type: 'something' })"
        if (typeof eventName === 'object') {
            data = eventName;
            eventName = eventName.type;
        }

        //ensure we are using a real pixi event
        if (!data || data.__isEventObject !== true) {
            data = new Event(this, eventName, data);
        }

        //iterate the listeners
        if (this._listeners && this._listeners[eventName]) {
            var listeners = this._listeners[eventName].slice(0),
                length = listeners.length,
                fn = listeners[0],
                i;

            for (i = 0; i < length; fn = listeners[++i]) {
                //call the event listener
                fn.call(this, data);

                //if "stopImmediatePropagation" is called, stop calling sibling events
                if (data.stoppedImmediate) {
                    return this;
                }
            }

            //if "stopPropagation" is called then don't bubble the event
            if (data.stopped) {
                return this;
            }
        }

        //bubble this event up the scene graph
        if (this.parent && this.parent.emit) {
            this.parent.emit.call(this.parent, eventName, data);
        }

        return this;
    };

    /**
     * Register a new EventListener for the given event.
     *
     * @alias addEventListener
     * @param eventName {string} Name of the event.
     * @param callback {Functon} fn Callback function.
     */
    obj.on = obj.addEventListener = function on(eventName, fn) {
        this._listeners = this._listeners || {};

        (this._listeners[eventName] = this._listeners[eventName] || [])
            .push(fn);

        return this;
    };

    /**
     * Add an EventListener that's only called once.
     *
     * @param eventName {string} Name of the event.
     * @param callback {Function} Callback function.
     */
    obj.once = function once(eventName, fn) {
        this._listeners = this._listeners || {};

        var self = this;
        function onceHandlerWrapper() {
            fn.apply(self.off(eventName, onceHandlerWrapper), arguments);
        }
        onceHandlerWrapper._originalHandler = fn;

        return this.on(eventName, onceHandlerWrapper);
    };

    /**
     * Remove event listeners.
     *
     * @alias removeEventListener
     * @param eventName {string} The event we want to remove.
     * @param callback {Function} The listener that we need to find.
     */
    obj.off = obj.removeEventListener = function off(eventName, fn) {
        this._listeners = this._listeners || {};

        if (!this._listeners[eventName])
            return this;

        var list = this._listeners[eventName],
            i = fn ? list.length : 0;

        while(i-- > 0) {
            if (list[i] === fn || list[i]._originalHandler === fn) {
                list.splice(i, 1);
            }
        }

        if (list.length === 0) {
            delete this._listeners[eventName];
        }

        return this;
    };

    /**
     * Remove all listeners or only the listeners for the specified event.
     *
     * @param eventName {string} The event you want to remove all listeners for.
     */
    obj.removeAllListeners = function removeAllListeners(eventName) {
        this._listeners = this._listeners || {};

        if (!this._listeners[eventName])
            return this;

        delete this._listeners[eventName];

        return this;
    };
};

module.exports = {
    /**
     * Backward compat from when this used to be a function
     */
    call: function callCompat(obj) {
        if (obj) {
            obj = obj.prototype || obj;
            EventTarget(obj);
        }
    },

    /**
     * Mixes in the properties of the EventTarget prototype onto another object
     *
     * @param object {object} The obj to mix into
     */
    mixin: function mixin(obj) {
        EventTarget(obj);
    }
}

/**
 * Creates an homogenous object for tracking events so users can know what to expect.
 *
 * @class
 * @namespace PIXI
 * @param target {object} The target object that the event is called on
 * @param name {string} The string name of the event that was triggered
 * @param data {object} Arbitrary event data to pass along
 */
function Event(target, name, data) {
    // for duck typing in the ".on()" function
    this.__isEventObject = true;

    /**
     * Tracks the state of bubbling propagation. Do not
     * set this directly, instead use `event.stopPropagation()`
     *
     * @member {boolean}
     * @private
     * @readonly
     */
    this.stopped = false;

    /**
     * Tracks the state of sibling listener propagation. Do not
     * set this directly, instead use `event.stopImmediatePropagation()`
     *
     * @member {boolean}
     * @private
     * @readonly
     */
    this.stoppedImmediate = false;

    /**
     * The original target the event triggered on.
     *
     * @member {object}
     * @readonly
     */
    this.target = target;

    /**
     * The string name of the event that this represents.
     *
     * @member {string}
     * @readonly
     */
    this.type = name;

    /**
     * The data that was passed in with this event.
     *
     * @member {object}
     * @readonly
     */
    this.data = data;

    //backwards compat with older version of events
    this.content = data;

    /**
     * The timestamp when the event occurred.
     *
     * @member {number}
     * @readonly
     */
    this.timeStamp = Date.now();
};

/**
 * Stops the propagation of events up the scene graph (prevents bubbling).
 *
 */
Event.prototype.stopPropagation = function stopPropagation() {
    this.stopped = true;
};

/**
 * Stops the propagation of events to sibling listeners (no longer calls any listeners).
 *
 */
Event.prototype.stopImmediatePropagation = function stopImmediatePropagation() {
    this.stoppedImmediate = true;
};
