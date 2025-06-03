import { UPDATE_PRIORITY } from './const';
import { TickerListener } from './TickerListener';

/**
 * A callback which can be added to a ticker.
 * ```js
 * ticker.add(() => {
 *    // do something every frame
 * });
 * ```
 * @category ticker
 * @standard
 */
export type TickerCallback<T> = (this: T, ticker: Ticker) => any;

/**
 * A Ticker class that runs an update loop that other objects listen to.
 * Used for managing animation frames and timing in a PixiJS application.
 *
 * It provides a way to add listeners that will be called on each frame,
 * allowing for smooth animations and updates.
 *
 * Animation frames are requested
 * only when necessary, e.g., when the ticker is started and the emitter has listeners.
 * @example
 * ```ts
 * // Basic ticker usage
 * const ticker = new Ticker();
 * ticker.add((ticker) => {
 *     // Update every frame
 *     sprite.rotation += 0.1 * ticker.deltaTime;
 * });
 * ticker.start();
 *
 * // Control update priority
 * ticker.add(
 *     (ticker) => {
 *         // High priority updates run first
 *         physics.update(ticker.deltaTime);
 *     },
 *     undefined,
 *     UPDATE_PRIORITY.HIGH
 * );
 *
 * // One-time updates
 * ticker.addOnce(() => {
 *     console.log('Runs on next frame only');
 * });
 * ```
 * @see {@link TickerPlugin} For use with Application
 * @see {@link UPDATE_PRIORITY} For priority constants
 * @see {@link TickerCallback} For listener function type
 * @category ticker
 * @standard
 */
export class Ticker
{
    /**
     * Target frame rate in frames per millisecond.
     * Used for converting deltaTime to a scalar time delta.
     * @example
     * ```ts
     * // Default is 0.06 (60 FPS)
     * console.log(Ticker.targetFPMS); // 0.06
     *
     * // Calculate target frame duration
     * const frameDuration = 1 / Ticker.targetFPMS; // ≈ 16.67ms
     *
     * // Use in custom timing calculations
     * const deltaTime = elapsedMS * Ticker.targetFPMS;
     * ```
     * @remarks
     * - Default is 0.06 (equivalent to 60 FPS)
     * - Used in deltaTime calculations
     * - Affects all ticker instances
     * @default 0.06
     * @see {@link Ticker#deltaTime} For time scaling
     * @see {@link Ticker#FPS} For actual frame rate
     */
    public static targetFPMS = 0.06;

    /** The private shared ticker instance */
    private static _shared: Ticker;
    /** The private system ticker instance  */
    private static _system: Ticker;

