var core = require('../core');
var TextureUvs = require('../core/textures/TextureUvs')

/**
 * A tiling sprite is a fast way of rendering a tiling image
 *
 * @class
 * @extends Sprite
 * @namespace PIXI
 * @param texture {Texture} the texture of the tiling sprite
 * @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 */
function TilingSprite(texture, width, height)
{
    core.Sprite.call( this, texture);

    /**
     * The with of the tiling sprite
     *
     * @member {number}
     */
    this._width = width || 100;

    /**
     * The height of the tiling sprite
     *
     * @member {number}
     */
    this._height = height || 100;

    /**
     * The scaling of the image that is being tiled
     *
     * @member {Point}
     */
    this.tileScale = new core.math.Point(1,1);

    /**
     * A point that represents the scale of the texture object
     *
     * @member {Point}
     */
    this.tileScaleOffset = new core.math.Point(1,1);

    /**
     * The offset position of the image that is being tiled
     *
     * @member {Point}
     */
    this.tilePosition = new core.math.Point(0,0);

    /**
     * The blend mode to be applied to the sprite
     *
     * @member {number}
     * @default blendModes.NORMAL;
     */
    this.blendMode = core.CONST.blendModes.NORMAL;

    
    this._uvs = new TextureUvs();
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
    },

    texture: {
        get: function ()
        {
            return this._texture;
        },
        set: function (value)
        {
            if (this._texture === value)
            {
                return;
            }

            this._texture = value;
            this.refreshTexture = true;
            this.cachedTint = 0xFFFFFF;
        }
    }
});

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {WebGLRenderer}
 */
TilingSprite.prototype._renderWebGL = function (renderer)
{
  

    if (!this.tilingTexture || this.refreshTexture)
    {
        this.generateTilingTexture(true);

        if (this.tilingTexture && this.tilingTexture.needsUpdate)
        {
            //TODO - tweaking
            renderer.updateTexture(this.tilingTexture.baseTexture);
            this.tilingTexture.needsUpdate = false;
           // this.tilingTexture._uvs = null;
        }

    }
    else
    {
        // tweak our texture temporarily..
        
        var texture = this.tilingTexture;


        var uvs = this._uvs;

        this.tilePosition.x %= texture.baseTexture.width * this.tileScaleOffset.x;
        this.tilePosition.y %= texture.baseTexture.height * this.tileScaleOffset.y;

        var offsetX =  this.tilePosition.x/(texture.baseTexture.width*this.tileScaleOffset.x);
        var offsetY =  this.tilePosition.y/(texture.baseTexture.height*this.tileScaleOffset.y);

        var scaleX =  (this.width / texture.baseTexture.width)  / (this.tileScale.x * this.tileScaleOffset.x);
        var scaleY =  (this.height / texture.baseTexture.height) / (this.tileScale.y * this.tileScaleOffset.y);

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

        renderer.spriteRenderer.render(this);
     
        texture._uvs = tempUvs;
        texture._frame.width = tempWidth;
        texture._frame.height = tempHeight;
    }
    
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {CanvasRenderer}
 */
TilingSprite.prototype.renderCanvas = function (renderer)
{
    if (!this.visible || this.alpha <= 0)
    {
        return;
    }

    var context = renderer.context;

    if (this._mask)
    {
        renderer.maskManager.pushMask(this._mask, context);
    }

    context.globalAlpha = this.worldAlpha;

    var transform = this.worldTransform;

    var i,j;

    var resolution = renderer.resolution;

    context.setTransform(transform.a * resolution,
                         transform.b * resolution,
                         transform.c * resolution,
                         transform.d * resolution,
                         transform.tx * resolution,
                         transform.ty * resolution);

    if (!this.__tilePattern ||  this.refreshTexture)
    {
        this.generateTilingTexture(false);

        if (this.tilingTexture)
        {
            this.__tilePattern = context.createPattern(this.tilingTexture.baseTexture.source, 'repeat');
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

    tilePosition.x %= this.tilingTexture.baseTexture.width;
    tilePosition.y %= this.tilingTexture.baseTexture.height;

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

    if (this._mask)
    {
        renderer.maskManager.popMask(renderer.context);
    }

    for (i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].renderCanvas(renderer);
    }
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
 *
 * @param forcePowerOfTwo {boolean} Whether we want to force the texture to be a power of two
 */
TilingSprite.prototype.generateTilingTexture = function (forcePowerOfTwo)
{
    if (!this.texture.baseTexture.hasLoaded)
    {
        return;
    }

    var texture = this.originalTexture || this.texture;
    var frame = texture.frame;
    var targetWidth, targetHeight;

    //  Check that the frame is the same size as the base texture.
    var isFrame = frame.width !== texture.baseTexture.width || frame.height !== texture.baseTexture.height;

    var newTextureRequired = false;

    if (!forcePowerOfTwo)
    {
        if (isFrame)
        {
            targetWidth = frame.width;
            targetHeight = frame.height;

            newTextureRequired = true;
        }
    }
    else
    {
        targetWidth = core.utils.getNextPowerOfTwo(frame.width);
        targetHeight = core.utils.getNextPowerOfTwo(frame.height);

        //  If the BaseTexture dimensions don't match the texture frame then we need a new texture anyway because it's part of a texture atlas
        if (frame.width !== targetWidth || frame.height !== targetHeight || texture.baseTexture.width !== targetWidth || texture.baseTexture.height || targetHeight)
        {
            newTextureRequired = true;
        }
    }

    if (newTextureRequired)
    {
        var canvasBuffer;

        if (this.tilingTexture && this.tilingTexture.isTiling)
        {
            canvasBuffer = this.tilingTexture.canvasBuffer;
            canvasBuffer.resize(targetWidth, targetHeight);
            this.tilingTexture.baseTexture.width = targetWidth;
            this.tilingTexture.baseTexture.height = targetHeight;
            this.tilingTexture.needsUpdate = true;
        }
        else
        {
            canvasBuffer = new core.CanvasBuffer(targetWidth, targetHeight);

            this.tilingTexture = core.Texture.fromCanvas(canvasBuffer.canvas);
            this.tilingTexture.canvasBuffer = canvasBuffer;
            this.tilingTexture.isTiling = true;
        }

        canvasBuffer.context.drawImage(texture.baseTexture.source,
                               texture.crop.x,
                               texture.crop.y,
                               texture.crop.width,
                               texture.crop.height,
                               0,
                               0,
                               targetWidth,
                               targetHeight);

        this.tileScaleOffset.x = frame.width / targetWidth;
        this.tileScaleOffset.y = frame.height / targetHeight;
    }
    else
    {
        //  TODO - switching?
        if (this.tilingTexture && this.tilingTexture.isTiling)
        {
            // destroy the tiling texture!
            // TODO could store this somewhere?
            this.tilingTexture.destroy(true);
        }

        this.tileScaleOffset.x = 1;
        this.tileScaleOffset.y = 1;
        this.tilingTexture = texture;
    }

    this.refreshTexture = false;

    this.originalTexture = this.texture;
    this.texture = this.tilingTexture;

    this.tilingTexture.baseTexture._powerOf2 = true;
};
