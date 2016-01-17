var ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    TextureShader = require('../../renderers/webgl/shaders/_TextureShader'),
    createIndicesForQuads = require('../../utils/createIndicesForQuads'),
    generateMultiTextureShader = require('./generateMultiTextureShader'),
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
     * The default shader that is used if a sprite doesn't have a more specific one.
     *
     * @member {PIXI.Shader}
     */
    this.shader = null;

    this.textureCount = 0;
    this.currentIndex = 0;
  
    this.groupCount = 0;
    this.groups = [];
    
    //TODO - 300 is a bit magic, figure out a nicer amount!
    for (var i = 0; i < this.size; i++) 
    {
        this.groups[i] = {textures:[], textureCount:0, ids:[], size:0, start:0, blend:0}; 
    };
    
    this.currentGroup = this.groups[this.groupCount++];

    this.currentTexture = null;    
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

    this.MAX_TEXTUES = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

    this._shader = generateMultiTextureShader(gl, this.MAX_TEXTUES)//new TextureShader(gl);

    // setup default shader
    this.shader = this.renderer.shaderManager.defaultShader;

    // create a couple of buffers
    this.vertexBuffer = glCore.GLBuffer.createVertexBuffer(gl, null, gl.DYNAMIC_DRAW);
    this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);

    // build the vao object that will render..
    this.vao = new glCore.VertexArrayObject(gl);

    this.vao.addIndex(this.indexBuffer);
    this.vao.addAttribute(this.vertexBuffer, this._shader.attributes.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0);
    this.vao.addAttribute(this.vertexBuffer, this._shader.attributes.aTextureCoord, gl.UNSIGNED_SHORT, true, this.vertByteSize, 2 * 4);
    this.vao.addAttribute(this.vertexBuffer, this._shader.attributes.aColor, gl.UNSIGNED_BYTE, true, this.vertByteSize, 3 * 4);
    this.vao.addAttribute(this.vertexBuffer, this._shader.attributes.aTextureId, gl.FLOAT, false, this.vertByteSize, 4 * 4);

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
    var nextTexture =  sprite.texture.baseTexture;
    var currentGroup = this.currentGroup;
    var i;

    if(this.currentTexture !== nextTexture)
    {
        this.currentTexture = nextTexture;
        
        if(!nextTexture._enabled)
        {
            nextTexture._enabled = true;
            nextTexture._id = this.textureCount;
            
            if(this.textureCount === this.MAX_TEXTUES)
            {
                for ( i = 0; i < currentGroup.textureCount; i++) 
                {     
                    currentGroup.textures[i]._enabled = false;
                };

                this.textureCount = 0;

                currentGroup.size = this.currentIndex - currentGroup.start;
               
                currentGroup = this.currentGroup = this.groups[this.groupCount++];
                currentGroup.textureCount = 0;
                currentGroup.start = this.currentIndex;
                
            }

            currentGroup.textures[currentGroup.textureCount++] = nextTexture;
        }

        this.textureCount++;
    }

    // TODO trim??
    var index = this.currentIndex * this.vertByteSize;

    this.currentIndex++;

    // upload the sprite elemetns...
    // they have all ready been calculated so we just need to push them into the buffer.
    var colors = this.colors;
    var positions = this.positions;
    var vertexData = sprite.vertexData
    var tint = (sprite.tint >> 16) + (sprite.tint & 0xff00) + ((sprite.tint & 0xff) << 16) + (sprite.worldAlpha * 255 << 24);
    var uvs = sprite.texture._uvs.uvs_uint32;
    //xy
    positions[index++] = vertexData[0];
    positions[index++] = vertexData[1];
    this.uvs[index++] = uvs[0];
    colors[index++] = tint;
    positions[index++] = nextTexture._id; 
    
    // xy
    positions[index++] = vertexData[2];
    positions[index++] = vertexData[3];
    this.uvs[index++] = uvs[1];
    colors[index++] = tint;
    positions[index++] = nextTexture._id;

     // xy
    positions[index++] = vertexData[4];
    positions[index++] = vertexData[5];
    this.uvs[index++] = uvs[2];
    colors[index++] = tint;
    positions[index++] = nextTexture._id;

    // xy
    positions[index++] = vertexData[6];
    positions[index++] = vertexData[7];
    this.uvs[index++] = uvs[3];
    colors[index++] = tint;
    positions[index++] = nextTexture._id;
};

/**
 * Renders the content and empties the current batch.
 *
 */
SpriteRenderer.prototype.flush = function ()
{
    if (this.currentIndex === 0)return;

    var gl = this.renderer.gl;


    this.currentGroup.size = this.currentIndex - this.currentGroup.start;
    for (var i = 0; i < this.currentGroup.textureCount; i++) 
    {     
        this.currentGroup.textures[i]._enabled = false;
    };
   
    // do some smart array stuff..
    // double size so we dont alway subarray the elements..
    // upload the verts to the buffer
    if (this.currentBatchSize > ( this.size * 0.5 ) )
    {
        this.vertexBuffer.upload(this.vertices, 0, true);
    }
    else
    {
        // o k .. sub array is SLOW>?
        var view = this.positions.subarray(0, this.currentIndex * this.vertByteSize);
        this.vertexBuffer.upload(view, 0, true);
    }

    // bind shader..
    this.renderer.bindShader(this._shader);
    this.renderer.blendModeManager.setBlendMode( 0 );

    /// render the groups..
    for (i = 0; i < this.groupCount; i++) {
        
        var group = this.groups[i];

        for (var j = 0; j < group.textureCount; j++) {
            this.renderer.bindTexture(group.textures[j], j);
        };

        gl.drawElements(gl.TRIANGLES, group.size * 6, gl.UNSIGNED_SHORT, group.start * 6 * 2);
    };

    // reset elements for the next flush
    this.currentTexture = null;
    this.currentIndex = 0;
    this.textureCount = 0;
    this.groupCount = 0;
    
    this.currentGroup = this.groups[this.groupCount++];
    this.currentGroup.textureCount = 0;
};

/**
 * Starts a new sprite batch.
 *
 */
SpriteRenderer.prototype.start = function ()
{
    this.vao.bind();
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

    this.vertices = null;
    this.positions = null;
    this.colors = null;
    this.indices = null;

    this.vertexBuffer = null;
    this.indexBuffer = null;

    this.sprites = null;
    this.shader = null;
};