    /**
     * Whether or not this ticker should invoke the method {@link Ticker#start|start}
     * automatically when a listener is added.
     * @example
     * ```ts
     * // Default behavior (manual start)
     * const ticker = new Ticker();
     * ticker.autoStart = false;
     * ticker.add(() => {
     *     // Won't run until ticker.start() is called
     * });
     *
     * // Auto-start behavior
     * const autoTicker = new Ticker();
     * autoTicker.autoStart = true;
     * autoTicker.add(() => {
     *     // Runs immediately when added
     * });
     * ```
     * @default false
     * @see {@link Ticker#start} For manually starting the ticker
     * @see {@link Ticker#stop} For manually stopping the ticker
     */
    public autoStart = false;
    /**
     * Scalar time value from last frame to this frame.
     * Used for frame-based animations and updates.
     *
     * This value is capped by setting {@link Ticker#minFPS|minFPS}
     * and is scaled with {@link Ticker#speed|speed}.
     * > [!NOTE] The cap may be exceeded by scaling.
     * @example
     * ```ts
     * // Basic animation
     * ticker.add((ticker) => {
     *     // Rotate sprite by 0.1 radians per frame, scaled by deltaTime
     *     sprite.rotation += 0.1 * ticker.deltaTime;
     * });
     * ```
     */
    public deltaTime = 1;
    /**
     * Scalar time elapsed in milliseconds from last frame to this frame.
     * Provides precise timing for animations and updates.
     *
     * This value is capped by setting {@link Ticker#minFPS|minFPS}
     * and is scaled with {@link Ticker#speed|speed}.
     *
     * If the platform supports DOMHighResTimeStamp,
     * this value will have a precision of 1 µs.
     *
     * Defaults to target frame time
     *
     * > [!NOTE] The cap may be exceeded by scaling.
     * @example
     * ```ts
     * // Animation timing
     * ticker.add((ticker) => {
     *     // Use millisecond timing for precise animations
     *     const progress = (ticker.deltaMS / animationDuration);
     *     sprite.alpha = Math.min(1, progress);
     * });
     * ```
     * @default 16.66
     */
    public deltaMS: number;
    /**
     * Time elapsed in milliseconds from last frame to this frame.
     * Provides raw timing information without modifications.
     *
     * Opposed to what the scalar {@link Ticker#deltaTime|deltaTime}
     * is based, this value is neither capped nor scaled.
     *
     * If the platform supports DOMHighResTimeStamp,
     * this value will have a precision of 1 µs.
     *
     * Defaults to target frame time
     * @example
     * ```ts
     * // Basic timing information
     * ticker.add((ticker) => {
     *     console.log(`Raw frame time: ${ticker.elapsedMS}ms`);
     * });
     * ```
     * @default 16.66
     */
    public elapsedMS: number;
    /**
     * The last time {@link Ticker#update|update} was invoked.
     * Used for calculating time deltas between frames.
     *
     * This value is also reset internally outside of invoking
     * update, but only when a new animation frame is requested.
     *
     * If the platform supports DOMHighResTimeStamp,
     * this value will have a precision of 1 µs.
     * @example
     * ```ts
     * // Basic timing check
     * ticker.add(() => {
     *     const timeSinceStart = performance.now() - ticker.lastTime;
     *     console.log(`Time running: ${timeSinceStart}ms`);
     * });
     * ```
     */
    public lastTime = -1;
    /**
     * Factor of current {@link Ticker#deltaTime|deltaTime}.
     * Used to scale time for slow motion or fast-forward effects.
     * @example
     * ```ts
     * // Basic speed adjustment
     * ticker.speed = 0.5; // Half speed (slow motion)
     * ticker.speed = 2.0; // Double speed (fast forward)
     *
     * // Temporary speed changes
     * function slowMotion() {
     *     const normalSpeed = ticker.speed;
     *     ticker.speed = 0.2;
     *     setTimeout(() => {
     *         ticker.speed = normalSpeed;
     *     }, 1000);
     * }
     * ```
     */
    public speed = 1;
    /**
     * Whether or not this ticker has been started.
     *
     * `true` if {@link Ticker#start|start} has been called.
     * `false` if {@link Ticker#stop|Stop} has been called.
     *
     * While `false`, this value may change to `true` in the
     * event of {@link Ticker#autoStart|autoStart} being `true`
     * and a listener is added.
     * @example
     * ```ts
     * // Check ticker state
     * const ticker = new Ticker();
     * console.log(ticker.started); // false
     *
     * // Start and verify
     * ticker.start();
     * console.log(ticker.started); // true
     * ```
     */
    public started = false;

    /** The first listener. All new listeners added are chained on this. */
    private _head: TickerListener;
    /** Internal current frame request ID */
    private _requestId: number = null;
    /**
     * Internal value managed by minFPS property setter and getter.
     * This is the maximum allowed milliseconds between updates.
     */
    private _maxElapsedMS = 100;
    /**
     * Internal value managed by minFPS property setter and getter.
     * This is the minimum allowed milliseconds between updates.
     */
    private _minElapsedMS = 0;
    /** If enabled, deleting is disabled.*/
    private _protected = false;
    /** The last time keyframe was executed. Maintains a relatively fixed interval with the previous value. */
    private _lastFrame = -1;
    /**
     * Internal tick method bound to ticker instance.
     * This is because in early 2015, Function.bind
     * is still 60% slower in high performance scenarios.
     * Also separating frame requests from update method
     * so listeners may be called at any time and with
     * any animation API, just invoke ticker.update(time).
     * @param time - Time since last tick.
     */
    private readonly _tick: (time: number) => any;

