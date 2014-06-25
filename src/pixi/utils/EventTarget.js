/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */
 
/**
 * https://github.com/mrdoob/eventtarget.js/
 * THankS mr DOob!
 */

/**
 * Adds event emitter functionality to a class
 *
 * @class EventTarget
 * @example
 *      function MyEmitter() {
 *          PIXI.EventTarget.call(this); //mixes in event target stuff
 *      }
 *
 *      var em = new MyEmitter();
 *      em.emit({ type: 'eventName', data: 'some data' });
 */
PIXI.EventTarget = function () {

    /**
     * Holds all the listeners
     *
     * @property listeners
     * @type Object
     */
    var listeners = {};

    var lock = 0; // denotes number of distict events dispatched at the moment. Used in remove all events.
    var locks = {}; // per-event lock.

    /**
     * Adds a listener for a specific event
     *
     * @method addEventListener
     * @param type {string} A string representing the event type to listen for.
     * @param listener {function} The callback function that will be fired when the event occurs
     */
    this.addEventListener = this.on = function ( type, listener ) {


        if ( listeners[ type ] === undefined ) {

            listeners[ type ] = [];
            locks[ type ] = 0;

        }

        if ( listeners[ type ].indexOf( listener ) === - 1 ) {

            listeners[ type ].push( listener );
        }

    };

    /**
     * Fires the event, ie pretends that the event has happened
     *
     * @method dispatchEvent
     * @param event {Event} the event object
     */
    this.dispatchEvent = this.emit = function ( event ) {
        if ( !listeners[ event.type ] || !listeners[ event.type ].length )
            return;

        event.target = this;

        if(locks[event.type]++ === 0) ++lock;

        var link = listeners[ event.type ];
        var currentIndex = 0;

        for(var i = 0, l = link.length; i < l; i++) {
            if(link[i]) {
                link[i](event);
                if(currentIndex !== i) {
                    link[currentIndex] = link[i];
                    link[i] = null;
                }
                ++currentIndex;
            }
        }

        if(--locks[event.type] === 0) {
            if(currentIndex !== i) {
                var numObjects = link.length;
                while(i < numObjects)
                    link[currentIndex++] = link[i++];
                link.length = currentIndex;
            }
        }
    };

    /**
     * Removes the specified listener that was assigned to the specified event type
     *
     * @method removeEventListener
     * @param type {string} A string representing the event type which will have its listener removed
     * @param listener {function} The callback function that was be fired when the event occured
     */
    this.removeEventListener = this.off = function (type, listener) {
        var index = listeners[type].indexOf(listener);
        if(index === -1) return;
        // it is dangerouse to brutaly remove event listeners when this kind of event is emitted
        if(locks[type] === 0) listeners[type].splice(index, 1);
        else listeners[type][index] = null;
    };

    /**
     * Removes all the listeners that were active for the specified event type
     *
     * @method removeAllEventListeners
     * @param type {string} A string representing the event type which will have all its listeners removed. If evaluates
     *     to flase (e.g. empty) all the listeners are removed.
     */
    this.removeAllEventListeners = function(type) {
        var a, i, l;
        if(type) {
            a = listeners[type];
            if(a) {
                if(locks[type] === 0) a.length = 0;
                else for(i = 0, l = a.length; i < l; i++) a[i] = null; // we cannot just truncate if there are emits
            }
        } else {
            if(lock === 0) {
                listeners = {};
                locks = {};
            } else { // if there are any events dispatching in the moment - this action becomes more expensive...
                for(var typeName in listeners) {
                    if(!listeners.hasOwnProperty(typeName)) continue;
                    a = listeners[typeName];
                    if(locks[typeName] === 0) a.length = 0;
                    else for(i = 0, l = a.length; i < l; i++) a[i] = null;
                }
            }
        }
    };
};
