/**
 * @author Dima Levchenko http://agile.in.ua/
 */

/**
 * A DelayedCall allows you to execute a method after a certain time has passed. It can be added to an AnimationManager.
 * In most cases, you do not have to use this class directly; the AnimationManager class contains a method to delay
 * calls directly.
 *
 * DelayedCall dispatches an Event of type 'PIXI.AnimationManager.EVENT_REMOVE_FROM_ANIMATIONMANAGER' when it is
 * finished, so that the AnimationManager automatically removes it when its no longer needed.
 *
 * @class DelayedCall
 * @constructor
 */
PIXI.DelayedCall = function(fn, delay) {
    PIXI.EventTarget.call(this);
    this.reset(fn, delay);
};

/**
 * Resets the delayed call to its default values, which is useful for pooling.
 *
 * @method reset
 * @param fn {Object} function to call,
 * @param delay {Number} delay, after which function should be executed.
 */
PIXI.DelayedCall.prototype.reset = function(fn, delay) {
    this._currentTime = 0;
    this._totalTime = Math.max(delay, 1);
    this._call = fn;

    /**
     * The number of times the call will be repeated. Set to '0' to repeat indefinitely.
     *
     * @property repeatCount
     * @type Number
     * @default 1
     */
    this.repeatCount = 1;

    return this;
};

PIXI.DelayedCall.prototype.advanceTime = function(time) {
    var previousTime = this._currentTime;
    this._currentTime = Math.min(this._totalTime, this._currentTime + time);

    if(previousTime < this._totalTime && this._currentTime >= this._totalTime) {
        if(this.repeatCount === 0 || this.repeatCount > 1) {
            this._call();
            if(this.repeatCount > 0) this.repeatCount -= 1;
            this._currentTime = 0;
            this.advanceTime((previousTime + time) - this._totalTime);
        } else {
            // save call: they might be changed through an event listener
            var _call = this._call;

            // in the callback, people might want to call "reset" and re-add it to the
            // animationManager; so this event has to be dispatched *before* executing 'call'.
            this.dispatchEvent( { type: PIXI.AnimationManager.EVENT_REMOVE_FROM_ANIMATIONMANAGER } );
            _call();
        }
    }
};

/**
 * Indicates if enough time has passed, and the call has already been executed.
 *
 * @property isComplete
 * @type Boolean
 */
Object.defineProperty(PIXI.DelayedCall.prototype, "isComplete", {
    get: function() {
        return this._currentTime >= this._totalTime && this.repeatCount === 1;
    }
});

/**
 * The time for which calls will be delayed (in millis).
 *
 * @property currentTime
 * @type Number
 */
Object.defineProperty(PIXI.DelayedCall.prototype, "currentTime", {
    get: function() { return this._currentTime; }
});

/**
 * The time that has already passed (in millis).
 *
 * @property totalTime
 * @type Number
 */
Object.defineProperty(PIXI.DelayedCall.prototype, "totalTime", {
    get: function() { return this._totalTime; }
});

PIXI.DelayedCall._animationPool = [];

PIXI.DelayedCall.fromPool = function(fn, delay) {
    if(this._animationPool.length > 0) return this._animationPool.pop().reset(fn, delay);
    return new PIXI.DelayedCall(fn, delay);
};

PIXI.DelayedCall.toPool = function(dc) {
    dc._call = null;
    dc.removeAllEventListeners();
    this._animationPool.push(dc);
};
