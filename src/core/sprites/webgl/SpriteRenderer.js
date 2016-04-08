var ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    createIndicesForQuads = require('../../utils/createIndicesForQuads'),
    generateMultiTextureShader = require('./generateMultiTextureShader'),
    Buffer = require('./BatchBuffer'),
    CONST = require('../../const'),
    glCore = require('pixi-gl-core'),
    bitTwiddle = require('bit-twiddle');


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
    // var numVerts = this.size * 4 * this.vertByteSize;

    this.buffers = [];
    for (var i = 1; i <= bitTwiddle.nextPow2(this.size); i*=2) {
        var numVertsTemp = i * 4 * this.vertByteSize;
        this.buffers.push(new Buffer(numVertsTemp));
    }

    /**
     * Holds the indices of the geometry (quads) to draw
     *
     * @member {Uint16Array}
     */
    this.indices = createIndicesForQuads(this.size);

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

    for (var k = 0; k < this.size; k++)
    {
        this.groups[k] = {textures:[], textureCount:0, ids:[], size:0, start:0, blend:0};
    }

    this.sprites = [];

    this.vertexBuffers = [];
    this.vaos = [];

    this.vaoMax = 20;
    this.vertexCount = 0;
}


SpriteRenderer.prototype = Object.create(ObjectRenderer.prototype);
SpriteRenderer.prototype.constructor = SpriteRenderer;
module.exports = SpriteRenderer;

WebGLRenderer.registerPlugin('sprite', SpriteRenderer);

/**
 * Sets up the renderer context and necessary buffers.
 *
 * @private
 */
SpriteRenderer.prototype.onContextChange = function ()
{
    var gl = this.renderer.gl;


    this.MAX_TEXTURES = Math.min(gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), CONST.SPRITE_MAX_TEXTURES);

    this.shader = generateMultiTextureShader(gl, this.MAX_TEXTURES);
    // create a couple of buffers
    this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);



    for (var i = 0; i < this.vaoMax; i++) {
        this.vertexBuffers[i] = glCore.GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);
        // build the vao object that will render..
        this.vaos[i] = this.renderer.createVao()
        .addIndex(this.indexBuffer)
        .addAttribute(this.vertexBuffers[i], this.shader.attributes.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0)
        .addAttribute(this.vertexBuffers[i], this.shader.attributes.aTextureCoord, gl.UNSIGNED_SHORT, true, this.vertByteSize, 2 * 4)
        .addAttribute(this.vertexBuffers[i], this.shader.attributes.aColor, gl.UNSIGNED_BYTE, true, this.vertByteSize, 3 * 4)
        .addAttribute(this.vertexBuffers[i], this.shader.attributes.aTextureId, gl.FLOAT, false, this.vertByteSize, 4 * 4);
    }

    this.vao = this.vaos[0];
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
    if (this.currentIndex === 0) {
      return;
    }

    var gl = this.renderer.gl;

    var np2 = bitTwiddle.nextPow2(this.currentIndex);
    var log2 = bitTwiddle.log2(np2);
    var buffer = this.buffers[log2];

    var sprites = this.sprites;
    var groups = this.groups;

    var float32View = buffer.float32View;
    var uint32View = buffer.uint32View;

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
    var blendMode = sprites[0].blendMode;

    currentGroup.textureCount = 0;
    currentGroup.start = 0;
    currentGroup.blend = blendMode;

    this.tick++;

    for (var i = 0; i < this.currentIndex; i++)
    {
        // upload the sprite elemetns...
        // they have all ready been calculated so we just need to push them into the buffer.
        var sprite = sprites[i];

        nextTexture = sprite._texture.baseTexture;

        if(blendMode !== sprite.blendMode)
        {
            blendMode = sprite.blendMode;

            // force the batch to break!
            currentTexture = null;
            textureCount = this.MAX_TEXTURES;
            this.tick++;
        }

        if(currentTexture !== nextTexture)
        {
            currentTexture = nextTexture;

            if(nextTexture._enabled !== this.tick)
            {
                if(textureCount === this.MAX_TEXTURES)
                {
                    this.tick++;

                    textureCount = 0;

                    currentGroup.size = i - currentGroup.start;

                    currentGroup = groups[groupCount++];
                    currentGroup.textureCount = 0;
                    currentGroup.blend = blendMode;
                    currentGroup.start = i;
                }

                nextTexture._enabled = this.tick;
                nextTexture._id = textureCount;

                currentGroup.textures[currentGroup.textureCount++] = nextTexture;
                textureCount++;
            }

        }

        vertexData = sprite.vertexData;

        //TODO this sum does not need to be set each frame..
        tint = (sprite.tint >> 16) + (sprite.tint & 0xff00) + ((sprite.tint & 0xff) << 16) + (sprite.worldAlpha * 255 << 24);
        uvs = sprite._texture._uvs.uvs_uint32;
        textureId = nextTexture._id;

        //xy
        float32View[index++] = vertexData[0];
        float32View[index++] = vertexData[1];
        uint32View[index++] = uvs[0];
        uint32View[index++] = tint;
        float32View[index++] = textureId;

        // xy
        float32View[index++] = vertexData[2];
        float32View[index++] = vertexData[3];
        uint32View[index++] = uvs[1];
        uint32View[index++] = tint;
        float32View[index++] = textureId;

         // xy
        float32View[index++] = vertexData[4];
        float32View[index++] = vertexData[5];
        uint32View[index++] = uvs[2];
        uint32View[index++] = tint;
        float32View[index++] = textureId;

        // xy
        float32View[index++] = vertexData[6];
        float32View[index++] = vertexData[7];
        uint32View[index++] = uvs[3];
        uint32View[index++] = tint;
        float32View[index++] = textureId;
    }

    currentGroup.size = i - currentGroup.start;

    this.vertexCount++;
    this.vertexCount %= this.vaoMax;

    this.vertexBuffers[this.vertexCount].upload(buffer.vertices, 0);
    this.vao = this.vaos[this.vertexCount].bind();


    /// render the groups..
    for (i = 0; i < groupCount; i++) {

        var group = groups[i];

        for (var j = 0; j < group.textureCount; j++) {
            this.renderer.bindTexture(group.textures[j], j);
        }

        // set the blend mode..
        this.renderer.state.setBlendMode( group.blend );

        gl.drawElements(gl.TRIANGLES, group.size * 6, gl.UNSIGNED_SHORT, group.start * 6 * 2);
    }

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
    for (var i = 0; i < this.vaoMax; i++) {
        this.vertexBuffers[i].destroy();
        this.vaoMax[i].destroy();
    };

    this.indexBuffer.destroy();

    ObjectRenderer.prototype.destroy.call(this);

    this.shader.destroy();

    this.renderer = null;

    this.vertexBuffer = null;
    this.indexBuffer = null;

    this.sprites = null;
    this.shader = null;

    for (var i = 0; i < this.buffers.length; i++) {
      this.buffers[i].destroy();
    }

};
