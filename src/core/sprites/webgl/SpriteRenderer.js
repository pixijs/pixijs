var ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    TextureShader = require('../../renderers/webgl/shaders/_TextureShader'),
    createIndicesForQuads = require('../../utils/createIndicesForQuads'),
    CONST = require('../../const'),
    glCore = require('pixi-gl-core');

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's SpriteRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/SpriteRenderer.java
 */

/**
 * Renderer dedicated to drawing and batching sprites.
 *
 * @class
 * @private
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.WebGLRenderer} The renderer this sprite batch works for.
 */
function SpriteRenderer(renderer)
{
    ObjectRenderer.call(this, renderer);

    /**
     * Number of values sent in the vertex buffer.
     * positionX, positionY, colorR, colorG, colorB = 5
     *
     * @member {number}
     */
    this.vertSize = 4;

    /**
     * The size of the vertex information in bytes.
     *
     * @member {number}
     */
    this.vertByteSize = this.vertSize * 4;

    /**
     * The number of images in the SpriteBatch before it flushes.
     *
     * @member {number}
     */
    this.size = CONST.SPRITE_BATCH_SIZE; // 2000 is a nice balance between mobile / desktop

    // the total number of bytes in our batch
    var numVerts = (this.size * 4) * this.vertByteSize;

    // the total number of indices in our batch, there are 6 points per quad.
    var numIndices = this.size * 6;

    /**
     * Holds the vertex data that will be sent to the vertex shader.
     *
     * @member {ArrayBuffer}
     */
    this.vertices = new ArrayBuffer(numVerts);


    /**
     * View on the vertices as a Float32Array for positions
     *
     * @member {Float32Array}
     */
    this.positions = new Float32Array(this.vertices);
    
    /**
     * View on the vertices as a Uint32Array for uvs
     *
     * @member {Float32Array}
     */
    this.uvs = new Uint32Array(this.vertices);

    /**
     * View on the vertices as a Uint32Array for colors
     *
     * @member {Uint32Array}
     */
    this.colors = new Uint32Array(this.vertices);

    /**
     * Holds the indices of the geometry (quads) to draw
     *
     * @member {Uint16Array}
     */
    this.indices = createIndicesForQuads(this.size)

    /**
     * The current size of the batch, each render() call adds to this number.
     *
     * @member {number}
     */
    this.currentBatchSize = 0;

    /**
     * The current sprites in the batch.
     *
     * @member {PIXI.Sprite[]}
     */
    this.sprites = [];

    /**
     * The default shader that is used if a sprite doesn't have a more specific one.
     *
     * @member {PIXI.Shader}
     */
    this.shader = null;
}

SpriteRenderer.prototype = Object.create(ObjectRenderer.prototype);
SpriteRenderer.prototype.constructor = SpriteRenderer;
module.exports = SpriteRenderer;

WebGLRenderer.registerPlugin('sprite', SpriteRenderer);

/**
 * Sets up the renderer context and necessary buffers.
 *
 * @private
 * @param gl {WebGLRenderingContext} the current WebGL drawing context
 */
SpriteRenderer.prototype.onContextChange = function ()
{
    var gl = this.renderer.gl;

    this._shader = new TextureShader(gl);

    // setup default shader
    this.shader = this.renderer.shaderManager.defaultShader;

    // create a couple of buffers
    this.vertexBuffer = glCore.GLBuffer.createVertexBuffer(gl, gl.DYNAMIC_DRAW);//// gl.createBuffer();
    this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, gl.STATIC_DRAW);
    this.indexBuffer.upload(this.indices);

    this.vao = new glCore.VertexArrayObject(gl);

    this.vao.addIndex(this.indexBuffer);
    this.vao.addAttribute(this.vertexBuffer, this._shader.attributes.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0);
    this.vao.addAttribute(this.vertexBuffer, this._shader.attributes.aTextureCoord, gl.UNSIGNED_SHORT, true, this.vertByteSize, 2 * 4);
    this.vao.addAttribute(this.vertexBuffer, this._shader.attributes.aColor, gl.UNSIGNED_BYTE, true, this.vertByteSize, 3 * 4);

    this.currentBlendMode = 99999;
};

/**
 * Renders the sprite object.
 *
 * @param sprite {PIXI.Sprite} the sprite to render when using this spritebatch
 */
