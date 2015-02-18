var math = require('../core/math'),
    RenderTexture = require('../core/textures/RenderTexture'),
    DisplayObject = require('../core/display/DisplayObject'),
    Sprite = require('../core/sprites/Sprite'),

    _tempMatrix = new math.Matrix();

DisplayObject.prototype._cacheAsBitmap = false;
DisplayObject.prototype._originalRenderWebGL = null;
DisplayObject.prototype._originalRenderCanvas = null;

DisplayObject.prototype._originalUpdateTransform = null;
DisplayObject.prototype._originalHitTest = null;
DisplayObject.prototype._cachedSprite = null;



Object.defineProperties(DisplayObject.prototype, {

    cacheAsBitmap: {
        get: function ()
        {
            return this._cacheAsBitmap;
        },
        set: function (value)
        {
            if(this._cacheAsBitmap === value)
            {
                return;
            }

            this._cacheAsBitmap = value;

            if(value)
            {
                this._originalRenderWebGL = this.renderWebGL;
                this._originalRenderCanvas = this.renderCanvas;

                this._originalUpdateTransform = this.updateTransform;
                this._originalHitTest = this.hitTest;

                this.renderWebGL = this._renderCachedWebGL;
                this.renderCanvas = this._renderCachedCanvas;

                this.updateTransform = this.displayObjectUpdateTransform;

            }
            else
            {
                if(this._cachedSprite)
                {
                    this._destroyCachedDisplayObject();
                }

                this.renderWebGL = this._originalRenderWebGL;
                this.renderCanvas = this._originalRenderCanvas;

                this.updateTransform = this._originalUpdateTransform;
                this.hitTest = this._originalHitTest;
            }
        }
    }
});

DisplayObject.prototype._renderCachedWebGL = function(renderer)
{
    this._initCachedDisplayObject( renderer );

    this._cachedSprite.worldAlpha = this.worldAlpha;

    renderer.setObjectRenderer(renderer.plugins.sprite);
    renderer.plugins.sprite.render( this._cachedSprite );
};

DisplayObject.prototype._initCachedDisplayObject = function( renderer )
{
    if(this._cachedSprite)
    {
        return;
    }

    //get bounds actually transforms the object for us already!
    var bounds = this.getLocalBounds();

    var cachedRenderTarget = renderer.currentRenderTarget;

    var renderTexture = new RenderTexture(renderer, bounds.width | 0, bounds.height | 0);

    // need to set //
    var m = _tempMatrix;

    m.tx = -bounds.x;
    m.ty = -bounds.y;

    // set all properties to there original so we can render to a texture
    this._cacheAsBitmap = false;
    this.renderWebGL = this._originalRenderWebGL;

    renderTexture.render(this, m, true);

    // now restore the state be setting the new properties
    renderer.setRenderTarget(cachedRenderTarget);

    this.renderWebGL = this._renderCachedWebGL;
    this._cacheAsBitmap = true;

    // create our cached sprite
    this._cachedSprite = new Sprite(renderTexture);
    this._cachedSprite.worldTransform = this.worldTransform;
    this._cachedSprite.anchor.x = -( bounds.x / bounds.width );
    this._cachedSprite.anchor.y = -( bounds.y / bounds.height );
    this.hitTest = this._cachedSprite.hitTest.bind(this._cachedSprite);
};


DisplayObject.prototype._renderCachedCanvas = function(renderer)
{
 //   console.log("!!!!")
    this._initCachedDisplayObjectCanvas( renderer );
   // console.log("<>")
    this._cachedSprite.worldAlpha = this.worldAlpha;

    this._cachedSprite.renderCanvas(renderer);
};

DisplayObject.prototype._initCachedDisplayObjectCanvas = function( renderer )
{
    if(this._cachedSprite)
    {
        return;
    }

    //get bounds actually transforms the object for us already!
    var bounds = this.getLocalBounds();

    var cachedRenderTarget = renderer.context;

    var renderTexture = new RenderTexture(renderer, bounds.width | 0, bounds.height | 0);

    // need to set //
    var m = _tempMatrix;

    m.tx = -bounds.x;
    m.ty = -bounds.y;

    // set all properties to there original so we can render to a texture
    this._cacheAsBitmap = false;
    this.renderCanvas = this._originalRenderCanvas;

    renderTexture.render(this, m, true);

    // now restore the state be setting the new properties
    renderer.context = cachedRenderTarget;

    this.renderCanvas = this._renderCachedCanvas;
    this._cacheAsBitmap = true;

    // create our cached sprite
    this._cachedSprite = new Sprite(renderTexture);
    this._cachedSprite.worldTransform = this.worldTransform;
    this._cachedSprite.anchor.x = -( bounds.x / bounds.width );
    this._cachedSprite.anchor.y = -( bounds.y / bounds.height );
    this.hitTest = this._cachedSprite.hitTest.bind(this._cachedSprite);
};


DisplayObject.prototype._destroyCachedDisplayObject = function()
{
    this._cachedSprite._texture.destroy();
    this._cachedSprite = null;
};



module.exports = {};
