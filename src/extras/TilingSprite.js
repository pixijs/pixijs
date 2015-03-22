var core = require('../core'),
    // a sprite use dfor rendering textures..
    tempSprite = new core.Sprite(),
    tempPoint = new core.Point(),
    tempMatrix = new core.Matrix();

/**
 * A tiling sprite is a fast way of rendering a tiling image
 *
 * @class
 * @extends Sprite
 * @memberof PIXI.extras
 * @param texture {Texture} the texture of the tiling sprite
 * @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 */
function TilingSprite(texture, width, height)
{
    core.Sprite.call(this, texture);

    /**
     * The scaling of the image that is being tiled
     *
     * @member {Point}
     */
    this.tileScale = new core.math.Point(1,1);


    /**
     * The offset position of the image that is being tiled
     *
     * @member {Point}
     */
    this.tilePosition = new core.math.Point(0,0);

    ///// private

    /**
     * The with of the tiling sprite
     *
     * @member {number}
     * @private
     */
    this._width = width || 100;

    /**
     * The height of the tiling sprite
     *
     * @member {number}
     * @private
     */
    this._height = height || 100;

     /**
     * A point that represents the scale of the texture object
     *
     * @member {Point}
     * @private
     */
    this._tileScaleOffset = new core.math.Point(1,1);


    /**
     *
     *
     * @member {boolean}
     * @private
     */
    this._tilingTexture = null;

    /**
     *
     *
     * @member {boolean}
     * @private
     */
    this._refreshTexture = false;

    /**
     * An internal WebGL UV cache.
     *
     * @member {TextureUvs}
     * @private
     */
    this._uvs = new core.TextureUvs();
}

TilingSprite.prototype = Object.create(core.Sprite.prototype);
TilingSprite.prototype.constructor = TilingSprite;
module.exports = TilingSprite;


Object.defineProperties(TilingSprite.prototype, {
    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof TilingSprite#
     */
    width: {
        get: function ()
        {
            return this._width;
        },
        set: function (value)
        {
            this._width = value;
        }
    },

    /**
     * The height of the TilingSprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof TilingSprite#
     */
    height: {
        get: function ()
        {
            return this._height;
        },
        set: function (value)
        {
            this._height = value;
        }
    }
});

TilingSprite.prototype._onTextureUpdate = function ()
{
    return;
};


/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {WebGLRenderer}
 * @private
 */
TilingSprite.prototype._renderWebGL = function (renderer)
{
    if (!this._tilingTexture || this._refreshTexture)
    {
        this.generateTilingTexture(renderer, this.texture, true);
    }

    // tweak our texture temporarily..
    var texture = this._tilingTexture;

    if(!texture)
    {
        return;
    }


    var uvs = this._uvs;

    this.tilePosition.x %= texture.baseTexture.width / this._tileScaleOffset.x;
    this.tilePosition.y %= texture.baseTexture.height / this._tileScaleOffset.y;

    var offsetX =  this.tilePosition.x/(texture.baseTexture.width / this._tileScaleOffset.x);
    var offsetY =  this.tilePosition.y/(texture.baseTexture.height / this._tileScaleOffset.y);

    var scaleX =  (this._width / texture.baseTexture.width) * this._tileScaleOffset.x;
    var scaleY =  (this._height / texture.baseTexture.height) * this._tileScaleOffset.y;

    scaleX /= this.tileScale.x;
    scaleY /= this.tileScale.y;

    uvs.x0 = 0 - offsetX;
    uvs.y0 = 0 - offsetY;

    uvs.x1 = (1 * scaleX) - offsetX;
    uvs.y1 = 0 - offsetY;

    uvs.x2 = (1 * scaleX) - offsetX;
    uvs.y2 = (1 * scaleY) - offsetY;

    uvs.x3 = 0 - offsetX;
    uvs.y3 = (1 * scaleY) - offsetY;

    var tempUvs = texture._uvs;
    var tempWidth = texture._frame.width;
    var tempHeight = texture._frame.height;

    texture._uvs = uvs;
    texture._frame.width = this.width;
    texture._frame.height = this.height;

    renderer.setObjectRenderer(renderer.plugins.sprite);
    renderer.plugins.sprite.render(this);

    texture._uvs = tempUvs;
    texture._frame.width = tempWidth;
    texture._frame.height = tempHeight;

};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {CanvasRenderer} a reference to the canvas renderer
 * @private
 */
