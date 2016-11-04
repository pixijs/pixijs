import * as core from '../core';
import CountLimiter from './limiters/CountLimiter';
const SharedTicker = core.ticker.shared;

const DEFAULT_UPLOADS_PER_FRAME = 4;

/**
 * The prepare manager provides functionality to upload content to the GPU. BasePrepare handles
 * basic queuing functionality and is extended by {@link PIXI.prepare.WebGLPrepare} and {@link PIXI.prepare.CanvasPrepare}
 * to provide preparation capabilities specific to their respective renderers.
 *
 * @abstract
 * @class
 * @memberof PIXI
 */
export default class BasePrepare
{
    /**
     * @param {PIXI.SystemRenderer} renderer - A reference to the current renderer
     */
    constructor(renderer)
    {
        /**
         * The limiter to be used to control how quickly items are prepared.
         * @type {PIXI.prepare.CountLimiter|PIXI.prepare.TimeLimiter}
         */
        this.limiter = new CountLimiter(DEFAULT_UPLOADS_PER_FRAME);

        /**
         * Reference to the renderer.
         * @type {PIXI.SystemRenderer}
         * @protected
         */
        this.renderer = renderer;

        /**
         * The only real difference between CanvasPrepare and WebGLPrepare is what they pass
         * to upload hooks. That different parameter is stored here.
         * @type {PIXI.prepare.CanvasPrepare|PIXI.WebGLRenderer}
         * @protected
         */
        this.uploadHookHelper = null;

        /**
         * Collection of items to uploads at once.
         * @type {Array<*>}
         * @private
         */
        this.queue = [];

        /**
         * Collection of additional hooks for finding assets.
         * @type {Array<Function>}
         * @private
         */
        this.addHooks = [];

        /**
         * Collection of additional hooks for processing assets.
         * @type {Array<Function>}
         * @private
         */
        this.uploadHooks = [];

        /**
         * Callback to call after completed.
         * @type {Array<Function>}
         * @private
         */
        this.completes = [];

        /**
         * If prepare is ticking (running).
         * @type {boolean}
         * @private
         */
        this.ticking = false;
    }

    /**
     * Upload all the textures and graphics to the GPU.
     *
     * @param {Function|PIXI.DisplayObject|PIXI.Container} item - Either
     *        the container or display object to search for items to upload or
     *        the callback function, if items have been added using `prepare.add`.
     * @param {Function} [done] - Optional callback when all queued uploads have completed
     */
    upload(item, done)
    {
        if (typeof item === 'function')
        {
            done = item;
            item = null;
        }

        // If a display object, search for items
        // that we could upload
        if (item)
        {
            this.add(item);
        }

        // Get the items for upload from the display
        if (this.queue.length)
        {
            if (done)
            {
                this.completes.push(done);
            }

            if (!this.ticking)
            {
                this.ticking = true;
                SharedTicker.add(this.tick, this);
            }
        }
        else if (done)
        {
            done();
        }
    }

    /**
     * Handle tick update
     *
     * @private
     */
    tick()
    {
        this.limiter.beginFrame();
        // Upload the graphics
        while (this.queue.length && this.limiter.allowedToUpload())
        {
            const item = this.queue[0];
            let uploaded = false;

            for (let i = 0, len = this.uploadHooks.length; i < len; i++)
            {
                if (this.uploadHooks[i](this.uploadHookHelper, item))
                {
                    this.queue.shift();
                    uploaded = true;
                    break;
                }
            }

            if (!uploaded)
            {
                this.queue.shift();
            }
        }

        // We're finished
        if (!this.queue.length)
        {
            this.ticking = false;

            SharedTicker.remove(this.tick, this);

            const completes = this.completes.slice(0);

            this.completes.length = 0;

            for (let i = 0, len = completes.length; i < len; i++)
            {
                completes[i]();
            }
        }
    }

    /**
     * Adds hooks for finding and uploading items.
     *
     * @param {Function} [addHook] - Function call that takes two parameters: `item:*, queue:Array`
              function must return `true` if it was able to add item to the queue.
     * @param {Function} [uploadHook] - Function call that takes two parameters: `prepare:CanvasPrepare, item:*` and
     *        function must return `true` if it was able to handle upload of item.
     * @return {PIXI.CanvasPrepare} Instance of plugin for chaining.
     */
    register(addHook, uploadHook)
    {
        if (addHook)
        {
            this.addHooks.push(addHook);
        }

        if (uploadHook)
        {
            this.uploadHooks.push(uploadHook);
        }

        return this;
    }

    /**
     * Manually add an item to the uploading queue.
     *
     * @param {PIXI.DisplayObject|PIXI.Container|*} item - Object to add to the queue
     * @return {PIXI.CanvasPrepare} Instance of plugin for chaining.
     */
    add(item)
    {
        // Add additional hooks for finding elements on special
        // types of objects that
        for (let i = 0, len = this.addHooks.length; i < len; i++)
        {
            if (this.addHooks[i](item, this.queue))
            {
                break;
            }
        }

        // Get childen recursively
        if (item instanceof core.Container)
        {
            for (let i = item.children.length - 1; i >= 0; i--)
            {
                this.add(item.children[i]);
            }
        }

        return this;
    }

    /**
     * Destroys the plugin, don't use after this.
     *
     */
    destroy()
    {
        if (this.ticking)
        {
            SharedTicker.remove(this.tick, this);
        }
        this.ticking = false;
        this.addHooks = null;
        this.uploadHooks = null;
        this.renderer = null;
        this.completes = null;
        this.queue = null;
        this.limiter = null;
        this.uploadHookHelper = null;
    }

}
