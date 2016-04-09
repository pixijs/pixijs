var BaseTexture = require('./BaseTexture'),
    CONST = require('../const');

/**
 * A BaseRenderTexture is a special texture that allows any Pixi display object to be rendered to it.
 *
 * __Hint__: All DisplayObjects (i.e. Sprites) that render to a BaseRenderTexture should be preloaded
 * otherwise black rectangles will be drawn instead.
 *
 * A BaseRenderTexture takes a snapshot of any Display Object given to its render method. The position
 * and rotation of the given Display Objects is ignored. For example:
 *
 * ```js
 * var renderer = PIXI.autoDetectRenderer(1024, 1024, { view: canvas, ratio: 1 });
 * var BaserenderTexture = new PIXI.BaseRenderTexture(renderer, 800, 600);
 * var sprite = PIXI.Sprite.fromImage("spinObj_01.png");
 *
 * sprite.position.x = 800/2;
 * sprite.position.y = 600/2;
 * sprite.anchor.x = 0.5;
 * sprite.anchor.y = 0.5;
 *
 * BaserenderTexture.render(sprite);
 * ```
 *
 * The Sprite in this case will be rendered to a position of 0,0. To render this sprite at its actual
 * position a Container should be used:
 *
 * ```js
 * var doc = new PIXI.Container();
 *
 * doc.addChild(sprite);
 *
 * var baseRenderTexture = new PIXI.BaserenderTexture(100, 100);
 * var renderTexture = new PIXI.RenderTexture(baseRenderTexture);
 *
 * renderer.render(doc, renderTexture);  // Renders to center of RenderTexture
 * ```
 *
 * @class
 * @extends PIXI.BaseTexture
 * @memberof PIXI
 * @param [width=100] {number} The width of the base render texture
 * @param [height=100] {number} The height of the base render texture
 * @param [scaleMode] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @param [resolution=1] {number} The resolution of the texture being generated
 */
function BaseRenderTexture(width, height, scaleMode, resolution)
{
    BaseTexture.call(this, null, scaleMode);

    this.width = width || 100;
    this.height = height || 100;

    this.resolution = resolution || CONST.RESOLUTION;
    this.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;
    this.hasLoaded = true;

    /**
     * A map of renderer IDs to webgl renderTargets
     *
     * @member {object<number, WebGLTexture>}
     * @private
     */
    this._glRenderTargets = [];

    /**
     * A reference to the canvas render target (we only need one as this can be shared accross renderers)
     *
     * @member {object<number, WebGLTexture>}
     * @private
     */
    this._canvasRenderTarget = null;

    /**
     * @member {boolean}
     */
    this.valid = false;
}

BaseRenderTexture.prototype = Object.create(BaseTexture.prototype);
BaseRenderTexture.prototype.constructor = BaseRenderTexture;
module.exports = BaseRenderTexture;

/**
 * Resizes the BaseRenderTexture.
 *
 * @param width {number} The width to resize to.
 * @param height {number} The height to resize to.
 */
BaseRenderTexture.prototype.resize = function (width, height)
{

    if (width === this.width && height === this.height)
    {
        return;
    }

    this.valid = (width > 0 && height > 0);

    this.width = width;
    this.height = height;

    if (!this.valid)
    {
        return;
    }

    this.emit('update', this);

    //TODO - remove this!
    if(this.filterManager)
    {
        this.filterManager.resize(this.width, this.height);
    }
};

/**
 * Destroys this texture
 *
 */
BaseRenderTexture.prototype.destroy = function ()
{
    BaseTexture.prototype.destroy.call(this, true);

    // destroy the filtermanager..
    if(this.filterManager)
    {
        this.filterManager.destroy();
    }

    this.renderer = null;
};

