var ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    SpriteBatchShader = require('./SpriteBatchShader'),
    math            = require('../../math');

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's SpriteBatchRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/SpriteBatchRenderer.java
 */

/**
 *
 * @class
 * @private
 * @namespace PIXI
 * @param renderer {WebGLRenderer} The renderer this sprite batch works for.
 */
function SpriteBatchRenderer(renderer)
{
    ObjectRenderer.call(this, renderer);

    /**
     *
     *
     * @member {number}
     */
    this.vertSize = 10;

    /**
     *
     *
     * @member {number}
     */
    this.vertByteSize = this.vertSize * 4;

    /**
     * The number of images in the SpriteBatch before it flushes.
     *
     * @member {number}
     */
    this.size = 2000;//CONST.SPRITE_BATCH_SIZE; // 2000 is a nice balance between mobile / desktop

    // the total number of bytes in our batch
    var numVerts = this.size * 4 * this.vertByteSize;
    // the total number of indices in our batch
    var numIndices = this.size * 6;

    /**
     * Holds the vertices
     *
     * @member {ArrayBuffer}
     */
    this.vertices = new Float32Array(numVerts);

    /**
     * Holds the indices
     *
     * @member {Uint16Array}
     */
    this.indices = new Uint16Array(numIndices);

    /**
     *
     *
     * @member {number}
     */
    this.lastIndexCount = 0;

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
     * @member {boolean}
     */
    this.drawing = false;

    /**
     *
     *
     * @member {number}
     */
    this.currentBatchSize = 0;

    /**
     *
     *
     * @member {BaseTexture}
     */
    this.currentBaseTexture = null;

    /**
     *
     *
     * @member {Array}
     */
    this.textures = [];

    /**
     *
     *
     * @member {Array}
     */
    this.blendModes = [];

    /**
     *
     *
     * @member {Array}
     */
    this.shaders = [];

    /**
     *
     *
     * @member {Array}
     */
    this.sprites = [];

    /**
     * The default shader that is used if a sprite doesn't have a more specific one.
     *
     * @member {Shader}
     */
    this.shader = null;

    this.tempMatrix = new math.Matrix();
}

SpriteBatchRenderer.prototype = Object.create(ObjectRenderer.prototype);
SpriteBatchRenderer.prototype.constructor = SpriteBatchRenderer;
module.exports = SpriteBatchRenderer;

WebGLRenderer.registerPlugin('spriteBatch', SpriteBatchRenderer);

/**
 * Sets up the renderer context and necessary buffers.
 *
 * @private
 * @param gl {WebGLContext} the current WebGL drawing context
 */
SpriteBatchRenderer.prototype.onContextChange = function ()
{
    var gl = this.renderer.gl;

    // setup default shader
    this.shader = new SpriteBatchShader(this.renderer.shaderManager);

    // create a couple of buffers
    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();

    // 65535 is max index, so 65535 / 6 = 10922.

    //upload the index data
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

    this.currentBlendMode = 99999;
};

/**
 * Renders the sprite object.
 *
 * @param sprite {Sprite} the sprite to render when using this spritebatch
 */
SpriteBatchRenderer.prototype.render = function ( spriteBatch )
{
    var children = spriteBatch.children;

    // if the uvs have not updated then no point rendering just yet!
    //this.renderer.blendModeManager.setBlendMode(sprite.blendMode);
    var gl = this.renderer.gl;

    var m =  spriteBatch.worldTransform.copy( this.tempMatrix );
    m.prepend( this.renderer.currentRenderTarget.projectionMatrix );

    gl.uniformMatrix3fv(this.shader.uniforms.projectionMatrix._location, false, m.toArray(true));

    for (var i=0,j= children.length; i<j; i++)
    {
        this.renderSprite( children[i] );
    }

    this.flush();
};

/**
 * Renders the sprite object.
 *
 * @param sprite {Sprite} the sprite to render when using this spritebatch
 */