TilingSprite.prototype._renderCanvas = function (renderer)
{
    var context = renderer.context;

    context.globalAlpha = this.worldAlpha;

    var transform = this.worldTransform;

    var resolution = renderer.resolution;

    context.setTransform(transform.a * resolution,
                         transform.b * resolution,
                         transform.c * resolution,
                         transform.d * resolution,
                         transform.tx * resolution,
                         transform.ty * resolution);

    if (!this.__tilePattern ||  this._refreshTexture)
    {
        this.generateTilingTexture(false);

        if (this._tilingTexture)
        {
            this.__tilePattern = context.createPattern(this._tilingTexture.baseTexture.source, 'repeat');
        }
        else
        {
            return;
        }
    }

    // check blend mode
    if (this.blendMode !== renderer.currentBlendMode)
    {
        renderer.currentBlendMode = this.blendMode;
        context.globalCompositeOperation = renderer.blendModes[renderer.currentBlendMode];
    }

    var tilePosition = this.tilePosition;
    var tileScale = this.tileScale;

    tilePosition.x %= this._tilingTexture.baseTexture.width;
    tilePosition.y %= this._tilingTexture.baseTexture.height;

    // offset - make sure to account for the anchor point..
    context.scale(tileScale.x,tileScale.y);
    context.translate(tilePosition.x + (this.anchor.x * -this._width), tilePosition.y + (this.anchor.y * -this._height));

    context.fillStyle = this.__tilePattern;

    context.fillRect(-tilePosition.x,
                    -tilePosition.y,
                    this._width / tileScale.x,
                    this._height / tileScale.y);

    context.translate(-tilePosition.x + (this.anchor.x * this._width), -tilePosition.y + (this.anchor.y * this._height));
    context.scale(1 / tileScale.x, 1 / tileScale.y);
};


/**
 * Returns the framing rectangle of the sprite as a Rectangle object
*
 * @return {Rectangle} the framing rectangle
 */
TilingSprite.prototype.getBounds = function ()
{
    var width = this._width;
    var height = this._height;

    var w0 = width * (1-this.anchor.x);
    var w1 = width * -this.anchor.x;

    var h0 = height * (1-this.anchor.y);
    var h1 = height * -this.anchor.y;

    var worldTransform = this.worldTransform;

    var a = worldTransform.a;
    var b = worldTransform.b;
    var c = worldTransform.c;
    var d = worldTransform.d;
    var tx = worldTransform.tx;
    var ty = worldTransform.ty;

    var x1 = a * w1 + c * h1 + tx;
    var y1 = d * h1 + b * w1 + ty;

    var x2 = a * w0 + c * h1 + tx;
    var y2 = d * h1 + b * w0 + ty;

    var x3 = a * w0 + c * h0 + tx;
    var y3 = d * h0 + b * w0 + ty;

    var x4 =  a * w1 + c * h0 + tx;
    var y4 =  d * h0 + b * w1 + ty;

    var minX,
        maxX,
        minY,
        maxY;

    minX = x1;
    minX = x2 < minX ? x2 : minX;
    minX = x3 < minX ? x3 : minX;
    minX = x4 < minX ? x4 : minX;

    minY = y1;
    minY = y2 < minY ? y2 : minY;
    minY = y3 < minY ? y3 : minY;
    minY = y4 < minY ? y4 : minY;

    maxX = x1;
    maxX = x2 > maxX ? x2 : maxX;
    maxX = x3 > maxX ? x3 : maxX;
    maxX = x4 > maxX ? x4 : maxX;

    maxY = y1;
    maxY = y2 > maxY ? y2 : maxY;
    maxY = y3 > maxY ? y3 : maxY;
    maxY = y4 > maxY ? y4 : maxY;

    var bounds = this._bounds;

    bounds.x = minX;
    bounds.width = maxX - minX;

    bounds.y = minY;
    bounds.height = maxY - minY;

    // store a reference so that if this function gets called again in the render cycle we do not have to recalculate
    this._currentBounds = bounds;

    return bounds;
};

/**
 * When the texture is updated, this event will fire to update the scale and frame
 *
 * @param event
 * @private
 */
TilingSprite.prototype.onTextureUpdate = function ()
{
   // overriding the sprite version of this!
};

/**
 * Creates the tiling texture
 * @param renderer {CanvasRenderer|WebGLRenderer} a reference to the current renderer
 * @param texture {Texture} The texture to use to generate the tiling texture
 * @param forcePowerOfTwo {boolean} Whether we want to force the texture to be a power of two
 */
