var ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    ParticleShader = require('./ParticleShader'),
    ParticleBuffer = require('./ParticleBuffer'),
    math            = require('../../math');

var SpriteDataCache = function ()
{
    this.rotation = 0;
    this.pX = 0;
    this.pY = 0;
    this.texture = null;
    this.sX = 0;
    this.sY = 0;
    this.alpha = 0;
};


/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's ParticleRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/ParticleRenderer.java
 */

/**
 *
 * @class
 * @private
 * @namespace PIXI
 * @param renderer {WebGLRenderer} The renderer this sprite batch works for.
 */
function ParticleRenderer(renderer)
{
    ObjectRenderer.call(this, renderer);


    /**
     * The number of images in the Particle before it flushes.
     *
     * @member {number}
     */
    this.size = 15000;//CONST.SPRITE_BATCH_SIZE; // 2000 is a nice balance between mobile / desktop
    this.maxSprites = 200000;

    var numIndices = this.size * 6;

    /**
     * Holds the indices
     *
     * @member {Uint16Array}
     */
    this.indices = new Uint16Array(numIndices);

    for (var i=0, j=0; i < numIndices; i += 6, j += 4)
    {
        this.indices[i + 0] = j + 0;
        this.indices[i + 1] = j + 1;
        this.indices[i + 2] = j + 2;
        this.indices[i + 3] = j + 0;
        this.indices[i + 4] = j + 2;
        this.indices[i + 5] = j + 3;
    }

    /**
     *
     *
     * @member {number}
     */
    this.currentBatchSize = 0;

    /**
     *
     *
     * @member {Array}
     */
    this.sprites = [];
    this.spriteDataCache = [];

    /**
     * The default shader that is used if a sprite doesn't have a more specific one.
     *
     * @member {Shader}
     */
    this.shader = null;

    this.buffers = [];

    this.tempMatrix = new math.Matrix();
}

ParticleRenderer.prototype = Object.create(ObjectRenderer.prototype);
ParticleRenderer.prototype.constructor = ParticleRenderer;
module.exports = ParticleRenderer;

WebGLRenderer.registerPlugin('particle', ParticleRenderer);

/**
 * Sets up the renderer context and necessary buffers.
 *
 * @private
 * @param gl {WebGLContext} the current WebGL drawing context
 */
ParticleRenderer.prototype.onContextChange = function ()
{
    var gl = this.renderer.gl;

    // setup default shader
    this.shader = new ParticleShader(this.renderer.shaderManager);

    this.indexBuffer = gl.createBuffer();

    // 65535 is max index, so 65535 / 6 = 10922.

    //upload the index data
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    this.setSize(this.maxSprites);
};

ParticleRenderer.prototype.setSize = function ( totalSize )
{
    var gl = this.renderer.gl;

    var i;

    for (i = 0; i < totalSize; i += this.size)
    {
        this.buffers.push( new ParticleBuffer(gl, this.size) );
    }

    for (i = 0; i < totalSize; i++)
    {
        this.spriteDataCache.push(new SpriteDataCache());
    }
};


/**
 * Renders the sprite object.
 *
 * @param sprite {Sprite} the sprite to render when using this Particle
 */
ParticleRenderer.prototype.render = function ( Particle )
{
    var children = Particle.children;

    // if the uvs have not updated then no point rendering just yet!
    //this.renderer.blendModeManager.setBlendMode(sprite.blendMode);
    var gl = this.renderer.gl;

    var m =  Particle.worldTransform.copy( this.tempMatrix );
    m.prepend( this.renderer.currentRenderTarget.projectionMatrix );

    gl.uniformMatrix3fv(this.shader.uniforms.projectionMatrix._location, false, m.toArray(true));

    this.currentBatchSize = 0;
/*
    var rotationDirty = false;
    var positionDirty = false;
    var vertsDirty = false;
    var uvsDirty = false;
    var alphaDirty = false;*/

    this.sprites = children;

    this.vertDirty = 0;

    for (var i=0,j= children.length; i<j; i++)
    {
       // var sprite = children[i]
    //    var spriteCache = this.spriteDataCache[i];

        this.currentBatchSize++;
/*
        if (sprite._texture !== spriteCache.texture)
        {
            spriteCache.texture = sprite._texture;
            vertsDirty = true;

            uvsDirty = true;
        }

        var sx = sprite.scale.x, sy = sprite.scale.y;
        if (sx !== spriteCache.sX || sy !== spriteCache.sY)
        {
            spriteCache.sX = sx;
            spriteCache.sY = sy;
            vertsDirty = true;
        }

        var px = sprite.position.x, py = sprite.position.y
        if (px !== spriteCache.pX || py !== spriteCache.pY)
        {
            spriteCache.pX = px;
            spriteCache.pY = py;

            positionDirty = true;
        }

        if (sprite.rotation !== spriteCache.rotation)
        {
            spriteCache.rotation = sprite.rotation;
            rotationDirty = true;
        }

        if (sprite.alpha !== spriteCache.alpha)
        {
            spriteCache.alpha = sprite.alpha;
            alphaDirty = true;
        }*/

    }

/*
    if (vertsDirty)this.uploadVerticies(children);
    if (positionDirty)this.uploadPosition(children);
    if (rotationDirty)this.uploadRotation(children);
    if (uvsDirty)this.uploadUvs(children);
    if (alphaDirty)this.uploadAlpha(children);
*/
     this.uploadPosition(children);
    if (this._childCache !== children.length)
    {
        this.refresh(children);
        this._childCache = children.length;
    }

    this.flush();
};


