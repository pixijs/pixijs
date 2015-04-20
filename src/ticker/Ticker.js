var core = require('../core'),
    EventEmitter = require('eventemitter3').EventEmitter,
    // Internal event used by composed emitter
    TICK = 'tick';

/**
 * Yes, this is accessing an internal module:eventemitter3 api.
 * Ugly, but calling module:eventemitter3.EventEmitter#listeners
 * does a bit too much for what this is for.
 * This is simple enough to keep track of and contribute
 * back to the eventemitter3 project in the near future.
 *
 * @private
 */
function hasListeners(emitter)
{
    return !!(emitter._events && emitter._events[TICK]);
}

/**
 * A Ticker class that runs an update loop that other objects listen to.
 * This class is composed around an EventEmitter object to add listeners
 * meant for execution on the next requested animation frame.
 * Animation frames are requested only when necessary,
 * e.g. When the ticker is started and the emitter has listeners.
 *
 * @class
 * @memberof PIXI.ticker
 */
function Ticker()
{
    var _this = this;
    /**
     * Internal tick method bound to ticker instance.
     * This is because in early 2015, Function.bind
     * is still 60% slower in high performance scenarios.
     * Also separating frame requests from update method
     * so listeners may be called at any time and with
     * any animation API, just invoke ticker.update(time).
     *
     * @private
     */
    this._tick = function _tick(time) {

        _this._requestId = null;

        if (_this.started)
        {
            _this.update(time);
        }
        // Check here because listeners could have side effects
        // and may have modified state during frame execution.
        // A new frame may have been requested or listeners removed.
        if (_this.started && _this._requestId === null && hasListeners(_this._emitter))
        {
            _this._requestId = requestAnimationFrame(_this._tick);
        }
    };
    /**
     * Internal emitter used to fire 'tick' event
     * @private
     */
    this._emitter = new EventEmitter();
    /**
     * Internal current frame request ID
     * @private
     */
    this._requestId = null;
    /**
     * Internal value managed by minFPS property setter and getter.
     * This is the maximum allowed millseconds between updates.
     * @private
     */
    this._maxElapsedMS = 100;

    /**
     * Whether or not this ticker should
     * start automatically when a listener is added.
     *
     * @member {boolean}
     */
    this.autoStart = false;

    /**
     * The current percentage of the
     * target FPS with speed factored in.
     *
     * @member {number}
     */
    this.deltaTime = 1;

    /**
     * The time elapsed in milliseconds
     * from current frame since the last frame.
     *
     * @member {number}
     */
    this.elapsedMS = 0;

    /**
     * The last time {@link PIXI.ticker.Ticker#update}
     * was invoked by animation frame callback or manually.
     *
     * @member {number}
     */
    this.lastTime = 0;

    /**
     * Factor of current FPS.
     * @example
     *     ticker.speed = 2; // Approximately 120 FPS, or 0.12 FPMS.
     *
     * @member {number}
     */
    this.speed = 1;

    /**
     * Whether or not this ticker has been started.
     * `true` if {@link PIXI.ticker.Ticker.start} has been called.
     * `false` if {@link PIXI.ticker.Ticker.stop} has been called.
     *
     * @member {boolean}
     */
    this.started = false;
}

Object.defineProperties(Ticker.prototype, {
    /**
     * Gets the frames per second for which this
     * ticker is running. The default is appoximately
     * 60 FPS in modern browsers, but may vary.
     * This also factors in the property value of
     * {@link PIXI.ticker.Ticker#speed}.
     *
     * @member
     * @memberof PIXI.ticker.Ticker#
     * @readonly
     */
    FPS: {
        get: function()
        {
            return core.TARGET_FPMS * 1000 * this.deltaTime;
        }
    },

    /**
     * This property manages the maximum amount
     * of time allowed to elapse between ticks,
     * or calls to {@link PIXI.ticker.Ticker#update}.
     *
     * @member
     * @memberof PIXI.ticker.Ticker#
     * @default 10
     */
    minFPS: {
        get: function()
        {
            return 1000 / this._maxElapsedMS;
        },
        set: function(fps)
        {
            // Clamp: 0 to TARGET_FPMS
            var minFPMS = Math.min(Math.max(0, fps) / 1000, core.TARGET_FPMS);
            this._maxElapsedMS = 1 / minFPMS;
        }
    }
});

