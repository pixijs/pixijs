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
 *      function MyEmitter() {}
 *
 *      PIXI.EventTarget.mixin(MyEmitter.prototype);
 *
 *      var em = new MyEmitter();
 *      em.emit('eventName', 'some data', 'some moar data', {}, null, ...);
 */
function EventTarget() {}

/**
 * Mixes in the properties of the EventTarget prototype onto another object
 *
 * @method mixin
 * @param object {Object} The obj to mix into
 */
EventTarget.prototype.mixin = function mixin(obj) {
    obj.listeners = this.listeners;
    obj.emit = this.emit;
    obj.on = this.on;
    obj.off = this.off;
    obj.once = this.once;
    obj.removeAllListeners = this.removeAllListeners;

    obj.addEventListener = this.addEventListener;
    obj.removeEventListener = this.removeEventListener;
    obj.dispatchEvent = this.dispatchEvent;
};

/**
 * Return a list of assigned event listeners.
 *
 * @method listeners
 * @param eventName {String} The events that should be listed.
 * @returns {Array} An array of listener functions
 */
EventTarget.prototype.listeners = function listeners(eventName) {
    return Array.apply(this, this._listeners[eventName] || []);
};

/**
 * Emit an event to all registered event listeners.
 *
 * @method emit
 * @alias dispatchEvent
 * @param eventName {String} The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 */
EventTarget.prototype.emit = function emit(eventName, data) {
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
 * @method on
 * @alias addEventListener
 * @param eventName {String} Name of the event.
 * @param callback {Functon} fn Callback function.
 */
EventTarget.prototype.on = function on(eventName, fn) {
    if(!this._listeners)
        this._listeners = {};

    if(!this._listeners[eventName])
        this._listeners[eventName] = [];

    this._listeners[eventName].push(fn);

    return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @method once
 * @param eventName {String} Name of the event.
 * @param callback {Function} Callback function.
 */
EventTarget.prototype.once = function once(eventName, fn) {
    fn.__isOnce = true;
    return this.on(eventName, fn);
};

/**
 * Remove event listeners.
 *
 * @method off
 * @alias removeEventListener
 * @param eventName {String} The event we want to remove.
 * @param callback {Function} The listener that we need to find.
 */
EventTarget.prototype.off = function off(eventName, fn) {
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
 * @method removeAllListeners
 * @param eventName {String} The event you want to remove all listeners for.
 */
EventTarget.prototype.removeAllListeners = function removeAllListeners(eventName) {
    if(!this._listeners[eventName])
        return this;

    this._listeners[eventName].length = 0;

    return this;
};

/**
 * Alias methods names because people roll like that.
 */
EventTarget.prototype.removeEventListener = EventTarget.prototype.off;
EventTarget.prototype.addEventListener = EventTarget.prototype.on;
EventTarget.prototype.dispatchEvent = EventTarget.prototype.emit;

PIXI.EventTarget = new EventTarget();

PIXI.Event = function(target, name, data) {
    this.__isEventObject = true;

    this.stopped = false;
    this.stoppedImmediate = false;

    this.target = target;
    this.type = name;
    this.data = data;

    this.timeStamp = Date.now();
};

PIXI.Event.prototype.stopPropagation = function stopPropagation() {
    this.stopped = true;
};

PIXI.Event.prototype.stopImmediatePropagation = function stopImmediatePropagation() {
    this.stoppedImmediate = true;
};
