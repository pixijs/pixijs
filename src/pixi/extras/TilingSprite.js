/**
 * @author Mat Groves http://matgroves.com/
 */

/**
 * A tiling sprite is a fast way of rendering a tiling image
 *
 * @class TilingSprite
 * @extends DisplayObjectContainer
 * @constructor
 * @param texture {Texture} the texture of the tiling sprite
 * @param width {Number}  the width of the tiling sprite
 * @param height {Number} the height of the tiling sprite
 */
PIXI.TilingSprite = function(texture, width, height)
{
    PIXI.Sprite.call( this, texture);

    this.width = width || 100;
    this.height = height || 100;

    texture.baseTexture._powerOf2 = true;

    /**
     * The scaling of the image that is being tiled
     *
     * @property tileScale
     * @type Point
     */
    this.tileScale = new PIXI.Point(1,1);

    /**
     * The offset position of the image that is being tiled
     *
     * @property tilePosition
     * @type Point
     */
    this.tilePosition = new PIXI.Point(0,0);

    this.renderable = true;

    this.tint = 0xFFFFFF;
    this.blendMode = PIXI.blendModes.NORMAL;
};

// constructor
PIXI.TilingSprite.prototype = Object.create( PIXI.Sprite.prototype );
PIXI.TilingSprite.prototype.constructor = PIXI.TilingSprite;


/**
 * The width of the sprite, setting this will actually modify the scale to acheive the value set
 *
 * @property width
 * @type Number
 */
Object.defineProperty(PIXI.TilingSprite.prototype, 'width', {
    get: function() {
        return this._width;
    },
    set: function(value) {
        
        this._width = value;
    }
});

/**
 * The height of the TilingSprite, setting this will actually modify the scale to acheive the value set
 *
 * @property height
 * @type Number
 */
Object.defineProperty(PIXI.TilingSprite.prototype, 'height', {
    get: function() {
        return  this._height;
    },
    set: function(value) {
        this._height = value;
    }
});

PIXI.TilingSprite.prototype.onTextureUpdate = function()
{
    // so if _width is 0 then width was not set..
    //if(this._width)this.scale.x = this._width / this.texture.frame.width;
    //if(this._height)this.scale.y = this._height / this.texture.frame.height;
   // alert(this._width)
    this.updateFrame = true;
};

PIXI.TilingSprite.prototype._renderWebGL = function(renderSession)
{

    if(this.visible === false || this.alpha === 0)return;
    
    var i,j;

    if(this.mask || this.filters)
    {
        if(this.mask)
        {
            renderSession.spriteBatch.stop();
            renderSession.maskManager.pushMask(this.mask, renderSession.projection);
            renderSession.spriteBatch.start();
        }

        if(this.filters)
        {
            renderSession.spriteBatch.flush();
            renderSession.filterManager.pushFilter(this._filterBlock);
        }


        renderSession.spriteBatch.renderTilingSprite(this);

        // simple render children!
        for(i=0,j=this.children.length; i<j; i++)
        {
            this.children[i]._renderWebGL(renderSession);
        }

        renderSession.spriteBatch.stop();

        if(this.filters)renderSession.filterManager.popFilter();
        if(this.mask)renderSession.maskManager.popMask(renderSession.projection);
        
        renderSession.spriteBatch.start();
    }
    else
    {
        renderSession.spriteBatch.renderTilingSprite(this);
        
        // simple render children!
        for(i=0,j=this.children.length; i<j; i++)
        {
            this.children[i]._renderWebGL(renderSession);
        }
    }
};

PIXI.TilingSprite.prototype._renderCanvas = function(renderSession)
{
    if(this.visible === false || this.alpha === 0)return;
    
    var context = renderSession.context;

    context.globalAlpha = this.worldAlpha;

    
    var transform = this.worldTransform;

    // alow for trimming
   
    context.setTransform(transform[0], transform[3], transform[1], transform[4], transform[2], transform[5]);
 

    if(!this.__tilePattern)
        this.__tilePattern = context.createPattern(this.texture.baseTexture.source, 'repeat');

    // check blend mode
    if(this.blendMode !== renderSession.currentBlendMode)
    {
        renderSession.currentBlendMode = this.blendMode;
        context.globalCompositeOperation = PIXI.blendModesCanvas[renderSession.currentBlendMode];
    }

    context.beginPath();

    var tilePosition = this.tilePosition;
    var tileScale = this.tileScale;

    // offset
    context.scale(tileScale.x,tileScale.y);
    context.translate(tilePosition.x, tilePosition.y);

    context.fillStyle = this.__tilePattern;
    context.fillRect(-tilePosition.x,-tilePosition.y,this.width / tileScale.x, this.height / tileScale.y);

    context.scale(1/tileScale.x, 1/tileScale.y);
    context.translate(-tilePosition.x, -tilePosition.y);

    context.closePath();
};
