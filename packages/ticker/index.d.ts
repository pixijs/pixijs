import type { IApplicationOptions } from '@pixi/app';

/**
 * A Ticker class that runs an update loop that other objects listen to.
 *
 * This class is composed around listeners meant for execution on the next requested animation frame.
 * Animation frames are requested only when necessary, e.g. When the ticker is started and the emitter has listeners.
 *
 * @class
 * @memberof PIXI
 */
export declare class Ticker
{
    static _shared: Ticker;
    static _system: Ticker;
    autoStart: boolean;
    deltaTime: number;
    deltaMS: number;
    elapsedMS: number;
    lastTime: number;
    speed: number;
    started: boolean;
    private _head;
    private _requestId;
    private _maxElapsedMS;
    private _minElapsedMS;
    private _protected;
    private _lastFrame;
    private _tick;
    constructor();
    /**
     * Conditionally requests a new animation frame.
     * If a frame has not already been requested, and if the internal
     * emitter has listeners, a new frame is requested.
     *
     * @private
     */
    private _requestIfNeeded;
    /**
     * Conditionally cancels a pending animation frame.
     *
     * @private
     */
    private _cancelIfNeeded;
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
    private _startIfPossible;
    /**
     * Register a handler for tick events. Calls continuously unless
     * it is removed or the ticker is stopped.
     *
     * @param {Function} fn - The listener function to be added for updates
     * @param {*} [context] - The listener context
     * @param {number} [priority=PIXI.UPDATE_PRIORITY.NORMAL] - The priority for emitting
     * @returns {PIXI.Ticker} This instance of a ticker
     */
    add<T = any>(fn: TickerCallback<T>, context: T, priority?: UPDATE_PRIORITY): this;
    /**
     * Add a handler for the tick event which is only execute once.
     *
     * @param {Function} fn - The listener function to be added for one update
     * @param {*} [context] - The listener context
     * @param {number} [priority=PIXI.UPDATE_PRIORITY.NORMAL] - The priority for emitting
     * @returns {PIXI.Ticker} This instance of a ticker
     */
    addOnce<T = any>(fn: TickerCallback<T>, context: T, priority?: UPDATE_PRIORITY): this;
    /**
     * Internally adds the event handler so that it can be sorted by priority.
     * Priority allows certain handler (user, AnimatedSprite, Interaction) to be run
     * before the rendering.
     *
     * @private
     * @param {TickerListener} listener - Current listener being added.
     * @returns {PIXI.Ticker} This instance of a ticker
     */
    private _addListener;
    /**
     * Removes any handlers matching the function and context parameters.
     * If no handlers are left after removing, then it cancels the animation frame.
     *
     * @param {Function} fn - The listener function to be removed
     * @param {*} [context] - The listener context to be removed
     * @returns {PIXI.Ticker} This instance of a ticker
     */
    remove<T = any>(fn: TickerCallback<T>, context: T): this;
    /**
     * The number of listeners on this ticker, calculated by walking through linked list
     *
     * @readonly
     * @member {number}
     */
    get count(): number;
    /**
     * Starts the ticker. If the ticker has listeners
     * a new animation frame is requested at this point.
     */
    start(): void;
    /**
     * Stops the ticker. If the ticker has requested
     * an animation frame it is canceled at this point.
     */
    stop(): void;
    /**
     * Destroy the ticker and don't use after this. Calling
     * this method removes all references to internal events.
     */
    destroy(): void;
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
    update(currentTime?: number): void;
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
    get FPS(): number;
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
    get minFPS(): number;
    set minFPS(fps: number);
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
    get maxFPS(): number;
    set maxFPS(fps: number);
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
    static get shared(): Ticker;
    /**
     * The system ticker instance used by {@link PIXI.InteractionManager} and by
     * {@link PIXI.BasePrepare} for core timing functionality that shouldn't usually need to be paused,
     * unlike the `shared` ticker which drives visual animations and rendering which may want to be paused.
     *
     * The property {@link PIXI.Ticker#autoStart} is set to `true` for this instance.
     *
     * @member {PIXI.Ticker}
     * @static
     */
    static get system(): Ticker;
}

export declare type TickerCallback<T> = (this: T, dt: number) => any;

/**
 * Middleware for for Application Ticker.
 *
 * @example
 * import {TickerPlugin} from '@pixi/ticker';
 * import {Application} from '@pixi/app';
 * Application.registerPlugin(TickerPlugin);
 *
 * @class
 * @memberof PIXI
 */
export declare class TickerPlugin
{
    static start: () => void;
    static stop: () => void;
    static _ticker: Ticker;
    static ticker: Ticker;
    /**
     * Initialize the plugin with scope of application instance
     *
     * @static
     * @private
     * @param {object} [options] - See application options
     */
    static init(options?: IApplicationOptions): void;
    /**
     * Clean up the ticker, scoped to application.
     *
     * @static
     * @private
     */
    static destroy(): void;
}

/**
 * Represents the update priorities used by internal PIXI classes when registered with
 * the {@link PIXI.Ticker} object. Higher priority items are updated first and lower
 * priority items, such as render, should go later.
 *
 * @static
 * @constant
 * @name UPDATE_PRIORITY
 * @memberof PIXI
 * @enum {number}
 * @property {number} INTERACTION=50 Highest priority, used for {@link PIXI.InteractionManager}
 * @property {number} HIGH=25 High priority updating, {@link PIXI.VideoBaseTexture} and {@link PIXI.AnimatedSprite}
 * @property {number} NORMAL=0 Default priority for ticker events, see {@link PIXI.Ticker#add}.
 * @property {number} LOW=-25 Low priority used for {@link PIXI.Application} rendering.
 * @property {number} UTILITY=-50 Lowest priority used for {@link PIXI.BasePrepare} utility.
 */
export declare enum UPDATE_PRIORITY {
    INTERACTION = 50,
    HIGH = 25,
    NORMAL = 0,
    LOW = -25,
    UTILITY = -50
}

export { };
