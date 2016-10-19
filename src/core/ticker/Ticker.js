import { TARGET_FPMS } from '../const';
import EventEmitter from 'eventemitter3';

// Internal event used by composed emitter
const TICK = 'tick';

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
export default class Ticker
{
    /**
     *
     */
    constructor()
    {
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
         * This is the maximum allowed milliseconds between updates.
         * @private
         */
        this._maxElapsedMS = 100;

        /**
         * Whether or not this ticker should invoke the method
         * {@link PIXI.ticker.Ticker#start} automatically
         * when a listener is added.
         *
         * @member {boolean}
         * @default false
         */
        this.autoStart = false;

        /**
         * Scalar time value from last frame to this frame.
         * This value is capped by setting {@link PIXI.ticker.Ticker#minFPS}
         * and is scaled with {@link PIXI.ticker.Ticker#speed}.
         * **Note:** The cap may be exceeded by scaling.
         *
         * @member {number}
         * @default 1
         */
        this.deltaTime = 1;

        /**
         * Time elapsed in milliseconds from last frame to this frame.
         * Opposed to what the scalar {@link PIXI.ticker.Ticker#deltaTime}
         * is based, this value is neither capped nor scaled.
         * If the platform supports DOMHighResTimeStamp,
         * this value will have a precision of 1 µs.
         *
         * @member {number}
         * @default 1 / TARGET_FPMS
         */
        this.elapsedMS = 1 / TARGET_FPMS; // default to target frame time

        /**
         * The last time {@link PIXI.ticker.Ticker#update} was invoked.
         * This value is also reset internally outside of invoking
         * update, but only when a new animation frame is requested.
         * If the platform supports DOMHighResTimeStamp,
         * this value will have a precision of 1 µs.
         *
         * @member {number}
         * @default 0
         */
        this.lastTime = 0;

        /**
         * Factor of current {@link PIXI.ticker.Ticker#deltaTime}.
         * @example
         * // Scales ticker.deltaTime to what would be
         * // the equivalent of approximately 120 FPS
         * ticker.speed = 2;
         *
         * @member {number}
         * @default 1
         */
        this.speed = 1;

        /**
         * Whether or not this ticker has been started.
         * `true` if {@link PIXI.ticker.Ticker#start} has been called.
         * `false` if {@link PIXI.ticker.Ticker#stop} has been called.
         * While `false`, this value may change to `true` in the
         * event of {@link PIXI.ticker.Ticker#autoStart} being `true`
         * and a listener is added.
         *
         * @member {boolean}
         * @default false
         */
        this.started = false;

        /**
         * Internal tick method bound to ticker instance.
         * This is because in early 2015, Function.bind
         * is still 60% slower in high performance scenarios.
         * Also separating frame requests from update method
         * so listeners may be called at any time and with
         * any animation API, just invoke ticker.update(time).
         *
         * @private
         * @param {number} time - Time since last tick.
         */
        this._tick = (time) =>
        {
            this._requestId = null;

            if (this.started)
            {
                // Invoke listeners now
                this.update(time);
                // Listener side effects may have modified ticker state.
                if (this.started && this._requestId === null && this._emitter.listeners(TICK, true))
                {
                    this._requestId = requestAnimationFrame(this._tick);
                }
            }
        };
    }

    /**
     * Conditionally requests a new animation frame.
     * If a frame has not already been requested, and if the internal
     * emitter has listeners, a new frame is requested.
     *
     * @private
     */
    _requestIfNeeded()
    {
        if (this._requestId === null && this._emitter.listeners(TICK, true))
        {
            // ensure callbacks get correct delta
            this.lastTime = performance.now();
            this._requestId = requestAnimationFrame(this._tick);
        }
    }

