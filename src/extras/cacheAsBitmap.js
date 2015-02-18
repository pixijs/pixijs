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
                this._originalGetBounds = this.getBounds;


                this._originalHitTest = this.hitTest;

                this.renderWebGL = this._renderCachedWebGL;
                this.renderCanvas = this._renderCachedCanvas;



            }
            else
            {
                if(this._cachedSprite)
                {
                    this._destroyCachedDisplayObject();
                }

                this.renderWebGL = this._originalRenderWebGL;
                this.renderCanvas = this._originalRenderCanvas;
                this.getBounds = this._originalGetBounds;

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

    // first we flush anything left in the renderer (otherwise it would get rendered to the cached texture)
    renderer.currentRenderer.flush();

    // next we find the dimensions of the untransformed object
    // this function also calls updatetransform on all its children as part of the measuring. This means we don't need to update the transform again in this function
    var bounds = this.getLocalBounds();

    // for now we cache the current renderTarget that the webGL renderer is currently using.
    // this could be more elegent..
    var cachedRenderTarget = renderer.currentRenderTarget;
    // We also store the filter stack - I will definitely look to change how this works a little later down the line.
    var stack = renderer.filterManager.filterStack;

    // this renderTexture will be used to store the cached DisplayObject
    var renderTexture = new RenderTexture(renderer, bounds.width | 0, bounds.height | 0);

    // need to set //
    var m = _tempMatrix;

    m.tx = -bounds.x;
    m.ty = -bounds.y;

    // set all properties to there original so we can render to a texture
    this.renderWebGL = this._originalRenderWebGL;

    renderTexture.render(this, m, true);

    // now restore the state be setting the new properties
    renderer.setRenderTarget(cachedRenderTarget);
    renderer.filterManager.filterStack = stack;

    this.renderWebGL     = this._renderCachedWebGL;
    this.updateTransform = this.displayObjectUpdateTransform;
    this.getBounds       = this._getCahcedBounds;


    // create our cached sprite
    this._cachedSprite = new Sprite(renderTexture);
    this._cachedSprite.worldTransform = this.worldTransform;
    this._cachedSprite.anchor.x = -( bounds.x / bounds.width );
    this._cachedSprite.anchor.y = -( bounds.y / bounds.height );

    // map the hit test..
    this.hitTest = this._cachedSprite.hitTest.bind(this._cachedSprite);
};


DisplayObject.prototype._renderCachedCanvas = function(renderer)
{
    this._initCachedDisplayObjectCanvas( renderer );

    this._cachedSprite.worldAlpha = this.worldAlpha;

    this._cachedSprite.renderCanvas(renderer);
};

//TODO this can be the same as the webGL verison.. will need to do a little tweaking first though..
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
    this.renderCanvas = this._originalRenderCanvas;

    renderTexture.render(this, m, true);

    // now restore the state be setting the new properties
    renderer.context = cachedRenderTarget;

    this.renderCanvas = this._renderCachedCanvas;
    this.updateTransform = this.displayObjectUpdateTransform;
    this.getBounds  = this._getCahcedBounds;


    // create our cached sprite
    this._cachedSprite = new Sprite(renderTexture);
    this._cachedSprite.worldTransform = this.worldTransform;
    this._cachedSprite.anchor.x = -( bounds.x / bounds.width );
    this._cachedSprite.anchor.y = -( bounds.y / bounds.height );
    this.hitTest = this._cachedSprite.hitTest.bind(this._cachedSprite);
};

DisplayObject.prototype._getCahcedBounds = function()
{
    this._cachedSprite._currentBounds = null;

    return this._cachedSprite.getBounds();
};

DisplayObject.prototype._destroyCachedDisplayObject = function()
{
    this._cachedSprite._texture.destroy();
    this._cachedSprite = null;
};



module.exports = {};
