var core = require('../../core'),
    SharedTicker = core.ticker.shared;

/**
 * The prepare manager provides functionality to upload content to the GPU.
 * This cannot be done directly like in WebGL, but an effect can be achieved by drawing textures to an offline canvas.
 * This draw call will force the texture to be moved onto the GPU.
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.CanvasRenderer} A reference to the current renderer
 */
function CanvasPrepare(renderer)
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
    this.canvas = document.createElement( 'canvas' );
    this.canvas.width = 16;
    this.canvas.height = 16;

    /**
     * The context to the canvas
     * @type {CanvasRenderingContext2D}
     * @private
     */
    this.ctx = this.canvas.getContext( '2d' );

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

    // Add textures and graphics to upload
    this.register(findBaseTextures, uploadBaseTextures);
}

/**
 * The number of graphics or textures to upload to the GPU
 * @property {number} UPLOADS_PER_FRAME
 * @static
 * @default 4
 */
CanvasPrepare.UPLOADS_PER_FRAME = 4;

CanvasPrepare.prototype.constructor = CanvasPrepare;
module.exports = CanvasPrepare;

/**
 * Upload all the textures and graphics to the GPU.
 * @param {Function|PIXI.DisplayObject|PIXI.Container} item Either
 *        the container or display object to search for items to upload or
 *        the callback function, if items have been added using `prepare.add`.
 * @param {Function} [done] Optional callback when all queued uploads have completed
 */
CanvasPrepare.prototype.upload = function(item, done)
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
    else
    {
        if (done)
        {
            done();
        }
    }
};

/**
 * Handle tick update
 * @private
 */
CanvasPrepare.prototype.tick = function()
{
    var i, len;

    // Upload the graphics
    while(this.queue.length && this.numLeft > 0)
    {
        var item = this.queue[0];
        var uploaded = false;
        for (i = 0, len = this.uploadHooks.length; i < len; i++)
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
        var completes = this.completes.slice(0);
        this.completes.length = 0;
        for (i = 0, len = completes.length; i < len; i++)
        {
            completes[i]();
        }
    }
};

/**
 * Adds hooks for finding and uploading items.
 * @param {Function} [addHook] Function call that takes two parameters: `item:*, queue:Array`
          function must return `true` if it was able to add item to the queue.
 * @param {Function} [uploadHook] Function call that takes two parameters: `renderer:CanvasRenderer, item:*` and
 *        function must return `true` if it was able to handle upload of item.
 * @return {PIXI.CanvasPrepare} Instance of plugin for chaining.
 */
CanvasPrepare.prototype.register = function(addHook, uploadHook)
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
};

/**
 * Manually add an item to the uploading queue.
 * @param {PIXI.DisplayObject|PIXI.Container|*} item Object to add to the queue
 * @return {PIXI.CanvasPrepare} Instance of plugin for chaining.
 */
CanvasPrepare.prototype.add = function(item)
{
    var i, len;

    // Add additional hooks for finding elements on special
    // types of objects that
    for (i = 0, len = this.addHooks.length; i < len; i++)
    {
        if (this.addHooks[i](item, this.queue))
        {
            break;
        }
    }

    // Get childen recursively
    if (item instanceof core.Container)
    {
        for (i = item.children.length - 1; i >= 0; i--)
        {
            this.add(item.children[i]);
        }
    }
    return this;
};

/**
 * Destroys the plugin, don't use after this.
 */
CanvasPrepare.prototype.destroy = function()
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
};

/**
 * Built-in hook to upload PIXI.Texture objects to the GPU
 * @private
 * @param {*} item Item to check
 * @return {boolean} If item was uploaded.
 */
function uploadBaseTextures(prepare, item)
{
    if (item instanceof core.BaseTexture)
    {
        var image = item.source;

        // Sometimes images (like atlas images) report a size of zero, causing errors on windows phone. So if the width or height is equal to zero then use the canvas size
        // Otherwise use whatever is smaller, the image dimensions or the canvas dimensions.
        var imageWidth = image.width === 0 ? prepare.canvas.width : Math.min( prepare.canvas.width, image.width );
		var imageHeight = image.height === 0 ? prepare.canvas.height : Math.min( prepare.canvas.height, image.height );

        // Only a small subsections is required to be drawn to have the whole texture uploaded to the GPU
        // A smaller draw can be faster.
		prepare.ctx.drawImage( image, 0, 0, imageWidth, imageHeight, 0, 0, prepare.canvas.width, prepare.canvas.height );
        return true;
    }
    return false;
}

/**
 * Built-in hook to find textures from Sprites
 * @private
 * @param {PIXI.DisplayObject} item Display object to check
 * @param {Array<*>} queue Collection of items to upload
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
        var texture = item._texture.baseTexture;
        if (queue.indexOf(texture) === -1)
        {
            queue.push(texture);
        }
        return true;
    }
    return false;
}


core.CanvasRenderer.registerPlugin('prepare', CanvasPrepare);