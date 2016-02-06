var ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    TextureShader = require('../../renderers/webgl/shaders/_TextureShader'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    createIndicesForQuads = require('../../utils/createIndicesForQuads'),
    generateMultiTextureShader = require('./generateMultiTextureShader'),
    CONST = require('../../const'),
    glCore = require('pixi-gl-core'),
    bitTwiddle = require('bit-twiddle');

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
    this.vertSize = 5;

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
    var numVerts = this.size * 4 * this.vertByteSize;

    // the total number of indices in our batch, there are 6 points per quad.
    var numIndices = this.size * 6;

    this.buffers = [];
    for (var i = 1; i <= bitTwiddle.nextPow2(this.size); i*=2) {
        var numVerts = i * 4 * this.vertByteSize;
        this.buffers.push(new Buffer(numVerts));
    };

    /**
     * Holds the vertex data that will be sent to the vertex shader.
     *
     * @member {ArrayBuffer}
     */
   // this.vertices = new ArrayBuffer(numVerts);

    /**
     * View on the vertices as a Float32Array for positions
     *
     * @member {Float32Array}
     */
   // this.positions = new Float32Array(this.vertices);
    
    /**
     * View on the vertices as a Uint32Array for uvs
     *
     * @member {Float32Array}
     */
    //this.uvs = new Uint32Array(this.vertices);

    /**
     * View on the vertices as a Uint32Array for colors
     *
     * @member {Uint32Array}
     */
    //this.colors = new Uint32Array(this.vertices);

    /**
     * Holds the indices of the geometry (quads) to draw
     *
     * @member {Uint16Array}
     */
    this.indices = createIndicesForQuads(this.size)

    /**
     * The default shader that is used if a sprite doesn't have a more specific one.
     *
     * @member {PIXI.Shader}
     */
    this.shader = null;

    this.textureCount = 0;
    this.currentIndex = 0;
    this.tick =0;
    this.groups = [];
    
    //TODO - 300 is a bit magic, figure out a nicer amount!
    for (var i = 0; i < this.size; i++) 
    {
        this.groups[i] = {textures:[], textureCount:0, ids:[], size:0, start:0, blend:0}; 
    };
    
    this.sprites = [];
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


    this.MAX_TEXTURES = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

    this.shader = generateMultiTextureShader(gl, this.MAX_TEXTURES);


    // create a couple of buffers
    this.vertexBuffer = glCore.GLBuffer.createVertexBuffer(gl, null, gl.DYNAMIC_DRAW);
    this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);

    // build the vao object that will render..
    this.vao = new glCore.VertexArrayObject(gl)
    .addIndex(this.indexBuffer)
    .addAttribute(this.vertexBuffer, this.shader.attributes.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0)
    .addAttribute(this.vertexBuffer, this.shader.attributes.aTextureCoord, gl.UNSIGNED_SHORT, true, this.vertByteSize, 2 * 4)
    .addAttribute(this.vertexBuffer, this.shader.attributes.aColor, gl.UNSIGNED_BYTE, true, this.vertByteSize, 3 * 4)
    .addAttribute(this.vertexBuffer, this.shader.attributes.aTextureId, gl.FLOAT, false, this.vertByteSize, 4 * 4);

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
    if (this.currentIndex >= this.size)
    {
        this.flush();
    }

  
    // get the uvs for the texture
   

    // if the uvs have not updated then no point rendering just yet!
    if (!sprite.texture._uvs)
    {
        return;
    }

    // push a texture.
    // increment the batchsize
    this.sprites[this.currentIndex++] = sprite;
};

/**
 * Renders the content and empties the current batch.
 *
 */
