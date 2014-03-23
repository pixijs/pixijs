/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 * @author Chad Engler https://github.com/englercj @Rolnaaba
 */

/**
 * Originally based on https://github.com/mrdoob/eventtarget.js/ from mr DOob.
 * Currently takes inspiration from the nodejs EventEmitter, and EventEmitter3
 */

/**
 * Mixins event emitter functionality to a class
 *
 * @class EventTarget
 * @example
 *      function MyEmitter() {
 *          PIXI.EventTarget.call(this); //mixes in event target stuff
 *      }
 *
 *      var em = new MyEmitter();
 *      em.emit('eventName', 'some data', 'some moar data', {}, null, ...);
 */
PIXI.EventTarget = function() {
    this._listeners = this._listeners || {};

    /**
     * Return a list of assigned event listeners.
     *
     * @param eventName {String} The events that should be listed.
     * @returns {Array}
     * @api public
     */
    this.listeners = function listeners(eventName) {
        return Array.apply(this, this._listeners[eventName] || []);
    };

    /**
     * Emit an event to all registered event listeners.
     *
     * @param eventName {String} The name of the event.
     * @returns {Boolean} Indication if we've emitted an event.
     * @api public
     */
    this.emit = function emit(eventName, data) {
        if(!data || data.__isEventObject !== true)
            data = new PIXI.Event(this, eventName, data);

        if(this._listeners && this._listeners[eventName]) {
            var listeners = this._listeners[eventName],
                length = listeners.length,
                fn = listeners[0],
                i;

            for(i = 0; i < length; fn = listeners[++i]) {
                //call the event listener
                fn.call(this, data);

                //remove the listener if this is a "once" event
                if(fn.__isOnce)
                    this.off(eventName, fn);

                //if "stopImmediatePropagation" is called, stop calling all events
                if(data.stoppedImmediate)
                    return;
            }

            //if "stopPropagation" is called then don't bubble the event
            if(data.stopped)
                return;
        }

        if(this.parent && this.parent.emit) {
            this.parent.emit.call(this.parent, eventName, data);
        }

        return true;
    };

    /**
     * Register a new EventListener for the given event.
     *
     * @param eventName {String} Name of the event.
     * @param callback {Functon} fn Callback function.
     * @api public
     */
    this.on = function on(eventName, fn) {
        if(!this._listeners[eventName])
            this._listeners[eventName] = [];

        this._listeners[eventName].push(fn);

        return this;
    };

    /**
     * Add an EventListener that's only called once.
     *
     * @param eventName {String} Name of the event.
     * @param callback {Function} Callback function.
     * @api public
     */
    this.once = function once(eventName, fn) {
        fn.__isOnce = true;
        return this.on(eventName, fn);
    };

    /**
     * Remove event listeners.
     *
     * @param eventName {String} The event we want to remove.
     * @param callback {Function} The listener that we need to find.
     * @api public
     */
    this.off = function off(eventName, fn) {
        if(!this._listeners[eventName])
            return this;

        var index = this._listeners[eventName].indexOf(fn);

        if(index !== -1) {
            this._listeners[eventName].splice(index, 1);
        }

        return this;
    };

    /**
     * Remove all listeners or only the listeners for the specified event.
     *
     * @param eventName {String} The event want to remove all listeners for.
     * @api public
     */
    this.removeAllListeners = function removeAllListeners(eventName) {
        if(!this._listeners[eventName])
            return this;

        this._listeners[eventName].length = 0;

        return this;
    };

    /**
     * Alias methods names because people roll like that.
     */
    this.removeEventListener = this.off;
    this.addEventListener = this.on;
    this.dispatchEvent = this.emit;
};

PIXI.Event = function(target, name, data) {
    this.__isEventObject = true;

    this.stopped = false;
    this.stoppedImmediate = false;

    this.target = target;
    this.type = name;
    this.data = data;

    this.timeStamp = Date.now();
};

PIXI.Event.prototype.stopPropagation = function() {
    this.stopped = true;
};

PIXI.Event.prototype.stopImmediatePropagation = function() {
    this.stoppedImmediate = true;
};
