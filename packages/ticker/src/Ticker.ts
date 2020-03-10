import { settings } from './settings';
import { UPDATE_PRIORITY } from './const';
import { TickerListener } from './TickerListener';

export type TickerCallback<T> = (this: T, dt: number) => any;

/**
 * A Ticker class that runs an update loop that other objects listen to.
 *
 * This class is composed around listeners meant for execution on the next requested animation frame.
 * Animation frames are requested only when necessary, e.g. When the ticker is started and the emitter has listeners.
 *
 * @class
 * @memberof PIXI
 */
export class Ticker
{
    static _shared: Ticker;
    static _system: Ticker;

    public autoStart: boolean;
    public deltaTime: number;
    public deltaMS: number;
    public elapsedMS: number;
    public lastTime: number;
    public speed: number;
    public started: boolean;

    private _head: TickerListener;
    private _requestId: number;
    private _maxElapsedMS: number;
    private _minElapsedMS: number;
    private _protected: boolean;
    private _lastFrame: number;
    private _tick: (time: number) => any;

    constructor()
    {
        /**
         * The first listener. All new listeners added are chained on this.
         * @private
         * @type {TickerListener}
         */
        this._head = new TickerListener(null, null, Infinity);

        /**
         * Internal current frame request ID
         * @type {?number}
         * @private
         */
        this._requestId = null;

        /**
         * Internal value managed by minFPS property setter and getter.
         * This is the maximum allowed milliseconds between updates.
         * @type {number}
         * @private
         */
        this._maxElapsedMS = 100;

        /**
         * Internal value managed by maxFPS property setter and getter.
         * This is the minimum allowed milliseconds between updates.
         * @type {number}
         * @private
         */
        this._minElapsedMS = 0;

        /**
         * Whether or not this ticker should invoke the method
         * {@link PIXI.Ticker#start} automatically
         * when a listener is added.
         *
         * @member {boolean}
         * @default false
         */
        this.autoStart = false;

        /**
         * Scalar time value from last frame to this frame.
         * This value is capped by setting {@link PIXI.Ticker#minFPS}
         * and is scaled with {@link PIXI.Ticker#speed}.
         * **Note:** The cap may be exceeded by scaling.
         *
         * @member {number}
         * @default 1
         */
        this.deltaTime = 1;

        /**
         * Scaler time elapsed in milliseconds from last frame to this frame.
         * This value is capped by setting {@link PIXI.Ticker#minFPS}
         * and is scaled with {@link PIXI.Ticker#speed}.
         * **Note:** The cap may be exceeded by scaling.
         * If the platform supports DOMHighResTimeStamp,
         * this value will have a precision of 1 µs.
         * Defaults to target frame time
         *
         * @member {number}
         * @default 16.66
         */
        this.deltaMS = 1 / settings.TARGET_FPMS;

        /**
         * Time elapsed in milliseconds from last frame to this frame.
         * Opposed to what the scalar {@link PIXI.Ticker#deltaTime}
         * is based, this value is neither capped nor scaled.
         * If the platform supports DOMHighResTimeStamp,
         * this value will have a precision of 1 µs.
         * Defaults to target frame time
         *
         * @member {number}
         * @default 16.66
         */
        this.elapsedMS = 1 / settings.TARGET_FPMS;

        /**
         * The last time {@link PIXI.Ticker#update} was invoked.
         * This value is also reset internally outside of invoking
         * update, but only when a new animation frame is requested.
         * If the platform supports DOMHighResTimeStamp,
         * this value will have a precision of 1 µs.
         *
         * @member {number}
         * @default -1
         */
        this.lastTime = -1;

        /**
         * Factor of current {@link PIXI.Ticker#deltaTime}.
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
         * `true` if {@link PIXI.Ticker#start} has been called.
         * `false` if {@link PIXI.Ticker#stop} has been called.
         * While `false`, this value may change to `true` in the
         * event of {@link PIXI.Ticker#autoStart} being `true`
         * and a listener is added.
         *
         * @member {boolean}
         * @default false
         */
        this.started = false;

        /**
         * If enabled, deleting is disabled.
         * @member {boolean}
         * @default false
         * @private
         */
        this._protected = false;

        /**
         * The last time keyframe was executed.
         * Maintains a relatively fixed interval with the previous value.
         * @member {number}
         * @default -1
         * @private
         */
        this._lastFrame = -1;

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
        this._tick = (time: number): void =>
        {
            this._requestId = null;

            if (this.started)
            {
                // Invoke listeners now
                this.update(time);
                // Listener side effects may have modified ticker state.
                if (this.started && this._requestId === null && this._head.next)
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
    private _requestIfNeeded(): void
    {
        if (this._requestId === null && this._head.next)
        {
            // ensure callbacks get correct delta
            this.lastTime = performance.now();
            this._lastFrame = this.lastTime;
            this._requestId = requestAnimationFrame(this._tick);
        }
    }

    /**
     * Conditionally cancels a pending animation frame.
     *
     * @private
     */
    private _cancelIfNeeded(): void
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
    private _startIfPossible(): void
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
     * Register a handler for tick events. Calls continuously unless
     * it is removed or the ticker is stopped.
     *
     * @param {Function} fn - The listener function to be added for updates
     * @param {*} [context] - The listener context
     * @param {number} [priority=PIXI.UPDATE_PRIORITY.NORMAL] - The priority for emitting
     * @returns {PIXI.Ticker} This instance of a ticker
     */
    add<T = any>(fn: TickerCallback<T>, context: T, priority = UPDATE_PRIORITY.NORMAL): this
    {
        return this._addListener(new TickerListener(fn, context, priority));
    }

    /**
     * Add a handler for the tick event which is only execute once.
     *
     * @param {Function} fn - The listener function to be added for one update
     * @param {*} [context] - The listener context
     * @param {number} [priority=PIXI.UPDATE_PRIORITY.NORMAL] - The priority for emitting
     * @returns {PIXI.Ticker} This instance of a ticker
     */
    addOnce<T = any>(fn: TickerCallback<T>, context: T, priority = UPDATE_PRIORITY.NORMAL): this
    {
        return this._addListener(new TickerListener(fn, context, priority, true));
    }

    /**
     * Internally adds the event handler so that it can be sorted by priority.
     * Priority allows certain handler (user, AnimatedSprite, Interaction) to be run
     * before the rendering.
     *
     * @private
     * @param {TickerListener} listener - Current listener being added.
     * @returns {PIXI.Ticker} This instance of a ticker
     */
    private _addListener(listener: TickerListener): this
    {
        // For attaching to head
        let current = this._head.next;
        let previous = this._head;

        // Add the first item
        if (!current)
        {
            listener.connect(previous);
        }
        else
        {
            // Go from highest to lowest priority
            while (current)
            {
                if (listener.priority > current.priority)
                {
                    listener.connect(previous);
                    break;
                }
                previous = current;
                current = current.next;
            }

            // Not yet connected
            if (!listener.previous)
            {
                listener.connect(previous);
            }
        }

        this._startIfPossible();

        return this;
    }

    /**
     * Removes any handlers matching the function and context parameters.
     * If no handlers are left after removing, then it cancels the animation frame.
     *
     * @param {Function} fn - The listener function to be removed
     * @param {*} [context] - The listener context to be removed
     * @returns {PIXI.Ticker} This instance of a ticker
     */
    remove<T = any>(fn: TickerCallback<T>, context: T): this
    {
        let listener = this._head.next;

        while (listener)
        {
            // We found a match, lets remove it
            // no break to delete all possible matches
            // incase a listener was added 2+ times
            if (listener.match(fn, context))
            {
                listener = listener.destroy();
            }
            else
            {
                listener = listener.next;
            }
        }

        if (!this._head.next)
        {
            this._cancelIfNeeded();
        }

        return this;
    }

    /**
     * The number of listeners on this ticker, calculated by walking through linked list
     *
     * @readonly
     * @member {number}
     */
    get count(): number
    {
        if (!this._head)
        {
            return 0;
        }

        let count = 0;
        let current = this._head;

        while ((current = current.next))
        {
            count++;
        }

        return count;
    }

    /**
     * Starts the ticker. If the ticker has listeners
     * a new animation frame is requested at this point.
     */
    start(): void
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
    stop(): void
    {
        if (this.started)
        {
            this.started = false;
            this._cancelIfNeeded();
        }
    }

    /**
     * Destroy the ticker and don't use after this. Calling
     * this method removes all references to internal events.
     */
    destroy(): void
    {
        if (!this._protected)
        {
            this.stop();

            let listener = this._head.next;

            while (listener)
            {
                listener = listener.destroy(true);
            }

            this._head.destroy();
            this._head = null;
        }
    }

    /**
     * Triggers an update. An update entails setting the
     * current {@link PIXI.Ticker#elapsedMS},
     * the current {@link PIXI.Ticker#deltaTime},
     * invoking all listeners with current deltaTime,
     * and then finally setting {@link PIXI.Ticker#lastTime}
     * with the value of currentTime that was provided.
     * This method will be called automatically by animation
     * frame callbacks if the ticker instance has been started
     * and listeners are added.
     *
     * @param {number} [currentTime=performance.now()] - the current time of execution
     */
    update(currentTime = performance.now()): void
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

            elapsedMS *= this.speed;

            // If not enough time has passed, exit the function.
            // Get ready for next frame by setting _lastFrame, but based on _minElapsedMS
            // adjustment to ensure a relatively stable interval.
            if (this._minElapsedMS)
            {
                const delta = currentTime - this._lastFrame | 0;

                if (delta < this._minElapsedMS)
                {
                    return;
                }

                this._lastFrame = currentTime - (delta % this._minElapsedMS);
            }

            this.deltaMS = elapsedMS;
            this.deltaTime = this.deltaMS * settings.TARGET_FPMS;

            // Cache a local reference, in-case ticker is destroyed
            // during the emit, we can still check for head.next
            const head = this._head;

            // Invoke listeners added to internal emitter
            let listener = head.next;

            while (listener)
            {
                listener = listener.emit(this.deltaTime);
            }

            if (!head.next)
            {
                this._cancelIfNeeded();
            }
        }
        else
        {
            this.deltaTime = this.deltaMS = this.elapsedMS = 0;
        }

        this.lastTime = currentTime;
    }

    /**
     * The frames per second at which this ticker is running.
     * The default is approximately 60 in most modern browsers.
     * **Note:** This does not factor in the value of
     * {@link PIXI.Ticker#speed}, which is specific
     * to scaling {@link PIXI.Ticker#deltaTime}.
     *
     * @member {number}
     * @readonly
     */
    get FPS(): number
    {
        return 1000 / this.elapsedMS;
    }

    /**
     * Manages the maximum amount of milliseconds allowed to
     * elapse between invoking {@link PIXI.Ticker#update}.
     * This value is used to cap {@link PIXI.Ticker#deltaTime},
     * but does not effect the measured value of {@link PIXI.Ticker#FPS}.
     * When setting this property it is clamped to a value between
     * `0` and `PIXI.settings.TARGET_FPMS * 1000`.
     *
     * @member {number}
     * @default 10
     */
    get minFPS(): number
    {
        return 1000 / this._maxElapsedMS;
    }

    set minFPS(fps) // eslint-disable-line require-jsdoc
    {
        // Minimum must be below the maxFPS
        const minFPS = Math.min(this.maxFPS, fps);

        // Must be at least 0, but below 1 / settings.TARGET_FPMS
        const minFPMS = Math.min(Math.max(0, minFPS) / 1000, settings.TARGET_FPMS);

        this._maxElapsedMS = 1 / minFPMS;
    }

    /**
     * Manages the minimum amount of milliseconds required to
     * elapse between invoking {@link PIXI.Ticker#update}.
     * This will effect the measured value of {@link PIXI.Ticker#FPS}.
     * If it is set to `0`, then there is no limit; PixiJS will render as many frames as it can.
     * Otherwise it will be at least `minFPS`
     *
     * @member {number}
     * @default 0
     */
    get maxFPS(): number
    {
        if (this._minElapsedMS)
        {
            return Math.round(1000 / this._minElapsedMS);
        }

        return 0;
    }

    set maxFPS(fps)
    {
        if (fps === 0)
        {
            this._minElapsedMS = 0;
        }
        else
        {
            // Max must be at least the minFPS
            const maxFPS = Math.max(this.minFPS, fps);

            this._minElapsedMS = 1 / (maxFPS / 1000);
        }
    }

    /**
     * The shared ticker instance used by {@link PIXI.AnimatedSprite} and by
     * {@link PIXI.VideoResource} to update animation frames / video textures.
     *
     * It may also be used by {@link PIXI.Application} if created with the `sharedTicker` option property set to true.
     *
     * The property {@link PIXI.Ticker#autoStart} is set to `true` for this instance.
     * Please follow the examples for usage, including how to opt-out of auto-starting the shared ticker.
     *
     * @example
     * let ticker = PIXI.Ticker.shared;
     * // Set this to prevent starting this ticker when listeners are added.
     * // By default this is true only for the PIXI.Ticker.shared instance.
     * ticker.autoStart = false;
     * // FYI, call this to ensure the ticker is stopped. It should be stopped
     * // if you have not attempted to render anything yet.
     * ticker.stop();
     * // Call this when you are ready for a running shared ticker.
     * ticker.start();
     *
     * @example
     * // You may use the shared ticker to render...
     * let renderer = PIXI.autoDetectRenderer();
     * let stage = new PIXI.Container();
     * document.body.appendChild(renderer.view);
     * ticker.add(function (time) {
     *     renderer.render(stage);
     * });
     *
     * @example
     * // Or you can just update it manually.
     * ticker.autoStart = false;
     * ticker.stop();
     * function animate(time) {
     *     ticker.update(time);
     *     renderer.render(stage);
     *     requestAnimationFrame(animate);
     * }
     * animate(performance.now());
     *
     * @member {PIXI.Ticker}
     * @static
     */
    static get shared(): Ticker
    {
        if (!Ticker._shared)
        {
            const shared = Ticker._shared = new Ticker();

            shared.autoStart = true;
            shared._protected = true;
        }

        return Ticker._shared;
    }

    /**
     * The system ticker instance used by {@link PIXI.interaction.InteractionManager} and by
     * {@link PIXI.BasePrepare} for core timing functionality that shouldn't usually need to be paused,
     * unlike the `shared` ticker which drives visual animations and rendering which may want to be paused.
     *
     * The property {@link PIXI.Ticker#autoStart} is set to `true` for this instance.
     *
     * @member {PIXI.Ticker}
     * @static
     */
    static get system(): Ticker
    {
        if (!Ticker._system)
        {
            const system = Ticker._system = new Ticker();

            system.autoStart = true;
            system._protected = true;
        }

        return Ticker._system;
    }
}
