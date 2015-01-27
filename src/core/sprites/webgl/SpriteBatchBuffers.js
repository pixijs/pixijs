
/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's SpriteBatchBuffers:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/SpriteBatchBuffers.java
 */

/**
 *
 * @class
 * @private
 * @namespace PIXI
 * @param renderer {WebGLRenderer} The renderer this sprite batch works for.
 */
function SpriteBatchBuffers(gl, size )
{
    this.gl = gl;

    /**
     *
     *
     * @member {number}
     */
    this.vertSize = 2;

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
    this.size = size;

    // the total number of bytes in our batch
    var numVerts = this.size * 2 * this.vertByteSize;

    /**
     * Holds the vertices
     *
     * @member {ArrayBuffer}
     */
    this.vertices   = new Float32Array(numVerts);
    this.position   = new Float32Array(numVerts);
    this.rotation   = new Float32Array(numVerts/2);
    this.uvs        = new Float32Array(numVerts);
    this.alpha      = new Float32Array(numVerts/2);

    this.initBuffers();


}

SpriteBatchBuffers.prototype.constructor = SpriteBatchBuffers;
module.exports = SpriteBatchBuffers;

/**
 * Sets up the renderer context and necessary buffers.
 *
 * @private
 * @param gl {WebGLContext} the current WebGL drawing context
 */
SpriteBatchBuffers.prototype.initBuffers = function ()
{
    var gl = this.gl;

    // create a couple of buffers
    this.vertexBuffer   = gl.createBuffer();
    this.positionBuffer = gl.createBuffer();
    this.rotationBuffer = gl.createBuffer();
    this.uvsBuffer      = gl.createBuffer();
    this.alphaBuffer    = gl.createBuffer();

    // upload the buffers..
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.position, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.rotationBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.alphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.alpha, gl.DYNAMIC_DRAW);
};


SpriteBatchBuffers.prototype.refresh = function(children, startIndex, amount)
{
    this.uploadVerticies(children,startIndex, amount);
    this.uploadRotation(children,startIndex, amount);
    this.uploadUvs(children,startIndex, amount);
    this.uploadAlpha(children,startIndex, amount);

};

SpriteBatchBuffers.prototype.uploadVerticies = function (children,startIndex, amount)
{
    var vertices = this.vertices,
        index = 0,
        sprite,
        texture,
        trim,
        sx,
        sy,
        w0, w1, h0, h1;

    for (var i = 0; i < amount; i++) {

        sprite = children[startIndex + i];
        texture = sprite._texture;
        sx = sprite.scale.x;
        sy = sprite.scale.y;

        if (texture.trim)
        {
            // if the sprite is trimmed then we need to add the extra space before transforming the sprite coords..
            trim = texture.trim;

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

        vertices[index++] = w1 * sx;
        vertices[index++] = h1 * sy;

        vertices[index++] = w0 * sx;
        vertices[index++] = h1 * sy;

        vertices[index++] = w0 * sx;
        vertices[index++] = h0 * sy;

        vertices[index++] = w1 * sx;
        vertices[index++] = h0 * sy;
    }

    this.uploadToBuffer(this.vertexBuffer, this.vertices, 2 * 4, amount);
};

SpriteBatchBuffers.prototype.uploadPosition = function (children,startIndex, amount)
{
    var position = this.position,
        index = 0,
        spritePosition;

    for (var i = 0; i < amount; i++) {

        spritePosition = children[startIndex + i].position;

        position[index++] = spritePosition.x;
        position[index++] = spritePosition.y;

        position[index++] = spritePosition.x;
        position[index++] = spritePosition.y;

        position[index++] = spritePosition.x;
        position[index++] = spritePosition.y;

        position[index++] = spritePosition.x;
        position[index++] = spritePosition.y;
    }


    // upload the verts to the buffer
    this.uploadToBuffer(this.positionBuffer, this.position, 2 * 4, amount);
};

SpriteBatchBuffers.prototype.uploadRotation = function (children,startIndex, amount)
{
    var rotation = this.rotation,
        index = 0,
        spriteRotation;

    for (var i = 0; i < amount; i++) {

        spriteRotation = children[startIndex + i].rotation;

        rotation[index++] = spriteRotation;
        rotation[index++] = spriteRotation;
        rotation[index++] = spriteRotation;
        rotation[index++] = spriteRotation;
    }

    this.uploadToBuffer(this.rotationBuffer, this.rotation, 1 * 4, amount);
};

SpriteBatchBuffers.prototype.uploadUvs = function (children,startIndex, amount)
{
    var uvs = this.uvs,
        index = 0,
        textureUvs;

    for (var i = 0; i < amount; i++) {

        textureUvs = children[startIndex + i]._texture._uvs;

        if(textureUvs)
        {
            uvs[index++] = textureUvs.x0;
            uvs[index++] = textureUvs.y0;

            uvs[index++] = textureUvs.x1;
            uvs[index++] = textureUvs.y1;

            uvs[index++] = textureUvs.x2;
            uvs[index++] = textureUvs.y2;

            uvs[index++] = textureUvs.x3;
            uvs[index++] = textureUvs.y3;
        }
        else
        {
            index += 8;
        }
    }

    this.uploadToBuffer(this.uvsBuffer, this.uvs, 2 * 4, amount);
};

SpriteBatchBuffers.prototype.uploadAlpha = function (children,startIndex, amount)
{
    var alpha = this.alpha,
        index = 0,
        spriteAlpha;

    for (var i = 0; i < amount; i++) {

        spriteAlpha = children[startIndex + i].alpha;

        alpha[index++] = spriteAlpha;
        alpha[index++] = spriteAlpha;
        alpha[index++] = spriteAlpha;
        alpha[index++] = spriteAlpha;
    }


    this.uploadToBuffer(this.alphaBuffer, this.alpha, 1 * 4, amount);

};

SpriteBatchBuffers.prototype.uploadToBuffer = function (buffer, data, dataSize, amount)
{
    var gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    if (this.currentBatchSize > ( this.size * 0.5 ) )
    {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
    }
    else
    {
        var view = data.subarray(0,  amount * dataSize);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
    }
};

/**
 * Starts a new sprite batch.
 *
 */
SpriteBatchBuffers.prototype.bind = function (shader)
{
    var gl = this.gl;

    // this is the same for each shader?

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(shader.attributes.aPositionCoord, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.rotationBuffer);
    gl.vertexAttribPointer(shader.attributes.aRotation, 1, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer);
    gl.vertexAttribPointer(shader.attributes.aTextureCoord, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.alphaBuffer);
    gl.vertexAttribPointer(shader.attributes.aColor, 1, gl.FLOAT, false, 0, 0);

};

/**
 * Destroys the SpriteBatch.
 *
 */
SpriteBatchBuffers.prototype.destroy = function ()
{
    //TODO implement this :) to busy making the fun bits..
};