ParticleRenderer.prototype.refresh = function(children)
{
    this.uploadVerticies(children);

    this.uploadRotation(children);
    this.uploadUvs(children);
    this.uploadAlpha(children);
};

ParticleRenderer.prototype.uploadVerticies = function (children)
{
    var j = 0;
    for (var i = 0; i < children.length; i+=this.size)
    {
        var amount = ( children.length - i );
        if (amount > this.size)
        {
            amount = this.size;
        }

        this.buffers[j++].uploadVerticies(children, i, amount);
    }
};

ParticleRenderer.prototype.uploadPosition = function (children)
{
    var j = 0;
    for (var i = 0; i < children.length; i+= this.size)
    {
        var amount = ( children.length - i );
        if (amount > this.size)
        {
            amount = this.size;
        }

        this.buffers[j++].uploadPosition(children, i,  amount);
    }
};

ParticleRenderer.prototype.uploadRotation = function (children)
{
    var j = 0;
    for (var i = 0; i < children.length; i+=this.size)
    {
        var amount = ( children.length - i );
        if (amount > this.size)
        {
            amount = this.size;
        }

        this.buffers[j++].uploadRotation(children, i, amount);
    }
};

ParticleRenderer.prototype.uploadUvs = function (children)
{
    var j = 0;
    for (var i = 0; i < children.length; i+=this.size)
    {
        var amount = ( children.length - i );
        if (amount > this.size)
        {
            amount = this.size;
        }

        this.buffers[j++].uploadUvs(children, i, amount);
    }
};

ParticleRenderer.prototype.uploadAlpha = function (children)
{
    var j = 0;
    for (var i = 0; i < children.length; i+=this.size)
    {
        var amount = ( children.length - i );
        if (amount > this.size)
        {
            amount = this.size;
        }

        this.buffers[j++].uploadAlpha(children, i, amount);
    }
};

/**
 * Renders the content and empties the current batch.
 *
 */
ParticleRenderer.prototype.flush = function ()
{
    // If the batch is length 0 then return as there is nothing to draw
    if (this.currentBatchSize === 0)
    {
        return;
    }

    var nextTexture;
    var batchSize = 0;
    var start = 0;

    var currentBaseTexture = null;

    var sprite;

    for (var i = 0, j = this.currentBatchSize; i < j; i++)
    {

        sprite = this.sprites[i];

        nextTexture = sprite._texture.baseTexture;

        if (currentBaseTexture !== nextTexture)
        {
            this.renderBatch(currentBaseTexture, batchSize, start);

            start = i;
            batchSize = 0;
            currentBaseTexture = nextTexture;
        }

        batchSize++;
    }

    this.renderBatch(currentBaseTexture, batchSize, start);

    // then reset the batch!
    this.currentBatchSize = 0;
};

/**
 * Draws the currently batches sprites.
 *
 * @private
 * @param texture {Texture}
 * @param size {number}
 * @param startIndex {number}
 */
ParticleRenderer.prototype.renderBatch = function (texture, size, startIndex)
{
    if (size === 0)
    {
        return;
    }

    var gl = this.renderer.gl;

    if (!texture._glTextures[gl.id])
    {
        this.renderer.updateTexture(texture);
    }
    else
    {
        // bind the current texture
        gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
    }

    var j = 0;
    for (var i = startIndex; i < size; i+=this.size) {

        this.buffers[j++].bind( this.shader );


        var amount = ( size - i) ;
        if (amount > this.size)
        {
            amount = this.size;
        }

         // now draw those suckas!
        gl.drawElements(gl.TRIANGLES, this.size * 6, gl.UNSIGNED_SHORT, 0);//(startIndex % this.size) * 6 * 2);
    }



    // increment the draw count
    this.renderer.drawCount++;
};

/**
 * Starts a new sprite batch.
 *
 */
ParticleRenderer.prototype.start = function ()
{
    var gl = this.renderer.gl;

    // bind the main texture
    gl.activeTexture(gl.TEXTURE0);

    // bind the buffers

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    var shader = this.shader;

   this.renderer.shaderManager.setShader(shader);
};

/**
 * Destroys the Particle.
 *
 */
ParticleRenderer.prototype.destroy = function ()
{
    this.renderer.gl.deleteBuffer(this.vertexBuffer);
    this.renderer.gl.deleteBuffer(this.indexBuffer);

    this.shader.destroy();

    this.renderer = null;

    this.vertices = null;
    this.indices = null;

    this.vertexBuffer = null;
    this.indexBuffer = null;

    this.drawing = false;

    this.textures = null;
    this.blendModes = null;
    this.shaders = null;
    this.sprites = null;
    this.shader = null;
};