SpriteBatchRenderer.prototype.renderSprite = function (sprite)
{
    var texture = sprite._texture;

    //TODO set blend modes..
    // check texture..
    if (this.currentBatchSize >= this.size)
    {
        this.flush();
        this.currentBaseTexture = texture.baseTexture;
    }

    // get the uvs for the texture
    var uvs = texture._uvs;

    // if the uvs have not updated then no point rendering just yet!
    if (!uvs)
    {
        return;
    }

    var vertices = this.vertices, w0, w1, h0, h1, index;

    if (texture.trim)
    {
        // if the sprite is trimmed then we need to add the extra space before transforming the sprite coords..
        var trim = texture.trim;

        w1 = trim.x - sprite.anchor.x * trim.width;
        w0 = w1 + texture.crop.width;

        h1 = trim.y - sprite.anchor.y * trim.height;
        h0 = h1 + texture.crop.height;
    }
    else
    {
        w0 = (texture._frame.width ) * (1-sprite.anchor.x);
        w1 = (texture._frame.width ) * -sprite.anchor.x;

        h0 = texture._frame.height * (1-sprite.anchor.y);
        h1 = texture._frame.height * -sprite.anchor.y;
    }


    index = this.currentBatchSize * this.vertByteSize;

    // lets upload!
    vertices[index++] = w1;
    vertices[index++] = h1;

    vertices[index++] = sprite.position.x;
    vertices[index++] = sprite.position.y;

    //scale
    vertices[index++] = sprite.scale.x;
    vertices[index++] = sprite.scale.y;

    //rotation
    vertices[index++] = sprite.rotation;

    // uv
    vertices[index++] = uvs.x0;
    vertices[index++] = uvs.y1;
    // color
    vertices[index++] = sprite.alpha;


    // xy
    vertices[index++] = w0;
    vertices[index++] = h1;

    vertices[index++] = sprite.position.x;
    vertices[index++] = sprite.position.y;

    //scale
    vertices[index++] = sprite.scale.x;
    vertices[index++] = sprite.scale.y;

     //rotation
    vertices[index++] = sprite.rotation;

    // uv
    vertices[index++] = uvs.x1;
    vertices[index++] = uvs.y1;
    // color
    vertices[index++] = sprite.alpha;


    // xy
    vertices[index++] = w0;
    vertices[index++] = h0;

    vertices[index++] = sprite.position.x;
    vertices[index++] = sprite.position.y;

    //scale
    vertices[index++] = sprite.scale.x;
    vertices[index++] = sprite.scale.y;

     //rotation
    vertices[index++] = sprite.rotation;

    // uv
    vertices[index++] = uvs.x2;
    vertices[index++] = uvs.y2;
    // color
    vertices[index++] = sprite.alpha;


    // xy
    vertices[index++] = w1;
    vertices[index++] = h0;

    vertices[index++] = sprite.position.x;
    vertices[index++] = sprite.position.y;

    //scale
    vertices[index++] = sprite.scale.x;
    vertices[index++] = sprite.scale.y;

     //rotation
    vertices[index++] = sprite.rotation;

    // uv
    vertices[index++] = uvs.x3;
    vertices[index++] = uvs.y3;
    // color
    vertices[index++] = sprite.alpha;

    // color and alpha

    // increment the batchsize
    this.sprites[this.currentBatchSize++] = sprite;
};

/**
 * Renders the content and empties the current batch.
 *
 */
SpriteBatchRenderer.prototype.flush = function ()
{
    // If the batch is length 0 then return as there is nothing to draw
    if (this.currentBatchSize === 0)
    {
        return;
    }

    var gl = this.renderer.gl;

    // upload the verts to the buffer
    if (this.currentBatchSize > ( this.size * 0.5 ) )
    {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
    }
    else
    {
        var view = this.vertices.subarray(0, this.currentBatchSize * this.vertByteSize);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
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
SpriteBatchRenderer.prototype.renderBatch = function (texture, size, startIndex)
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

    // now draw those suckas!
    gl.drawElements(gl.TRIANGLES, size * 6, gl.UNSIGNED_SHORT, startIndex * 6 * 2);

    // increment the draw count
    this.renderer.drawCount++;
};

/**
 * Starts a new sprite batch.
 *
 */
SpriteBatchRenderer.prototype.start = function ()
{
    var gl = this.renderer.gl;

    // bind the main texture
    gl.activeTexture(gl.TEXTURE0);

    // bind the buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    var shader = this.shader;

   this.renderer.shaderManager.setShader(shader);
    // this is the same for each shader?
    var stride =  this.vertByteSize;

    gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(shader.attributes.aPositionCoord, 2, gl.FLOAT, false, stride, 2 * 4);
    gl.vertexAttribPointer(shader.attributes.aScale, 2, gl.FLOAT, false, stride, 4 * 4);

    gl.vertexAttribPointer(shader.attributes.aRotation, 1, gl.FLOAT, false, stride, 6 * 4);
    gl.vertexAttribPointer(shader.attributes.aTextureCoord, 2, gl.FLOAT, false, stride, 7 * 4);
    gl.vertexAttribPointer(shader.attributes.aColor, 1, gl.FLOAT, false, stride, 9 * 4);

 //   gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, this.renderer.currentRenderTarget.projectionMatrix.toArray(true));
};

/**
 * Destroys the SpriteBatch.
 *
 */
SpriteBatchRenderer.prototype.destroy = function ()
{
    this.renderer.gl.deleteBuffer(this.vertexBuffer);
    this.renderer.gl.deleteBuffer(this.indexBuffer);

    this.shader.destroy();

    this.renderer = null;

    this.vertices = null;
    this.indices = null;

    this.vertexBuffer = null;
    this.indexBuffer = null;

    this.currentBaseTexture = null;

    this.drawing = false;

    this.textures = null;
    this.blendModes = null;
    this.shaders = null;
    this.sprites = null;
    this.shader = null;
};