SpriteRenderer.prototype.render = function (sprite)
{
    //TODO set blend modes..
    // check texture..
    if (this.currentBatchSize >= this.size)
    {
        this.flush();
    }

    // get the uvs for the texture
    var uvs = sprite.texture._uvs;

    // if the uvs have not updated then no point rendering just yet!
    if (!uvs)
    {
        return;
    }

    // TODO trim??
    var index = this.currentBatchSize * this.vertByteSize;

    var colors = this.colors;
    var positions = this.positions;

    var vertexData = sprite.vertexData

    positions[index] = vertexData[0];
    positions[index+1] = vertexData[1];

    // xy
    positions[index+4] = vertexData[2];
    positions[index+5] = vertexData[3];

     // xy
    positions[index+8] = vertexData[4];
    positions[index+9] = vertexData[5];

    // xy
    positions[index+12] = vertexData[6];
    positions[index+13] = vertexData[7];
    

    // upload som uvs!
    this.uvs[index + 2] = uvs.uvs_uint32[0];
    this.uvs[index + 6] = uvs.uvs_uint32[1];
    this.uvs[index + 10] = uvs.uvs_uint32[2];
    this.uvs[index + 14] = uvs.uvs_uint32[3];

    var tint = sprite.tint;
    colors[index+3] = colors[index+7] = colors[index+11] = colors[index+15] = (tint >> 16) + (tint & 0xff00) + ((tint & 0xff) << 16) + (sprite.worldAlpha * 255 << 24);


    // increment the batchsize
    this.sprites[this.currentBatchSize++] = sprite;
};

SpriteRenderer.prototype.renderSprites = function (sprites)
{
    for (var i = 0; i < sprites.length; i++) 
    {
        sprites[i]
    };
}

/**
 * Renders the content and empties the current batch.
 *
 */
SpriteRenderer.prototype.flush = function ()
{
    // If the batch is length 0 then return as there is nothing to draw
    if (this.currentBatchSize === 0)
    {
        return;
    }

    var gl = this.renderer.gl;
    var shader;

    // upload the verts to the buffer
    if (this.currentBatchSize > ( this.size * 0.5 ) )
    {
      //  gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        this.vertexBuffer.upload(this.vertices, 0, true);
    }
    else
    {
        var view = this.positions.subarray(0, this.currentBatchSize * this.vertByteSize);
        this.vertexBuffer.upload(view, 0, true);
    }

    var nextTexture, nextBlendMode, nextShader;
    var batchSize = 0;
    var start = 0;

    var currentBaseTexture = null;
    var currentBlendMode = this.renderer.blendModeManager.currentBlendMode;
    var currentShader = null;

    var blendSwap = false;
    var shaderSwap = false;
    var sprite;

    for (var i = 0, j = this.currentBatchSize; i < j; i++)
    {

        sprite = this.sprites[i];

        nextTexture = sprite._texture.baseTexture;
        nextBlendMode = sprite.blendMode;
        nextShader = sprite.shader || this.shader;

        blendSwap = currentBlendMode !== nextBlendMode;
        shaderSwap = currentShader !== nextShader; // should I use uidS???

        if (currentBaseTexture !== nextTexture || blendSwap || shaderSwap)
        {
            this.renderBatch(currentBaseTexture, batchSize, start);

            start = i;
            batchSize = 0;
            currentBaseTexture = nextTexture;

            if (blendSwap)
            {
                currentBlendMode = nextBlendMode;
                this.renderer.blendModeManager.setBlendMode( currentBlendMode );
            }

            if (shaderSwap)
            {
                currentShader = nextShader;

                shader = currentShader.shaders ? currentShader.shaders[gl.id] : currentShader;

                if (!shader)
                {
                    shader = currentShader.getShader(this.renderer);

                }

                this.renderer.bindShader(this._shader);
            }
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
 * @param texture {PIXI.Texture}
 * @param size {number}
 * @param startIndex {number}
 */
SpriteRenderer.prototype.renderBatch = function (texture, size, startIndex)
{
    if (size === 0)
    {
        return;
    }

    var gl = this.renderer.gl;

    // bind the texture..
    this.renderer.bindTexture(texture, gl.TEXTURE0);
    
    // now draw those suckas!
    gl.drawElements(gl.TRIANGLES, size * 6, gl.UNSIGNED_SHORT, startIndex * 6 * 2);
};

/**
 * Starts a new sprite batch.
 *
 */
SpriteRenderer.prototype.start = function ()
{
    this.vao.bind();
};

/**
 * Destroys the SpriteBatch.
 *
 */
SpriteRenderer.prototype.destroy = function ()
{
    this.vertexBuffer.destroy();
    this.indexBuffer.destroy();

    ObjectRenderer.prototype.destroy.call(this);

    this.shader.destroy();

    this.renderer = null;

    this.vertices = null;
    this.positions = null;
    this.colors = null;
    this.indices = null;

    this.vertexBuffer = null;
    this.indexBuffer = null;

    this.sprites = null;
    this.shader = null;
};
