var EventEmitter = require('eventemitter3').EventEmitter,
    performance = global.performance,
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
 * @memberof PIXI.extras
 */
function Ticker()
{
    var _this = this;
    /**
     * Internal tick method bound to ticker instance.
     * This is because in early 2015, Function.bind
     * is still 60% slower in high performance scenarios.
     *
     * @private
     */
    this._tick = function _tick(time) {
        _this.update(time);
    };
    /**
     * Internal emitter
     * @private
     */
    this._emitter = new EventEmitter();
    /**
     * Internal frame request reference
     * @private
     */
    this._rafId = null;

    /**
     * Whether or not this ticker has been started.
     * `true` if {@link PIXI.extras.Ticker.start} has been called.
     * `false` if {@link PIXI.extras.Ticker.stop} has been called.
     *
     * @member {boolean}
     */
    this.started = false;

    /**
     * Whether or not this ticker should
     * start automatically when a listener is added.
     *
     * @member {boolean}
     */
    this.autoStart = false;

    /**
     * The deltaTime
     * @todo better description
     *
     * @member {number}
     */
    this.deltaTime = 1;

    /**
     * The time at the last frame
     * @todo better description
     *
     * @member {number}
     */
    this.lastTime = 0;

    /**
     * The speed
     * @todo better description
     *
     * @member {number}
     */
    this.speed = 1;

    /**
     * The maximum time between 2 frames
     * @todo better description
     *
     * @member {number}
     */
    this.maxTimeElapsed = 100;
}

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
        if (this._rafId === null && hasListeners(this._emitter))
        {
            // ensure callbacks get correct delta
            this.lastTime = performance.now();
            this._rafId = requestAnimationFrame(this._tick);
        }
    }
    else if (this.autoStart)
    {
        this.start();
    }
};

/**
 * Conditionally cancels a pending animation frame.
 *
 * @private
 */
Ticker.prototype._cancelIfNeeded = function _cancelIfNeeded()
{
    if (this._rafId !== null)
    {
        cancelAnimationFrame(this._rafId);
        this._rafId = null;
    }
};

/**
 * Calls {@link module:eventemitter3.EventEmitter#on} internally for the
 * internal 'tick' event. It checks if the emitter has listeners,
 * and if so it requests a new animation frame at this point.
 *
 * @returns {PIXI.extras.Ticker} this
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
 * @returns {PIXI.extras.Ticker} this
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
 * @returns {PIXI.extras.Ticker} this
 */
Ticker.prototype.remove = function remove(fn, once)
{
    // remove listener(s) from internal emitter
    this._emitter.off(TICK, fn, once);

    // If there are no listeners, cancel the request.
    if (!hasListeners(this._emitter))
    {
        this._cancelIfNeeded();
    }

    return this;
};

/**
 * Starts the ticker. If the ticker has listeners
 * a new animation frame is requested at this point.
 *
 * @returns {PIXI.extras.Ticker} this
 */
Ticker.prototype.start = function start()
{
    if (!this.started)
    {
        this.started = true;
        this._startIfPossible();
    }

    return this;
};

/**
 * Stops the ticker.
 *
 * @returns {PIXI.extras.Ticker} this
 */
Ticker.prototype.stop = function stop()
{
    if (this.started)
    {
        this.started = false;
        this._cancelIfNeeded();
    }

    return this;
};

/**
 * Triggers an update, setting deltaTime, lastTime, and
 * firing the internal 'tick' event. After this, if the
 * ticker is still started and has listeners,
 * another frame is requested.
 */
Ticker.prototype.update = function update(currentTime)
{
    var timeElapsed;

    this._rafId = null;

    if (this.started)
    {
        // Allow calling tick directly getting correct currentTime
        currentTime = currentTime || performance.now();
        timeElapsed = currentTime - this.lastTime;

        // cap the time!
        // TODO: Is this there a better way to do this?
        if (timeElapsed > this.maxTimeElapsed)
        {
            timeElapsed = this.maxTimeElapsed;
        }

        // TODO: Would love to know what to name this magic number 0.6
        this.deltaTime = (timeElapsed * 0.06);
        this.deltaTime *= this.speed;

        // Invoke listeners added to internal emitter
        this._emitter.emit(TICK, this.deltaTime);

        this.lastTime = currentTime;
    }

    // Check again here because listeners could have side effects
    // and may have modified state during frame execution.
    // A new frame may have been requested or listeners removed.
    if (this.started && this._rafId === null && hasListeners(this._emitter))
    {
        this._rafId = requestAnimationFrame(this._tick);
    }
};

/**
 * The shared ticker instance used by {@link PIXI.extras.MovieClip}.
 * The property {@link PIXI.extras.Ticker#autoStart} is set to true
 * for this instance.
 *
 * @type {PIXI.extras.Ticker}
 * @memberof PIXI.extras.Ticker
 */
Ticker.sharedTicker = new Ticker();
Ticker.sharedTicker.autoStart = true;

module.exports = Ticker;
