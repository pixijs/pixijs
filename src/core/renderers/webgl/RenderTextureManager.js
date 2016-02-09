var GLTexture = require('pixi-gl-core').GLTexture,
	utils = require('../../utils'),
    RenderTarget = require('./utils/RenderTarget');

/**
 * Helper class to create a webGL Texture
 *
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext}
 */

var RenderTextureManager = function(renderer)
{
    this.renderer = renderer
	this.gl = renderer.gl;

	// track textures in the renderer so we can no longer listen to them on destruction.
	this._managedTextures = [];
}

/**
 * Updates and/or Creates a WebGL texture for the renderer's context.
 *
 * @param texture {PIXI.BaseTexture|PIXI.Texture} the texture to update
 */
RenderTextureManager.prototype.updateTexture = function(texture)
{
	texture = texture.baseTexture || texture;

    var renderTarget = texture._glRenderTargets[this.renderer.CONTEXT_UID];
    
    if (!renderTarget)
    {

        renderTarget = new RenderTarget(this.gl, texture.width, texture.height, texture.scaleMode, texture.resolution);

        texture._glTextures[this.renderer.CONTEXT_UID] = renderTarget.texture;
        texture._glRenderTargets[this.renderer.CONTEXT_UID] = renderTarget;

        texture.on('update', this.updateTexture, this);
        texture.on('dispose', this.destroyTexture, this);
        
        this._managedTextures.push(texture);


    }
    renderTarget.resize(texture.width, texture.height);

    return  renderTarget;
}

/**
 * Deletes the texture from WebGL
 *
 * @param texture {PIXI.BaseTexture|PIXI.Texture} the texture to destroy
 */
RenderTextureManager.prototype.destroyTexture = function(texture, _skipRemove)
{
	texture = texture.baseTexture || texture;
   
    var gl = this.gl;
    if (texture._glRenderTargets[this.renderer.CONTEXT_UID])
    {
        texture._glTextures[this.renderer.CONTEXT_UID] = null;
        texture._glRenderTargets[this.renderer.CONTEXT_UID].destroy();

        //.destroy();
        texture.off('update', this.updateTexture, this);
        texture.off('dispose', this.destroyTexture, this);


        delete texture._glTextures[this.renderer.CONTEXT_UID];

        if (!_skipRemove)
        {
            var i = this._managedTextures.indexOf(texture);
            if (i !== -1) {
                utils.removeItems(this._managedTextures, i, 1);
            }
        }
    }
}

RenderTextureManager.prototype.removeAll = function()
{
	// empty all the old gl textures as they are useless now
    for (var i = 0; i < this._managedTextures.length; ++i)
    {
        var texture = this._managedTextures[i];
        if (texture._glTextures[this.renderer.CONTEXT_UID])
        {
            delete texture._glTextures[this.renderer.CONTEXT_UID];
        }
    }
}

RenderTextureManager.prototype.destroy = function()
{
    // destroy managed textures
    for (var i = 0; i < this._managedTextures.length; ++i)
    {
        var texture = this._managedTextures[i];
        this.destroyTexture(texture, true);
        texture.off('update', this.updateTexture, this);
        texture.off('dispose', this.destroyTexture, this);
    }

    this._managedTextures = null;
}

module.exports = RenderTextureManager;

