import { Texture, BaseTexture } from '@pixi/core';
import { Ticker, UPDATE_PRIORITY } from '@pixi/ticker';
import { settings } from '@pixi/settings';
import { Container, DisplayObject } from '@pixi/display';
import { Text, TextStyle, TextMetrics } from '@pixi/text';
import { CountLimiter } from './CountLimiter';

import type { AbstractRenderer } from '@pixi/core';

interface IArrowFunction {
    (): void;
}
interface IUploadHook {
    (helper: AbstractRenderer | BasePrepare, item: IDisplayObjectExtended): boolean;
}

interface IFindHook {
    (item: any, queue: Array<any>): boolean;
}

export interface IDisplayObjectExtended extends DisplayObject {
    _textures?: Array<Texture>;
    _texture?: Texture;
    style?: TextStyle;
}

/**
 * Built-in hook to find multiple textures from objects like AnimatedSprites.
 *
 * @private
 * @param {PIXI.DisplayObject} item - Display object to check
 * @param {Array<*>} queue - Collection of items to upload
 * @return {boolean} if a PIXI.Texture object was found.
 */

function findMultipleBaseTextures(item: IDisplayObjectExtended, queue: Array<any>): boolean
{
    let result = false;

    // Objects with multiple textures
    if (item && item._textures && item._textures.length)
    {
        for (let i = 0; i < item._textures.length; i++)
        {
            if (item._textures[i] instanceof Texture)
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
 * Built-in hook to find BaseTextures from Texture.
 *
 * @private
 * @param {PIXI.Texture} item - Display object to check
 * @param {Array<*>} queue - Collection of items to upload
 * @return {boolean} if a PIXI.Texture object was found.
 */
function findBaseTexture(item: Texture, queue: Array<any>): boolean
{
    if (item.baseTexture instanceof BaseTexture)
    {
        const texture = item.baseTexture;

        if (queue.indexOf(texture) === -1)
        {
            queue.push(texture);
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
function findTexture(item: IDisplayObjectExtended, queue: Array<any>): boolean
{
    if (item._texture && item._texture instanceof Texture)
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
 * @param {PIXI.AbstractRenderer|PIXI.BasePrepare} helper - Not used by this upload handler
 * @param {PIXI.DisplayObject} item - Item to check
 * @return {boolean} If item was uploaded.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
function drawText(helper: AbstractRenderer | BasePrepare, item: IDisplayObjectExtended): boolean
{
    if (item instanceof Text)
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
 * @param {PIXI.AbstractRenderer|PIXI.BasePrepare} helper - Not used by this upload handler
 * @param {PIXI.DisplayObject} item - Item to check
 * @return {boolean} If item was uploaded.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
function calculateTextStyle(helper: AbstractRenderer | BasePrepare, item: IDisplayObjectExtended): boolean
{
    if (item instanceof TextStyle)
    {
        const font = item.toFontString();

        TextMetrics.measureFont(font);

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
function findText(item: IDisplayObjectExtended, queue: Array<any>): boolean
{
    if (item instanceof Text)
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
function findTextStyle(item: TextStyle, queue: Array<any>): boolean
{
    if (item instanceof TextStyle)
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
 * The prepare manager provides functionality to upload content to the GPU.
 *
 * BasePrepare handles basic queuing functionality and is extended by
 * {@link PIXI.Prepare} and {@link PIXI.CanvasPrepare}
 * to provide preparation capabilities specific to their respective renderers.
 *
 * @example
 * // Create a sprite
 * const sprite = PIXI.Sprite.from('something.png');
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
 * @memberof PIXI
 */
export class BasePrepare
{
    private limiter: CountLimiter;
    protected renderer: AbstractRenderer;
    protected uploadHookHelper: any;
    protected queue: Array<any>;
    public addHooks: Array<any>;
    public uploadHooks: Array<any>;
    public completes: Array<any>;
    public ticking: boolean;
    private delayedTick: IArrowFunction;
    /**
     * @param {PIXI.AbstractRenderer} renderer - A reference to the current renderer
     */
    constructor(renderer: AbstractRenderer)
    {
        /**
         * The limiter to be used to control how quickly items are prepared.
         * @type {PIXI.CountLimiter|PIXI.TimeLimiter}
         */
        this.limiter = new CountLimiter(settings.UPLOADS_PER_FRAME);

        /**
         * Reference to the renderer.
         * @type {PIXI.AbstractRenderer}
         * @protected
         */
        this.renderer = renderer;

        /**
         * The only real difference between CanvasPrepare and Prepare is what they pass
         * to upload hooks. That different parameter is stored here.
         * @type {object}
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
        this.delayedTick = (): void =>
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
    upload(item: IDisplayObjectExtended | IUploadHook | IFindHook, done: any): void
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
                Ticker.system.addOnce(this.tick, this, UPDATE_PRIORITY.UTILITY);
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
    tick(): void
    {
        setTimeout(this.delayedTick, 0);
    }

    /**
     * Actually prepare items. This is handled outside of the tick because it will take a while
     * and we do NOT want to block the current animation frame from rendering.
     *
     * @private
     */
    prepareItems(): void
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
            Ticker.system.addOnce(this.tick, this, UPDATE_PRIORITY.UTILITY);
        }
    }

    /**
     * Adds hooks for finding items.
     *
     * @param {Function} addHook - Function call that takes two parameters: `item:*, queue:Array`
     *          function must return `true` if it was able to add item to the queue.
     * @return {this} Instance of plugin for chaining.
     */
    registerFindHook(addHook: IFindHook): this
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
     * @return {this} Instance of plugin for chaining.
     */
    registerUploadHook(uploadHook: IUploadHook): this
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
     * @return {this} Instance of plugin for chaining.
     */
    add(item: IDisplayObjectExtended | IUploadHook | IFindHook): this
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

        // Get children recursively
        if (item instanceof Container)
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
    destroy(): void
    {
        if (this.ticking)
        {
            Ticker.system.remove(this.tick, this);
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
