import * as core from '../core';
import CountLimiter from './limiters/CountLimiter';
const SharedTicker = core.ticker.shared;

/**
 * Default number of uploads per frame using prepare plugin.
 *
 * @static
 * @memberof PIXI.settings
 * @name UPLOADS_PER_FRAME
 * @type {number}
 * @default 4
 */
core.settings.UPLOADS_PER_FRAME = 4;

/**
 * The prepare manager provides functionality to upload content to the GPU. BasePrepare handles
 * basic queuing functionality and is extended by {@link PIXI.prepare.WebGLPrepare} and {@link PIXI.prepare.CanvasPrepare}
 * to provide preparation capabilities specific to their respective renderers.
 *
 * @example
 * // Create a sprite
 * const sprite = new PIXI.Sprite.fromImage('something.png');
 *
 * // Load object into GPU
 * app.renderer.plugins.prepare.upload(sprite, () => {
 *
 *     //Texture(s) has been uploaded to GPU
 *     app.stage.addChild(sprite);
 *
 * })
 *
 * @abstract
 * @class
 * @memberof PIXI.prepare
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
        this.limiter = new CountLimiter(core.settings.UPLOADS_PER_FRAME);

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

        /**
         * 'bound' call for prepareItems().
         * @type {Function}
         * @private
         */
        this.delayedTick = () =>
        {
            // unlikely, but in case we were destroyed between tick() and delayedTick()
            if (!this.queue)
            {
                return;
            }
            this.prepareItems();
        };

        // hooks to find the correct texture
        this.registerFindHook(findText);
        this.registerFindHook(findTextStyle);
        this.registerFindHook(findMultipleBaseTextures);
        this.registerFindHook(findBaseTexture);
        this.registerFindHook(findTexture);

        // upload hooks
        this.registerUploadHook(drawText);
        this.registerUploadHook(calculateTextStyle);
    }

    /**
     * Upload all the textures and graphics to the GPU.
     *
     * @param {Function|PIXI.DisplayObject|PIXI.Container|PIXI.BaseTexture|PIXI.Texture|PIXI.Graphics|PIXI.Text} item -
     *        Either the container or display object to search for items to upload, the items to upload themselves,
     *        or the callback function, if items have been added using `prepare.add`.
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
                SharedTicker.addOnce(this.tick, this, core.UPDATE_PRIORITY.UTILITY);
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
        setTimeout(this.delayedTick, 0);
    }

    /**
     * Actually prepare items. This is handled outside of the tick because it will take a while
     * and we do NOT want to block the current animation frame from rendering.
     *
     * @private
     */
    prepareItems()
    {
        this.limiter.beginFrame();
        // Upload the graphics
        while (this.queue.length && this.limiter.allowedToUpload())
        {
            const item = this.queue[0];
            let uploaded = false;

            if (item && !item._destroyed)
            {
                for (let i = 0, len = this.uploadHooks.length; i < len; i++)
                {
                    if (this.uploadHooks[i](this.uploadHookHelper, item))
                    {
                        this.queue.shift();
                        uploaded = true;
                        break;
                    }
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

            const completes = this.completes.slice(0);

            this.completes.length = 0;

            for (let i = 0, len = completes.length; i < len; i++)
            {
                completes[i]();
            }
        }
        else
        {
            // if we are not finished, on the next rAF do this again
            SharedTicker.addOnce(this.tick, this, core.UPDATE_PRIORITY.UTILITY);
        }
    }

    /**
     * Adds hooks for finding items.
     *
     * @param {Function} addHook - Function call that takes two parameters: `item:*, queue:Array`
     *          function must return `true` if it was able to add item to the queue.
     * @return {PIXI.BasePrepare} Instance of plugin for chaining.
     */
    registerFindHook(addHook)
    {
        if (addHook)
        {
            this.addHooks.push(addHook);
        }

        return this;
    }

    /**
     * Adds hooks for uploading items.
     *
     * @param {Function} uploadHook - Function call that takes two parameters: `prepare:CanvasPrepare, item:*` and
     *          function must return `true` if it was able to handle upload of item.
     * @return {PIXI.BasePrepare} Instance of plugin for chaining.
     */
    registerUploadHook(uploadHook)
    {
        if (uploadHook)
        {
            this.uploadHooks.push(uploadHook);
        }

        return this;
    }

    /**
     * Manually add an item to the uploading queue.
     *
     * @param {PIXI.DisplayObject|PIXI.Container|PIXI.BaseTexture|PIXI.Texture|PIXI.Graphics|PIXI.Text|*} item - Object to
     *        add to the queue
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

/**
 * Built-in hook to find multiple textures from objects like AnimatedSprites.
 *
 * @private
 * @param {PIXI.DisplayObject} item - Display object to check
 * @param {Array<*>} queue - Collection of items to upload
 * @return {boolean} if a PIXI.Texture object was found.
 */
function findMultipleBaseTextures(item, queue)
{
    let result = false;

    // Objects with mutliple textures
    if (item && item._textures && item._textures.length)
    {
        for (let i = 0; i < item._textures.length; i++)
        {
            if (item._textures[i] instanceof core.Texture)
            {
                const baseTexture = item._textures[i].baseTexture;

                if (queue.indexOf(baseTexture) === -1)
                {
                    queue.push(baseTexture);
                    result = true;
                }
            }
        }
    }

    return result;
}

/**
 * Built-in hook to find BaseTextures from Sprites.
 *
 * @private
 * @param {PIXI.DisplayObject} item - Display object to check
 * @param {Array<*>} queue - Collection of items to upload
 * @return {boolean} if a PIXI.Texture object was found.
 */
function findBaseTexture(item, queue)
{
    // Objects with textures, like Sprites/Text
    if (item instanceof core.BaseTexture)
    {
        if (queue.indexOf(item) === -1)
        {
            queue.push(item);
        }

        return true;
    }

    return false;
}

/**
 * Built-in hook to find textures from objects.
 *
 * @private
 * @param {PIXI.DisplayObject} item - Display object to check
 * @param {Array<*>} queue - Collection of items to upload
 * @return {boolean} if a PIXI.Texture object was found.
 */
function findTexture(item, queue)
{
    if (item._texture && item._texture instanceof core.Texture)
    {
        const texture = item._texture.baseTexture;

        if (queue.indexOf(texture) === -1)
        {
            queue.push(texture);
        }

        return true;
    }

    return false;
}

/**
 * Built-in hook to draw PIXI.Text to its texture.
 *
 * @private
 * @param {PIXI.WebGLRenderer|PIXI.CanvasPrepare} helper - Not used by this upload handler
 * @param {PIXI.DisplayObject} item - Item to check
 * @return {boolean} If item was uploaded.
 */
function drawText(helper, item)
{
    if (item instanceof core.Text)
    {
        // updating text will return early if it is not dirty
        item.updateText(true);

        return true;
    }

    return false;
}

/**
 * Built-in hook to calculate a text style for a PIXI.Text object.
 *
 * @private
 * @param {PIXI.WebGLRenderer|PIXI.CanvasPrepare} helper - Not used by this upload handler
 * @param {PIXI.DisplayObject} item - Item to check
 * @return {boolean} If item was uploaded.
 */
function calculateTextStyle(helper, item)
{
    if (item instanceof core.TextStyle)
    {
        const font = core.Text.getFontStyle(item);

        if (!core.Text.fontPropertiesCache[font])
        {
            core.Text.calculateFontProperties(font);
        }

        return true;
    }

    return false;
}

/**
 * Built-in hook to find Text objects.
 *
 * @private
 * @param {PIXI.DisplayObject} item - Display object to check
 * @param {Array<*>} queue - Collection of items to upload
 * @return {boolean} if a PIXI.Text object was found.
 */
function findText(item, queue)
{
    if (item instanceof core.Text)
    {
        // push the text style to prepare it - this can be really expensive
        if (queue.indexOf(item.style) === -1)
        {
            queue.push(item.style);
        }
        // also push the text object so that we can render it (to canvas/texture) if needed
        if (queue.indexOf(item) === -1)
        {
            queue.push(item);
        }
        // also push the Text's texture for upload to GPU
        const texture = item._texture.baseTexture;

        if (queue.indexOf(texture) === -1)
        {
            queue.push(texture);
        }

        return true;
    }

    return false;
}

/**
 * Built-in hook to find TextStyle objects.
 *
 * @private
 * @param {PIXI.TextStyle} item - Display object to check
 * @param {Array<*>} queue - Collection of items to upload
 * @return {boolean} if a PIXI.TextStyle object was found.
 */
function findTextStyle(item, queue)
{
    if (item instanceof core.TextStyle)
    {
        if (queue.indexOf(item) === -1)
        {
            queue.push(item);
        }

        return true;
    }

    return false;
}
