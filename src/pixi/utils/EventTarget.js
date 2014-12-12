/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 * @author Chad Engler https://github.com/englercj @Rolnaaba
 */

/**
 * Originally based on https://github.com/mrdoob/eventtarget.js/ from mr Doob.
 * Currently takes inspiration from the nodejs EventEmitter, EventEmitter3, and smokesignals
 */

/**
 * Mixins event emitter functionality to a class
 *
 * @class EventTarget
 * @example
 *      function MyEmitter() {}
 *
 *      PIXI.EventTarget.mixin(MyEmitter.prototype);
 *
 *      var em = new MyEmitter();
 *      em.emit('eventName', 'some data', 'some more data', {}, null, ...);
 */
PIXI.EventTarget = {
    /**
     * Backward compat from when this used to be a function
     */
    call: function callCompat(obj) {
        if(obj) {
            obj = obj.prototype || obj;
            PIXI.EventTarget.mixin(obj);
        }
    },

    /**
     * Mixes in the properties of the EventTarget prototype onto another object
     *
     * @method mixin
     * @param object {Object} The obj to mix into
     */
    mixin: function mixin(obj) {
        /**
         * Return a list of assigned event listeners.
         *
         * @method listeners
         * @param eventName {String} The events that should be listed.
         * @return {Array} An array of listener functions
         */
        obj.listeners = function listeners(eventName) {
            this._listeners = this._listeners || {};

            return this._listeners[eventName] ? this._listeners[eventName].slice() : [];
        };

        /**
         * Emit an event to all registered event listeners.
         *
         * @method emit
         * @alias dispatchEvent
         * @param eventName {String} The name of the event.
         * @return {Boolean} Indication if we've emitted an event.
         */
        obj.emit = obj.dispatchEvent = function emit(eventName, data) {
            this._listeners = this._listeners || {};

            //backwards compat with old method ".emit({ type: 'something' })"
            if(typeof eventName === 'object') {
                data = eventName;
                eventName = eventName.type;
            }

            //ensure we are using a real pixi event
            if(!data || data.__isEventObject !== true) {
                data = new PIXI.Event(this, eventName, data);
            }

            //iterate the listeners
            if(this._listeners && this._listeners[eventName]) {
                var listeners = this._listeners[eventName].slice(0),
                    length = listeners.length,
                    fn = listeners[0],
                    i;

                for(i = 0; i < length; fn = listeners[++i]) {
                    //call the event listener
                    fn.call(this, data);

                    //if "stopImmediatePropagation" is called, stop calling sibling events
                    if(data.stoppedImmediate) {
                        return this;
                    }
                }

                //if "stopPropagation" is called then don't bubble the event
                if(data.stopped) {
                    return this;
                }
            }

            //bubble this event up the scene graph
            if(this.parent && this.parent.emit) {
                this.parent.emit.call(this.parent, eventName, data);
            }

            return this;
        };

        /**
         * Register a new EventListener for the given event.
         *
         * @method on
         * @alias addEventListener
         * @param eventName {String} Name of the event.
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
         * @method once
         * @param eventName {String} Name of the event.
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
         * @method off
         * @alias removeEventListener
         * @param eventName {String} The event we want to remove.
         * @param callback {Function} The listener that we need to find.
         */
        obj.off = obj.removeEventListener = function off(eventName, fn) {
            this._listeners = this._listeners || {};

            if(!this._listeners[eventName])
                return this;

            var list = this._listeners[eventName],
                i = fn ? list.length : 0;

            while(i-- > 0) {
                if(list[i] === fn || list[i]._originalHandler === fn) {
                    list.splice(i, 1);
                }
            }

            if(list.length === 0) {
                delete this._listeners[eventName];
            }

            return this;
        };

        /**
         * Remove all listeners or only the listeners for the specified event.
         *
         * @method removeAllListeners
         * @param eventName {String} The event you want to remove all listeners for.
         */
        obj.removeAllListeners = function removeAllListeners(eventName) {
            this._listeners = this._listeners || {};

            if(!this._listeners[eventName])
                return this;

            delete this._listeners[eventName];

            return this;
        };
    }
};

/**
 * Creates an homogenous object for tracking events so users can know what to expect.
 *
 * @class Event
 * @extends Object
 * @constructor
 * @param target {Object} The target object that the event is called on
 * @param name {String} The string name of the event that was triggered
 * @param data {Object} Arbitrary event data to pass along
 */
PIXI.Event = function(target, name, data) {
    //for duck typing in the ".on()" function
    this.__isEventObject = true;

    /**
     * Tracks the state of bubbling propagation. Do not
     * set this directly, instead use `event.stopPropagation()`
     *
     * @property stopped
     * @type Boolean
     * @private
     * @readOnly
     */
    this.stopped = false;

    /**
     * Tracks the state of sibling listener propagation. Do not
     * set this directly, instead use `event.stopImmediatePropagation()`
     *
     * @property stoppedImmediate
     * @type Boolean
     * @private
     * @readOnly
     */
    this.stoppedImmediate = false;

    /**
     * The original target the event triggered on.
     *
     * @property target
     * @type Object
     * @readOnly
     */
    this.target = target;

    /**
     * The string name of the event that this represents.
     *
     * @property type
     * @type String
     * @readOnly
     */
    this.type = name;

    /**
     * The data that was passed in with this event.
     *
     * @property data
     * @type Object
     * @readOnly
     */
    this.data = data;

    //backwards compat with older version of events
    this.content = data;

    /**
     * The timestamp when the event occurred.
     *
     * @property timeStamp
     * @type Number
     * @readOnly
     */
    this.timeStamp = Date.now();
};

/**
 * Stops the propagation of events up the scene graph (prevents bubbling).
 *
 * @method stopPropagation
 */
PIXI.Event.prototype.stopPropagation = function stopPropagation() {
    this.stopped = true;
};

/**
 * Stops the propagation of events to sibling listeners (no longer calls any listeners).
 *
 * @method stopImmediatePropagation
 */
PIXI.Event.prototype.stopImmediatePropagation = function stopImmediatePropagation() {
    this.stoppedImmediate = true;
};
