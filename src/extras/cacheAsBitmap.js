'use strict';
var math = require('../core/math'),
    RenderTexture = require('../core/textures/RenderTexture'),
    DisplayObject = require('../core/display/DisplayObject'),
    Sprite = require('../core/sprites/Sprite'),

    _tempMatrix = new math.Matrix();

DisplayObject.prototype._cacheAsBitmap = false;
DisplayObject.prototype._originalRenderWebGL = false;

DisplayObject.prototype._originalUpdateTransform = null;
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
                this._originalUpdateTransform = this.updateTransform;

                this.renderWebGL = this._renderCachedWebGL;
                this.updateTransform = this.displayObjectUpdateTransform;
            }
            else
            {
                if(this._cachedSprite)
                {
                    this._destroyCachedDisplayObject();
                }

                this.renderWebGL = this._originalRenderWebGL;
                this.updateTransform = this._originalUpdateTransform;
            }
        }
    }
});

DisplayObject.prototype._renderCachedWebGL = function(renderer)
{
    this._initCachedDisplayObject( renderer );

    this._cachedSprite.worldAlpha = this.worldAlpha;

    renderer.plugins.sprite.render( this._cachedSprite );
};

DisplayObject.prototype._initCachedDisplayObject = function( renderer )
{
    if(this._cachedSprite)
    {
        return;
    }

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
    this.updateTransform = this._originalUpdateTransform;

    renderTexture.render(this, m, true);

    // TODO this could mess up the filter stack
    // TODO as this happens at runtime now this can be optimise this by removing the updateTransfom

    // now restore the state be setting the new properties
    renderer.setRenderTarget(cachedRenderTarget);

    this.updateTransform = this.displayObjectUpdateTransform;
    this.renderWebGL = this._renderCachedWebGL;
    this._cacheAsBitmap = true;

    // create our cached sprite
    this._cachedSprite = new Sprite(renderTexture);
    this._cachedSprite.worldTransform = this.worldTransform;
    this._cachedSprite.anchor.x = -( bounds.x / bounds.width );
    this._cachedSprite.anchor.y = -( bounds.y / bounds.height );

};

DisplayObject.prototype._destroyCachedDisplayObject = function()
{
    this._cachedSprite._texture.destroy();
    this._cachedSprite = null;
};

DisplayObject.prototype._renderCachedCanvas = function( renderer )
{
    this._initCachedDisplayObject( renderer );

    //TODO add some codes init!
};


module.exports = {};
