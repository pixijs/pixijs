"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Internal class for handling the priority sorting of ticker handlers.
 *
 * @private
 * @class
 * @memberof PIXI.ticker
 */
var TickerListener = function () {
    /**
     * Constructor
     *
     * @param {Function} fn - The listener function to be added for one update
     * @param {Function} [context=null] - The listener context
     * @param {number} [priority=0] - The priority for emitting
     * @param {boolean} [once=false] - If the handler should fire once
     */
    function TickerListener(fn) {
        var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var priority = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var once = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        _classCallCheck(this, TickerListener);

        /**
         * The handler function to execute.
         * @member {Function}
         */
        this.fn = fn;

        /**
         * The calling to execute.
         * @member {Function}
         */
        this.context = context;

        /**
         * The current priority.
         * @member {number}
         */
        this.priority = priority;

        /**
         * If this should only execute once.
         * @member {boolean}
         */
        this.once = once;

        /**
         * The next item in chain.
         * @member {TickerListener}
         */
        this.next = null;

        /**
         * The previous item in chain.
         * @member {TickerListener}
         */
        this.previous = null;

        /**
         * `true` if this listener has been destroyed already.
         * @member {boolean}
         * @private
         */
        this._destroyed = false;
    }

    /**
     * Simple compare function to figure out if a function and context match.
     *
     * @param {Function} fn - The listener function to be added for one update
     * @param {Function} context - The listener context
     * @return {boolean} `true` if the listener match the arguments
     */


    TickerListener.prototype.match = function match(fn, context) {
        context = context || null;

        return this.fn === fn && this.context === context;
    };

    /**
     * Emit by calling the current function.
     * @param {number} deltaTime - time since the last emit.
     * @return {TickerListener} Next ticker
     */


    TickerListener.prototype.emit = function emit(deltaTime) {
        if (this.fn) {
            if (this.context) {
                this.fn.call(this.context, deltaTime);
            } else {
                this.fn(deltaTime);
            }
        }

        var redirect = this.next;

        if (this.once) {
            this.destroy(true);
        }

        // Soft-destroying should remove
        // the next reference
        if (this._destroyed) {
            this.next = null;
        }

        return redirect;
    };

    /**
     * Connect to the list.
     * @param {TickerListener} previous - Input node, previous listener
     */


    TickerListener.prototype.connect = function connect(previous) {
        this.previous = previous;
        if (previous.next) {
            previous.next.previous = this;
        }
        this.next = previous.next;
        previous.next = this;
    };

    /**
     * Destroy and don't use after this.
     * @param {boolean} [hard = false] `true` to remove the `next` reference, this
     *        is considered a hard destroy. Soft destroy maintains the next reference.
     * @return {TickerListener} The listener to redirect while emitting or removing.
     */


    TickerListener.prototype.destroy = function destroy() {
        var hard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        this._destroyed = true;
        this.fn = null;
        this.context = null;

        // Disconnect, hook up next and previous
        if (this.previous) {
            this.previous.next = this.next;
        }

        if (this.next) {
            this.next.previous = this.previous;
        }

        // Redirect to the next item
        var redirect = this.previous;

        // Remove references
        this.next = hard ? null : redirect;
        this.previous = null;

        return redirect;
    };

    return TickerListener;
}();

exports.default = TickerListener;
//# sourceMappingURL=TickerListener.js.map