var core = require('../../core'),
    SharedTicker = core.ticker.shared;

/**
 * The prepare manager provides functionality to upload content to the GPU
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} A reference to the current renderer
 */
function Prepare(renderer)
{
    /**
     * Reference to the renderer.
     * @type {PIXI.WebGLRenderer}
     * @private
     */
    this.renderer = renderer;

    /**
     * Collection of textures to do multiple uploads at once.
     * @type {Array<PIXI.Texture>}
     * @private
     */
    this.textures = [];

    /**
     * Collection of graphics to do multiple uploads at once.
     * @type {Array<PIXI.Graphics>}
     * @private
     */
    this.graphics = [];

    /**
     * Callback to call after completed.
     * @type {Function}
     * @private
     */
    this.complete = null;
}


/**
 * The number of graphics or textures to upload to the GPU
 * @property {int} UPLOADS_PER_FRAME
 * @static
 * @default 4
 */
Prepare.UPLOADS_PER_FRAME = 4;

Prepare.prototype.constructor = Prepare;
module.exports = Prepare;

/** 
 * Upload all the textures and graphics to the GPU. 
 * @method upload
 * @static
 * @param {PIXI.WebGLRenderer} renderer Render to upload to
 * @param {PIXI.DisplayObject|PIXI.Container} clip MovieClip to upload
 * @param {Function} done When completed
 */
Prepare.prototype.upload = function(displayObject, done) {

    // Get the items for upload from the display
    if (this.find(displayObject))
    {
        this.numLeft = Prepare.UPLOADS_PER_FRAME;
        this.complete = done;
        SharedTicker.add(this.tick, this);
    }
    else
    {
        done();
    }
};

/**
 * Handle tick update
 * @method tick
 * @private
 */
Prepare.prototype.tick = function() {


    // Upload the graphics
    while(this.graphics.length && this.numLeft)
    {
        this.renderer.plugins.graphics.updateGraphics(this.graphics.pop());
        this.numLeft--;
    }

    // Upload the textures
    while(this.textures.length && this.numLeft)
    {
        this.renderer.textureManager.updateTexture(this.textures.pop());
        this.numLeft--;
    }

    // We're finished
    if (this.textures.length || this.graphics.length)
    {
        this.numLeft = Prepare.UPLOADS_PER_FRAME;
    } 
    else 
    {
        SharedTicker.remove(this.tick, this);
        var done = this.complete;
        this.complete = null;
        done();
    }
};

/**
 * Scan for uploadable items.
 * @method uploadable
 * @private
 * @param {PIXI.DisplayObject|PIXI.Container} displayObject 
 * @return {Boolean} `true` if items were found and we should proceed.
 */
Prepare.prototype.find = function(displayObject) {
    
    // Objects with textures, like Sprites/Text
    if (displayObject._texture && displayObject._texture instanceof core.Texture)
    {
        var texture = displayObject._texture.baseTexture;

        if (this.textures.indexOf(texture) === -1)
        {
            this.textures.push(texture);
        }
    }
    else if (displayObject instanceof core.Graphics)
    {
        this.graphics.push(displayObject);
    }

    // Get childen recursively
    if (displayObject instanceof core.Container)
    {
        for (var i = displayObject.children.length - 1; i >= 0; i--)
        {
            this.find(displayObject.children[i]);
        }
    }
    return this.textures.length + this.graphics.length;
};

core.WebGLRenderer.registerPlugin('prepare', Prepare);