TilingSprite.prototype.generateTilingTexture = function (renderer, texture, forcePowerOfTwo)
{
    if (!this.texture.baseTexture.hasLoaded)
    {
        return;
    }

    texture = this.originalTexture || this._texture;
    var frame = texture.frame;
    var targetWidth, targetHeight;

    //  Check that the frame is the same size as the base texture.
    var isFrame = frame.width !== texture.baseTexture.width || frame.height !== texture.baseTexture.height;

    if ((forcePowerOfTwo && !texture.baseTexture.isPowerOfTwo) || isFrame)
    {
        targetWidth = core.utils.getNextPowerOfTwo(frame.width);
        targetHeight = core.utils.getNextPowerOfTwo(frame.height);
        tempSprite.texture = texture;

        //TODO not create a new one each time you refresh
        var renderTexture = new core.RenderTexture(renderer, targetWidth, targetHeight, texture.baseTexture.scaleMode, texture.baseTexture.resolution);

        var cachedRenderTarget = renderer.currentRenderTarget;

        var m = tempMatrix;
        m.a =  (targetWidth + 1) / (frame.width);
        m.d =   (targetHeight + 1) / (frame.height);

        tempSprite.worldTransform.tx -= 0.5;
        tempSprite.worldTransform.ty -= 0.5;

        renderer.currentRenderer.flush();

        renderTexture.render( tempSprite, m, true, false );

        renderer.setRenderTarget(cachedRenderTarget);


        this._tileScaleOffset.x = targetWidth / frame.width;
        this._tileScaleOffset.y = targetHeight / frame.height;

        this._tilingTexture = renderTexture;
    }
    else
    {
        if (this._tilingTexture && this._tilingTexture.isTiling)
        {
            // destroy the tiling texture!
            // TODO could store this somewhere?
            this._tilingTexture.destroy(true);
        }

        this._tileScaleOffset.x = 1;
        this._tileScaleOffset.y = 1;
        this._tilingTexture = texture;

    }


    this._refreshTexture = false;

    this.originalTexture = this.texture;
    this._texture = this._tilingTexture;

};

/**
 * Checks if a point is inside this tiling sprite
 * @param point {Point} the point to check
 */
TilingSprite.prototype.containsPoint = function( point )
{
    this.worldTransform.applyInverse(point,  tempPoint);

    var width = this._width;
    var height = this._height;
    var x1 = -width * this.anchor.x;
    var y1;

    if ( tempPoint.x > x1 && tempPoint.x < x1 + width )
    {
        y1 = -height * this.anchor.y;

        if ( tempPoint.y > y1 && tempPoint.y < y1 + height )
        {
            return true;
        }
    }

    return false;
};

/**
 * Destroys this tiling sprite
 *
 */
TilingSprite.prototype.destroy = function () {
    core.Sprite.prototype.destroy.call(this);

    this.tileScale = null;
    this._tileScaleOffset = null;
    this.tilePosition = null;

    this._tilingTexture.destroy(true);
    this._tilingTexture = null;

    this._uvs = null;
};

/**
 * Helper function that creates a tiling sprite that will use a texture from the TextureCache based on the frameId
 * The frame ids are created when a Texture packer file has been loaded
 *
 * @static
 * @param frameId {String} The frame Id of the texture in the cache
 * @return {TilingSprite} A new TilingSprite using a texture from the texture cache matching the frameId
 * @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 */
TilingSprite.fromFrame = function (frameId,width,height)
{
    var texture = core.utils.TextureCache[frameId];

    if (!texture)
    {
        throw new Error('The frameId "' + frameId + '" does not exist in the texture cache ' + this);
    }

    return new TilingSprite(texture,width,height);
};

/**
 * Helper function that creates a sprite that will contain a texture based on an image url
 * If the image is not in the texture cache it will be loaded
 *
 * @static
 * @param imageId {String} The image url of the texture
 * @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 * @param [crossorigin=(auto)] {boolean} if you want to specify the cross-origin parameter
 * @param [scaleMode=scaleModes.DEFAULT] {number} if you want to specify the scale mode, see {@link SCALE_MODES} for possible values
 * @return {TilingSprite} A new TilingSprite using a texture from the texture cache matching the image id
 */
TilingSprite.fromImage = function (imageId, width, height, crossorigin, scaleMode)
{
    return new TilingSprite(core.Texture.fromImage(imageId, crossorigin, scaleMode),width,height);
};