SpriteRenderer.prototype.flush = function ()
{
    if (this.currentIndex === 0)return;

    var gl = this.renderer.gl;

    var np2 = bitTwiddle.nextPow2(this.currentIndex);
    var log2 = bitTwiddle.log2(np2);
    var buffer = this.buffers[log2];

    var sprites = this.sprites;
    var groups = this.groups;
    var currentIndex = this.currentIndex;
    
    var colors = buffer.colors;
    var positions = buffer.positions;
    var uvsBuffer = buffer.uvs;

    var index = 0;
    var nextTexture;
    var currentTexture;
    var groupCount = 1;
    var textureCount = 0;
    var currentGroup = groups[0];
    var vertexData;
    var tint;
    var uvs;
    var textureId;
    var blendMode = 0;
    currentGroup.textureCount = 0;
    
    this.tick++;

    for (var i = 0; i < currentIndex; i++) 
    {
        // upload the sprite elemetns...
        // they have all ready been calculated so we just need to push them into the buffer.
        var sprite = sprites[i];

        nextTexture = sprite._texture.baseTexture;

        if(blendMode !== sprite.blendMode)
        {
          //  blendMode = sprite.blendMode;
          //  currentTexture = null;
          //  textureCount = this.Max
        }

        if(currentTexture !== nextTexture)
        {
            currentTexture = nextTexture;
            
            if(nextTexture._enabled !== this.tick)
            {
                nextTexture._enabled = this.tick;
                nextTexture._id = textureCount;
                
                if(textureCount === this.MAX_TEXTURES)
                {
                    this.tick++;

                    textureCount = 0;

                    currentGroup.size = currentIndex - currentGroup.start;
                   
                    currentGroup = groups[groupCount++];
                    currentGroup.textureCount = 0;
                    currentGroup.blend = blendMode;
                    currentGroup.start = currentIndex;
                }

                currentGroup.textures[currentGroup.textureCount++] = nextTexture;
            }

            textureCount++;
        }
       
        var vertexData = sprite.vertexData;

        //TODO this sum does not need to be set each frame..
        var tint = (sprite.tint >> 16) + (sprite.tint & 0xff00) + ((sprite.tint & 0xff) << 16) + (sprite.worldAlpha * 255 << 24);
        var uvs = sprite._texture._uvs.uvs_uint32;
        var textureId = nextTexture._id;

        //xy
        positions[index++] = vertexData[0];
        positions[index++] = vertexData[1];
        uvsBuffer[index++] = uvs[0];
        colors[index++] = tint;
        positions[index++] = textureId; 
        
        // xy
        positions[index++] = vertexData[2];
        positions[index++] = vertexData[3];
        uvsBuffer[index++] = uvs[1];
        colors[index++] = tint;
        positions[index++] = textureId;

         // xy
        positions[index++] = vertexData[4];
        positions[index++] = vertexData[5];
        uvsBuffer[index++] = uvs[2];
        colors[index++] = tint;
        positions[index++] = textureId;

        // xy
        positions[index++] = vertexData[6];
        positions[index++] = vertexData[7];
        uvsBuffer[index++] = uvs[3];
        colors[index++] = tint;
        positions[index++] = textureId;

    };

    currentGroup.size = currentIndex - currentGroup.start;
   
    this.vertexBuffer.upload(buffer.vertices, 0, true);
 

    /// render the groups..
    for (i = 0; i < groupCount; i++) {
        
        var group = groups[i];

        for (var j = 0; j < group.textureCount; j++) {
            this.renderer.bindTexture(group.textures[j], j);
        };

        // set the blend mode..
        this.renderer.state.setBlendMode( group.blend );

        gl.drawElements(gl.TRIANGLES, group.size * 6, gl.UNSIGNED_SHORT, group.start * 6 * 2);
    };

    // reset elements for the next flush
    this.currentIndex = 0;
};

/**
 * Starts a new sprite batch.
 *
 */
SpriteRenderer.prototype.start = function ()
{
    this.renderer.bindShader(this.shader);
    this.vao.bind();
    this.vertexBuffer.bind();
    this.tick %= 1000;
};

SpriteRenderer.prototype.stop = function ()
{
    this.flush();
    this.vao.unbind();
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

    this.vertexBuffer = null;
    this.indexBuffer = null;

    this.sprites = null;
    this.shader = null;
};

var Buffer = function(size)
{

    this.vertices = new ArrayBuffer(size);

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

    //this.buffer = 
}