    constructor()
    {
        this._head = new TickerListener(null, null, Infinity);
        this.deltaMS = 1 / Ticker.targetFPMS;
        this.elapsedMS = 1 / Ticker.targetFPMS;

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

    /** Conditionally cancels a pending animation frame. */
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
     * @example
     * ```ts
     * // Basic update handler
     * ticker.add((ticker) => {
     *     // Update every frame
     *     sprite.rotation += 0.1 * ticker.deltaTime;
     * });
     *
     * // With specific context
     * const game = {
     *     update(ticker) {
     *         this.physics.update(ticker.deltaTime);
     *     }
     * };
     * ticker.add(game.update, game);
     *
     * // With priority
     * ticker.add(
     *     (ticker) => {
     *         // Runs before normal priority updates
     *         physics.update(ticker.deltaTime);
     *     },
     *     undefined,
     *     UPDATE_PRIORITY.HIGH
     * );
     * ```
     * @param fn - The listener function to be added for updates
     * @param context - The listener context
     * @param priority - The priority for emitting (default: UPDATE_PRIORITY.NORMAL)
     * @returns This instance of a ticker
     * @see {@link Ticker#addOnce} For one-time handlers
     * @see {@link Ticker#remove} For removing handlers
     */
    public add<T = any>(fn: TickerCallback<T>, context?: T, priority: number = UPDATE_PRIORITY.NORMAL): this
    {
        return this._addListener(new TickerListener(fn, context, priority));
    }

    /**
     * Add a handler for the tick event which is only executed once on the next frame.
     * @example
     * ```ts
     * // Basic one-time update
     * ticker.addOnce(() => {
     *     console.log('Runs next frame only');
     * });
     *
     * // With specific context
     * const game = {
     *     init(ticker) {
     *         this.loadResources();
     *         console.log('Game initialized');
     *     }
     * };
     * ticker.addOnce(game.init, game);
     *
     * // With priority
     * ticker.addOnce(
     *     () => {
     *         // High priority one-time setup
     *         physics.init();
     *     },
     *     undefined,
     *     UPDATE_PRIORITY.HIGH
     * );
     * ```
     * @param fn - The listener function to be added for one update
     * @param context - The listener context
     * @param priority - The priority for emitting (default: UPDATE_PRIORITY.NORMAL)
     * @returns This instance of a ticker
     * @see {@link Ticker#add} For continuous updates
     * @see {@link Ticker#remove} For removing handlers
     */
    public addOnce<T = any>(fn: TickerCallback<T>, context?: T, priority: number = UPDATE_PRIORITY.NORMAL): this
    {
        return this._addListener(new TickerListener(fn, context, priority, true));
    }

    /**
     * Internally adds the event handler so that it can be sorted by priority.
     * Priority allows certain handler (user, AnimatedSprite, Interaction) to be run
     * before the rendering.
     * @private
     * @param listener - Current listener being added.
     * @returns This instance of a ticker
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
     * @example
     * ```ts
     * // Basic removal
     * const onTick = () => {
     *     sprite.rotation += 0.1;
     * };
     * ticker.add(onTick);
     * ticker.remove(onTick);
     *
     * // Remove with context
     * const game = {
     *     update(ticker) {
     *         this.physics.update(ticker.deltaTime);
     *     }
     * };
     * ticker.add(game.update, game);
     * ticker.remove(game.update, game);
     *
     * // Remove all matching handlers
     * // (if same function was added multiple times)
     * ticker.add(onTick);
     * ticker.add(onTick);
     * ticker.remove(onTick); // Removes all instances
     * ```
     * @param fn - The listener function to be removed
     * @param context - The listener context to be removed
     * @returns This instance of a ticker
     * @see {@link Ticker#add} For adding handlers
     * @see {@link Ticker#addOnce} For one-time handlers
     */
    public remove<T = any>(fn: TickerCallback<T>, context?: T): this
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
     * The number of listeners on this ticker, calculated by walking through linked list.
     * @example
     * ```ts
     * // Check number of active listeners
     * const ticker = new Ticker();
     * console.log(ticker.count); // 0
     *
     * // Add some listeners
     * ticker.add(() => {});
     * ticker.add(() => {});
     * console.log(ticker.count); // 2
     *
     * // Check after cleanup
     * ticker.destroy();
     * console.log(ticker.count); // 0
     * ```
     * @readonly
     * @see {@link Ticker#add} For adding listeners
     * @see {@link Ticker#remove} For removing listeners
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
     * Starts the ticker. If the ticker has listeners a new animation frame is requested at this point.
     * @example
     * ```ts
     * // Basic manual start
     * const ticker = new Ticker();
     * ticker.add(() => {
     *     // Animation code here
     * });
     * ticker.start();
     * ```
     * @see {@link Ticker#stop} For stopping the ticker
     * @see {@link Ticker#autoStart} For automatic starting
     * @see {@link Ticker#started} For checking ticker state
     */
    public start(): void
    {
        if (!this.started)
        {
            this.started = true;
            this._requestIfNeeded();
        }
    }

    /**
     * Stops the ticker. If the ticker has requested an animation frame it is canceled at this point.
     * @example
     * ```ts
     * // Basic stop
     * const ticker = new Ticker();
     * ticker.stop();
     * ```
     * @see {@link Ticker#start} For starting the ticker
     * @see {@link Ticker#started} For checking ticker state
     * @see {@link Ticker#destroy} For cleaning up the ticker
     */
    public stop(): void
    {
        if (this.started)
        {
            this.started = false;
            this._cancelIfNeeded();
        }
    }

    /**
     * Destroy the ticker and don't use after this. Calling this method removes all references to internal events.
     * @example
     * ```ts
     * // Clean up with active listeners
     * const ticker = new Ticker();
     * ticker.add(() => {});
     * ticker.destroy(); // Removes all listeners
     * ```
     * @see {@link Ticker#stop} For stopping without destroying
     * @see {@link Ticker#remove} For removing specific listeners
     */
    public destroy(): void
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
     * Triggers an update.
     *
     * An update entails setting the
     * current {@link Ticker#elapsedMS|elapsedMS},
     * the current {@link Ticker#deltaTime|deltaTime},
     * invoking all listeners with current deltaTime,
     * and then finally setting {@link Ticker#lastTime|lastTime}
     * with the value of currentTime that was provided.
     *
     * This method will be called automatically by animation
     * frame callbacks if the ticker instance has been started
     * and listeners are added.
     * @example
     * ```ts
     * // Basic manual update
     * const ticker = new Ticker();
     * ticker.update(performance.now());
     * ```
     * @param currentTime - The current time of execution (defaults to performance.now())
     * @see {@link Ticker#deltaTime} For frame delta value
     * @see {@link Ticker#elapsedMS} For raw elapsed time
     */
    public update(currentTime: number = performance.now()): void
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
            this.deltaTime = this.deltaMS * Ticker.targetFPMS;

            // Cache a local reference, in-case ticker is destroyed
            // during the emit, we can still check for head.next
            const head = this._head;

            // Invoke listeners added to internal emitter
            let listener = head.next;

            while (listener)
            {
                listener = listener.emit(this);
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
     * > [!NOTE] This does not factor in the value of
     * > {@link Ticker#speed|speed}, which is specific
     * > to scaling {@link Ticker#deltaTime|deltaTime}.
     * @example
     * ```ts
     * // Basic FPS monitoring
     * ticker.add(() => {
     *     console.log(`Current FPS: ${Math.round(ticker.FPS)}`);
     * });
     * ```
     * @readonly
     */
    get FPS(): number
    {
        return 1000 / this.elapsedMS;
    }

    /**
     * Manages the maximum amount of milliseconds allowed to
     * elapse between invoking {@link Ticker#update|update}.
     *
     * This value is used to cap {@link Ticker#deltaTime|deltaTime},
     * but does not effect the measured value of {@link Ticker#FPS|FPS}.
     *
     * When setting this property it is clamped to a value between
     * `0` and `Ticker.targetFPMS * 1000`.
     * @example
     * ```ts
     * // Set minimum acceptable frame rate
     * const ticker = new Ticker();
     * ticker.minFPS = 30; // Never go below 30 FPS
     *
     * // Use with maxFPS for frame rate clamping
     * ticker.minFPS = 30;
     * ticker.maxFPS = 60;
     *
     * // Monitor delta capping
     * ticker.add(() => {
     *     // Delta time will be capped based on minFPS
     *     console.log(`Delta time: ${ticker.deltaTime}`);
     * });
     * ```
     * @default 10
     */
    get minFPS(): number
    {
        return 1000 / this._maxElapsedMS;
    }

    set minFPS(fps: number)
    {
        // Minimum must be below the maxFPS
        const minFPS = Math.min(this.maxFPS, fps);

        // Must be at least 0, but below 1 / Ticker.targetFPMS
        const minFPMS = Math.min(Math.max(0, minFPS) / 1000, Ticker.targetFPMS);

        this._maxElapsedMS = 1 / minFPMS;
    }

    /**
     * Manages the minimum amount of milliseconds required to
     * elapse between invoking {@link Ticker#update|update}.
     *
     * This will effect the measured value of {@link Ticker#FPS|FPS}.
     *
     * If it is set to `0`, then there is no limit; PixiJS will render as many frames as it can.
     * Otherwise it will be at least `minFPS`
     * @example
     * ```ts
     * // Set minimum acceptable frame rate
     * const ticker = new Ticker();
     * ticker.maxFPS = 60; // Never go above 60 FPS
     *
     * // Use with maxFPS for frame rate clamping
     * ticker.minFPS = 30;
     * ticker.maxFPS = 60;
     *
     * // Monitor delta capping
     * ticker.add(() => {
     *     // Delta time will be capped based on maxFPS
     *     console.log(`Delta time: ${ticker.deltaTime}`);
     * });
     * ```
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

    set maxFPS(fps: number)
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
     * The shared ticker instance used by {@link AnimatedSprite} and by
     * {@link VideoSource} to update animation frames / video textures.
     *
     * It may also be used by {@link Application} if created with the `sharedTicker` option property set to true.
     *
     * The property {@link Ticker#autoStart|autoStart} is set to `true` for this instance.
     * Please follow the examples for usage, including how to opt-out of auto-starting the shared ticker.
     * @example
     * import { Ticker } from 'pixi.js';
     *
     * const ticker = Ticker.shared;
     * // Set this to prevent starting this ticker when listeners are added.
     * // By default this is true only for the Ticker.shared instance.
     * ticker.autoStart = false;
     *
     * // FYI, call this to ensure the ticker is stopped. It should be stopped
     * // if you have not attempted to render anything yet.
     * ticker.stop();
     *
     * // Call this when you are ready for a running shared ticker.
     * ticker.start();
     * @example
     * import { autoDetectRenderer, Container } from 'pixi.js';
     *
     * // You may use the shared ticker to render...
     * const renderer = autoDetectRenderer();
     * const stage = new Container();
     * document.body.appendChild(renderer.view);
     * ticker.add((time) => renderer.render(stage));
     *
     * // Or you can just update it manually.
     * ticker.autoStart = false;
     * ticker.stop();
     * const animate = (time) => {
     *     ticker.update(time);
     *     renderer.render(stage);
     *     requestAnimationFrame(animate);
     * };
     * animate(performance.now());
     * @type {Ticker}
     * @readonly
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
     * The system ticker instance used by {@link PrepareBase} for core timing
     * functionality that shouldn't usually need to be paused, unlike the `shared`
     * ticker which drives visual animations and rendering which may want to be paused.
     *
     * The property {@link Ticker#autoStart|autoStart} is set to `true` for this instance.
     * @type {Ticker}
     * @readonly
     * @advanced
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