    /**
     * Conditionally cancels a pending animation frame.
     *
     * @private
     */
    _cancelIfNeeded()
    {
        if (this._requestId !== null)
        {
            cancelAnimationFrame(this._requestId);
            this._requestId = null;
        }
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
    _startIfPossible()
    {
        if (this.started)
        {
            this._requestIfNeeded();
        }
        else if (this.autoStart)
        {
            this.start();
        }
    }

    /**
     * Calls {@link module:eventemitter3.EventEmitter#on} internally for the
     * internal 'tick' event. It checks if the emitter has listeners,
     * and if so it requests a new animation frame at this point.
     *
     * @param {Function} fn - The listener function to be added for updates
     * @param {Function} [context] - The listener context
     * @returns {PIXI.ticker.Ticker} This instance of a ticker
     */
    add(fn, context)
    {
        this._emitter.on(TICK, fn, context);

        this._startIfPossible();

        return this;
    }

    /**
     * Calls {@link module:eventemitter3.EventEmitter#once} internally for the
     * internal 'tick' event. It checks if the emitter has listeners,
     * and if so it requests a new animation frame at this point.
     *
     * @param {Function} fn - The listener function to be added for one update
     * @param {Function} [context] - The listener context
     * @returns {PIXI.ticker.Ticker} This instance of a ticker
     */
    addOnce(fn, context)
    {
        this._emitter.once(TICK, fn, context);

        this._startIfPossible();

        return this;
    }

    /**
     * Calls {@link module:eventemitter3.EventEmitter#off} internally for 'tick' event.
     * It checks if the emitter has listeners for 'tick' event.
     * If it does, then it cancels the animation frame.
     *
     * @param {Function} [fn] - The listener function to be removed
     * @param {Function} [context] - The listener context to be removed
     * @returns {PIXI.ticker.Ticker} This instance of a ticker
     */
    remove(fn, context)
    {
        this._emitter.off(TICK, fn, context);

        if (!this._emitter.listeners(TICK, true))
        {
            this._cancelIfNeeded();
        }

        return this;
    }

    /**
     * Starts the ticker. If the ticker has listeners
     * a new animation frame is requested at this point.
     */
    start()
    {
        if (!this.started)
        {
            this.started = true;
            this._requestIfNeeded();
        }
    }

    /**
     * Stops the ticker. If the ticker has requested
     * an animation frame it is canceled at this point.
     */
    stop()
    {
        if (this.started)
        {
            this.started = false;
            this._cancelIfNeeded();
        }
    }

    /**
     * Triggers an update. An update entails setting the
     * current {@link PIXI.ticker.Ticker#elapsedMS},
     * the current {@link PIXI.ticker.Ticker#deltaTime},
     * invoking all listeners with current deltaTime,
     * and then finally setting {@link PIXI.ticker.Ticker#lastTime}
     * with the value of currentTime that was provided.
     * This method will be called automatically by animation
     * frame callbacks if the ticker instance has been started
     * and listeners are added.
     *
     * @param {number} [currentTime=performance.now()] - the current time of execution
     */
    update(currentTime = performance.now())
    {
        let elapsedMS;

        // If the difference in time is zero or negative, we ignore most of the work done here.
        // If there is no valid difference, then should be no reason to let anyone know about it.
        // A zero delta, is exactly that, nothing should update.
        //
        // The difference in time can be negative, and no this does not mean time traveling.
        // This can be the result of a race condition between when an animation frame is requested
        // on the current JavaScript engine event loop, and when the ticker's start method is invoked
        // (which invokes the internal _requestIfNeeded method). If a frame is requested before
        // _requestIfNeeded is invoked, then the callback for the animation frame the ticker requests,
        // can receive a time argument that can be less than the lastTime value that was set within
        // _requestIfNeeded. This difference is in microseconds, but this is enough to cause problems.
        //
        // This check covers this browser engine timing issue, as well as if consumers pass an invalid
        // currentTime value. This may happen if consumers opt-out of the autoStart, and update themselves.

        if (currentTime > this.lastTime)
        {
            // Save uncapped elapsedMS for measurement
            elapsedMS = this.elapsedMS = currentTime - this.lastTime;

            // cap the milliseconds elapsed used for deltaTime
            if (elapsedMS > this._maxElapsedMS)
            {
                elapsedMS = this._maxElapsedMS;
            }

            this.deltaTime = elapsedMS * TARGET_FPMS * this.speed;

            // Invoke listeners added to internal emitter
            this._emitter.emit(TICK, this.deltaTime);
        }
        else
        {
            this.deltaTime = this.elapsedMS = 0;
        }

        this.lastTime = currentTime;
    }

    /**
     * The frames per second at which this ticker is running.
     * The default is approximately 60 in most modern browsers.
     * **Note:** This does not factor in the value of
     * {@link PIXI.ticker.Ticker#speed}, which is specific
     * to scaling {@link PIXI.ticker.Ticker#deltaTime}.
     *
     * @memberof PIXI.ticker.Ticker#
     * @readonly
     */
    get FPS()
    {
        return 1000 / this.elapsedMS;
    }

    /**
     * Manages the maximum amount of milliseconds allowed to
     * elapse between invoking {@link PIXI.ticker.Ticker#update}.
     * This value is used to cap {@link PIXI.ticker.Ticker#deltaTime},
     * but does not effect the measured value of {@link PIXI.ticker.Ticker#FPS}.
     * When setting this property it is clamped to a value between
     * `0` and `PIXI.TARGET_FPMS * 1000`.
     *
     * @memberof PIXI.ticker.Ticker#
     * @default 10
     */
    get minFPS()
    {
        return 1000 / this._maxElapsedMS;
    }

    /**
     * Sets the min fps.
     *
     * @param {number} fps - value to set.
     */
    set minFPS(fps)
    {
        // Clamp: 0 to TARGET_FPMS
        const minFPMS = Math.min(Math.max(0, fps) / 1000, TARGET_FPMS);

        this._maxElapsedMS = 1 / minFPMS;
    }
}
