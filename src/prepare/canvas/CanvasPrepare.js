import * as core from '../../core';
const SharedTicker = core.ticker.shared;

const CANVAS_START_SIZE = 16;
const DEFAULT_UPLOADS_PER_FRAME = 4;

/**
 * The prepare manager provides functionality to upload content to the GPU
 * This cannot be done directly for Canvas like in WebGL, but the effect can be achieved by drawing
 * textures to an offline canvas.
 * This draw call will force the texture to be moved onto the GPU.
 *
 * @class
 * @memberof PIXI
 */
export default class CanvasPrepare
{
    /**
     * @param {PIXI.CanvasRenderer} renderer - A reference to the current renderer
     */
    constructor(renderer)
    {
        /**
         * Reference to the renderer.
         * @type {PIXI.CanvasRenderer}
         * @private
         */
        this.renderer = renderer;

        /**
        * An offline canvas to render textures to
        * @type {HTMLCanvasElement}
        * @private
        */
        this.canvas = document.createElement('canvas');
        this.canvas.width = CANVAS_START_SIZE;
        this.canvas.height = CANVAS_START_SIZE;

        /**
         * The context to the canvas
        * @type {CanvasRenderingContext2D}
        * @private
        */
        this.ctx = this.canvas.getContext('2d');

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

        // Add textures to upload
        this.register(findBaseTextures, uploadBaseTextures);
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
            this.numLeft = CanvasPrepare.UPLOADS_PER_FRAME;

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
        // Upload the graphics
        while (this.queue.length && this.numLeft > 0)
        {
            const item = this.queue[0];
            let uploaded = false;

            for (let i = 0, len = this.uploadHooks.length; i < len; i++)
            {
                if (this.uploadHooks[i](this, item))
                {
                    this.numLeft--;
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
        if (this.queue.length)
        {
            this.numLeft = CanvasPrepare.UPLOADS_PER_FRAME;
        }
        else
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
        this.ctx = null;
        this.canvas = null;
    }

}

/**
 * The number of graphics or textures to upload to the GPU.
 *
 * @static
 * @type {number}
 * @default 4
 */
CanvasPrepare.UPLOADS_PER_FRAME = DEFAULT_UPLOADS_PER_FRAME;

/**
 * Built-in hook to upload PIXI.Texture objects to the GPU.
 *
 * @private
 * @param {*} prepare - Instance of CanvasPrepare
 * @param {*} item - Item to check
 * @return {boolean} If item was uploaded.
 */
function uploadBaseTextures(prepare, item)
{
    if (item instanceof core.BaseTexture)
    {
        const image = item.source;

        // Sometimes images (like atlas images) report a size of zero, causing errors on windows phone.
        // So if the width or height is equal to zero then use the canvas size
        // Otherwise use whatever is smaller, the image dimensions or the canvas dimensions.
        const imageWidth = image.width === 0 ? prepare.canvas.width : Math.min(prepare.canvas.width, image.width);
        const imageHeight = image.height === 0 ? prepare.canvas.height : Math.min(prepare.canvas.height, image.height);

        // Only a small subsections is required to be drawn to have the whole texture uploaded to the GPU
        // A smaller draw can be faster.
        prepare.ctx.drawImage(image, 0, 0, imageWidth, imageHeight, 0, 0, prepare.canvas.width, prepare.canvas.height);

        return true;
    }

    return false;
}

/**
 * Built-in hook to find textures from Sprites.
 *
 * @private
 * @param {PIXI.DisplayObject} item  -Display object to check
 * @param {Array<*>} queue - Collection of items to upload
 * @return {boolean} if a PIXI.Texture object was found.
 */
function findBaseTextures(item, queue)
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
    else if (item._texture && item._texture instanceof core.Texture)
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

core.CanvasRenderer.registerPlugin('prepare', CanvasPrepare);