/**
 * Conditionally requests a new animation frame.
 * If a frame has not already been requested, and if the internal
 * emitter has listeners, a new frame is requested.
 *
 * @private
 */
Ticker.prototype._requestIfNeeded = function _requestIfNeeded()
{
    if (this._requestId === null && hasListeners(this._emitter))
    {
        // ensure callbacks get correct delta
        this.lastTime = performance.now();
        this._requestId = requestAnimationFrame(this._tick);
    }
};

/**
 * Conditionally cancels a pending animation frame.
 *
 * @private
 */
Ticker.prototype._cancelIfNeeded = function _cancelIfNeeded()
{
    if (this._requestId !== null)
    {
        cancelAnimationFrame(this._requestId);
        this._requestId = null;
    }
};

/**
 * Conditionally requests a new animation frame.
 * If the ticker has been started it checks if a frame has not already
 * been requested, and if the internal emitter has listeners. If these
 * conditions are met, a new frame is requested. If the ticker has not
 * been started, but autoStart is `true`, then the ticker starts now,
 * and continues with the previous conditions to request a new frame.
 *
 * @private
 */
Ticker.prototype._startIfPossible = function _startIfPossible()
{
    if (this.started)
    {
        this._requestIfNeeded();
    }
    else if (this.autoStart)
    {
        this.start();
    }
};

/**
 * Calls {@link module:eventemitter3.EventEmitter#on} internally for the
 * internal 'tick' event. It checks if the emitter has listeners,
 * and if so it requests a new animation frame at this point.
 *
 * @returns {PIXI.ticker.Ticker} this
 */
Ticker.prototype.add = function add(fn, context)
{
    this._emitter.on(TICK, fn, context);

    this._startIfPossible();

    return this;
};

/**
 * Calls {@link module:eventemitter3.EventEmitter#once} internally for the
 * internal 'tick' event. It checks if the emitter has listeners,
 * and if so it requests a new animation frame at this point.
 *
 * @returns {PIXI.ticker.Ticker} this
 */
Ticker.prototype.addOnce = function addOnce(fn, context)
{
    this._emitter.once(TICK, fn, context);

    this._startIfPossible();

    return this;
};

/**
 * Calls {@link module:eventemitter3.EventEmitter#off} internally for 'tick' event.
 * It checks if the emitter has listeners for 'tick' event.
 * If it does, then it cancels the animation frame.
 *
 * @returns {PIXI.ticker.Ticker} this
 */
Ticker.prototype.remove = function remove(fn, once)
{
    this._emitter.off(TICK, fn, once);

    if (!hasListeners(this._emitter))
    {
        this._cancelIfNeeded();
    }

    return this;
};

/**
 * Starts the ticker. If the ticker has listeners
 * a new animation frame is requested at this point.
 */
Ticker.prototype.start = function start()
{
    if (!this.started)
    {
        this.started = true;
        this._requestIfNeeded();
    }
};

/**
 * Stops the ticker. If the ticker has requested
 * an animation frame it is canceled at this point.
 */
Ticker.prototype.stop = function stop()
{
    if (this.started)
    {
        this.started = false;
        this._cancelIfNeeded();
    }
};

/**
 * Triggers an update, setting deltaTime, lastTime, and
 * firing the internal 'tick' event invoking all listeners.
 *
 * @param [currentTime=performance.now()] {number} the current time of execution
 */
Ticker.prototype.update = function update(currentTime)
{
    // Allow calling update directly with default currentTime.
    currentTime = currentTime || performance.now();
    this.elapsedMS = currentTime - this.lastTime;

    // cap the milliseconds elapsed
    if (this.elapsedMS > this._maxElapsedMS)
    {
        this.elapsedMS = this._maxElapsedMS;
    }

    this.deltaTime = (this.elapsedMS * core.TARGET_FPMS);
    // Factor in speed
    this.deltaTime *= this.speed;

    // Invoke listeners added to internal emitter
    this._emitter.emit(TICK, this.deltaTime);

    this.lastTime = currentTime;
};

module.exports = Ticker;
